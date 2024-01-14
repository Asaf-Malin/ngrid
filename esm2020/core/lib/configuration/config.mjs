import { ReplaySubject } from 'rxjs';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import * as i0 from "@angular/core";
const DEFAULT_TABLE_CONFIG = {
    showHeader: true,
    showFooter: false,
    noFiller: false,
    clearContextOnSourceChanging: false,
};
export const PEB_NGRID_CONFIG = new InjectionToken('PEB_NGRID_CONFIG');
export class PblNgridConfigService {
    constructor(_config) {
        this.config = new Map();
        this.configNotify = new Map();
        if (_config) {
            for (const key of Object.keys(_config)) {
                this.config.set(key, _config[key]);
            }
        }
        const gridConfig = this.config.get('table') || {};
        this.config.set('table', {
            ...DEFAULT_TABLE_CONFIG,
            ...gridConfig,
        });
    }
    has(section) {
        return this.config.has(section);
    }
    get(section, fallback) {
        return this.config.get(section) || fallback;
    }
    set(section, value) {
        const prev = this.get(section);
        value = Object.assign({}, value);
        Object.freeze(value);
        this.config.set(section, value);
        this.notify(section, value, prev);
    }
    onUpdate(section) {
        return this.getGetNotifier(section);
    }
    getGetNotifier(section) {
        let notifier = this.configNotify.get(section);
        if (!notifier) {
            this.configNotify.set(section, notifier = new ReplaySubject(1));
        }
        return notifier;
    }
    notify(section, curr, prev) {
        this.getGetNotifier(section).next({ curr, prev });
    }
}
/** @nocollapse */ PblNgridConfigService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridConfigService, deps: [{ token: PEB_NGRID_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ PblNgridConfigService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridConfigService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridConfigService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [PEB_NGRID_CONFIG]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9jb3JlL3NyYy9saWIvY29uZmlndXJhdGlvbi9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFjLGFBQWEsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNqRCxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDOztBQUc3RSxNQUFNLG9CQUFvQixHQUE0QjtJQUNwRCxVQUFVLEVBQUUsSUFBSTtJQUNoQixVQUFVLEVBQUUsS0FBSztJQUNqQixRQUFRLEVBQUUsS0FBSztJQUNmLDRCQUE0QixFQUFFLEtBQUs7Q0FDcEMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLElBQUksY0FBYyxDQUFpQixrQkFBa0IsQ0FBQyxDQUFDO0FBR3ZGLE1BQU0sT0FBTyxxQkFBcUI7SUFLaEMsWUFBa0QsT0FBdUI7UUFIakUsV0FBTSxHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO1FBQzlDLGlCQUFZLEdBQUcsSUFBSSxHQUFHLEVBQTRDLENBQUM7UUFHekUsSUFBSSxPQUFPLEVBQUU7WUFDWCxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxNQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUM3QztTQUNGO1FBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRTtZQUN2QixHQUFHLG9CQUFvQjtZQUN2QixHQUFHLFVBQVU7U0FDZCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsR0FBRyxDQUFDLE9BQTZCO1FBQy9CLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELEdBQUcsQ0FBaUMsT0FBVSxFQUFFLFFBQXFDO1FBQ25GLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksUUFBUSxDQUFDO0lBQzlDLENBQUM7SUFFRCxHQUFHLENBQWlDLE9BQVUsRUFBRSxLQUF3QjtRQUN0RSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9CLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELFFBQVEsQ0FBaUMsT0FBVTtRQUNqRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVPLGNBQWMsQ0FBaUMsT0FBVTtRQUMvRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2IsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFFBQVEsR0FBRyxJQUFJLGFBQWEsQ0FBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RFO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVPLE1BQU0sQ0FBaUMsT0FBVSxFQUFFLElBQXVCLEVBQUUsSUFBdUI7UUFDekcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNwRCxDQUFDOztxSUFqRFUscUJBQXFCLGtCQUtBLGdCQUFnQjt5SUFMckMscUJBQXFCLGNBRFIsTUFBTTsyRkFDbkIscUJBQXFCO2tCQURqQyxVQUFVO21CQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTs7MEJBTW5CLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT2JzZXJ2YWJsZSwgUmVwbGF5U3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgT3B0aW9uYWwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBibE5ncmlkQ29uZmlnIH0gZnJvbSAnLi90eXBlJztcblxuY29uc3QgREVGQVVMVF9UQUJMRV9DT05GSUc6IFBibE5ncmlkQ29uZmlnWyd0YWJsZSddID0ge1xuICBzaG93SGVhZGVyOiB0cnVlLFxuICBzaG93Rm9vdGVyOiBmYWxzZSxcbiAgbm9GaWxsZXI6IGZhbHNlLFxuICBjbGVhckNvbnRleHRPblNvdXJjZUNoYW5naW5nOiBmYWxzZSxcbn07XG5cbmV4cG9ydCBjb25zdCBQRUJfTkdSSURfQ09ORklHID0gbmV3IEluamVjdGlvblRva2VuPFBibE5ncmlkQ29uZmlnPignUEVCX05HUklEX0NPTkZJRycpO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIFBibE5ncmlkQ29uZmlnU2VydmljZSB7XG5cbiAgcHJpdmF0ZSBjb25maWcgPSBuZXcgTWFwPGtleW9mIFBibE5ncmlkQ29uZmlnLCBhbnk+KCk7XG4gIHByaXZhdGUgY29uZmlnTm90aWZ5ID0gbmV3IE1hcDxrZXlvZiBQYmxOZ3JpZENvbmZpZywgUmVwbGF5U3ViamVjdDxhbnk+PigpO1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBJbmplY3QoUEVCX05HUklEX0NPTkZJRykgX2NvbmZpZzogUGJsTmdyaWRDb25maWcpIHtcbiAgICBpZiAoX2NvbmZpZykge1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoX2NvbmZpZykpIHtcbiAgICAgICAgKHRoaXMuY29uZmlnIGFzIGFueSkuc2V0KGtleSwgX2NvbmZpZ1trZXldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBncmlkQ29uZmlnID0gdGhpcy5jb25maWcuZ2V0KCd0YWJsZScpIHx8IHt9O1xuICAgIHRoaXMuY29uZmlnLnNldCgndGFibGUnLCB7XG4gICAgICAuLi5ERUZBVUxUX1RBQkxFX0NPTkZJRyxcbiAgICAgIC4uLmdyaWRDb25maWcsXG4gICAgfSk7XG4gIH1cblxuICBoYXMoc2VjdGlvbjoga2V5b2YgUGJsTmdyaWRDb25maWcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuaGFzKHNlY3Rpb24pO1xuICB9XG5cbiAgZ2V0PFQgZXh0ZW5kcyBrZXlvZiBQYmxOZ3JpZENvbmZpZz4oc2VjdGlvbjogVCwgZmFsbGJhY2s/OiBQYXJ0aWFsPFBibE5ncmlkQ29uZmlnW1RdPik6IFBibE5ncmlkQ29uZmlnW1RdIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuZ2V0KHNlY3Rpb24pIHx8IGZhbGxiYWNrO1xuICB9XG5cbiAgc2V0PFQgZXh0ZW5kcyBrZXlvZiBQYmxOZ3JpZENvbmZpZz4oc2VjdGlvbjogVCwgdmFsdWU6IFBibE5ncmlkQ29uZmlnW1RdKTogdm9pZCB7XG4gICAgY29uc3QgcHJldiA9IHRoaXMuZ2V0KHNlY3Rpb24pO1xuICAgIHZhbHVlID0gT2JqZWN0LmFzc2lnbih7fSwgdmFsdWUpO1xuICAgIE9iamVjdC5mcmVlemUodmFsdWUpO1xuICAgIHRoaXMuY29uZmlnLnNldChzZWN0aW9uLCB2YWx1ZSk7XG4gICAgdGhpcy5ub3RpZnkoc2VjdGlvbiwgdmFsdWUsIHByZXYpO1xuICB9XG5cbiAgb25VcGRhdGU8VCBleHRlbmRzIGtleW9mIFBibE5ncmlkQ29uZmlnPihzZWN0aW9uOiBUKTogT2JzZXJ2YWJsZTx7IGN1cnI6IFBibE5ncmlkQ29uZmlnW1RdOyBwcmV2OiBQYmxOZ3JpZENvbmZpZ1tUXSB8IHVuZGVmaW5lZDsgfT4ge1xuICAgIHJldHVybiB0aGlzLmdldEdldE5vdGlmaWVyKHNlY3Rpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRHZXROb3RpZmllcjxUIGV4dGVuZHMga2V5b2YgUGJsTmdyaWRDb25maWc+KHNlY3Rpb246IFQpOiBSZXBsYXlTdWJqZWN0PGFueT4ge1xuICAgIGxldCBub3RpZmllciA9IHRoaXMuY29uZmlnTm90aWZ5LmdldChzZWN0aW9uKTtcbiAgICBpZiAoIW5vdGlmaWVyKSB7XG4gICAgICB0aGlzLmNvbmZpZ05vdGlmeS5zZXQoc2VjdGlvbiwgbm90aWZpZXIgPSBuZXcgUmVwbGF5U3ViamVjdDxhbnk+KDEpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vdGlmaWVyO1xuICB9XG5cbiAgcHJpdmF0ZSBub3RpZnk8VCBleHRlbmRzIGtleW9mIFBibE5ncmlkQ29uZmlnPihzZWN0aW9uOiBULCBjdXJyOiBQYmxOZ3JpZENvbmZpZ1tUXSwgcHJldjogUGJsTmdyaWRDb25maWdbVF0pOiB2b2lkIHtcbiAgICB0aGlzLmdldEdldE5vdGlmaWVyKHNlY3Rpb24pLm5leHQoeyBjdXJyLCBwcmV2IH0pO1xuICB9XG59XG4iXX0=