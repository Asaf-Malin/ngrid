import { ComponentHarness, HarnessPredicate, ContentContainerComponentHarness } from '@angular/cdk/testing';

async function findHostClassMatch(hostElement, regExp) {
    const classAttribute = await hostElement.getAttribute('class');
    return findClassMatch(classAttribute, regExp);
}
function findClassMatch(classAttributeValue, regExp) {
    for (const c of classAttributeValue.split(' ')) {
        const match = c.trim().match(regExp);
        if (match) {
            return match;
        }
    }
}

function mixObjects(base, mixins) {
    mixins.forEach(mixin => {
        Object.getOwnPropertyNames(mixin)
            .concat(Object.getOwnPropertySymbols(mixin))
            .forEach(name => {
            // mixin can't override base behavior, only add
            if (!base.hasOwnProperty(name)) {
                // if its a property descriptor we need to rewire the context
                const propDesc = Object.getOwnPropertyDescriptor(mixin, name);
                if (propDesc) {
                    Object.defineProperty(base, name, propDesc);
                }
                else {
                    base[name] = mixin[name];
                }
            }
        });
    });
}
/**
 * Type-less mixin
 */
function MixinFree(base, mixin, extend = 'both') {
    if (extend === 'proto' || extend === 'both') {
        mixObjects(base.prototype, [mixin.prototype]);
    }
    if (extend === 'class' || extend === 'both') {
        mixObjects(base, [mixin]);
    }
    return base;
}
/**
 * A type friendly, class based, mixin functions that mix in instance and static members.
 *
 * EXAMPLE:
 * ```ts
 * class User_ {
 *   id: number;
 *   firstName: string;
 *   lastName: string;
 * }
 *
 * class FullName {
 *   get fullName(): string {
 *     return `${this['firstName']} ${this['lastName']}`;
 *   }
 *
 *   static createId(): number {
 *     // a shady id generator.
 *     return Date.now();
 *   }
 * }
 *
 * export const User = Mixin(User_, FullName);
 * export type User = Mixin<User_, FullName>;
 *
 * // not using it:
 * const user = new User();
 * user.id = User.createId();
 * user.firstName = 'John';
 * user.lastName = 'Doe';
 * console.log(user.fullName); // John Doe
 * ```
 *
 * > To allow Generics in static members (e.g. static createUser(): T) see MixinExt
 *
 * ## Limitations:
 * From a type perspective this utility has limitations.
 *
 * #### You can't (currently) extend a mixed in type.
 *```ts
 *  export const User = Mixin(User_, FullName);
 *
 *  export class MyExtendedUser extends User { // <- Type Error
 *  }
 *```
 *
 * ```
 * Type 'Type<User_ & FullName> & typeof FullName & typeof User_' is not a constructor function type.
 * ```
 *
 * The error is misleading, this is a current known TS limitation (see [Github Issue](https://github.com/Microsoft/TypeScript/issues/4890))
 *
 * #### You can use generic inference once, from that point the generic param types for mixin have to be explicitly set:
 * ```ts
 *   export const User = Mixin(User_, FullName); // fine
 *
 *   export const UserNumber2 = Mixin(User, OtherMixin); // Error
 * ```
 *
 * ```
 * The type argument for type parameter 'TBASE' cannot be inferred from the usage.
 * Consider specifying the type arguments explicitly.
 * Type argument candidate 'FullName' is not a valid type argument because it is not a supertype of candidate 'User_'.
 * Property 'fullName' is missing in type 'User_'.
 * ```
 * This might be related to the previous limitation, or not...
 *
 *
 * There are 2 solution:
 *
 * 1) Using the built in interface that supports up to 6 mixins at once. (base + 6)
 * ```ts
 * export const User = Mixin(User_, FullName, OtherMixin); //  FullName, OtherMixin are 2, you can rest param your way for 5 more...
 * export type User = User_ & FullName & OtherMixin
 * ```
 * > This time we cant use `Mixin` to apply the User **type** so we just do it manually...
 *
 * 2) going the long way:
 * ```ts
 *   export const User = Mixin(User_, FullName); // fine
 *
 *   export const UserNumber2 = Mixin<User, typeof User, OtherMixin, typeof OtherMixin>(User, OtherMixin);
 * ```
 *
 *
 * @param base
 * @param mixin
 */
function Mixin(base, ...mixins) {
    mixObjects(base.prototype, mixins.map(m => m.prototype));
    mixObjects(base, mixins);
    return base;
}
/**
 * For full description see Mixin function.
 *
 * The MixinExt utility does the same as Mixin but also allows adding an extra static type to the intersection.
 *
 * Although static members are mixed in there is a situation that requires an additional static mixin.
 * In a TypeScript class we can not apply generics on static members in the class level, only in a member based level.
 * If we want to return our final mixin type from a static member (e.g: factory) we need a different type.
 *
 * Example:
 * ```ts
 * class User_ {
 *   id: number;
 *   firstName: string;
 *   lastName: string;
 * }
 *
 * class FullName {
 *   get fullName(): string {
 *     return `${this['firstName']} ${this['lastName']}`;
 *   }
 * }
 *
 * const createNew = {
 *   create(): any {
 *     return new User_(); // at this point User_ is fully mixed in.
 *   }
 * }
 *
 * interface CreateStatic<T> {
 *   create(): Mixin<T, FullName>;
 * }
 *
 * export const User = MixinExt(User_, createNew as CreateStatic<User_>, FullName );
 * export type User = Mixin<User_, FullName>;
 * ```
 *
 * > Same as Mixin, MixinExt supports up to 6 mixins but only 1 extra static member.
 * If you need more then 1 just intersect all of your extera static interfaces to 1.
 * @param base
 * @param extraStatic Optional object for extra static member, use for static functions that require generics with Generics.
 * @param mixins
 */
function MixinExt(base, extraStatic, ...mixins) {
    Mixin(base, ...mixins);
    mixObjects(base, Array.of(extraStatic));
    return base;
}

const CLASS_COLUMN_RE = /^cdk-column-(.+)$/;
/**
 * Harness for interacting with cells that belong to a column.
 * This can be a column header cell, data cell or a column footer cell
 */
class PblNgridColumnCellHarness extends ComponentHarness {
    static with(options = {}) {
        return getColumnCellPredicate(PblNgridColumnCellHarness, options);
    }
    async getText() {
        return (await this.host()).text();
    }
    async getColumnId() {
        const match = await findHostClassMatch(await this.host(), CLASS_COLUMN_RE);
        if (match) {
            return match[1];
        }
        throw Error('Could not determine column name of cell.');
    }
}
PblNgridColumnCellHarness.hostSelector = `pbl-ngrid-header-cell, pbl-ngrid-cell`;
class PblNgridColumnHeaderCellHarness extends PblNgridColumnCellHarness {
    static with(options = {}) {
        return getColumnCellPredicate(PblNgridColumnHeaderCellHarness, options);
    }
}
// TODO: better detection here, not relay on class that might change.
PblNgridColumnHeaderCellHarness.hostSelector = `pbl-ngrid-header-cell`;
class PblNgridDataCellHarness extends PblNgridColumnCellHarness {
    static with(options = {}) {
        return getColumnCellPredicate(PblNgridDataCellHarness, options);
    }
}
// TODO: better detection here, not relay on class that might change.
PblNgridDataCellHarness.hostSelector = `pbl-ngrid-cell`;
function getColumnCellPredicate(type, options) {
    // We can't use FluentApi here because ngc will cry
    const predicate = new HarnessPredicate(type, options);
    predicate.addOption('columnIds', options.columnIds, (harness, columnIds) => harness.getColumnId().then(columnId => columnIds.indexOf(columnId) !== -1));
    return predicate;
}

/**
 * Harness for interacting with rows that are structured based on a column
 */
class PblNgridColumnRowHarness extends ComponentHarness {
    async getCells(filter = {}, type) {
        if (!type) {
            type = PblNgridColumnCellHarness;
        }
        return this.locatorForAll(type.with(filter))();
    }
}
class PblNgridColumnHeaderRowHarness extends PblNgridColumnRowHarness {
    async getCellByColumnId(columnId) {
        const result = await this.getCells({ columnIds: [columnId] });
        if (result) {
            return result[0];
        }
    }
    async getCells(filter = {}) {
        return super.getCells(filter, PblNgridColumnCellHarness);
    }
}
// TODO: better detection here, not relay on class that might change.
PblNgridColumnHeaderRowHarness.hostSelector = `div[pbl-ngrid-fixed-meta-row-container="header"] pbl-ngrid-column-row.pbl-ngrid-header-row-main`;
class PblNgridDataRowHarness extends PblNgridColumnRowHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a nGrid data row with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return getDataRowPredicate(PblNgridDataRowHarness, options);
    }
    async getRowIndex() {
        const attr = await this.host().then(host => host.getAttribute('row-id'));
        return Number(attr);
    }
    async getRowIdentity() {
        return await this.host().then(host => host.getAttribute('row-key'));
    }
    async getCells(filter = {}) {
        return super.getCells(filter, PblNgridDataCellHarness);
    }
}
// TODO: better detection here, not relay on class that might change.
PblNgridDataRowHarness.hostSelector = `pbl-cdk-table pbl-ngrid-row`;
function getDataRowPredicate(type, options) {
    // We can't use FluentApi here because ngc will cry
    const predicate = new HarnessPredicate(type, options);
    predicate
        .addOption('rowIndex', options.rowIndex, (harness, rowIndex) => harness.getRowIndex().then(result => result === rowIndex))
        .addOption('rowIdentity', options.rowIdentity, (harness, rowIdentity) => HarnessPredicate.stringMatches(harness.getRowIdentity(), rowIdentity));
    return predicate;
}

class PblNgridHarness extends ContentContainerComponentHarness {
    static register(key, method) {
        PblNgridHarness.prototype[key] = method;
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a nGrid with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(PblNgridHarness, options);
    }
    async getColumnHeaderRow() {
        return this.locatorFor(PblNgridColumnHeaderRowHarness)();
    }
    async getDataRow(rowIdentOrIndex) {
        if (typeof rowIdentOrIndex === 'number') {
            return this.locatorFor(PblNgridDataRowHarness.with({ rowIndex: rowIdentOrIndex }))();
        }
        else {
            return this.locatorFor(PblNgridDataRowHarness.with({ rowIdentity: rowIdentOrIndex }))();
        }
    }
    async getDataRows() {
        await this.forceStabilize();
        return this.locatorForAll(PblNgridDataRowHarness)();
    }
}
PblNgridHarness.hostSelector = 'pbl-ngrid';

var ScrollToLocation;
(function (ScrollToLocation) {
    ScrollToLocation[ScrollToLocation["VerticalStart"] = 0] = "VerticalStart";
    ScrollToLocation[ScrollToLocation["VerticalEnd"] = 1] = "VerticalEnd";
    ScrollToLocation[ScrollToLocation["HorizontalStart"] = 2] = "HorizontalStart";
    ScrollToLocation[ScrollToLocation["HorizontalEnd"] = 3] = "HorizontalEnd";
})(ScrollToLocation || (ScrollToLocation = {}));
class PblNgridHarnessActions extends PblNgridHarness {
    async waitForRenderChanged(fn, timeoutMs = 500, frequency = 10) {
        const rowIdentities = await this.getDataRows().then(rows => rows.map(r => r.getRowIdentity())).then(rows => Promise.all(rows));
        const result = typeof fn === 'function' ? await fn() : undefined;
        frequency = Math.max(frequency, 1);
        timeoutMs = Math.max(timeoutMs, 0);
        const interval = Math.floor(timeoutMs / frequency);
        const wait = () => new Promise(res => { setTimeout(res, interval); });
        while (frequency > 0) {
            await wait();
            const newRows = await this.getDataRows();
            if (rowIdentities.length !== newRows.length) {
                return;
            }
            for (let i = 0; i < rowIdentities.length; i++) {
                const newIdentity = newRows[i] ? (await newRows[i].getRowIdentity()) : null;
                if (newIdentity !== rowIdentities[i]) {
                    return;
                }
            }
            frequency -= 1;
        }
        return result;
    }
    async getColumnIds() {
        return this.getColumnHeaderRow()
            .then(header => header.getCells())
            .then(columns => Promise.all(columns.map(c => c.getColumnId())));
    }
    async getViewPortData() {
        await this.forceStabilize();
        return this.getDataRows()
            .then(rows => rows.map(r => r.getCells().then(cells => cells.map(c => c.getText()))))
            .then(rows => Promise.all(rows.map(pRow => pRow.then(row => Promise.all(row)))));
    }
    async scrollTo(x, y) {
        // TODO: support protractor env
        scrollDom(await this.locatorFor('pbl-cdk-virtual-scroll-viewport')(), x, y);
    }
    async scrollToLocation(location) {
        // TODO: support protractor env
        const viewPort = await this.locatorFor('pbl-cdk-virtual-scroll-viewport')();
        const element = viewPort.element;
        let x = element.scrollLeft;
        let y = element.scrollTop;
        switch (location) {
            case ScrollToLocation.HorizontalStart:
                x = 0;
                break;
            case ScrollToLocation.HorizontalEnd:
                x = element.scrollWidth;
                break;
            case ScrollToLocation.VerticalStart:
                y = 0;
                break;
            case ScrollToLocation.VerticalEnd:
                y = element.scrollHeight;
                break;
        }
        scrollDom(viewPort, x, y);
    }
}
async function scrollDom(viewPort, x, y) {
    const element = viewPort.element;
    element.scroll(x, y);
}
const keys = Object.getOwnPropertyNames(PblNgridHarnessActions.prototype);
for (const key of keys) {
    PblNgridHarness.register(key, PblNgridHarnessActions.prototype[key]);
}

/**
 * Generated bundle index. Do not edit.
 */

export { PblNgridColumnCellHarness, PblNgridColumnHeaderCellHarness, PblNgridColumnHeaderRowHarness, PblNgridDataCellHarness, PblNgridHarness, ScrollToLocation };
//# sourceMappingURL=pebula-ngrid-testing.mjs.map
