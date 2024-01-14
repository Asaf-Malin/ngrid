import { Subject } from 'rxjs';
import { IterableChanges, IterableDiffers } from '@angular/core';
import { PblColumnStoreMetaRow } from './types';
export interface PblMetaRowColumnsChangeEvent {
    metaRow: PblColumnStoreMetaRow;
    changes: IterableChanges<string>;
}
export declare class MetaRowsStore {
    private readonly differs;
    headers: Array<PblColumnStoreMetaRow & {
        allKeys?: string[];
    }>;
    footers: Array<PblColumnStoreMetaRow & {
        allKeys?: string[];
    }>;
    readonly visibleChanged$: Subject<PblMetaRowColumnsChangeEvent>;
    private hDiffers;
    private fDiffers;
    constructor(differs: IterableDiffers);
    setHeader(value: PblColumnStoreMetaRow & {
        allKeys?: string[];
    }): void;
    setFooter(value: PblColumnStoreMetaRow & {
        allKeys?: string[];
    }): void;
    updateHeader(value: PblColumnStoreMetaRow & {
        allKeys?: string[];
    }): void;
    updateFooter(value: PblColumnStoreMetaRow & {
        allKeys?: string[];
    }): void;
    clear(): void;
    dispose(): void;
}
