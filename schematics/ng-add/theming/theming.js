"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addThemeToAppStyles = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const schematics_2 = require("@angular/cdk/schematics");
const change_1 = require("@schematics/angular/utility/change");
const workspace_1 = require("@schematics/angular/utility/workspace");
const path_1 = require("path");
const create_custom_theme_1 = require("./create-custom-theme");
/** Path segment that can be found in paths that refer to a prebuilt theme. */
const prebuiltThemePathSegment = '@pebula/ngrid/themes';
/** Default file name of the custom theme that can be generated. */
const defaultCustomThemeFilename = 'custom-theme.scss';
/** Add pre-built styles to the main project style file. */
function addThemeToAppStyles(schema) {
    return (host, context) => {
        const themeName = schema.theme || 'light';
        return themeName === 'custom' ?
            insertCustomTheme(schema, host, context.logger) :
            insertPrebuiltTheme(schema, themeName, context.logger);
    };
}
exports.addThemeToAppStyles = addThemeToAppStyles;
/**
 * Insert a custom theme to project style file. If no valid style file could be found, a new
 * Scss file for the custom theme will be created.
 */
function insertCustomTheme(schema, host, logger) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const projectName = schema.project;
        const workspace = (yield (0, workspace_1.getWorkspace)(host));
        const project = (0, schematics_2.getProjectFromWorkspace)(workspace, projectName);
        const stylesPath = (0, schematics_2.getProjectStyleFile)(project, 'scss');
        const themeContent = (0, create_custom_theme_1.createCustomTheme)(projectName);
        if (!stylesPath) {
            if (!project.sourceRoot) {
                throw new schematics_1.SchematicsException(`Could not find source root for project: "${projectName}". ` +
                    `Please make sure that the "sourceRoot" property is set in the workspace config.`);
            }
            // Normalize the path through the devkit utilities because we want to avoid having
            // unnecessary path segments and windows backslash delimiters.
            const customThemePath = (0, core_1.normalize)((0, path_1.join)(project.sourceRoot, defaultCustomThemeFilename));
            if (host.exists(customThemePath)) {
                logger.warn(`Cannot create a custom Angular Material theme because
          ${customThemePath} already exists. Skipping custom theme generation.`);
                return (0, schematics_1.noop)();
            }
            host.create(customThemePath, themeContent);
            return addThemeStyleToTarget(schema, 'build', customThemePath, logger);
        }
        const insertion = new change_1.InsertChange(stylesPath, 0, themeContent);
        const recorder = host.beginUpdate(stylesPath);
        recorder.insertLeft(insertion.pos, insertion.toAdd);
        host.commitUpdate(recorder);
        return (0, schematics_1.noop)();
    });
}
/** Insert a pre-built theme into the angular.json file. */
function insertPrebuiltTheme(schema, theme, logger) {
    // Path needs to be always relative to the `package.json` or workspace root.
    const themePath = `./node_modules/@pebula/ngrid/themes/default-${theme}.css`;
    return (0, schematics_1.chain)([
        addThemeStyleToTarget(schema, 'build', themePath, logger),
        addThemeStyleToTarget(schema, 'test', themePath, logger)
    ]);
}
/** Adds a theming style entry to the given project target options. */
function addThemeStyleToTarget(schema, targetName, assetPath, logger) {
    return (0, workspace_1.updateWorkspace)(workspace => {
        const projectName = schema.project;
        const project = (0, schematics_2.getProjectFromWorkspace)(workspace, projectName);
        // Do not update the builder options in case the target does not use the default CLI builder.
        if (!validateDefaultTargetBuilder(project, targetName, logger)) {
            return;
        }
        const targetOptions = (0, schematics_2.getProjectTargetOptions)(project, targetName);
        const styles = targetOptions.styles;
        if (!styles) {
            targetOptions.styles = [assetPath];
        }
        else {
            const existingStyles = styles.map(s => typeof s === 'string' ? s : s.input);
            for (let [index, stylePath] of existingStyles.entries()) {
                // If the given asset is already specified in the styles, we don't need to do anything.
                if (stylePath === assetPath) {
                    return;
                }
                // In case a prebuilt theme is already set up, we can safely replace the theme with the new
                // theme file. If a custom theme is set up, we are not able to safely replace the custom
                // theme because these files can contain custom styles, while prebuilt themes are
                // always packaged and considered replaceable.
                if (stylePath.includes(defaultCustomThemeFilename)) {
                    logger.error(`Could not add the selected theme to the CLI project ` +
                        `configuration because there is already a custom theme file referenced.`);
                    logger.info(`Please manually add the following style file to your configuration:`);
                    logger.info(`    ${assetPath}`);
                    return;
                }
                else if (stylePath.includes(prebuiltThemePathSegment)) {
                    styles.splice(index, 1);
                }
            }
            styles.unshift(assetPath);
        }
    });
}
/**
 * Validates that the specified project target is configured with the default builders which are
 * provided by the Angular CLI. If the configured builder does not match the default builder,
 * this function can either throw or just show a warning.
 */
function validateDefaultTargetBuilder(project, targetName, logger) {
    const defaultBuilder = schematics_2.defaultTargetBuilders[targetName];
    const targetConfig = project.targets && project.targets.get(targetName);
    const isDefaultBuilder = targetConfig && targetConfig['builder'] === defaultBuilder;
    // Because the build setup for the Angular CLI can be customized by developers, we can't know
    // where to put the theme file in the workspace configuration if custom builders are being
    // used. In case the builder has been changed for the "build" target, we throw an error and
    // exit because setting up a theme is a primary goal of `ng-add`. Otherwise if just the "test"
    // builder has been changed, we warn because a theme is not mandatory for running tests
    // with Material. See: https://github.com/angular/components/issues/14176
    if (!isDefaultBuilder && targetName === 'build') {
        throw new schematics_1.SchematicsException(`Your project is not using the default builders for ` +
            `"${targetName}". The Angular Material schematics cannot add a theme to the workspace ` +
            `configuration if the builder has been changed.`);
    }
    else if (!isDefaultBuilder) {
        // for non-build targets we gracefully report the error without actually aborting the
        // setup schematic. This is because a theme is not mandatory for running tests.
        logger.warn(`Your project is not using the default builders for "${targetName}". This ` +
            `means that we cannot add the configured theme to the "${targetName}" target.`);
    }
    return isDefaultBuilder;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc2NoZW1hdGljcy9uZy1hZGQvdGhlbWluZy90aGVtaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7QUFFSCwrQ0FBd0Q7QUFDeEQsMkRBT29DO0FBQ3BDLHdEQU9pQztBQUNqQywrREFBZ0U7QUFDaEUscUVBQW9GO0FBQ3BGLCtCQUEwQjtBQUUxQiwrREFBd0Q7QUFLeEQsOEVBQThFO0FBQzlFLE1BQU0sd0JBQXdCLEdBQUcsc0JBQXNCLENBQUM7QUFFeEQsbUVBQW1FO0FBQ25FLE1BQU0sMEJBQTBCLEdBQUcsbUJBQW1CLENBQUM7QUFFdkQsMkRBQTJEO0FBQzNELFNBQWdCLG1CQUFtQixDQUFDLE1BQW1CO0lBQ3JELE9BQU8sQ0FBQyxJQUFVLEVBQUUsT0FBeUIsRUFBRSxFQUFFO1FBQy9DLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDO1FBQzFDLE9BQU8sU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUFDO1lBQzdCLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDakQsbUJBQW1CLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0QsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQVBELGtEQU9DO0FBQ0Q7OztHQUdHO0FBQ0gsU0FBZSxpQkFBaUIsQ0FBQyxNQUFtQixFQUFFLElBQVUsRUFBRSxNQUF5Qjs7UUFDekYsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNuQyxNQUFNLFNBQVMsR0FBRyxDQUFDLE1BQU0sSUFBQSx3QkFBWSxFQUFDLElBQUksQ0FBQyxDQUFtQyxDQUFDO1FBQy9FLE1BQU0sT0FBTyxHQUFHLElBQUEsb0NBQXVC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WUFBWSxJQUFJLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxjQUFjLENBQUM7SUFFcEYsNkZBQTZGO0lBQzdGLDBGQUEwRjtJQUMxRiwyRkFBMkY7SUFDM0YsOEZBQThGO0lBQzlGLHVGQUF1RjtJQUN2Rix5RUFBeUU7SUFDekUsSUFBSSxDQUFDLGdCQUFnQixJQUFJLFVBQVUsS0FBSyxPQUFPLEVBQUU7UUFDL0MsTUFBTSxJQUFJLGdDQUFtQixDQUFDLHFEQUFxRDtZQUNqRixJQUFJLFVBQVUseUVBQXlFO1lBQ3ZGLGdEQUFnRCxDQUFDLENBQUM7S0FDckQ7U0FBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7UUFDNUIscUZBQXFGO1FBQ3JGLCtFQUErRTtRQUMvRSxNQUFNLENBQUMsSUFBSSxDQUFDLHVEQUF1RCxVQUFVLFVBQVU7WUFDckYseURBQXlELFVBQVUsV0FBVyxDQUFDLENBQUM7S0FDbkY7SUFFRCxPQUFPLGdCQUFnQixDQUFDO0FBQzFCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtub3JtYWxpemUsIGxvZ2dpbmd9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7XG4gIGNoYWluLFxuICBub29wLFxuICBSdWxlLFxuICBTY2hlbWF0aWNDb250ZXh0LFxuICBTY2hlbWF0aWNzRXhjZXB0aW9uLFxuICBUcmVlLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge1xuICBhZGRCb2R5Q2xhc3MsXG4gIGRlZmF1bHRUYXJnZXRCdWlsZGVycyxcbiAgZ2V0UHJvamVjdEZyb21Xb3Jrc3BhY2UsXG4gIGdldFByb2plY3RTdHlsZUZpbGUsXG4gIGdldFByb2plY3RUYXJnZXRPcHRpb25zLFxuICBnZXRQcm9qZWN0SW5kZXhGaWxlcyxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3NjaGVtYXRpY3MnO1xuaW1wb3J0IHtJbnNlcnRDaGFuZ2V9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS9jaGFuZ2UnO1xuaW1wb3J0IHtnZXRXb3Jrc3BhY2UsIHVwZGF0ZVdvcmtzcGFjZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3dvcmtzcGFjZSc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtTZXR1cFNjaGVtYX0gZnJvbSAnLi4vc2V0dXAtc2NoZW1hJztcbmltcG9ydCB7Y3JlYXRlQ3VzdG9tVGhlbWV9IGZyb20gJy4vY3JlYXRlLWN1c3RvbS10aGVtZSc7XG5cbnR5cGUgV29ya3NwYWNlRGVmaW5pdGlvbiA9IFBhcmFtZXRlcnM8dHlwZW9mIGdldFByb2plY3RGcm9tV29ya3NwYWNlPlswXTtcbnR5cGUgUHJvamVjdERlZmluaXRpb24gPSBSZXR1cm5UeXBlPHR5cGVvZiBnZXRQcm9qZWN0RnJvbVdvcmtzcGFjZT47XG5cbi8qKiBQYXRoIHNlZ21lbnQgdGhhdCBjYW4gYmUgZm91bmQgaW4gcGF0aHMgdGhhdCByZWZlciB0byBhIHByZWJ1aWx0IHRoZW1lLiAqL1xuY29uc3QgcHJlYnVpbHRUaGVtZVBhdGhTZWdtZW50ID0gJ0BwZWJ1bGEvbmdyaWQvdGhlbWVzJztcblxuLyoqIERlZmF1bHQgZmlsZSBuYW1lIG9mIHRoZSBjdXN0b20gdGhlbWUgdGhhdCBjYW4gYmUgZ2VuZXJhdGVkLiAqL1xuY29uc3QgZGVmYXVsdEN1c3RvbVRoZW1lRmlsZW5hbWUgPSAnY3VzdG9tLXRoZW1lLnNjc3MnO1xuXG4vKiogQWRkIHByZS1idWlsdCBzdHlsZXMgdG8gdGhlIG1haW4gcHJvamVjdCBzdHlsZSBmaWxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFRoZW1lVG9BcHBTdHlsZXMoc2NoZW1hOiBTZXR1cFNjaGVtYSk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCB0aGVtZU5hbWUgPSBzY2hlbWEudGhlbWUgfHwgJ2xpZ2h0JztcbiAgICByZXR1cm4gdGhlbWVOYW1lID09PSAnY3VzdG9tJyA/XG4gICAgICBpbnNlcnRDdXN0b21UaGVtZShzY2hlbWEsIGhvc3QsIGNvbnRleHQubG9nZ2VyKSA6XG4gICAgICBpbnNlcnRQcmVidWlsdFRoZW1lKHNjaGVtYSwgdGhlbWVOYW1lLCBjb250ZXh0LmxvZ2dlcik7XG4gIH07XG59XG4vKipcbiAqIEluc2VydCBhIGN1c3RvbSB0aGVtZSB0byBwcm9qZWN0IHN0eWxlIGZpbGUuIElmIG5vIHZhbGlkIHN0eWxlIGZpbGUgY291bGQgYmUgZm91bmQsIGEgbmV3XG4gKiBTY3NzIGZpbGUgZm9yIHRoZSBjdXN0b20gdGhlbWUgd2lsbCBiZSBjcmVhdGVkLlxuICovXG5hc3luYyBmdW5jdGlvbiBpbnNlcnRDdXN0b21UaGVtZShzY2hlbWE6IFNldHVwU2NoZW1hLCBob3N0OiBUcmVlLCBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpKTogUHJvbWlzZTxSdWxlPiB7XG4gIGNvbnN0IHByb2plY3ROYW1lID0gc2NoZW1hLnByb2plY3Q7XG4gIGNvbnN0IHdvcmtzcGFjZSA9IChhd2FpdCBnZXRXb3Jrc3BhY2UoaG9zdCkpIGFzIHVua25vd24gYXMgV29ya3NwYWNlRGVmaW5pdGlvbjtcbiAgY29uc3QgcHJvamVjdCA9IGdldFByb2plY3RGcm9tV29ya3NwYWNlKHdvcmtzcGFjZSwgcHJvamVjdE5hbWUpO1xuXG4gIGNvbnN0IHN0eWxlc1BhdGggPSBnZXRQcm9qZWN0U3R5bGVGaWxlKHByb2plY3QsICdzY3NzJyk7XG4gIGNvbnN0IHRoZW1lQ29udGVudCA9IGNyZWF0ZUN1c3RvbVRoZW1lKHByb2plY3ROYW1lKTtcblxuICBpZiAoIXN0eWxlc1BhdGgpIHtcbiAgICBpZiAoIXByb2plY3Quc291cmNlUm9vdCkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYENvdWxkIG5vdCBmaW5kIHNvdXJjZSByb290IGZvciBwcm9qZWN0OiBcIiR7cHJvamVjdE5hbWV9XCIuIGAgK1xuICAgICAgICBgUGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHRoZSBcInNvdXJjZVJvb3RcIiBwcm9wZXJ0eSBpcyBzZXQgaW4gdGhlIHdvcmtzcGFjZSBjb25maWcuYCk7XG4gICAgfVxuXG4gICAgLy8gTm9ybWFsaXplIHRoZSBwYXRoIHRocm91Z2ggdGhlIGRldmtpdCB1dGlsaXRpZXMgYmVjYXVzZSB3ZSB3YW50IHRvIGF2b2lkIGhhdmluZ1xuICAgIC8vIHVubmVjZXNzYXJ5IHBhdGggc2VnbWVudHMgYW5kIHdpbmRvd3MgYmFja3NsYXNoIGRlbGltaXRlcnMuXG4gICAgY29uc3QgY3VzdG9tVGhlbWVQYXRoID0gbm9ybWFsaXplKGpvaW4ocHJvamVjdC5zb3VyY2VSb290LCBkZWZhdWx0Q3VzdG9tVGhlbWVGaWxlbmFtZSkpO1xuXG4gICAgaWYgKGhvc3QuZXhpc3RzKGN1c3RvbVRoZW1lUGF0aCkpIHtcbiAgICAgIGxvZ2dlci53YXJuKGBDYW5ub3QgY3JlYXRlIGEgY3VzdG9tIEFuZ3VsYXIgTWF0ZXJpYWwgdGhlbWUgYmVjYXVzZVxuICAgICAgICAgICR7Y3VzdG9tVGhlbWVQYXRofSBhbHJlYWR5IGV4aXN0cy4gU2tpcHBpbmcgY3VzdG9tIHRoZW1lIGdlbmVyYXRpb24uYCk7XG4gICAgICByZXR1cm4gbm9vcCgpO1xuICAgIH1cblxuICAgIGhvc3QuY3JlYXRlKGN1c3RvbVRoZW1lUGF0aCwgdGhlbWVDb250ZW50KTtcbiAgICByZXR1cm4gYWRkVGhlbWVTdHlsZVRvVGFyZ2V0KHNjaGVtYSwgJ2J1aWxkJywgY3VzdG9tVGhlbWVQYXRoLCBsb2dnZXIpO1xuICB9XG5cbiAgY29uc3QgaW5zZXJ0aW9uID0gbmV3IEluc2VydENoYW5nZShzdHlsZXNQYXRoLCAwLCB0aGVtZUNvbnRlbnQpO1xuICBjb25zdCByZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUoc3R5bGVzUGF0aCk7XG5cbiAgcmVjb3JkZXIuaW5zZXJ0TGVmdChpbnNlcnRpb24ucG9zLCBpbnNlcnRpb24udG9BZGQpO1xuICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG4gIHJldHVybiBub29wKCk7XG59XG5cbi8qKiBJbnNlcnQgYSBwcmUtYnVpbHQgdGhlbWUgaW50byB0aGUgYW5ndWxhci5qc29uIGZpbGUuICovXG5mdW5jdGlvbiBpbnNlcnRQcmVidWlsdFRoZW1lKHNjaGVtYTogU2V0dXBTY2hlbWEsIHRoZW1lOiBzdHJpbmcsIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGkpOiBSdWxlIHtcbiAgLy8gUGF0aCBuZWVkcyB0byBiZSBhbHdheXMgcmVsYXRpdmUgdG8gdGhlIGBwYWNrYWdlLmpzb25gIG9yIHdvcmtzcGFjZSByb290LlxuICBjb25zdCB0aGVtZVBhdGggPSBgLi9ub2RlX21vZHVsZXMvQHBlYnVsYS9uZ3JpZC90aGVtZXMvZGVmYXVsdC0ke3RoZW1lfS5jc3NgO1xuXG4gIHJldHVybiBjaGFpbihbXG4gICAgYWRkVGhlbWVTdHlsZVRvVGFyZ2V0KHNjaGVtYSwgJ2J1aWxkJywgdGhlbWVQYXRoLCBsb2dnZXIpLFxuICAgIGFkZFRoZW1lU3R5bGVUb1RhcmdldChzY2hlbWEsICd0ZXN0JywgdGhlbWVQYXRoLCBsb2dnZXIpXG4gIF0pO1xufVxuXG4vKiogQWRkcyBhIHRoZW1pbmcgc3R5bGUgZW50cnkgdG8gdGhlIGdpdmVuIHByb2plY3QgdGFyZ2V0IG9wdGlvbnMuICovXG5mdW5jdGlvbiBhZGRUaGVtZVN0eWxlVG9UYXJnZXQoc2NoZW1hOiBTZXR1cFNjaGVtYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXROYW1lOiAndGVzdCcgfCAnYnVpbGQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0UGF0aDogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGkpOiBSdWxlIHtcbiAgcmV0dXJuIHVwZGF0ZVdvcmtzcGFjZSh3b3Jrc3BhY2UgPT4ge1xuICAgIGNvbnN0IHByb2plY3ROYW1lID0gc2NoZW1hLnByb2plY3Q7XG4gICAgY29uc3QgcHJvamVjdCA9IGdldFByb2plY3RGcm9tV29ya3NwYWNlKHdvcmtzcGFjZSBhcyB1bmtub3duIGFzIFdvcmtzcGFjZURlZmluaXRpb24sIHByb2plY3ROYW1lKTtcblxuICAgIC8vIERvIG5vdCB1cGRhdGUgdGhlIGJ1aWxkZXIgb3B0aW9ucyBpbiBjYXNlIHRoZSB0YXJnZXQgZG9lcyBub3QgdXNlIHRoZSBkZWZhdWx0IENMSSBidWlsZGVyLlxuICAgIGlmICghdmFsaWRhdGVEZWZhdWx0VGFyZ2V0QnVpbGRlcihwcm9qZWN0LCB0YXJnZXROYW1lLCBsb2dnZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdGFyZ2V0T3B0aW9ucyA9IGdldFByb2plY3RUYXJnZXRPcHRpb25zKHByb2plY3QsIHRhcmdldE5hbWUpO1xuICAgIGNvbnN0IHN0eWxlcyA9IHRhcmdldE9wdGlvbnMuc3R5bGVzIGFzIChzdHJpbmcgfCB7aW5wdXQ6IHN0cmluZ30pW107XG5cbiAgICBpZiAoIXN0eWxlcykge1xuICAgICAgdGFyZ2V0T3B0aW9ucy5zdHlsZXMgPSBbYXNzZXRQYXRoXTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZXhpc3RpbmdTdHlsZXMgPSBzdHlsZXMubWFwKHMgPT4gdHlwZW9mIHMgPT09ICdzdHJpbmcnID8gcyA6IHMuaW5wdXQpO1xuXG4gICAgICBmb3IgKGxldCBbaW5kZXgsIHN0eWxlUGF0aF0gb2YgZXhpc3RpbmdTdHlsZXMuZW50cmllcygpKSB7XG4gICAgICAgIC8vIElmIHRoZSBnaXZlbiBhc3NldCBpcyBhbHJlYWR5IHNwZWNpZmllZCBpbiB0aGUgc3R5bGVzLCB3ZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nLlxuICAgICAgICBpZiAoc3R5bGVQYXRoID09PSBhc3NldFBhdGgpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbiBjYXNlIGEgcHJlYnVpbHQgdGhlbWUgaXMgYWxyZWFkeSBzZXQgdXAsIHdlIGNhbiBzYWZlbHkgcmVwbGFjZSB0aGUgdGhlbWUgd2l0aCB0aGUgbmV3XG4gICAgICAgIC8vIHRoZW1lIGZpbGUuIElmIGEgY3VzdG9tIHRoZW1lIGlzIHNldCB1cCwgd2UgYXJlIG5vdCBhYmxlIHRvIHNhZmVseSByZXBsYWNlIHRoZSBjdXN0b21cbiAgICAgICAgLy8gdGhlbWUgYmVjYXVzZSB0aGVzZSBmaWxlcyBjYW4gY29udGFpbiBjdXN0b20gc3R5bGVzLCB3aGlsZSBwcmVidWlsdCB0aGVtZXMgYXJlXG4gICAgICAgIC8vIGFsd2F5cyBwYWNrYWdlZCBhbmQgY29uc2lkZXJlZCByZXBsYWNlYWJsZS5cbiAgICAgICAgaWYgKHN0eWxlUGF0aC5pbmNsdWRlcyhkZWZhdWx0Q3VzdG9tVGhlbWVGaWxlbmFtZSkpIHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoYENvdWxkIG5vdCBhZGQgdGhlIHNlbGVjdGVkIHRoZW1lIHRvIHRoZSBDTEkgcHJvamVjdCBgICtcbiAgICAgICAgICAgICAgYGNvbmZpZ3VyYXRpb24gYmVjYXVzZSB0aGVyZSBpcyBhbHJlYWR5IGEgY3VzdG9tIHRoZW1lIGZpbGUgcmVmZXJlbmNlZC5gKTtcbiAgICAgICAgICBsb2dnZXIuaW5mbyhgUGxlYXNlIG1hbnVhbGx5IGFkZCB0aGUgZm9sbG93aW5nIHN0eWxlIGZpbGUgdG8geW91ciBjb25maWd1cmF0aW9uOmApO1xuICAgICAgICAgIGxvZ2dlci5pbmZvKGAgICAgJHthc3NldFBhdGh9YCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKHN0eWxlUGF0aC5pbmNsdWRlcyhwcmVidWlsdFRoZW1lUGF0aFNlZ21lbnQpKSB7XG4gICAgICAgICAgc3R5bGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3R5bGVzLnVuc2hpZnQoYXNzZXRQYXRoKTtcbiAgICB9XG4gIH0pIGFzIGFueTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhhdCB0aGUgc3BlY2lmaWVkIHByb2plY3QgdGFyZ2V0IGlzIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZGVmYXVsdCBidWlsZGVycyB3aGljaCBhcmVcbiAqIHByb3ZpZGVkIGJ5IHRoZSBBbmd1bGFyIENMSS4gSWYgdGhlIGNvbmZpZ3VyZWQgYnVpbGRlciBkb2VzIG5vdCBtYXRjaCB0aGUgZGVmYXVsdCBidWlsZGVyLFxuICogdGhpcyBmdW5jdGlvbiBjYW4gZWl0aGVyIHRocm93IG9yIGp1c3Qgc2hvdyBhIHdhcm5pbmcuXG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlRGVmYXVsdFRhcmdldEJ1aWxkZXIocHJvamVjdDogUHJvamVjdERlZmluaXRpb24sIHRhcmdldE5hbWU6ICdidWlsZCcgfCAndGVzdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGkpIHtcbiAgY29uc3QgZGVmYXVsdEJ1aWxkZXIgPSBkZWZhdWx0VGFyZ2V0QnVpbGRlcnNbdGFyZ2V0TmFtZV07XG4gIGNvbnN0IHRhcmdldENvbmZpZyA9IHByb2plY3QudGFyZ2V0cyAmJiBwcm9qZWN0LnRhcmdldHMuZ2V0KHRhcmdldE5hbWUpO1xuICBjb25zdCBpc0RlZmF1bHRCdWlsZGVyID0gdGFyZ2V0Q29uZmlnICYmIHRhcmdldENvbmZpZ1snYnVpbGRlciddID09PSBkZWZhdWx0QnVpbGRlcjtcblxuICAvLyBCZWNhdXNlIHRoZSBidWlsZCBzZXR1cCBmb3IgdGhlIEFuZ3VsYXIgQ0xJIGNhbiBiZSBjdXN0b21pemVkIGJ5IGRldmVsb3BlcnMsIHdlIGNhbid0IGtub3dcbiAgLy8gd2hlcmUgdG8gcHV0IHRoZSB0aGVtZSBmaWxlIGluIHRoZSB3b3Jrc3BhY2UgY29uZmlndXJhdGlvbiBpZiBjdXN0b20gYnVpbGRlcnMgYXJlIGJlaW5nXG4gIC8vIHVzZWQuIEluIGNhc2UgdGhlIGJ1aWxkZXIgaGFzIGJlZW4gY2hhbmdlZCBmb3IgdGhlIFwiYnVpbGRcIiB0YXJnZXQsIHdlIHRocm93IGFuIGVycm9yIGFuZFxuICAvLyBleGl0IGJlY2F1c2Ugc2V0dGluZyB1cCBhIHRoZW1lIGlzIGEgcHJpbWFyeSBnb2FsIG9mIGBuZy1hZGRgLiBPdGhlcndpc2UgaWYganVzdCB0aGUgXCJ0ZXN0XCJcbiAgLy8gYnVpbGRlciBoYXMgYmVlbiBjaGFuZ2VkLCB3ZSB3YXJuIGJlY2F1c2UgYSB0aGVtZSBpcyBub3QgbWFuZGF0b3J5IGZvciBydW5uaW5nIHRlc3RzXG4gIC8vIHdpdGggTWF0ZXJpYWwuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9pc3N1ZXMvMTQxNzZcbiAgaWYgKCFpc0RlZmF1bHRCdWlsZGVyICYmIHRhcmdldE5hbWUgPT09ICdidWlsZCcpIHtcbiAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgWW91ciBwcm9qZWN0IGlzIG5vdCB1c2luZyB0aGUgZGVmYXVsdCBidWlsZGVycyBmb3IgYCArXG4gICAgICBgXCIke3RhcmdldE5hbWV9XCIuIFRoZSBBbmd1bGFyIE1hdGVyaWFsIHNjaGVtYXRpY3MgY2Fubm90IGFkZCBhIHRoZW1lIHRvIHRoZSB3b3Jrc3BhY2UgYCArXG4gICAgICBgY29uZmlndXJhdGlvbiBpZiB0aGUgYnVpbGRlciBoYXMgYmVlbiBjaGFuZ2VkLmApO1xuICB9IGVsc2UgaWYgKCFpc0RlZmF1bHRCdWlsZGVyKSB7XG4gICAgLy8gZm9yIG5vbi1idWlsZCB0YXJnZXRzIHdlIGdyYWNlZnVsbHkgcmVwb3J0IHRoZSBlcnJvciB3aXRob3V0IGFjdHVhbGx5IGFib3J0aW5nIHRoZVxuICAgIC8vIHNldHVwIHNjaGVtYXRpYy4gVGhpcyBpcyBiZWNhdXNlIGEgdGhlbWUgaXMgbm90IG1hbmRhdG9yeSBmb3IgcnVubmluZyB0ZXN0cy5cbiAgICBsb2dnZXIud2FybihgWW91ciBwcm9qZWN0IGlzIG5vdCB1c2luZyB0aGUgZGVmYXVsdCBidWlsZGVycyBmb3IgXCIke3RhcmdldE5hbWV9XCIuIFRoaXMgYCArXG4gICAgICBgbWVhbnMgdGhhdCB3ZSBjYW5ub3QgYWRkIHRoZSBjb25maWd1cmVkIHRoZW1lIHRvIHRoZSBcIiR7dGFyZ2V0TmFtZX1cIiB0YXJnZXQuYCk7XG4gIH1cblxuICByZXR1cm4gaXNEZWZhdWx0QnVpbGRlcjtcbn1cbiJdfQ==