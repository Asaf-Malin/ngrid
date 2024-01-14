import { PblColumn } from '@asafmalin/ngrid';

declare module '@asafmalin/ngrid/lib/grid/column/model/column' {
  interface PblColumn {
    resize: boolean;
  }
}


declare module '@asafmalin/ngrid/core/lib/models/column' {
  interface PblColumnDefinition {
    resize?: boolean;
  }
}

export function colResizeExtendGrid(): void {
  PblColumn.extendProperty('resize');
}
