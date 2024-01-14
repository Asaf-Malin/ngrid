import { Subject } from 'rxjs';
export class RowIntersectionTracker {
    constructor(rootElement, forceManual) {
        const intersectionChanged = this.intersectionChanged = new Subject();
        if (!forceManual && !!IntersectionObserver) {
            this.intersectionObserver = new IntersectionObserver(entries => intersectionChanged.next(entries), {
                root: rootElement,
                rootMargin: '0px',
                threshold: 0.0,
            });
        }
    }
    get observerMode() { return !!this.intersectionObserver; }
    snapshot() {
        return this.intersectionObserver?.takeRecords() ?? [];
    }
    track(element) {
        this.intersectionObserver?.observe(element);
    }
    untrack(element) {
        this.intersectionObserver?.unobserve(element);
    }
    destroy() {
        this.intersectionChanged.complete();
        this.intersectionObserver?.disconnect();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LWludGVyc2VjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmdyaWQvc3JjL2xpYi9ncmlkL2ZlYXR1cmVzL3ZpcnR1YWwtc2Nyb2xsL3Jvdy1pbnRlcnNlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUUzQyxNQUFNLE9BQU8sc0JBQXNCO0lBTWpDLFlBQVksV0FBd0IsRUFBRSxXQUFxQjtRQUN6RCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLE9BQU8sRUFBK0IsQ0FBQztRQUVsRyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsRUFBRTtZQUMxQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDakcsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixTQUFTLEVBQUUsR0FBRzthQUNmLENBQUMsQ0FBQztTQUNKO0lBRUgsQ0FBQztJQWhCRCxJQUFJLFlBQVksS0FBSyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO0lBa0IxRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDO0lBQ3hELENBQUM7SUFFRCxLQUFLLENBQUMsT0FBb0I7UUFDeEIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsT0FBTyxDQUFDLE9BQW9CO1FBQzFCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELE9BQU87UUFDSixJQUFJLENBQUMsbUJBQW9DLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFVBQVUsRUFBRSxDQUFDO0lBQzFDLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuZXhwb3J0IGNsYXNzIFJvd0ludGVyc2VjdGlvblRyYWNrZXIge1xuICBnZXQgb2JzZXJ2ZXJNb2RlKCkgeyByZXR1cm4gISF0aGlzLmludGVyc2VjdGlvbk9ic2VydmVyOyB9XG5cbiAgcmVhZG9ubHkgaW50ZXJzZWN0aW9uQ2hhbmdlZDogT2JzZXJ2YWJsZTxJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5W10+O1xuICBwcml2YXRlIHJlYWRvbmx5IGludGVyc2VjdGlvbk9ic2VydmVyOiBJbnRlcnNlY3Rpb25PYnNlcnZlcjtcblxuICBjb25zdHJ1Y3Rvcihyb290RWxlbWVudDogSFRNTEVsZW1lbnQsIGZvcmNlTWFudWFsPzogYm9vbGVhbikge1xuICAgIGNvbnN0IGludGVyc2VjdGlvbkNoYW5nZWQgPSB0aGlzLmludGVyc2VjdGlvbkNoYW5nZWQgPSBuZXcgU3ViamVjdDxJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5W10+KCk7XG5cbiAgICBpZiAoIWZvcmNlTWFudWFsICYmICEhSW50ZXJzZWN0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgIHRoaXMuaW50ZXJzZWN0aW9uT2JzZXJ2ZXIgPSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoZW50cmllcyA9PiBpbnRlcnNlY3Rpb25DaGFuZ2VkLm5leHQoZW50cmllcyksIHtcbiAgICAgICAgcm9vdDogcm9vdEVsZW1lbnQsXG4gICAgICAgIHJvb3RNYXJnaW46ICcwcHgnLFxuICAgICAgICB0aHJlc2hvbGQ6IDAuMCxcbiAgICAgIH0pO1xuICAgIH1cblxuICB9XG5cbiAgc25hcHNob3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJzZWN0aW9uT2JzZXJ2ZXI/LnRha2VSZWNvcmRzKCkgPz8gW107XG4gIH1cblxuICB0cmFjayhlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIHRoaXMuaW50ZXJzZWN0aW9uT2JzZXJ2ZXI/Lm9ic2VydmUoZWxlbWVudCk7XG4gIH1cblxuICB1bnRyYWNrKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgdGhpcy5pbnRlcnNlY3Rpb25PYnNlcnZlcj8udW5vYnNlcnZlKGVsZW1lbnQpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICAodGhpcy5pbnRlcnNlY3Rpb25DaGFuZ2VkIGFzIFN1YmplY3Q8YW55PikuY29tcGxldGUoKTtcbiAgICB0aGlzLmludGVyc2VjdGlvbk9ic2VydmVyPy5kaXNjb25uZWN0KCk7XG4gIH1cbn1cbiJdfQ==