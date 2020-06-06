require("dotenv-safe").config();
const Client = require("../");
const SQLite = require("better-sqlite3");
const VimeWorldPlugin = require('./plugins/VimeWorld');
const StatPosterPlugin = require('./plugins/StatPoster');
const bot = new Client({
	token: process.env.TOKEN,
	locales: 'i18n',
	commands: 'commands',
	admins: (process.env.ADMINS || "").split(","),
	prefix: process.env.PREFIX
});

!require('fs').statSync('lists.json') && require('fs').writeFileSync('lists.json', '[]');


bot.unregister("middleware", true)
bot.register("middleware", "middleware");
bot.createPlugin('vimeworld', VimeWorldPlugin, process.env.VMTOKEN);
bot.createPlugin('statposter', StatPosterPlugin);
bot.register('statposter', require('./lists.json'));
bot.plugins.get('i18n').matchRegexp = '{(.+)}';
bot.plugins.get('i18n').defaultLang = 'ru';

bot.plugins.get('vimeworld').getAchievements().then(async x => {
	bot.vimeAchievements = x;
	bot.logger.log("All VimeWorld achievements loaded!");

	bot.vimeGames = await bot.plugins.get('vimeworld').getGames();
	bot.logger.log("All VimeWorld games loaded!");

	bot.vimeLeadertypes = await bot.plugins.get('vimeworld').getLeaderboardList();
	bot.logger.log("All VimeWorld leaderboard types loaded!");

	bot.vimeColor = 0x3498db;

	bot.db = new SQLite("bot.db");
	bot.db.prepare(`CREATE TABLE IF NOT EXISTS guilds (id TEXT UNIQUE NOT NULL, prefix TEXT DEFAULT NULL, lang TEXT DEFAULT "ru")`).run();
	bot.db.prepare(`CREATE TABLE IF NOT EXISTS links (
		user TEXT UNIQUE NOT NULL,
		vime INTEGER UNIQUE,
		linkTime INTEGER NOT NULL
		);
	`).run();

	await bot.run();

	bot.logger.log('ok');

	bot.editStatus('online', { name: 'Prefix: ' + bot.prefix, type: 1 });
});