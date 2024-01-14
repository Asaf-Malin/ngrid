import { StateChunks, PblNgridStateChunkContext } from '../models/index';
export declare class PblNgridStateChunkHandlerHost<T extends keyof StateChunks, Z extends keyof StateChunks[T]['state'] = keyof StateChunks[T]['state']> {
    private chunkId;
    private keys;
    private rKeys;
    private sFn;
    private dFn;
    constructor(chunkId: T);
    handleKeys(...keys: Array<Z>): this;
    /**
     * Required keys are keys that cannot get excluded.
     * Either by adding the to the `exclude` option or by omitting them from the `include` option.
     */
    requiredKeys(...keys: Array<Z>): this;
    serialize(fn: (key: Z, ctx: PblNgridStateChunkContext<T>) => StateChunks[T]['state'][Z]): this;
    deserialize(fn: (key: Z, stateValue: StateChunks[T]['state'][Z], ctx: PblNgridStateChunkContext<T>) => void): this;
    register(): void;
}
export interface PblNgridStateChunkHandlerDefinition<T extends keyof StateChunks, Z extends keyof StateChunks[T]['state'] = keyof StateChunks[T]['state']> {
    chunkId: T;
    keys: Array<Z>;
    rKeys: Array<Z>;
    serialize: Parameters<PblNgridStateChunkHandlerHost<T, Z>['serialize']>[0];
    deserialize: Parameters<PblNgridStateChunkHandlerHost<T, Z>['deserialize']>[0];
}
export declare function createStateChunkHandler<T extends keyof StateChunks>(section: T): PblNgridStateChunkHandlerHost<T, keyof StateChunks[T]["state"]>;
