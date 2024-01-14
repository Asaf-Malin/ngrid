import { PblNgridGlobalState, StateChunks, RootStateChunks, PblNgridStateChunkSectionContext } from './models/index';
import { PblNgridStateChunkHandlerDefinition } from './handling';
export declare let _instance: StateVisor;
export interface PblNgridStateChunkSectionConfig<T extends keyof RootStateChunks = keyof RootStateChunks> {
    stateMatcher: (state: PblNgridGlobalState) => RootStateChunks[T]['state'];
    sourceMatcher: (context: PblNgridStateChunkSectionContext) => RootStateChunks[T]['value'];
}
export declare class StateVisor<T extends keyof StateChunks = keyof StateChunks> {
    private rootChunkSections;
    private chunkHandlers;
    private constructor();
    static get(): StateVisor;
    registerRootChunkSection<Z extends keyof RootStateChunks>(chunkId: Z, config: PblNgridStateChunkSectionConfig<Z>): void;
    registerChunkHandlerDefinition<Z extends T>(chunkHandlerDefs: PblNgridStateChunkHandlerDefinition<Z>): void;
    getRootSections(): Array<[keyof RootStateChunks, PblNgridStateChunkSectionConfig<keyof RootStateChunks>]>;
    getDefinitionsForSection(chunkId: T): PblNgridStateChunkHandlerDefinition<T>[];
}
export declare const stateVisor: StateVisor;
