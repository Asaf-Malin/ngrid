import { PblColumnDefinition } from '../../../models/column';
import { PblNgridSortDefinition } from './types';
/**
 * Apply sorting on a collection, based on column and sort definitions.
 * If the sort definition doesn't have a sorting function the default sorter is used.
 */
export declare function applySort<T>(column: PblColumnDefinition, sort: PblNgridSortDefinition, data: T[]): T[];
