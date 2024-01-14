// This code is taken from an historical point in the angular repo
// It no longer exists and class/style diffing is done internally in the core package embedded into the renderer.
//
// The code was taken from https://github.com/angular/angular/blob/2961bf06c61c78695d453b05fe6d5dd8a4f91da8/packages/common/src/directives/styling_differ.ts
// And was removed in https://github.com/angular/angular/tree/69de7680f5e08165800d4db399949ea6bdff48d9
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Used to diff and convert ngStyle/ngClass instructions into [style] and [class] bindings.
 *
 * ngStyle and ngClass both accept various forms of input and behave differently than that
 * of how [style] and [class] behave in Angular.
 *
 * The differences are:
 *  - ngStyle and ngClass both **deep-watch** their binding values for changes each time CD runs
 *    while [style] and [class] bindings do not (they check for identity changes)
 *  - ngStyle allows for unit-based keys (e.g. `{'max-width.px':value}`) and [style] does not
 *  - ngClass supports arrays of class values and [class] only accepts map and string values
 *  - ngClass allows for multiple className keys (space-separated) within an array or map
 *     (as the * key) while [class] only accepts a simple key/value map object
 *
 * Having Angular understand and adapt to all the different forms of behavior is complicated
 * and unnecessary. Instead, ngClass and ngStyle should have their input values be converted
 * into something that the core-level [style] and [class] bindings understand.
 *
 * This [StylingDiffer] class handles this conversion by creating a new output value each time
 * the input value of the binding value has changed (either via identity change or deep collection
 * content change).
 *
 * ## Why do we care about ngStyle/ngClass?
 * The styling algorithm code (documented inside of `render3/interfaces/styling.ts`) needs to
 * respect and understand the styling values emitted through ngStyle and ngClass (when they
 * are present and used in a template).
 *
 * Instead of having these directives manage styling on their own, they should be included
 * into the Angular styling algorithm that exists for [style] and [class] bindings.
 *
 * Here's why:
 *
 * - If ngStyle/ngClass is used in combination with [style]/[class] bindings then the
 *   styles and classes would fall out of sync and be applied and updated at
 *   inconsistent times
 * - Both ngClass/ngStyle should respect [class.name] and [style.prop] bindings (and not arbitrarily
 *   overwrite their changes)
 *
 *   ```
 *   <!-- if `w1` is updated then it will always override `w2`
 *        if `w2` is updated then it will always override `w1`
 *        if both are updated at the same time then `w1` wins -->
 *   <div [ngStyle]="{width:w1}" [style.width]="w2">...</div>
 *
 *   <!-- if `w1` is updated then it will always lose to `w2`
 *        if `w2` is updated then it will always override `w1`
 *        if both are updated at the same time then `w2` wins -->
 *   <div [style]="{width:w1}" [style.width]="w2">...</div>
 *   ```
 * - ngClass/ngStyle were written as a directives and made use of maps, closures and other
 *   expensive data structures which were evaluated each time CD runs
 */
export class StylingDiffer {
    constructor(_name, _options) {
        this._name = _name;
        this._options = _options;
        /**
         * Normalized string map representing the last value set via `setValue()` or null if no value has
         * been set or the last set value was null
         */
        this.value = null;
        /**
         * The last set value that was applied via `setValue()`
         */
        this._inputValue = null;
        /**
         * The type of value that the `_lastSetValue` variable is
         */
        this._inputValueType = 0 /* StylingDifferValueTypes.Null */;
        /**
         * Whether or not the last value change occurred because the variable itself changed reference
         * (identity)
         */
        this._inputValueIdentityChangeSinceLastCheck = false;
    }
    /**
     * Sets the input value for the differ and updates the output value if necessary.
     *
     * @param value the new styling input value provided from the ngClass/ngStyle binding
     */
    setInput(value) {
        if (value !== this._inputValue) {
            let type;
            if (!value) { // matches empty strings, null, false and undefined
                type = 0 /* StylingDifferValueTypes.Null */;
                value = null;
            }
            else if (Array.isArray(value)) {
                type = 4 /* StylingDifferValueTypes.Array */;
            }
            else if (value instanceof Set) {
                type = 8 /* StylingDifferValueTypes.Set */;
            }
            else if (typeof value === 'string') {
                if (!(this._options & 4 /* StylingDifferOptions.AllowStringValue */)) {
                    throw new Error(this._name + ' string values are not allowed');
                }
                type = 1 /* StylingDifferValueTypes.String */;
            }
            else {
                type = 2 /* StylingDifferValueTypes.StringMap */;
            }
            this._inputValue = value;
            this._inputValueType = type;
            this._inputValueIdentityChangeSinceLastCheck = true;
            this._processValueChange(true);
        }
    }
    /**
     * Checks the input value for identity or deep changes and updates output value if necessary.
     *
     * This function can be called right after `setValue()` is called, but it can also be
     * called incase the existing value (if it's a collection) changes internally. If the
     * value is indeed a collection it will do the necessary diffing work and produce a
     * new object value as assign that to `value`.
     *
     * @returns whether or not the value has changed in some way.
     */
    updateValue() {
        let valueHasChanged = this._inputValueIdentityChangeSinceLastCheck;
        if (!this._inputValueIdentityChangeSinceLastCheck &&
            (this._inputValueType & 14 /* StylingDifferValueTypes.Collection */)) {
            valueHasChanged = this._processValueChange(false);
        }
        else {
            // this is set to false in the event that the value is a collection.
            // This way (if the identity hasn't changed), then the algorithm can
            // diff the collection value to see if the contents have mutated
            // (otherwise the value change was processed during the time when
            // the variable changed).
            this._inputValueIdentityChangeSinceLastCheck = false;
        }
        return valueHasChanged;
    }
    /**
     * Examines the last set value to see if there was a change in content.
     *
     * @param inputValueIdentityChanged whether or not the last set value changed in identity or not
     * @returns `true` when the value has changed (either by identity or by shape if its a
     * collection)
     */
    _processValueChange(inputValueIdentityChanged) {
        // if the inputValueIdentityChanged then we know that input has changed
        let inputChanged = inputValueIdentityChanged;
        let newOutputValue = null;
        const trimValues = (this._options & 1 /* StylingDifferOptions.TrimProperties */) ? true : false;
        const parseOutUnits = (this._options & 8 /* StylingDifferOptions.AllowUnits */) ? true : false;
        const allowSubKeys = (this._options & 2 /* StylingDifferOptions.AllowSubKeys */) ? true : false;
        switch (this._inputValueType) {
            // case 1: [input]="string"
            case 1 /* StylingDifferValueTypes.String */: {
                if (inputValueIdentityChanged) {
                    // process string input only if the identity has changed since the strings are immutable
                    const keys = this._inputValue.split(/\s+/g);
                    if (this._options & 16 /* StylingDifferOptions.ForceAsMap */) {
                        newOutputValue = {};
                        for (let i = 0; i < keys.length; i++) {
                            newOutputValue[keys[i]] = true;
                        }
                    }
                    else {
                        newOutputValue = keys.join(' ');
                    }
                }
                break;
            }
            // case 2: [input]="{key:value}"
            case 2 /* StylingDifferValueTypes.StringMap */: {
                const inputMap = this._inputValue;
                const inputKeys = Object.keys(inputMap);
                if (!inputValueIdentityChanged) {
                    // if StringMap and the identity has not changed then output value must have already been
                    // initialized to a StringMap, so we can safely compare the input and output maps
                    inputChanged = mapsAreEqual(inputKeys, inputMap, this.value);
                }
                if (inputChanged) {
                    newOutputValue = bulidMapFromStringMap(trimValues, parseOutUnits, allowSubKeys, inputMap, inputKeys);
                }
                break;
            }
            // case 3a: [input]="[str1, str2, ...]"
            // case 3b: [input]="Set"
            case 4 /* StylingDifferValueTypes.Array */:
            case 8 /* StylingDifferValueTypes.Set */: {
                const inputKeys = Array.from(this._inputValue);
                if (!inputValueIdentityChanged) {
                    const outputKeys = Object.keys(this.value);
                    inputChanged = !keyArraysAreEqual(outputKeys, inputKeys);
                }
                if (inputChanged) {
                    newOutputValue =
                        bulidMapFromStringArray(this._name, trimValues, allowSubKeys, inputKeys);
                }
                break;
            }
            // case 4: [input]="null|undefined"
            default:
                inputChanged = inputValueIdentityChanged;
                newOutputValue = null;
                break;
        }
        if (inputChanged) {
            // update the readonly `value` property by casting it to `any` first
            this.value = newOutputValue;
        }
        return inputChanged;
    }
}
/**
 * @param trim whether the keys should be trimmed of leading or trailing whitespace
 * @param parseOutUnits whether units like "px" should be parsed out of the key name and appended to
 *   the value
 * @param allowSubKeys whether key needs to be subsplit by whitespace into multiple keys
 * @param values values of the map
 * @param keys keys of the map
 * @return a normalized string map based on the input string map
 */
function bulidMapFromStringMap(trim, parseOutUnits, allowSubKeys, values, keys) {
    const map = {};
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let value = values[key];
        if (value !== undefined) {
            if (typeof value !== 'boolean') {
                value = '' + value;
            }
            // Map uses untrimmed keys, so don't trim until passing to `setMapValues`
            setMapValues(map, trim ? key.trim() : key, value, parseOutUnits, allowSubKeys);
        }
    }
    return map;
}
/**
 * @param trim whether the keys should be trimmed of leading or trailing whitespace
 * @param parseOutUnits whether units like "px" should be parsed out of the key name and appended to
 *   the value
 * @param allowSubKeys whether key needs to be subsplit by whitespace into multiple keys
 * @param values values of the map
 * @param keys keys of the map
 * @return a normalized string map based on the input string array
 */
function bulidMapFromStringArray(errorPrefix, trim, allowSubKeys, keys) {
    const map = {};
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        // ngDevMode && assertValidValue(errorPrefix, key);
        key = trim ? key.trim() : key;
        setMapValues(map, key, true, false, allowSubKeys);
    }
    return map;
}
function assertValidValue(errorPrefix, value) {
    if (typeof value !== 'string') {
        throw new Error(`${errorPrefix} can only toggle CSS classes expressed as strings, got: ${value}`);
    }
}
function setMapValues(map, key, value, parseOutUnits, allowSubKeys) {
    if (allowSubKeys && key.indexOf(' ') > 0) {
        const innerKeys = key.split(/\s+/g);
        for (let j = 0; j < innerKeys.length; j++) {
            setIndividualMapValue(map, innerKeys[j], value, parseOutUnits);
        }
    }
    else {
        setIndividualMapValue(map, key, value, parseOutUnits);
    }
}
function setIndividualMapValue(map, key, value, parseOutUnits) {
    if (parseOutUnits && typeof value === 'string') {
        // parse out the unit (e.g. ".px") from the key and append it to the value
        // e.g. for [width.px]="40" => ["width","40px"]
        const unitIndex = key.indexOf('.');
        if (unitIndex > 0) {
            const unit = key.substr(unitIndex + 1); // skip over the "." in "width.px"
            key = key.substring(0, unitIndex);
            value += unit;
        }
    }
    map[key] = value;
}
/**
 * Compares two maps and returns true if they are equal
 *
 * @param inputKeys value of `Object.keys(inputMap)` it's unclear if this actually performs better
 * @param inputMap map to compare
 * @param outputMap map to compare
 */
function mapsAreEqual(inputKeys, inputMap, outputMap) {
    const outputKeys = Object.keys(outputMap);
    if (inputKeys.length !== outputKeys.length) {
        return true;
    }
    for (let i = 0, n = inputKeys.length; i <= n; i++) {
        let key = inputKeys[i];
        if (key !== outputKeys[i] || inputMap[key] !== outputMap[key]) {
            return true;
        }
    }
    return false;
}
/**
 * Compares two Object.keys() arrays and returns true if they are equal.
 *
 * @param keyArray1 Object.keys() array to compare
 * @param keyArray1 Object.keys() array to compare
 */
function keyArraysAreEqual(keyArray1, keyArray2) {
    if (!Array.isArray(keyArray1) || !Array.isArray(keyArray2)) {
        return false;
    }
    if (keyArray1.length !== keyArray2.length) {
        return false;
    }
    for (let i = 0; i < keyArray1.length; i++) {
        if (keyArray1[i] !== keyArray2[i]) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZy5kaWZmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL2NvcmUvc3JjL2xpYi91dGlscy9zdHlsaW5nLmRpZmZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxrRUFBa0U7QUFDbEUsaUhBQWlIO0FBQ2pILEVBQUU7QUFDRiw0SkFBNEo7QUFDNUosc0dBQXNHO0FBRXRHOzs7Ozs7R0FNRztBQUVIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtREc7QUFDSCxNQUFNLE9BQU8sYUFBYTtJQXVCeEIsWUFBb0IsS0FBYSxFQUFVLFFBQThCO1FBQXJELFVBQUssR0FBTCxLQUFLLENBQVE7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFzQjtRQXRCekU7OztXQUdHO1FBQ2EsVUFBSyxHQUFXLElBQUksQ0FBQztRQUVyQzs7V0FFRztRQUNLLGdCQUFXLEdBQXVDLElBQUksQ0FBQztRQUUvRDs7V0FFRztRQUNLLG9CQUFlLHdDQUF5RDtRQUVoRjs7O1dBR0c7UUFDSyw0Q0FBdUMsR0FBRyxLQUFLLENBQUM7SUFFb0IsQ0FBQztJQUU3RTs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLEtBQXlDO1FBQ2hELElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDOUIsSUFBSSxJQUE2QixDQUFDO1lBQ2xDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRyxtREFBbUQ7Z0JBQ2hFLElBQUksdUNBQStCLENBQUM7Z0JBQ3BDLEtBQUssR0FBRyxJQUFJLENBQUM7YUFDZDtpQkFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQy9CLElBQUksd0NBQWdDLENBQUM7YUFDdEM7aUJBQU0sSUFBSSxLQUFLLFlBQVksR0FBRyxFQUFFO2dCQUMvQixJQUFJLHNDQUE4QixDQUFDO2FBQ3BDO2lCQUFNLElBQUks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LE1BQU0sS0FBSyxTQUFTLENBQUMsTUFBTSxFQUFFO1FBQ3pDLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN6QyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDakMsT0FBTyxLQUFLLENBQUM7U0FDZDtLQUNGO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhpcyBjb2RlIGlzIHRha2VuIGZyb20gYW4gaGlzdG9yaWNhbCBwb2ludCBpbiB0aGUgYW5ndWxhciByZXBvXG4vLyBJdCBubyBsb25nZXIgZXhpc3RzIGFuZCBjbGFzcy9zdHlsZSBkaWZmaW5nIGlzIGRvbmUgaW50ZXJuYWxseSBpbiB0aGUgY29yZSBwYWNrYWdlIGVtYmVkZGVkIGludG8gdGhlIHJlbmRlcmVyLlxuLy9cbi8vIFRoZSBjb2RlIHdhcyB0YWtlbiBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvYmxvYi8yOTYxYmYwNmM2MWM3ODY5NWQ0NTNiMDVmZTZkNWRkOGE0ZjkxZGE4L3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9zdHlsaW5nX2RpZmZlci50c1xuLy8gQW5kIHdhcyByZW1vdmVkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvdHJlZS82OWRlNzY4MGY1ZTA4MTY1ODAwZDRkYjM5OTk0OWVhNmJkZmY0OGQ5XG5cbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBVc2VkIHRvIGRpZmYgYW5kIGNvbnZlcnQgbmdTdHlsZS9uZ0NsYXNzIGluc3RydWN0aW9ucyBpbnRvIFtzdHlsZV0gYW5kIFtjbGFzc10gYmluZGluZ3MuXG4gKlxuICogbmdTdHlsZSBhbmQgbmdDbGFzcyBib3RoIGFjY2VwdCB2YXJpb3VzIGZvcm1zIG9mIGlucHV0IGFuZCBiZWhhdmUgZGlmZmVyZW50bHkgdGhhbiB0aGF0XG4gKiBvZiBob3cgW3N0eWxlXSBhbmQgW2NsYXNzXSBiZWhhdmUgaW4gQW5ndWxhci5cbiAqXG4gKiBUaGUgZGlmZmVyZW5jZXMgYXJlOlxuICogIC0gbmdTdHlsZSBhbmQgbmdDbGFzcyBib3RoICoqZGVlcC13YXRjaCoqIHRoZWlyIGJpbmRpbmcgdmFsdWVzIGZvciBjaGFuZ2VzIGVhY2ggdGltZSBDRCBydW5zXG4gKiAgICB3aGlsZSBbc3R5bGVdIGFuZCBbY2xhc3NdIGJpbmRpbmdzIGRvIG5vdCAodGhleSBjaGVjayBmb3IgaWRlbnRpdHkgY2hhbmdlcylcbiAqICAtIG5nU3R5bGUgYWxsb3dzIGZvciB1bml0LWJhc2VkIGtleXMgKGUuZy4gYHsnbWF4LXdpZHRoLnB4Jzp2YWx1ZX1gKSBhbmQgW3N0eWxlXSBkb2VzIG5vdFxuICogIC0gbmdDbGFzcyBzdXBwb3J0cyBhcnJheXMgb2YgY2xhc3MgdmFsdWVzIGFuZCBbY2xhc3NdIG9ubHkgYWNjZXB0cyBtYXAgYW5kIHN0cmluZyB2YWx1ZXNcbiAqICAtIG5nQ2xhc3MgYWxsb3dzIGZvciBtdWx0aXBsZSBjbGFzc05hbWUga2V5cyAoc3BhY2Utc2VwYXJhdGVkKSB3aXRoaW4gYW4gYXJyYXkgb3IgbWFwXG4gKiAgICAgKGFzIHRoZSAqIGtleSkgd2hpbGUgW2NsYXNzXSBvbmx5IGFjY2VwdHMgYSBzaW1wbGUga2V5L3ZhbHVlIG1hcCBvYmplY3RcbiAqXG4gKiBIYXZpbmcgQW5ndWxhciB1bmRlcnN0YW5kIGFuZCBhZGFwdCB0byBhbGwgdGhlIGRpZmZlcmVudCBmb3JtcyBvZiBiZWhhdmlvciBpcyBjb21wbGljYXRlZFxuICogYW5kIHVubmVjZXNzYXJ5LiBJbnN0ZWFkLCBuZ0NsYXNzIGFuZCBuZ1N0eWxlIHNob3VsZCBoYXZlIHRoZWlyIGlucHV0IHZhbHVlcyBiZSBjb252ZXJ0ZWRcbiAqIGludG8gc29tZXRoaW5nIHRoYXQgdGhlIGNvcmUtbGV2ZWwgW3N0eWxlXSBhbmQgW2NsYXNzXSBiaW5kaW5ncyB1bmRlcnN0YW5kLlxuICpcbiAqIFRoaXMgW1N0eWxpbmdEaWZmZXJdIGNsYXNzIGhhbmRsZXMgdGhpcyBjb252ZXJzaW9uIGJ5IGNyZWF0aW5nIGEgbmV3IG91dHB1dCB2YWx1ZSBlYWNoIHRpbWVcbiAqIHRoZSBpbnB1dCB2YWx1ZSBvZiB0aGUgYmluZGluZyB2YWx1ZSBoYXMgY2hhbmdlZCAoZWl0aGVyIHZpYSBpZGVudGl0eSBjaGFuZ2Ugb3IgZGVlcCBjb2xsZWN0aW9uXG4gKiBjb250ZW50IGNoYW5nZSkuXG4gKlxuICogIyMgV2h5IGRvIHdlIGNhcmUgYWJvdXQgbmdTdHlsZS9uZ0NsYXNzP1xuICogVGhlIHN0eWxpbmcgYWxnb3JpdGhtIGNvZGUgKGRvY3VtZW50ZWQgaW5zaWRlIG9mIGByZW5kZXIzL2ludGVyZmFjZXMvc3R5bGluZy50c2ApIG5lZWRzIHRvXG4gKiByZXNwZWN0IGFuZCB1bmRlcnN0YW5kIHRoZSBzdHlsaW5nIHZhbHVlcyBlbWl0dGVkIHRocm91Z2ggbmdTdHlsZSBhbmQgbmdDbGFzcyAod2hlbiB0aGV5XG4gKiBhcmUgcHJlc2VudCBhbmQgdXNlZCBpbiBhIHRlbXBsYXRlKS5cbiAqXG4gKiBJbnN0ZWFkIG9mIGhhdmluZyB0aGVzZSBkaXJlY3RpdmVzIG1hbmFnZSBzdHlsaW5nIG9uIHRoZWlyIG93biwgdGhleSBzaG91bGQgYmUgaW5jbHVkZWRcbiAqIGludG8gdGhlIEFuZ3VsYXIgc3R5bGluZyBhbGdvcml0aG0gdGhhdCBleGlzdHMgZm9yIFtzdHlsZV0gYW5kIFtjbGFzc10gYmluZGluZ3MuXG4gKlxuICogSGVyZSdzIHdoeTpcbiAqXG4gKiAtIElmIG5nU3R5bGUvbmdDbGFzcyBpcyB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggW3N0eWxlXS9bY2xhc3NdIGJpbmRpbmdzIHRoZW4gdGhlXG4gKiAgIHN0eWxlcyBhbmQgY2xhc3NlcyB3b3VsZCBmYWxsIG91dCBvZiBzeW5jIGFuZCBiZSBhcHBsaWVkIGFuZCB1cGRhdGVkIGF0XG4gKiAgIGluY29uc2lzdGVudCB0aW1lc1xuICogLSBCb3RoIG5nQ2xhc3MvbmdTdHlsZSBzaG91bGQgcmVzcGVjdCBbY2xhc3MubmFtZV0gYW5kIFtzdHlsZS5wcm9wXSBiaW5kaW5ncyAoYW5kIG5vdCBhcmJpdHJhcmlseVxuICogICBvdmVyd3JpdGUgdGhlaXIgY2hhbmdlcylcbiAqXG4gKiAgIGBgYFxuICogICA8IS0tIGlmIGB3MWAgaXMgdXBkYXRlZCB0aGVuIGl0IHdpbGwgYWx3YXlzIG92ZXJyaWRlIGB3MmBcbiAqICAgICAgICBpZiBgdzJgIGlzIHVwZGF0ZWQgdGhlbiBpdCB3aWxsIGFsd2F5cyBvdmVycmlkZSBgdzFgXG4gKiAgICAgICAgaWYgYm90aCBhcmUgdXBkYXRlZCBhdCB0aGUgc2FtZSB0aW1lIHRoZW4gYHcxYCB3aW5zIC0tPlxuICogICA8ZGl2IFtuZ1N0eWxlXT1cInt3aWR0aDp3MX1cIiBbc3R5bGUud2lkdGhdPVwidzJcIj4uLi48L2Rpdj5cbiAqXG4gKiAgIDwhLS0gaWYgYHcxYCBpcyB1cGRhdGVkIHRoZW4gaXQgd2lsbCBhbHdheXMgbG9zZSB0byBgdzJgXG4gKiAgICAgICAgaWYgYHcyYCBpcyB1cGRhdGVkIHRoZW4gaXQgd2lsbCBhbHdheXMgb3ZlcnJpZGUgYHcxYFxuICogICAgICAgIGlmIGJvdGggYXJlIHVwZGF0ZWQgYXQgdGhlIHNhbWUgdGltZSB0aGVuIGB3MmAgd2lucyAtLT5cbiAqICAgPGRpdiBbc3R5bGVdPVwie3dpZHRoOncxfVwiIFtzdHlsZS53aWR0aF09XCJ3MlwiPi4uLjwvZGl2PlxuICogICBgYGBcbiAqIC0gbmdDbGFzcy9uZ1N0eWxlIHdlcmUgd3JpdHRlbiBhcyBhIGRpcmVjdGl2ZXMgYW5kIG1hZGUgdXNlIG9mIG1hcHMsIGNsb3N1cmVzIGFuZCBvdGhlclxuICogICBleHBlbnNpdmUgZGF0YSBzdHJ1Y3R1cmVzIHdoaWNoIHdlcmUgZXZhbHVhdGVkIGVhY2ggdGltZSBDRCBydW5zXG4gKi9cbmV4cG9ydCBjbGFzcyBTdHlsaW5nRGlmZmVyPFQgZXh0ZW5kcyh7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVsbH0gfCB7W2tleTogc3RyaW5nXTogdHJ1ZX0pPiB7XG4gIC8qKlxuICAgKiBOb3JtYWxpemVkIHN0cmluZyBtYXAgcmVwcmVzZW50aW5nIHRoZSBsYXN0IHZhbHVlIHNldCB2aWEgYHNldFZhbHVlKClgIG9yIG51bGwgaWYgbm8gdmFsdWUgaGFzXG4gICAqIGJlZW4gc2V0IG9yIHRoZSBsYXN0IHNldCB2YWx1ZSB3YXMgbnVsbFxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IHZhbHVlOiBUfG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgbGFzdCBzZXQgdmFsdWUgdGhhdCB3YXMgYXBwbGllZCB2aWEgYHNldFZhbHVlKClgXG4gICAqL1xuICBwcml2YXRlIF9pbnB1dFZhbHVlOiBUfHN0cmluZ3xzdHJpbmdbXXxTZXQ8c3RyaW5nPnxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogVGhlIHR5cGUgb2YgdmFsdWUgdGhhdCB0aGUgYF9sYXN0U2V0VmFsdWVgIHZhcmlhYmxlIGlzXG4gICAqL1xuICBwcml2YXRlIF9pbnB1dFZhbHVlVHlwZTogU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMgPSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5OdWxsO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG9yIG5vdCB0aGUgbGFzdCB2YWx1ZSBjaGFuZ2Ugb2NjdXJyZWQgYmVjYXVzZSB0aGUgdmFyaWFibGUgaXRzZWxmIGNoYW5nZWQgcmVmZXJlbmNlXG4gICAqIChpZGVudGl0eSlcbiAgICovXG4gIHByaXZhdGUgX2lucHV0VmFsdWVJZGVudGl0eUNoYW5nZVNpbmNlTGFzdENoZWNrID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbmFtZTogc3RyaW5nLCBwcml2YXRlIF9vcHRpb25zOiBTdHlsaW5nRGlmZmVyT3B0aW9ucykge31cblxuICAvKipcbiAgICogU2V0cyB0aGUgaW5wdXQgdmFsdWUgZm9yIHRoZSBkaWZmZXIgYW5kIHVwZGF0ZXMgdGhlIG91dHB1dCB2YWx1ZSBpZiBuZWNlc3NhcnkuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSB0aGUgbmV3IHN0eWxpbmcgaW5wdXQgdmFsdWUgcHJvdmlkZWQgZnJvbSB0aGUgbmdDbGFzcy9uZ1N0eWxlIGJpbmRpbmdcbiAgICovXG4gIHNldElucHV0KHZhbHVlOiBUfHN0cmluZ1tdfHN0cmluZ3xTZXQ8c3RyaW5nPnxudWxsKTogdm9pZCB7XG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLl9pbnB1dFZhbHVlKSB7XG4gICAgICBsZXQgdHlwZTogU3R5bGluZ0RpZmZlclZhbHVlVHlwZXM7XG4gICAgICBpZiAoIXZhbHVlKSB7ICAvLyBtYXRjaGVzIGVtcHR5IHN0cmluZ3MsIG51bGwsIGZhbHNlIGFuZCB1bmRlZmluZWRcbiAgICAgICAgdHlwZSA9IFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLk51bGw7XG4gICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgdHlwZSA9IFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLkFycmF5O1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICB0eXBlID0gU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuU2V0O1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmICghKHRoaXMuX29wdGlvbnMgJiBTdHlsaW5nRGlmZmVyT3B0aW9ucy5BbGxvd1N0cmluZ1ZhbHVlKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcih0aGlzLl9uYW1lICsgJyBzdHJpbmcgdmFsdWVzIGFyZSBub3QgYWxsb3dlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHR5cGUgPSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5TdHJpbmc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlID0gU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuU3RyaW5nTWFwO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9pbnB1dFZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzLl9pbnB1dFZhbHVlVHlwZSA9IHR5cGU7XG4gICAgICB0aGlzLl9pbnB1dFZhbHVlSWRlbnRpdHlDaGFuZ2VTaW5jZUxhc3RDaGVjayA9IHRydWU7XG4gICAgICB0aGlzLl9wcm9jZXNzVmFsdWVDaGFuZ2UodHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGUgaW5wdXQgdmFsdWUgZm9yIGlkZW50aXR5IG9yIGRlZXAgY2hhbmdlcyBhbmQgdXBkYXRlcyBvdXRwdXQgdmFsdWUgaWYgbmVjZXNzYXJ5LlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgcmlnaHQgYWZ0ZXIgYHNldFZhbHVlKClgIGlzIGNhbGxlZCwgYnV0IGl0IGNhbiBhbHNvIGJlXG4gICAqIGNhbGxlZCBpbmNhc2UgdGhlIGV4aXN0aW5nIHZhbHVlIChpZiBpdCdzIGEgY29sbGVjdGlvbikgY2hhbmdlcyBpbnRlcm5hbGx5LiBJZiB0aGVcbiAgICogdmFsdWUgaXMgaW5kZWVkIGEgY29sbGVjdGlvbiBpdCB3aWxsIGRvIHRoZSBuZWNlc3NhcnkgZGlmZmluZyB3b3JrIGFuZCBwcm9kdWNlIGFcbiAgICogbmV3IG9iamVjdCB2YWx1ZSBhcyBhc3NpZ24gdGhhdCB0byBgdmFsdWVgLlxuICAgKlxuICAgKiBAcmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmFsdWUgaGFzIGNoYW5nZWQgaW4gc29tZSB3YXkuXG4gICAqL1xuICB1cGRhdGVWYWx1ZSgpOiBib29sZWFuIHtcbiAgICBsZXQgdmFsdWVIYXNDaGFuZ2VkID0gdGhpcy5faW5wdXRWYWx1ZUlkZW50aXR5Q2hhbmdlU2luY2VMYXN0Q2hlY2s7XG4gICAgaWYgKCF0aGlzLl9pbnB1dFZhbHVlSWRlbnRpdHlDaGFuZ2VTaW5jZUxhc3RDaGVjayAmJlxuICAgICAgICAodGhpcy5faW5wdXRWYWx1ZVR5cGUgJiBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5Db2xsZWN0aW9uKSkge1xuICAgICAgdmFsdWVIYXNDaGFuZ2VkID0gdGhpcy5fcHJvY2Vzc1ZhbHVlQ2hhbmdlKGZhbHNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gdGhpcyBpcyBzZXQgdG8gZmFsc2UgaW4gdGhlIGV2ZW50IHRoYXQgdGhlIHZhbHVlIGlzIGEgY29sbGVjdGlvbi5cbiAgICAgIC8vIFRoaXMgd2F5IChpZiB0aGUgaWRlbnRpdHkgaGFzbid0IGNoYW5nZWQpLCB0aGVuIHRoZSBhbGdvcml0aG0gY2FuXG4gICAgICAvLyBkaWZmIHRoZSBjb2xsZWN0aW9uIHZhbHVlIHRvIHNlZSBpZiB0aGUgY29udGVudHMgaGF2ZSBtdXRhdGVkXG4gICAgICAvLyAob3RoZXJ3aXNlIHRoZSB2YWx1ZSBjaGFuZ2Ugd2FzIHByb2Nlc3NlZCBkdXJpbmcgdGhlIHRpbWUgd2hlblxuICAgICAgLy8gdGhlIHZhcmlhYmxlIGNoYW5nZWQpLlxuICAgICAgdGhpcy5faW5wdXRWYWx1ZUlkZW50aXR5Q2hhbmdlU2luY2VMYXN0Q2hlY2sgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlSGFzQ2hhbmdlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGFtaW5lcyB0aGUgbGFzdCBzZXQgdmFsdWUgdG8gc2VlIGlmIHRoZXJlIHdhcyBhIGNoYW5nZSBpbiBjb250ZW50LlxuICAgKlxuICAgKiBAcGFyYW0gaW5wdXRWYWx1ZUlkZW50aXR5Q2hhbmdlZCB3aGV0aGVyIG9yIG5vdCB0aGUgbGFzdCBzZXQgdmFsdWUgY2hhbmdlZCBpbiBpZGVudGl0eSBvciBub3RcbiAgICogQHJldHVybnMgYHRydWVgIHdoZW4gdGhlIHZhbHVlIGhhcyBjaGFuZ2VkIChlaXRoZXIgYnkgaWRlbnRpdHkgb3IgYnkgc2hhcGUgaWYgaXRzIGFcbiAgICogY29sbGVjdGlvbilcbiAgICovXG4gIHByaXZhdGUgX3Byb2Nlc3NWYWx1ZUNoYW5nZShpbnB1dFZhbHVlSWRlbnRpdHlDaGFuZ2VkOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgLy8gaWYgdGhlIGlucHV0VmFsdWVJZGVudGl0eUNoYW5nZWQgdGhlbiB3ZSBrbm93IHRoYXQgaW5wdXQgaGFzIGNoYW5nZWRcbiAgICBsZXQgaW5wdXRDaGFuZ2VkID0gaW5wdXRWYWx1ZUlkZW50aXR5Q2hhbmdlZDtcblxuICAgIGxldCBuZXdPdXRwdXRWYWx1ZTogVHxzdHJpbmd8bnVsbCA9IG51bGw7XG4gICAgY29uc3QgdHJpbVZhbHVlcyA9ICh0aGlzLl9vcHRpb25zICYgU3R5bGluZ0RpZmZlck9wdGlvbnMuVHJpbVByb3BlcnRpZXMpID8gdHJ1ZSA6IGZhbHNlO1xuICAgIGNvbnN0IHBhcnNlT3V0VW5pdHMgPSAodGhpcy5fb3B0aW9ucyAmIFN0eWxpbmdEaWZmZXJPcHRpb25zLkFsbG93VW5pdHMpID8gdHJ1ZSA6IGZhbHNlO1xuICAgIGNvbnN0IGFsbG93U3ViS2V5cyA9ICh0aGlzLl9vcHRpb25zICYgU3R5bGluZ0RpZmZlck9wdGlvbnMuQWxsb3dTdWJLZXlzKSA/IHRydWUgOiBmYWxzZTtcblxuICAgIHN3aXRjaCAodGhpcy5faW5wdXRWYWx1ZVR5cGUpIHtcbiAgICAgIC8vIGNhc2UgMTogW2lucHV0XT1cInN0cmluZ1wiXG4gICAgICBjYXNlIFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLlN0cmluZzoge1xuICAgICAgICBpZiAoaW5wdXRWYWx1ZUlkZW50aXR5Q2hhbmdlZCkge1xuICAgICAgICAgIC8vIHByb2Nlc3Mgc3RyaW5nIGlucHV0IG9ubHkgaWYgdGhlIGlkZW50aXR5IGhhcyBjaGFuZ2VkIHNpbmNlIHRoZSBzdHJpbmdzIGFyZSBpbW11dGFibGVcbiAgICAgICAgICBjb25zdCBrZXlzID0gKHRoaXMuX2lucHV0VmFsdWUgYXMgc3RyaW5nKS5zcGxpdCgvXFxzKy9nKTtcbiAgICAgICAgICBpZiAodGhpcy5fb3B0aW9ucyAmIFN0eWxpbmdEaWZmZXJPcHRpb25zLkZvcmNlQXNNYXApIHtcbiAgICAgICAgICAgIG5ld091dHB1dFZhbHVlID0ge30gYXMgVDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAobmV3T3V0cHV0VmFsdWUgYXMgYW55KVtrZXlzW2ldXSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld091dHB1dFZhbHVlID0ga2V5cy5qb2luKCcgJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgLy8gY2FzZSAyOiBbaW5wdXRdPVwie2tleTp2YWx1ZX1cIlxuICAgICAgY2FzZSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5TdHJpbmdNYXA6IHtcbiAgICAgICAgY29uc3QgaW5wdXRNYXAgPSB0aGlzLl9pbnB1dFZhbHVlIGFzIFQ7XG4gICAgICAgIGNvbnN0IGlucHV0S2V5cyA9IE9iamVjdC5rZXlzKGlucHV0TWFwKTtcblxuICAgICAgICBpZiAoIWlucHV0VmFsdWVJZGVudGl0eUNoYW5nZWQpIHtcbiAgICAgICAgICAvLyBpZiBTdHJpbmdNYXAgYW5kIHRoZSBpZGVudGl0eSBoYXMgbm90IGNoYW5nZWQgdGhlbiBvdXRwdXQgdmFsdWUgbXVzdCBoYXZlIGFscmVhZHkgYmVlblxuICAgICAgICAgIC8vIGluaXRpYWxpemVkIHRvIGEgU3RyaW5nTWFwLCBzbyB3ZSBjYW4gc2FmZWx5IGNvbXBhcmUgdGhlIGlucHV0IGFuZCBvdXRwdXQgbWFwc1xuICAgICAgICAgIGlucHV0Q2hhbmdlZCA9IG1hcHNBcmVFcXVhbChpbnB1dEtleXMsIGlucHV0TWFwLCB0aGlzLnZhbHVlIGFzIFQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlucHV0Q2hhbmdlZCkge1xuICAgICAgICAgIG5ld091dHB1dFZhbHVlID0gYnVsaWRNYXBGcm9tU3RyaW5nTWFwKFxuICAgICAgICAgICAgICB0cmltVmFsdWVzLCBwYXJzZU91dFVuaXRzLCBhbGxvd1N1YktleXMsIGlucHV0TWFwLCBpbnB1dEtleXMpIGFzIFQ7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICAvLyBjYXNlIDNhOiBbaW5wdXRdPVwiW3N0cjEsIHN0cjIsIC4uLl1cIlxuICAgICAgLy8gY2FzZSAzYjogW2lucHV0XT1cIlNldFwiXG4gICAgICBjYXNlIFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLkFycmF5OlxuICAgICAgY2FzZSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5TZXQ6IHtcbiAgICAgICAgY29uc3QgaW5wdXRLZXlzID0gQXJyYXkuZnJvbSh0aGlzLl9pbnB1dFZhbHVlIGFzIHN0cmluZ1tdIHwgU2V0PHN0cmluZz4pO1xuICAgICAgICBpZiAoIWlucHV0VmFsdWVJZGVudGl0eUNoYW5nZWQpIHtcbiAgICAgICAgICBjb25zdCBvdXRwdXRLZXlzID0gT2JqZWN0LmtleXModGhpcy52YWx1ZSAhKTtcbiAgICAgICAgICBpbnB1dENoYW5nZWQgPSAha2V5QXJyYXlzQXJlRXF1YWwob3V0cHV0S2V5cywgaW5wdXRLZXlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXRDaGFuZ2VkKSB7XG4gICAgICAgICAgbmV3T3V0cHV0VmFsdWUgPVxuICAgICAgICAgICAgICBidWxpZE1hcEZyb21TdHJpbmdBcnJheSh0aGlzLl9uYW1lLCB0cmltVmFsdWVzLCBhbGxvd1N1YktleXMsIGlucHV0S2V5cykgYXMgVDtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIC8vIGNhc2UgNDogW2lucHV0XT1cIm51bGx8dW5kZWZpbmVkXCJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlucHV0Q2hhbmdlZCA9IGlucHV0VmFsdWVJZGVudGl0eUNoYW5nZWQ7XG4gICAgICAgIG5ld091dHB1dFZhbHVlID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKGlucHV0Q2hhbmdlZCkge1xuICAgICAgLy8gdXBkYXRlIHRoZSByZWFkb25seSBgdmFsdWVgIHByb3BlcnR5IGJ5IGNhc3RpbmcgaXQgdG8gYGFueWAgZmlyc3RcbiAgICAgICh0aGlzIGFzIGFueSkudmFsdWUgPSBuZXdPdXRwdXRWYWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5wdXRDaGFuZ2VkO1xuICB9XG59XG5cbi8qKlxuICogVmFyaW91cyBvcHRpb25zIHRoYXQgYXJlIGNvbnN1bWVkIGJ5IHRoZSBbU3R5bGluZ0RpZmZlcl0gY2xhc3NcbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gU3R5bGluZ0RpZmZlck9wdGlvbnMge1xuICBOb25lID0gMGIwMDAwMCwgICAgICAgICAgICAgIC8vXG4gIFRyaW1Qcm9wZXJ0aWVzID0gMGIwMDAwMSwgICAgLy9cbiAgQWxsb3dTdWJLZXlzID0gMGIwMDAxMCwgICAgICAvL1xuICBBbGxvd1N0cmluZ1ZhbHVlID0gMGIwMDEwMCwgIC8vXG4gIEFsbG93VW5pdHMgPSAwYjAxMDAwLCAgICAgICAgLy9cbiAgRm9yY2VBc01hcCA9IDBiMTAwMDAsICAgICAgICAvL1xufVxuXG4vKipcbiAqIFRoZSBkaWZmZXJlbnQgdHlwZXMgb2YgaW5wdXRzIHRoYXQgdGhlIFtTdHlsaW5nRGlmZmVyXSBjYW4gZGVhbCB3aXRoXG4gKi9cbmNvbnN0IGVudW0gU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMge1xuICBOdWxsID0gMGIwMDAwLCAgICAgICAgLy9cbiAgU3RyaW5nID0gMGIwMDAxLCAgICAgIC8vXG4gIFN0cmluZ01hcCA9IDBiMDAxMCwgICAvL1xuICBBcnJheSA9IDBiMDEwMCwgICAgICAgLy9cbiAgU2V0ID0gMGIxMDAwLCAgICAgICAgIC8vXG4gIENvbGxlY3Rpb24gPSAwYjExMTAsICAvL1xufVxuXG5cbi8qKlxuICogQHBhcmFtIHRyaW0gd2hldGhlciB0aGUga2V5cyBzaG91bGQgYmUgdHJpbW1lZCBvZiBsZWFkaW5nIG9yIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAqIEBwYXJhbSBwYXJzZU91dFVuaXRzIHdoZXRoZXIgdW5pdHMgbGlrZSBcInB4XCIgc2hvdWxkIGJlIHBhcnNlZCBvdXQgb2YgdGhlIGtleSBuYW1lIGFuZCBhcHBlbmRlZCB0b1xuICogICB0aGUgdmFsdWVcbiAqIEBwYXJhbSBhbGxvd1N1YktleXMgd2hldGhlciBrZXkgbmVlZHMgdG8gYmUgc3Vic3BsaXQgYnkgd2hpdGVzcGFjZSBpbnRvIG11bHRpcGxlIGtleXNcbiAqIEBwYXJhbSB2YWx1ZXMgdmFsdWVzIG9mIHRoZSBtYXBcbiAqIEBwYXJhbSBrZXlzIGtleXMgb2YgdGhlIG1hcFxuICogQHJldHVybiBhIG5vcm1hbGl6ZWQgc3RyaW5nIG1hcCBiYXNlZCBvbiB0aGUgaW5wdXQgc3RyaW5nIG1hcFxuICovXG5mdW5jdGlvbiBidWxpZE1hcEZyb21TdHJpbmdNYXAoXG4gICAgdHJpbTogYm9vbGVhbiwgcGFyc2VPdXRVbml0czogYm9vbGVhbiwgYWxsb3dTdWJLZXlzOiBib29sZWFuLFxuICAgIHZhbHVlczoge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bGwgfCB0cnVlfSxcbiAgICBrZXlzOiBzdHJpbmdbXSk6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudWxsIHwgdHJ1ZX0ge1xuICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudWxsIHwgdHJ1ZX0gPSB7fTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQga2V5ID0ga2V5c1tpXTtcbiAgICBsZXQgdmFsdWUgPSB2YWx1ZXNba2V5XTtcblxuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdmFsdWUgPSAnJyArIHZhbHVlO1xuICAgICAgfVxuICAgICAgLy8gTWFwIHVzZXMgdW50cmltbWVkIGtleXMsIHNvIGRvbid0IHRyaW0gdW50aWwgcGFzc2luZyB0byBgc2V0TWFwVmFsdWVzYFxuICAgICAgc2V0TWFwVmFsdWVzKG1hcCwgdHJpbSA/IGtleS50cmltKCkgOiBrZXksIHZhbHVlLCBwYXJzZU91dFVuaXRzLCBhbGxvd1N1YktleXMpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtYXA7XG59XG5cbi8qKlxuICogQHBhcmFtIHRyaW0gd2hldGhlciB0aGUga2V5cyBzaG91bGQgYmUgdHJpbW1lZCBvZiBsZWFkaW5nIG9yIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAqIEBwYXJhbSBwYXJzZU91dFVuaXRzIHdoZXRoZXIgdW5pdHMgbGlrZSBcInB4XCIgc2hvdWxkIGJlIHBhcnNlZCBvdXQgb2YgdGhlIGtleSBuYW1lIGFuZCBhcHBlbmRlZCB0b1xuICogICB0aGUgdmFsdWVcbiAqIEBwYXJhbSBhbGxvd1N1YktleXMgd2hldGhlciBrZXkgbmVlZHMgdG8gYmUgc3Vic3BsaXQgYnkgd2hpdGVzcGFjZSBpbnRvIG11bHRpcGxlIGtleXNcbiAqIEBwYXJhbSB2YWx1ZXMgdmFsdWVzIG9mIHRoZSBtYXBcbiAqIEBwYXJhbSBrZXlzIGtleXMgb2YgdGhlIG1hcFxuICogQHJldHVybiBhIG5vcm1hbGl6ZWQgc3RyaW5nIG1hcCBiYXNlZCBvbiB0aGUgaW5wdXQgc3RyaW5nIGFycmF5XG4gKi9cbmZ1bmN0aW9uIGJ1bGlkTWFwRnJvbVN0cmluZ0FycmF5KFxuICAgIGVycm9yUHJlZml4OiBzdHJpbmcsIHRyaW06IGJvb2xlYW4sIGFsbG93U3ViS2V5czogYm9vbGVhbixcbiAgICBrZXlzOiBzdHJpbmdbXSk6IHtba2V5OiBzdHJpbmddOiB0cnVlfSB7XG4gIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IHRydWV9ID0ge307XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGtleSA9IGtleXNbaV07XG4gICAgLy8gbmdEZXZNb2RlICYmIGFzc2VydFZhbGlkVmFsdWUoZXJyb3JQcmVmaXgsIGtleSk7XG4gICAga2V5ID0gdHJpbSA/IGtleS50cmltKCkgOiBrZXk7XG4gICAgc2V0TWFwVmFsdWVzKG1hcCwga2V5LCB0cnVlLCBmYWxzZSwgYWxsb3dTdWJLZXlzKTtcbiAgfVxuXG4gIHJldHVybiBtYXA7XG59XG5cbmZ1bmN0aW9uIGFzc2VydFZhbGlkVmFsdWUoZXJyb3JQcmVmaXg6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYCR7ZXJyb3JQcmVmaXh9IGNhbiBvbmx5IHRvZ2dsZSBDU1MgY2xhc3NlcyBleHByZXNzZWQgYXMgc3RyaW5ncywgZ290OiAke3ZhbHVlfWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldE1hcFZhbHVlcyhcbiAgICBtYXA6IHtba2V5OiBzdHJpbmddOiB1bmtub3dufSwga2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBudWxsIHwgdHJ1ZSwgcGFyc2VPdXRVbml0czogYm9vbGVhbixcbiAgICBhbGxvd1N1YktleXM6IGJvb2xlYW4pIHtcbiAgaWYgKGFsbG93U3ViS2V5cyAmJiBrZXkuaW5kZXhPZignICcpID4gMCkge1xuICAgIGNvbnN0IGlubmVyS2V5cyA9IGtleS5zcGxpdCgvXFxzKy9nKTtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGlubmVyS2V5cy5sZW5ndGg7IGorKykge1xuICAgICAgc2V0SW5kaXZpZHVhbE1hcFZhbHVlKG1hcCwgaW5uZXJLZXlzW2pdLCB2YWx1ZSwgcGFyc2VPdXRVbml0cyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHNldEluZGl2aWR1YWxNYXBWYWx1ZShtYXAsIGtleSwgdmFsdWUsIHBhcnNlT3V0VW5pdHMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldEluZGl2aWR1YWxNYXBWYWx1ZShcbiAgICBtYXA6IHtba2V5OiBzdHJpbmddOiB1bmtub3dufSwga2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCB0cnVlIHwgbnVsbCxcbiAgICBwYXJzZU91dFVuaXRzOiBib29sZWFuKSB7XG4gIGlmIChwYXJzZU91dFVuaXRzICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAvLyBwYXJzZSBvdXQgdGhlIHVuaXQgKGUuZy4gXCIucHhcIikgZnJvbSB0aGUga2V5IGFuZCBhcHBlbmQgaXQgdG8gdGhlIHZhbHVlXG4gICAgLy8gZS5nLiBmb3IgW3dpZHRoLnB4XT1cIjQwXCIgPT4gW1wid2lkdGhcIixcIjQwcHhcIl1cbiAgICBjb25zdCB1bml0SW5kZXggPSBrZXkuaW5kZXhPZignLicpO1xuICAgIGlmICh1bml0SW5kZXggPiAwKSB7XG4gICAgICBjb25zdCB1bml0ID0ga2V5LnN1YnN0cih1bml0SW5kZXggKyAxKTsgIC8vIHNraXAgb3ZlciB0aGUgXCIuXCIgaW4gXCJ3aWR0aC5weFwiXG4gICAgICBrZXkgPSBrZXkuc3Vic3RyaW5nKDAsIHVuaXRJbmRleCk7XG4gICAgICB2YWx1ZSArPSB1bml0O1xuICAgIH1cbiAgfVxuICBtYXBba2V5XSA9IHZhbHVlO1xufVxuXG5cbi8qKlxuICogQ29tcGFyZXMgdHdvIG1hcHMgYW5kIHJldHVybnMgdHJ1ZSBpZiB0aGV5IGFyZSBlcXVhbFxuICpcbiAqIEBwYXJhbSBpbnB1dEtleXMgdmFsdWUgb2YgYE9iamVjdC5rZXlzKGlucHV0TWFwKWAgaXQncyB1bmNsZWFyIGlmIHRoaXMgYWN0dWFsbHkgcGVyZm9ybXMgYmV0dGVyXG4gKiBAcGFyYW0gaW5wdXRNYXAgbWFwIHRvIGNvbXBhcmVcbiAqIEBwYXJhbSBvdXRwdXRNYXAgbWFwIHRvIGNvbXBhcmVcbiAqL1xuZnVuY3Rpb24gbWFwc0FyZUVxdWFsKFxuICAgIGlucHV0S2V5czogc3RyaW5nW10sIGlucHV0TWFwOiB7W2tleTogc3RyaW5nXTogdW5rbm93bn0sXG4gICAgb3V0cHV0TWFwOiB7W2tleTogc3RyaW5nXTogdW5rbm93bn0sICk6IGJvb2xlYW4ge1xuICBjb25zdCBvdXRwdXRLZXlzID0gT2JqZWN0LmtleXMob3V0cHV0TWFwKTtcblxuICBpZiAoaW5wdXRLZXlzLmxlbmd0aCAhPT0gb3V0cHV0S2V5cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwLCBuID0gaW5wdXRLZXlzLmxlbmd0aDsgaSA8PSBuOyBpKyspIHtcbiAgICBsZXQga2V5ID0gaW5wdXRLZXlzW2ldO1xuICAgIGlmIChrZXkgIT09IG91dHB1dEtleXNbaV0gfHwgaW5wdXRNYXBba2V5XSAhPT0gb3V0cHV0TWFwW2tleV0pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG4vKipcbiAqIENvbXBhcmVzIHR3byBPYmplY3Qua2V5cygpIGFycmF5cyBhbmQgcmV0dXJucyB0cnVlIGlmIHRoZXkgYXJlIGVxdWFsLlxuICpcbiAqIEBwYXJhbSBrZXlBcnJheTEgT2JqZWN0LmtleXMoKSBhcnJheSB0byBjb21wYXJlXG4gKiBAcGFyYW0ga2V5QXJyYXkxIE9iamVjdC5rZXlzKCkgYXJyYXkgdG8gY29tcGFyZVxuICovXG5mdW5jdGlvbiBrZXlBcnJheXNBcmVFcXVhbChrZXlBcnJheTE6IHN0cmluZ1tdIHwgbnVsbCwga2V5QXJyYXkyOiBzdHJpbmdbXSB8IG51bGwpOiBib29sZWFuIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGtleUFycmF5MSkgfHwgIUFycmF5LmlzQXJyYXkoa2V5QXJyYXkyKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChrZXlBcnJheTEubGVuZ3RoICE9PSBrZXlBcnJheTIubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlBcnJheTEubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoa2V5QXJyYXkxW2ldICE9PSBrZXlBcnJheTJbaV0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==