const { Command } = require("../../");
const { locale, utc } = require("moment");
const { declOfNum, reactionMenu, timeObj } = require("../Util");
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
			options: { localeKey: "user", botPerms: ['embedLinks'] }
		});
	}
	async handle({ msg, args, flags, client, plugins }, responder) {
		locale("ru");
		try {
			const [user] = await plugins.get('vimeworld').getUser(args.nickname.split(',')[0]);
			if (!user) return await responder.error("Пользователь не найден");
			const pages = [];
			const time = timeObj(user.playedSeconds * 1000);
			pages.push({
				color: plugins.get('vimeworld').rankMap[user.rank].color || client.vimeColor,
				title: 'Статистика игрока ' + user.username,
				thumbnail: { url: `https://skin.vimeworld.ru/body/${user.username}.png` },
				description: `ID: ${user.id}\nУровень: ${user.level || "0"}\nТекущий прогресс уровня: ${(user.levelPercentage * 100).toFixed(2)}%\n` +
                `Ранк: ${plugins.get('vimeworld').rankMap[user.rank].rank}\n` +
                `Сыграно в сумме:${time.days ? ` ${time.days} ${declOfNum(time.days, ["день", "дня", "дней"])}` : ""}${time.hours ? ` ${time.hours} ${declOfNum(time.hours, ["час", "часа", "часов"])}` : ""}${time.minutes ? ` ${time.minutes} ${declOfNum(time.minutes, ["минута", "минуты", "минут"])}` : ""}${time.seconds ? ` ${time.seconds} ${declOfNum(time.seconds, ["секунда", "секунды", "секунд"])}` : ""}` +
                (user.lastSeen > 0 ? `\nЗаходил(а) в последний раз: ${utc(user.lastSeen * 1000).format("LLLL")} (${utc(user.lastSeen * 1000).fromNow()})` : "") +
                (user.guild ? `\nГильдия: ${user.guild.name}` : "")
			});
			if (flags.games) {
				const { stats } = await plugins.get('vimeworld').getUserStats(user.id);
				const games = client.vimeGames;
				const { t } = responder;
				Object.keys(stats).map(x => {
					let game = stats[x].global;
					const gameStats = Object.keys(game).filter(c => c !== "blocks");
					for (const s of gameStats)
						if (!game[s]) game[s] = '0';
					pages.push({
						color: plugins.get('vimeworld').rankMap[user.rank].color || client.vimeColor,
						title: `Статистика ${games.find(v => v.id == x).name} игрока ${user.username}`,
						description: t(gameStats.map(c => `{{${x.toLowerCase() + '.' + c}}}: ${game[c]}`).join("\n"))
					});
				});
			}
			if (flags.achievements) {
				const { achievements } = await plugins.get('vimeworld').getUserAchievements(user.id);
				const { vimeAchievements } = client;
				const categories = Reflect.ownKeys(vimeAchievements);
				for (const c of categories)
					pages.push({
						color: plugins.get('vimeworld').rankMap[user.rank].color || client.vimeColor,
						title: `${c} достижения ${user.username}`,
						description: `${vimeAchievements[c].map(a => `**${a.title}:** ${a.description.join('; ')} (Награда: ${a.reward})${achievements.find(v => v.id == a.id) ? '  |  Выполнено ✅' : ''}`).join('\n')}`
					});
			}
			return reactionMenu(msg, pages, { fast: true });
		} catch {
			return await responder.error("Произошла ошибка/достигнут лимит запросов. Попробуйте позже.");
		}
	}
};
