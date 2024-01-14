/**
 * Listens to registry changes and update the grid
 * Must run when the grid in at content init
 */
export function bindRegistryLogicap(extApi) {
    return () => {
        // no need to unsubscribe, the reg service is per grid instance and it will destroy when this grid destroy.
        // Also, at this point initial changes from templates provided in the content are already inside so they will not trigger
        // the order here is very important, because component top of this grid will fire life cycle hooks AFTER this component
        // so if we have a top level component registering a template on top it will not show unless we listen.
        extApi.registry.changes
            .subscribe(changes => {
            let gridCell = false;
            let headerFooterCell = false;
            for (const c of changes) {
                switch (c.type) {
                    case 'tableCell':
                        gridCell = true;
                        break;
                    case 'headerCell':
                    case 'footerCell':
                        headerFooterCell = true;
                        break;
                    case 'noData':
                        extApi.logicaps.noData();
                        break;
                    case 'paginator':
                        extApi.logicaps.pagination();
                        break;
                }
            }
            if (gridCell) {
                extApi.columnStore.attachCustomCellTemplates();
            }
            if (headerFooterCell) {
                extApi.columnStore.attachCustomHeaderCellTemplates();
            }
        });
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluZC1yZWdpc3RyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL2xvZ2ljYXAvYmluZC1yZWdpc3RyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQTs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsbUJBQW1CLENBQUMsTUFBb0M7SUFDdEUsT0FBTyxHQUFHLEVBQUU7UUFDViwyR0FBMkc7UUFDM0cseUhBQXlIO1FBQ3pILHVIQUF1SDtRQUN2SCx1R0FBdUc7UUFDdkcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPO2FBQ3BCLFNBQVMsQ0FBRSxPQUFPLENBQUMsRUFBRTtZQUNwQixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDckIsSUFBSSxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7WUFDN0IsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLEVBQUU7Z0JBQ3ZCLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRTtvQkFDZCxLQUFLLFdBQVc7d0JBQ2QsUUFBUSxHQUFHLElBQUksQ0FBQzt3QkFDaEIsTUFBTTtvQkFDUixLQUFLLFlBQVksQ0FBQztvQkFDbEIsS0FBSyxZQUFZO3dCQUNmLGdCQUFnQixHQUFHLElBQUksQ0FBQzt3QkFDeEIsTUFBTTtvQkFDUixLQUFLLFFBQVE7d0JBQ1gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDekIsTUFBTTtvQkFDUixLQUFLLFdBQVc7d0JBQ2QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQzt3QkFDN0IsTUFBTTtpQkFDVDthQUNGO1lBQ0QsSUFBSSxRQUFRLEVBQUU7Z0JBQ1osTUFBTSxDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2FBQ2hEO1lBQ0QsSUFBSSxnQkFBZ0IsRUFBRTtnQkFDcEIsTUFBTSxDQUFDLFdBQVcsQ0FBQywrQkFBK0IsRUFBRSxDQUFDO2FBQ3REO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUE7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGJsTmdyaWRJbnRlcm5hbEV4dGVuc2lvbkFwaSB9IGZyb20gJy4uLy4uL2V4dC9ncmlkLWV4dC1hcGknO1xuXG4vKipcbiAqIExpc3RlbnMgdG8gcmVnaXN0cnkgY2hhbmdlcyBhbmQgdXBkYXRlIHRoZSBncmlkXG4gKiBNdXN0IHJ1biB3aGVuIHRoZSBncmlkIGluIGF0IGNvbnRlbnQgaW5pdFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmluZFJlZ2lzdHJ5TG9naWNhcChleHRBcGk6IFBibE5ncmlkSW50ZXJuYWxFeHRlbnNpb25BcGkpIHtcbiAgcmV0dXJuICgpID0+IHtcbiAgICAvLyBubyBuZWVkIHRvIHVuc3Vic2NyaWJlLCB0aGUgcmVnIHNlcnZpY2UgaXMgcGVyIGdyaWQgaW5zdGFuY2UgYW5kIGl0IHdpbGwgZGVzdHJveSB3aGVuIHRoaXMgZ3JpZCBkZXN0cm95LlxuICAgIC8vIEFsc28sIGF0IHRoaXMgcG9pbnQgaW5pdGlhbCBjaGFuZ2VzIGZyb20gdGVtcGxhdGVzIHByb3ZpZGVkIGluIHRoZSBjb250ZW50IGFyZSBhbHJlYWR5IGluc2lkZSBzbyB0aGV5IHdpbGwgbm90IHRyaWdnZXJcbiAgICAvLyB0aGUgb3JkZXIgaGVyZSBpcyB2ZXJ5IGltcG9ydGFudCwgYmVjYXVzZSBjb21wb25lbnQgdG9wIG9mIHRoaXMgZ3JpZCB3aWxsIGZpcmUgbGlmZSBjeWNsZSBob29rcyBBRlRFUiB0aGlzIGNvbXBvbmVudFxuICAgIC8vIHNvIGlmIHdlIGhhdmUgYSB0b3AgbGV2ZWwgY29tcG9uZW50IHJlZ2lzdGVyaW5nIGEgdGVtcGxhdGUgb24gdG9wIGl0IHdpbGwgbm90IHNob3cgdW5sZXNzIHdlIGxpc3Rlbi5cbiAgICBleHRBcGkucmVnaXN0cnkuY2hhbmdlc1xuICAgICAgLnN1YnNjcmliZSggY2hhbmdlcyA9PiB7XG4gICAgICAgIGxldCBncmlkQ2VsbCA9IGZhbHNlO1xuICAgICAgICBsZXQgaGVhZGVyRm9vdGVyQ2VsbCA9IGZhbHNlO1xuICAgICAgICBmb3IgKGNvbnN0IGMgb2YgY2hhbmdlcykge1xuICAgICAgICAgIHN3aXRjaCAoYy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICd0YWJsZUNlbGwnOlxuICAgICAgICAgICAgICBncmlkQ2VsbCA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaGVhZGVyQ2VsbCc6XG4gICAgICAgICAgICBjYXNlICdmb290ZXJDZWxsJzpcbiAgICAgICAgICAgICAgaGVhZGVyRm9vdGVyQ2VsbCA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbm9EYXRhJzpcbiAgICAgICAgICAgICAgZXh0QXBpLmxvZ2ljYXBzLm5vRGF0YSgpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3BhZ2luYXRvcic6XG4gICAgICAgICAgICAgIGV4dEFwaS5sb2dpY2Fwcy5wYWdpbmF0aW9uKCk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZ3JpZENlbGwpIHtcbiAgICAgICAgICBleHRBcGkuY29sdW1uU3RvcmUuYXR0YWNoQ3VzdG9tQ2VsbFRlbXBsYXRlcygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoZWFkZXJGb290ZXJDZWxsKSB7XG4gICAgICAgICAgZXh0QXBpLmNvbHVtblN0b3JlLmF0dGFjaEN1c3RvbUhlYWRlckNlbGxUZW1wbGF0ZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cbn1cbiJdfQ==