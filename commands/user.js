/* eslint-disable */
const { Command, Discord } = require("../../"),
	moment = require("moment"),
	Utils = require("../Util");
module.exports = class UserStat extends Command {
	constructor (...args) {
		super (...args, {
			name: "user",
			aliases: ["userstat", "юзер", "пользователь"],
			usage: [{ name: "nickname" }],
			flags: [{ name: "games", description: "Статистика со всех мини-игр" },
				{ name: "achievements", description: "Полный список полученных достижений" }],
			group: "Статистика",
			description: "Показывает статистику игрока",
			options: { localeKey: "user" }
		});
	}
	handle({ msg, args, flags, client, logger }, responder) {
		moment.locale("ru");
		client.vime.getUsersbyName(args.nickname.split(",")[0]).then(async x => {
			if (!x.length) return responder.error("Пользователь не найден");
			let user = x[0];
			const time = client.timeObj(user.playedSeconds * 1000),
				userEmbed = new Discord.RichEmbed()
					.setColor(`#${client.vime.returnReadable(user.rank).color || client.vime.color}`)
					.setTitle(`Статистика игрока ${Discord.Util.escapeMarkdown(user.username)}`)
					.setThumbnail(`https://skin.vimeworld.ru/body/${user.username}.png`)
					.setDescription(`ID: ${user.id}\nУровень: ${user.level || "0"}\nТекущий прогресс уровня: ${(user.levelPercentage * 100).toFixed(2)}%\n` +
                `Ранк: ${client.vime.returnReadable(user.rank).rank}\n` +
                `Сыграно в сумме:${time.days ? ` ${time.days} ${client.declOfNum(time.days, ["день", "дня", "дней"])}` : ""}${time.hours ? ` ${time.hours} ${client.declOfNum(time.hours, ["час", "часа", "часов"])}` : ""}${time.minutes ? ` ${time.minutes} ${client.declOfNum(time.minutes, ["минута", "минуты", "минут"])}` : ""}${time.seconds ? ` ${time.seconds} ${client.declOfNum(time.seconds, ["секунда", "секунды", "секунд"])}` : ""}` +
                (user.lastSeen > 0 ? `\nЗаходил(а) в последний раз: ${moment.utc(user.lastSeen * 1000).format("LLLL")} (${moment.utc(user.lastSeen * 1000).fromNow()})` : "") +
                (user.guild ? `\nГильдия: ${user.guild.name}` : ""));
			const pages = [userEmbed];
			if (flags.games) {
				user = await client.vime.getStats(user.id);
				const games = client.vime.games;
				user = Object.assign(user.user, user);
				delete user.user;
				const { t } = responder,
					userGames = user.stats;
				Reflect.ownKeys(userGames).map(x => {
					let game = user.stats[x].global,
						stats = Reflect.ownKeys(game).filter(c => c !== "blocks");
					stats.forEach(v => !game[v] ? game[v] = "0" : game[v] = game[v]);
					pages.push(new Discord.RichEmbed()
						.setColor(`#${client.vime.returnReadable(user.rank).color || client.vime.color}`)
						.setTitle(`Статистика ${games.find(v => v.id == x).name} игрока ${Discord.Util.escapeMarkdown(user.username)}`)
						.setDescription(t(stats.map(c => `{{${c}}}`).join("\n"), Object.assign(game))));
				});
			}
			if (flags.achievements) {
				user = await client.vime.getAchievements(user.id);
				const achievements = client.vime.achievements;
				user = Object.assign(user.user, user);
				delete user.user;
				const categories = Reflect.ownKeys(achievements);
				categories.map(x => {
					pages.push(new Discord.RichEmbed()
						.setColor(`#${client.vime.returnReadable(user.rank).color || client.vime.color}`)
						.setTitle(`${x} достижения ${Discord.Util.escapeMarkdown(user.username)}`)
						.setDescription(`${achievements[x].map(c => `**${c.title}**: ${c.description.join("; ")} (Награда: ${c.reward})${user.achievements.find(v => v.id == c.id) ? "  |  Выполнено ✅" : ""}`).join("\n")}`));
				});
			}
			Utils.reactionMenu(msg, pages, { fast: true });
		}).catch(e => {
			logger.error(e);
			responder.error("Произошла ошибка/достигнут лимит запросов. Попробуйте позже.");
		});
	}
};