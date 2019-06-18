import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Input,
  Inject,
  OnDestroy,
  Optional,
  SkipSelf,
  ViewContainerRef,
  NgZone,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  DragDrop,
  CdkDropList,
  CdkDropListGroup,
  DragDropRegistry,
  CdkDrag,
  CDK_DROP_LIST,
  DragRef, DropListRef,
  CDK_DRAG_CONFIG, DragRefConfig
} from '@angular/cdk/drag-drop';
import { ViewportRuler } from '@angular/cdk/scrolling';

import { PblNgridComponent, TablePlugin, PblNgridPluginController, PblNgridCellContext } from '@pebula/ngrid';
import { CdkLazyDropList, CdkLazyDrag } from '../core/lazy-drag-drop';
import { PblDropListRef } from '../core/drop-list-ref';
import { PblDragRef } from '../core/drag-ref';

declare module '@pebula/ngrid/lib/ext/types' {
  interface PblNgridPluginExtension {
    rowReorder?: PblNgridRowReorderPluginDirective;
  }
}

const PLUGIN_KEY: 'rowReorder' = 'rowReorder';

let _uniqueIdCounter = 0;

@TablePlugin({ id: PLUGIN_KEY })
@Directive({
  selector: 'pbl-ngrid[rowReorder]',
  exportAs: 'pblNgridRowReorder',
  inputs: [
    'directContainerElement:cdkDropListDirectContainerElement'
  ],
  host: { // tslint:disable-line:use-host-property-decorator
    'class': 'cdk-drop-list',
    '[id]': 'id',
    '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
    '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
    '[class.pbl-row-reorder]': 'rowReorder && !this.table.ds?.sort.sort?.order && !this.table.ds?.filter?.filter',
  },
  providers: [
    { provide: CdkDropListGroup, useValue: undefined },
    { provide: CDK_DROP_LIST, useExisting: PblNgridRowReorderPluginDirective },
  ],
})
export class PblNgridRowReorderPluginDirective<T = any> extends CdkDropList<T> implements OnDestroy, CdkLazyDropList<T> {

  id = `pbl-ngrid-row-reorder-list-${_uniqueIdCounter++}`;

  @Input() get rowReorder(): boolean { return this._rowReorder; };
  set rowReorder(value: boolean) {
    value = coerceBooleanProperty(value);
    this._rowReorder = value;
  }

  private _rowReorder = false;
  private _removePlugin: (table: PblNgridComponent<any>) => void;

  constructor(public table: PblNgridComponent<T>,
              pluginCtrl: PblNgridPluginController,
              element: ElementRef<HTMLElement>,
              dragDrop: DragDrop,
              changeDetectorRef: ChangeDetectorRef,
              @Optional() dir?: Directionality,
              @Optional() @SkipSelf() group?: CdkDropListGroup<CdkDropList>,) {
    super(element, dragDrop, changeDetectorRef, dir, group);
    this._removePlugin = pluginCtrl.setPlugin(PLUGIN_KEY, this);
    this.dropped.subscribe( event => {
      this.table.contextApi.clear();
      this.table.ds.moveItem(event.previousIndex, event.currentIndex);
      this.table._cdkTable.syncRows('data');
    });
  }

  /* CdkLazyDropList start */
  /**
   * Selector that will be used to determine the direct container element, starting from
   * the `cdkDropList` element and going down the DOM. Passing an alternate direct container element
   * is useful when the `cdkDropList` is not the direct parent (i.e. ancestor but not father)
   * of the draggable elements.
   */
  directContainerElement: string;
  get pblDropListRef(): PblDropListRef<any> { return this._dropListRef as any; }
  originalElement: ElementRef<HTMLElement>;
  _draggablesSet = new Set<CdkDrag>();
  ngOnInit(): void { CdkLazyDropList.prototype.ngOnInit.call(this); }
  addDrag(drag: CdkDrag): void { return CdkLazyDropList.prototype.addDrag.call(this, drag); }
  removeDrag(drag: CdkDrag): boolean { return CdkLazyDropList.prototype.removeDrag.call(this, drag); }
  beforeStarted(): void { CdkLazyDropList.prototype.beforeStarted.call(this); }
  /* CdkLazyDropList end */

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._removePlugin(this.table);
  }
}

@Directive({
  selector: '[pblNgridRowDrag]',
  exportAs: 'pblNgridRowDrag',
  host: { // tslint:disable-line:use-host-property-decorator
    'class': 'cdk-drag',
    '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
  },
  providers: [
    { provide: CdkDrag, useExisting: PblNgridRowDragDirective }
  ]
})
export class PblNgridRowDragDirective<T = any> extends CdkDrag<T> implements CdkLazyDrag<T, PblNgridRowReorderPluginDirective<T>> {
  rootElementSelector = 'pbl-ngrid-row';

  @Input('pblNgridRowDrag') set context(value: Pick<PblNgridCellContext<T>, 'col' | 'table'> & Partial<Pick<PblNgridCellContext<T>, 'row' | 'value'>>) {
    this._context = value;

    const pluginCtrl = this.pluginCtrl = value && PblNgridPluginController.find(value.table);
    const plugin = pluginCtrl && pluginCtrl.getPlugin(PLUGIN_KEY);
    this.cdkDropList = plugin || undefined;
  }

  private _context: Pick<PblNgridCellContext<T>, 'col' | 'table'> & Partial<Pick<PblNgridCellContext<T>, 'row' | 'value'>>
  private pluginCtrl: PblNgridPluginController;

  // CTOR IS REQUIRED OR IT WONT WORK IN AOT
  // TODO: Try to remove when supporting IVY
  constructor(element: ElementRef<HTMLElement>,
              @Inject(CDK_DROP_LIST) @SkipSelf() dropContainer: CdkDropList,
              @Inject(DOCUMENT) _document: any,
              _ngZone: NgZone,
              _viewContainerRef: ViewContainerRef,
              @Inject(CDK_DRAG_CONFIG) config: DragRefConfig,
              _dir: Directionality,
              dragDrop: DragDrop,
              _changeDetectorRef: ChangeDetectorRef,) {
    super(
      element,
      dropContainer,
      _document,
      _ngZone,
      _viewContainerRef,
      config,
      _dir,
      dragDrop,
      _changeDetectorRef,
    );
  }

  /* CdkLazyDrag start */
    /**
   * A class to set when the root element is not the host element. (i.e. when `cdkDragRootElement` is used).
   */
  @Input('cdkDragRootElementClass') set rootElementSelectorClass(value: string) { // tslint:disable-line:no-input-rename
    if (value !== this._rootClass && this._hostNotRoot) {
      if (this._rootClass) {
        this.getRootElement().classList.remove(...this._rootClass.split(' '));
      }
      if (value) {
        this.getRootElement().classList.add(...value.split(' '));
      }
    }
    this._rootClass = value;
  }

  get pblDragRef(): PblDragRef<any> { return this._dragRef as any; }

  @Input() get cdkDropList(): PblNgridRowReorderPluginDirective<T> { return this.dropContainer as PblNgridRowReorderPluginDirective<T>; }
  set cdkDropList(value: PblNgridRowReorderPluginDirective<T>) {
    // TO SUPPORT `cdkDropList` via string input (ID) we need a reactive registry...
    if (this.cdkDropList) {
      this.cdkDropList.removeDrag(this);
    }
    this.dropContainer = value;
    if (value) {
      this._dragRef._withDropContainer(value._dropListRef);
      value.addDrag(this);
    }
  }

  _rootClass: string;
  _hostNotRoot = false;
  ngOnInit(): void { CdkLazyDrag.prototype.ngOnInit.call(this); }
  ngAfterViewInit(): void { CdkLazyDrag.prototype.ngAfterViewInit.call(this); super.ngAfterViewInit(); }
  ngOnDestroy(): void { CdkLazyDrag.prototype.ngOnDestroy.call(this);  super.ngOnDestroy(); }
  /* CdkLazyDrag end */
}
