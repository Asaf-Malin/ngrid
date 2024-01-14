import { take } from 'rxjs/operators';
import { Input, Directive } from '@angular/core';
import { DragDrop, CdkDrag } from '@angular/cdk/drag-drop';
import { PblDragRef } from './drag-ref';
import { PblDragDrop } from './drag-drop';
import * as i0 from "@angular/core";
export class CdkLazyDrag extends CdkDrag {
    constructor() {
        super(...arguments);
        this._hostNotRoot = false;
    }
    /**
     * A class to set when the root element is not the host element. (i.e. when `cdkDragRootElement` is used).
     */
    set rootElementSelectorClass(value) {
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
    get pblDragRef() { return this._dragRef; }
    get cdkDropList() { return this.dropContainer; }
    set cdkDropList(dropList) {
        // TO SUPPORT `cdkDropList` via string input (ID) we need a reactive registry...
        const prev = this.cdkDropList;
        if (dropList !== prev) {
            if (prev) {
                prev.removeDrag(this);
            }
            this.dropContainer = dropList;
            if (dropList) {
                this._dragRef._withDropContainer(dropList.pblDropListRef);
                this._dragRef.beforeStarted.subscribe(() => {
                    if (dropList.dir) {
                        this._dragRef.withDirection(dropList.dir);
                    }
                });
                dropList.addDrag(this);
            }
            this.dropContainerChanged(prev);
        }
    }
    ngOnInit() {
        if (!(this.pblDragRef instanceof PblDragRef)) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw new Error('Invalid `DragRef` injection, the ref is not an instance of PblDragRef');
            }
            return;
        }
        this.pblDragRef.rootElementChanged.subscribe(event => {
            const rootElementSelectorClass = this._rootClass;
            const hostNotRoot = this.element.nativeElement !== event.curr;
            if (rootElementSelectorClass) {
                if (this._hostNotRoot) {
                    event.prev.classList.remove(...rootElementSelectorClass.split(' '));
                }
                if (hostNotRoot) {
                    event.curr.classList.add(...rootElementSelectorClass.split(' '));
                }
            }
            this._hostNotRoot = hostNotRoot;
        });
    }
    // This is a workaround for https://github.com/angular/material2/pull/14158
    // Working around the issue of drop container is not the direct parent (father) of a drag item.
    // The entire ngAfterViewInit() overriding method can be removed if PR accepted.
    ngAfterViewInit() {
        this.started.subscribe(startedEvent => {
            if (this.dropContainer) {
                const element = this.getRootElement();
                const initialRootElementParent = element.parentNode;
                if (!element.nextSibling && initialRootElementParent !== this.dropContainer.element.nativeElement) {
                    this.ended.pipe(take(1)).subscribe(endedEvent => initialRootElementParent.appendChild(element));
                }
            }
        });
        super.ngAfterViewInit();
    }
    ngOnDestroy() {
        this.cdkDropList?.removeDrag(this);
        super.ngOnDestroy();
    }
    dropContainerChanged(prev) { }
}
/** @nocollapse */ CdkLazyDrag.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: CdkLazyDrag, deps: null, target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ CdkLazyDrag.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: CdkLazyDrag, selector: "[cdkLazyDrag]", inputs: { rootElementSelectorClass: ["cdkDragRootElementClass", "rootElementSelectorClass"], cdkDropList: "cdkDropList" }, host: { properties: { "class.cdk-drag-dragging": "_dragRef.isDragging()" }, classAttribute: "cdk-drag" }, providers: [
        { provide: DragDrop, useExisting: PblDragDrop },
    ], exportAs: ["cdkLazyDrag"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: CdkLazyDrag, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkLazyDrag]',
                    exportAs: 'cdkLazyDrag',
                    host: {
                        'class': 'cdk-drag',
                        '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
                    },
                    providers: [
                        { provide: DragDrop, useExisting: PblDragDrop },
                    ],
                }]
        }], propDecorators: { rootElementSelectorClass: [{
                type: Input,
                args: ['cdkDragRootElementClass']
            }], cdkDropList: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvZHJhZy9zcmMvbGliL2RyYWctYW5kLWRyb3AvY29yZS9kcmFnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN0QyxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBb0MsTUFBTSxlQUFlLENBQUM7QUFDbkYsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUUzRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxhQUFhLENBQUM7O0FBYzFDLE1BQU0sT0FBTyxXQUFvRixTQUFRLE9BQVU7SUFYbkg7O1FBcURVLGlCQUFZLEdBQUcsS0FBSyxDQUFDO0tBK0M5QjtJQXZGQzs7T0FFRztJQUNILElBQXNDLHdCQUF3QixDQUFDLEtBQWE7UUFDMUUsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2xELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ3ZFO1lBQ0QsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDMUQ7U0FDRjtRQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFRCxJQUFJLFVBQVUsS0FBdUIs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QUFDLE9BQU8sQ0FBQyxDQUFFLENBQUM7aUJBQ25HO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRVMsb0JBQW9CLENBQUMsSUFBTyxJQUFJLENBQUM7OzJIQXhGaEMsV0FBVzsrR0FBWCxXQUFXLDZRQUpYO1FBQ1QsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUU7S0FDaEQ7MkZBRVUsV0FBVztrQkFYdkIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsZUFBZTtvQkFDekIsUUFBUSxFQUFFLGFBQWE7b0JBQ3ZCLElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUsVUFBVTt3QkFDbkIsMkJBQTJCLEVBQUUsdUJBQXVCO3FCQUNyRDtvQkFDRCxTQUFTLEVBQUU7d0JBQ1QsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUU7cUJBQ2hEO2lCQUNGOzhCQU11Qyx3QkFBd0I7c0JBQTdELEtBQUs7dUJBQUMseUJBQXlCO2dCQWNuQixXQUFXO3NCQUF2QixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdGFrZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IElucHV0LCBEaXJlY3RpdmUsIE9uRGVzdHJveSwgQWZ0ZXJWaWV3SW5pdCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEcmFnRHJvcCwgQ2RrRHJhZyB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9kcmFnLWRyb3AnO1xuXG5pbXBvcnQgeyBQYmxEcmFnUmVmIH0gZnJvbSAnLi9kcmFnLXJlZic7XG5pbXBvcnQgeyBQYmxEcmFnRHJvcCB9IGZyb20gJy4vZHJhZy1kcm9wJztcbmltcG9ydCB7IENka0xhenlEcm9wTGlzdCB9IGZyb20gJy4vZHJvcC1saXN0JztcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0xhenlEcmFnXScsIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6IGRpcmVjdGl2ZS1zZWxlY3RvclxuICBleHBvcnRBczogJ2Nka0xhenlEcmFnJyxcbiAgaG9zdDogeyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWhvc3QtbWV0YWRhdGEtcHJvcGVydHlcbiAgICAnY2xhc3MnOiAnY2RrLWRyYWcnLFxuICAgICdbY2xhc3MuY2RrLWRyYWctZHJhZ2dpbmddJzogJ19kcmFnUmVmLmlzRHJhZ2dpbmcoKScsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHsgcHJvdmlkZTogRHJhZ0Ryb3AsIHVzZUV4aXN0aW5nOiBQYmxEcmFnRHJvcCB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtMYXp5RHJhZzxUID0gYW55LCBaIGV4dGVuZHMgQ2RrTGF6eURyb3BMaXN0PFQ+ID0gQ2RrTGF6eURyb3BMaXN0PFQ+LCBEUmVmID0gYW55PiBleHRlbmRzIENka0RyYWc8VD4gaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG5cbiAgLyoqXG4gICAqIEEgY2xhc3MgdG8gc2V0IHdoZW4gdGhlIHJvb3QgZWxlbWVudCBpcyBub3QgdGhlIGhvc3QgZWxlbWVudC4gKGkuZS4gd2hlbiBgY2RrRHJhZ1Jvb3RFbGVtZW50YCBpcyB1c2VkKS5cbiAgICovXG4gIEBJbnB1dCgnY2RrRHJhZ1Jvb3RFbGVtZW50Q2xhc3MnKSBzZXQgcm9vdEVsZW1lbnRTZWxlY3RvckNsYXNzKHZhbHVlOiBzdHJpbmcpIHsgLy8gdHNsaW50OmRpc2FibGUtbGluZTpuby1pbnB1dC1yZW5hbWVcbiAgICBpZiAodmFsdWUgIT09IHRoaXMuX3Jvb3RDbGFzcyAmJiB0aGlzLl9ob3N0Tm90Um9vdCkge1xuICAgICAgaWYgKHRoaXMuX3Jvb3RDbGFzcykge1xuICAgICAgICB0aGlzLmdldFJvb3RFbGVtZW50KCkuY2xhc3NMaXN0LnJlbW92ZSguLi50aGlzLl9yb290Q2xhc3Muc3BsaXQoJyAnKSk7XG4gICAgICB9XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5nZXRSb290RWxlbWVudCgpLmNsYXNzTGlzdC5hZGQoLi4udmFsdWUuc3BsaXQoJyAnKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3Jvb3RDbGFzcyA9IHZhbHVlO1xuICB9XG5cbiAgZ2V0IHBibERyYWdSZWYoKTogUGJsRHJhZ1JlZjxEUmVmPiB7IHJldHVybiB0aGlzLl9kcmFnUmVmIGFzIGFueTsgfVxuXG4gIEBJbnB1dCgpIGdldCBjZGtEcm9wTGlzdCgpOiBaIHsgcmV0dXJuIHRoaXMuZHJvcENvbnRhaW5lciBhcyBaOyB9XG4gIHNldCBjZGtEcm9wTGlzdChkcm9wTGlzdDogWikge1xuICAgIC8vIFRPIFNVUFBPUlQgYGNka0Ryb3BMaXN0YCB2aWEgc3RyaW5nIGlucHV0IChJRCkgd2UgbmVlZCBhIHJlYWN0aXZlIHJlZ2lzdHJ5Li4uXG4gICAgY29uc3QgcHJldiA9IHRoaXMuY2RrRHJvcExpc3Q7XG4gICAgaWYgKGRyb3BMaXN0ICE9PSBwcmV2KSB7XG4gICAgICBpZiAocHJldikge1xuICAgICAgICBwcmV2LnJlbW92ZURyYWcodGhpcyk7XG4gICAgICB9XG4gICAgICB0aGlzLmRyb3BDb250YWluZXIgPSBkcm9wTGlzdDtcbiAgICAgIGlmIChkcm9wTGlzdCkge1xuICAgICAgICB0aGlzLl9kcmFnUmVmLl93aXRoRHJvcENvbnRhaW5lcihkcm9wTGlzdC5wYmxEcm9wTGlzdFJlZik7XG4gICAgICAgIHRoaXMuX2RyYWdSZWYuYmVmb3JlU3RhcnRlZC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIGlmIChkcm9wTGlzdC5kaXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdSZWYud2l0aERpcmVjdGlvbihkcm9wTGlzdC5kaXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRyb3BMaXN0LmFkZERyYWcodGhpcyk7XG4gICAgICB9XG4gICAgICB0aGlzLmRyb3BDb250YWluZXJDaGFuZ2VkKHByZXYpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Jvb3RDbGFzczogc3RyaW5nO1xuICBwcml2YXRlIF9ob3N0Tm90Um9vdCA9IGZhbHNlO1xuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIGlmICghKHRoaXMucGJsRHJhZ1JlZiBpbnN0YW5jZW9mIFBibERyYWdSZWYpKSB7XG4gICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBgRHJhZ1JlZmAgaW5qZWN0aW9uLCB0aGUgcmVmIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBQYmxEcmFnUmVmJylcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wYmxEcmFnUmVmLnJvb3RFbGVtZW50Q2hhbmdlZC5zdWJzY3JpYmUoIGV2ZW50ID0+IHtcbiAgICAgIGNvbnN0IHJvb3RFbGVtZW50U2VsZWN0b3JDbGFzcyA9IHRoaXMuX3Jvb3RDbGFzcztcbiAgICAgIGNvbnN0IGhvc3ROb3RSb290ID0gdGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQgIT09IGV2ZW50LmN1cnI7XG5cbiAgICAgIGlmIChyb290RWxlbWVudFNlbGVjdG9yQ2xhc3MpIHtcbiAgICAgICAgaWYgKHRoaXMuX2hvc3ROb3RSb290KSB7XG4gICAgICAgICAgZXZlbnQucHJldi5jbGFzc0xpc3QucmVtb3ZlKC4uLnJvb3RFbGVtZW50U2VsZWN0b3JDbGFzcy5zcGxpdCgnICcpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaG9zdE5vdFJvb3QpIHtcbiAgICAgICAgICBldmVudC5jdXJyLmNsYXNzTGlzdC5hZGQoLi4ucm9vdEVsZW1lbnRTZWxlY3RvckNsYXNzLnNwbGl0KCcgJykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9ob3N0Tm90Um9vdCA9IGhvc3ROb3RSb290O1xuICAgIH0pO1xuICB9XG5cbiAgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL21hdGVyaWFsMi9wdWxsLzE0MTU4XG4gIC8vIFdvcmtpbmcgYXJvdW5kIHRoZSBpc3N1ZSBvZiBkcm9wIGNvbnRhaW5lciBpcyBub3QgdGhlIGRpcmVjdCBwYXJlbnQgKGZhdGhlcikgb2YgYSBkcmFnIGl0ZW0uXG4gIC8vIFRoZSBlbnRpcmUgbmdBZnRlclZpZXdJbml0KCkgb3ZlcnJpZGluZyBtZXRob2QgY2FuIGJlIHJlbW92ZWQgaWYgUFIgYWNjZXB0ZWQuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLnN0YXJ0ZWQuc3Vic2NyaWJlKCBzdGFydGVkRXZlbnQgPT4ge1xuICAgICAgaWYgKHRoaXMuZHJvcENvbnRhaW5lcikge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5nZXRSb290RWxlbWVudCgpO1xuICAgICAgICBjb25zdCBpbml0aWFsUm9vdEVsZW1lbnRQYXJlbnQgPSBlbGVtZW50LnBhcmVudE5vZGUgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGlmICghZWxlbWVudC5uZXh0U2libGluZyAmJiBpbml0aWFsUm9vdEVsZW1lbnRQYXJlbnQgIT09IHRoaXMuZHJvcENvbnRhaW5lci5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgICAgICB0aGlzLmVuZGVkLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKCBlbmRlZEV2ZW50ID0+IGluaXRpYWxSb290RWxlbWVudFBhcmVudC5hcHBlbmRDaGlsZChlbGVtZW50KSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgc3VwZXIubmdBZnRlclZpZXdJbml0KCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmNka0Ryb3BMaXN0Py5yZW1vdmVEcmFnKHRoaXMpO1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZHJvcENvbnRhaW5lckNoYW5nZWQocHJldjogWikgeyB9XG59XG4iXX0=