import { TemplateRef, OnInit, OnDestroy } from '@angular/core';
import { PblColumnTypeDefinitionDataMap } from '@pebula/ngrid/core';
import { PblNgridRegistryService } from '../../registry/registry.service';
import { PblNgridCellDefDirectiveBase } from './types';
import * as i0 from "@angular/core";
export declare abstract class PblNgridBaseCellDef<Z> implements OnInit, OnDestroy, PblNgridCellDefDirectiveBase {
    tRef: TemplateRef<Z>;
    protected registry: PblNgridRegistryService;
    name: string;
    type: keyof PblColumnTypeDefinitionDataMap;
    constructor(tRef: TemplateRef<Z>, registry: PblNgridRegistryService);
    abstract ngOnInit(): void;
    abstract ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PblNgridBaseCellDef<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<PblNgridBaseCellDef<any>, never, never, {}, {}, never, never, false>;
}
