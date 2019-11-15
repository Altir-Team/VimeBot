let { Command, Discord } = require("../../");
module.exports = class Online extends Command{ 
	constructor (...args) {
		super (...args, {
			name: "online",
			aliases: ["онлайн"],
			description: "Показывает онлайн на сервере и всех мини-играх",
			flags: [{ name: "staff", description: "Список онлайн модераторов на сервере" }],
			group: "Статистика"
		});
	}
	handle ({ client, logger, flags }, responder) {
		if (flags.staff) {
			return client.vime.getStaff().then(x => {
				let embed = new Discord.RichEmbed()
					.setTitle("Список онлайн модераторов на сервере")
					.setColor(client.vime.color)
					.setDescription(x.length ? x.map(c => Discord.Util.escapeMarkdown(c.username)) : "Никого нет в сети");
				responder.embed(embed).send();
			}).catch(e => {
				logger.error(e);
				responder.error("Произошла ошибка. Попробуйте позже");
			});
		}
		client.vime.getOnline().then(x => {
			let { games } = client.vime,
				onGames = Reflect.ownKeys(x.separated);
			let embed = new Discord.RichEmbed()
				.setTitle("Онлайн на сервере VimeWorld MiniGames")
				.setColor(client.vime.color)
				.setDescription(`Полный онлайн: ${x.total}\n\n${onGames.map(c => `\tОнлайн ${c == "lobby" ? "в" : "на"} ${c !== "lobby" ? games.find(g => g.id.toLowerCase() == c).name : "Lobby"}: ${x.separated[c] || "0"}`).join("\n")}`);
			responder.embed(embed).send();
		}).catch(e => {
			logger.error(e);
			responder.error("Произошла ошибка. Попробуйте позже");
		});
	}
};