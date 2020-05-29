const VimeWorld = require('./plugins/VimeWorld');
const api = new VimeWorld();
const { writeFileSync } = require('fs');
(async () => {
	const { game_stats } = await api.getLocales();
	writeFileSync('i18n/ru/user.json', JSON.stringify(game_stats));
})();