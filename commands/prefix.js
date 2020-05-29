const { Command } = require("../../");
module.exports = class Prefix extends Command {
	constructor(...args) {
		super(...args, {
			name: "prefix",
			aliases: ["префикс", "преф"],
			description: "Показывает текущий префикс бота",
			subcommands: {
				change: {
					usage: [{name: "prefix", min: 1, max: 4, type: "string"}],
					description: "Сменить дополнительный префикс бота",
					options: {modOnly: true, guildOnly: true},
				},
				reset: {
					description: "Убрать дополнительный префикс бота",
					options: {modOnly: true, guildOnly: true},
				}
			},
			group: "Настройка",
		});
	}
	handle({settings}, responder) {
		return responder.format("emoji:info").reply(`Текущий префикс: \`${settings.prefix}\``);
	}
	change({msg, args, client}, responder) {
		try {
			if ([client.prefix, "", null, undefined].includes(args.prefix)) {
				return this.reset({msg, client}, responder);
			}
			client.db.prepare("UPDATE guilds SET prefix = ? WHERE id = ?").run(args.prefix, msg.channel.guild.id);
			return responder.success(`Префикс успешно сменён на \`${args.prefix}\``);
		} catch {
			return responder.error("{{%ERROR}}");
		}
	}
	reset({msg, client}, responder) {
		client.db.prepare("UPDATE guilds SET prefix = ? WHERE id = ?").run(null, msg.channel.guild.id);
		return responder.success("Префикс успешно сброшен!");
	}
};
