const PBL_NGRID_MAP = new Map();
/**
 * A controller that groups columns of a grid and listens to resize events
 * and will notify the grid once resize occurs
 */
export class PblNgridColumnSizeObserverGroup {
    constructor(extApi) {
        this.extApi = extApi;
        this.columns = [];
        this.entries = new WeakMap();
        this.ro = new ResizeObserver(entries => {
            requestAnimationFrame(() => this.onResize(entries));
        });
    }
    static get(extApi) {
        let controller = PBL_NGRID_MAP.get(extApi.grid);
        if (!controller) {
            controller = new PblNgridColumnSizeObserverGroup(extApi);
            PBL_NGRID_MAP.set(extApi.grid, controller);
        }
        return controller;
    }
    has(col) {
        return this.columns.indexOf(col) !== -1;
    }
    hasColumn(column) {
        return this.columns.some(c => c.column === column);
    }
    add(col) {
        this.entries.set(col.target, col);
        this.ro.observe(col.target);
        this.columns.push(col);
    }
    remove(col) {
        this.ro.unobserve(col.target);
        this.entries.delete(col.target);
        const idx = this.columns.indexOf(col);
        if (idx > -1) {
            this.columns.splice(idx, 1);
        }
        if (this.columns.length === 0) {
            this.ro.disconnect();
            PBL_NGRID_MAP.delete(this.extApi.grid);
        }
    }
    onResize(entries) {
        const resized = [];
        for (const entry of entries) {
            const o = this.entries.get(entry.target);
            if (o) {
                resized.push(o);
            }
        }
        if (resized.length > 0) {
            let isDragging = false;
            for (const c of resized) {
                isDragging = isDragging || c.column.columnDef.isDragging;
                c.updateSize();
            }
            if (!isDragging) {
                this.extApi.widthCalc.calcColumnWidth(this.columns.map(c => c.column));
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXNpemUtb2JzZXJ2ZXItZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9mZWF0dXJlcy9jb2x1bW4tc2l6ZS1vYnNlcnZlci9jb2x1bW4tc2l6ZS1vYnNlcnZlci1ncm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLQSxNQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBNEQsQ0FBQztBQUUxRjs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sK0JBQStCO0lBSzFDLFlBQW9CLE1BQW9DO1FBQXBDLFdBQU0sR0FBTixNQUFNLENBQThCO1FBRmhELFlBQU8sR0FBNEIsRUFBRSxDQUFDO1FBRzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQThCLENBQUM7UUFDekQsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLGNBQWMsQ0FBRSxPQUFPLENBQUMsRUFBRTtZQUN0QyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFFLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFvQztRQUM3QyxJQUFJLFVBQVUsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2YsVUFBVSxHQUFHLElBQUksK0JBQStCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekQsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzVDO1FBQ0QsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVELEdBQUcsQ0FBQyxHQUEwQjtRQUM1QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxTQUFTLENBQUMsTUFBaUI7UUFDekIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFFLENBQUM7SUFDdkQsQ0FBQztJQUVELEdBQUcsQ0FBQyxHQUEwQjtRQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQTBCO1FBQy9CLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDWixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDN0I7UUFDRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM3QixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3JCLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QztJQUNILENBQUM7SUFFTyxRQUFRLENBQUMsT0FBK0Q7UUFDOUUsTUFBTSxPQUFPLEdBQTRCLEVBQUUsQ0FBQztRQUM1QyxLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sRUFBRTtZQUMzQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLEVBQUU7Z0JBQ0wsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqQjtTQUNGO1FBQ0QsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN0QixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDdkIsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLEVBQUU7Z0JBQ3ZCLFVBQVUsR0FBRyxVQUFVLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDO2dCQUN6RCxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDaEI7WUFDRCxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUUsQ0FBQyxDQUFDO2FBQzFFO1NBQ0Y7SUFDSCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBfUGJsTmdyaWRDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi90b2tlbnMnO1xuaW1wb3J0IHsgUGJsTmdyaWRJbnRlcm5hbEV4dGVuc2lvbkFwaSB9IGZyb20gJy4uLy4uLy4uL2V4dC9ncmlkLWV4dC1hcGknO1xuaW1wb3J0IHsgUGJsQ29sdW1uIH0gZnJvbSAnLi4vLi4vY29sdW1uL21vZGVsL2NvbHVtbic7XG5pbXBvcnQgeyBQYmxDb2x1bW5TaXplT2JzZXJ2ZXIgfSBmcm9tICcuL2NvbHVtbi1zaXplLW9ic2VydmVyJztcblxuY29uc3QgUEJMX05HUklEX01BUCA9IG5ldyBNYXA8X1BibE5ncmlkQ29tcG9uZW50PGFueT4sIFBibE5ncmlkQ29sdW1uU2l6ZU9ic2VydmVyR3JvdXA+KCk7XG5cbi8qKlxuICogQSBjb250cm9sbGVyIHRoYXQgZ3JvdXBzIGNvbHVtbnMgb2YgYSBncmlkIGFuZCBsaXN0ZW5zIHRvIHJlc2l6ZSBldmVudHNcbiAqIGFuZCB3aWxsIG5vdGlmeSB0aGUgZ3JpZCBvbmNlIHJlc2l6ZSBvY2N1cnNcbiAqL1xuZXhwb3J0IGNsYXNzIFBibE5ncmlkQ29sdW1uU2l6ZU9ic2VydmVyR3JvdXAge1xuICBwcml2YXRlIGVudHJpZXM6IFdlYWtNYXA8YW55LCBQYmxDb2x1bW5TaXplT2JzZXJ2ZXI+O1xuICBwcml2YXRlIHJvOiBSZXNpemVPYnNlcnZlcjtcbiAgcHJpdmF0ZSBjb2x1bW5zOiBQYmxDb2x1bW5TaXplT2JzZXJ2ZXJbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZXh0QXBpOiBQYmxOZ3JpZEludGVybmFsRXh0ZW5zaW9uQXBpKSB7XG4gICAgdGhpcy5lbnRyaWVzID0gbmV3IFdlYWtNYXA8YW55LCBQYmxDb2x1bW5TaXplT2JzZXJ2ZXI+KCk7XG4gICAgdGhpcy5ybyA9IG5ldyBSZXNpemVPYnNlcnZlciggZW50cmllcyA9PiB7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5vblJlc2l6ZShlbnRyaWVzKSApO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIGdldChleHRBcGk6IFBibE5ncmlkSW50ZXJuYWxFeHRlbnNpb25BcGkpOiBQYmxOZ3JpZENvbHVtblNpemVPYnNlcnZlckdyb3VwIHtcbiAgICBsZXQgY29udHJvbGxlciA9IFBCTF9OR1JJRF9NQVAuZ2V0KGV4dEFwaS5ncmlkKTtcbiAgICBpZiAoIWNvbnRyb2xsZXIpIHtcbiAgICAgIGNvbnRyb2xsZXIgPSBuZXcgUGJsTmdyaWRDb2x1bW5TaXplT2JzZXJ2ZXJHcm91cChleHRBcGkpO1xuICAgICAgUEJMX05HUklEX01BUC5zZXQoZXh0QXBpLmdyaWQsIGNvbnRyb2xsZXIpO1xuICAgIH1cbiAgICByZXR1cm4gY29udHJvbGxlcjtcbiAgfVxuXG4gIGhhcyhjb2w6IFBibENvbHVtblNpemVPYnNlcnZlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbHVtbnMuaW5kZXhPZihjb2wpICE9PSAtMTtcbiAgfVxuXG4gIGhhc0NvbHVtbihjb2x1bW46IFBibENvbHVtbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbHVtbnMuc29tZSggYyA9PiBjLmNvbHVtbiA9PT0gY29sdW1uICk7XG4gIH1cblxuICBhZGQoY29sOiBQYmxDb2x1bW5TaXplT2JzZXJ2ZXIpOiB2b2lkIHtcbiAgICB0aGlzLmVudHJpZXMuc2V0KGNvbC50YXJnZXQsIGNvbCk7XG4gICAgdGhpcy5yby5vYnNlcnZlKGNvbC50YXJnZXQpO1xuICAgIHRoaXMuY29sdW1ucy5wdXNoKGNvbCk7XG4gIH1cblxuICByZW1vdmUoY29sOiBQYmxDb2x1bW5TaXplT2JzZXJ2ZXIpOiB2b2lkIHtcbiAgICB0aGlzLnJvLnVub2JzZXJ2ZShjb2wudGFyZ2V0KTtcbiAgICB0aGlzLmVudHJpZXMuZGVsZXRlKGNvbC50YXJnZXQpO1xuICAgIGNvbnN0IGlkeCA9IHRoaXMuY29sdW1ucy5pbmRleE9mKGNvbCk7XG4gICAgaWYgKGlkeCA+IC0xKSB7XG4gICAgICB0aGlzLmNvbHVtbnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmNvbHVtbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnJvLmRpc2Nvbm5lY3QoKTtcbiAgICAgIFBCTF9OR1JJRF9NQVAuZGVsZXRlKHRoaXMuZXh0QXBpLmdyaWQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25SZXNpemUoZW50cmllczogUmVzaXplT2JzZXJ2ZXJFbnRyeVtdIHwgcmVhZG9ubHkgUmVzaXplT2JzZXJ2ZXJFbnRyeVtdKTogdm9pZCB7XG4gICAgY29uc3QgcmVzaXplZDogUGJsQ29sdW1uU2l6ZU9ic2VydmVyW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgIGNvbnN0IG8gPSB0aGlzLmVudHJpZXMuZ2V0KGVudHJ5LnRhcmdldCk7XG4gICAgICBpZiAobykge1xuICAgICAgICByZXNpemVkLnB1c2gobyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXNpemVkLmxlbmd0aCA+IDApIHtcbiAgICAgIGxldCBpc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICBmb3IgKGNvbnN0IGMgb2YgcmVzaXplZCkge1xuICAgICAgICBpc0RyYWdnaW5nID0gaXNEcmFnZ2luZyB8fCBjLmNvbHVtbi5jb2x1bW5EZWYuaXNEcmFnZ2luZztcbiAgICAgICAgYy51cGRhdGVTaXplKCk7XG4gICAgICB9XG4gICAgICBpZiAoIWlzRHJhZ2dpbmcpIHtcbiAgICAgICAgdGhpcy5leHRBcGkud2lkdGhDYWxjLmNhbGNDb2x1bW5XaWR0aCh0aGlzLmNvbHVtbnMubWFwKCBjID0+IGMuY29sdW1uICkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19