import { StateChunkKeyFilter } from './core/models/index';
/**
 * Return's the `User Preferences` preset which focuses on saving and restoring state that the user
 * can define and would want to restore between sessions.
 *
 * For example, saving column width's which the user might have changed using the mouse or any other custom way provided to him (through API).
 * Saving the column order, so if the user re-ordered the table the order can be loaded back again...
 */
export declare function userSessionPref(...basedOn: StateChunkKeyFilter[]): StateChunkKeyFilter;
