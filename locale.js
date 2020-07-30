const VimeWorld = require('./plugins/VimeWorld');
const api = new VimeWorld();
const { writeFileSync } = require('fs');
const locales = ['ru'];
(async () => {
	for (const lang of locales) {
		const { game_stats } = await api.getLocales(lang, 'game_stats'); // если это читают разработчики API VimeWorld, то сделай ПЖ цветовые ассоциации к ранкам в локализации, ну или где-либо ещё, спасибо :))))))))))))
		writeFileSync(`i18n/${lang}/games.json`, JSON.stringify(game_stats));
	}
})();