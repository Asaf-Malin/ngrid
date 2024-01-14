import { PblColumnGroupDefinition } from '@pebula/ngrid/core';
import { PblMetaColumn } from './meta-column';
import { PblColumn } from './column';
export declare function isPblColumnGroup(def: any): def is PblColumnGroup;
export declare class PblColumnGroupStore {
    get all(): PblColumnGroup[];
    private store;
    private _all;
    /**
     * Attach a column to a group.
     */
    attach(group: string | PblColumnGroup, column: string | PblColumn): boolean;
    /**
     * Detach a column from a group.
     */
    detach(group: string | PblColumnGroup, column: string | PblColumn): boolean;
    /**
     * Returns a list of `PblColumnGroup` that does not have columns attached.
     */
    findGhosts(): PblColumnGroup[];
    add(group: PblColumnGroup): void;
    remove(group: string | PblColumnGroup): boolean;
    find(group: string | PblColumnGroup): PblColumnGroup | undefined;
    clone(): PblColumnGroupStore;
    private _find;
    private updateAll;
}
export declare class PblColumnGroup extends PblMetaColumn implements PblColumnGroupDefinition {
    readonly placeholder: boolean;
    columnIds: string[];
    /**
     * Returns the visible state of the column.
     * The column is visible if AT LEAST ONE child column is visible (i.e. not hidden)
     */
    get isVisible(): boolean;
    /**
     * When set, this column is a cloned column of an existing column caused by a split.
     * @internal
     */
    slaveOf?: PblColumnGroup;
    /** @internal */
    readonly columns: PblColumn[];
    constructor(def: PblColumnGroup | PblColumnGroupDefinition, columns: PblColumn[], placeholder?: boolean);
    static extendProperty(name: keyof PblColumnGroup): void;
    createSlave(columns?: PblColumn[]): PblColumnGroup;
    replace(newColumn: PblColumn): boolean;
}
