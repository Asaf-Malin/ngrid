import { PblColumn } from '../column/model';
import { PblMetaColumnStore } from '../column/management';
import { StaticColumnWidthLogic } from '../column/width-logic/static-column-width';
/**
 * Updates the column sizes of the columns provided based on the column definition metadata for each column.
 * The final width represent a static width, it is the value as set in the definition (except column without width, where the calculated global width is set).
 */
export declare function resetColumnWidths(rowWidth: StaticColumnWidthLogic, tableColumns: PblColumn[], metaColumns: PblMetaColumnStore[]): void;
