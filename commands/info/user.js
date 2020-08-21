const { Command } = require("../../..");
const { locale, utc, duration } = require("moment");
const { reactionMenu } = require("../../Util");
module.exports = class UserStat extends Command {
    constructor (...args) {
        super (...args, {
            name: "user",
            aliases: ["userstat", "юзер", "пользователь"],
            usage: [{ name: "nickname", optional: true, displayName: "{{@user.ARGS_NICKNAME}}" }],
            flags: [{ name: "g", description: "{{@user.FLAG_G_DESCRIPTION}}" },
                { name: "a", description: "{{@user.FLAG_A_DESCRIPTION}}" }],
            group: "{{%CATEGORIES.INFO}}",
            description: "{{@user.DESCRIPTION}}",
            options: { localeKey: "user", botPerms: ["embedLinks"] }
        });
    }
    async handle({ msg, args, flags, client, plugins, settings }, responder) {
        locale(settings.lang);
        try {
            if (!settings.vimeAccount && !args.nickname) return responder.error("{{%errors.CORRECT_USAGE}}\n" +
			"{{%errors.FULL_DESC}}: `{{%errors.INSUFFICIENT_ARGS}}`",
            { usage: this.resolver.getUsage(this.usage,
                {prefix: settings.prefix, command: this.triggers[0]},
                this.flags) });
            const [user] = await plugins.get("vimeworld").getUser(args.nickname || settings.vimeAccount);
            if (!user) return responder.error("{{USER_NOT_FOUND}}");
            const pages = [];
            const { t } = responder;
            pages.push({
                color: plugins.get("vimeworld").rankMap[user.rank].color || client.vimeColor,
                title: t("{{STATS_TITLE}}", [user.username]),
                thumbnail: { url: `https://skin.vimeworld.ru/body/${user.username}.png` },
                description: t(`{{STATS_DESCRIPTION}}${user.lastSeen ? "\n{{STATS_LAST_SEEN}}" : ""}${user.guild ? "\n{{STATS_GUILD}}" : ""}`, [
                    user.id,
                    user.level || "0",
                    (user.levelPercentage * 100).toFixed(2),
                    plugins.get("vimeworld").rankMap[user.rank].rank,
                    duration(user.playedSeconds * 1000).humanize(),
                    user.lastSeen ? `${utc(user.lastSeen * 1000).format("LLLL")} (${utc(user.lastSeen * 1000).fromNow()})` : "",
                    user.guild?.name])
            });
            if (flags.g) {
                const { stats } = await plugins.get("vimeworld").getUserStats(user.id);
                const games = plugins.get("vimeworld").games;
                const { t } = responder;
                Object.keys(stats).map(gameID => {
                    let game = stats[gameID].global;
                    const gameStats = Object.keys(game).filter(stat => stat !== "blocks");
                    for (const stat of gameStats)
                        if (!game[stat]) game[stat] = "0";
                    pages.push({
                        color: plugins.get("vimeworld").rankMap[user.rank].color || client.vimeColor,
                        title: t("{{GAMES_TITLE}}", [games.find(v => v.id == gameID).name, user.username]),
                        description: t(gameStats.map(statName => `{{@games.${gameID.toLowerCase() + "." + statName}}}: ${game[statName]}`).join("\n"))
                    });
                });
            }
            if (flags.a) {
                const { achievements } = await plugins.get("vimeworld").getUserAchievements(user.id);
                const { achievements: vimeAchievements } = plugins.get("vimeworld");
                const categories = Reflect.ownKeys(vimeAchievements);
                for (const category of categories)
                    pages.push({
                        color: plugins.get("vimeworld").rankMap[user.rank].color || client.vimeColor,
                        title: t("{{ACHIEVEMENTS_TITLE}}", [category, user.username]),
                        description: `${vimeAchievements[category].map(achievement => t(`{{ACHIEVEMENT}}${achievements.find(userAch => userAch.id == achievement.id) ? "   |   **{{ACHIEVEMENT_COMPLETE}}**" : ""}`, [achievement.title, achievement.description.join("; "), achievement.reward])).join("\n")}`
                    });
            }
            return reactionMenu(msg, pages, { fast: true });
        } catch {
            return responder.error("{{%errors.VIME}}");
        }
    }
};
