import { PblNgridComponent } from '@pebula/ngrid';
import { PickPNP } from '../../utils';
export interface PblNgridSurfaceState extends PickPNP<PblNgridComponent, 'showHeader' | 'showFooter' | 'focusMode' | 'usePagination' | 'minDataViewHeight', never> {
}
export declare function registerGridHandlers(): void;
