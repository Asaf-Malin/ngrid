import { PblNgridComponent, PblNgridExtensionApi } from '@pebula/ngrid';
import { RootStateChunks, StateChunks, PblNgridStateChunkSectionContext, PblNgridStateChunkContext, PblNgridStateOptions, PblNgridStateLoadOptions } from './models/index';
import { PblNgridStateChunkHandlerDefinition } from './handling/base';
import { PblNgridStateChunkSectionConfig } from './state-visor';
/**
 * Pick Partial No Partial
 * Like Pick but some are partial some are not partial
 */
export declare type PickPNP<T, P extends keyof T, NP extends keyof T> = Partial<Pick<T, P>> & Pick<T, NP>;
export declare function resolveId(grid: PblNgridComponent, options?: PblNgridStateOptions): string;
export declare function serialize(def: PblNgridStateChunkHandlerDefinition<any>, state: any, ctx: PblNgridStateChunkContext<any>): void;
export declare function deserialize(def: PblNgridStateChunkHandlerDefinition<any>, state: any, ctx: PblNgridStateChunkContext<any>): void;
export declare function normalizeOptions(mode: 'save', options?: PblNgridStateOptions): PblNgridStateOptions;
export declare function normalizeOptions(mode: 'load', options?: PblNgridStateLoadOptions): PblNgridStateLoadOptions;
export declare function getExtApi(grid: PblNgridComponent): PblNgridExtensionApi;
export declare function createChunkSectionContext(grid: PblNgridComponent, options: PblNgridStateOptions | PblNgridStateLoadOptions): PblNgridStateChunkSectionContext;
export declare function createChunkContext<T extends keyof RootStateChunks>(sectionContext: PblNgridStateChunkSectionContext, chunkConfig: PblNgridStateChunkSectionConfig<T>, mode: 'serialize' | 'deserialize'): PblNgridStateChunkContext<T>;
export declare function stateKeyPredicateFactory(chunkId: keyof StateChunks, options: PblNgridStateOptions, rootPredicate?: boolean): ((key: string) => boolean) | undefined;
