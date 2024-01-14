export interface PblDetailsRowToggleEvent<T = any> {
    row: T;
    expended: boolean;
    toggle(): void;
}
export declare const PLUGIN_KEY: 'detailRow';
