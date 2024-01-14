import { Type } from '@angular/core';
import { PblNgridPluginExtension, PblNgridPluginExtensionFactories } from './types';
/** @internal */
export declare const PLUGIN_STORE: Map<never, NgridPluginMetadata<never> & {
    target: any;
}>;
export interface NgridPluginMetadata<P extends keyof PblNgridPluginExtension = keyof PblNgridPluginExtension> {
    id: P;
    factory?: P extends keyof PblNgridPluginExtensionFactories ? PblNgridPluginExtensionFactories[P] : never;
    runOnce?: () => void;
}
export declare function ngridPlugin(metadata: NgridPluginMetadata, target: Type<any>): never;
