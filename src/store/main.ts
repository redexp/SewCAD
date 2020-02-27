import {createAction, handleActions} from 'redux-actions';
import {useStore, useAction} from 'store';

export interface MainState {
    page: string,
}

const BASE = 'MAIN';

const DEFAULT: MainState = {
    page: 'Dashboard',
};

export function usePage() {
    return {
        page: useStore(s => r(s).page),
        setPage: useAction(setPage),
    };
}

export const setPage = createAction(BASE + '/PAGE', page => ({page}));

export default handleActions({
    [setPage.toString()]: function (state, {payload: {page}}) {
    	return {...state, page};
    },
}, DEFAULT);

function r(state) {
	return state.main;
}