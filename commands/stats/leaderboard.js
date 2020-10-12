const { Command } = require("../../..");
const { reactionMenu } = require("../../Util");
const fs = require("fs").promises;
const { join } = require("path");
class ListItem {
    constructor (object) {
        const mainObj = object.tag ? object : (object.user ?? object);
        this.id = mainObj.id;
        this.name = mainObj.name || mainObj.username;
        this.tag = mainObj.tag || undefined;
        this.level = mainObj.level;
        this.rank = mainObj.rank || undefined;
        this.rawObject = { ...object };
    }
    get isGuild () {
        return !!this.tag;
    }
    toString() {
        return this.isGuild ?
            ( this.tag ? "{{LIST_STRING.GUILD}}" : "{{LIST_STRING.GUILD_NOTAG}}") :
            "{{LIST_STRING.USERS}}";
    }
}

module.exports = class Leaderboard extends Command {
    constructor(...args) {
        super(...args, {
            name: "leaderboard",
            description: "{{@leaderboard.DESCRIPTION}}",
            group: "{{%CATEGORIES.STATISTIC}}",
            options: { localeKey: "leaderboard" }
        });
    }
    async handle ({ msg, plugins, settings, client }, responder) {
        try {
            const [leaderboardObject] = await responder.selection(plugins.get("vimeworld").leaderboards, { mapFunc: lb => lb.description, title: "{{MENUS.CHOOSE_BOARD}}" });
            const [sortType] = await responder.selection(["{{MENUS.SKIP}}", ...leaderboardObject.sort], { title: "{{MENUS.CHOOSE_SORT}}" });
            const board = await plugins.get("vimeworld").getLeaderboard(leaderboardObject.type, { sort: sortType === "{{MENUS.SKIP}}" ? null : sortType, size: leaderboardObject.max_size });
            if (!board.records?.length) return responder.error("{{FAILED_FETCH}}");
            const itemsCount = ["user", "guild"].includes(leaderboardObject.type) ? 15 : 5;
            const statsLocales = plugins.get("i18n").get(settings.lang).games;
            const list = await Promise.all(board.records.batch(itemsCount).map(async (bunch, bunchIndex) => {
                const embed = { title: responder.t(["user", "guild"].includes(leaderboardObject.type) ? "{{TOP_SINGLE_TITLE}}" : "{{TOP_TITLE}}" + (sortType === "{{MENUS.SKIP}}" ? "" : " ({{WITH_SORT}})"), { sortType, boardType: ["user", "guild"].includes(leaderboardObject.type) ? responder.t(`{{TYPES.${leaderboardObject.type.toUpperCase()}}}`) : plugins.get("vimeworld").games.find(game => game.id === leaderboardObject.type.replace(/_monthly/g, "").toUpperCase()).name }), color: client.vimeColor };
                embed.description = bunch.map((o, itemIndex) => { const item = new ListItem(o); return responder.t(`**${bunchIndex * itemsCount + itemIndex + 1}.** ${item.toString()}${statsLocales[leaderboardObject.type] ? ` **${Object.entries(statsLocales[leaderboardObject.type]).map(([stat, translation]) => `${translation}: \`${item.rawObject[stat]}\``).join(". ")}**`: ""}`, { ...item, addition: item.rawObject }); }).join("\n");
                if (settings.vimeAccount) {
                    embed.footer = {};
                    if (board.leaderboard.type === "guild") {
                        try {
                            const user = await plugins.get("vimeworld").getUser(settings.vimeAccount);
                            if (user.guild) {
                                const index = board.records.findIndex(guild => guild.id === user.guild.id);
                                embed.footer.text = responder.t(index === -1 ? "{{FOOTER.GUILD_NO_PLACE}}" : "{{FOOTER.GUILD_ON_PLACE}}", { place: index + 1 });
                            }
                        } catch {}
                    } else {
                        const index = board.records.findIndex(user => user.id === settings.vimeAccount);
                        embed.footer.text = responder.t(index === -1 ? "{{FOOTER.NO_PLACE}}" : "{{FOOTER.ON_PLACE}}", { place: index + 1 });
                    }
                }
                return embed;
            }));
            return reactionMenu(msg, list, { fast: true });
        } catch {
            return responder.error("{{%errors.VIME}}");
        }
    }
};