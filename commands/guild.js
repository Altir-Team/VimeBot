const { Command, Discord } = require("../../"),
	moment = require("moment"),
	Utils = require("../Util");
module.exports = class Guild extends Command {
	constructor (...args) {
		super (...args, {
			name: "guild",
			aliases: ["гильдия", "гилд"],
			usage: [{ name: "query", min: 2 }],
			group: "Статистика",
			description: "Ищет гильдии по запросу. При выборе гильдии показывает его полную статистику"
		});
	}
	handle({ msg, args, client, logger }, responder) {
		moment.locale("ru");
		const colors = Utils.colors;
		client.vime.findGuild(args.query).then(async x => {
			responder.selection(x, { mapFunc: g => `${g.name} (${g.tag ? `Тег: ${g.tag}, ` : ""}Уровень: ${g.level}, ID: ${g.id})`, title: "Выбор гильдии для просмотра подробной информации по ней" })
				.then(c => {
					if (!c.length) return;
					client.vime.getGuildByID(c[0].id).then(g => {
						const guild = [new Discord.RichEmbed()
							.setTitle(g.name)
							.setColor(colors[g.color])
							.setThumbnail(g.avatar_url).setDescription(`${g.tag ? `Тег: ${g.tag}\n` : ""}Уровень: ${g.level || "0"}\n` +
                    `Прогресс уровня: ${(g.levelPercentage * 100).toFixed(2) || "0"}%\nID: ${g.id}\n` +
                    `Количество монет: ${g.totalCoins}\nДата создания: ${moment(g.created * 1000).fromNow()}`)];
						if (g.perks) guild.push(new Discord.RichEmbed()
							.setTitle(g.name)
							.setColor(colors[g.color])
							.setThumbnail(g.avatar_url).setDescription("__Улучшения__\n\n" + Reflect.ownKeys(g.perks).map(v => `\t**${v}:** ${g.perks[v].name} (уровень: ${g.perks[v].level || "0"})`).join("\n")));
						guild.push(new Discord.RichEmbed()
							.setTitle(g.name)
							.setColor(colors[g.color])
							.setThumbnail(g.avatar_url).setDescription(g.members.map(v => Discord.Util.escapeMarkdown(v.user.username)).join(", ").trunc(2000)));
						Utils.reactionMenu(msg, guild);
					});
				});
		}).catch(e => {
			logger.error(e);
			responder.error("Произошла ошибка/достигнут лимит запросов. Попробуйте позже.");
		});
	}
};