/**
 * Code from angular/material2 repository
 * File: https://github.com/angular/material2/blob/master/src/cdk/drag-drop/drag-styling.ts
 * Commit: https://github.com/angular/material2/blob/9cd3132607b4d5ae242291df41fb02dc7a453da8/src/cdk/drag-drop/drag-styling.ts
 *
 * This code is not public but required for the drag so duplicated here.
 **/
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
declare type Writeable<T> = {
    -readonly [P in keyof T]-?: T[P];
};
/**
 * Extended CSSStyleDeclaration that includes a couple of drag-related
 * properties that aren't in the built-in TS typings.
 */
export interface DragCSSStyleDeclaration extends CSSStyleDeclaration {
    webkitUserDrag: string;
    MozUserSelect: string;
    msScrollSnapType: string;
    scrollSnapType: string;
    msUserSelect: string;
    webkitTapHighlightColor: string;
}
/**
 * Shallow-extends a stylesheet object with another stylesheet object.
 * @docs-private
 */
export declare function extendStyles(dest: Writeable<CSSStyleDeclaration>, source: Partial<DragCSSStyleDeclaration>): Writeable<CSSStyleDeclaration>;
/**
 * Toggles whether the native drag interactions should be enabled for an element.
 * @param element Element on which to toggle the drag interactions.
 * @param enable Whether the drag interactions should be enabled.
 * @docs-private
 */
export declare function toggleNativeDragInteractions(element: HTMLElement, enable: boolean): void;
export {};
