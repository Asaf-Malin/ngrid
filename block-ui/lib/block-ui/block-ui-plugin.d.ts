import { Observable } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { PblNgridComponent, PblNgridPluginController } from '@pebula/ngrid';
import * as i0 from "@angular/core";
declare module '@pebula/ngrid/lib/ext/types' {
    interface PblNgridPluginExtension {
        blockUi?: {
            blockUi: BooleanInput | 'auto' | Observable<boolean>;
        };
    }
}
export declare const PLUGIN_KEY: 'blockUi';
export declare class PblNgridBlockUiPluginDirective<T> implements OnDestroy {
    private grid;
    /**
     * Blocks the UI with the template defined via `PblNgridBlockUiDefDirective`.
     * If a template does not exist blocking is ignored.
     *
     * There are 3 operation modes, the modes are set based on the input value:
     *   - Auto mode (INPUT: 'auto')
     *     The UI will be blocked automatically based on datasource changes.
     *
     *    - Manual mode (INPUT: boolean)
     *     The UI will be block is toggled based on the value, i.e. `true` will block and false will unblock.
     *
     *   - Notification mode (INPUT: Observable<boolean>)
     *     Similar to Manual mode but controlled by a stream boolean value.
     *
     * **Note about Notification mode**
     * Notification mode accepts an observable, at the point where the value is set the block state does not change (if it was "on" it will stay "on" and vice versa)
     * It will only change on the first emission, this is important to understand.
     *
     * For example, if the current block state is off and we pass a `Subject`, the state remains off until the next emission
     * of the `Subject` is `true`. If it already emitted `true` before the assignment it will not be taken into account. This is why
     * using `BehaviouralSubject` is preferred.
     *
     * Also note that when sending an observable it is treated as "notifier", do not send cold observable as they get subscribed to.
     * For example, sending the returned value from `HttpClient` will probably result in 2 HTTP calls, if you already subscribed to it
     * > The default value is `auto` which means that `<pbl-ngrid blockUi>` is similar to `<pbl-ngrid blockUi="auto">`
     */
    get blockUi(): BooleanInput | 'auto' | Observable<boolean>;
    set blockUi(value: BooleanInput | 'auto' | Observable<boolean>);
    private _blockInProgress;
    private _blockUi;
    private _blockerEmbeddedVRef;
    private _removePlugin;
    constructor(grid: PblNgridComponent<any>, pluginCtrl: PblNgridPluginController<T>);
    ngOnDestroy(): void;
    private setupBlocker;
    static ngAcceptInputType_blockUi: BooleanInput;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridBlockUiPluginDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridBlockUiPluginDirective<any>, "pbl-ngrid[blockUi]", ["blockUi"], { "blockUi": "blockUi"; }, {}, never, never, false>;
}
