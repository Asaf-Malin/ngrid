import { PblNgridComponent } from '@pebula/ngrid';
import { PblNgridGlobalState, PblNgridStateOptions, PblNgridStateSaveOptions, PblNgridStateLoadOptions } from './models/index';
export declare function hasState(grid: PblNgridComponent, options?: PblNgridStateOptions): Promise<boolean>;
export declare function saveState(grid: PblNgridComponent, options?: PblNgridStateSaveOptions): Promise<void>;
export declare function loadState(grid: PblNgridComponent, options?: PblNgridStateLoadOptions): Promise<PblNgridGlobalState>;
