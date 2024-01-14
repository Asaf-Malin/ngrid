import { PblNgridGlobalState, PblNgridPersistAdapter } from '../models/index';
export declare class PblNgridLocalStoragePersistAdapter implements PblNgridPersistAdapter {
    private static globalStateKey;
    save(id: string, state: PblNgridGlobalState): Promise<void>;
    load(id: string): Promise<PblNgridGlobalState>;
    exists(id: string): Promise<boolean>;
    private loadGlobalStateStore;
    private saveGlobalStateStore;
}
