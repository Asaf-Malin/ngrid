const NOOP = () => { };
/**
 * In charge of handling the lifecycle of detail row instances.
 * The whole lifecycle: Create, update, move, destroy, etc...
 *
 * This controller also sync's the rendering process to make sure we reuse detail rom elements within
 * a single rendering cycle (i.e. not long term caching but a short term one).
 * This is done for performance and to prevent flickering when a row is moved into a different element due to virtual scroll.
 * When this happen we just want to move all dom elements properly, swap the context and trigger change detection.
 * If we have left over rows to render we create new elements or if we have left over rows to clear, we remove them.
 * The logic for this relay on the fact that the row's context.$implicit is updated in a sync iteration by the cdk table
 * and afterwards we will have the onRenderRows event fired, allowing us to sync changes.
 * We also relay on the fact that the event run immediately after the iterations and everything is sync.
 *
 * > In the future, this is where we can support detail row caching
 */
export class DetailRowController {
    constructor(vcRef, extApi) {
        this.vcRef = vcRef;
        this.extApi = extApi;
        this.viewMap = new Map();
        this.pendingOps = new Map();
        this.deferOps = false;
        this.runMeasure = () => this.extApi.grid.viewport.reMeasureCurrentRenderedContent();
        extApi.onInit(() => {
            this.detailRowDef = extApi.grid.registry.getSingle('detailRow');
            extApi.cdkTable.beforeRenderRows.subscribe(() => this.deferOps = true);
            extApi.cdkTable.onRenderRows.subscribe(() => this.flushPendingOps());
        });
        extApi.grid.registry.changes
            .subscribe(changes => {
            for (const c of changes) {
                switch (c.type) {
                    case 'detailRow':
                        if (c.op === 'remove') {
                            this.detailRowDef = undefined;
                        }
                        else {
                            this.detailRowDef = c.value;
                        }
                        break;
                }
            }
        });
    }
    render(parent, fromRender) {
        if (this.viewMap.has(parent)) {
            this.pendingOps.delete(parent); // if clear, then render we don't want to clear it later
            this.updateDetailRow(parent);
            return true;
        }
        else if (!this.deferOps) {
            return this._render(parent, fromRender);
        }
        else if (parent.context.$implicit && this.detailRowDef) {
            this.pendingOps.set(parent, { type: 'render', fromRender });
            return true;
        }
        return false;
    }
    clearDetailRow(parent, fromRender) {
        const state = this.viewMap.get(parent);
        if (state) {
            if (this.deferOps) {
                this.pendingOps.set(parent, { type: 'clear', fromRender });
            }
            else {
                this._clearDetailRow(parent, fromRender);
            }
        }
    }
    updateDetailRow(parent) {
        const state = this.viewMap.get(parent);
        if (state) {
            Object.assign(state.viewRef.context, this.createDetailRowContext(parent, true));
            state.viewRef.detectChanges();
        }
    }
    getDetailRowHeight(parent) {
        let total = 0;
        const state = this.viewMap.get(parent);
        if (state) {
            for (const e of state.viewRef.rootNodes) {
                total += e.getBoundingClientRect().height;
            }
        }
        return total;
    }
    detectChanges(parent) {
        const state = this.viewMap.get(parent);
        if (state) {
            state.viewRef.detectChanges();
        }
    }
    createDetailRowContext(parent, fromRender) {
        return {
            $implicit: parent.context.$implicit,
            rowContext: parent.context,
            animation: { fromRender, end: () => this.checkHasAnimation(fromRender) ? this.runMeasure() : undefined, },
        };
    }
    flushPendingOps() {
        if (this.deferOps) {
            this.deferOps = false;
            const toRender = [];
            const toClear = [];
            for (const entry of this.pendingOps.entries()) {
                const col = entry[1].type === 'clear' ? toClear : toRender;
                col.push(entry);
            }
            this.pendingOps.clear();
            for (const [parent, op] of toRender) {
                if (this.viewMap.has(parent)) {
                    if (typeof ngDevMode === 'undefined' || ngDevMode) {
                        throw new Error('Invalid detail row state.');
                    }
                    return;
                }
                if (toClear.length) {
                    const [clearParent] = toClear.pop();
                    this.viewMap.set(parent, this.viewMap.get(clearParent));
                    this.viewMap.delete(clearParent);
                    this.insertElementsToRow(parent); // don't detect changes, we'll do it in updateDetailRow
                    this.updateDetailRow(parent);
                    // notify about size changes
                    if (!this.checkHasAnimation(op.fromRender)) {
                        this.runMeasure();
                    }
                }
                else {
                    // when no more cleared left for reuse
                    this._render(parent, op.fromRender);
                }
            }
            // remove cleared we can't reuse
            for (const [parent, op] of toClear) {
                this._clearDetailRow(parent, op.fromRender);
            }
        }
    }
    _render(parent, fromRender) {
        if (parent.context.$implicit && this.detailRowDef) {
            const context = this.createDetailRowContext(parent, fromRender);
            this.viewMap.set(parent, { viewRef: this.vcRef.createEmbeddedView(this.detailRowDef.tRef, context) });
            this.insertElementsToRow(parent, true);
            // notify about size changes
            if (!this.checkHasAnimation(fromRender)) {
                this.runMeasure();
            }
            return true;
        }
        return false;
    }
    _clearDetailRow(parent, fromRender) {
        const state = this.viewMap.get(parent);
        if (state) {
            const { viewRef } = state;
            if (viewRef.context.animation.fromRender !== fromRender) {
                viewRef.context.animation.fromRender = fromRender;
                viewRef.detectChanges();
            }
            viewRef.destroy();
            if (!this.checkHasAnimation(fromRender)) {
                this.runMeasure();
            }
            this.viewMap.delete(parent);
        }
    }
    insertElementsToRow(parent, detectChanges) {
        const { viewRef } = this.viewMap.get(parent);
        const beforeNode = parent.element.nextSibling;
        for (const e of viewRef.rootNodes) {
            parent.element.parentElement.insertBefore(e, beforeNode);
        }
        if (detectChanges) {
            viewRef.detectChanges();
        }
    }
    checkHasAnimation(fromRender) {
        return this.detailRowDef.hasAnimation === 'always' || (this.detailRowDef.hasAnimation === 'interaction' && !fromRender);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0YWlsLXJvdy1jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9kZXRhaWwtcm93L3NyYy9saWIvZGV0YWlsLXJvdy9kZXRhaWwtcm93LWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0EsTUFBTSxJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDO0FBV3RCOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0gsTUFBTSxPQUFPLG1CQUFtQjtJQVM5QixZQUE2QixLQUF1QixFQUN2QixNQUE0QjtRQUQ1QixVQUFLLEdBQUwsS0FBSyxDQUFrQjtRQUN2QixXQUFNLEdBQU4sTUFBTSxDQUFzQjtRQVJqRCxZQUFPLEdBQUcsSUFBSSxHQUFHLEVBQWtELENBQUM7UUFDcEUsZUFBVSxHQUFHLElBQUksR0FBRyxFQUFnRCxDQUFDO1FBQ3JFLGFBQVEsR0FBRyxLQUFLLENBQUM7UUFHakIsZUFBVSxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSxDQUFDO1FBSXJGLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFO1lBQ2pCLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFFLENBQUM7WUFDeEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLElBQUksQ0FB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Q0FBQyxNQUFNLENBQUMsQ0FBQztTQUM3QjtJQUNILENBQUM7SUFFTyxtQkFBbUIsQ0FBQyxNQUFrQyxFQUFFLGFBQXVCO1FBQ3JGLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUM5QyxLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFDakMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztTQUMxRDtRQUNELElBQUksYUFBYSxFQUFFO1lBQ2pCLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUN6QjtJQUNILENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxVQUFtQjtRQUMzQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxLQUFLLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxLQUFLLGFBQWEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzFILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVtYmVkZGVkVmlld1JlZiwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUGJsTmdyaWRFeHRlbnNpb25BcGkgfSBmcm9tICdAcGVidWxhL25ncmlkJztcbmltcG9ydCB7IFBibE5ncmlkRGV0YWlsUm93Q29udGV4dCwgUGJsTmdyaWREZXRhaWxSb3dEZWZEaXJlY3RpdmUgfSBmcm9tICcuL2RpcmVjdGl2ZXMnO1xuaW1wb3J0IHsgUGJsTmdyaWREZXRhaWxSb3dDb21wb25lbnQgfSBmcm9tICcuL3Jvdyc7XG5cbmNvbnN0IE5PT1AgPSAoKSA9PiB7fTtcblxuaW50ZXJmYWNlIERldGFpbFJvd1ZpZXdTdGF0ZSB7XG4gIHZpZXdSZWY6IEVtYmVkZGVkVmlld1JlZjxQYmxOZ3JpZERldGFpbFJvd0NvbnRleHQ+XG59XG5cbmludGVyZmFjZSBQZW5kaW5nT3BlcmF0aW9uIHtcbiAgdHlwZTogJ3JlbmRlcicgfCAnY2xlYXInO1xuICBmcm9tUmVuZGVyOiBib29sZWFuO1xufVxuXG4vKipcbiAqIEluIGNoYXJnZSBvZiBoYW5kbGluZyB0aGUgbGlmZWN5Y2xlIG9mIGRldGFpbCByb3cgaW5zdGFuY2VzLlxuICogVGhlIHdob2xlIGxpZmVjeWNsZTogQ3JlYXRlLCB1cGRhdGUsIG1vdmUsIGRlc3Ryb3ksIGV0Yy4uLlxuICpcbiAqIFRoaXMgY29udHJvbGxlciBhbHNvIHN5bmMncyB0aGUgcmVuZGVyaW5nIHByb2Nlc3MgdG8gbWFrZSBzdXJlIHdlIHJldXNlIGRldGFpbCByb20gZWxlbWVudHMgd2l0aGluXG4gKiBhIHNpbmdsZSByZW5kZXJpbmcgY3ljbGUgKGkuZS4gbm90IGxvbmcgdGVybSBjYWNoaW5nIGJ1dCBhIHNob3J0IHRlcm0gb25lKS5cbiAqIFRoaXMgaXMgZG9uZSBmb3IgcGVyZm9ybWFuY2UgYW5kIHRvIHByZXZlbnQgZmxpY2tlcmluZyB3aGVuIGEgcm93IGlzIG1vdmVkIGludG8gYSBkaWZmZXJlbnQgZWxlbWVudCBkdWUgdG8gdmlydHVhbCBzY3JvbGwuXG4gKiBXaGVuIHRoaXMgaGFwcGVuIHdlIGp1c3Qgd2FudCB0byBtb3ZlIGFsbCBkb20gZWxlbWVudHMgcHJvcGVybHksIHN3YXAgdGhlIGNvbnRleHQgYW5kIHRyaWdnZXIgY2hhbmdlIGRldGVjdGlvbi5cbiAqIElmIHdlIGhhdmUgbGVmdCBvdmVyIHJvd3MgdG8gcmVuZGVyIHdlIGNyZWF0ZSBuZXcgZWxlbWVudHMgb3IgaWYgd2UgaGF2ZSBsZWZ0IG92ZXIgcm93cyB0byBjbGVhciwgd2UgcmVtb3ZlIHRoZW0uXG4gKiBUaGUgbG9naWMgZm9yIHRoaXMgcmVsYXkgb24gdGhlIGZhY3QgdGhhdCB0aGUgcm93J3MgY29udGV4dC4kaW1wbGljaXQgaXMgdXBkYXRlZCBpbiBhIHN5bmMgaXRlcmF0aW9uIGJ5IHRoZSBjZGsgdGFibGVcbiAqIGFuZCBhZnRlcndhcmRzIHdlIHdpbGwgaGF2ZSB0aGUgb25SZW5kZXJSb3dzIGV2ZW50IGZpcmVkLCBhbGxvd2luZyB1cyB0byBzeW5jIGNoYW5nZXMuXG4gKiBXZSBhbHNvIHJlbGF5IG9uIHRoZSBmYWN0IHRoYXQgdGhlIGV2ZW50IHJ1biBpbW1lZGlhdGVseSBhZnRlciB0aGUgaXRlcmF0aW9ucyBhbmQgZXZlcnl0aGluZyBpcyBzeW5jLlxuICpcbiAqID4gSW4gdGhlIGZ1dHVyZSwgdGhpcyBpcyB3aGVyZSB3ZSBjYW4gc3VwcG9ydCBkZXRhaWwgcm93IGNhY2hpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIERldGFpbFJvd0NvbnRyb2xsZXIge1xuXG4gIHByaXZhdGUgdmlld01hcCA9IG5ldyBNYXA8UGJsTmdyaWREZXRhaWxSb3dDb21wb25lbnQsIERldGFpbFJvd1ZpZXdTdGF0ZT4oKTtcbiAgcHJpdmF0ZSBwZW5kaW5nT3BzID0gbmV3IE1hcDxQYmxOZ3JpZERldGFpbFJvd0NvbXBvbmVudCwgUGVuZGluZ09wZXJhdGlvbj4oKTtcbiAgcHJpdmF0ZSBkZWZlck9wcyA9IGZhbHNlO1xuICBwcml2YXRlIGRldGFpbFJvd0RlZjogUGJsTmdyaWREZXRhaWxSb3dEZWZEaXJlY3RpdmU7XG5cbiAgcHJpdmF0ZSBydW5NZWFzdXJlID0gKCkgPT4gdGhpcy5leHRBcGkuZ3JpZC52aWV3cG9ydC5yZU1lYXN1cmVDdXJyZW50UmVuZGVyZWRDb250ZW50KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSB2Y1JlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgICAgICAgcHJpdmF0ZSByZWFkb25seSBleHRBcGk6IFBibE5ncmlkRXh0ZW5zaW9uQXBpKSB7XG4gICAgZXh0QXBpLm9uSW5pdCgoKSA9PiB7XG4gICAgICB0aGlzLmRldGFpbFJvd0RlZiA9IGV4dEFwaS5ncmlkLnJlZ2lzdHJ5LmdldFNpbmdsZSgnZGV0YWlsUm93Jyk7XG4gICAgICBleHRBcGkuY2RrVGFibGUuYmVmb3JlUmVuZGVyUm93cy5zdWJzY3JpYmUoKCkgPT4gdGhpcy5kZWZlck9wcyA9IHRydWUgKTtcbiAgICAgIGV4dEFwaS5jZGtUYWJsZS5vblJlbmRlclJvd3Muc3Vic2NyaWJlKCgpID0+IHRoaXMuZmx1c2hQZW5kaW5nT3BzKCkpO1xuICAgIH0pO1xuXG4gICAgZXh0QXBpLmdyaWQucmVnaXN0cnkuY2hhbmdlc1xuICAgICAgLnN1YnNjcmliZSggY2hhbmdlcyA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgYyBvZiBjaGFuZ2VzKSB7XG4gICAgICAgICAgc3dpdGNoIChjLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RldGFpbFJvdyc6XG4gICAgICAgICAgICAgIGlmIChjLm9wID09PSAncmVtb3ZlJykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGV0YWlsUm93RGVmID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGV0YWlsUm93RGVmID0gYy52YWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKHBhcmVudDogUGJsTmdyaWREZXRhaWxSb3dDb21wb25lbnQsIGZyb21SZW5kZXI6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy52aWV3TWFwLmhhcyhwYXJlbnQpKSB7XG4gICAgICB0aGlzLnBlbmRpbmdPcHMuZGVsZXRlKHBhcmVudCk7IC8vIGlmIGNsZWFyLCB0aGVuIHJlbmRlciB3ZSBkb24ndCB3YW50IHRvIGNsZWFyIGl0IGxhdGVyXG4gICAgICB0aGlzLnVwZGF0ZURldGFpbFJvdyhwYXJlbnQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICghdGhpcy5kZWZlck9wcykge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlbmRlcihwYXJlbnQsIGZyb21SZW5kZXIpO1xuICAgIH0gZWxzZSBpZiAocGFyZW50LmNvbnRleHQuJGltcGxpY2l0ICYmIHRoaXMuZGV0YWlsUm93RGVmKSB7XG4gICAgICB0aGlzLnBlbmRpbmdPcHMuc2V0KHBhcmVudCwgeyB0eXBlOiAncmVuZGVyJywgZnJvbVJlbmRlciB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjbGVhckRldGFpbFJvdyhwYXJlbnQ6IFBibE5ncmlkRGV0YWlsUm93Q29tcG9uZW50LCBmcm9tUmVuZGVyOiBib29sZWFuKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLnZpZXdNYXAuZ2V0KHBhcmVudCk7XG4gICAgaWYgKHN0YXRlKSB7XG4gICAgICBpZiAodGhpcy5kZWZlck9wcykge1xuICAgICAgICB0aGlzLnBlbmRpbmdPcHMuc2V0KHBhcmVudCwgeyB0eXBlOiAnY2xlYXInLCBmcm9tUmVuZGVyIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY2xlYXJEZXRhaWxSb3cocGFyZW50LCBmcm9tUmVuZGVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGVEZXRhaWxSb3cocGFyZW50OiBQYmxOZ3JpZERldGFpbFJvd0NvbXBvbmVudCkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy52aWV3TWFwLmdldChwYXJlbnQpO1xuICAgIGlmIChzdGF0ZSkge1xuICAgICAgT2JqZWN0LmFzc2lnbihzdGF0ZS52aWV3UmVmLmNvbnRleHQsIHRoaXMuY3JlYXRlRGV0YWlsUm93Q29udGV4dChwYXJlbnQsIHRydWUpKTtcbiAgICAgIHN0YXRlLnZpZXdSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIH1cbiAgfVxuXG4gIGdldERldGFpbFJvd0hlaWdodChwYXJlbnQ6IFBibE5ncmlkRGV0YWlsUm93Q29tcG9uZW50KSB7XG4gICAgbGV0IHRvdGFsID0gMDtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMudmlld01hcC5nZXQocGFyZW50KTtcbiAgICBpZiAoc3RhdGUpIHtcbiAgICAgIGZvciAoY29uc3QgZSBvZiBzdGF0ZS52aWV3UmVmLnJvb3ROb2Rlcykge1xuICAgICAgICB0b3RhbCArPSBlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsO1xuICB9XG5cbiAgZGV0ZWN0Q2hhbmdlcyhwYXJlbnQ6IFBibE5ncmlkRGV0YWlsUm93Q29tcG9uZW50KSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLnZpZXdNYXAuZ2V0KHBhcmVudCk7XG4gICAgaWYgKHN0YXRlKSB7XG4gICAgICBzdGF0ZS52aWV3UmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZURldGFpbFJvd0NvbnRleHQocGFyZW50OiBQYmxOZ3JpZERldGFpbFJvd0NvbXBvbmVudCwgZnJvbVJlbmRlcjogYm9vbGVhbik6IFBibE5ncmlkRGV0YWlsUm93Q29udGV4dCB7XG4gICAgcmV0dXJuIHtcbiAgICAgICRpbXBsaWNpdDogcGFyZW50LmNvbnRleHQuJGltcGxpY2l0LFxuICAgICAgcm93Q29udGV4dDogcGFyZW50LmNvbnRleHQsXG4gICAgICBhbmltYXRpb246IHsgZnJvbVJlbmRlciwgZW5kOiAoKSA9PiB0aGlzLmNoZWNrSGFzQW5pbWF0aW9uKGZyb21SZW5kZXIpID8gdGhpcy5ydW5NZWFzdXJlKCkgOiB1bmRlZmluZWQsIH0sXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBmbHVzaFBlbmRpbmdPcHMoKSB7XG4gICAgaWYgKHRoaXMuZGVmZXJPcHMpIHtcbiAgICAgIHRoaXMuZGVmZXJPcHMgPSBmYWxzZTtcblxuICAgICAgY29uc3QgdG9SZW5kZXI6IEFycmF5PFtQYmxOZ3JpZERldGFpbFJvd0NvbXBvbmVudCwgUGVuZGluZ09wZXJhdGlvbl0+ID0gW107XG4gICAgICBjb25zdCB0b0NsZWFyOiBBcnJheTxbUGJsTmdyaWREZXRhaWxSb3dDb21wb25lbnQsIFBlbmRpbmdPcGVyYXRpb25dPiA9IFtdO1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLnBlbmRpbmdPcHMuZW50cmllcygpKSB7XG4gICAgICAgIGNvbnN0IGNvbCA9IGVudHJ5WzFdLnR5cGUgPT09ICdjbGVhcicgPyB0b0NsZWFyIDogdG9SZW5kZXI7XG4gICAgICAgIGNvbC5wdXNoKGVudHJ5KTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGVuZGluZ09wcy5jbGVhcigpO1xuXG4gICAgICBmb3IgKGNvbnN0IFtwYXJlbnQsIG9wXSBvZiB0b1JlbmRlcikge1xuICAgICAgICBpZiAodGhpcy52aWV3TWFwLmhhcyhwYXJlbnQpKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRldGFpbCByb3cgc3RhdGUuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodG9DbGVhci5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zdCBbY2xlYXJQYXJlbnRdID0gdG9DbGVhci5wb3AoKTtcblxuICAgICAgICAgIHRoaXMudmlld01hcC5zZXQocGFyZW50LCB0aGlzLnZpZXdNYXAuZ2V0KGNsZWFyUGFyZW50KSk7XG4gICAgICAgICAgdGhpcy52aWV3TWFwLmRlbGV0ZShjbGVhclBhcmVudCk7XG4gICAgICAgICAgdGhpcy5pbnNlcnRFbGVtZW50c1RvUm93KHBhcmVudCk7IC8vIGRvbid0IGRldGVjdCBjaGFuZ2VzLCB3ZSdsbCBkbyBpdCBpbiB1cGRhdGVEZXRhaWxSb3dcbiAgICAgICAgICB0aGlzLnVwZGF0ZURldGFpbFJvdyhwYXJlbnQpO1xuXG4gICAgICAgICAgLy8gbm90aWZ5IGFib3V0IHNpemUgY2hhbmdlc1xuICAgICAgICAgIGlmICghdGhpcy5jaGVja0hhc0FuaW1hdGlvbihvcC5mcm9tUmVuZGVyKSkge1xuICAgICAgICAgICAgdGhpcy5ydW5NZWFzdXJlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHdoZW4gbm8gbW9yZSBjbGVhcmVkIGxlZnQgZm9yIHJldXNlXG4gICAgICAgICAgdGhpcy5fcmVuZGVyKHBhcmVudCwgb3AuZnJvbVJlbmRlcik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcmVtb3ZlIGNsZWFyZWQgd2UgY2FuJ3QgcmV1c2VcbiAgICAgIGZvciAoY29uc3QgW3BhcmVudCwgb3BdIG9mIHRvQ2xlYXIpIHtcbiAgICAgICAgdGhpcy5fY2xlYXJEZXRhaWxSb3cocGFyZW50LCBvcC5mcm9tUmVuZGVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9yZW5kZXIocGFyZW50OiBQYmxOZ3JpZERldGFpbFJvd0NvbXBvbmVudCwgZnJvbVJlbmRlcjogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGlmIChwYXJlbnQuY29udGV4dC4kaW1wbGljaXQgJiYgdGhpcy5kZXRhaWxSb3dEZWYpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLmNyZWF0ZURldGFpbFJvd0NvbnRleHQocGFyZW50LCBmcm9tUmVuZGVyKTtcblxuICAgICAgdGhpcy52aWV3TWFwLnNldChwYXJlbnQsIHsgdmlld1JlZjogdGhpcy52Y1JlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5kZXRhaWxSb3dEZWYudFJlZiwgY29udGV4dCkgfSlcbiAgICAgIHRoaXMuaW5zZXJ0RWxlbWVudHNUb1JvdyhwYXJlbnQsIHRydWUpO1xuXG4gICAgICAvLyBub3RpZnkgYWJvdXQgc2l6ZSBjaGFuZ2VzXG4gICAgICBpZiAoIXRoaXMuY2hlY2tIYXNBbmltYXRpb24oZnJvbVJlbmRlcikpIHtcbiAgICAgICAgdGhpcy5ydW5NZWFzdXJlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2xlYXJEZXRhaWxSb3cocGFyZW50OiBQYmxOZ3JpZERldGFpbFJvd0NvbXBvbmVudCwgZnJvbVJlbmRlcjogYm9vbGVhbikge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy52aWV3TWFwLmdldChwYXJlbnQpO1xuICAgIGlmIChzdGF0ZSkge1xuICAgICAgY29uc3QgeyB2aWV3UmVmIH0gPSBzdGF0ZTtcblxuICAgICAgaWYgKHZpZXdSZWYuY29udGV4dC5hbmltYXRpb24uZnJvbVJlbmRlciAhPT0gZnJvbVJlbmRlcikge1xuICAgICAgICB2aWV3UmVmLmNvbnRleHQuYW5pbWF0aW9uLmZyb21SZW5kZXIgPSBmcm9tUmVuZGVyO1xuICAgICAgICB2aWV3UmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgIH1cblxuICAgICAgdmlld1JlZi5kZXN0cm95KCk7XG5cbiAgICAgIGlmICghdGhpcy5jaGVja0hhc0FuaW1hdGlvbihmcm9tUmVuZGVyKSkge1xuICAgICAgICB0aGlzLnJ1bk1lYXN1cmUoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy52aWV3TWFwLmRlbGV0ZShwYXJlbnQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaW5zZXJ0RWxlbWVudHNUb1JvdyhwYXJlbnQ6IFBibE5ncmlkRGV0YWlsUm93Q29tcG9uZW50LCBkZXRlY3RDaGFuZ2VzPzogYm9vbGVhbikge1xuICAgIGNvbnN0IHsgdmlld1JlZiB9ID0gdGhpcy52aWV3TWFwLmdldChwYXJlbnQpO1xuICAgIGNvbnN0IGJlZm9yZU5vZGUgPSBwYXJlbnQuZWxlbWVudC5uZXh0U2libGluZztcbiAgICBmb3IgKGNvbnN0IGUgb2Ygdmlld1JlZi5yb290Tm9kZXMpIHtcbiAgICAgIHBhcmVudC5lbGVtZW50LnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGUsIGJlZm9yZU5vZGUpO1xuICAgIH1cbiAgICBpZiAoZGV0ZWN0Q2hhbmdlcykge1xuICAgICAgdmlld1JlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0hhc0FuaW1hdGlvbihmcm9tUmVuZGVyOiBib29sZWFuKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV0YWlsUm93RGVmLmhhc0FuaW1hdGlvbiA9PT0gJ2Fsd2F5cycgfHwgKHRoaXMuZGV0YWlsUm93RGVmLmhhc0FuaW1hdGlvbiA9PT0gJ2ludGVyYWN0aW9uJyAmJiAhZnJvbVJlbmRlcik7XG4gIH1cbn1cbiJdfQ==