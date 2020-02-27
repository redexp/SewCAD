import React, {PropsWithChildren, useMemo} from 'react';
import './i18n';
import {NotificationsProvider} from 'components/Notification';
import {Context} from 'store';
import createAppStore from 'store/app';

export default function AppConfig(props: PropsWithChildren<{}>) {
    const store = useMemo(createAppStore, []);

    return (
        <NotificationsProvider>
            <Context.Provider value={store}>
                {props.children}
            </Context.Provider>
        </NotificationsProvider>
    );
}