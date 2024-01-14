"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const workspace_1 = require("@schematics/angular/utility/workspace");
const workspace_models_1 = require("@schematics/angular/utility/workspace-models");
const meta = require("./metadata");
const messages = require("./messages");
const package_config_1 = require("../utils/package-config");
function getNgridPackageName(packageName) {
    return `@pebula/${packageName}`;
}
function ngAdd(options) {
    return (tree, context) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const workspace = yield (0, workspace_1.getWorkspace)(tree);
        const project = options.project || workspace.extensions.defaultProject;
        const uiPlugin = options.uiPlugin || 'none';
        const theme = options.theme || 'light';
        const projectWorkspace = workspace.projects.get(project);
        if (!projectWorkspace) {
            throw new schematics_1.SchematicsException(messages.noProject(project));
        }
        const setupSchema = {
            project,
            uiPlugin,
            theme,
            externalSchematics: [],
        };
        // Installing dependencies
        const angularCdkVersion = (0, package_config_1.getPackageVersionFromPackageJson)(tree, '@angular/cdk');
        if (angularCdkVersion === null) {
            (0, package_config_1.addPackageToPackageJson)(tree, '@angular/cdk', meta.NG_MATERIAL_VERSION);
            setupSchema.externalSchematics.push('@angular/cdk');
        }
        (0, package_config_1.addPackageToPackageJson)(tree, getNgridPackageName('ngrid'), `^${meta.NGRID_VERSION}`);
        switch (uiPlugin) {
            case 'bootstrap':
                const ngBootstrapVersion = (0, package_config_1.getPackageVersionFromPackageJson)(tree, '@ng-bootstrap/ng-bootstrap');
                if (ngBootstrapVersion === null) {
                    (0, package_config_1.addPackageToPackageJson)(tree, '@ng-bootstrap/ng-bootstrap', meta.NG_BOOTSTRAP_VERSION);
                    setupSchema.externalSchematics.push('@ng-bootstrap/ng-bootstrap');
                }
                (0, package_config_1.addPackageToPackageJson)(tree, getNgridPackageName('ngrid-bootstrap'), `^${meta.NGRID_VERSION}`);
                break;
            case 'material':
                const ngMaterialVersion = (0, package_config_1.getPackageVersionFromPackageJson)(tree, '@angular/material');
                if (ngMaterialVersion === null) {
                    (0, package_config_1.addPackageToPackageJson)(tree, '@angular/material', meta.NG_MATERIAL_VERSION);
                    setupSchema.externalSchematics.push('@angular/material');
                }
                (0, package_config_1.addPackageToPackageJson)(tree, getNgridPackageName('ngrid-material'), `^${meta.NGRID_VERSION}`);
                break;
        }
        const installTaskId = context.addTask(new tasks_1.NodePackageInstallTask());
        if (projectWorkspace.extensions.projectType === workspace_models_1.ProjectType.Application) {
            context.addTask(new tasks_1.RunSchematicTask('ng-add-setup-project', setupSchema), [installTaskId]);
        }
    });
}
exports.default = ngAdd;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NjaGVtYXRpY3MvbmctYWRkL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJEQUErRjtBQUMvRiw0REFBNEY7QUFDNUYscUVBQXFFO0FBQ3JFLG1GQUEyRTtBQUUzRSxtQ0FBbUM7QUFHbkMsdUNBQXVDO0FBQ3ZDLDREQUFvRztBQUVwRyxTQUFTLG1CQUFtQixDQUFDLFdBQW1CO0lBQzlDLE9BQU8sV0FBVyxXQUFXLEVBQUUsQ0FBQztBQUNsQyxDQUFDO0FBRUQsU0FBd0IsS0FBSyxDQUFDLE9BQWU7SUFDM0MsT0FBTyxDQUFNLElBQVUsRUFBRSxPQUF5QixFQUFFLEVBQUU7UUFDcEQsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLHdCQUFZLEVBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLGNBQXdCLENBQUM7UUFDakYsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUM7UUFDNUMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUM7UUFFdkMsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV6RCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDckIsTUFBTSxJQUFJLGdDQUFtQixDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUM1RDtRQUVELE1BQU0sV0FBVyxHQUFnQjtZQUMvQixPQUFPO1lBQ1AsUUFBUTtZQUNSLEtBQUs7WUFDTCxrQkFBa0IsRUFBRSxFQUFFO1NBQ3ZCLENBQUM7UUFFRiwwQkFBMEI7UUFDMUIsTUFBTSxpQkFBaUIsR0FBRyxJQUFBLGlEQUFnQyxFQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUVqRixJQUFJLGlCQUFpQixLQUFLLElBQUksRUFBRTtZQUM5QixJQUFBLHdDQUF1QixFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDeEUsV0FBVyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUNyRDtRQUVELElBQUEsd0NBQXVCLEVBQUMsSUFBSSxFQUFFLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFFdEYsUUFBUSxRQUFRLEVBQUU7WUFDaEIsS0FBSyxXQUFXO2dCQUNkLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSxpREFBZ0MsRUFBQyxJQUFJLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztnQkFDaEcsSUFBSSxrQkFBa0IsS0FBSyxJQUFJLEVBQUU7b0JBQy9CLElBQUEsd0NBQXVCLEVBQUMsSUFBSSxFQUFFLDRCQUE0QixFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUN2RixXQUFXLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7aUJBQ25FO2dCQUNELElBQUEsd0NBQXVCLEVBQUMsSUFBSSxFQUFFLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztnQkFDaEcsTUFBTTtZQUNSLEtBQUssVUFBVTtnQkFDYixNQUFNLGlCQUFpQixHQUFHLElBQUEsaURBQWdDLEVBQUMsSUFBSSxFQUFFLG1CQUFtQixDQUFDLENBQUM7Z0JBQ3RGLElBQUksaUJBQWlCLEtBQUssSUFBSSxFQUFFO29CQUM5QixJQUFBLHdDQUF1QixFQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztvQkFDN0UsV0FBVyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2lCQUMxRDtnQkFDRCxJQUFBLHdDQUF1QixFQUFDLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7Z0JBQy9GLE1BQU07U0FDVDtRQUVELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSw4QkFBc0IsRUFBRSxDQUFDLENBQUM7UUFFcEUsSUFBSSxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsV0FBVyxLQUFLLDhCQUFXLENBQUMsV0FBVyxFQUFFO1lBQ3ZFLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSx3QkFBZ0IsQ0FBQyxzQkFBc0IsRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFFLGFBQWEsQ0FBRSxDQUFDLENBQUM7U0FDL0Y7SUFDSCxDQUFDLENBQUEsQ0FBQztBQUNKLENBQUM7QUF2REQsd0JBdURDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUnVsZSwgU2NoZW1hdGljQ29udGV4dCwgU2NoZW1hdGljc0V4Y2VwdGlvbiwgVHJlZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2ssIFJ1blNjaGVtYXRpY1Rhc2sgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90YXNrcyc7XG5pbXBvcnQgeyBnZXRXb3Jrc3BhY2UgfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvd29ya3NwYWNlJztcbmltcG9ydCB7IFByb2plY3RUeXBlIH0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3dvcmtzcGFjZS1tb2RlbHMnO1xuXG5pbXBvcnQgKiBhcyBtZXRhIGZyb20gJy4vbWV0YWRhdGEnO1xuaW1wb3J0IHsgU2NoZW1hIH0gZnJvbSAnLi9zY2hlbWEnO1xuaW1wb3J0IHsgU2V0dXBTY2hlbWEgfSBmcm9tICcuL3NldHVwLXNjaGVtYSc7XG5pbXBvcnQgKiBhcyBtZXNzYWdlcyBmcm9tICcuL21lc3NhZ2VzJztcbmltcG9ydCB7IGFkZFBhY2thZ2VUb1BhY2thZ2VKc29uLCBnZXRQYWNrYWdlVmVyc2lvbkZyb21QYWNrYWdlSnNvbiB9IGZyb20gJy4uL3V0aWxzL3BhY2thZ2UtY29uZmlnJztcblxuZnVuY3Rpb24gZ2V0TmdyaWRQYWNrYWdlTmFtZShwYWNrYWdlTmFtZTogc3RyaW5nKSB7XG4gIHJldHVybiBgQHBlYnVsYS8ke3BhY2thZ2VOYW1lfWA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5nQWRkKG9wdGlvbnM6IFNjaGVtYSk6IFJ1bGUge1xuICByZXR1cm4gYXN5bmModHJlZTogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGNvbnN0IHdvcmtzcGFjZSA9IGF3YWl0IGdldFdvcmtzcGFjZSh0cmVlKTtcbiAgICBjb25zdCBwcm9qZWN0ID0gb3B0aW9ucy5wcm9qZWN0IHx8IHdvcmtzcGFjZS5leHRlbnNpb25zLmRlZmF1bHRQcm9qZWN0IGFzIHN0cmluZztcbiAgICBjb25zdCB1aVBsdWdpbiA9IG9wdGlvbnMudWlQbHVnaW4gfHwgJ25vbmUnO1xuICAgIGNvbnN0IHRoZW1lID0gb3B0aW9ucy50aGVtZSB8fCAnbGlnaHQnO1xuXG4gICAgY29uc3QgcHJvamVjdFdvcmtzcGFjZSA9IHdvcmtzcGFjZS5wcm9qZWN0cy5nZXQocHJvamVjdCk7XG5cbiAgICBpZiAoIXByb2plY3RXb3Jrc3BhY2UpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKG1lc3NhZ2VzLm5vUHJvamVjdChwcm9qZWN0KSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2V0dXBTY2hlbWE6IFNldHVwU2NoZW1hID0ge1xuICAgICAgcHJvamVjdCxcbiAgICAgIHVpUGx1Z2luLFxuICAgICAgdGhlbWUsXG4gICAgICBleHRlcm5hbFNjaGVtYXRpY3M6IFtdLFxuICAgIH07XG5cbiAgICAvLyBJbnN0YWxsaW5nIGRlcGVuZGVuY2llc1xuICAgIGNvbnN0IGFuZ3VsYXJDZGtWZXJzaW9uID0gZ2V0UGFja2FnZVZlcnNpb25Gcm9tUGFja2FnZUpzb24odHJlZSwgJ0Bhbmd1bGFyL2NkaycpO1xuXG4gICAgaWYgKGFuZ3VsYXJDZGtWZXJzaW9uID09PSBudWxsKSB7XG4gICAgICBhZGRQYWNrYWdlVG9QYWNrYWdlSnNvbih0cmVlLCAnQGFuZ3VsYXIvY2RrJywgbWV0YS5OR19NQVRFUklBTF9WRVJTSU9OKTtcbiAgICAgIHNldHVwU2NoZW1hLmV4dGVybmFsU2NoZW1hdGljcy5wdXNoKCdAYW5ndWxhci9jZGsnKTtcbiAgICB9XG5cbiAgICBhZGRQYWNrYWdlVG9QYWNrYWdlSnNvbih0cmVlLCBnZXROZ3JpZFBhY2thZ2VOYW1lKCduZ3JpZCcpLCBgXiR7bWV0YS5OR1JJRF9WRVJTSU9OfWApO1xuXG4gICAgc3dpdGNoICh1aVBsdWdpbikge1xuICAgICAgY2FzZSAnYm9vdHN0cmFwJzpcbiAgICAgICAgY29uc3QgbmdCb290c3RyYXBWZXJzaW9uID0gZ2V0UGFja2FnZVZlcnNpb25Gcm9tUGFja2FnZUpzb24odHJlZSwgJ0BuZy1ib290c3RyYXAvbmctYm9vdHN0cmFwJyk7XG4gICAgICAgIGlmIChuZ0Jvb3RzdHJhcFZlcnNpb24gPT09IG51bGwpIHtcbiAgICAgICAgICBhZGRQYWNrYWdlVG9QYWNrYWdlSnNvbih0cmVlLCAnQG5nLWJvb3RzdHJhcC9uZy1ib290c3RyYXAnLCBtZXRhLk5HX0JPT1RTVFJBUF9WRVJTSU9OKTtcbiAgICAgICAgICBzZXR1cFNjaGVtYS5leHRlcm5hbFNjaGVtYXRpY3MucHVzaCgnQG5nLWJvb3RzdHJhcC9uZy1ib290c3RyYXAnKTtcbiAgICAgICAgfVxuICAgICAgICBhZGRQYWNrYWdlVG9QYWNrYWdlSnNvbih0cmVlLCBnZXROZ3JpZFBhY2thZ2VOYW1lKCduZ3JpZC1ib290c3RyYXAnKSwgYF4ke21ldGEuTkdSSURfVkVSU0lPTn1gKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtYXRlcmlhbCc6XG4gICAgICAgIGNvbnN0IG5nTWF0ZXJpYWxWZXJzaW9uID0gZ2V0UGFja2FnZVZlcnNpb25Gcm9tUGFja2FnZUpzb24odHJlZSwgJ0Bhbmd1bGFyL21hdGVyaWFsJyk7XG4gICAgICAgIGlmIChuZ01hdGVyaWFsVmVyc2lvbiA9PT0gbnVsbCkge1xuICAgICAgICAgIGFkZFBhY2thZ2VUb1BhY2thZ2VKc29uKHRyZWUsICdAYW5ndWxhci9tYXRlcmlhbCcsIG1ldGEuTkdfTUFURVJJQUxfVkVSU0lPTik7XG4gICAgICAgICAgc2V0dXBTY2hlbWEuZXh0ZXJuYWxTY2hlbWF0aWNzLnB1c2goJ0Bhbmd1bGFyL21hdGVyaWFsJyk7XG4gICAgICAgIH1cbiAgICAgICAgYWRkUGFja2FnZVRvUGFja2FnZUpzb24odHJlZSwgZ2V0TmdyaWRQYWNrYWdlTmFtZSgnbmdyaWQtbWF0ZXJpYWwnKSwgYF4ke21ldGEuTkdSSURfVkVSU0lPTn1gKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgaW5zdGFsbFRhc2tJZCA9IGNvbnRleHQuYWRkVGFzayhuZXcgTm9kZVBhY2thZ2VJbnN0YWxsVGFzaygpKTtcblxuICAgIGlmIChwcm9qZWN0V29ya3NwYWNlLmV4dGVuc2lvbnMucHJvamVjdFR5cGUgPT09IFByb2plY3RUeXBlLkFwcGxpY2F0aW9uKSB7XG4gICAgICBjb250ZXh0LmFkZFRhc2sobmV3IFJ1blNjaGVtYXRpY1Rhc2soJ25nLWFkZC1zZXR1cC1wcm9qZWN0Jywgc2V0dXBTY2hlbWEpLCBbIGluc3RhbGxUYXNrSWQgXSk7XG4gICAgfVxuICB9O1xufVxuIl19