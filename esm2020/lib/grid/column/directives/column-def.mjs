// tslint:disable:use-host-property-decorator
// tslint:disable:directive-class-suffix
import { Directive, Input, Inject, Output, EventEmitter, } from '@angular/core';
import { CdkColumnDef } from '@angular/cdk/table';
import { uniqueColumnCss } from '../../utils/unique-column-css';
import { EXT_API_TOKEN } from '../../../ext/grid-ext-api';
import { isPblColumn } from '../model';
import { widthBreakout } from '../width-logic/dynamic-column-width';
import * as i0 from "@angular/core";
/**
 * Represents a runtime column definition for a user-defined column definitions.
 *
 * User defined column definitions are `PblColumn`, `PblMetaColumn`, `PblColumnGroup` etc...
 * They represent static column definitions and `PblNgridColumnDef` is the runtime instance of them.
 *
 */
export class PblNgridColumnDef extends CdkColumnDef {
    constructor(extApi) {
        super();
        this.extApi = extApi;
        this.isDragging = false;
        /**
         * An event emitted when width of this column has changed.
         */
        this.widthChange = new EventEmitter();
        /**
         * The complete width definition for the column.
         *
         * There are 2 width sets (tuple):
         * - [0]: The source width definitions as set in static column definition instance
         * - [1]: The absolute width definitions, as currently set in the DOM (getBoundingClientRect())
         *
         * Each set is made up of 3 primitive width definitions: MIN-WIDTH, WIDTH and MAX-WIDTH.
         * The tuple represents them in that order, i.e: [ MIN-WIDTH, WIDTH, MAX-WIDTH ]
         */
        this._widths = [];
        this.grid = extApi.grid;
        const { strategy } = extApi.widthCalc.dynamicColumnWidth;
        this.widthBreakout = c => widthBreakout(strategy, c);
    }
    get column() { return this._column; }
    ;
    set column(value) { this.attach(value); }
    /**
     * The absolute width definitions, as currently set in the DOM (getBoundingClientRect()).
     * If no measurements exists yet, return the user defined width's.
     *
     * The tuple represents them in that order, i.e: [ MIN-WIDTH, WIDTH, MAX-WIDTH ]
     */
    get widths() { return this._widths[1]; }
    /**
     * The last net width of the column.
     * The net width is the absolute width of the column, without padding, border etc...
     */
    get netWidth() { return this._netWidth; }
    /**
     * Update the "widths" for this column and when width has changed.
     *
     * The "widths" are the 3 values representing a width of a cell: [minWidth, width, maxWidth],
     * this method is given the width and will calculate the minWidth and maxWidth based on the column definitions.
     *
     * If at least one value of "widths" has changed, fires the `widthChange` event with the `reason` provided.
     *
     * The reason can be used to optionally update the relevant cells, based on the source (reason) of the update.
     * - attach: This runtime column definition instance was attached to a static column definition instance.
     * - update: The width value was updated in the static column definition instance , which triggered a width update to the runtime column definition instance
     * - resize: A resize event to the header PblColumn cell was triggered, the width of the static column definition is not updated, only the runtime value is.
     *
     * Note that this updates the width of the column-def instance, not the column definitions width itself.
     * Only when `reason === 'update'` it means that the column definition was updated and triggered this update
     *
     * @param width The new width
     * @param reason The reason for this change
     */
    updateWidth(width, reason) {
        const { isFixedWidth, parsedWidth } = this._column;
        /*  Setting the minimum width is based on the input.
            If the original width is pixel fixed we will take the maximum between it and the min width.
            If not, we will the take minWidth.
            If none of the above worked we will try to see if the current width is set with %, if so it will be our min width.
        */
        const minWidthPx = isFixedWidth
            ? Math.max(this._column.parsedWidth.value, this._column.minWidth || 0)
            : this._column.minWidth;
        let minWidth = minWidthPx && `${minWidthPx}px`;
        if (!minWidth && parsedWidth?.type === '%') {
            minWidth = width;
        }
        const maxWidth = isFixedWidth
            ? Math.min(this._column.parsedWidth.value, this._column.maxWidth || this._column.parsedWidth.value)
            : this._column.maxWidth;
        const newWidths = [minWidth || '', width, maxWidth ? `${maxWidth}px` : width];
        if (reason === 'resize') {
            this._widths[1] = newWidths;
            this.widthChange.emit({ reason });
        }
        else {
            const prev = this._widths[0] || [];
            this._widths[0] = newWidths;
            if (!this._widths[1]) {
                this._widths[1] = newWidths;
            }
            for (let i = 0; i < 3; i++) {
                if (prev[i] !== newWidths[i]) {
                    this.widthChange.emit({ reason });
                    break;
                }
            }
        }
    }
    /**
     * Apply the current absolute width definitions (minWidth, width, maxWidth) onto an element.
     */
    applyWidth(element) { setWidth(element, this.widths); }
    /**
     * Apply the source width definitions )set in static column definition instance) onto an element.
     */
    applySourceWidth(element) { setWidth(element, this._widths[0]); }
    /**
     * Query for cell elements related to this column definition.
     *
     * This query is not cached - cache in implementation.
     */
    queryCellElements(...filter) {
        const cssId = `.${uniqueColumnCss(this)}`;
        const query = [];
        if (filter.length === 0) {
            query.push(cssId);
        }
        else {
            for (const f of filter) {
                switch (f) {
                    case 'table':
                        query.push(`.pbl-ngrid-cell${cssId}`);
                        break;
                    case 'header':
                        query.push(`.pbl-ngrid-header-cell${cssId}:not(.pbl-header-group-cell)`);
                        break;
                    case 'headerGroup':
                        query.push(`.pbl-header-group-cell${cssId}`);
                        break;
                    case 'footer':
                        query.push(`.pbl-ngrid-footer-cell${cssId}:not(.pbl-footer-group-cell)`);
                        break;
                    case 'footerGroup':
                        query.push(`.pbl-footer-group-cell${cssId}`);
                        break;
                }
            }
        }
        // we query from the master table container and not CDKTable because of fixed meta rows
        return query.length === 0 ? [] : Array.from(this.extApi.element.querySelectorAll(query.join(', ')));
    }
    /** @internal */
    ngOnDestroy() {
        this.detach();
        this.widthChange.complete();
    }
    onResize() {
        if (isPblColumn(this.column)) {
            const prevNetWidth = this._netWidth;
            this._netWidth = this.widthBreakout(this.column.sizeInfo).content;
            if (prevNetWidth !== this._netWidth) {
                const width = `${this._netWidth}px`;
                this.updateWidth(width, 'resize');
            }
        }
    }
    updatePin(pin) {
        this.sticky = this.stickyEnd = false;
        switch (pin) {
            case 'start':
                this.sticky = true;
                break;
            case 'end':
                this.stickyEnd = true;
                break;
        }
        if (this.grid.isInit) {
            this.extApi.cdkTable.updateStickyColumnStyles();
        }
    }
    attach(column) {
        if (this._column !== column) {
            this.detach();
            if (column) {
                this._column = column;
                column.attach(this);
                this.name = column.id.replace(/ /g, '_');
                if (isPblColumn(column)) {
                    this.updatePin(column.pin);
                }
            }
        }
    }
    detach() {
        if (this._column) {
            const col = this._column;
            this._column = undefined;
            col.detach();
        }
    }
}
/** @nocollapse */ PblNgridColumnDef.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDef, deps: [{ token: EXT_API_TOKEN }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridColumnDef.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridColumnDef, selector: "[pblNgridColumnDef]", inputs: { column: ["pblNgridColumnDef", "column"] }, outputs: { widthChange: "pblNgridColumnDefWidthChange" }, providers: [
        { provide: CdkColumnDef, useExisting: PblNgridColumnDef },
        { provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: PblNgridColumnDef }
    ], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridColumnDef, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pblNgridColumnDef]',
                    providers: [
                        { provide: CdkColumnDef, useExisting: PblNgridColumnDef },
                        { provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: PblNgridColumnDef }
                    ],
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [EXT_API_TOKEN]
                }] }]; }, propDecorators: { column: [{
                type: Input,
                args: ['pblNgridColumnDef']
            }], widthChange: [{
                type: Output,
                args: ['pblNgridColumnDefWidthChange']
            }] } });
/**
 * Set the widths of an HTMLElement
 * @param el The element to set widths to
 * @param widths The widths, a tuple of 3 strings [ MIN-WIDTH, WIDTH, MAX-WIDTH ]
 */
function setWidth(el, widths) {
    el.style.minWidth = widths[0];
    el.style.width = widths[1];
    el.style.maxWidth = widths[2];
    // TODO(shlomiassaf)[perf, 4]: Instead of using a tuple for width, use a CSSStyleDeclaration object and just assign the props
    // This will avoid the additional check for %
    // We will need to implement it in all places that `_widths` is updated in `PblNgridColumnDef`
    // Another TODO is to cache the previous `boxSizing` in any case the column definition changes.
    // When the column does not have an explicit `minWidth` set and when the `width` is set explicitly to a % value
    // the logic in `PblNgridColumnDef.updateWidth` will set `minWidth` to the same value in `width`
    // This will cause an overflow unless we apply the border-box model
    if (widths[0] && widths[0].endsWith('%')) {
        el.style.boxSizing = 'border-box';
    }
    else {
        el.style.boxSizing = 'content-box';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLWRlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL2NvbHVtbi9kaXJlY3RpdmVzL2NvbHVtbi1kZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsNkNBQTZDO0FBQzdDLHdDQUF3QztBQUN4QyxPQUFPLEVBQ0wsU0FBUyxFQUNULEtBQUssRUFDTCxNQUFNLEVBRU4sTUFBTSxFQUNOLFlBQVksR0FDYixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFHbEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxhQUFhLEVBQWdDLE1BQU0sMkJBQTJCLENBQUM7QUFDeEYsT0FBTyxFQUE2QixXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHFDQUFxQyxDQUFDOztBQVVwRTs7Ozs7O0dBTUc7QUFRSCxNQUFNLE9BQU8saUJBQTZDLFNBQVEsWUFBWTtJQWlENUUsWUFBNkMsTUFBeUM7UUFDcEYsS0FBSyxFQUFFLENBQUM7UUFEbUMsV0FBTSxHQUFOLE1BQU0sQ0FBbUM7UUEvQnRGLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFJbkI7O1dBRUc7UUFDcUMsZ0JBQVcsR0FBRyxJQUFJLFlBQVksRUFBb0IsQ0FBQztRQUkzRjs7Ozs7Ozs7O1dBU0c7UUFDSyxZQUFPLEdBQTJCLEVBQUUsQ0FBQztRQVkzQyxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFFeEIsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7UUFDekQsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVB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LEVBQUUsV0FBVyxtQkFBbUIsRUFBRTtxQkFDMUU7aUJBQ0Y7OzBCQWtEYyxNQUFNOzJCQUFDLGFBQWE7NENBaERELE1BQU07c0JBQXJDLEtBQUs7dUJBQUMsbUJBQW1CO2dCQXdCYyxXQUFXO3NCQUFsRCxNQUFNO3VCQUFDLDhCQUE4Qjs7QUFvTXhDOzs7O0dBSUc7QUFDSCxTQUFTLFFBQVEsQ0FBQyxFQUFlLEVBQUUsTUFBZ0I7SUFDakQsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlCLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQixFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFOUIsNkhBQTZIO0lBQzdILDZDQUE2QztJQUM3Qyw4RkFBOEY7SUFDOUYsK0ZBQStGO0lBRS9GLCtHQUErRztJQUMvRyxnR0FBZ0c7SUFDaEcsbUVBQW1FO0lBQ25FLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDeEMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO0tBQ25DO1NBQU07UUFDTCxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxhQUFhLENBQUM7S0FDcEM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdHNsaW50OmRpc2FibGU6dXNlLWhvc3QtcHJvcGVydHktZGVjb3JhdG9yXG4vLyB0c2xpbnQ6ZGlzYWJsZTpkaXJlY3RpdmUtY2xhc3Mtc3VmZml4XG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIElucHV0LFxuICBJbmplY3QsXG4gIE9uRGVzdHJveSxcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ2RrQ29sdW1uRGVmIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RhYmxlJztcblxuaW1wb3J0IHsgX1BibE5ncmlkQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vdG9rZW5zJztcbmltcG9ydCB7IHVuaXF1ZUNvbHVtbkNzcyB9IGZyb20gJy4uLy4uL3V0aWxzL3VuaXF1ZS1jb2x1bW4tY3NzJztcbmltcG9ydCB7IEVYVF9BUElfVE9LRU4sIFBibE5ncmlkSW50ZXJuYWxFeHRlbnNpb25BcGkgfSBmcm9tICcuLi8uLi8uLi9leHQvZ3JpZC1leHQtYXBpJztcbmltcG9ydCB7IENPTFVNTiwgUGJsQ29sdW1uU2l6ZUluZm8sIGlzUGJsQ29sdW1uIH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHsgd2lkdGhCcmVha291dCB9IGZyb20gJy4uL3dpZHRoLWxvZ2ljL2R5bmFtaWMtY29sdW1uLXdpZHRoJztcblxuZXhwb3J0IHR5cGUgVXBkYXRlV2lkdGhSZWFzb24gPSAnYXR0YWNoJyB8ICd1cGRhdGUnIHwgJ3Jlc2l6ZSc7XG5cbmV4cG9ydCB0eXBlIFdpZHRoU2V0ID0gW3N0cmluZywgc3RyaW5nLCBzdHJpbmddO1xuXG5leHBvcnQgaW50ZXJmYWNlIFdpZHRoQ2hhbmdlRXZlbnQge1xuICByZWFzb246IFVwZGF0ZVdpZHRoUmVhc29uO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBydW50aW1lIGNvbHVtbiBkZWZpbml0aW9uIGZvciBhIHVzZXItZGVmaW5lZCBjb2x1bW4gZGVmaW5pdGlvbnMuXG4gKlxuICogVXNlciBkZWZpbmVkIGNvbHVtbiBkZWZpbml0aW9ucyBhcmUgYFBibENvbHVtbmAsIGBQYmxNZXRhQ29sdW1uYCwgYFBibENvbHVtbkdyb3VwYCBldGMuLi5cbiAqIFRoZXkgcmVwcmVzZW50IHN0YXRpYyBjb2x1bW4gZGVmaW5pdGlvbnMgYW5kIGBQYmxOZ3JpZENvbHVtbkRlZmAgaXMgdGhlIHJ1bnRpbWUgaW5zdGFuY2Ugb2YgdGhlbS5cbiAqXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1twYmxOZ3JpZENvbHVtbkRlZl0nLFxuICBwcm92aWRlcnM6IFtcbiAgICB7IHByb3ZpZGU6IENka0NvbHVtbkRlZiwgdXNlRXhpc3Rpbmc6IFBibE5ncmlkQ29sdW1uRGVmIH0sXG4gICAgeyBwcm92aWRlOiAnTUFUX1NPUlRfSEVBREVSX0NPTFVNTl9ERUYnLCB1c2VFeGlzdGluZzogUGJsTmdyaWRDb2x1bW5EZWYgfVxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBQYmxOZ3JpZENvbHVtbkRlZjxUIGV4dGVuZHMgQ09MVU1OID0gQ09MVU1OPiBleHRlbmRzIENka0NvbHVtbkRlZiBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgncGJsTmdyaWRDb2x1bW5EZWYnKSBnZXQgY29sdW1uKCk6IFQgeyByZXR1cm4gdGhpcy5fY29sdW1uOyB9O1xuICBzZXQgY29sdW1uKHZhbHVlOiBUKSB7IHRoaXMuYXR0YWNoKHZhbHVlKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgYWJzb2x1dGUgd2lkdGggZGVmaW5pdGlvbnMsIGFzIGN1cnJlbnRseSBzZXQgaW4gdGhlIERPTSAoZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpLlxuICAgKiBJZiBubyBtZWFzdXJlbWVudHMgZXhpc3RzIHlldCwgcmV0dXJuIHRoZSB1c2VyIGRlZmluZWQgd2lkdGgncy5cbiAgICpcbiAgICogVGhlIHR1cGxlIHJlcHJlc2VudHMgdGhlbSBpbiB0aGF0IG9yZGVyLCBpLmU6IFsgTUlOLVdJRFRILCBXSURUSCwgTUFYLVdJRFRIIF1cbiAgICovXG4gIGdldCB3aWR0aHMoKTogV2lkdGhTZXQgeyByZXR1cm4gdGhpcy5fd2lkdGhzWzFdOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBsYXN0IG5ldCB3aWR0aCBvZiB0aGUgY29sdW1uLlxuICAgKiBUaGUgbmV0IHdpZHRoIGlzIHRoZSBhYnNvbHV0ZSB3aWR0aCBvZiB0aGUgY29sdW1uLCB3aXRob3V0IHBhZGRpbmcsIGJvcmRlciBldGMuLi5cbiAgICovXG4gIGdldCBuZXRXaWR0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbmV0V2lkdGg7IH1cblxuICBpc0RyYWdnaW5nID0gZmFsc2U7XG5cbiAgcmVhZG9ubHkgZ3JpZDogX1BibE5ncmlkQ29tcG9uZW50PGFueT47XG5cbiAgLyoqXG4gICAqIEFuIGV2ZW50IGVtaXR0ZWQgd2hlbiB3aWR0aCBvZiB0aGlzIGNvbHVtbiBoYXMgY2hhbmdlZC5cbiAgICovXG4gIEBPdXRwdXQoJ3BibE5ncmlkQ29sdW1uRGVmV2lkdGhDaGFuZ2UnKSB3aWR0aENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8V2lkdGhDaGFuZ2VFdmVudD4oKTtcblxuICBwcml2YXRlIF9jb2x1bW46IFQ7XG5cbiAgLyoqXG4gICAqIFRoZSBjb21wbGV0ZSB3aWR0aCBkZWZpbml0aW9uIGZvciB0aGUgY29sdW1uLlxuICAgKlxuICAgKiBUaGVyZSBhcmUgMiB3aWR0aCBzZXRzICh0dXBsZSk6XG4gICAqIC0gWzBdOiBUaGUgc291cmNlIHdpZHRoIGRlZmluaXRpb25zIGFzIHNldCBpbiBzdGF0aWMgY29sdW1uIGRlZmluaXRpb24gaW5zdGFuY2VcbiAgICogLSBbMV06IFRoZSBhYnNvbHV0ZSB3aWR0aCBkZWZpbml0aW9ucywgYXMgY3VycmVudGx5IHNldCBpbiB0aGUgRE9NIChnZXRCb3VuZGluZ0NsaWVudFJlY3QoKSlcbiAgICpcbiAgICogRWFjaCBzZXQgaXMgbWFkZSB1cCBvZiAzIHByaW1pdGl2ZSB3aWR0aCBkZWZpbml0aW9uczogTUlOLVdJRFRILCBXSURUSCBhbmQgTUFYLVdJRFRILlxuICAgKiBUaGUgdHVwbGUgcmVwcmVzZW50cyB0aGVtIGluIHRoYXQgb3JkZXIsIGkuZTogWyBNSU4tV0lEVEgsIFdJRFRILCBNQVgtV0lEVEggXVxuICAgKi9cbiAgcHJpdmF0ZSBfd2lkdGhzOiBbV2lkdGhTZXQ/LCBXaWR0aFNldD9dID0gW107XG5cbiAgLyoqXG4gICAqIFRoZSBsYXN0IG5ldCB3aWR0aCBvZiB0aGUgY29sdW1uLlxuICAgKiBUaGUgbmV0IHdpZHRoIGlzIHRoZSBhYnNvbHV0ZSB3aWR0aCBvZiB0aGUgY29sdW1uLCB3aXRob3V0IHBhZGRpbmcsIGJvcmRlciBldGMuLi5cbiAgICovXG4gIHByaXZhdGUgX25ldFdpZHRoOiBudW1iZXI7XG5cbiAgcHJpdmF0ZSB3aWR0aEJyZWFrb3V0OiAoY29sdW1uSW5mbzogUGJsQ29sdW1uU2l6ZUluZm8pID0+IFJldHVyblR5cGU8dHlwZW9mIHdpZHRoQnJlYWtvdXQ+O1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRVhUX0FQSV9UT0tFTikgcHJvdGVjdGVkIGV4dEFwaTogUGJsTmdyaWRJbnRlcm5hbEV4dGVuc2lvbkFwaTxhbnk+KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmdyaWQgPSBleHRBcGkuZ3JpZDtcblxuICAgIGNvbnN0IHsgc3RyYXRlZ3kgfSA9IGV4dEFwaS53aWR0aENhbGMuZHluYW1pY0NvbHVtbldpZHRoO1xuICAgIHRoaXMud2lkdGhCcmVha291dCA9IGMgPT4gd2lkdGhCcmVha291dChzdHJhdGVneSwgYyk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBcIndpZHRoc1wiIGZvciB0aGlzIGNvbHVtbiBhbmQgd2hlbiB3aWR0aCBoYXMgY2hhbmdlZC5cbiAgICpcbiAgICogVGhlIFwid2lkdGhzXCIgYXJlIHRoZSAzIHZhbHVlcyByZXByZXNlbnRpbmcgYSB3aWR0aCBvZiBhIGNlbGw6IFttaW5XaWR0aCwgd2lkdGgsIG1heFdpZHRoXSxcbiAgICogdGhpcyBtZXRob2QgaXMgZ2l2ZW4gdGhlIHdpZHRoIGFuZCB3aWxsIGNhbGN1bGF0ZSB0aGUgbWluV2lkdGggYW5kIG1heFdpZHRoIGJhc2VkIG9uIHRoZSBjb2x1bW4gZGVmaW5pdGlvbnMuXG4gICAqXG4gICAqIElmIGF0IGxlYXN0IG9uZSB2YWx1ZSBvZiBcIndpZHRoc1wiIGhhcyBjaGFuZ2VkLCBmaXJlcyB0aGUgYHdpZHRoQ2hhbmdlYCBldmVudCB3aXRoIHRoZSBgcmVhc29uYCBwcm92aWRlZC5cbiAgICpcbiAgICogVGhlIHJlYXNvbiBjYW4gYmUgdXNlZCB0byBvcHRpb25hbGx5IHVwZGF0ZSB0aGUgcmVsZXZhbnQgY2VsbHMsIGJhc2VkIG9uIHRoZSBzb3VyY2UgKHJlYXNvbikgb2YgdGhlIHVwZGF0ZS5cbiAgICogLSBhdHRhY2g6IFRoaXMgcnVudGltZSBjb2x1bW4gZGVmaW5pdGlvbiBpbnN0YW5jZSB3YXMgYXR0YWNoZWQgdG8gYSBzdGF0aWMgY29sdW1uIGRlZmluaXRpb24gaW5zdGFuY2UuXG4gICAqIC0gdXBkYXRlOiBUaGUgd2lkdGggdmFsdWUgd2FzIHVwZGF0ZWQgaW4gdGhlIHN0YXRpYyBjb2x1bW4gZGVmaW5pdGlvbiBpbnN0YW5jZSAsIHdoaWNoIHRyaWdnZXJlZCBhIHdpZHRoIHVwZGF0ZSB0byB0aGUgcnVudGltZSBjb2x1bW4gZGVmaW5pdGlvbiBpbnN0YW5jZVxuICAgKiAtIHJlc2l6ZTogQSByZXNpemUgZXZlbnQgdG8gdGhlIGhlYWRlciBQYmxDb2x1bW4gY2VsbCB3YXMgdHJpZ2dlcmVkLCB0aGUgd2lkdGggb2YgdGhlIHN0YXRpYyBjb2x1bW4gZGVmaW5pdGlvbiBpcyBub3QgdXBkYXRlZCwgb25seSB0aGUgcnVudGltZSB2YWx1ZSBpcy5cbiAgICpcbiAgICogTm90ZSB0aGF0IHRoaXMgdXBkYXRlcyB0aGUgd2lkdGggb2YgdGhlIGNvbHVtbi1kZWYgaW5zdGFuY2UsIG5vdCB0aGUgY29sdW1uIGRlZmluaXRpb25zIHdpZHRoIGl0c2VsZi5cbiAgICogT25seSB3aGVuIGByZWFzb24gPT09ICd1cGRhdGUnYCBpdCBtZWFucyB0aGF0IHRoZSBjb2x1bW4gZGVmaW5pdGlvbiB3YXMgdXBkYXRlZCBhbmQgdHJpZ2dlcmVkIHRoaXMgdXBkYXRlXG4gICAqXG4gICAqIEBwYXJhbSB3aWR0aCBUaGUgbmV3IHdpZHRoXG4gICAqIEBwYXJhbSByZWFzb24gVGhlIHJlYXNvbiBmb3IgdGhpcyBjaGFuZ2VcbiAgICovXG4gIHVwZGF0ZVdpZHRoKHdpZHRoOiBzdHJpbmcsIHJlYXNvbjogVXBkYXRlV2lkdGhSZWFzb24pOiB2b2lkIHtcbiAgICBjb25zdCB7IGlzRml4ZWRXaWR0aCwgcGFyc2VkV2lkdGggfSA9IHRoaXMuX2NvbHVtbjtcblxuICAgIC8qICBTZXR0aW5nIHRoZSBtaW5pbXVtIHdpZHRoIGlzIGJhc2VkIG9uIHRoZSBpbnB1dC5cbiAgICAgICAgSWYgdGhlIG9yaWdpbmFsIHdpZHRoIGlzIHBpeGVsIGZpeGVkIHdlIHdpbGwgdGFrZSB0aGUgbWF4aW11bSBiZXR3ZWVuIGl0IGFuZCB0aGUgbWluIHdpZHRoLlxuICAgICAgICBJZiBub3QsIHdlIHdpbGwgdGhlIHRha2UgbWluV2lkdGguXG4gICAgICAgIElmIG5vbmUgb2YgdGhlIGFib3ZlIHdvcmtlZCB3ZSB3aWxsIHRyeSB0byBzZWUgaWYgdGhlIGN1cnJlbnQgd2lkdGggaXMgc2V0IHdpdGggJSwgaWYgc28gaXQgd2lsbCBiZSBvdXIgbWluIHdpZHRoLlxuICAgICovXG4gICAgY29uc3QgbWluV2lkdGhQeCA9IGlzRml4ZWRXaWR0aFxuICAgICAgPyBNYXRoLm1heCh0aGlzLl9jb2x1bW4ucGFyc2VkV2lkdGgudmFsdWUsIHRoaXMuX2NvbHVtbi5taW5XaWR0aCB8fCAwKVxuICAgICAgOiB0aGlzLl9jb2x1bW4ubWluV2lkdGhcbiAgICA7XG5cbiAgICBsZXQgbWluV2lkdGggPSBtaW5XaWR0aFB4ICYmIGAke21pbldpZHRoUHh9cHhgO1xuICAgIGlmICghbWluV2lkdGggJiYgcGFyc2VkV2lkdGg/LnR5cGUgPT09ICclJykge1xuICAgICAgbWluV2lkdGggPSB3aWR0aDtcbiAgICB9XG5cbiAgICBjb25zdCBtYXhXaWR0aCA9IGlzRml4ZWRXaWR0aFxuICAgICAgPyBNYXRoLm1pbih0aGlzLl9jb2x1bW4ucGFyc2VkV2lkdGgudmFsdWUsIHRoaXMuX2NvbHVtbi5tYXhXaWR0aCB8fCB0aGlzLl9jb2x1bW4ucGFyc2VkV2lkdGgudmFsdWUpXG4gICAgICA6IHRoaXMuX2NvbHVtbi5tYXhXaWR0aFxuICAgIDtcblxuICAgIGNvbnN0IG5ld1dpZHRocyA9IFttaW5XaWR0aCB8fCAnJywgIHdpZHRoLCBtYXhXaWR0aCA/IGAke21heFdpZHRofXB4YCA6IHdpZHRoXSBhcyBXaWR0aFNldDtcbiAgICBpZiAocmVhc29uID09PSAncmVzaXplJykge1xuICAgICAgdGhpcy5fd2lkdGhzWzFdID0gbmV3V2lkdGhzO1xuICAgICAgdGhpcy53aWR0aENoYW5nZS5lbWl0KHsgcmVhc29uIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwcmV2ID0gdGhpcy5fd2lkdGhzWzBdIHx8IFtdO1xuICAgICAgdGhpcy5fd2lkdGhzWzBdID0gbmV3V2lkdGhzO1xuICAgICAgaWYgKCF0aGlzLl93aWR0aHNbMV0pIHtcbiAgICAgICAgdGhpcy5fd2lkdGhzWzFdID0gbmV3V2lkdGhzO1xuICAgICAgfVxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgaWYgKHByZXZbaV0gIT09IG5ld1dpZHRoc1tpXSkge1xuICAgICAgICAgIHRoaXMud2lkdGhDaGFuZ2UuZW1pdCh7IHJlYXNvbiB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSB0aGUgY3VycmVudCBhYnNvbHV0ZSB3aWR0aCBkZWZpbml0aW9ucyAobWluV2lkdGgsIHdpZHRoLCBtYXhXaWR0aCkgb250byBhbiBlbGVtZW50LlxuICAgKi9cbiAgYXBwbHlXaWR0aChlbGVtZW50OiBIVE1MRWxlbWVudCk6IHZvaWQgeyBzZXRXaWR0aChlbGVtZW50LCB0aGlzLndpZHRocyk7IH1cblxuICAvKipcbiAgICogQXBwbHkgdGhlIHNvdXJjZSB3aWR0aCBkZWZpbml0aW9ucyApc2V0IGluIHN0YXRpYyBjb2x1bW4gZGVmaW5pdGlvbiBpbnN0YW5jZSkgb250byBhbiBlbGVtZW50LlxuICAgKi9cbiAgYXBwbHlTb3VyY2VXaWR0aChlbGVtZW50OiBIVE1MRWxlbWVudCk6IHZvaWQgeyBzZXRXaWR0aChlbGVtZW50LCB0aGlzLl93aWR0aHNbMF0pOyB9XG5cbiAgLyoqXG4gICAqIFF1ZXJ5IGZvciBjZWxsIGVsZW1lbnRzIHJlbGF0ZWQgdG8gdGhpcyBjb2x1bW4gZGVmaW5pdGlvbi5cbiAgICpcbiAgICogVGhpcyBxdWVyeSBpcyBub3QgY2FjaGVkIC0gY2FjaGUgaW4gaW1wbGVtZW50YXRpb24uXG4gICAqL1xuICBxdWVyeUNlbGxFbGVtZW50cyguLi5maWx0ZXI6IEFycmF5PCd0YWJsZScgfCAnaGVhZGVyJyB8ICdoZWFkZXJHcm91cCcgfCAnZm9vdGVyJyB8ICdmb290ZXJHcm91cCc+KTogSFRNTEVsZW1lbnRbXSB7XG4gICAgY29uc3QgY3NzSWQgPSBgLiR7dW5pcXVlQ29sdW1uQ3NzKHRoaXMpfWA7XG5cbiAgICBjb25zdCBxdWVyeTogc3RyaW5nW10gPSBbXTtcblxuICAgIGlmIChmaWx0ZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICBxdWVyeS5wdXNoKGNzc0lkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChjb25zdCBmIG9mIGZpbHRlcikge1xuICAgICAgICBzd2l0Y2ggKGYpIHtcbiAgICAgICAgICBjYXNlICd0YWJsZSc6XG4gICAgICAgICAgIHF1ZXJ5LnB1c2goYC5wYmwtbmdyaWQtY2VsbCR7Y3NzSWR9YCk7XG4gICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2hlYWRlcic6XG4gICAgICAgICAgIHF1ZXJ5LnB1c2goYC5wYmwtbmdyaWQtaGVhZGVyLWNlbGwke2Nzc0lkfTpub3QoLnBibC1oZWFkZXItZ3JvdXAtY2VsbClgKTtcbiAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnaGVhZGVyR3JvdXAnOlxuICAgICAgICAgICBxdWVyeS5wdXNoKGAucGJsLWhlYWRlci1ncm91cC1jZWxsJHtjc3NJZH1gKTtcbiAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZm9vdGVyJzpcbiAgICAgICAgICAgcXVlcnkucHVzaChgLnBibC1uZ3JpZC1mb290ZXItY2VsbCR7Y3NzSWR9Om5vdCgucGJsLWZvb3Rlci1ncm91cC1jZWxsKWApO1xuICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdmb290ZXJHcm91cCc6XG4gICAgICAgICAgIHF1ZXJ5LnB1c2goYC5wYmwtZm9vdGVyLWdyb3VwLWNlbGwke2Nzc0lkfWApO1xuICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyB3ZSBxdWVyeSBmcm9tIHRoZSBtYXN0ZXIgdGFibGUgY29udGFpbmVyIGFuZCBub3QgQ0RLVGFibGUgYmVjYXVzZSBvZiBmaXhlZCBtZXRhIHJvd3NcbiAgICByZXR1cm4gcXVlcnkubGVuZ3RoID09PSAwID8gW10gOiBBcnJheS5mcm9tKHRoaXMuZXh0QXBpLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChxdWVyeS5qb2luKCcsICcpKSkgYXMgYW55O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRldGFjaCgpO1xuICAgIHRoaXMud2lkdGhDaGFuZ2UuY29tcGxldGUoKTtcbiAgfVxuXG4gIG9uUmVzaXplKCk6IHZvaWQge1xuICAgIGlmIChpc1BibENvbHVtbih0aGlzLmNvbHVtbikpIHtcbiAgICAgIGNvbnN0IHByZXZOZXRXaWR0aCA9IHRoaXMuX25ldFdpZHRoO1xuICAgICAgdGhpcy5fbmV0V2lkdGggPSB0aGlzLndpZHRoQnJlYWtvdXQodGhpcy5jb2x1bW4uc2l6ZUluZm8pLmNvbnRlbnQ7XG5cbiAgICAgIGlmIChwcmV2TmV0V2lkdGggIT09IHRoaXMuX25ldFdpZHRoKSB7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gYCR7dGhpcy5fbmV0V2lkdGh9cHhgO1xuICAgICAgICB0aGlzLnVwZGF0ZVdpZHRoKHdpZHRoLCAncmVzaXplJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlUGluKHBpbj86ICdzdGFydCcgfCAnZW5kJyk6IHZvaWQge1xuICAgIHRoaXMuc3RpY2t5ID0gdGhpcy5zdGlja3lFbmQgPSBmYWxzZTtcbiAgICBzd2l0Y2gocGluKSB7XG4gICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgIHRoaXMuc3RpY2t5ID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdlbmQnOlxuICAgICAgICB0aGlzLnN0aWNreUVuZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAodGhpcy5ncmlkLmlzSW5pdCkge1xuICAgICAgdGhpcy5leHRBcGkuY2RrVGFibGUudXBkYXRlU3RpY2t5Q29sdW1uU3R5bGVzKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhdHRhY2goY29sdW1uOiBUKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbHVtbiAhPT0gY29sdW1uKSB7XG4gICAgICB0aGlzLmRldGFjaCgpO1xuICAgICAgaWYgKGNvbHVtbikge1xuICAgICAgICB0aGlzLl9jb2x1bW4gPSBjb2x1bW47XG4gICAgICAgIChjb2x1bW4gYXMgYW55KS5hdHRhY2godGhpcyk7XG4gICAgICAgIHRoaXMubmFtZSA9IGNvbHVtbi5pZC5yZXBsYWNlKC8gL2csICdfJyk7XG4gICAgICAgIGlmIChpc1BibENvbHVtbihjb2x1bW4pKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGVQaW4oY29sdW1uLnBpbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGRldGFjaCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29sdW1uKSB7XG4gICAgICBjb25zdCBjb2wgPSB0aGlzLl9jb2x1bW47XG4gICAgICB0aGlzLl9jb2x1bW4gPSB1bmRlZmluZWQ7XG4gICAgICBjb2wuZGV0YWNoKCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogU2V0IHRoZSB3aWR0aHMgb2YgYW4gSFRNTEVsZW1lbnRcbiAqIEBwYXJhbSBlbCBUaGUgZWxlbWVudCB0byBzZXQgd2lkdGhzIHRvXG4gKiBAcGFyYW0gd2lkdGhzIFRoZSB3aWR0aHMsIGEgdHVwbGUgb2YgMyBzdHJpbmdzIFsgTUlOLVdJRFRILCBXSURUSCwgTUFYLVdJRFRIIF1cbiAqL1xuZnVuY3Rpb24gc2V0V2lkdGgoZWw6IEhUTUxFbGVtZW50LCB3aWR0aHM6IFdpZHRoU2V0KSB7XG4gIGVsLnN0eWxlLm1pbldpZHRoID0gd2lkdGhzWzBdO1xuICBlbC5zdHlsZS53aWR0aCA9IHdpZHRoc1sxXTtcbiAgZWwuc3R5bGUubWF4V2lkdGggPSB3aWR0aHNbMl07XG5cbiAgLy8gVE9ETyhzaGxvbWlhc3NhZilbcGVyZiwgNF06IEluc3RlYWQgb2YgdXNpbmcgYSB0dXBsZSBmb3Igd2lkdGgsIHVzZSBhIENTU1N0eWxlRGVjbGFyYXRpb24gb2JqZWN0IGFuZCBqdXN0IGFzc2lnbiB0aGUgcHJvcHNcbiAgLy8gVGhpcyB3aWxsIGF2b2lkIHRoZSBhZGRpdGlvbmFsIGNoZWNrIGZvciAlXG4gIC8vIFdlIHdpbGwgbmVlZCB0byBpbXBsZW1lbnQgaXQgaW4gYWxsIHBsYWNlcyB0aGF0IGBfd2lkdGhzYCBpcyB1cGRhdGVkIGluIGBQYmxOZ3JpZENvbHVtbkRlZmBcbiAgLy8gQW5vdGhlciBUT0RPIGlzIHRvIGNhY2hlIHRoZSBwcmV2aW91cyBgYm94U2l6aW5nYCBpbiBhbnkgY2FzZSB0aGUgY29sdW1uIGRlZmluaXRpb24gY2hhbmdlcy5cblxuICAvLyBXaGVuIHRoZSBjb2x1bW4gZG9lcyBub3QgaGF2ZSBhbiBleHBsaWNpdCBgbWluV2lkdGhgIHNldCBhbmQgd2hlbiB0aGUgYHdpZHRoYCBpcyBzZXQgZXhwbGljaXRseSB0byBhICUgdmFsdWVcbiAgLy8gdGhlIGxvZ2ljIGluIGBQYmxOZ3JpZENvbHVtbkRlZi51cGRhdGVXaWR0aGAgd2lsbCBzZXQgYG1pbldpZHRoYCB0byB0aGUgc2FtZSB2YWx1ZSBpbiBgd2lkdGhgXG4gIC8vIFRoaXMgd2lsbCBjYXVzZSBhbiBvdmVyZmxvdyB1bmxlc3Mgd2UgYXBwbHkgdGhlIGJvcmRlci1ib3ggbW9kZWxcbiAgaWYgKHdpZHRoc1swXSAmJiB3aWR0aHNbMF0uZW5kc1dpdGgoJyUnKSkge1xuICAgIGVsLnN0eWxlLmJveFNpemluZyA9ICdib3JkZXItYm94JztcbiAgfSBlbHNlIHtcbiAgICBlbC5zdHlsZS5ib3hTaXppbmcgPSAnY29udGVudC1ib3gnO1xuICB9XG59XG4iXX0=