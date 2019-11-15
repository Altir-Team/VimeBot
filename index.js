require("dotenv-safe").config();
let Client = require("../"),
	config = require("./config.json"),
	bot = new Client({
		token: process.env.TOKEN,
		locales: config.locales,
		commands: config.commands,
		disableEveryone: true,
		admins: (process.env.ADMINS || "").split(","),
		prefix: "v!"
	}),
	VMWorld = require("vimelib");

bot.unregister("middleware", true)
	.register("middleware", "middleware");
	
const vimeExtended = require("./structures/vime");
VMWorld = vimeExtended;
const vime = new VMWorld(process.env.VMTOKEN);
bot.vime = vime;
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
			bot.run().then(() => bot.logger.log("ok"));
		});
	});
});
bot.declOfNum = (number, titles) => {
	const n = Math.abs(number) % 100;
	const n1 = n % 10;
	if (n > 10 && n < 20) { return titles[2]; }
	if (n1 > 1 && n1 < 5) { return titles[1]; }
	if (n1 == 1) { return titles[0]; }
	return titles[2];
};
bot.timeObj = ( milliseconds ) => {
	let days, hours, minutes, seconds;
	seconds = Math.floor(milliseconds / 1000);
	minutes = Math.floor(seconds / 60);
	seconds = seconds % 60;
	hours = Math.floor(minutes / 60);
	minutes = minutes % 60;
	days = Math.floor(hours / 24);
	hours = hours % 24;
	return {
		days,
		hours,
		minutes,
		seconds
	};
};