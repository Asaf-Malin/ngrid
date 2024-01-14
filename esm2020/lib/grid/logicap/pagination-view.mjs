import { unrx } from '@asafmalin/ngrid/core';
export function paginationViewLogicap(extApi) {
    const paginationKillKey = 'pblPaginationKillKey';
    let paginatorEmbeddedVRef;
    return () => {
        const ds = extApi.grid.ds;
        const usePagination = ds && extApi.grid.usePagination;
        if (usePagination) {
            ds.pagination = extApi.grid.usePagination || false;
            if (ds.paginator) {
                ds.paginator.noCacheMode = extApi.grid.noCachePaginator;
            }
        }
        if (extApi.grid.isInit) {
            unrx.kill(extApi.grid, paginationKillKey);
            if (paginatorEmbeddedVRef) {
                extApi.grid.removeView(paginatorEmbeddedVRef, 'beforeContent');
                paginatorEmbeddedVRef = undefined;
            }
            if (usePagination) {
                const paginatorTemplate = extApi.registry.getSingle('paginator');
                if (paginatorTemplate) {
                    paginatorEmbeddedVRef = extApi.grid.createView('beforeContent', paginatorTemplate.tRef, { $implicit: extApi.grid });
                }
            }
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uZ3JpZC9zcmMvbGliL2dyaWQvbG9naWNhcC9wYWdpbmF0aW9uLXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRzFDLE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxNQUFvQztJQUN4RSxNQUFNLGlCQUFpQixHQUFHLHNCQUFzQixDQUFDO0lBQ2pELElBQUkscUJBQTJDLENBQUM7SUFFaEQsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUMxQixNQUFNLGFBQWEsR0FBRyxFQUFFLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7UUFFdEQsSUFBSSxhQUFhLEVBQUU7WUFDakIsRUFBRSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUM7WUFDbkQsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFO2dCQUNoQixFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO2FBQ3pEO1NBQ0Y7UUFFRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzFDLElBQUkscUJBQXFCLEVBQUU7Z0JBQ3pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLGVBQWUsQ0FBQyxDQUFDO2dCQUMvRCxxQkFBcUIsR0FBRyxTQUFTLENBQUM7YUFDbkM7WUFDRCxJQUFJLGFBQWEsRUFBRTtnQkFDakIsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDakUsSUFBSSxpQkFBaUIsRUFBRTtvQkFDckIscUJBQXFCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLGlCQUFpQixDQUFDLElBQUksRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztpQkFDckg7YUFDRjtTQUNGO0lBQ0gsQ0FBQyxDQUFBO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVtYmVkZGVkVmlld1JlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgdW5yeCB9IGZyb20gJ0BwZWJ1bGEvbmdyaWQvY29yZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZEludGVybmFsRXh0ZW5zaW9uQXBpIH0gZnJvbSAnLi4vLi4vZXh0L2dyaWQtZXh0LWFwaSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWdpbmF0aW9uVmlld0xvZ2ljYXAoZXh0QXBpOiBQYmxOZ3JpZEludGVybmFsRXh0ZW5zaW9uQXBpKSB7XG4gIGNvbnN0IHBhZ2luYXRpb25LaWxsS2V5ID0gJ3BibFBhZ2luYXRpb25LaWxsS2V5JztcbiAgbGV0IHBhZ2luYXRvckVtYmVkZGVkVlJlZjogRW1iZWRkZWRWaWV3UmVmPGFueT47XG5cbiAgcmV0dXJuICgpID0+IHtcbiAgICBjb25zdCBkcyA9IGV4dEFwaS5ncmlkLmRzO1xuICAgIGNvbnN0IHVzZVBhZ2luYXRpb24gPSBkcyAmJiBleHRBcGkuZ3JpZC51c2VQYWdpbmF0aW9uO1xuXG4gICAgaWYgKHVzZVBhZ2luYXRpb24pIHtcbiAgICAgIGRzLnBhZ2luYXRpb24gPSBleHRBcGkuZ3JpZC51c2VQYWdpbmF0aW9uIHx8IGZhbHNlO1xuICAgICAgaWYgKGRzLnBhZ2luYXRvcikge1xuICAgICAgICBkcy5wYWdpbmF0b3Iubm9DYWNoZU1vZGUgPSBleHRBcGkuZ3JpZC5ub0NhY2hlUGFnaW5hdG9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChleHRBcGkuZ3JpZC5pc0luaXQpIHtcbiAgICAgIHVucngua2lsbChleHRBcGkuZ3JpZCwgcGFnaW5hdGlvbktpbGxLZXkpO1xuICAgICAgaWYgKHBhZ2luYXRvckVtYmVkZGVkVlJlZikge1xuICAgICAgICBleHRBcGkuZ3JpZC5yZW1vdmVWaWV3KHBhZ2luYXRvckVtYmVkZGVkVlJlZiwgJ2JlZm9yZUNvbnRlbnQnKTtcbiAgICAgICAgcGFnaW5hdG9yRW1iZWRkZWRWUmVmID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgaWYgKHVzZVBhZ2luYXRpb24pIHtcbiAgICAgICAgY29uc3QgcGFnaW5hdG9yVGVtcGxhdGUgPSBleHRBcGkucmVnaXN0cnkuZ2V0U2luZ2xlKCdwYWdpbmF0b3InKTtcbiAgICAgICAgaWYgKHBhZ2luYXRvclRlbXBsYXRlKSB7XG4gICAgICAgICAgcGFnaW5hdG9yRW1iZWRkZWRWUmVmID0gZXh0QXBpLmdyaWQuY3JlYXRlVmlldygnYmVmb3JlQ29udGVudCcsIHBhZ2luYXRvclRlbXBsYXRlLnRSZWYsIHsgJGltcGxpY2l0OiBleHRBcGkuZ3JpZCB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19