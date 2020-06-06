const VimeWorld = require('./plugins/VimeWorld');
const api = new VimeWorld();
const { writeFileSync } = require('fs');
const locales = ['ru'];
(async () => {
	for (const lang of locales) {
		const { game_stats } = await api.getLocales(lang);
		writeFileSync(`i18n/${lang}/games.json`, JSON.stringify(game_stats));
	}
})();