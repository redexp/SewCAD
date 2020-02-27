import main from './main';

const LANGUAGES = ['en', 'uk', 'ru',];

export default convert({
    main,
});

function convert(data) {
    var languages = {};

	for (var ns in data) {
	    for (var key in data[ns]) {
            for (var i = 0; i < LANGUAGES.length; i++) {
                var lang = LANGUAGES[i];

                if (!languages[lang]) {
                    languages[lang] = {};
                }

                if (!languages[lang][ns]) {
                    languages[lang][ns] = {};
                }

                if (data[ns][key][i]) {
                    languages[lang][ns][key] = data[ns][key][i];
                }
            }
        }
    }

	return languages;
}