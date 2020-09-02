require("./loadEnv")();
const Client = require("../");
const { Collection, User } = require("eris");
const SQLite = require("better-sqlite3");
const VimeWorldPlugin = require("./plugins/VimeWorld");
const StatPosterPlugin = require("./plugins/StatPoster");

const bot = new Client({
    token: process.env.TOKEN,
    locales: "i18n",
    admins: (process.env.ADMINS || "").split(","),
    prefix: process.env.PREFIX,
    messageLimit: 0
});
bot.users = new Collection(User, 0);

!require("fs").statSync("lists.json") && require("fs").writeFileSync("lists.json", "[]");

bot.unregister("middleware", true);
bot.register("middleware", "middleware");
bot.createPlugin("vimeworld", VimeWorldPlugin, process.env.VMTOKEN);
bot.createPlugin("statposter", StatPosterPlugin);
bot.register("statposter", require("./lists.json"));
bot.register("commands", "commands", { groupedCommands: true });

bot.plugins.get("i18n").matchRegexp = "{(.+)}";
bot.plugins.get("i18n").defaultLang = "ru";
bot.vimeColor = 0x3498db;

bot.db = new SQLite("bot.db");
bot.db.prepare("CREATE TABLE IF NOT EXISTS guilds (id TEXT UNIQUE NOT NULL, prefix TEXT DEFAULT NULL, lang TEXT DEFAULT \"ru\")").run();
bot.db.prepare(`CREATE TABLE IF NOT EXISTS links (
	user TEXT UNIQUE NOT NULL,
	vime INTEGER UNIQUE,
	linkTime INTEGER NOT NULL
	);
`).run();

bot.plugins.get("vimeworld").register().then(async () => {
    bot.logger.info("All VimeWorld data successfully loaded, logging in..");
    await bot.run();
    bot.logger.info("Successfully logged in");
    bot.editStatus("online", { name: bot.prefix + "help", type: 1 });
});