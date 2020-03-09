import {useCallback, useState} from 'react';

export default function useRedraw(): [boolean, () => void] {
	const [state, setState] = useState(false);

	var callback = useCallback(() => setState(!state), [state]);

	return [
		state,
		callback,
	];
}