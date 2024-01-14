import { PblNgridInternalExtensionApi } from '../../ext/grid-ext-api';
/**
 * Listens to registry changes and update the grid
 * Must run when the grid in at content init
 */
export declare function bindRegistryLogicap(extApi: PblNgridInternalExtensionApi): () => void;
