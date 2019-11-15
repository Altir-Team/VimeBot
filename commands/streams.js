let { Command, Discord } = require("../../"),
	Utils = require("../Util"),
	moment = require("moment");
module.exports = class Streams extends Command {
	constructor (...args) {
		super (...args, {
			name: "streams",
			aliases: ["стримы", "stream", "стрим"],
			description: "Показывает список стримеров, которые сейчас стримят на VimeWorld",
			group: "Информация",
			options: { localeKey: "streams" }
		});
	}
	handle ({ msg, client, logger }, responder) {
		moment.locale("ru");
		let platforms = {
			"YouTube": { icon: "https://www.stickpng.com/assets/images/580b57fcd9996e24bc43c545.png", color: "de2925" },
			"ВКонтакте": { icon: "https://pngicon.ru/file/uploads/vk.png", color: "4d76a1" },
			"Twitch": { icon: "https://www.stickpng.com/assets/images/580b57fcd9996e24bc43c540.png", color: "6440a5"},
			"GoodGame": { icon: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Gg-clean-logo-dark-blue-slogan-eng.png", color: "243056" }
		};
		client.vime.getStreams().then(x => {
			const pages = x.map(c => {
				return new Discord.RichEmbed()
					.setAuthor(c.owner, platforms[c.platform].icon, c.url)
					.setColor(`#${platforms[c.platform].color}`)
					.setDescription(`${Discord.Util.escapeMarkdown(c.title)}\n` + 
                `**Зрителей**: ${c.viewers}\n` +
                `**Стрим начался**: ${moment(Date.now() - c.duration).fromNow()}\n` +
                `**Ник на сервере**: ${c.user.username}`);
			});
			if (!pages.length) return responder.error("Сейчас никто не стримт на VimeWorld");
			Utils.reactionMenu(msg, pages, { fast: true });
		}).catch(e => {
			logger.error(e);
			responder.error("Произошла ошибка. Попробуйте позже");
		});
	}
};