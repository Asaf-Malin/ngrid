"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomTheme = void 0;
/** Create custom theme for the given application configuration. */
function createCustomTheme(name = 'app') {
    return `
@use '@asafmalin/ngrid' as ngrid;

$${name}-palette: ngrid.define-palette(ngrid.$blue-palette);

$${name}-theme: ngrid.define-light-theme($${name}-palette);

@include ngrid.ngrid-typography();

@include ngrid.ngrid-theme($${name}-theme);

`;
}
exports.createCustomTheme = createCustomTheme;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWN1c3RvbS10aGVtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc2NoZW1hdGljcy9uZy1hZGQvdGhlbWluZy9jcmVhdGUtY3VzdG9tLXRoZW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILG1FQUFtRTtBQUNuRSxTQUFnQixpQkFBaUIsQ0FBQyxPQUFlLEtBQUs7SUFDdEQsT0FBTzs7O0dBR0osSUFBSTs7R0FFSixJQUFJLHFDQUFxQyxJQUFJOzs7OzhCQUlsQixJQUFJOztDQUVqQyxDQUFDO0FBQ0YsQ0FBQztBQWJELDhDQWFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKiBDcmVhdGUgY3VzdG9tIHRoZW1lIGZvciB0aGUgZ2l2ZW4gYXBwbGljYXRpb24gY29uZmlndXJhdGlvbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDdXN0b21UaGVtZShuYW1lOiBzdHJpbmcgPSAnYXBwJykge1xucmV0dXJuIGBcbkB1c2UgJ0BwZWJ1bGEvbmdyaWQnIGFzIG5ncmlkO1xuXG4kJHtuYW1lfS1wYWxldHRlOiBuZ3JpZC5kZWZpbmUtcGFsZXR0ZShuZ3JpZC4kYmx1ZS1wYWxldHRlKTtcblxuJCR7bmFtZX0tdGhlbWU6IG5ncmlkLmRlZmluZS1saWdodC10aGVtZSgkJHtuYW1lfS1wYWxldHRlKTtcblxuQGluY2x1ZGUgbmdyaWQubmdyaWQtdHlwb2dyYXBoeSgpO1xuXG5AaW5jbHVkZSBuZ3JpZC5uZ3JpZC10aGVtZSgkJHtuYW1lfS10aGVtZSk7XG5cbmA7XG59XG4iXX0=