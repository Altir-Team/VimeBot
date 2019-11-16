require("dotenv-safe").config();
const Client = require("../");
const SQLite = require("better-sqlite3");
const config = require("./config.json");
const bot = new Client({
		token: process.env.TOKEN,
		locales: config.locales,
		commands: config.commands,
		disableEveryone: true,
		admins: (process.env.ADMINS || "").split(","),
		prefix: "v!"
	});

bot.unregister("middleware", true)
	.register("middleware", "middleware");
	
const VMWorld = require("./structures/vime");
const vime = bot.vime = new VMWorld(process.env.VMTOKEN);
vime.getAllAchievements().then(x => {
	bot.logger.log("All VimeWorld achievements loaded!");
	bot.vime.achievements = x;
	vime.getGames().then(c => {
		bot.logger.log("All VimeWorld games loaded!");
		bot.vime.games = c;
		vime.getLeaderTypes().then(v => {
			bot.logger.log("All VimeWorld leaderboard types loaded!");
			bot.vime.leadertypes = v;
			bot.vime.color = "3498db";
			bot.db = new SQLite("bot.db");
			bot.db.prepare("CREATE TABLE IF NOT EXISTS guilds (id INTEGER UNIQUE NOT NULL, prefix TEXT DEFAULT NULL)").run();
			bot.logger.log("Database loaded!");
			bot.run().then(() => bot.logger.log("ok"));
		});
	});
});