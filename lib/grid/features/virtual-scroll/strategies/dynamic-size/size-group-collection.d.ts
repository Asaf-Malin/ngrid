import { SizeGroup } from './size-group';
export declare class SizeGroupCollection {
    get collection(): SizeGroup[];
    get length(): number;
    private _groups;
    set(group: SizeGroup): void;
    remove(groupIndex: number): boolean;
    get(groupIndex: number): SizeGroup | undefined;
    has(groupIndex: number): boolean;
    clear(): void;
    protected findGroupIndexIndex(groupIndex: number, matchClosest?: boolean): number;
}
