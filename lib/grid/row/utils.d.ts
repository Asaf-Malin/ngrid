import { PblMetaRowDefinitions } from '@asafmalin/ngrid/core';
import { PblNgridMetaRowService, PblMetaRow } from '../meta-rows/meta-row.service';
export declare function initColumnOrMetaRow(element: HTMLElement, isFooter: boolean): void;
export declare function setRowVisibility(element: HTMLElement, visible: boolean): void;
export declare function applyMetaRowClass(metaRowsService: PblNgridMetaRowService, metaRows: PblMetaRow, element: HTMLElement, oldMetaRow: PblMetaRowDefinitions, newMetaRow: PblMetaRowDefinitions): void;
declare const FIRST_LAST_ROW_SELECTORS: {
    header: {
        selector: string;
        first: string;
        last: string;
    };
    footer: {
        selector: string;
        first: string;
        last: string;
    };
};
export declare function updateMetaRowFirstLastClass(section: keyof typeof FIRST_LAST_ROW_SELECTORS, root: Element, prev: {
    first?: Element;
    last?: Element;
}): {
    first?: Element;
    last?: Element;
};
export {};
