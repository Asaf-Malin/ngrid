declare module '@pebula/ngrid/lib/grid/column/model/column' {
    interface PblColumn {
        resize: boolean;
    }
}
declare module '@pebula/ngrid/core/lib/models/column' {
    interface PblColumnDefinition {
        resize?: boolean;
    }
}
export declare function colResizeExtendGrid(): void;
