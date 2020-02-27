import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import translations from '../i18n';

i18n
    .use(initReactI18next)
    .init({
        resources: translations,
        lng: "uk",
        ns: 'main',
        defaultNS: 'main',
        fallbackNS: 'main',
        keySeparator: false,
        interpolation: {
            escapeValue: false,
        }
    })
    .catch(err => console.error(err));