import { PblNgridPluginController } from '@asafmalin/ngrid';
import { stateVisor } from './state-visor';
import { PblNgridLocalStoragePersistAdapter } from './persistance/local-storage';
import { PblNgridIdAttributeIdentResolver } from './identification/index';
export function resolveId(grid, options) {
    const id = options.identResolver.resolveId(createChunkSectionContext(grid, options));
    if (!id) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throw new Error('Could not resolve a unique id for an ngrid instance, state is disabled');
        }
    }
    return id;
}
export function serialize(def, state, ctx) {
    const keyPredicate = stateKeyPredicateFactory(def.chunkId, ctx.options);
    for (const key of def.keys) {
        if (!keyPredicate || def.rKeys.indexOf(key) > -1 || keyPredicate(key)) {
            state[key] = def.serialize(key, ctx);
        }
    }
}
export function deserialize(def, state, ctx) {
    const keyPredicate = stateKeyPredicateFactory(def.chunkId, ctx.options);
    for (const key of def.keys) {
        if (key in state) {
            if (!keyPredicate || def.rKeys.indexOf(key) > -1 || keyPredicate(key)) {
                def.deserialize(key, state[key], ctx);
            }
        }
    }
}
export function normalizeOptions(mode, options) {
    if (!options) {
        options = {};
    }
    if (!options.persistenceAdapter) {
        options.persistenceAdapter = new PblNgridLocalStoragePersistAdapter();
    }
    if (!options.identResolver) {
        options.identResolver = new PblNgridIdAttributeIdentResolver();
    }
    if (mode === 'load') {
        const opt = options;
        if (!opt.strategy) {
            opt.strategy = 'overwrite';
        }
    }
    return options;
}
export function getExtApi(grid) {
    const controller = PblNgridPluginController.find(grid);
    if (controller) {
        return controller.extApi;
    }
}
export function createChunkSectionContext(grid, options) {
    return { grid, extApi: getExtApi(grid), options };
}
export function createChunkContext(sectionContext, chunkConfig, mode) {
    return {
        ...sectionContext,
        source: chunkConfig.sourceMatcher(sectionContext),
        runChildChunk(childChunkId, state, source, data) {
            const childContext = { ...sectionContext, source, data };
            const defs = stateVisor.getDefinitionsForSection(childChunkId);
            const action = mode === 'serialize' ? serialize : deserialize;
            for (const def of defs) {
                action(def, state, childContext);
            }
        }
    };
}
export function stateKeyPredicateFactory(chunkId, options, rootPredicate = false) {
    // TODO: chunkId ans options include/exclude combination does not change
    // we need to cache it... e.g. each column def will create a new predicate if we don't cache.
    const filter = options.include || options.exclude;
    if (filter) {
        // -1: Exclude, 1: Include
        const mode = filter === options.include ? 1 : -1;
        const chunkFilter = filter[chunkId];
        if (typeof chunkFilter === 'boolean') {
            return mode === 1
                ? (key) => chunkFilter
                : (key) => !chunkFilter;
        }
        else if (Array.isArray(chunkFilter)) {
            if (rootPredicate) {
                // root predicate is for RootStateChunks and when set to true
                // the key itself has no impact on the predicate. If the filter is boolean nothing changes
                // but if it's an array, the array is ignored and considered as true ignoring the key because a key does not existing when checking the root
                return k => true;
            }
            else {
                return mode === 1
                    ? (key) => chunkFilter.indexOf(key) > -1
                    : (key) => chunkFilter.indexOf(key) === -1;
            }
        }
        else if (mode === 1) {
            return (key) => false;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3N0YXRlL3NyYy9saWIvY29yZS91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQXFCLHdCQUF3QixFQUF3QixNQUFNLGVBQWUsQ0FBQztBQVVsRyxPQUFPLEVBQUUsVUFBVSxFQUFtQyxNQUFNLGVBQWUsQ0FBQztBQUM1RSxPQUFPLEVBQUUsa0NBQWtDLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNqRixPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQVExRSxNQUFNLFVBQVUsU0FBUyxDQUFDLElBQXVCLEVBQUUsT0FBOEI7SUFDL0UsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDckYsSUFBSSxDQUFDLEVBQUUsRUFBRTtRQUNQLElBQUksT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsRUFBRTtZQUNqRCxNQUFNLElBQUksS0FBSyxDQUFDLHdFQUF3RSxDQUFDLENBQUM7U0FDM0Y7S0FDRjtJQUNELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQztBQUVELE1BQU0sVUFBVSxTQUFTLENBQUMsR0FBNkMsRUFBRSxLQUFVLEVBQUUsR0FBbUM7SUFDdEgsTUFBTSxZQUFZLEdBQUcsd0JBQXdCLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEUsS0FBSyxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFO1FBQzFCLElBQUksQ0FBQyxZQUFZLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLEdBQWEsQ0FBQyxFQUFFO1lB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QUFXLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQTtTQUM5QjtLQUNGO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBibE5ncmlkQ29tcG9uZW50LCBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIsIFBibE5ncmlkRXh0ZW5zaW9uQXBpIH0gZnJvbSAnQHBlYnVsYS9uZ3JpZCc7XG5pbXBvcnQge1xuICBSb290U3RhdGVDaHVua3MsXG4gIFN0YXRlQ2h1bmtzLFxuICBQYmxOZ3JpZFN0YXRlQ2h1bmtTZWN0aW9uQ29udGV4dCxcbiAgUGJsTmdyaWRTdGF0ZUNodW5rQ29udGV4dCxcbiAgUGJsTmdyaWRTdGF0ZU9wdGlvbnMsXG4gIFBibE5ncmlkU3RhdGVMb2FkT3B0aW9ucyxcbn0gZnJvbSAnLi9tb2RlbHMvaW5kZXgnO1xuaW1wb3J0IHsgUGJsTmdyaWRTdGF0ZUNodW5rSGFuZGxlckRlZmluaXRpb24gfSBmcm9tICcuL2hhbmRsaW5nL2Jhc2UnO1xuaW1wb3J0IHsgc3RhdGVWaXNvciwgUGJsTmdyaWRTdGF0ZUNodW5rU2VjdGlvbkNvbmZpZyB9IGZyb20gJy4vc3RhdGUtdmlzb3InO1xuaW1wb3J0IHsgUGJsTmdyaWRMb2NhbFN0b3JhZ2VQZXJzaXN0QWRhcHRlciB9IGZyb20gJy4vcGVyc2lzdGFuY2UvbG9jYWwtc3RvcmFnZSc7XG5pbXBvcnQgeyBQYmxOZ3JpZElkQXR0cmlidXRlSWRlbnRSZXNvbHZlciB9IGZyb20gJy4vaWRlbnRpZmljYXRpb24vaW5kZXgnO1xuXG4vKipcbiAqIFBpY2sgUGFydGlhbCBObyBQYXJ0aWFsXG4gKiBMaWtlIFBpY2sgYnV0IHNvbWUgYXJlIHBhcnRpYWwgc29tZSBhcmUgbm90IHBhcnRpYWxcbiAqL1xuZXhwb3J0IHR5cGUgUGlja1BOUDxULCBQIGV4dGVuZHMga2V5b2YgVCwgTlAgZXh0ZW5kcyBrZXlvZiBUPiA9IFBhcnRpYWw8UGljazxULCBQPj4gJiBQaWNrPFQsIE5QPlxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUlkKGdyaWQ6IFBibE5ncmlkQ29tcG9uZW50LCBvcHRpb25zPzogUGJsTmdyaWRTdGF0ZU9wdGlvbnMpOiBzdHJpbmcge1xuICBjb25zdCBpZCA9IG9wdGlvbnMuaWRlbnRSZXNvbHZlci5yZXNvbHZlSWQoY3JlYXRlQ2h1bmtTZWN0aW9uQ29udGV4dChncmlkLCBvcHRpb25zKSk7XG4gIGlmICghaWQpIHtcbiAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCByZXNvbHZlIGEgdW5pcXVlIGlkIGZvciBhbiBuZ3JpZCBpbnN0YW5jZSwgc3RhdGUgaXMgZGlzYWJsZWQnKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGlkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplKGRlZjogUGJsTmdyaWRTdGF0ZUNodW5rSGFuZGxlckRlZmluaXRpb248YW55Piwgc3RhdGU6IGFueSwgY3R4OiBQYmxOZ3JpZFN0YXRlQ2h1bmtDb250ZXh0PGFueT4pOiB2b2lkIHtcbiAgY29uc3Qga2V5UHJlZGljYXRlID0gc3RhdGVLZXlQcmVkaWNhdGVGYWN0b3J5KGRlZi5jaHVua0lkLCBjdHgub3B0aW9ucyk7XG4gIGZvciAoY29uc3Qga2V5IG9mIGRlZi5rZXlzKSB7XG4gICAgaWYgKCFrZXlQcmVkaWNhdGUgfHwgZGVmLnJLZXlzLmluZGV4T2Yoa2V5KSA+IC0xIHx8IGtleVByZWRpY2F0ZShrZXkgYXMgc3RyaW5nKSkge1xuICAgICAgc3RhdGVba2V5XSA9IGRlZi5zZXJpYWxpemUoa2V5LCBjdHgpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzZXJpYWxpemUoZGVmOiBQYmxOZ3JpZFN0YXRlQ2h1bmtIYW5kbGVyRGVmaW5pdGlvbjxhbnk+LCBzdGF0ZTogYW55LCBjdHg6IFBibE5ncmlkU3RhdGVDaHVua0NvbnRleHQ8YW55Pik6IHZvaWQge1xuICBjb25zdCBrZXlQcmVkaWNhdGUgPSBzdGF0ZUtleVByZWRpY2F0ZUZhY3RvcnkoZGVmLmNodW5rSWQsIGN0eC5vcHRpb25zKTtcbiAgZm9yIChjb25zdCBrZXkgb2YgZGVmLmtleXMpIHtcbiAgICBpZiAoa2V5IGluIHN0YXRlKSB7XG4gICAgICBpZiAoIWtleVByZWRpY2F0ZSB8fCBkZWYucktleXMuaW5kZXhPZihrZXkpID4gLTEgfHwga2V5UHJlZGljYXRlKGtleSBhcyBzdHJpbmcpKSB7XG4gICAgICAgIGRlZi5kZXNlcmlhbGl6ZShrZXksIHN0YXRlW2tleV0sIGN0eCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVPcHRpb25zKG1vZGU6ICdzYXZlJywgb3B0aW9ucz86IFBibE5ncmlkU3RhdGVPcHRpb25zKTogUGJsTmdyaWRTdGF0ZU9wdGlvbnM7XG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplT3B0aW9ucyhtb2RlOiAnbG9hZCcsIG9wdGlvbnM/OiBQYmxOZ3JpZFN0YXRlTG9hZE9wdGlvbnMpOiBQYmxOZ3JpZFN0YXRlTG9hZE9wdGlvbnM7XG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplT3B0aW9ucyhtb2RlOiAnc2F2ZScgfCAnbG9hZCcsIG9wdGlvbnM/OiBQYmxOZ3JpZFN0YXRlT3B0aW9ucyB8IFBibE5ncmlkU3RhdGVMb2FkT3B0aW9ucyk6IFBibE5ncmlkU3RhdGVPcHRpb25zIHwgUGJsTmdyaWRTdGF0ZUxvYWRPcHRpb25zIHtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHt9IGFzIGFueTtcbiAgfVxuXG4gIGlmICghb3B0aW9ucy5wZXJzaXN0ZW5jZUFkYXB0ZXIpIHtcbiAgICBvcHRpb25zLnBlcnNpc3RlbmNlQWRhcHRlciA9IG5ldyBQYmxOZ3JpZExvY2FsU3RvcmFnZVBlcnNpc3RBZGFwdGVyKCk7XG4gIH1cbiAgaWYgKCFvcHRpb25zLmlkZW50UmVzb2x2ZXIpIHtcbiAgICBvcHRpb25zLmlkZW50UmVzb2x2ZXIgPSBuZXcgUGJsTmdyaWRJZEF0dHJpYnV0ZUlkZW50UmVzb2x2ZXIoKTtcbiAgfVxuXG4gIGlmIChtb2RlID09PSAnbG9hZCcpIHtcbiAgICBjb25zdCBvcHQ6IFBibE5ncmlkU3RhdGVMb2FkT3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgaWYgKCFvcHQuc3RyYXRlZ3kpIHtcbiAgICAgIG9wdC5zdHJhdGVneSA9ICdvdmVyd3JpdGUnXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9wdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFeHRBcGkoZ3JpZDogUGJsTmdyaWRDb21wb25lbnQpOiBQYmxOZ3JpZEV4dGVuc2lvbkFwaSB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBQYmxOZ3JpZFBsdWdpbkNvbnRyb2xsZXIuZmluZChncmlkKTtcbiAgaWYgKGNvbnRyb2xsZXIpIHtcbiAgICByZXR1cm4gY29udHJvbGxlci5leHRBcGk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNodW5rU2VjdGlvbkNvbnRleHQoZ3JpZDogUGJsTmdyaWRDb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBQYmxOZ3JpZFN0YXRlT3B0aW9ucyB8IFBibE5ncmlkU3RhdGVMb2FkT3B0aW9ucyk6IFBibE5ncmlkU3RhdGVDaHVua1NlY3Rpb25Db250ZXh0IHtcbiAgcmV0dXJuIHsgZ3JpZCwgZXh0QXBpOiBnZXRFeHRBcGkoZ3JpZCksIG9wdGlvbnMgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNodW5rQ29udGV4dDxUIGV4dGVuZHMga2V5b2YgUm9vdFN0YXRlQ2h1bmtzPihzZWN0aW9uQ29udGV4dDogUGJsTmdyaWRTdGF0ZUNodW5rU2VjdGlvbkNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtDb25maWc6IFBibE5ncmlkU3RhdGVDaHVua1NlY3Rpb25Db25maWc8VD4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZTogJ3NlcmlhbGl6ZScgfCAnZGVzZXJpYWxpemUnKTogUGJsTmdyaWRTdGF0ZUNodW5rQ29udGV4dDxUPiB7XG4gIHJldHVybiB7XG4gICAgLi4uc2VjdGlvbkNvbnRleHQsXG4gICAgc291cmNlOiBjaHVua0NvbmZpZy5zb3VyY2VNYXRjaGVyKHNlY3Rpb25Db250ZXh0KSxcbiAgICBydW5DaGlsZENodW5rPFRDaGlsZCBleHRlbmRzIGtleW9mIFN0YXRlQ2h1bmtzPihjaGlsZENodW5rSWQ6IFRDaGlsZCwgc3RhdGU6IFN0YXRlQ2h1bmtzW1RDaGlsZF1bJ3N0YXRlJ10sIHNvdXJjZTogU3RhdGVDaHVua3NbVENoaWxkXVsndmFsdWUnXSwgZGF0YT86IFN0YXRlQ2h1bmtzW1RDaGlsZF1bJ2RhdGEnXSkge1xuICAgICAgY29uc3QgY2hpbGRDb250ZXh0ID0geyAuLi5zZWN0aW9uQ29udGV4dCwgc291cmNlLCBkYXRhIH07XG4gICAgICBjb25zdCBkZWZzID0gc3RhdGVWaXNvci5nZXREZWZpbml0aW9uc0ZvclNlY3Rpb24oY2hpbGRDaHVua0lkKTtcblxuICAgICAgY29uc3QgYWN0aW9uID0gbW9kZSA9PT0gJ3NlcmlhbGl6ZScgPyBzZXJpYWxpemUgOiBkZXNlcmlhbGl6ZTtcbiAgICAgIGZvciAoY29uc3QgZGVmIG9mIGRlZnMpIHtcbiAgICAgICAgYWN0aW9uKGRlZiwgc3RhdGUsIGNoaWxkQ29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGF0ZUtleVByZWRpY2F0ZUZhY3RvcnkoY2h1bmtJZDoga2V5b2YgU3RhdGVDaHVua3MsIG9wdGlvbnM6IFBibE5ncmlkU3RhdGVPcHRpb25zLCByb290UHJlZGljYXRlID0gZmFsc2UpOiAoKGtleTogc3RyaW5nKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCB7XG4gIC8vIFRPRE86IGNodW5rSWQgYW5zIG9wdGlvbnMgaW5jbHVkZS9leGNsdWRlIGNvbWJpbmF0aW9uIGRvZXMgbm90IGNoYW5nZVxuICAvLyB3ZSBuZWVkIHRvIGNhY2hlIGl0Li4uIGUuZy4gZWFjaCBjb2x1bW4gZGVmIHdpbGwgY3JlYXRlIGEgbmV3IHByZWRpY2F0ZSBpZiB3ZSBkb24ndCBjYWNoZS5cbiAgY29uc3QgZmlsdGVyID0gb3B0aW9ucy5pbmNsdWRlIHx8IG9wdGlvbnMuZXhjbHVkZTtcbiAgaWYgKGZpbHRlcikge1xuICAgIC8vIC0xOiBFeGNsdWRlLCAxOiBJbmNsdWRlXG4gICAgY29uc3QgbW9kZTogLTEgfCAxID0gZmlsdGVyID09PSBvcHRpb25zLmluY2x1ZGUgPyAxIDogLTE7XG4gICAgY29uc3QgY2h1bmtGaWx0ZXI6IGJvb2xlYW4gfCBzdHJpbmdbXSA9IGZpbHRlcltjaHVua0lkXTtcbiAgICBpZiAodHlwZW9mIGNodW5rRmlsdGVyID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHJldHVybiBtb2RlID09PSAxXG4gICAgICAgID8gKGtleTogc3RyaW5nKSA9PiBjaHVua0ZpbHRlclxuICAgICAgICA6IChrZXk6IHN0cmluZykgPT4gIWNodW5rRmlsdGVyXG4gICAgICA7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGNodW5rRmlsdGVyKSkge1xuICAgICAgaWYgKHJvb3RQcmVkaWNhdGUpIHtcbiAgICAgICAgLy8gcm9vdCBwcmVkaWNhdGUgaXMgZm9yIFJvb3RTdGF0ZUNodW5rcyBhbmQgd2hlbiBzZXQgdG8gdHJ1ZVxuICAgICAgICAvLyB0aGUga2V5IGl0c2VsZiBoYXMgbm8gaW1wYWN0IG9uIHRoZSBwcmVkaWNhdGUuIElmIHRoZSBmaWx0ZXIgaXMgYm9vbGVhbiBub3RoaW5nIGNoYW5nZXNcbiAgICAgICAgLy8gYnV0IGlmIGl0J3MgYW4gYXJyYXksIHRoZSBhcnJheSBpcyBpZ25vcmVkIGFuZCBjb25zaWRlcmVkIGFzIHRydWUgaWdub3JpbmcgdGhlIGtleSBiZWNhdXNlIGEga2V5IGRvZXMgbm90IGV4aXN0aW5nIHdoZW4gY2hlY2tpbmcgdGhlIHJvb3RcbiAgICAgICAgcmV0dXJuIGsgPT4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBtb2RlID09PSAxXG4gICAgICAgICAgPyAoa2V5OiBzdHJpbmcpID0+IGNodW5rRmlsdGVyLmluZGV4T2Yoa2V5KSA+IC0xXG4gICAgICAgICAgOiAoa2V5OiBzdHJpbmcpID0+IGNodW5rRmlsdGVyLmluZGV4T2Yoa2V5KSA9PT0gLTFcbiAgICAgICAgO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIChrZXk6IHN0cmluZykgPT4gZmFsc2VcbiAgICB9XG4gIH1cbn1cblxuIl19