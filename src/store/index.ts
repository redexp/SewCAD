import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Store, Action} from 'redux';

export const Context = React.createContext(<Store>{});

export function useStore<T, S = any>(select: (s: S) => T): T {
	const store = useContext(Context);
	const [value, setValue] = useState(select(store.getState()));

	useEffect(() => {
		return store.subscribe(() => {
			setValue(select(store.getState()));
		});
	}, []);

	return value;
}

export function useAction<T>(action: (value: T) => Action): (value: T) => void {
	const store = useContext(Context);
	return useCallback(v => store.dispatch(action(v)), []);
}