import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { PblNgridConfigService } from '@pebula/ngrid/core';
import { PblNgridModule, PblNgridPluginController, ngridPlugin } from '@pebula/ngrid';
import { PblNgridStickyPluginDirective, setStickyRow, setStickyColumns, PLUGIN_KEY } from './sticky/sticky-plugin';
import * as i0 from "@angular/core";
import * as i1 from "@pebula/ngrid/core";
const MAPPER = (v) => [v, true];
export class PblNgridStickyModule {
    constructor(configService) {
        PblNgridPluginController.onCreatedSafe(PblNgridStickyModule, (grid, controller) => {
            if (controller && !controller.hasPlugin('sticky')) {
                controller.onInit()
                    .subscribe(() => {
                    const stickyPluginConfig = configService.get('stickyPlugin');
                    if (stickyPluginConfig) {
                        if (stickyPluginConfig.headers) {
                            setStickyRow(grid, 'header', stickyPluginConfig.headers.map(MAPPER));
                        }
                        if (stickyPluginConfig.footers) {
                            setStickyRow(grid, 'footer', stickyPluginConfig.footers.map(MAPPER));
                        }
                        if (stickyPluginConfig.columnStart) {
                            setStickyColumns(grid, 'start', stickyPluginConfig.columnStart.map(MAPPER));
                        }
                        if (stickyPluginConfig.columnEnd) {
                            setStickyColumns(grid, 'end', stickyPluginConfig.columnEnd.map(MAPPER));
                        }
                    }
                });
            }
        });
    }
}
PblNgridStickyModule.NGRID_PLUGIN = ngridPlugin({ id: PLUGIN_KEY }, PblNgridStickyPluginDirective);
/** @nocollapse */ PblNgridStickyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStickyModule, deps: [{ token: i1.PblNgridConfigService }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ PblNgridStickyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStickyModule, declarations: [PblNgridStickyPluginDirective], imports: [CommonModule, CdkTableModule, PblNgridModule], exports: [PblNgridStickyPluginDirective] });
/** @nocollapse */ PblNgridStickyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStickyModule, imports: [CommonModule, CdkTableModule, PblNgridModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridStickyModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, CdkTableModule, PblNgridModule],
                    declarations: [PblNgridStickyPluginDirective],
                    exports: [PblNgridStickyPluginDirective],
                }]
        }], ctorParameters: function () { return [{ type: i1.PblNgridConfigService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5Lm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3RpY2t5L3NyYy9saWIvc3RpY2t5Lm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDcEQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFM0QsT0FBTyxFQUFFLGNBQWMsRUFBRSx3QkFBd0IsRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdEYsT0FBTyxFQUFFLDZCQUE2QixFQUFFLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQzs7O0FBYW5ILE1BQU0sTUFBTSxHQUFHLENBQUksQ0FBSSxFQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFPcEQsTUFBTSxPQUFPLG9CQUFvQjtJQUkvQixZQUFZLGFBQW9DO1FBQzlDLHdCQUF3QixDQUFDLGFBQWEsQ0FDcEMsb0JBQW9CLEVBQ3BCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFFO1lBQ25CLElBQUksVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDakQsVUFBVSxDQUFDLE1BQU0sRUFBRTtxQkFDaEIsU0FBUyxDQUFDLEdBQUcsRUFBRTtvQkFDZCxNQUFNLGtCQUFrQixHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQzdELElBQUksa0JBQWtCLEVBQUU7d0JBQ3RCLElBQUksa0JBQWtCLENBQUMsT0FBTyxFQUFFOzRCQUM5QixZQUFZLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7eUJBQ3RFO3dCQUNELElBQUksa0JBQWtCLENBQUMsT0FBTyxFQUFFOzRCQUM5QixZQUFZLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7eUJBQ3RFO3dCQUNELElBQUksa0JBQWtCLENBQUMsV0FBVyxFQUFFOzRCQUNsQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzt5QkFDN0U7d0JBQ0QsSUFBSSxrQkFBa0IsQ0FBQyxTQUFTLEVBQUU7NEJBQ2hDLGdCQUFnQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsa0JBQWtCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO3lCQUN6RTtxQkFDRjtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNOO1FBQ0gsQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDOztBQTVCZSxpQ0FBWSxHQUFHLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO29JQUZuRixvQkFBb0I7cUlBQXBCLG9CQUFvQixpQkFIZiw2QkFBNkIsYUFEbEMsWUFBWSxFQUFFLGNBQWMsRUFBRSxjQUFjLGFBRTVDLDZCQUE2QjtxSUFFN0Isb0JBQW9CLFlBSnBCLFlBQVksRUFBRSxjQUFjLEVBQUUsY0FBYzsyRkFJNUMsb0JBQW9CO2tCQUxoQyxRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRSxDQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFFO29CQUN6RCxZQUFZLEVBQUUsQ0FBRSw2QkFBNkIsQ0FBRTtvQkFDL0MsT0FBTyxFQUFFLENBQUUsNkJBQTZCLENBQUU7aUJBQzNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBDZGtUYWJsZU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAcGVidWxhL25ncmlkL2NvcmUnO1xuXG5pbXBvcnQgeyBQYmxOZ3JpZE1vZHVsZSwgUGJsTmdyaWRQbHVnaW5Db250cm9sbGVyLCBuZ3JpZFBsdWdpbiB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQnO1xuaW1wb3J0IHsgUGJsTmdyaWRTdGlja3lQbHVnaW5EaXJlY3RpdmUsIHNldFN0aWNreVJvdywgc2V0U3RpY2t5Q29sdW1ucywgUExVR0lOX0tFWSB9IGZyb20gJy4vc3RpY2t5L3N0aWNreS1wbHVnaW4nO1xuXG5kZWNsYXJlIG1vZHVsZSAnQHBlYnVsYS9uZ3JpZC9jb3JlL2xpYi9jb25maWd1cmF0aW9uL3R5cGUnIHtcbiAgaW50ZXJmYWNlIFBibE5ncmlkQ29uZmlnIHtcbiAgICBzdGlja3lQbHVnaW4/OiB7XG4gICAgICBoZWFkZXJzPzogQXJyYXk8J3RhYmxlJyB8IG51bWJlcj47XG4gICAgICBmb290ZXJzPzogQXJyYXk8J3RhYmxlJyB8IG51bWJlcj47XG4gICAgICBjb2x1bW5TdGFydD86IEFycmF5PHN0cmluZyB8IG51bWJlcj47XG4gICAgICBjb2x1bW5FbmQ/OiBBcnJheTxzdHJpbmcgfCBudW1iZXI+O1xuICAgIH1cbiAgfVxufVxuXG5jb25zdCBNQVBQRVIgPSA8VD4odjogVCk6IFtULCBib29sZWFuXSA9PiBbdiwgdHJ1ZV07XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFsgQ29tbW9uTW9kdWxlLCBDZGtUYWJsZU1vZHVsZSwgUGJsTmdyaWRNb2R1bGUgXSxcbiAgZGVjbGFyYXRpb25zOiBbIFBibE5ncmlkU3RpY2t5UGx1Z2luRGlyZWN0aXZlIF0sXG4gIGV4cG9ydHM6IFsgUGJsTmdyaWRTdGlja3lQbHVnaW5EaXJlY3RpdmUgXSxcbn0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRTdGlja3lNb2R1bGUge1xuXG4gIHN0YXRpYyByZWFkb25seSBOR1JJRF9QTFVHSU4gPSBuZ3JpZFBsdWdpbih7IGlkOiBQTFVHSU5fS0VZIH0sIFBibE5ncmlkU3RpY2t5UGx1Z2luRGlyZWN0aXZlKTtcblxuICBjb25zdHJ1Y3Rvcihjb25maWdTZXJ2aWNlOiBQYmxOZ3JpZENvbmZpZ1NlcnZpY2UpIHtcbiAgICBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIub25DcmVhdGVkU2FmZShcbiAgICAgIFBibE5ncmlkU3RpY2t5TW9kdWxlLFxuICAgICAgKGdyaWQsIGNvbnRyb2xsZXIpID0+IHtcbiAgICAgICAgaWYgKGNvbnRyb2xsZXIgJiYgIWNvbnRyb2xsZXIuaGFzUGx1Z2luKCdzdGlja3knKSkge1xuICAgICAgICAgIGNvbnRyb2xsZXIub25Jbml0KClcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBzdGlja3lQbHVnaW5Db25maWcgPSBjb25maWdTZXJ2aWNlLmdldCgnc3RpY2t5UGx1Z2luJyk7XG4gICAgICAgICAgICAgIGlmIChzdGlja3lQbHVnaW5Db25maWcpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RpY2t5UGx1Z2luQ29uZmlnLmhlYWRlcnMpIHtcbiAgICAgICAgICAgICAgICAgIHNldFN0aWNreVJvdyhncmlkLCAnaGVhZGVyJywgc3RpY2t5UGx1Z2luQ29uZmlnLmhlYWRlcnMubWFwKE1BUFBFUikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3RpY2t5UGx1Z2luQ29uZmlnLmZvb3RlcnMpIHtcbiAgICAgICAgICAgICAgICAgIHNldFN0aWNreVJvdyhncmlkLCAnZm9vdGVyJywgc3RpY2t5UGx1Z2luQ29uZmlnLmZvb3RlcnMubWFwKE1BUFBFUikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3RpY2t5UGx1Z2luQ29uZmlnLmNvbHVtblN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICBzZXRTdGlja3lDb2x1bW5zKGdyaWQsICdzdGFydCcsIHN0aWNreVBsdWdpbkNvbmZpZy5jb2x1bW5TdGFydC5tYXAoTUFQUEVSKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzdGlja3lQbHVnaW5Db25maWcuY29sdW1uRW5kKSB7XG4gICAgICAgICAgICAgICAgICBzZXRTdGlja3lDb2x1bW5zKGdyaWQsICdlbmQnLCBzdGlja3lQbHVnaW5Db25maWcuY29sdW1uRW5kLm1hcChNQVBQRVIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICk7XG4gIH1cbn1cbiJdfQ==