import { PblDataSourceBaseFactory } from '@asafmalin/ngrid/core';
import { PblInfiniteScrollDSContext } from './infinite-scroll-datasource.context';
export class PblInfiniteScrollDSFactory extends PblDataSourceBaseFactory {
    withInfiniteScrollOptions(options) {
        this.infiniteScrollOptions = options;
        return this;
    }
    withCacheOptions(type, options) {
        this.cacheOptions = { type, options: options };
        return this;
    }
    create() {
        const factoryOptions = {
            onTrigger: this._adapter.onTrigger,
            customTriggers: this._adapter.customTriggers,
            onCreated: this._onCreated,
            dsOptions: this._dsOptions,
            infiniteOptions: this.infiniteScrollOptions,
            cacheOptions: this.cacheOptions,
        };
        this.context = new PblInfiniteScrollDSContext(factoryOptions);
        super.onCreated(null);
        return super.create();
    }
    createAdapter() {
        return this.context.getAdapter();
    }
    createDataSource(adapter) {
        return this.context.getDataSource();
    }
}
export function createInfiniteScrollDS() {
    return new PblInfiniteScrollDSFactory();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5maW5pdGUtc2Nyb2xsLWRhdGFzb3VyY2UuZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvaW5maW5pdGUtc2Nyb2xsL3NyYy9saWIvaW5maW5pdGUtc2Nyb2xsLWRhdGEtc291cmNlL2luZmluaXRlLXNjcm9sbC1kYXRhc291cmNlLmZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHdCQUF3QixFQUF3QixNQUFNLG9CQUFvQixDQUFDO0FBRXBGLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBS2xGLE1BQU0sT0FBTywwQkFBMkMsU0FBUSx3QkFJK0Q7SUFNN0gseUJBQXlCLENBQUMsT0FBbUM7UUFDM0QsSUFBSSxDQUFDLHFCQUFxQixHQUFHLE9BQU8sQ0FBQztRQUNyQyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxnQkFBZ0IsQ0FBMkMsSUFBTyxFQUFFLE9BQXVGO1FBQ3pKLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQWMsRUFBRSxDQUFDO1FBQ3RELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELE1BQU07UUFDSixNQUFNLGNBQWMsR0FBOEM7WUFDaEUsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUztZQUNsQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjO1lBQzVDLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVTtZQUMxQixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDMUIsZUFBZSxFQUFFLElBQUksQ0FBQyxxQkFBcUI7WUFDM0MsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO1NBQ2hDLENBQUM7UUFFRixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksMEJBQTBCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDOUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV0QixPQUFPLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRVMsYUFBYTtRQUNyQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVTLGdCQUFnQixDQUFDLE9BQW9GO1FBQzdHLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0NBQ0Y7QUFFRCxNQUFNLFVBQVUsc0JBQXNCO0lBQ3BDLE9BQU8sSUFBSSwwQkFBMEIsRUFBWSxDQUFDO0FBQ3BELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQYmxEYXRhU291cmNlQmFzZUZhY3RvcnksIFBibERhdGFTb3VyY2VBZGFwdGVyIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZC9jb3JlJztcbmltcG9ydCB7IFBibEluZmluaXRlU2Nyb2xsRmFjdG9yeU9wdGlvbnMsIFBibEluZmluaXRlU2Nyb2xsRHNPcHRpb25zLCBQYmxJbmZpbml0ZVNjcm9sbFRyaWdnZXJDaGFuZ2VkRXZlbnQsIFBibEluZmluaXRlU2Nyb2xsQ2FjaGVPcHRpb25zIH0gZnJvbSAnLi9pbmZpbml0ZS1zY3JvbGwtZGF0YXNvdXJjZS50eXBlcyc7XG5pbXBvcnQgeyBQYmxJbmZpbml0ZVNjcm9sbERTQ29udGV4dCB9IGZyb20gJy4vaW5maW5pdGUtc2Nyb2xsLWRhdGFzb3VyY2UuY29udGV4dCc7XG5pbXBvcnQgeyBQYmxJbmZpbml0ZVNjcm9sbERhdGFTb3VyY2UgfSBmcm9tICcuL2luZmluaXRlLXNjcm9sbC1kYXRhc291cmNlJztcbmltcG9ydCB7IFBibEluZmluaXRlU2Nyb2xsRGF0YVNvdXJjZUFkYXB0ZXIgfSBmcm9tICcuL2luZmluaXRlLXNjcm9sbC1kYXRhc291cmNlLWFkYXB0ZXInO1xuaW1wb3J0IHsgUGJsTmdyaWRDYWNoZUFkYXB0ZXIsIFBibE5ncmlkQ2FjaGVBZGFwdGVyc01hcCB9IGZyb20gJy4vY2FjaGluZyc7XG5cbmV4cG9ydCBjbGFzcyBQYmxJbmZpbml0ZVNjcm9sbERTRmFjdG9yeTxULCBURGF0YSA9IGFueT4gZXh0ZW5kcyBQYmxEYXRhU291cmNlQmFzZUZhY3Rvcnk8VCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVERhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFBibEluZmluaXRlU2Nyb2xsVHJpZ2dlckNoYW5nZWRFdmVudDxURGF0YT4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFBibEluZmluaXRlU2Nyb2xsRGF0YVNvdXJjZUFkYXB0ZXI8VCwgVERhdGE+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQYmxJbmZpbml0ZVNjcm9sbERhdGFTb3VyY2U8VCwgVERhdGE+PiB7XG4gIHByaXZhdGUgaW5maW5pdGVTY3JvbGxPcHRpb25zOiBQYmxJbmZpbml0ZVNjcm9sbERzT3B0aW9ucztcbiAgcHJpdmF0ZSBjYWNoZU9wdGlvbnM6IFBibEluZmluaXRlU2Nyb2xsQ2FjaGVPcHRpb25zO1xuXG4gIHByaXZhdGUgY29udGV4dDogUGJsSW5maW5pdGVTY3JvbGxEU0NvbnRleHQ8VCwgVERhdGE+O1xuXG4gIHdpdGhJbmZpbml0ZVNjcm9sbE9wdGlvbnMob3B0aW9uczogUGJsSW5maW5pdGVTY3JvbGxEc09wdGlvbnMpOiB0aGlzIHtcbiAgICB0aGlzLmluZmluaXRlU2Nyb2xsT3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB3aXRoQ2FjaGVPcHRpb25zPFAgZXh0ZW5kcyBrZXlvZiBQYmxOZ3JpZENhY2hlQWRhcHRlcnNNYXA+KHR5cGU6IFAsIG9wdGlvbnM/OiBQYmxOZ3JpZENhY2hlQWRhcHRlcnNNYXBbUF0gZXh0ZW5kcyBQYmxOZ3JpZENhY2hlQWRhcHRlcjxpbmZlciBVPiA/IFUgOiBuZXZlcik6IHRoaXMge1xuICAgIHRoaXMuY2FjaGVPcHRpb25zID0geyB0eXBlLCBvcHRpb25zOiBvcHRpb25zIGFzIGFueSB9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY3JlYXRlKCk6IFBibEluZmluaXRlU2Nyb2xsRGF0YVNvdXJjZTxULCBURGF0YT4ge1xuICAgIGNvbnN0IGZhY3RvcnlPcHRpb25zOiBQYmxJbmZpbml0ZVNjcm9sbEZhY3RvcnlPcHRpb25zPFQsIFREYXRhPiA9IHtcbiAgICAgIG9uVHJpZ2dlcjogdGhpcy5fYWRhcHRlci5vblRyaWdnZXIsXG4gICAgICBjdXN0b21UcmlnZ2VyczogdGhpcy5fYWRhcHRlci5jdXN0b21UcmlnZ2VycyxcbiAgICAgIG9uQ3JlYXRlZDogdGhpcy5fb25DcmVhdGVkLFxuICAgICAgZHNPcHRpb25zOiB0aGlzLl9kc09wdGlvbnMsXG4gICAgICBpbmZpbml0ZU9wdGlvbnM6IHRoaXMuaW5maW5pdGVTY3JvbGxPcHRpb25zLFxuICAgICAgY2FjaGVPcHRpb25zOiB0aGlzLmNhY2hlT3B0aW9ucyxcbiAgICB9O1xuXG4gICAgdGhpcy5jb250ZXh0ID0gbmV3IFBibEluZmluaXRlU2Nyb2xsRFNDb250ZXh0KGZhY3RvcnlPcHRpb25zKTtcbiAgICBzdXBlci5vbkNyZWF0ZWQobnVsbCk7XG5cbiAgICByZXR1cm4gc3VwZXIuY3JlYXRlKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgY3JlYXRlQWRhcHRlcigpOiBQYmxJbmZpbml0ZVNjcm9sbERhdGFTb3VyY2VBZGFwdGVyPFQsIFREYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuY29udGV4dC5nZXRBZGFwdGVyKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgY3JlYXRlRGF0YVNvdXJjZShhZGFwdGVyOiBQYmxEYXRhU291cmNlQWRhcHRlcjxULCBURGF0YSwgUGJsSW5maW5pdGVTY3JvbGxUcmlnZ2VyQ2hhbmdlZEV2ZW50PFREYXRhPj4pOiBQYmxJbmZpbml0ZVNjcm9sbERhdGFTb3VyY2U8VCwgVERhdGE+IHtcbiAgICByZXR1cm4gdGhpcy5jb250ZXh0LmdldERhdGFTb3VyY2UoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSW5maW5pdGVTY3JvbGxEUzxULCBURGF0YSA9IFRbXT4oKTogUGJsSW5maW5pdGVTY3JvbGxEU0ZhY3Rvcnk8VCwgVERhdGE+IHtcbiAgcmV0dXJuIG5ldyBQYmxJbmZpbml0ZVNjcm9sbERTRmFjdG9yeTxULCBURGF0YT4oKTtcbn1cbiJdfQ==