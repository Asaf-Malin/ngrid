import { filter as filter$1, take, takeUntil, map, tap, debounceTime, switchMap, observeOn, mapTo, skip } from 'rxjs/operators';
import { Subject, BehaviorSubject, combineLatest, of, isObservable, from, asapScheduler, ReplaySubject } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import * as i0 from '@angular/core';
import { InjectionToken, Injectable, Optional, Inject } from '@angular/core';

const eventFilterFactory = (kind) => (o) => o.pipe(filter$1(e => e.kind === kind));
const once = (pipe) => (o) => pipe(o).pipe(take(1));
const ON_CONSTRUCTED = once(eventFilterFactory('onConstructed'));
const ON_INIT = once(eventFilterFactory('onInit'));
const ON_DESTROY = once(eventFilterFactory('onDestroy'));
const ON_BEFORE_INVALIDATE_HEADERS = eventFilterFactory('beforeInvalidateHeaders');
const ON_INVALIDATE_HEADERS = eventFilterFactory('onInvalidateHeaders');
const ON_RESIZE_ROW = eventFilterFactory('onResizeRow');

/**
 * Emits the values emitted by the source observable until a kill signal is sent to the group.
 * You can also specify a `subKillGroup` which can be used to kill specific subscriptions within a group.
 *
 * When a `killGroup` is "killed" all `subKillGroup` are killed as well. When a `subKillGroup` is "killed" the group remains
 * as well as other "subKillGroup" registered for that group.
 *
 * > WARNING: Do not apply operators that subscribe internally (e.g. combineLatest, switchMap) after the `killOnDestroy` operator.
 * Internal subscriptions will not unsubscribe automatically.
 * For more information see {@link https://blog.angularindepth.com/rxjs-avoiding-takeuntil-leaks-fb5182d047ef | this blog post}
 */
function unrx(killGroup, subKillGroup) {
    return unrx.pipe(killGroup, subKillGroup);
}
(function (unrx) {
    const ALL_HANDLERS_TOKEN = {};
    const notifierStore = new WeakMap();
    function getNotifier(component, create = false) {
        let notifier = notifierStore.get(component);
        if (!notifier && create === true) {
            notifierStore.set(component, notifier = new Subject());
        }
        return notifier;
    }
    function kill(killGroup, ...subKillGroup) {
        if (subKillGroup.length === 0) {
            killAll(killGroup);
        }
        else {
            const notifier = getNotifier(killGroup);
            if (notifier) {
                for (const h of subKillGroup) {
                    notifier.next(h);
                }
            }
        }
    }
    unrx.kill = kill;
    /** {@inheritdoc unrx} */
    function pipe(killGroup, subKillGroup) {
        return (source) => source.pipe(takeUntil(getNotifier(killGroup, true).pipe(filter$1(h => h === ALL_HANDLERS_TOKEN || (subKillGroup && h === subKillGroup)))));
    }
    unrx.pipe = pipe;
    function killAll(obj) {
        const notifier = getNotifier(obj);
        if (notifier) {
            notifier.next(ALL_HANDLERS_TOKEN);
            notifier.complete();
            notifierStore.delete(obj);
        }
    }
})(unrx || (unrx = {}));

function removeFromArray(arr, value) {
    if (Array.isArray(value)) {
        return value.map(v => _removeFromArray(arr, v));
    }
    else if (typeof value === 'function') {
        const idx = arr.findIndex(value);
        if (idx > -1) {
            arr.splice(idx, 1);
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return _removeFromArray(arr, value);
    }
}
function _removeFromArray(arr, value) {
    const idx = arr.indexOf(value);
    if (idx > -1) {
        arr.splice(idx, 1);
        return true;
    }
    else {
        return false;
    }
}

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
class StylingDiffer {
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

/**
 * Given an object (item) and a path, returns the value at the path
 */
function deepPathGet(item, col) {
    if (col.path) {
        for (const p of col.path) {
            item = item[p];
            if (!item)
                return;
        }
    }
    return item[col.prop];
}
/**
 * Given an object (item) and a path, returns the value at the path
 */
function deepPathSet(item, col, value) {
    if (col.path) {
        for (const p of col.path) {
            item = item[p];
            if (!item)
                return;
        }
    }
    item[col.prop] = value;
}
function getValue(col, row) {
    if (col.transform) {
        return col.transform(deepPathGet(row, col), row, col);
    }
    return deepPathGet(row, col);
}

class PblTokenPaginator {
    constructor() {
        this.kind = 'token';
        this._perPage = 10;
        this._total = 0;
        this.onChange$ = new BehaviorSubject({ page: [null, null] });
        this.onChange = this.onChange$.asObservable();
        this.reset();
    }
    get perPage() { return this._perPage; }
    set perPage(value) {
        if (value < 1) {
            throw new Error(`Invalid total size value ${value}`);
        }
        if (this._perPage !== value) {
            const changes = { perPage: [this._perPage, this._perPage = value] };
            this.emit(changes);
        }
    }
    get page() { return this._page; }
    set page(value) {
        if (this._page !== value) {
            const idx = this._tokens.indexOf(value);
            if (idx === -1) {
                throw new Error(`Invalid page token ${value}`);
            }
            this._cursor = idx;
            const prev = this._page;
            this._page = value;
            this.emit({ page: [prev, value] });
        }
    }
    get total() { return this._total; }
    set total(value) {
        const changes = { total: [this._total, this._total = value] };
        this.emit(changes);
    }
    get totalPages() {
        return this._tokens.length;
    }
    get range() {
        if (!this._range) {
            const start = (this._cursor) * this.perPage;
            const end = Math.min(this._total, start + this.perPage);
            this._range = this.noCacheMode
                ? [0, end - start]
                : [start, end];
        }
        return this._range;
    }
    reset() {
        this._tokens = [null];
        this._cursor = 0;
        this._total = 0;
        this.page = null;
    }
    canMove(value) {
        return this._tokens.indexOf(value) > -1;
    }
    hasNext() { return this._cursor < this._tokens.length - 1; }
    hasPrev() { return this._cursor > 0; }
    move(value) { this.page = value; }
    nextPage() { this.page = this._tokens[++this._cursor]; }
    prevPage() { this.page = this._tokens[--this._cursor]; }
    addNext(value) {
        const nextPointer = this._cursor + 1;
        // if next pointer is not like what we got, set it and delete all after (invalidate them)
        if (this._tokens[nextPointer] !== value) {
            this._tokens[nextPointer] = value;
            this._tokens.splice(nextPointer + 1);
        }
    }
    emit(changes) {
        this._range = undefined;
        if (this.queuedChanges) {
            Object.assign(this.queuedChanges, changes);
        }
        else {
            this.queuedChanges = changes;
            setTimeout(() => {
                this.queuedChanges = undefined;
                this.onChange$.next(changes);
            });
        }
    }
}

class PblPagingPaginator {
    constructor() {
        this.kind = 'pageNumber';
        this._total = 0;
        this._perPage = 10;
        this._page = 1;
        this._totalPages = 0;
        this.onChange$ = new BehaviorSubject({ page: [null, 1] });
        this.onChange = this.onChange$.asObservable();
    }
    get perPage() { return this._perPage; }
    set perPage(value) {
        if (value < 1) {
            throw new Error(`Invalid total size value ${value}`);
        }
        if (this._perPage !== value) {
            const changes = { perPage: [this._perPage, this._perPage = value] };
            const prev = this._page;
            this.calcPages();
            if (prev !== this._page) {
                changes.page = [prev, this._page];
            }
            this.emit(changes);
        }
    }
    /**
     * Get / Set the current page
     */
    get page() { return this._page; }
    set page(value) {
        if (value < 0 || value > this._totalPages) {
            throw new Error(`Invalid page index ${value}`);
        }
        if (this._page !== value) {
            const prev = this._page;
            this._page = value;
            this.emit({ page: [prev, value] });
        }
    }
    get total() { return this._total; }
    set total(value) {
        if (value < 0) {
            throw new Error(`Invalid total size value ${value}`);
        }
        if (this._total !== value) {
            const changes = { total: [this._total, this._total = value] };
            const prev = this._page;
            this.calcPages();
            if (prev !== this._page) {
                changes.page = [prev, this._page];
            }
            this.emit(changes);
        }
    }
    /**
     * The amount of pages in this paginator
     */
    get totalPages() {
        return this._totalPages;
    }
    get range() {
        if (!this._range) {
            const start = (this.page - 1) * this.perPage;
            const end = Math.min(this._total, start + this.perPage);
            this._range = this.noCacheMode
                ? [0, end - start]
                : [start, end];
        }
        return this._range;
    }
    canMove(value) {
        const p = this._page + value;
        return p >= 1 && p <= this.totalPages;
    }
    hasNext() { return this.canMove(1); }
    hasPrev() { return this.canMove(-1); }
    move(value) { this.page = this._page + value; }
    nextPage() { this.move(1); }
    prevPage() { this.move(-1); }
    reset() {
        this.page = 1;
    }
    /**
     * Calculate the number of pages.
     * returns true if the current page has changed due to calculation. (current page \> new pages value)
     */
    calcPages() {
        this._totalPages = Math.ceil(this._total / this.perPage);
        if (this._totalPages > 0 && this._page > this._totalPages) {
            this.page = this._totalPages;
        }
    }
    emit(changes) {
        this._range = undefined;
        if (this.queuedChanges) {
            Object.assign(this.queuedChanges, changes);
        }
        else {
            this.queuedChanges = changes;
            setTimeout(() => {
                this.queuedChanges = undefined;
                this.onChange$.next(changes);
            });
        }
    }
}

/**
 * Apply sorting on a collection, based on column and sort definitions.
 * If the sort definition doesn't have a sorting function the default sorter is used.
 */
function applySort(column, sort, data) {
    if (!sort || !sort.order) {
        return data;
    }
    const sortFn = typeof sort.sortFn === 'function'
        ? sort.sortFn
        : typeof column.sort === 'function'
            ? column.sort
            : defaultSorter;
    return column && data
        ? sortFn(column, sort, data.slice())
        : data || [];
}
function defaultSorter(column, sort, data) {
    return data.sort((a, b) => {
        const directionMultiplier = (sort.order === 'asc' ? 1 : -1);
        let valueA = getValue(column, a);
        let valueB = getValue(column, b);
        valueA = isNaN(+valueA) ? valueA : +valueA;
        valueB = isNaN(+valueB) ? valueB : +valueB;
        if (valueA && valueB) {
            return (valueA < valueB ? -1 : valueA === valueB ? 0 : 1) * directionMultiplier;
        }
        return (valueA ? 1 : -1) * directionMultiplier;
    });
}

function createFilter(value, columns) {
    return value === undefined
        ? undefined
        : {
            columns,
            type: typeof value === 'function' ? 'predicate' : 'value',
            filter: value
        };
}
function filter(rawData, filter) {
    if (!filter || !rawData || rawData.length === 0) {
        return rawData;
    }
    else {
        const cols = filter.columns;
        if (filter.type === 'predicate') {
            const value = filter.filter;
            return rawData.filter(v => value(v, cols));
        }
        else if (filter.type === 'value') {
            const value = typeof filter.filter.toLowerCase === 'function' ? filter.filter.toLowerCase() : filter.filter;
            return rawData.filter(row => cols.some(col => {
                const predicate = col.filter || genericColumnPredicate;
                return predicate(col.filter ? filter.filter : value, getValue(col, row), row, col);
            }));
        }
    }
    return rawData;
}
/**
 * A generic column predicate that compares the inclusion (text) of the value in the column value.
 */
const genericColumnPredicate = (filterValue, colValue, row, col) => {
    return colValue && colValue.toString().toLowerCase().includes(filterValue);
};

const EMPTY = Object.freeze({});
const DEEP_COMPARATORS = {
    filter(prev, curr) {
        return prev.filter === curr.filter
            && prev.type == curr.type;
        // TODO: deep compare columns
        // && (prev.columns || []).join() === (curr.columns || []).join();
    },
    sort(prev, curr) {
        if (prev.column === curr.column) {
            const pSort = prev.sort || {};
            const cSort = curr.sort || {};
            return pSort.order === cSort.order && pSort.sortFn === cSort.sortFn;
        }
    },
    data(prev, curr) {
        return prev === curr;
    }
};
function fromRefreshDataWrapper(change) {
    return {
        changed: change.changed,
        prev: change.prev.data,
        curr: change.hasOwnProperty('curr') ? change.curr.data : change.prev.data,
    };
}
function createChangeContainer(type, value, cache) {
    if (type === 'pagination') {
        const pagination = (value || {});
        const cached = cache['pagination'];
        // we compare weak because we dont want changes from undefined to null etc...
        const changedKeys = Object.keys(pagination).filter(k => cached[k] != pagination[k][1] && k !== 'total');
        const event = {
            changed: changedKeys.length > 0,
            page: createNotChangedEvent(cached.page),
            perPage: createNotChangedEvent(cached.perPage),
        };
        if (event.changed) {
            for (const k of changedKeys) {
                event[k].changed = true;
                event[k].prev = pagination[k][0];
                event[k].curr = cached[k] = pagination[k][1];
            }
        }
        return event;
    }
    else {
        value = value || EMPTY;
        const cachedValue = cache[type];
        if (value === cachedValue) {
            return createNotChangedEvent(cachedValue);
        }
        else if (value !== EMPTY && cachedValue !== EMPTY) {
            const fn = DEEP_COMPARATORS[type];
            if (fn(cachedValue, value)) {
                return createNotChangedEvent(cachedValue);
            }
        }
        cache[type] = value;
        return { changed: true, prev: cachedValue, curr: value };
    }
}
function createNotChangedEvent(value) {
    return { changed: false, prev: value, curr: value };
}

const CUSTOM_BEHAVIOR_TRIGGER_KEYS = ['sort', 'filter', 'pagination'];
const TRIGGER_KEYS = [...CUSTOM_BEHAVIOR_TRIGGER_KEYS, 'data'];
const SOURCE_CHANGING_TOKEN = {};
const DEFAULT_INITIAL_CACHE_STATE = { filter: EMPTY, sort: EMPTY, pagination: {}, data: EMPTY };
/**
 * An adapter that handles changes
 */
class PblDataSourceAdapter {
    /**
     * A Data Source adapter contains flow logic for the datasource and subsequent emissions of datasource instances.
     * The logic is determined by the combination of the config object and the sourceFactory provided to this adapter, making this adapter actually a container.
     *
     * There are 4 triggers that are responsible for datasource emissions, when one of them is triggered it will invoke the `sourceFactory`
     * returning a new datasource, i.e. a new datasource emission.
     *
     * The triggers are: filter, sort, pagination and refresh.
     *
     * The refresh trigger does not effect the input sent to the `sourceFactory` function, it is just a mean to initiate a call to create a new
     * datasource without changing previous flow variables.
     * It's important to note that calling `sourceFactory` with the same input 2 or more times does not guarantee identical response. For example
     * calling a remote server that might change it's data between calls.
     *
     * All other triggers (3) will change the input sent to the `sourceFactory` function which will use them to return a datasource.
     *
     * The input sent to `sourceFactory` is the values that each of the 3 triggers yields, when one trigger changes a new value for it is sent
     * and the last values of the other 2 triggers is sent with it. i.e. the combination of the last known value for all 3 triggers is sent.
     *
     * To enable smart caching and data management `sourceFactory` does not get the raw values of each trigger. `sourceFactory` will get
     * an event object that contains metadata about each trigger, whether it triggered the change or not as well as old and new values.
     *
     * The returned value from `sourceFactory` is then used as the datasource, applying all triggers that are not overridden by the user.
     * The returned value of `sourceFactory` can be a `DataSourceOf` or `false`.
     *   - `DataSourceOf` means a valid datasource, either observable/promise of array or an array.
     *   - `false` means skip, returning false will instruct the adapter to skip execution for this trigger cycle.
     *
     * Using a trigger is a binary configuration option, when a trigger is turned on it means that changes to it will be passed to the `sourceFactory`.
     * When a trigger is turned off it is not listened to and `undefined` will be sent as a value for it to the `sourceFactory`.
     *
     * The adapter comes with built in flow logic for all 3 triggers, when a trigger is turned off the adapter will take the result of `sourceFactory` and
     * apply the default behavior to it.
     *
     * For all triggers, the default behavior means client implementation. For filtering, client side filtering. For sorting, client side sorting.
     * For Pagination, client side pagination.
     *
     * You can opt in to one or more triggers and implement your own behavior inside the `sourceFactory`
     * @param sourceFactory - A function that returns the datasource based on flow instructions.
     * The instructions are optional, they might or might not exist depending on the configuration of the adapter.
     * When `sourceFactory` returns false the entire trigger cycle is skipped.
     * @param config - A configuration object describing how this adapter should behave.
     */
    constructor(sourceFactory, config) {
        this.sourceFactory = sourceFactory;
        this._inFlight = new Set();
        this._inPreFlight = false;
        this.config = Object.assign({}, config || {});
        this._refresh$ = new Subject();
        this._onSourceChange$ = new Subject();
        this.onSourceChanged = this._onSourceChange$.pipe(filter$1(d => d !== SOURCE_CHANGING_TOKEN));
        this.onSourceChanging = this._onSourceChange$.pipe(filter$1(d => d === SOURCE_CHANGING_TOKEN));
    }
    static hasCustomBehavior(config) {
        for (const key of CUSTOM_BEHAVIOR_TRIGGER_KEYS) {
            if (!!config[key]) {
                return true;
            }
        }
        return false;
    }
    /** Returns true if the event is triggered from a custom behavior (filter, sort and/or pagination and the configuration allows it) */
    static isCustomBehaviorEvent(event, config) {
        for (const key of CUSTOM_BEHAVIOR_TRIGGER_KEYS) {
            if (!!config[key] && event[key].changed) {
                return true;
            }
        }
        return false;
    }
    get inFlight() { return this._inPreFlight || this._inFlight.size > 0; }
    dispose() {
        this._refresh$.complete();
        this._onSourceChange$.complete();
    }
    refresh(data) {
        this._refresh$.next({ data });
    }
    /**
     * Clears the cache from any existing datasource trigger such as filter, sort etc.
     * @returns The cached value or null if not there.
     */
    clearCache(cacheKey) {
      if (this.cache && cacheKey in this.cache) {
            const prev = this.cache[cacheKey];
            this.cache[cacheKey] = DEFAULT_INITIAL_CACHE_STATE[cacheKey];
            return prev;
        }
        else {
            return null;
        }
    }
    setPaginator(paginator) {
        this.paginator = paginator;
    }
    updateProcessingLogic(filter$, sort$, pagination$, initialState = {}) {
        let updates = -1;
        const changedFilter = e => updates === -1 || e.changed;
        const skipUpdate = (o) => o.skipUpdate !== true;
        this._lastSource = undefined;
        this.cache = Object.assign(Object.assign({}, DEFAULT_INITIAL_CACHE_STATE), initialState);
        const combine = [
            filter$.pipe(map(value => createChangeContainer('filter', value, this.cache)), filter$1(changedFilter)),
            sort$.pipe(filter$1(skipUpdate), map(value => createChangeContainer('sort', value, this.cache)), filter$1(changedFilter)),
            pagination$.pipe(map(value => createChangeContainer('pagination', value, this.cache)), filter$1(changedFilter)),
            this._refresh$.pipe(map(value => fromRefreshDataWrapper(createChangeContainer('data', value, this.cache))), filter$1(changedFilter)),
        ];
        const hasCustomBehavior = PblDataSourceAdapter.hasCustomBehavior(this.config);
        return combineLatest([combine[0], combine[1], combine[2], combine[3]])
            .pipe(tap(() => this._inPreFlight = true), 
        // Defer to next loop cycle, until no more incoming.
        // We use an async schedular here (instead of asapSchedular) because we want to have the largest debounce window without compromising integrity
        // With an async schedular we know we will run after all micro-tasks but before "real" async operations.
        debounceTime(0), switchMap(([filterInput, sort, pagination, data]) => {
            this._inPreFlight = false;
            updates++; // if first, will be 0 now (starts from -1).
            const event = {
                id: Math.random() * 10,
                filter: filterInput,
                sort,
                pagination,
                data,
                eventSource: data.changed ? 'data' : 'customTrigger',
                isInitial: updates === 0,
                updateTotalLength: (totalLength) => {
                    if (this.paginator) {
                        this.paginator.total = totalLength;
                    }
                }
            };
            this.onStartOfEvent(event);
            const runHandle = data.changed
                || (hasCustomBehavior && PblDataSourceAdapter.isCustomBehaviorEvent(event, this.config));
            const response$ = runHandle
                ? this.runHandle(event)
                    .pipe(map(data => {
                    if (data !== false) { // if the user didn't return "false" from his handler, we infer data was changed!
                        event.data.changed = true;
                    }
                    return { event, data };
                }))
                : of({ event, data: this._lastSource });
            return response$
                .pipe(map(response => {
                var _a;
                // If runHandle() returned false, we do not process and return undefined.
                if (response.data === false) {
                    return;
                }
                const config = this.config;
                const event = response.event;
                // mark which of the triggers has changes
                // The logic is based on the user's configuration and the incoming event
                const withChanges = {};
                for (const key of CUSTOM_BEHAVIOR_TRIGGER_KEYS) {
                    if (!config[key] && (event.isInitial || event[key].changed)) {
                        withChanges[key] = true;
                    }
                }
                // When data changed, apply some logic (caching, operational, etc...)
                if (event.data.changed) {
                    // cache the data when it has changed.
                    this._lastSource = response.data;
                    if (config.sort) {
                        // When the user is sorting (i.e. server sorting), the last sort cached is always the last source we get from the user.
                        this._lastSortedSource = this._lastSource;
                    }
                    else {
                        // When user is NOT sorting (we sort locally) AND the data has changed we need to apply sorting on it
                        // this might already be true (if sorting was the trigger)...
                        withChanges.sort = true;
                        // because we sort and then filter, filtering updates are also triggered by sort updated
                        withChanges.filter = true;
                    }
                    if (config.filter) {
                        // When the user is filtering (i.e. server filtering), the last filter cached is always the last source we get from the user.
                        this._lastFilteredSource = this._lastSource;
                    }
                    else {
                        // When user is NOT filtering (we filter locally) AND the data has changed we need to apply filtering on it
                        // this might already be true (if filtering was the trigger)...
                        withChanges.filter = true;
                    }
                }
                // When user is NOT applying pagination (we paginate locally) AND if we (sort OR filter) locally we also need to paginate locally
                if (!config.pagination && (withChanges.sort || withChanges.filter)) {
                    withChanges.pagination = true;
                }
                // Now, apply: sort --> filter --> pagination     ( ORDER MATTERS!!! )
                if (withChanges.sort) {
                    this._lastSortedSource = this.applySort(this._lastSource, event.sort.curr || event.sort.prev);
                }
                let data = this._lastSortedSource;
                // we check if filter was asked, but also if we have a filter we re-run
                // Only sorting is cached at this point filtering is always calculated
                if (withChanges.filter || (!config.filter && ((_a = event.filter.curr) === null || _a === void 0 ? void 0 : _a.filter))) {
                    data = this._lastFilteredSource = this.applyFilter(data, event.filter.curr || event.filter.prev);
                    if (!this.config.pagination) {
                        if (withChanges.filter || !withChanges.pagination) {
                            this.resetPagination(data.length);
                        }
                    }
                }
                if (withChanges.pagination) {
                    data = this.applyPagination(data);
                }
                const clonedEvent = Object.assign({}, event);
                // We use `combineLatest` which caches pervious events, only new events are replaced.
                // We need to mark everything as NOT CHANGED, so subsequent calls will not have their changed flag set to true.
                //
                // We also clone the object so we can pass on the proper values.
                // We create shallow clones so complex objects (column in sort, user data in data) will not throw on circular.
                // For pagination we deep clone because it contains primitives and we need to also clone the internal change objects.
                for (const k of TRIGGER_KEYS) {
                    clonedEvent[k] = k === 'pagination'
                        ? JSON.parse(JSON.stringify(event[k]))
                        : Object.assign({}, event[k]);
                    event[k].changed = false;
                }
                event.pagination.page.changed = event.pagination.perPage.changed = false;
                return {
                    event: clonedEvent,
                    data,
                    sorted: this._lastSortedSource,
                    filtered: this._lastFilteredSource,
                };
            }), tap(() => this.onEndOfEvent(event)), 
            // If runHandle() returned false, we will get undefined here, we do not emit these to the grid, nothing to do.
            filter$1(r => !!r));
        }));
    }
    applyFilter(data, dataSourceFilter) {
        return filter(data, dataSourceFilter);
    }
    applySort(data, event) {
        return applySort(event.column, event.sort, data);
    }
    applyPagination(data) {
        if (this.paginator) {
            // Set the rendered rows length to the virtual page size. Fill in the data provided
            // from the index start until the end index or pagination size, whichever is smaller.
            const range = this.paginator.range;
            return data.slice(range[0], range[1]);
        }
        return data;
    }
    resetPagination(totalLength) {
        if (this.paginator) {
            this.paginator.total = totalLength;
            this.paginator.page = totalLength > 0 ? 1 : 0;
        }
    }
    onStartOfEvent(event) {
        this._inFlight.add(event);
    }
    onEndOfEvent(event) {
        this._inFlight.delete(event);
    }
    emitOnSourceChanging(event) {
        this._onSourceChange$.next(SOURCE_CHANGING_TOKEN);
    }
    emitOnSourceChanged(event, data) {
        this._onSourceChange$.next(data);
    }
    /**
     * Execute the user-provided function that returns the data collection.
     * This method wraps each of the triggers with a container providing metadata for the trigger. (Old value, was changed? and new value if changed)
     * This is where all cache logic is managed (createChangeContainer).
     *
     * To build a data collection the information from all triggers is required, even if it was not changed.
     * When a trigger is fired with a new value the new value replaces the old value for the trigger and all other triggers will keep their old value.
     * Sending the triggers to the handlers is not enough, we also need to the handlers which of the trigger's have change so they can return
     * data without doing redundant work.
     * For example, fetching paginated data from the server requires a call whenever the pages changes but if the filtering is local for the current page
     * and the filter trigger is fired the handler needs to know that pagination did not change so it will not go and fetch data from the server.
     *
     * The handler can return several data structures, observable, promise, array or false.
     * This method will normalize the response into an observable and notify that the source changed (onSourceChanged).
     *
     * When the response is false that handler wants to skip this cycle, this means that onSourceChanged will not emit and
     * a dead-end observable is returned (observable that will never emit).
     */
    runHandle(event) {
        const result = this.sourceFactory(event);
        if (result === false) {
            return of(false);
        }
        this.emitOnSourceChanging(event);
        const obs = Array.isArray(result)
            ? of(result)
            // else ->            observable : promise
            : (isObservable(result) ? result : from(result))
                .pipe(map(data => Array.isArray(data) ? data : [])) // TODO: should we error? warn? notify?
        ;
        return obs.pipe(observeOn(asapScheduler, 0), // run as a micro-task
        tap(data => this.emitOnSourceChanged(event, data)));
    }
}

const PROCESSING_SUBSCRIPTION_GROUP = {};
class PblDataSource extends DataSource {
    constructor(adapter, options) {
        super();
        this._selection = new SelectionModel(true, []);
        this._tableConnectionChange$ = new Subject();
        this._onRenderDataChanging = new Subject();
        this._renderData$ = new BehaviorSubject([]);
        this._filter$ = new BehaviorSubject(undefined);
        this._sort$ = new BehaviorSubject({ column: null, sort: null, skipUpdate: false });
        this._onError$ = new Subject();
        options = options || {};
        this.adapter = adapter;
        this.onSourceChanging = this._adapter.onSourceChanging;
        // emit source changed event every time adapter gets new data
        this.onSourceChanged = this.adapter.onSourceChanged
            .pipe(observeOn(asapScheduler, 0), // emit on the end of the current turn (micro-task) to ensure `onSourceChanged` emission in `_updateProcessingLogic` run's first.
        mapTo(undefined));
        this.onRenderDataChanging = this._onRenderDataChanging.asObservable();
        this.onRenderedDataChanged = this._renderData$.pipe(skip(1), mapTo(undefined));
        this.onError = this._onError$.asObservable();
        this.tableConnectionChange = this._tableConnectionChange$.asObservable();
        this.keepAlive = options.keepAlive || false;
        this.skipInitial = options.skipInitial || false;
        this.sortChange = this._sort$.asObservable();
    }
    get pagination() { return this._pagination; }
    set pagination(value) {
        if (this._pagination !== value) {
            this._pagination = value;
            switch (value) {
                case 'pageNumber':
                    this._paginator = new PblPagingPaginator();
                    break;
                case 'token':
                    this._paginator = new PblTokenPaginator();
                    break;
                default:
                    this._paginator = undefined;
                    break;
            }
            if (this._adapter) {
                this._adapter.setPaginator(this._paginator);
            }
        }
    }
    get adapter() { return this._adapter; }
    ;
    set adapter(value) {
        if (this._adapter !== value) {
            this._adapter = value;
            if (this.pagination) {
                this._adapter.setPaginator(this._paginator);
            }
        }
    }
    /** Returns the starting index of the rendered data */
    get renderStart() { return this._lastRange ? this._lastRange.start : 0; }
    get renderLength() { return this._renderData$.value.length; }
    get renderedData() { return this._renderData$.value || []; }
    /**
     * The `source` with sorting applied.
     * Valid only when sorting is performed client-side.
     *
     * To get real-time notifications use `onRenderDataChanging`.
     * The sorted data is updated just before `onRenderDataChanging` fire.
     */
    get sortedData() { return (this._lastAdapterEvent && this._lastAdapterEvent.sorted) || []; }
    ;
    /**
     * The `source` with filtering applied.
     * Valid only when filtering is performed client-side.
     * If sorting is applied as well, the filtered results are also sorted.
     *
     * To get real-time notifications use `onRenderDataChanging`.
     * The filtered data is updated just before `onRenderDataChanging` fire.
     */
    get filteredData() { return (this._lastAdapterEvent && this._lastAdapterEvent.filtered) || []; }
    ;
    get filter() { return this._filter$.value; }
    get sort() { return this._sort$.value; }
    get paginator() { return this._paginator; }
    get length() { return this.source.length; }
    get source() { return this._source || []; }
    /** Represents selected items on the data source. */
    get selection() { return this._selection; }
    /**
     * A custom trigger that invokes a manual data source change with the provided data value in the `data` property at tht event.
     */
    refresh(data) {
        if (this._tableConnected) {
            this._adapter.refresh(data);
        }
        else {
            this._lastRefresh = data;
        }
    }
    setFilter(value, columns) {
        if (value && typeof value !== 'function' && (!columns || columns.length === 0)) {
            throw new Error('Invalid filter definitions, columns are mandatory when using a single value input.');
        }
        this._filter$.next(createFilter(value, columns || []));
    }
    /**
     * Refresh the filters result.
     *
     * Note that this should only be used when using a predicate function filter and not the simple value filter.
     * In general the filter is refreshed every time it is set and each time the data is updated so manually refreshing a value filter
     * has no impact.
     *
     * For custom predicate function filters this might be useful.
     *
     */
    syncFilter() {
        const currentFilter = this._adapter.clearCache('filter');
        if (currentFilter) {
            this.setFilter(currentFilter.filter, currentFilter.columns);
        }
    }
    setSort(column, sort, skipUpdate = false) {
        if (!column || typeof column === 'boolean') {
            this._sort$.next({ column: null, sort: {}, skipUpdate: !!column });
        }
        else {
            this._sort$.next({ column, sort, skipUpdate });
        }
    }
    dispose() {
        if (!this._disposed) {
            unrx.kill(this);
            this._adapter.dispose();
            this._onRenderDataChanging.complete();
            this._renderData$.complete();
            this._filter$.complete();
            this._sort$.complete();
            this._onError$.complete();
            this._disposed = true;
        }
    }
    disconnect(cv) {
        this._lastRefresh = undefined;
        this._tableConnectionChange$.next(this._tableConnected = false);
        if (this.keepAlive === false) {
            this.dispose();
        }
    }
    connect(cv) {
        if (this._disposed) {
            throw new Error('PblDataSource is disposed. Use `keepAlive` if you move datasource between tables.');
        }
        this._tableConnected = true;
        this._updateProcessingLogic(cv);
        this._tableConnectionChange$.next(this._tableConnected);
        return this._renderData$;
    }
    /**
     * Move's an item (in the entire source) from one index to the other, pushing the item in the destination one item backwards.
     *
     * Note that if the rendered data is a subset of the entire source (i.e virtual scroll & range) the indices are considered
     * local to the rendered view and are translated to fit the entire source.
     *
     * Tp disable this behavior, set the `absolute` parameter to `true`
     */
    moveItem(fromIndex, toIndex, absolute = false) {
        if (absolute !== true && this._lastRange) {
            fromIndex = this._lastRange.start + fromIndex;
            toIndex = this._lastRange.start + toIndex;
        }
        if (this.length > 0) {
            this._eventEmitter.emitEvent({ source: 'ds', kind: 'onBeforeMoveItem', fromIndex, toIndex });
            moveItemInArray(this._source, fromIndex, toIndex);
            const data = this._lastRange
                ? this._source.slice(this._lastRange.start, this._lastRange.end)
                : this._source;
            this._renderData$.next(data);
        }
    }
    _attachEmitter(emitter) {
        this._eventEmitter = emitter;
    }
    _detachEmitter() {
        this._eventEmitter = undefined;
    }
    _updateProcessingLogic(cv) {
        const initialState = { filter: this.filter, sort: this.sort };
        const paginator = this._paginator;
        if (paginator) {
            initialState.pagination = { page: paginator.page, perPage: paginator.perPage };
        }
        const stream = this._adapter.updateProcessingLogic(this._filter$, this._sort$, paginator ? paginator.onChange : of(undefined), initialState);
        unrx.kill(this, PROCESSING_SUBSCRIPTION_GROUP);
        const trimToRange = (range, data) => data.slice(range.start, range.end + 1);
        /* We use this flag to skip handling `viewChange` events
           This is on when a call to get data from the adapter (stream) is initiated and set off once the data arrives.
           In this period, we don't want to update the view, instead, we save the last view range and when the data arrive we trim it to fit the view. */
        let skipViewChange;
        let lastEmittedSource;
        // We listen to view changes (scroll updates, practical only in virtual scroll) and trim the data displayed based on what
        // the view change instructs us.
        cv.viewChange
            .pipe(unrx(this, PROCESSING_SUBSCRIPTION_GROUP))
            .subscribe(range => {
            var _a, _b;
            if (((_a = this._lastRange) === null || _a === void 0 ? void 0 : _a.start) === range.start && ((_b = this._lastRange) === null || _b === void 0 ? void 0 : _b.end) === range.end) {
                return;
            }
            this._lastRange = range;
            if (!skipViewChange) {
                if (range && (lastEmittedSource === null || lastEmittedSource === void 0 ? void 0 : lastEmittedSource.length)) {
                    this._renderData$.next(trimToRange(this._lastRange, lastEmittedSource));
                }
            }
        });
        // We listen to incoming data update triggers when the data is about to change
        stream
            .pipe(unrx(this, PROCESSING_SUBSCRIPTION_GROUP), tap(result => {
            lastEmittedSource = result.data;
            skipViewChange = true;
            this._onRenderDataChanging.next(this._lastAdapterEvent = result);
        }))
            .subscribe(({ data }) => {
            if (this._lastRange && (data === null || data === void 0 ? void 0 : data.length)) {
                data = trimToRange(this._lastRange, data);
            }
            this._renderData$.next(data);
            skipViewChange = false;
        }, error => { this._onError$.next(error); });
        this._adapter.onSourceChanged
            .pipe(unrx(this, PROCESSING_SUBSCRIPTION_GROUP))
            .subscribe(source => this._source = source || []);
        if (this._lastRefresh !== undefined) {
            this._adapter.refresh(this._lastRefresh);
            this._lastRefresh = undefined;
        }
        else if (!this.skipInitial) {
            // _refresh$ is a Subject, we must emit once so combineLatest will work
            this.refresh();
        }
    }
}

class PblDataSourceBaseFactory {
    constructor() {
        this._adapter = {};
        this._dsOptions = {};
    }
    /**
     * Set the main trigger handler.
     * The trigger handler is the core of the datasource, responsible for returning the data collection.
     *
     * By default the handler is triggered only when the datasource is required.
     * This can happened when:
     *   - The table connected to the datasource.
     *   - A manual call to `PblDataSource.refresh()` was invoked.
     *
     * There are additional triggers (filter/sort/pagination) which occur when their values change, e.g. when
     * a filter has change or when a page in the paginator was changed.
     *
     * By default, these triggers are handled automatically, resulting in a client-side behavior for each of them.
     * For example, a client side paginator will move to the next page based on an already existing data collection (no need to fetch from the server).
     *
     * To handle additional trigger you need to explicitly set them using `setCustomTriggers`.
     */
    onTrigger(handler) {
        this._adapter.onTrigger = handler;
        return this;
    }
    /**
     * A list of triggers that will be handled by the trigger handler.
     * By default all triggers are handled by the adapter, resulting in a client-side filter/sort/pagination that works out of the box.
     * To implement server side filtering, sorting and/or pagination specify which should be handled by the on trigger handler.
     *
     * You can mix and match, e.g. support only paging from the server, or only paging and sorting, and leave filtering for the client side.
     */
    setCustomTriggers(...triggers) {
        if (triggers.length === 0) {
            this._adapter.customTriggers = false;
        }
        else {
            const customTriggers = this._adapter.customTriggers = {};
            for (const t of triggers) {
                customTriggers[t] = true;
            }
        }
        return this;
    }
    /**
     * Skip the first trigger emission.
     * Use this for late binding, usually with a call to refresh() on the data source.
     *
     * Note that only the internal trigger call is skipped, a custom calls to refresh will go through
     */
    skipInitialTrigger() {
        this._dsOptions.skipInitial = true;
        return this;
    }
    keepAlive() {
        this._dsOptions.keepAlive = true;
        return this;
    }
    onCreated(handler) {
        this._onCreated = handler;
        return this;
    }
    create() {
        const ds = this.createDataSource(this.createAdapter());
        if (this._onCreated) {
            this._onCreated(ds);
        }
        return ds;
    }
}

class PblDataSourceFactory extends PblDataSourceBaseFactory {
    createAdapter() {
        return new PblDataSourceAdapter(this._adapter.onTrigger, this._adapter.customTriggers || false);
    }
    createDataSource(adapter) {
        return new PblDataSource(adapter, this._dsOptions);
    }
}
function createDS() {
    return new PblDataSourceFactory();
}

const DEFAULT_TABLE_CONFIG = {
    showHeader: true,
    showFooter: false,
    noFiller: false,
    clearContextOnSourceChanging: false,
};
const PEB_NGRID_CONFIG = new InjectionToken('PEB_NGRID_CONFIG');
class PblNgridConfigService {
    constructor(_config) {
        this.config = new Map();
        this.configNotify = new Map();
        if (_config) {
            for (const key of Object.keys(_config)) {
                this.config.set(key, _config[key]);
            }
        }
        const gridConfig = this.config.get('table') || {};
        this.config.set('table', Object.assign(Object.assign({}, DEFAULT_TABLE_CONFIG), gridConfig));
    }
    has(section) {
        return this.config.has(section);
    }
    get(section, fallback) {
        return this.config.get(section) || fallback;
    }
    set(section, value) {
        const prev = this.get(section);
        value = Object.assign({}, value);
        Object.freeze(value);
        this.config.set(section, value);
        this.notify(section, value, prev);
    }
    onUpdate(section) {
        return this.getGetNotifier(section);
    }
    getGetNotifier(section) {
        let notifier = this.configNotify.get(section);
        if (!notifier) {
            this.configNotify.set(section, notifier = new ReplaySubject(1));
        }
        return notifier;
    }
    notify(section, curr, prev) {
        this.getGetNotifier(section).next({ curr, prev });
    }
}
/** @nocollapse */ PblNgridConfigService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridConfigService, deps: [{ token: PEB_NGRID_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ PblNgridConfigService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridConfigService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: PblNgridConfigService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () {
        return [{ type: undefined, decorators: [{
                        type: Optional
                    }, {
                        type: Inject,
                        args: [PEB_NGRID_CONFIG]
                    }] }];
    } });

function deprecatedWarning(deprecated, version, alt) {
    console.warn(`"${deprecated}" is deprecated and will be removed in version ${version}, use "${alt}" instead.`);
}

/**
 * Generated bundle index. Do not edit.
 */

export { ON_BEFORE_INVALIDATE_HEADERS, ON_CONSTRUCTED, ON_DESTROY, ON_INIT, ON_INVALIDATE_HEADERS, ON_RESIZE_ROW, PEB_NGRID_CONFIG, PblDataSource, PblDataSourceAdapter, PblDataSourceBaseFactory, PblDataSourceFactory, PblNgridConfigService, PblPagingPaginator, PblTokenPaginator, StylingDiffer, applySort, createDS, deepPathGet, deepPathSet, deprecatedWarning, getValue, removeFromArray, unrx };
//# sourceMappingURL=pebula-ngrid-core.mjs.map
