import { Observable } from 'rxjs';
export declare type DataSourceOf<T> = T[] | Promise<T[]> | Observable<T[]>;
