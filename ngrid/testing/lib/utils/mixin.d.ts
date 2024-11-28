export interface Constructor<T> extends Function {
    new (...args: any[]): T;
}
export declare type Mixin<BASE, MIXIN> = BASE & MIXIN;
/**
 * Type-less mixin
 */
export declare function MixinFree(base: any, mixin: any, extend?: 'class' | 'proto' | 'both'): any;
export declare function Mixin<TBASE, CBASE, T1, C1>(base: CBASE & Constructor<TBASE>, m1: C1 & Constructor<T1>): Constructor<TBASE & T1> & CBASE & C1;
export declare function Mixin<TBASE, CBASE, T1, C1, T2, C2>(base: CBASE & Constructor<TBASE>, m1: C1 & Constructor<T1>, m2: C2 & Constructor<T2>): Constructor<TBASE & T1 & T2> & CBASE & C1 & C2;
export declare function Mixin<TBASE, CBASE, T1, C1, T2, C2, T3, C3>(base: CBASE & Constructor<TBASE>, m1: C1 & Constructor<T1>, m2: C2 & Constructor<T2>, m3: C3 & Constructor<T3>): Constructor<TBASE & T1 & T2 & T3> & CBASE & C1 & C2 & C3;
export declare function Mixin<TBASE, CBASE, T1, C1, T2, C2, T3, C3, T4, C4>(base: CBASE & Constructor<TBASE>, m1: C1 & Constructor<T1>, m2: C2 & Constructor<T2>, m3: C3 & Constructor<T3>, m4: C4 & Constructor<T4>): Constructor<TBASE & T1 & T2 & T3 & T4> & CBASE & C1 & C2 & C3 & C4;
export declare function Mixin<TBASE, CBASE, T1, C1, T2, C2, T3, C3, T4, C4, T5, C5>(base: CBASE & Constructor<TBASE>, m1: C1 & Constructor<T1>, m2: C2 & Constructor<T2>, m3: C3 & Constructor<T3>, m4: C4 & Constructor<T4>, m5: C5 & Constructor<T5>): Constructor<TBASE & T1 & T2 & T3 & T4 & T5> & CBASE & C1 & C2 & C3 & C4 & C5;
export declare function Mixin<TBASE, CBASE, T1, C1, T2, C2, T3, C3, T4, C4, T5, C5, T6, C6>(base: CBASE & Constructor<TBASE>, m1: C1 & Constructor<T1>, m2: C2 & Constructor<T2>, m3: C3 & Constructor<T3>, m4: C4 & Constructor<T4>, m5: C5 & Constructor<T5>, m6: C6 & Constructor<T6>): Constructor<TBASE & T1 & T2 & T3 & T4 & T5 & T6> & CBASE & C1 & C2 & C3 & C4 & C5 & C6;
export declare function Mixin<TBASE, CBASE, T1, C1, T2, C2, T3, C3, T4, C4, T5, C5, T6, C6, T7, C7>(base: CBASE & Constructor<TBASE>, m1: C1 & Constructor<T1>, m2: C2 & Constructor<T2>, m3: C3 & Constructor<T3>, m4: C4 & Constructor<T4>, m5: C5 & Constructor<T5>, m6: C6 & Constructor<T6>, m7: C7 & Constructor<T7>): Constructor<TBASE & T1 & T2 & T3 & T4 & T5 & T6 & T7> & CBASE & C1 & C2 & C3 & C4 & C5 & C6 & C7;
export declare function MixinExt<TBASE, CBASE, SMIXIN, T1, C1>(base: CBASE & Constructor<TBASE>, extraStatic: SMIXIN, m1: C1 & Constructor<T1>): Constructor<TBASE & T1> & SMIXIN & CBASE & C1;
export declare function MixinExt<TBASE, CBASE, SMIXIN, T1, C1, T2, C2>(base: CBASE & Constructor<TBASE>, extraStatic: SMIXIN, m1: C1 & Constructor<T1>, m2: C2 & Constructor<T2>): Constructor<TBASE & T1 & T2> & SMIXIN & CBASE & C1 & C2;
export declare function MixinExt<TBASE, CBASE, SMIXIN, T1, C1, T2, C2, T3, C3>(base: CBASE & Constructor<TBASE>, extraStatic: SMIXIN, m1: C1 & Constructor<T1>, m2: C2 & Constructor<T2>, m3: C3 & Constructor<T3>): Constructor<TBASE & T1 & T2 & T3> & SMIXIN & CBASE & C1 & C2 & C3;
export declare function MixinExt<TBASE, CBASE, SMIXIN, T1, C1, T2, C2, T3, C3, T4, C4>(base: CBASE & Constructor<TBASE>, extraStatic: SMIXIN, m1: C1 & Constructor<T1>, m2: C2 & Constructor<T2>, m3: C3 & Constructor<T3>, m4: C4 & Constructor<T4>): Constructor<TBASE & T1 & T2 & T3 & T4> & SMIXIN & CBASE & C1 & C2 & C3 & C4;
export declare function MixinExt<TBASE, CBASE, SMIXIN, T1, C1, T2, C2, T3, C3, T4, C4, T5, C5>(base: CBASE & Constructor<TBASE>, extraStatic: SMIXIN, m1: C1 & Constructor<T1>, m2: C2 & Constructor<T2>, m3: C3 & Constructor<T3>, m4: C4 & Constructor<T4>, m5: C5 & Constructor<T5>): Constructor<TBASE & T1 & T2 & T3 & T4 & T5> & SMIXIN & CBASE & C1 & C2 & C3 & C4 & C5;
export declare function MixinExt<TBASE, CBASE, SMIXIN, T1, C1, T2, C2, T3, C3, T4, C4, T5, C5, T6, C6>(base: CBASE & Constructor<TBASE>, extraStatic: SMIXIN, m1: C1 & Constructor<T1>, m2: C2 & Constructor<T2>, m3: C3 & Constructor<T3>, m4: C4 & Constructor<T4>, m5: C5 & Constructor<T5>, m6: C6 & Constructor<T6>): Constructor<TBASE & T1 & T2 & T3 & T4 & T5 & T6> & SMIXIN & CBASE & C1 & C2 & C3 & C4 & C5 & C6;
export declare function MixinExt<TBASE, CBASE, SMIXIN, T1, C1, T2, C2, T3, C3, T4, C4, T5, C5, T6, C6, T7, C7>(base: CBASE & Constructor<TBASE>, extraStatic: SMIXIN, m1: C1 & Constructor<T1>, m2: C2 & Constructor<T2>, m3: C3 & Constructor<T3>, m4: C4 & Constructor<T4>, m5: C5 & Constructor<T5>, m6: C6 & Constructor<T6>, m7: C7 & Constructor<T7>): Constructor<TBASE & T1 & T2 & T3 & T4 & T5 & T6 & T7> & SMIXIN & CBASE & C1 & C2 & C3 & C4 & C5 & C6 & C7;