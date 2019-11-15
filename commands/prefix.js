const { Command, Discord } = require('../../');
module.exports = class Prefix extends Command {
	constructor(...args) {
		super(...args, {
            name: 'prefix',
            aliases: ["префикс", "преф"],
            description: "Показывает текуий префикс бота",
			subcommands: {
				change: {
					usage: [{name: 'prefix', max: 4, type: 'string'}],
					description: 'Сменить дополнительный префикс бота',
					options: {permissions: ['MANAGE_GUILD'], guildOnly: true},
                },
                reset: {
                    description: 'Убрать дополнительный префикс бота',
					options: {permissions: ['MANAGE_GUILD'], guildOnly: true},
                }
			},
			group: 'Настройка',
		});
	}
	handle({settings}, responder) {
		return responder.format('emoji:info').reply(`Текущий префикс: \`${Discord.Util.escapeMarkdown(settings.prefix)}\``);
	}
	change({msg, args, client}, responder) {
		try {
			if ([client.prefix, '', null, undefined].includes(args.prefix)) {
				return this.reset({msg, client}, responder);
			}
			client.db.prepare('UPDATE guilds SET prefix = ? WHERE id = ?').run(args.prefix, msg.guild.id);
			return responder.success(`Префикс успешно сменён на \`${Discord.Util.escapeMarkdown(args.prefix)}\``);
		} catch (e) {
            console.log(e)
			return responder.error('{{%ERROR}}');
		}
    }
    reset({msg, client}, responder) {
        client.db.prepare("UPDATE guilds SET prefix = ? WHERE id = ?").run(null, msg.guild.id);
        return responder.success("Префикс успешно сброшен!");
    }
};
