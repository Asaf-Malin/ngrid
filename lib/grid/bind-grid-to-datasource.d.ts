import { PblNgridInternalExtensionApi } from '../ext/grid-ext-api';
import { PblNgridComponent } from './ngrid.component';
declare module '@pebula/ngrid/core/lib/data-source/data-source' {
    interface PblDataSource<T = any, TData = any> {
        hostGrid: PblNgridComponent<T>;
    }
}
export declare function bindGridToDataSource(extApi: PblNgridInternalExtensionApi): void;
