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
export declare function colResizeExtendGrid(): void;
