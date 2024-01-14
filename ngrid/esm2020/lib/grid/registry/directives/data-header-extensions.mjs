import { Directive, TemplateRef, Input } from '@angular/core';
import { PblNgridRegistryService } from '../../registry/registry.service';
import { MetaCellContext } from '../../context/index';
import { PblNgridMultiTemplateRegistry } from './multi-template.directives';
import * as i0 from "@angular/core";
import * as i1 from "../../registry/registry.service";
export class PblNgridDataHeaderExtensionContext extends MetaCellContext {
    constructor() { super(); }
    // workaround, we need a parameter-less constructor since @ngtools/webpack@8.0.4
    // Non @Injectable classes are now getting addded with hard reference to the ctor params which at the class creation point are undefined
    // forwardRef() will not help since it's not inject by angular, we instantiate the class..
    // probably due to https://github.com/angular/angular-cli/commit/639198499973e0f437f059b3c933c72c733d93d8
    static createDateHeaderCtx(headerCell, injector) {
        const instance = new PblNgridDataHeaderExtensionContext();
        instance.col = headerCell.columnDef.column;
        instance.grid = headerCell.grid;
        Object.defineProperty(instance, 'injector', { value: injector });
        return instance;
    }
}
/**
 * A generic, multi-purpose template reference for data header extensions.
 * The template's context is `PblNgridDataHeaderExtensionContext`:
 *
 * ```ts
 * interface PblNgridDataHeaderExtensionContext {
 *   col: PblMetaColumn;
 *   grid: PblNgridComponent<any>;
 *   injector: Injector;
 * }
 * ```
 *
 * By default it will render if registered but it is possible to provide a predicate to conditionally load it.
 *
 * ```html
 * <div *pblNgridHeaderExtensionRef="let ctx"></div>
 * ````
 *
 * Or with a `shouldRender` predicate:
 *
 * ```html
 * <div *pblNgridHeaderExtensionRef="shouldRender; let ctx"></div>
 * ```
 *
 * And in the component the template is defined on:
 *
 * ```ts
 * class MyComponent {
 *
 *   shouldRender = (context: PblNgridDataHeaderExtensionContext) => {
 *     // Some code returning true or false
 *   }
 * }
 * ```
 *
 * Note that the `shouldRender` predicate is run once when the header initialize.
 */
export class PblNgridHeaderExtensionRefDirective extends PblNgridMultiTemplateRegistry {
    constructor(tRef, registry) {
        super(tRef, registry);
        this.name = 'genericHeaderExtension-' + PblNgridHeaderExtensionRefDirective._id++;
        this.kind = 'dataHeaderExtensions';
    }
}
PblNgridHeaderExtensionRefDirective._id = 0;
/** @nocollapse */ PblNgridHeaderExtensionRefDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHeaderExtensionRefDirective, deps: [{ token: i0.TemplateRef }, { token: i1.PblNgridRegistryService }], target: i0.ɵɵFactoryTarget.Directive });
/** @nocollapse */ PblNgridHeaderExtensionRefDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.4", type: PblNgridHeaderExtensionRefDirective, selector: "[pblNgridHeaderExtensionRef]", inputs: { shouldRender: ["pblNgridHeaderExtensionRef", "shouldRender"] }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridHeaderExtensionRefDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[pblNgridHeaderExtensionRef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }, { type: i1.PblNgridRegistryService }]; }, propDecorators: { shouldRender: [{
                type: Input,
                args: ['pblNgridHeaderExtensionRef']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1oZWFkZXItZXh0ZW5zaW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL3JlZ2lzdHJ5L2RpcmVjdGl2ZXMvZGF0YS1oZWFkZXItZXh0ZW5zaW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBWSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFeEUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFMUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRXRELE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxNQUFNLDZCQUE2QixDQUFDOzs7QUFHNUUsTUFBTSxPQUFPLGtDQUE0QyxTQUFRLGVBQTZCO0lBRzVGLGdCQUEwQixLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFcEMsZ0ZBQWdGO0lBQ2hGLHdJQUF3STtJQUN4SSwwRkFBMEY7SUFDMUYseUdBQXlHO0lBQ3pHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBVSxVQUFrRCxFQUFFLFFBQWtCO1FBQ3hHLE1BQU0sUUFBUSxHQUFHLElBQUksa0NBQWtDLEVBQUssQ0FBQztRQUU3RCxRQUFRLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQzNDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztRQUNoQyxNQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNqRSxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0NBQ0Y7QUFPRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0NHO0FBRUgsTUFBTSxPQUFPLG1DQUFvQyxTQUFRLDZCQUF5RjtJQVFoSixZQUFZLElBQXFELEVBQUUsUUFBaUM7UUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBTHJILFNBQUksR0FBVyx5QkFBeUIsR0FBRyxtQ0FBbUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyRixTQUFJLEdBQTJCLHNCQUFzQixDQUFDO0lBSWdFLENBQUM7O0FBUGpILHVDQUFHLEdBQUcsQ0FBQyxDQUFDO21KQURaLG1DQUFtQzt1SUFBbkMsbUNBQW1DOzJGQUFuQyxtQ0FBbUM7a0JBRC9DLFNBQVM7bUJBQUMsRUFBRSxRQUFRLEVBQUUsOEJBQThCLEVBQUU7d0lBT2hCLFlBQVk7c0JBQWhELEtBQUs7dUJBQUMsNEJBQTRCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBUZW1wbGF0ZVJlZiwgSW5qZWN0b3IsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IFBibE5ncmlkUmVnaXN0cnlTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vcmVnaXN0cnkvcmVnaXN0cnkuc2VydmljZSc7XG5pbXBvcnQgeyBQYmxDb2x1bW4gfSBmcm9tICcuLi8uLi9jb2x1bW4vbW9kZWwnO1xuaW1wb3J0IHsgTWV0YUNlbGxDb250ZXh0IH0gZnJvbSAnLi4vLi4vY29udGV4dC9pbmRleCc7XG5pbXBvcnQgeyBQYmxOZ3JpZEhlYWRlckNlbGxDb21wb25lbnQgfSBmcm9tICcuLi8uLi9jZWxsL2hlYWRlci1jZWxsLmNvbXBvbmVudCdcbmltcG9ydCB7IFBibE5ncmlkTXVsdGlUZW1wbGF0ZVJlZ2lzdHJ5IH0gZnJvbSAnLi9tdWx0aS10ZW1wbGF0ZS5kaXJlY3RpdmVzJztcbmltcG9ydCB7IFBibE5ncmlkTXVsdGlDb21wb25lbnRSZWdpc3RyeSB9IGZyb20gJy4vbXVsdGktY29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIFBibE5ncmlkRGF0YUhlYWRlckV4dGVuc2lvbkNvbnRleHQ8VCA9IGFueT4gZXh0ZW5kcyBNZXRhQ2VsbENvbnRleHQ8VCwgUGJsQ29sdW1uPiB7XG4gIHJlYWRvbmx5IGluamVjdG9yOiBJbmplY3RvclxuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoKTsgfVxuXG4gIC8vIHdvcmthcm91bmQsIHdlIG5lZWQgYSBwYXJhbWV0ZXItbGVzcyBjb25zdHJ1Y3RvciBzaW5jZSBAbmd0b29scy93ZWJwYWNrQDguMC40XG4gIC8vIE5vbiBASW5qZWN0YWJsZSBjbGFzc2VzIGFyZSBub3cgZ2V0dGluZyBhZGRkZWQgd2l0aCBoYXJkIHJlZmVyZW5jZSB0byB0aGUgY3RvciBwYXJhbXMgd2hpY2ggYXQgdGhlIGNsYXNzIGNyZWF0aW9uIHBvaW50IGFyZSB1bmRlZmluZWRcbiAgLy8gZm9yd2FyZFJlZigpIHdpbGwgbm90IGhlbHAgc2luY2UgaXQncyBub3QgaW5qZWN0IGJ5IGFuZ3VsYXIsIHdlIGluc3RhbnRpYXRlIHRoZSBjbGFzcy4uXG4gIC8vIHByb2JhYmx5IGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLWNsaS9jb21taXQvNjM5MTk4NDk5OTczZTBmNDM3ZjA1OWIzYzkzM2M3MmM3MzNkOTNkOFxuICBzdGF0aWMgY3JlYXRlRGF0ZUhlYWRlckN0eDxUID0gYW55PihoZWFkZXJDZWxsOiBQYmxOZ3JpZEhlYWRlckNlbGxDb21wb25lbnQ8UGJsQ29sdW1uPiwgaW5qZWN0b3I6IEluamVjdG9yKTogUGJsTmdyaWREYXRhSGVhZGVyRXh0ZW5zaW9uQ29udGV4dDxUPiB7XG4gICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgUGJsTmdyaWREYXRhSGVhZGVyRXh0ZW5zaW9uQ29udGV4dDxUPigpO1xuXG4gICAgaW5zdGFuY2UuY29sID0gaGVhZGVyQ2VsbC5jb2x1bW5EZWYuY29sdW1uO1xuICAgIGluc3RhbmNlLmdyaWQgPSBoZWFkZXJDZWxsLmdyaWQ7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGluc3RhbmNlLCAnaW5qZWN0b3InLCB7IHZhbHVlOiBpbmplY3RvciB9KTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYmxOZ3JpZERhdGFIZWFkZXJFeHRlbnNpb25SZWY8VCA9IGFueT4ge1xuICBzaG91bGRSZW5kZXI/KGNvbnRleHQ6IFBibE5ncmlkRGF0YUhlYWRlckV4dGVuc2lvbkNvbnRleHQ8VD4pOiBib29sZWFuO1xufVxuXG5cbi8qKlxuICogQSBnZW5lcmljLCBtdWx0aS1wdXJwb3NlIHRlbXBsYXRlIHJlZmVyZW5jZSBmb3IgZGF0YSBoZWFkZXIgZXh0ZW5zaW9ucy5cbiAqIFRoZSB0ZW1wbGF0ZSdzIGNvbnRleHQgaXMgYFBibE5ncmlkRGF0YUhlYWRlckV4dGVuc2lvbkNvbnRleHRgOlxuICpcbiAqIGBgYHRzXG4gKiBpbnRlcmZhY2UgUGJsTmdyaWREYXRhSGVhZGVyRXh0ZW5zaW9uQ29udGV4dCB7XG4gKiAgIGNvbDogUGJsTWV0YUNvbHVtbjtcbiAqICAgZ3JpZDogUGJsTmdyaWRDb21wb25lbnQ8YW55PjtcbiAqICAgaW5qZWN0b3I6IEluamVjdG9yO1xuICogfVxuICogYGBgXG4gKlxuICogQnkgZGVmYXVsdCBpdCB3aWxsIHJlbmRlciBpZiByZWdpc3RlcmVkIGJ1dCBpdCBpcyBwb3NzaWJsZSB0byBwcm92aWRlIGEgcHJlZGljYXRlIHRvIGNvbmRpdGlvbmFsbHkgbG9hZCBpdC5cbiAqXG4gKiBgYGBodG1sXG4gKiA8ZGl2ICpwYmxOZ3JpZEhlYWRlckV4dGVuc2lvblJlZj1cImxldCBjdHhcIj48L2Rpdj5cbiAqIGBgYGBcbiAqXG4gKiBPciB3aXRoIGEgYHNob3VsZFJlbmRlcmAgcHJlZGljYXRlOlxuICpcbiAqIGBgYGh0bWxcbiAqIDxkaXYgKnBibE5ncmlkSGVhZGVyRXh0ZW5zaW9uUmVmPVwic2hvdWxkUmVuZGVyOyBsZXQgY3R4XCI+PC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBBbmQgaW4gdGhlIGNvbXBvbmVudCB0aGUgdGVtcGxhdGUgaXMgZGVmaW5lZCBvbjpcbiAqXG4gKiBgYGB0c1xuICogY2xhc3MgTXlDb21wb25lbnQge1xuICpcbiAqICAgc2hvdWxkUmVuZGVyID0gKGNvbnRleHQ6IFBibE5ncmlkRGF0YUhlYWRlckV4dGVuc2lvbkNvbnRleHQpID0+IHtcbiAqICAgICAvLyBTb21lIGNvZGUgcmV0dXJuaW5nIHRydWUgb3IgZmFsc2VcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogTm90ZSB0aGF0IHRoZSBgc2hvdWxkUmVuZGVyYCBwcmVkaWNhdGUgaXMgcnVuIG9uY2Ugd2hlbiB0aGUgaGVhZGVyIGluaXRpYWxpemUuXG4gKi9cbkBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1twYmxOZ3JpZEhlYWRlckV4dGVuc2lvblJlZl0nIH0pXG5leHBvcnQgY2xhc3MgUGJsTmdyaWRIZWFkZXJFeHRlbnNpb25SZWZEaXJlY3RpdmUgZXh0ZW5kcyBQYmxOZ3JpZE11bHRpVGVtcGxhdGVSZWdpc3RyeTxQYmxOZ3JpZERhdGFIZWFkZXJFeHRlbnNpb25Db250ZXh0LCAnZGF0YUhlYWRlckV4dGVuc2lvbnMnPiBpbXBsZW1lbnRzIFBibE5ncmlkRGF0YUhlYWRlckV4dGVuc2lvblJlZiB7XG4gIHByaXZhdGUgc3RhdGljIF9pZCA9IDA7XG5cbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nID0gJ2dlbmVyaWNIZWFkZXJFeHRlbnNpb24tJyArIFBibE5ncmlkSGVhZGVyRXh0ZW5zaW9uUmVmRGlyZWN0aXZlLl9pZCsrO1xuICByZWFkb25seSBraW5kOiAnZGF0YUhlYWRlckV4dGVuc2lvbnMnID0gJ2RhdGFIZWFkZXJFeHRlbnNpb25zJztcblxuICBASW5wdXQoJ3BibE5ncmlkSGVhZGVyRXh0ZW5zaW9uUmVmJykgc2hvdWxkUmVuZGVyPzogKGNvbnRleHQ6IFBibE5ncmlkRGF0YUhlYWRlckV4dGVuc2lvbkNvbnRleHQpID0+IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IodFJlZjogVGVtcGxhdGVSZWY8UGJsTmdyaWREYXRhSGVhZGVyRXh0ZW5zaW9uQ29udGV4dD4sIHJlZ2lzdHJ5OiBQYmxOZ3JpZFJlZ2lzdHJ5U2VydmljZSkgeyBzdXBlcih0UmVmLCByZWdpc3RyeSk7IH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2hvdWxkUmVuZGVyOiBzdHJpbmcgfCAoIChjb250ZXh0OiBQYmxOZ3JpZERhdGFIZWFkZXJFeHRlbnNpb25Db250ZXh0KSA9PiBib29sZWFuICk7XG59XG5cbmRlY2xhcmUgbW9kdWxlICdAcGVidWxhL25ncmlkL2NvcmUvbGliL3JlZ2lzdHJ5L3R5cGVzJyB7XG4gIGludGVyZmFjZSBQYmxOZ3JpZE11bHRpUmVnaXN0cnlNYXAge1xuICAgIGRhdGFIZWFkZXJFeHRlbnNpb25zPzogKFBibE5ncmlkTXVsdGlUZW1wbGF0ZVJlZ2lzdHJ5PFBibE5ncmlkRGF0YUhlYWRlckV4dGVuc2lvbkNvbnRleHQsICdkYXRhSGVhZGVyRXh0ZW5zaW9ucyc+ICYgUGJsTmdyaWREYXRhSGVhZGVyRXh0ZW5zaW9uUmVmKVxuICAgICAgfCAoUGJsTmdyaWRNdWx0aUNvbXBvbmVudFJlZ2lzdHJ5PGFueSwgJ2RhdGFIZWFkZXJFeHRlbnNpb25zJz4gJiBQYmxOZ3JpZERhdGFIZWFkZXJFeHRlbnNpb25SZWYpO1xuICB9XG59XG4iXX0=