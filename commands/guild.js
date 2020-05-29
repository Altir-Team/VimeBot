const { Command } = require("../../");
const moment = require("moment");
const { colors, reactionMenu, applyDescription } = require("../Util");
module.exports = class Guild extends Command {
	constructor (...args) {
		super (...args, {
			name: "guild",
			aliases: ["гильдия", "гилд"],
			usage: [{ name: "query", min: 2 }],
			group: "Статистика",
			description: "Ищет гильдии по запросу. При выборе гильдии показывает его полную статистику",
			options: { botPerms: ['embedLinks'] }
		});
	}
	async handle({ msg, args, plugins }, responder) {
		try {
			const guilds = await plugins.get('vimeworld').searchGuild(args.query);
			const [guild] = await responder.selection(guilds, { exit: () => {}, mapFunc: g => `${g.name} (${g.tag ? `Тег: ${g.tag}, ` : ""}Уровень: ${g.level}, ID: ${g.id})`, title: "Выбор гильдии для просмотра подробной информации по ней" })
			const guildData = await plugins.get('vimeworld').fetchGuild(guild.id);
			moment.locale("ru");
			const pages = [];
			pages.push({
				title: 'Основная информация',
				author: { name: guildData.name },
				color: colors[guildData.color],
				thumbnail: { url: guildData.avatar_url },
				description: `${guildData.tag ? `Тег: ${guildData.tag}\n` : ""}Уровень: ${guildData.level || "0"}\n` +
				`Прогресс уровня: ${(guildData.levelPercentage * 100).toFixed(2) || "0"}%\nID: ${guildData.id}\n` +
				`Количество монет: ${guildData.totalCoins}\nДата создания: ${moment(guildData.created * 1000).fromNow()}`
			});
			if (guildData.perks) pages.push({
				title: 'Улучшения',
				author: { name: guildData.name },
				color: colors[guildData.color],
				thumbnail: { url: guildData.avatar_url },
				description: Object.keys(guildData.perks).map(v => `\t**${v}:** ${guildData.perks[v].name} (уровень: ${guildData.perks[v].level || "0"})`).join("\n")
			});
			pages.push({
				title: 'Участники',
				author: { name: guildData.name },
				color: colors[guildData.color],
				thumbnail: { url: guildData.avatar_url },
				description: applyDescription(guildData.members, { mapFunc: (x) => `\`${x.user.username}\`` }).map(v => '`' + v.user.username + '`').join(", ")
			});
			return reactionMenu(msg, pages);
		} catch {
			return await responder.error("Произошла ошибка/достигнут лимит запросов. Попробуйте позже.");
		}
	}
};