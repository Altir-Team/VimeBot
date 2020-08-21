const { Command } = require("../../..");
const moment = require("moment");
const { colors, reactionMenu, applyDescription } = require("../../Util");
module.exports = class Guild extends Command {
    constructor (...args) {
        super (...args, {
            name: "guild",
            aliases: ["гильдия", "гилд"],
            usage: [{ name: "query", min: 2, optional: true, displayName: "{{@guild.ARGS_QUERY}}" }],
            group: "{{%CATEGORIES.INFO}}",
            description: "{{@guild.DESCRIPTION}}",
            options: { botPerms: ["embedLinks"], localeKey: "guild" }
        });
    }
    async handle({ msg, args, plugins, settings }, responder) {
        try {
            let user;
            if (settings.vimeAccount) {
                try {
                    const configUser = await plugins.get("vimeworld").getUser(settings.vimeAccount);
                    if (configUser.guild) user = configUser;
                } catch {}
            }
            if (!user && !args.query) return responder.error("{{%errors.CORRECT_USAGE}}\n" +
			"{{%errors.FULL_DESC}}: `{{%errors.INSUFFICIENT_ARGS}}`",
            { usage: this.resolver.getUsage(this.usage,
                {prefix: settings.prefix, command: this.triggers[0]},
                this.flags) });
            const { t } = responder;
            let guildData;
            if (user?.guild) guildData = await plugins.get("vimeworld").fetchGuild(user.guild.id);
            else {
                const guilds = await plugins.get("vimeworld").searchGuild(args.query);
                const [guild] = await responder.selection(guilds, { exit: () => {}, mapFunc: g => t(`{{SELECTOR_ELEMENT${g.tag ? "" : "_NO"}_TAG}}`, g), title: "{{SELECTOR_TITLE}}" });
                guildData = await plugins.get("vimeworld").fetchGuild(guild.id);
            }
            moment.locale(settings.lang);
            const pages = [];
            pages.push({
                title: t("{{MAIN_INFO.TITLE}}"),
                author: { name: guildData.name },
                color: colors[guildData.color],
                thumbnail: { url: guildData.avatar_url },
                description: t(`{{MAIN_INFO.${guildData.tag ? "" : "NO_"}TAG_DESCRIPTION}}`, { ...guildData,
                    percentage: (guildData.levelPercentage * 100).toFixed(2),
                    date: `${moment.utc(guildData.created * 1000).format("LLLL")} (${moment.utc(guildData.created * 1000).fromNow()})`,
                    coins: guildData.coins || "0"
                })
            });
            if (guildData.perks) pages.push({
                title: t("{{PERKS_INFO.TITLE}}"),
                author: { name: guildData.name },
                color: colors[guildData.color],
                thumbnail: { url: guildData.avatar_url },
                description: Object.keys(guildData.perks).map(v => t("{{PERKS_INFO.PERK_DESC}}", { name: guildData.perks[v].name, level: guildData.perks[v].level || "0" })).join("\n")
            });
            pages.push({
                title: t("{{MEMBERS_INFO.TITLE}}"),
                author: { name: guildData.name },
                color: colors[guildData.color],
                thumbnail: { url: guildData.avatar_url },
                description: applyDescription(guildData.members, { mapFunc: (member) => `\`${member.user.username}\`` })
            });
            return reactionMenu(msg, pages);
        } catch {
            return responder.error("{{%errors.VIME}}");
        }
    }
};