import { PblColumnTypeDefinitionDataMap } from '@asafmalin/ngrid/core';
export interface PblNgridCellDefDirectiveBase {
    name: string;
    type: keyof PblColumnTypeDefinitionDataMap;
}
