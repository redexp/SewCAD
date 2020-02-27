import React, {PropsWithChildren, useCallback, useContext, useMemo, useRef, useState} from 'react';
import styled from 'styled-components';
import cs from 'classnames';
import Portal from 'components/Portal';

interface Notify {
    success: (text: string) => void,
    error: (text: string) => void,
    handleError: (err) => void,
    close: (item: Notification) => void,
}

const Context = React.createContext<Notify>({
    success() {

    },
    error() {

    },
    handleError() {

    },
    close() {

    },
});

type NotificationsProviderProps = PropsWithChildren<{}>;

export function NotificationsProvider(props: NotificationsProviderProps) {
    const {children} = props;

    const [items, setItems] = useState<Array<Notification>>([]);
    const ref = useRef(items);
    ref.current = items;

    const delItem = useCallback((item: Notification) => {
        const items = ref.current;

        setItems(items.filter(x => {
            if (x.id === item.id) {
                clearTimeout(x.timer);
                return false;
            }

            return true;
        }));
    }, []);

    const addItem = useCallback((item: Notification) => {
        const items = ref.current;

        setItems([...items, item]);

        item.timer = window.setTimeout(() => {
            delItem(item);
        }, 10_000);
    }, []);

    const notify = useMemo<Notify>(() => ({
        success(text) {
            addItem({
                id: Math.random(),
                type: "success",
                text,
            });
        },
        error(text) {
            console.error(text);
            addItem({
                id: Math.random(),
                type: "error",
                text,
            });
        },
        handleError(err) {
            if (err && err.message) {
                notify.error(err.message);
            }
        },
        close(item) {
            delItem(item);
        }
    }), []);

	return (
	    <Context.Provider value={notify}>
            {children}

            <Notifications
                items={items}
                onClose={notify.close}
            />
        </Context.Provider>
    );
}

interface Notification {
    id: string|number,
    type: 'success'|'error',
    text: string,
    timer?: number,
}

interface NotificationsProps {
    items: Array<Notification>,
    onClose: (item: Notification) => void,
}

export function Notifications(props: NotificationsProps) {
    const {items, onClose} = props;

    return (
        <Portal>
            <Root>
                {items.map(item => (
                    <div
                        key={item.id}
                        className={cs("alert alert-dismissible", {
                            'alert-success': item.type === 'success',
                            'alert-danger': item.type === 'error',
                        })}
                    >
                        {item.text}

                        <button onClick={() => onClose(item)} className="close" type="button">
                            <span>&times;</span>
                        </button>
                    </div>
                ))}
            </Root>
        </Portal>
    );
}

export function useNotify() {
    return useContext(Context);
}

const Root = styled.div`
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 2000;
    
    > * ~ * {
        margin-top: 10px;
    }
`;