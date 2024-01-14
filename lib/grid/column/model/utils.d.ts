import { PblBaseColumnDefinition } from '@pebula/ngrid/core';
export declare function parseStyleWidth(exp: string): {
    value: number;
    type: 'px' | '%';
} | undefined;
export declare function initDefinitions<T extends PblBaseColumnDefinition>(def: PblBaseColumnDefinition, target: T): void;
