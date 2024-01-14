declare module './ngrid-component-harness' {
    interface PblNgridHarness {
        /**
         * Takes an immediate snapshot of the current rows rendered in the view and their order. (only stores the row identity, no cell data)
         * and then poll the view to detect when the row have been re-rendered.
         *
         * You can provide a function that will run right after the snapshot, allowing changes to be executed right after the snapshot.
         * The function must return a promise and the promise value will be returned by this method.
         *
         * Optimizing render change detection:
         * Detecting a change in the row rendering state is simple, first a snapshot of current row identities is saves (A collection of strings)
         * and then, for a predefined period of time (timeout) it is sampled against the view at predefined intervals (frequency)
         * You can optimize the process by changing the frequency and/or timeout.
         * A longer timeout means more time to test but allowing more time for render heavy operations
         * A bigger frequency means sampling more often, allowing change to pop faster
         *
         * For example, a timeout of 500 (half second) and frequency of 10 means the view is samples every 50ms, 10 times.
         *
         * > This mimics the `onRenderChanged` event of the `DataSource`.
         *
         * @param fn A function that will return a promise for an operation that might cause a render change
         * @param timeoutMs The total time (in ms) to wait before giving up (default: 500)
         * @param frequency The total number of iterations to sample within the timeout (default: 10)
         */
        waitForRenderChanged<T = undefined>(fn?: () => Promise<T>, timeoutMs?: number, frequency?: number): Promise<T>;
        scrollToLocation(location: ScrollToLocation): Promise<void>;
        scrollTo(x: number, y: number): Promise<void>;
        getColumnIds(): Promise<string[]>;
        getViewPortData(): Promise<string[][]>;
    }
}
export declare enum ScrollToLocation {
    VerticalStart = 0,
    VerticalEnd = 1,
    HorizontalStart = 2,
    HorizontalEnd = 3
}
