let { Command, Discord } = require("../../"),
	moment = require("moment");
require("moment-duration-format");
module.exports = class Online extends Command { 
	constructor (...args) {
		super (...args, {
			name: "stats",
			description: "Показывает статистику бота",
			group: "Основные"
		});
	}
	handle ({ client }, responder) {
		responder.embed(new Discord.RichEmbed()
			.setTitle(`Статистика бота ${client.user.username}`)
			.addField("Количество серверов", client.guilds.size)
			.addField("Количество пользователей", client.users.size)
			.addField("Потребление ОЗУ", (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " МБ")
			.addField("Время работы приложения", moment.duration(client.uptime).format(" D [д], H [ч], m [м], s [с]"))
			.setColor(client.vime.color)).send();
	}
};