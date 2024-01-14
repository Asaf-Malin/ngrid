import { ChangeDetectionStrategy, Component, ViewEncapsulation, ViewContainerRef, ViewChild, } from '@angular/core';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { CdkRow } from '@angular/cdk/table';
import { unrx } from '@pebula/ngrid/core';
import { PblNgridRowComponent } from '@pebula/ngrid';
import { PLUGIN_KEY } from './tokens';
import * as i0 from "@angular/core";
export const PBL_NGRID_ROW_TEMPLATE = '<ng-content select=".pbl-ngrid-row-prefix"></ng-content><ng-container #viewRef></ng-container><ng-content select=".pbl-ngrid-row-suffix"></ng-content>';
export class PblNgridDetailRowComponent extends PblNgridRowComponent {
    constructor() {
        super(...arguments);
        this.opened = false;
    }
    get expended() {
        return this.opened;
    }
    get height() {
        return super.height + this.controller.getDetailRowHeight(this);
    }
    get row() { return this.context.$implicit; }
    ngOnInit() {
        super.ngOnInit();
        this.plugin.addDetailRow(this);
        const tradeEvents = this._extApi.pluginCtrl.getPlugin('targetEvents');
        tradeEvents.cellClick
            .pipe(unrx(this))
            .subscribe(event => {
            if (event.type === 'data' && event.row === this.context.$implicit) {
                const { excludeToggleFrom } = this.plugin;
                if (!excludeToggleFrom || !excludeToggleFrom.some(c => event.column.id === c)) {
                    this.toggle();
                }
            }
        });
        tradeEvents.rowClick
            .pipe(unrx(this))
            .subscribe(event => {
            if (!event.root && event.type === 'data' && event.row === this.context.$implicit) {
                this.toggle();
            }
        });
    }
    ngOnDestroy() {
        unrx.kill(this);
        this.plugin.removeDetailRow(this);
        this.controller.clearDetailRow(this, true);
        super.ngOnDestroy();
    }
    updateRow() {
        if (super.updateRow()) { // only if row has changed (TODO: use identity based change detection?)
            switch (this.plugin.whenContextChange) {
                case 'context':
                    const isContextOpened = !!this.context.getExternal('detailRow');
                    isContextOpened && this.opened
                        ? this.controller.updateDetailRow(this) // if already opened, just update the context
                        : this.toggle(isContextOpened, true) // if not opened, force to the context state
                    ;
                    break;
                case 'render':
                    if (this.opened) {
                        this.controller.updateDetailRow(this);
                    }
                    break;
                case 'close':
                    this.toggle(false, true);
                    break;
            }
            this.plugin.markForCheck();
            this.controller.detectChanges(this);
            this.plugin.toggledRowContextChange.next(this);
            return true;
        }
        return false;
    }
    toggle(forceState, fromRender = false) {
        if (this.opened !== forceState) {
            let opened = false;
            if (this.opened) {
                this.controller.clearDetailRow(this, fromRender);
                this.element.classList.remove('pbl-row-detail-opened');
            }
            else if (this.controller.render(this, fromRender)) {
                opened = true;
                this.element.classList.add('pbl-row-detail-opened');
            }
            if (this.opened !== opened) {
                this.opened = opened;
                this.context.setExternal('detailRow', opened, true);
                this.plugin.detailRowToggled(this);
            }
        }
    }
    /**
     * @internal
     */
    handleKeydown(event) {
        if (event.target === this.element) {
            const keyCode = event.keyCode;
            const isToggleKey = keyCode === ENTER || keyCode === SPACE;
            if (isToggleKey) {
                event.preventDefault(); // prevents the page from scrolling down when pressing space
                this.toggle();
            }
        }
    }
    onCtor() {
        super.onCtor();
        this.plugin = this._extApi.pluginCtrl.getPlugin(PLUGIN_KEY); // TODO: THROW IF NO PLUGIN...
        this.controller = this.plugin.detailRowCtrl;
    }
}
/** @nocollapse */ PblNgridDetailRowComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ PblNgridDetailRowComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridDetailRowComponent, selector: "pbl-ngrid-row[detailRow]", host: { attributes: { "role": "row" }, listeners: { "keydown": "handleKeydown($event)" }, properties: { "attr.tabindex": "grid.rowFocus" }, classAttribute: "pbl-ngrid-row pbl-row-detail-parent" }, providers: [
        { provide: CdkRow, useExisting: PblNgridDetailRowComponent }
    ], viewQueries: [{ propertyName: "_viewRef", first: true, predicate: ["viewRef"], descendants: true, read: ViewContainerRef, static: true }], exportAs: ["pblNgridDetailRow"], usesInheritance: true, ngImport: i0, template: "<ng-content select=\".pbl-ngrid-row-prefix\"></ng-content><ng-container #viewRef></ng-container><ng-content select=\".pbl-ngrid-row-suffix\"></ng-content>", isInline: true, styles: [".pbl-row-detail-parent{position:relative;cursor:pointer}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridDetailRowComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pbl-ngrid-row[detailRow]', exportAs: 'pblNgridDetailRow', host: {
                        class: 'pbl-ngrid-row pbl-row-detail-parent',
                        role: 'row',
                        '[attr.tabindex]': 'grid.rowFocus',
                        '(keydown)': 'handleKeydown($event)'
                    }, template: PBL_NGRID_ROW_TEMPLATE, providers: [
                        { provide: CdkRow, useExisting: PblNgridDetailRowComponent }
                    ], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, styles: [".pbl-row-detail-parent{position:relative;cursor:pointer}\n"] }]
        }], propDecorators: { _viewRef: [{
                type: ViewChild,
                args: ['viewRef', { read: ViewContainerRef, static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9kZXRhaWwtcm93L3NyYy9saWIvZGV0YWlsLXJvdy9yb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixTQUFTLEVBR1QsaUJBQWlCLEVBQ2pCLGdCQUFnQixFQUNoQixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFNUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNyRCxPQUFPLEVBQTRCLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQzs7QUFTaEUsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsd0pBQXdKLENBQUM7QUFtQi9MLE1BQU0sT0FBTywwQkFBMkIsU0FBUSxvQkFBb0I7SUFqQnBFOztRQWtDVSxXQUFNLEdBQUcsS0FBSyxDQUFDO0tBcUd4QjtJQXBIQyxJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQUVELElBQUksTUFBTTtRQUNSLE9BQU8sS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxJQUFJLEdBQUcsS0FBSyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQVc1QyxRQUFRO1FBQ04sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxD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TUFBTSxFQUFFLENBQUM7YUFDZjtTQUNGO0lBQ0gsQ0FBQztJQUVTLE1BQU07UUFDZCxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLDhCQUE4QjtRQUMzRixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDO0lBQzlDLENBQUM7OzBJQXJIVSwwQkFBMEI7OEhBQTFCLDBCQUEwQix3UEFOMUI7UUFDVCxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLDBCQUEwQixFQUFFO0tBQzdELDBHQW1CNkIsZ0JBQWdCOzJGQWZuQywwQkFBMEI7a0JBakJ0QyxTQUFTOytCQUNFLDBCQUEwQixZQUMxQixtQkFBbUIsUUFDdkI7d0JBQ0osS0FBSyxFQUFFLHFDQUFxQzt3QkFDNUMsSUFBSSxFQUFFLEtBQUs7d0JBQ1gsaUJBQWlCLEVBQUUsZUFBZTt3QkFDbEMsV0FBVyxFQUFFLHVCQUF1QjtxQkFDckMsWUFDUyxzQkFBc0IsYUFFckI7d0JBQ1QsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFdBQVcsNEJBQTRCLEVBQUU7cUJBQzdELG1CQUNnQix1QkFBdUIsQ0FBQyxNQUFNLGlCQUNoQyxpQkFBaUIsQ0FBQyxJQUFJOzhCQWlCMkIsUUFBUTtzQkFBdkUsU0FBUzt1QkFBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDb21wb25lbnQsXG4gIE9uSW5pdCxcbiAgT25EZXN0cm95LFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgVmlld0NoaWxkLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEVOVEVSLCBTUEFDRSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQgeyBDZGtSb3cgfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuXG5pbXBvcnQgeyB1bnJ4IH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcbmltcG9ydCB7IFBibE5ncmlkUm93Q29tcG9uZW50IH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5pbXBvcnQgeyBQYmxEZXRhaWxzUm93VG9nZ2xlRXZlbnQsIFBMVUdJTl9LRVkgfSBmcm9tICcuL3Rva2Vucyc7XG5pbXBvcnQgeyBEZXRhaWxSb3dDb250cm9sbGVyIH0gZnJvbSAnLi9kZXRhaWwtcm93LWNvbnRyb2xsZXInO1xuXG5kZWNsYXJlIG1vZHVsZSAnQHBlYnVsYS9uZ3JpZC9saWIvZ3JpZC9jb250ZXh0L3R5cGVzJyB7XG4gIGludGVyZmFjZSBFeHRlcm5hbFJvd0NvbnRleHRTdGF0ZSB7XG4gICAgZGV0YWlsUm93OiBib29sZWFuO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBQQkxfTkdSSURfUk9XX1RFTVBMQVRFID0gJzxuZy1jb250ZW50IHNlbGVjdD1cIi5wYmwtbmdyaWQtcm93LXByZWZpeFwiPjwvbmctY29udGVudD48bmctY29udGFpbmVyICN2aWV3UmVmPjwvbmctY29udGFpbmVyPjxuZy1jb250ZW50IHNlbGVjdD1cIi5wYmwtbmdyaWQtcm93LXN1ZmZpeFwiPjwvbmctY29udGVudD4nO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdwYmwtbmdyaWQtcm93W2RldGFpbFJvd10nLFxuICBleHBvcnRBczogJ3BibE5ncmlkRGV0YWlsUm93JyxcbiAgaG9zdDogeyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWhvc3QtbWV0YWRhdGEtcHJvcGVydHlcbiAgICBjbGFzczogJ3BibC1uZ3JpZC1yb3cgcGJsLXJvdy1kZXRhaWwtcGFyZW50JyxcbiAgICByb2xlOiAncm93JyxcbiAgICAnW2F0dHIudGFiaW5kZXhdJzogJ2dyaWQucm93Rm9jdXMnLFxuICAgICcoa2V5ZG93biknOiAnaGFuZGxlS2V5ZG93bigkZXZlbnQpJ1xuICB9LFxuICB0ZW1wbGF0ZTogUEJMX05HUklEX1JPV19URU1QTEFURSxcbiAgc3R5bGVzOiBbIGAucGJsLXJvdy1kZXRhaWwtcGFyZW50IHsgcG9zaXRpb246IHJlbGF0aXZlOyBjdXJzb3I6IHBvaW50ZXI7IH1gIF0sXG4gIHByb3ZpZGVyczogW1xuICAgIHsgcHJvdmlkZTogQ2RrUm93LCB1c2VFeGlzdGluZzogUGJsTmdyaWREZXRhaWxSb3dDb21wb25lbnQgfVxuICBdLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbn0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWREZXRhaWxSb3dDb21wb25lbnQgZXh0ZW5kcyBQYmxOZ3JpZFJvd0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95LCBQYmxEZXRhaWxzUm93VG9nZ2xlRXZlbnQge1xuXG4gIGdldCBleHBlbmRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuZWQ7XG4gIH1cblxuICBnZXQgaGVpZ2h0KCkge1xuICAgIHJldHVybiBzdXBlci5oZWlnaHQgKyB0aGlzLmNvbnRyb2xsZXIuZ2V0RGV0YWlsUm93SGVpZ2h0KHRoaXMpO1xuICB9XG5cbiAgZ2V0IHJvdygpIHsgcmV0dXJuIHRoaXMuY29udGV4dC4kaW1wbGljaXQ7IH1cblxuICAvLyBXZSBtdXN0IGV4cGxpY2l0bHkgZGVmaW5lIHRoZSBpbmhlcml0ZWQgcHJvcGVydGllcyB3aGljaCBoYXZlIGFuZ3VsYXIgYW5ub3RhdGlvbnNcbiAgLy8gQmVjYXVzZSBhbmd1bGFyIHdpbGwgbm90IGRldGVjdCB0aGVtIHdoZW4gYnVpbGRpbmcgdGhpcyBsaWJyYXJ5LlxuICAvLyBUT0RPOiBXaGVuIG1vdmluZyB1cCB0byBJVlkgc2VlIGlmIHRoaXMgb25lIGdldCBmaXhlZFxuICBAVmlld0NoaWxkKCd2aWV3UmVmJywgeyByZWFkOiBWaWV3Q29udGFpbmVyUmVmLCBzdGF0aWM6IHRydWUgfSkgX3ZpZXdSZWY6IFZpZXdDb250YWluZXJSZWY7XG5cbiAgcHJpdmF0ZSBvcGVuZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBwbHVnaW46IGltcG9ydCgnLi9kZXRhaWwtcm93LXBsdWdpbicpLlBibE5ncmlkRGV0YWlsUm93UGx1Z2luRGlyZWN0aXZlPGFueT47XG4gIHByaXZhdGUgY29udHJvbGxlcjogRGV0YWlsUm93Q29udHJvbGxlcjtcblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICAgIHRoaXMucGx1Z2luLmFkZERldGFpbFJvdyh0aGlzKTtcbiAgICBjb25zdCB0cmFkZUV2ZW50cyA9IHRoaXMuX2V4dEFwaS5wbHVnaW5DdHJsLmdldFBsdWdpbigndGFyZ2V0RXZlbnRzJyk7XG5cbiAgICB0cmFkZUV2ZW50cy5jZWxsQ2xpY2tcbiAgICAgIC5waXBlKHVucngodGhpcykpXG4gICAgICAuc3Vic2NyaWJlKCBldmVudCA9PiB7XG4gICAgICAgIGlmIChldmVudC50eXBlID09PSAnZGF0YScgJiYgZXZlbnQucm93ID09PSB0aGlzLmNvbnRleHQuJGltcGxpY2l0KSB7XG4gICAgICAgICAgY29uc3QgeyBleGNsdWRlVG9nZ2xlRnJvbSB9ID0gdGhpcy5wbHVnaW47XG4gICAgICAgICAgaWYgKCFleGNsdWRlVG9nZ2xlRnJvbSB8fCAhZXhjbHVkZVRvZ2dsZUZyb20uc29tZSggYyA9PiBldmVudC5jb2x1bW4uaWQgPT09IGMgKSkge1xuICAgICAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgdHJhZGVFdmVudHMucm93Q2xpY2tcbiAgICAgIC5waXBlKHVucngodGhpcykpXG4gICAgICAuc3Vic2NyaWJlKCBldmVudCA9PiB7XG4gICAgICAgIGlmICghZXZlbnQucm9vdCAmJiBldmVudC50eXBlID09PSAnZGF0YScgJiYgZXZlbnQucm93ID09PSB0aGlzLmNvbnRleHQuJGltcGxpY2l0KSB7XG4gICAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB1bnJ4LmtpbGwodGhpcyk7XG4gICAgdGhpcy5wbHVnaW4ucmVtb3ZlRGV0YWlsUm93KHRoaXMpO1xuICAgIHRoaXMuY29udHJvbGxlci5jbGVhckRldGFpbFJvdyh0aGlzLCB0cnVlKTtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cbiAgdXBkYXRlUm93KCkge1xuICAgIGlmIChzdXBlci51cGRhdGVSb3coKSkgeyAvLyBvbmx5IGlmIHJvdyBoYXMgY2hhbmdlZCAoVE9ETzogdXNlIGlkZW50aXR5IGJhc2VkIGNoYW5nZSBkZXRlY3Rpb24/KVxuICAgICAgc3dpdGNoICh0aGlzLnBsdWdpbi53aGVuQ29udGV4dENoYW5nZSkge1xuICAgICAgICBjYXNlICdjb250ZXh0JzpcbiAgICAgICAgICBjb25zdCBpc0NvbnRleHRPcGVuZWQgPSAhIXRoaXMuY29udGV4dC5nZXRFeHRlcm5hbCgnZGV0YWlsUm93Jyk7XG4gICAgICAgICAgaXNDb250ZXh0T3BlbmVkICYmIHRoaXMub3BlbmVkXG4gICAgICAgICAgICA/IHRoaXMuY29udHJvbGxlci51cGRhdGVEZXRhaWxSb3codGhpcykgLy8gaWYgYWxyZWFkeSBvcGVuZWQsIGp1c3QgdXBkYXRlIHRoZSBjb250ZXh0XG4gICAgICAgICAgICA6IHRoaXMudG9nZ2xlKGlzQ29udGV4dE9wZW5lZCwgdHJ1ZSkgLy8gaWYgbm90IG9wZW5lZCwgZm9yY2UgdG8gdGhlIGNvbnRleHQgc3RhdGVcbiAgICAgICAgICA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3JlbmRlcic6XG4gICAgICAgICAgaWYgKHRoaXMub3BlbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIudXBkYXRlRGV0YWlsUm93KHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY2xvc2UnOlxuICAgICAgICAgIHRoaXMudG9nZ2xlKGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHRoaXMucGx1Z2luLm1hcmtGb3JDaGVjaygpO1xuICAgICAgdGhpcy5jb250cm9sbGVyLmRldGVjdENoYW5nZXModGhpcyk7XG4gICAgICB0aGlzLnBsdWdpbi50b2dnbGVkUm93Q29udGV4dENoYW5nZS5uZXh0KHRoaXMpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHRvZ2dsZShmb3JjZVN0YXRlPzogYm9vbGVhbiwgZnJvbVJlbmRlciA9IGZhbHNlKTogdm9pZCB7XG4gICAgaWYgKHRoaXMub3BlbmVkICE9PSBmb3JjZVN0YXRlKSB7XG4gICAgICBsZXQgb3BlbmVkID0gZmFsc2U7XG4gICAgICBpZiAodGhpcy5vcGVuZWQpIHtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLmNsZWFyRGV0YWlsUm93KHRoaXMsIGZyb21SZW5kZXIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgncGJsLXJvdy1kZXRhaWwtb3BlbmVkJyk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuY29udHJvbGxlci5yZW5kZXIodGhpcywgZnJvbVJlbmRlcikpIHtcbiAgICAgICAgb3BlbmVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3BibC1yb3ctZGV0YWlsLW9wZW5lZCcpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vcGVuZWQgIT09IG9wZW5lZCkge1xuICAgICAgICB0aGlzLm9wZW5lZCA9IG9wZW5lZDtcbiAgICAgICAgdGhpcy5jb250ZXh0LnNldEV4dGVybmFsKCdkZXRhaWxSb3cnLCBvcGVuZWQsIHRydWUpO1xuICAgICAgICB0aGlzLnBsdWdpbi5kZXRhaWxSb3dUb2dnbGVkKHRoaXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGhhbmRsZUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoIGV2ZW50LnRhcmdldCA9PT0gdGhpcy5lbGVtZW50ICkge1xuICAgICAgY29uc3Qga2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XG4gICAgICBjb25zdCBpc1RvZ2dsZUtleSA9IGtleUNvZGUgPT09IEVOVEVSIHx8IGtleUNvZGUgPT09IFNQQUNFO1xuICAgICAgaWYgKCBpc1RvZ2dsZUtleSApIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsgLy8gcHJldmVudHMgdGhlIHBhZ2UgZnJvbSBzY3JvbGxpbmcgZG93biB3aGVuIHByZXNzaW5nIHNwYWNlXG4gICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIG9uQ3RvcigpIHtcbiAgICBzdXBlci5vbkN0b3IoKTtcbiAgICB0aGlzLnBsdWdpbiA9IHRoaXMuX2V4dEFwaS5wbHVnaW5DdHJsLmdldFBsdWdpbihQTFVHSU5fS0VZKTsgLy8gVE9ETzogVEhST1cgSUYgTk8gUExVR0lOLi4uXG4gICAgdGhpcy5jb250cm9sbGVyID0gdGhpcy5wbHVnaW4uZGV0YWlsUm93Q3RybDtcbiAgfVxufVxuIl19