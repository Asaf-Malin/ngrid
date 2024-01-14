import { ViewContainerRef } from '@angular/core';
import { ListRange } from '@angular/cdk/collections';
import { PblNgridConfigService } from '@asafmalin/ngrid/core';
import { PblNgridVirtualScrollStrategy } from './strategies/types';
export declare type StickyDirectionVt = 'top' | 'bottom';
export declare type StickyDirectionHz = 'left' | 'right';
export declare function resolveScrollStrategy(config: PblNgridConfigService, scrollStrategy: PblNgridVirtualScrollStrategy, fallback: () => PblNgridVirtualScrollStrategy): PblNgridVirtualScrollStrategy;
/**
 * Returns the split range from an aggregated range.
 * An aggregated range describes the range of header, data and footer rows currently in view.
 * This function will split the range into core section, each having it's own range.
 *
 * Note that an aggregated range can span over a single section, all sections or just 2 sections.
 * If a section is not part of the aggregated range it's range is invalid, i.e: ListRange.start >= ListRange.end.
 *
 * @param range The aggregated range
 * @param headerLen The total length of header rows in the grid
 * @param dataLen The total length of data rows in the grid
 * @returns A tuple containing the ranges [header, data, footer].
 */
export declare function splitRange(range: ListRange, headerLen: number, dataLen: number): [ListRange, ListRange, ListRange];
/**
 * Update sticky positioning values to the rows to match virtual scroll content offset.
 * This function should run after `CdkTable` updated the sticky rows.
 *
 * ## Why
 * `CdkTable` applies sticky positioning to rows by setting top/bottom value to `0px`.
 * Virtual scroll use's a container with an offset to simulate the scrolling.
 *
 * The 2 does not work together, the virtual scroll offset will throw the sticky row out of bound, thus the top/bottom value must be compensated
 * based on the offset.
 */
export declare function updateStickyRows(offset: number, rows: HTMLElement[], stickyState: boolean[], type: StickyDirectionVt): void;
/**
 * Measures the combined size (width for horizontal orientation, height for vertical) of all items
 * in the specified view within the specified range.
 * Throws an error if the range includes items that are not currently rendered.
 *
 * > This is function is identical to `CdkVirtualForOf.measureRangeSize` with minor adjustments
 */
export declare function measureRangeSize(viewContainer: ViewContainerRef, range: ListRange, renderedRange: ListRange, stickyState?: boolean[]): number;
export declare function calculateBrowserPxLimit(): number;
