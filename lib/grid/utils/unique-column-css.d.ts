import { CdkColumnDef } from '@angular/cdk/table';
import { PblColumnTypeDefinition } from '@asafmalin/ngrid/core';
/**
 * Returns a css class unique to the column
 */
export declare function uniqueColumnCss(columnDef: CdkColumnDef): string;
/**
 * Returns a css class unique to the type of the column (columns might share types)
 */
export declare function uniqueColumnTypeCss(type: PblColumnTypeDefinition): string;
