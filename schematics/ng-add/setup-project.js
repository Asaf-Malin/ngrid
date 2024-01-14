"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const theming_1 = require("./theming/theming");
function ngAddSetupProject(options) {
    const { project } = options;
    return (0, schematics_1.chain)([
        ...options.externalSchematics.map(p => {
            switch (p) {
                case '@angular/cdk':
                    return (0, schematics_1.externalSchematic)('@angular/cdk', 'ng-add', { name: project });
                case '@ng-bootstrap/ng-bootstrap':
                    return (0, schematics_1.externalSchematic)('@ng-bootstrap/ng-bootstrap', 'ng-add', { project });
                case '@angular/material':
                    return (0, schematics_1.externalSchematic)('@angular/material', 'ng-add', { name: project });
                default:
                    throw new Error(`Invalid external schematic ${p}`);
            }
        }),
        (0, theming_1.addThemeToAppStyles)(options),
    ]);
}
exports.default = ngAddSetupProject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAtcHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc2NoZW1hdGljcy9uZy1hZGQvc2V0dXAtcHJvamVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJEQUE0RTtBQUc1RSwrQ0FBd0Q7QUFFeEQsU0FBd0IsaUJBQWlCLENBQUMsT0FBb0I7SUFFNUQsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUM1QixPQUFPLElBQUEsa0JBQUssRUFBQztRQUNYLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUMsRUFBRTtZQUNyQyxRQUFRLENBQUMsRUFBRTtnQkFDVCxLQUFLLGNBQWM7b0JBQ2pCLE9BQU8sSUFBQSw4QkFBaUIsRUFBQyxjQUFjLEVBQUUsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7Z0JBQ3ZFLEtBQUssNEJBQTRCO29CQUMvQixPQUFPLElBQUEsOEJBQWlCLEVBQUMsNEJBQTRCLEVBQUUsUUFBUSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtnQkFDL0UsS0FBSyxtQkFBbUI7b0JBQ3RCLE9BQU8sSUFBQSw4QkFBaUIsRUFBQyxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtnQkFDNUU7b0JBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN0RDtRQUNILENBQUMsQ0FBQztRQUNGLElBQUEsNkJBQW1CLEVBQUMsT0FBTyxDQUFDO0tBQzdCLENBQUMsQ0FBQztBQUNMLENBQUM7QUFsQkQsb0NBa0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY2hhaW4sIFJ1bGUsIGV4dGVybmFsU2NoZW1hdGljIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuXG5pbXBvcnQgeyBTZXR1cFNjaGVtYSB9IGZyb20gJy4vc2V0dXAtc2NoZW1hJztcbmltcG9ydCB7IGFkZFRoZW1lVG9BcHBTdHlsZXMgfSBmcm9tICcuL3RoZW1pbmcvdGhlbWluZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5nQWRkU2V0dXBQcm9qZWN0KG9wdGlvbnM6IFNldHVwU2NoZW1hKTogUnVsZSB7XG5cbiAgY29uc3QgeyBwcm9qZWN0IH0gPSBvcHRpb25zO1xuICByZXR1cm4gY2hhaW4oW1xuICAgIC4uLm9wdGlvbnMuZXh0ZXJuYWxTY2hlbWF0aWNzLm1hcCggcCA9PiB7XG4gICAgICBzd2l0Y2ggKHApIHtcbiAgICAgICAgY2FzZSAnQGFuZ3VsYXIvY2RrJzpcbiAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxTY2hlbWF0aWMoJ0Bhbmd1bGFyL2NkaycsICduZy1hZGQnLCB7IG5hbWU6IHByb2plY3QgfSlcbiAgICAgICAgY2FzZSAnQG5nLWJvb3RzdHJhcC9uZy1ib290c3RyYXAnOlxuICAgICAgICAgIHJldHVybiBleHRlcm5hbFNjaGVtYXRpYygnQG5nLWJvb3RzdHJhcC9uZy1ib290c3RyYXAnLCAnbmctYWRkJywgeyBwcm9qZWN0IH0pXG4gICAgICAgIGNhc2UgJ0Bhbmd1bGFyL21hdGVyaWFsJzpcbiAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxTY2hlbWF0aWMoJ0Bhbmd1bGFyL21hdGVyaWFsJywgJ25nLWFkZCcsIHsgbmFtZTogcHJvamVjdCB9KVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBleHRlcm5hbCBzY2hlbWF0aWMgJHtwfWApO1xuICAgICAgfVxuICAgIH0pLFxuICAgIGFkZFRoZW1lVG9BcHBTdHlsZXMob3B0aW9ucyksXG4gIF0pO1xufVxuIl19