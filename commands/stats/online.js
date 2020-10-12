const { Command } = require("../../..");
const { applyDescription } = require("../../Util");
module.exports = class Online extends Command { 
    constructor (...args) {
        super (...args, {
            name: "online",
            aliases: ["онлайн"],
            description: "{{@online.DESCRIPTION}}",
            flags: [{ name: "s", description: "{{@online.FLAG_S_DESCRIPTION}}" }],
            group: "{{%CATEGORIES.STATISTIC}}",
            options: { botPerms: ["embedLinks"], localeKey: "online" }
        });
    }
    async handle ({ client, flags, plugins }, responder) {
        const { t } = responder;
        if (flags.s) {
            try {
                const online = await plugins.get("vimeworld").getOnline("staff");
                return responder.embed({
                    title: t("{{STAFF_ONLINE_TITLE}}"),
                    color: client.vimeColor,
                    description: online.length ? applyDescription(online, { mapFunc: mod => `\`${mod.username}\`` }) : t("{{STAFF_OFFLINE}}")
                }).send();
            } catch {
                return responder.error("{{%errors.VIME}}");
            }
        } else {
            try {
                const online = await plugins.get("vimeworld").getOnline("players");
                const types = Object.keys(online.separated);
                const { games } = plugins.get("vimeworld");
                return responder.embed({
                    title: t("{{PLAYERS_TITLE}}"),
                    color: client.vimeColor,
                    description: t(`{{PLAYERS_ONLINE_FULL}}\n\n${types.map(game => t("\t{{PLAYERS_ONLINE_TYPE}}", [game !== "lobby" ? games.find(type => type.id.toLowerCase() === game).name : "Lobby", online.separated[game] || "0"])).join("\n")}`, [online.total])
                }).send();
            } catch {
                return responder.error("{{%errors.VIME}}");
            }
        }
    }
};