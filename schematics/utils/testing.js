"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestApp = exports.getFileContent = void 0;
const tslib_1 = require("tslib");
var test_1 = require("@schematics/angular/utility/test");
Object.defineProperty(exports, "getFileContent", { enumerable: true, get: function () { return test_1.getFileContent; } });
function createWorkspace(runner) {
    return runner
        .runExternalSchematicAsync('@schematics/angular', 'workspace', {
        name: 'workspace',
        version: '10.0.0',
        newProjectRoot: 'projects',
    })
        .toPromise();
}
/**
 * Creates a sample workspace with two applications: 'app' (default) and 'second-app'
 */
function createTestApp(runner, appOptions = {}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let tree = yield createWorkspace(runner);
        tree =
            yield runner.runExternalSchematicAsync('@schematics/angular', 'application', Object.assign({ name: 'app' }, appOptions), tree)
                .toPromise();
        return runner
            .runExternalSchematicAsync('@schematics/angular', 'application', Object.assign({ name: 'second-app' }, appOptions), tree)
            .toPromise();
    });
}
exports.createTestApp = createTestApp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc2NoZW1hdGljcy91dGlscy90ZXN0aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFFQSx5REFBa0U7QUFBekQsc0dBQUEsY0FBYyxPQUFBO0FBRXZCLFNBQVMsZUFBZSxDQUFDLE1BQTJCO0lBQ2xELE9BQU8sTUFBTTtTQUNSLHlCQUF5QixDQUFDLHFCQUFxQixFQUFFLFdBQVcsRUFBRTtRQUM3RCxJQUFJLEVBQUUsV0FBVztRQUNqQixPQUFPLEVBQUUsUUFBUTtRQUNqQixjQUFjLEVBQUUsVUFBVTtLQUMzQixDQUFDO1NBQ0QsU0FBUyxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBc0IsYUFBYSxDQUFDLE1BQTJCLEVBQUUsVUFBVSxHQUFHLEVBQUU7O1FBQzlFLElBQUksSUFBSSxHQUFHLE1BQU0sZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pDLElBQUk7WUFDQSxNQUFNLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxxQkFBcUIsRUFBRSxhQUFhLGtCQUFHLElBQUksRUFBRSxLQUFLLElBQUssVUFBVSxHQUFHLElBQUksQ0FBQztpQkFDM0csU0FBUyxFQUFFLENBQUM7UUFFckIsT0FBTyxNQUFNO2FBQ1IseUJBQXlCLENBQUMscUJBQXFCLEVBQUUsYUFBYSxrQkFBRyxJQUFJLEVBQUUsWUFBWSxJQUFLLFVBQVUsR0FBRyxJQUFJLENBQUM7YUFDMUcsU0FBUyxFQUFFLENBQUM7SUFDbkIsQ0FBQztDQUFBO0FBVEQsc0NBU0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTY2hlbWF0aWNUZXN0UnVubmVyLCBVbml0VGVzdFRyZWUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90ZXN0aW5nJztcblxuZXhwb3J0IHsgZ2V0RmlsZUNvbnRlbnQgfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvdGVzdCc7XG5cbmZ1bmN0aW9uIGNyZWF0ZVdvcmtzcGFjZShydW5uZXI6IFNjaGVtYXRpY1Rlc3RSdW5uZXIpOiBQcm9taXNlPFVuaXRUZXN0VHJlZT4ge1xuICByZXR1cm4gcnVubmVyXG4gICAgICAucnVuRXh0ZXJuYWxTY2hlbWF0aWNBc3luYygnQHNjaGVtYXRpY3MvYW5ndWxhcicsICd3b3Jrc3BhY2UnLCB7XG4gICAgICAgIG5hbWU6ICd3b3Jrc3BhY2UnLFxuICAgICAgICB2ZXJzaW9uOiAnMTAuMC4wJyxcbiAgICAgICAgbmV3UHJvamVjdFJvb3Q6ICdwcm9qZWN0cycsXG4gICAgICB9KVxuICAgICAgLnRvUHJvbWlzZSgpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBzYW1wbGUgd29ya3NwYWNlIHdpdGggdHdvIGFwcGxpY2F0aW9uczogJ2FwcCcgKGRlZmF1bHQpIGFuZCAnc2Vjb25kLWFwcCdcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVRlc3RBcHAocnVubmVyOiBTY2hlbWF0aWNUZXN0UnVubmVyLCBhcHBPcHRpb25zID0ge30pOiBQcm9taXNlPFVuaXRUZXN0VHJlZT4ge1xuICBsZXQgdHJlZSA9IGF3YWl0IGNyZWF0ZVdvcmtzcGFjZShydW5uZXIpO1xuICB0cmVlID1cbiAgICAgIGF3YWl0IHJ1bm5lci5ydW5FeHRlcm5hbFNjaGVtYXRpY0FzeW5jKCdAc2NoZW1hdGljcy9hbmd1bGFyJywgJ2FwcGxpY2F0aW9uJywge25hbWU6ICdhcHAnLCAuLi5hcHBPcHRpb25zfSwgdHJlZSlcbiAgICAgICAgICAudG9Qcm9taXNlKCk7XG5cbiAgcmV0dXJuIHJ1bm5lclxuICAgICAgLnJ1bkV4dGVybmFsU2NoZW1hdGljQXN5bmMoJ0BzY2hlbWF0aWNzL2FuZ3VsYXInLCAnYXBwbGljYXRpb24nLCB7bmFtZTogJ3NlY29uZC1hcHAnLCAuLi5hcHBPcHRpb25zfSwgdHJlZSlcbiAgICAgIC50b1Byb21pc2UoKTtcbn1cbiJdfQ==