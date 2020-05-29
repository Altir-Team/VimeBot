const { Command } = require("../../");
const { reactionMenu } = require("../Util");
const moment = require("moment");
const platforms = {
	"YouTube": { icon: "https://www.stickpng.com/assets/images/580b57fcd9996e24bc43c545.png", color: 0xde2925 },
	"ВКонтакте": { icon: "https://pngicon.ru/file/uploads/vk.png", color: 0x4d76a1 },
	"Twitch": { icon: "https://www.stickpng.com/assets/images/580b57fcd9996e24bc43c540.png", color: 0x6440a5},
	"GoodGame": { icon: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Gg-clean-logo-dark-blue-slogan-eng.png", color: 0x243056 }
};
module.exports = class Streams extends Command {
	constructor (...args) {
		super (...args, {
			name: "streams",
			aliases: ["стримы", "stream", "стрим"],
			description: "Показывает список стримеров, которые сейчас стримят на VimeWorld",
			group: "Информация",
			options: { localeKey: "streams", botPerms: ['embedLinks'] }
		});
	}
	async handle ({ msg, plugins }, responder) {
		try {
			const streams = await plugins.get('vimeworld').getOnline('streams');
			if (!streams.length) return await responder.error("Сейчас никто не стримт на VimeWorld");
			moment.locale("ru");
			return reactionMenu(msg, streams.map(x => {
				return {
					author: {
						name: x.author,
						icon_url: platforms[x.platform],
						url: x.url
					},
					color: platforms[x.platform].color,
					title: x.title,
					description: `**Зрителей:** ${x.viewers}\n
					**Стрим начался:** ${moment(Date.now() - x.duration).fromNow()}\n
					**Ник на сервере:** ${x.user.username}`
				}
			}), { fast: true })
		} catch {
			return await responder.error("Произошла ошибка. Попробуйте позже");
		}
	}
};