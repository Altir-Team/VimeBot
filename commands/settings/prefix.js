const { Command } = require("../../..");
module.exports = class Prefix extends Command {
    constructor(...args) {
        super(...args, {
            name: "prefix",
            aliases: ["префикс", "преф"],
            description: "{{@prefix.DESCRIPTION}}",
            subcommands: {
                change: {
                    usage: [{name: "prefix", min: 1, max: 4, type: "string", displayName: "{{@prefix.change.ARGS_PREFIX}}"}],
                    options: {modOnly: true, guildOnly: true, description: "{{@prefix.change.DESCRIPTION}}"},
                },
                reset: {
                    options: {modOnly: true, guildOnly: true, description: "{{@prefix.reset.DESCRIPTION}}"},
                }
            },
            group: "{{%CATEGORIES.CONFIGURATION}}",
            options: { localeKey: "prefix" }
        });
    }
    handle({settings, client}, responder) {
        return responder.format("emoji:info").reply(`{{${settings.prefix !== client.prefix ? "CURRENT_PREFIX" : "NOT_CONFIGURED"}}}`, [settings.prefix]);
    }
    async change({msg, args, client}, responder) {
        try {
            if ([client.prefix, "", null, undefined].includes(args.prefix)) {
                return this.reset({msg, client}, responder);
            }
            await client.db.prepare("UPDATE guilds SET prefix = ? WHERE id = ?").run(args.prefix, msg.channel.guild.id);
            return responder.success("{{change.SUCCESSFULL}}", [args.prefix]);
        } catch {
            return responder.error("{{%ERROR}}");
        }
    }
    async reset({msg, client}, responder) {
        await client.db.prepare("UPDATE guilds SET prefix = ? WHERE id = ?").run(null, msg.channel.guild.id);
        return responder.success("{{reset.SUCCESSFULL}}");
    }
};
