declare module '@asafmalin/ngrid/lib/grid/column/model/column' {
    interface PblColumn {
        reorder: boolean;
        /**
         * When true, the item can be reordered based on the `reorder` property but
         * will not move (budge) when other items are reordered.
         */
        wontBudge: boolean;
        /**
         * Checks if the by switching between this column and the provided column the `lockColumns` constraint is triggered.
         * The lockColumns constraint is set on a group and restrict splitting of groups.
         * A Column with a locked group will not be allowed to leave the group nor new items are allowed that split the group.
         *
         * The process will check both scenarios.
         */
        checkGroupLockConstraint(column: PblColumn): boolean;
    }
}
declare module '@asafmalin/ngrid/lib/grid/column/model/group-column' {
    interface PblColumnGroup {
        /**
         * Lock column in the group, preventing the group from splitting.
         * Splitting is block actively (column from the group dragged outside) and passively (column outside of the group dragging into the group).
         */
        lockColumns?: boolean;
    }
}
declare module '@asafmalin/ngrid/core/lib/models/column' {
    interface PblColumnDefinition {
        reorder?: boolean;
        /**
         * When true, the item can be reordered based on the `reorder` property but
         * will not move (budge) when other items are reordered.
         */
        wontBudge?: boolean;
    }
    interface PblColumnGroupDefinition {
        /**
         * Lock column in the group, preventing the group from splitting.
         * Splitting is block actively (column from the group dragged outside) and passively (column outside of the group dragging into the group).
         */
        lockColumns?: boolean;
    }
}
export declare function colReorderExtendGrid(): void;
