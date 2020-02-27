import {Action, combineReducers, createStore} from "redux";
import {useStore as useMainStore, useAction as useMainAction} from 'store';
import main, {MainState} from "store/main";

export interface AppState {
    main: MainState,
}

export function useStore<T>(select: (s: AppState) => T): T {
    return useMainStore<T, AppState>(select);
}

export function useAction<T>(action: (value: T) => Action): (value: T) => void {
    return useMainAction<T>(action);
}

export default function createAppStore() {
    var reducers = combineReducers({
        main,
    });

    var defaults = reducers(undefined, {type: 'INIT'});

    return createStore(reducers, defaults);
}