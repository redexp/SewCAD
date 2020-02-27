import React from 'react';
import {useTranslation} from 'react-i18next';
import Dashboard from './Dashboard';

export default function App() {
    const [__] = useTranslation();

    return (
        <Dashboard/>
    );
}