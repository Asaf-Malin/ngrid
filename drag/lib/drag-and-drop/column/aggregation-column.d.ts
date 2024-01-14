import { OnInit } from '@angular/core';
import { PblColumn } from '@asafmalin/ngrid';
import { CdkLazyDropList } from '../core/index';
import { PblNgridColumnReorderPluginDirective } from './column-reorder-plugin';
import * as i0 from "@angular/core";
export declare class PblNgridAggregationContainerDirective<T = any> extends CdkLazyDropList<T> implements OnInit {
    id: string;
    orientation: 'horizontal' | 'vertical';
    pending: PblColumn;
    columnContainer: PblNgridColumnReorderPluginDirective;
    ngOnInit(): void;
    ngOnDestroy(): void;
    protected gridChanged(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridAggregationContainerDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridAggregationContainerDirective<any>, "[pblAggregationContainer]", ["pblAggregationContainer"], {}, {}, never, never, false>;
}
