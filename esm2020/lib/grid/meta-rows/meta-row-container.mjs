import { Subject } from 'rxjs';
import { Component, Input, ElementRef } from '@angular/core';
import { ON_RESIZE_ROW, unrx } from '@pebula/ngrid/core';
import { PblNgridMetaRowService } from './meta-row.service';
import * as i0 from "@angular/core";
import * as i1 from "./meta-row.service";
import * as i2 from "@angular/common";
export class PblNgridMetaRowContainerComponent {
    constructor(metaRows, elRef) {
        this.metaRows = metaRows;
        this._width$ = new Subject();
        this._totalColumnWidth = 0;
        this._hzScrollDir = 1;
        this.element = elRef.nativeElement;
        metaRows.sync.pipe(unrx(this)).subscribe(() => this.syncRowDefinitions());
        this.metaRows.extApi.events
            .pipe(ON_RESIZE_ROW, unrx(this))
            .subscribe(event => this.updateWidths());
        this.metaRows.extApi.grid.columnApi.totalColumnWidthChange
            .pipe(unrx(this))
            .subscribe(width => {
            this._totalColumnWidth = width;
            this.updateWidths();
        });
        this._hzScrollDir = this.metaRows.extApi.getDirection() === 'rtl' ? -1 : 1;
        this.metaRows.extApi.directionChange()
            .pipe(unrx(this))
            .subscribe(dir => this._hzScrollDir = dir === 'rtl' ? -1 : 1);
    }
    ngOnChanges(changes) {
        if ('type' in changes) {
            const scrollContainerElement = this.element;
            scrollContainerElement.scrollLeft = this.metaRows.extApi.grid.viewport.measureScrollOffset('start') * this._hzScrollDir;
            if (changes.type.isFirstChange) {
                this.metaRows.hzScroll
                    .pipe(unrx(this))
                    .subscribe(offset => scrollContainerElement.scrollLeft = offset * this._hzScrollDir);
                this.metaRows.extApi.cdkTable.onRenderRows
                    .pipe(unrx(this))
                    .subscribe(() => { this.updateWidths(); });
            }
        }
    }
    ngOnDestroy() {
        this._width$.complete();
        unrx.kill(this);
    }
    updateWidths() {
        this._innerWidth = this.metaRows.extApi.grid.viewport.innerWidth;
        this._minWidth = this.metaRows.extApi.cdkTable.minWidth;
        this._width = Math.max(this._innerWidth, this._minWidth);
        this._width$.next(Math.max(this._innerWidth, this._totalColumnWidth));
    }
    syncRowDefinitions() {
        const isHeader = this.type === 'header';
        const section = isHeader ? this.metaRows.header : this.metaRows.footer;
        const widthContainer = this.element.firstElementChild;
        const container = widthContainer.nextElementSibling;
        if (isHeader) {
            widthContainer.appendChild(this.metaRows.gridWidthRow.el);
        }
        for (const def of section.fixed) {
            container.appendChild(def.el);
        }
    }
}
/** @nocollapse */ PblNgridMetaRowContainerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMetaRowContainerComponent, deps: [{ token: i1.PblNgridMetaRowService }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridMetaRowContainerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridMetaRowContainerComponent, selector: "div[pbl-ngrid-fixed-meta-row-container]", inputs: { type: ["pbl-ngrid-fixed-meta-row-container", "type"] }, host: { properties: { "style.width.px": "_innerWidth" }, styleAttribute: "flex: 0 0 auto; overflow: hidden;" }, usesOnChanges: true, ngImport: i0, template: `<div class="pbl-cdk-table" style="height: 0px; overflow: hidden;" [style.width.px]="_width"></div><div class="pbl-cdk-table" [style.width.px]="_width$ | async"></div>`, isInline: true, dependencies: [{ kind: "pipe", type: i2.AsyncPipe, name: "async" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridMetaRowContainerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'div[pbl-ngrid-fixed-meta-row-container]',
                    template: `<div class="pbl-cdk-table" style="height: 0px; overflow: hidden;" [style.width.px]="_width"></div><div class="pbl-cdk-table" [style.width.px]="_width$ | async"></div>`,
                    host: {
                        style: 'flex: 0 0 auto; overflow: hidden;',
                        '[style.width.px]': '_innerWidth',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridMetaRowService }, { type: i0.ElementRef }]; }, propDecorators: { type: [{
                type: Input,
                args: ['pbl-ngrid-fixed-meta-row-container']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YS1yb3ctY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvbWV0YS1yb3dzL21ldGEtcm93LWNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9CLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBdUMsTUFBTSxlQUFlLENBQUM7QUFDbEcsT0FBTyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUV6RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQzs7OztBQVU1RCxNQUFNLE9BQU8saUNBQWlDO0lBaUI1QyxZQUE0QixRQUFnQyxFQUFFLEtBQThCO1FBQWhFLGFBQVEsR0FBUixRQUFRLENBQXdCO1FBTm5ELFlBQU8sR0FBRyxJQUFJLE9BQU8sRUFBVSxDQUFDO1FBRWpDLHNCQUFpQixHQUFHLENBQUMsQ0FBQztRQUV0QixpQkFBWSxHQUFXLENBQUMsQ0FBQztRQUcvQixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUM7UUFFbkMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFFLENBQUM7UUFFNUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTTthQUN4QixJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMvQixTQUFTLENBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUUsQ0FBQztRQUU3QyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQjthQUN2RCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hCLFNBQVMsQ0FBRSxLQUFLLENBQUMsRUFBRTtZQUNsQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1lBQy9CLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztRQUVMLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTthQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hCLFNBQVMsQ0FBRSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDO0lBQ3BFLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBc0I7UUFDaEMsSUFBSSxNQUFNLElBQUksT0FBTyxFQUFFO1lBQ3JCLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUM1QyxzQkFBc0IsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBRXhILElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUTtxQkFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDaEIsU0FBUyxDQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsVUFBVSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRXhGLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZO3FCQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNoQixTQUFTLENBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDOUM7U0FDRjtJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFTyxZQUFZO1FBQ2xCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7UUFDakUsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO1FBQ3hELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQTtJQUN2RSxDQUFDO0lBRU8sa0JBQWtCO1FBQ3hCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDO1FBQ3hDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBRXZFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7UUFDdEQsTUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLGtCQUFrQixDQUFDO1FBRXBELElBQUksUUFBUSxFQUFFO1lBQ1osY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUMzRDtRQUVELEtBQUssTUFBTSxHQUFHLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtZQUMvQixTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUMvQjtJQUNILENBQUM7O2lKQWxGVSxpQ0FBaUM7cUlBQWpDLGlDQUFpQyxzUkFObEMsd0tBQXdLOzJGQU12SyxpQ0FBaUM7a0JBUjdDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHlDQUF5QztvQkFDbkQsUUFBUSxFQUFFLHdLQUF3SztvQkFDbEwsSUFBSSxFQUFFO3dCQUNKLEtBQUssRUFBRSxtQ0FBbUM7d0JBQzFDLGtCQUFrQixFQUFFLGFBQWE7cUJBQ2xDO2lCQUNGO3NJQUc4QyxJQUFJO3NCQUFoRCxLQUFLO3VCQUFDLG9DQUFvQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIEVsZW1lbnRSZWYsIE9uRGVzdHJveSwgT25DaGFuZ2VzLCBTaW1wbGVDaGFuZ2VzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPTl9SRVNJWkVfUk9XLCB1bnJ4IH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcblxuaW1wb3J0IHsgUGJsTmdyaWRNZXRhUm93U2VydmljZSB9IGZyb20gJy4vbWV0YS1yb3cuc2VydmljZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2RpdltwYmwtbmdyaWQtZml4ZWQtbWV0YS1yb3ctY29udGFpbmVyXScsXG4gIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cInBibC1jZGstdGFibGVcIiBzdHlsZT1cImhlaWdodDogMHB4OyBvdmVyZmxvdzogaGlkZGVuO1wiIFtzdHlsZS53aWR0aC5weF09XCJfd2lkdGhcIj48L2Rpdj48ZGl2IGNsYXNzPVwicGJsLWNkay10YWJsZVwiIFtzdHlsZS53aWR0aC5weF09XCJfd2lkdGgkIHwgYXN5bmNcIj48L2Rpdj5gLFxuICBob3N0OiB7IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8taG9zdC1tZXRhZGF0YS1wcm9wZXJ0eVxuICAgIHN0eWxlOiAnZmxleDogMCAwIGF1dG87IG92ZXJmbG93OiBoaWRkZW47JyxcbiAgICAnW3N0eWxlLndpZHRoLnB4XSc6ICdfaW5uZXJXaWR0aCcsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkTWV0YVJvd0NvbnRhaW5lckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcblxuICBASW5wdXQoJ3BibC1uZ3JpZC1maXhlZC1tZXRhLXJvdy1jb250YWluZXInKSB0eXBlOiAnaGVhZGVyJyB8ICdmb290ZXInO1xuXG4gIC8qKlxuICAgKiBUaGUgaW5uZXIgd2lkdGggb2YgdGhlIGdyaWQsIHRoZSB2aWV3cG9ydCB3aWR0aCBvZiBhIHJvdy5cbiAgICogVGhlIHdpZHRoIG9mIHRoZSBncmlkIG1pbnVzIHNjcm9sbCBiYXIuXG4gICAqL1xuICBfaW5uZXJXaWR0aDogbnVtYmVyO1xuICBfbWluV2lkdGg6IG51bWJlcjtcbiAgX3dpZHRoOiBudW1iZXI7XG4gIHJlYWRvbmx5IF93aWR0aCQgPSBuZXcgU3ViamVjdDxudW1iZXI+KCk7XG5cbiAgcHJpdmF0ZSBfdG90YWxDb2x1bW5XaWR0aCA9IDA7XG4gIHByaXZhdGUgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgX2h6U2Nyb2xsRGlyOiAtMSB8IDEgPSAxO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBtZXRhUm93czogUGJsTmdyaWRNZXRhUm93U2VydmljZSwgZWxSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIG1ldGFSb3dzLnN5bmMucGlwZSh1bnJ4KHRoaXMpKS5zdWJzY3JpYmUoICgpID0+IHRoaXMuc3luY1Jvd0RlZmluaXRpb25zKCkgKTtcblxuICAgIHRoaXMubWV0YVJvd3MuZXh0QXBpLmV2ZW50c1xuICAgICAgLnBpcGUoT05fUkVTSVpFX1JPVywgdW5yeCh0aGlzKSlcbiAgICAgIC5zdWJzY3JpYmUoIGV2ZW50ID0+IHRoaXMudXBkYXRlV2lkdGhzKCkgKTtcblxuICAgIHRoaXMubWV0YVJvd3MuZXh0QXBpLmdyaWQuY29sdW1uQXBpLnRvdGFsQ29sdW1uV2lkdGhDaGFuZ2VcbiAgICAgIC5waXBlKHVucngodGhpcykpXG4gICAgICAuc3Vic2NyaWJlKCB3aWR0aCA9PiB7XG4gICAgICAgIHRoaXMuX3RvdGFsQ29sdW1uV2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy51cGRhdGVXaWR0aHMoKTtcbiAgICAgIH0pO1xuXG4gICAgdGhpcy5faHpTY3JvbGxEaXIgPSB0aGlzLm1ldGFSb3dzLmV4dEFwaS5nZXREaXJlY3Rpb24oKSA9PT0gJ3J0bCcgPyAtMSA6IDFcbiAgICB0aGlzLm1ldGFSb3dzLmV4dEFwaS5kaXJlY3Rpb25DaGFuZ2UoKVxuICAgICAgLnBpcGUodW5yeCh0aGlzKSlcbiAgICAgIC5zdWJzY3JpYmUoIGRpciA9PiB0aGlzLl9oelNjcm9sbERpciA9IGRpciA9PT0gJ3J0bCcgPyAtMSA6IDEgKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBpZiAoJ3R5cGUnIGluIGNoYW5nZXMpIHtcbiAgICAgIGNvbnN0IHNjcm9sbENvbnRhaW5lckVsZW1lbnQgPSB0aGlzLmVsZW1lbnQ7XG4gICAgICBzY3JvbGxDb250YWluZXJFbGVtZW50LnNjcm9sbExlZnQgPSB0aGlzLm1ldGFSb3dzLmV4dEFwaS5ncmlkLnZpZXdwb3J0Lm1lYXN1cmVTY3JvbGxPZmZzZXQoJ3N0YXJ0JykgKiB0aGlzLl9oelNjcm9sbERpcjtcblxuICAgICAgaWYgKGNoYW5nZXMudHlwZS5pc0ZpcnN0Q2hhbmdlKSB7XG4gICAgICAgIHRoaXMubWV0YVJvd3MuaHpTY3JvbGxcbiAgICAgICAgICAucGlwZSh1bnJ4KHRoaXMpKVxuICAgICAgICAgIC5zdWJzY3JpYmUoIG9mZnNldCA9PiBzY3JvbGxDb250YWluZXJFbGVtZW50LnNjcm9sbExlZnQgPSBvZmZzZXQgKiB0aGlzLl9oelNjcm9sbERpcik7XG5cbiAgICAgICAgdGhpcy5tZXRhUm93cy5leHRBcGkuY2RrVGFibGUub25SZW5kZXJSb3dzXG4gICAgICAgICAgLnBpcGUodW5yeCh0aGlzKSlcbiAgICAgICAgICAuc3Vic2NyaWJlKCAoKSA9PiB7IHRoaXMudXBkYXRlV2lkdGhzKCkgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fd2lkdGgkLmNvbXBsZXRlKCk7XG4gICAgdW5yeC5raWxsKHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVXaWR0aHMoKTogdm9pZCB7XG4gICAgdGhpcy5faW5uZXJXaWR0aCA9IHRoaXMubWV0YVJvd3MuZXh0QXBpLmdyaWQudmlld3BvcnQuaW5uZXJXaWR0aDtcbiAgICB0aGlzLl9taW5XaWR0aCA9IHRoaXMubWV0YVJvd3MuZXh0QXBpLmNka1RhYmxlLm1pbldpZHRoO1xuICAgIHRoaXMuX3dpZHRoID0gTWF0aC5tYXgodGhpcy5faW5uZXJXaWR0aCwgdGhpcy5fbWluV2lkdGgpO1xuICAgIHRoaXMuX3dpZHRoJC5uZXh0KE1hdGgubWF4KHRoaXMuX2lubmVyV2lkdGgsIHRoaXMuX3RvdGFsQ29sdW1uV2lkdGgpKVxuICB9XG5cbiAgcHJpdmF0ZSBzeW5jUm93RGVmaW5pdGlvbnMoKTogdm9pZCB7XG4gICAgY29uc3QgaXNIZWFkZXIgPSB0aGlzLnR5cGUgPT09ICdoZWFkZXInO1xuICAgIGNvbnN0IHNlY3Rpb24gPSBpc0hlYWRlciA/IHRoaXMubWV0YVJvd3MuaGVhZGVyIDogdGhpcy5tZXRhUm93cy5mb290ZXI7XG5cbiAgICBjb25zdCB3aWR0aENvbnRhaW5lciA9IHRoaXMuZWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICBjb25zdCBjb250YWluZXIgPSB3aWR0aENvbnRhaW5lci5uZXh0RWxlbWVudFNpYmxpbmc7XG5cbiAgICBpZiAoaXNIZWFkZXIpIHtcbiAgICAgIHdpZHRoQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMubWV0YVJvd3MuZ3JpZFdpZHRoUm93LmVsKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGRlZiBvZiBzZWN0aW9uLmZpeGVkKSB7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZGVmLmVsKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==