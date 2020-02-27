import React from 'react';
import ReactDOM from 'react-dom';
import AppConfig from './config/app';
import App from './screens/App';

ReactDOM.render(
    <AppConfig>
        <App/>
    </AppConfig>,
    document.getElementById('root')
);