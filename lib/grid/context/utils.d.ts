import { PblNgridExtensionApi } from '../../ext/grid-ext-api';
import { ColumnApi } from '../column/management';
import { RowContextState, CellReference } from './types';
import { PblRowContext } from './row';
import { PblCellContext } from './cell';
/** IE 11 compatible matches implementation. */
export declare function matches(element: Element, selector: string): boolean;
/** IE 11 compatible closest implementation. */
export declare function closest(element: EventTarget | Element | null | undefined, selector: string): Element | null;
export declare function findRowRenderedIndex(el: HTMLElement): number;
export declare function findCellRenderedIndex(el: HTMLElement): [number, number];
/**
 * Resolves the context from one of the possible types in `CellReference`.
 * If the context is within the view it will return the `PblCellContext instance, otherwise it will
 * return a tuple with the first item being the row context state and the seconds item pointing to the cell index.
 *
 * If no context is found, returns undefined.
 */
export declare function resolveCellReference(cellRef: CellReference, context: {
    viewCache: Map<number, PblRowContext<any>>;
    cache: Map<any, RowContextState>;
    columnApi: ColumnApi<any>;
    extApi: PblNgridExtensionApi;
}): PblCellContext | [RowContextState, number] | undefined;
