import { SizeGroup } from './size-group';
import { SizeGroupCollection } from './size-group-collection';
export class Sizer {
    constructor(groupSize) {
        this.groupSize = 50;
        this.groups = new SizeGroupCollection();
        if (groupSize > 0) {
            this.groupSize = groupSize;
        }
    }
    clear() {
        this.groups.clear();
    }
    setSize(dsIndex, height) {
        const groupIndex = this.getGroupIndex(dsIndex);
        if (height === this.itemSize) {
            const group = this.groups.get(groupIndex);
            if (group) {
                group.remove(dsIndex);
                if (group.length === 0) {
                    this.groups.remove(groupIndex);
                }
            }
        }
        else {
            let group = this.groups.get(groupIndex);
            if (!group) {
                group = new SizeGroup(groupIndex, this.groupSize);
                this.groups.set(group);
            }
            group.set(dsIndex, height);
        }
    }
    getTotalContentSize() {
        const itemSize = this.itemSize;
        let total = this.itemsLength * itemSize;
        for (const g of this.groups.collection) {
            total += g.getRawDiffSize(itemSize);
        }
        return total;
    }
    getSizeForItem(dsIndex) {
        const groupIndex = this.getGroupIndex(dsIndex);
        return this.groups.get(groupIndex)?.getItemSize(dsIndex) || this.itemSize;
    }
    getSizeBefore(dsIndex) {
        const itemSize = this.itemSize;
        // We want all items before `dsIndex`
        // If dsIndex is 0 we want nothing
        // If dsIndex is 1 we want only 0 so `dsIndex` is also the "count" here.
        let total = dsIndex * itemSize;
        for (const g of this.groups.collection) {
            if (g.dsStart < dsIndex) {
                if (g.dsEnd > dsIndex) {
                    total += g.getSizeBefore(dsIndex, itemSize) - itemSize * (dsIndex - g.dsStart);
                }
                else {
                    total += g.getRawDiffSize(itemSize);
                }
            }
            else {
                break;
            }
        }
        return total;
    }
    getSizeForRange(dsIndexStart, dsIndexEnd) {
        const groupSize = this.groupSize;
        const itemSize = this.itemSize;
        let total = 0;
        const startGroupIndex = this.getGroupIndex(dsIndexStart);
        const endGroupIndex = this.getGroupIndex(dsIndexEnd);
        const startGroup = this.groups.get(startGroupIndex);
        if (startGroupIndex === endGroupIndex) {
            if (startGroup) {
                total += startGroup.getSubSize(dsIndexStart, dsIndexEnd, itemSize);
            }
            else {
                total += (dsIndexEnd - dsIndexStart + 1) * itemSize;
            }
        }
        else {
            for (let i = startGroupIndex + 1; i < endGroupIndex; i++) {
                const g = this.groups.get(i);
                total += g ? g.getSize(itemSize) : itemSize * groupSize;
            }
            if (startGroup) {
                total += startGroup.getSizeAfter(dsIndexStart - 1, itemSize);
            }
            else {
                total += ((startGroupIndex + 1) * groupSize - dsIndexStart + 1) * itemSize;
            }
            const endGroup = this.groups.get(endGroupIndex);
            if (endGroup) {
                total += endGroup.getSizeBefore(dsIndexEnd + 1, itemSize);
            }
            else {
                total += (dsIndexEnd - (endGroupIndex * groupSize) + 1) * itemSize;
            }
        }
        return total;
    }
    getSizeAfter(dsIndex) {
        const itemSize = this.itemSize;
        const groups = this.groups.collection;
        let total = (this.itemsLength - dsIndex - 1) * itemSize;
        for (let i = groups.length - 1; i > -1; i--) {
            const g = groups[i];
            if (g.dsEnd > dsIndex) {
                if (g.dsStart > dsIndex) {
                    total += g.getRawDiffSize(itemSize);
                }
                else {
                    total += g.getSizeAfter(dsIndex, itemSize) - itemSize * (g.dsEnd - dsIndex);
                }
            }
            else {
                break;
            }
        }
        return total;
    }
    findRenderItemAtOffset(offset) {
        const { itemSize, groupSize } = this;
        const maxGroupIndex = this.getGroupIndex(this.itemsLength);
        const firstVisibleIndex = Math.floor(offset / itemSize);
        let groupIndex = this.getGroupIndex(firstVisibleIndex);
        let groupStartPos = this.getSizeBefore(groupSize * groupIndex);
        while (true) {
            if (groupStartPos < offset) {
                if (groupIndex >= maxGroupIndex) {
                    groupIndex = maxGroupIndex;
                    break;
                }
                groupIndex += 1;
                groupStartPos += this.getSizeForRange(groupSize * groupIndex, groupSize * (groupIndex + 1) - 1);
                if (groupStartPos >= offset) {
                    groupStartPos -= this.getSizeForRange(groupSize * groupIndex, groupSize * (groupIndex + 1) - 1);
                    groupIndex -= 1;
                    break;
                }
            }
            else if (groupStartPos > offset) {
                if (groupIndex <= 0) {
                    groupIndex = 0;
                    break;
                }
                groupIndex -= 1;
                groupStartPos -= this.getSizeForRange(groupSize * groupIndex, groupSize * (groupIndex + 1) - 1);
                if (groupStartPos <= offset) {
                    break;
                }
            }
            else {
                break;
            }
        }
        let index = groupSize * groupIndex;
        const group = this.groups.get(groupIndex);
        if (!group) {
            while (groupStartPos < offset) {
                groupStartPos += itemSize;
                index += 1;
            }
        }
        else {
            while (groupStartPos < offset) {
                groupStartPos += group.getItemSize(index) || itemSize;
                index += 1;
            }
        }
        return index;
    }
    getGroupIndex(dsIndex) {
        return Math.floor(dsIndex / this.groupSize);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2l6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25ncmlkL3NyYy9saWIvZ3JpZC9mZWF0dXJlcy92aXJ0dWFsLXNjcm9sbC9zdHJhdGVnaWVzL2R5bmFtaWMtc2l6ZS9zaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRTlELE1BQU0sT0FBTyxLQUFLO0lBT2hCLFlBQVksU0FBa0I7UUFIcEIsY0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNqQixXQUFNLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBR3pDLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRTtZQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztTQUM1QjtJQUNILENBQUM7SUFFRCxLQUFLO1FBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQsT0FBTyxDQUFDLE9BQWUsRUFBRSxNQUFjO1FBQ3JDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFL0MsSUFBSSxNQUFNLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUM1QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMxQyxJQUFJLEtBQUssRUFBRTtnQkFDVCxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN0QixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDaEM7YUFDRjtTQUNGO2FBQU07WUFD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QztnQkFDMUIsS0FBSyxJQUFJLENBQUMsQ0FBQzthQUNaO1NBQ0Y7YUFBTTtZQUNMLE9BQU8sYUFBYSxHQUFHLE1BQU0sRUFBRTtnQkFDN0IsYUFBYSxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDO2dCQUN0RCxLQUFLLElBQUksQ0FBQyxDQUFDO2FBQ1o7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVTLGFBQWEsQ0FBQyxPQUFlO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNpemVHcm91cCB9IGZyb20gJy4vc2l6ZS1ncm91cCc7XG5pbXBvcnQgeyBTaXplR3JvdXBDb2xsZWN0aW9uIH0gZnJvbSAnLi9zaXplLWdyb3VwLWNvbGxlY3Rpb24nO1xuXG5leHBvcnQgY2xhc3MgU2l6ZXIge1xuXG4gIGl0ZW1TaXplOiBudW1iZXI7XG4gIGl0ZW1zTGVuZ3RoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBncm91cFNpemUgPSA1MDtcbiAgcHJpdmF0ZSBncm91cHMgPSBuZXcgU2l6ZUdyb3VwQ29sbGVjdGlvbigpO1xuXG4gIGNvbnN0cnVjdG9yKGdyb3VwU2l6ZT86IG51bWJlcikge1xuICAgIGlmIChncm91cFNpemUgPiAwKSB7XG4gICAgICB0aGlzLmdyb3VwU2l6ZSA9IGdyb3VwU2l6ZTtcbiAgICB9XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmdyb3Vwcy5jbGVhcigpO1xuICB9XG5cbiAgc2V0U2l6ZShkc0luZGV4OiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgY29uc3QgZ3JvdXBJbmRleCA9IHRoaXMuZ2V0R3JvdXBJbmRleChkc0luZGV4KTtcblxuICAgIGlmIChoZWlnaHQgPT09IHRoaXMuaXRlbVNpemUpIHtcbiAgICAgIGNvbnN0IGdyb3VwID0gdGhpcy5ncm91cHMuZ2V0KGdyb3VwSW5kZXgpO1xuICAgICAgaWYgKGdyb3VwKSB7XG4gICAgICAgIGdyb3VwLnJlbW92ZShkc0luZGV4KTtcbiAgICAgICAgaWYgKGdyb3VwLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuZ3JvdXBzLnJlbW92ZShncm91cEluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgZ3JvdXAgPSB0aGlzLmdyb3Vwcy5nZXQoZ3JvdXBJbmRleCk7XG4gICAgICBpZiAoIWdyb3VwKSB7XG4gICAgICAgIGdyb3VwID0gbmV3IFNpemVHcm91cChncm91cEluZGV4LCB0aGlzLmdyb3VwU2l6ZSk7XG4gICAgICAgIHRoaXMuZ3JvdXBzLnNldChncm91cCk7XG4gICAgICB9XG4gICAgICBncm91cC5zZXQoZHNJbmRleCwgaGVpZ2h0KTtcbiAgICB9XG4gIH1cblxuICBnZXRUb3RhbENvbnRlbnRTaXplKCkge1xuICAgIGNvbnN0IGl0ZW1TaXplID0gdGhpcy5pdGVtU2l6ZTtcblxuICAgIGxldCB0b3RhbCA9IHRoaXMuaXRlbXNMZW5ndGggKiBpdGVtU2l6ZTtcbiAgICBmb3IgKGNvbnN0IGcgb2YgdGhpcy5ncm91cHMuY29sbGVjdGlvbikge1xuICAgICAgdG90YWwgKz0gZy5nZXRSYXdEaWZmU2l6ZShpdGVtU2l6ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRvdGFsO1xuICB9XG5cbiAgZ2V0U2l6ZUZvckl0ZW0oZHNJbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3QgZ3JvdXBJbmRleCA9IHRoaXMuZ2V0R3JvdXBJbmRleChkc0luZGV4KTtcbiAgICByZXR1cm4gdGhpcy5ncm91cHMuZ2V0KGdyb3VwSW5kZXgpPy5nZXRJdGVtU2l6ZShkc0luZGV4KSB8fCB0aGlzLml0ZW1TaXplO1xuICB9XG5cbiAgZ2V0U2l6ZUJlZm9yZShkc0luZGV4OiBudW1iZXIpIHtcbiAgICBjb25zdCBpdGVtU2l6ZSA9IHRoaXMuaXRlbVNpemU7XG5cbiAgICAvLyBXZSB3YW50IGFsbCBpdGVtcyBiZWZvcmUgYGRzSW5kZXhgXG4gICAgLy8gSWYgZHNJbmRleCBpcyAwIHdlIHdhbnQgbm90aGluZ1xuICAgIC8vIElmIGRzSW5kZXggaXMgMSB3ZSB3YW50IG9ubHkgMCBzbyBgZHNJbmRleGAgaXMgYWxzbyB0aGUgXCJjb3VudFwiIGhlcmUuXG4gICAgbGV0IHRvdGFsID0gZHNJbmRleCAqIGl0ZW1TaXplO1xuICAgIGZvciAoY29uc3QgZyBvZiB0aGlzLmdyb3Vwcy5jb2xsZWN0aW9uKSB7XG4gICAgICBpZiAoZy5kc1N0YXJ0IDwgZHNJbmRleCkge1xuICAgICAgICBpZiAoZy5kc0VuZCA+IGRzSW5kZXgpIHtcbiAgICAgICAgICB0b3RhbCArPSBnLmdldFNpemVCZWZvcmUoZHNJbmRleCwgaXRlbVNpemUpIC0gaXRlbVNpemUgKiAoZHNJbmRleCAtIGcuZHNTdGFydCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG90YWwgKz0gZy5nZXRSYXdEaWZmU2l6ZShpdGVtU2l6ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0b3RhbDtcbiAgfVxuXG4gIGdldFNpemVGb3JSYW5nZShkc0luZGV4U3RhcnQ6IG51bWJlciwgZHNJbmRleEVuZDogbnVtYmVyKSB7XG4gICAgY29uc3QgZ3JvdXBTaXplID0gdGhpcy5ncm91cFNpemU7XG4gICAgY29uc3QgaXRlbVNpemUgPSB0aGlzLml0ZW1TaXplO1xuICAgIGxldCB0b3RhbCA9IDA7XG5cbiAgICBjb25zdCBzdGFydEdyb3VwSW5kZXggPSB0aGlzLmdldEdyb3VwSW5kZXgoZHNJbmRleFN0YXJ0KTtcbiAgICBjb25zdCBlbmRHcm91cEluZGV4ID0gdGhpcy5nZXRHcm91cEluZGV4KGRzSW5kZXhFbmQpO1xuICAgIGNvbnN0IHN0YXJ0R3JvdXAgPSB0aGlzLmdyb3Vwcy5nZXQoc3RhcnRHcm91cEluZGV4KTtcblxuICAgIGlmIChzdGFydEdyb3VwSW5kZXggPT09IGVuZEdyb3VwSW5kZXgpIHtcbiAgICAgIGlmIChzdGFydEdyb3VwKSB7XG4gICAgICAgIHRvdGFsICs9IHN0YXJ0R3JvdXAuZ2V0U3ViU2l6ZShkc0luZGV4U3RhcnQsIGRzSW5kZXhFbmQsIGl0ZW1TaXplKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvdGFsICs9IChkc0luZGV4RW5kIC0gZHNJbmRleFN0YXJ0ICsgMSkgKiBpdGVtU2l6ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0R3JvdXBJbmRleCArIDE7IGkgPCBlbmRHcm91cEluZGV4OyBpKyspIHtcbiAgICAgICAgY29uc3QgZyA9IHRoaXMuZ3JvdXBzLmdldChpKTtcbiAgICAgICAgdG90YWwgKz0gZyA/IGcuZ2V0U2l6ZShpdGVtU2l6ZSkgOiBpdGVtU2l6ZSAqIGdyb3VwU2l6ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXJ0R3JvdXApIHtcbiAgICAgICAgdG90YWwgKz0gc3RhcnRHcm91cC5nZXRTaXplQWZ0ZXIoZHNJbmRleFN0YXJ0IC0gMSwgaXRlbVNpemUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG90YWwgKz0gKChzdGFydEdyb3VwSW5kZXggKyAxKSAqIGdyb3VwU2l6ZSAtIGRzSW5kZXhTdGFydCArIDEpICogaXRlbVNpemU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGVuZEdyb3VwID0gdGhpcy5ncm91cHMuZ2V0KGVuZEdyb3VwSW5kZXgpO1xuICAgICAgaWYgKGVuZEdyb3VwKSB7XG4gICAgICAgIHRvdGFsICs9IGVuZEdyb3VwLmdldFNpemVCZWZvcmUoZHNJbmRleEVuZCArIDEsIGl0ZW1TaXplKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvdGFsICs9IChkc0luZGV4RW5kIC0gKGVuZEdyb3VwSW5kZXggKiBncm91cFNpemUpICsgMSkgKiBpdGVtU2l6ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdG90YWw7XG4gIH1cblxuICBnZXRTaXplQWZ0ZXIoZHNJbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3QgaXRlbVNpemUgPSB0aGlzLml0ZW1TaXplO1xuICAgIGNvbnN0IGdyb3VwcyA9IHRoaXMuZ3JvdXBzLmNvbGxlY3Rpb247XG5cbiAgICBsZXQgdG90YWwgPSAodGhpcy5pdGVtc0xlbmd0aCAtIGRzSW5kZXggLSAxKSAqIGl0ZW1TaXplO1xuICAgIGZvciAobGV0IGkgPSBncm91cHMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICAgIGNvbnN0IGcgPSBncm91cHNbaV07XG4gICAgICBpZiAoZy5kc0VuZCA+IGRzSW5kZXgpIHtcbiAgICAgICAgaWYgKGcuZHNTdGFydCA+IGRzSW5kZXgpIHtcbiAgICAgICAgICB0b3RhbCArPSBnLmdldFJhd0RpZmZTaXplKGl0ZW1TaXplKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b3RhbCArPSBnLmdldFNpemVBZnRlcihkc0luZGV4LCBpdGVtU2l6ZSkgLSBpdGVtU2l6ZSAqIChnLmRzRW5kIC0gZHNJbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG90YWw7XG4gIH1cblxuICBmaW5kUmVuZGVySXRlbUF0T2Zmc2V0KG9mZnNldDogbnVtYmVyKSB7XG4gICAgY29uc3QgeyBpdGVtU2l6ZSwgZ3JvdXBTaXplIH0gPSB0aGlzO1xuICAgIGNvbnN0IG1heEdyb3VwSW5kZXggPSB0aGlzLmdldEdyb3VwSW5kZXgodGhpcy5pdGVtc0xlbmd0aCk7XG4gICAgY29uc3QgZmlyc3RWaXNpYmxlSW5kZXggPSBNYXRoLmZsb29yKG9mZnNldCAvIGl0ZW1TaXplKTtcbiAgICBsZXQgZ3JvdXBJbmRleCA9IHRoaXMuZ2V0R3JvdXBJbmRleChmaXJzdFZpc2libGVJbmRleCk7XG4gICAgbGV0IGdyb3VwU3RhcnRQb3MgPSB0aGlzLmdldFNpemVCZWZvcmUoZ3JvdXBTaXplICogZ3JvdXBJbmRleCk7XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKGdyb3VwU3RhcnRQb3MgPCBvZmZzZXQpIHtcbiAgICAgICAgaWYgKGdyb3VwSW5kZXggPj0gbWF4R3JvdXBJbmRleCkge1xuICAgICAgICAgIGdyb3VwSW5kZXggPSBtYXhHcm91cEluZGV4O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGdyb3VwSW5kZXggKz0gMTtcbiAgICAgICAgZ3JvdXBTdGFydFBvcyArPSB0aGlzLmdldFNpemVGb3JSYW5nZShncm91cFNpemUgKiBncm91cEluZGV4LCBncm91cFNpemUgKiAoZ3JvdXBJbmRleCArIDEpIC0gMSk7XG4gICAgICAgIGlmIChncm91cFN0YXJ0UG9zID49IG9mZnNldCkge1xuICAgICAgICAgIGdyb3VwU3RhcnRQb3MgLT0gdGhpcy5nZXRTaXplRm9yUmFuZ2UoZ3JvdXBTaXplICogZ3JvdXBJbmRleCwgZ3JvdXBTaXplICogKGdyb3VwSW5kZXggKyAxKSAtIDEpO1xuICAgICAgICAgIGdyb3VwSW5kZXggLT0xO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGdyb3VwU3RhcnRQb3MgPiBvZmZzZXQpIHtcbiAgICAgICAgaWYgKGdyb3VwSW5kZXggPD0gMCkge1xuICAgICAgICAgIGdyb3VwSW5kZXggPSAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGdyb3VwSW5kZXggLT0gMTtcbiAgICAgICAgZ3JvdXBTdGFydFBvcyAtPSB0aGlzLmdldFNpemVGb3JSYW5nZShncm91cFNpemUgKiBncm91cEluZGV4LCBncm91cFNpemUgKiAoZ3JvdXBJbmRleCArIDEpIC0gMSk7XG4gICAgICAgIGlmIChncm91cFN0YXJ0UG9zIDw9IG9mZnNldCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgaW5kZXggPSBncm91cFNpemUgKiBncm91cEluZGV4O1xuICAgIGNvbnN0IGdyb3VwID0gdGhpcy5ncm91cHMuZ2V0KGdyb3VwSW5kZXgpO1xuICAgIGlmICghZ3JvdXApIHtcbiAgICAgIHdoaWxlIChncm91cFN0YXJ0UG9zIDwgb2Zmc2V0KSB7XG4gICAgICAgIGdyb3VwU3RhcnRQb3MgKz0gaXRlbVNpemU7XG4gICAgICAgIGluZGV4ICs9IDE7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHdoaWxlIChncm91cFN0YXJ0UG9zIDwgb2Zmc2V0KSB7XG4gICAgICAgIGdyb3VwU3RhcnRQb3MgKz0gZ3JvdXAuZ2V0SXRlbVNpemUoaW5kZXgpIHx8IGl0ZW1TaXplO1xuICAgICAgICBpbmRleCArPSAxO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW5kZXg7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0R3JvdXBJbmRleChkc0luZGV4OiBudW1iZXIpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihkc0luZGV4IC8gdGhpcy5ncm91cFNpemUpO1xuICB9XG59XG4iXX0=