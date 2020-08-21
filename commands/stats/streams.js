const { Command } = require("../../..");
const { reactionMenu } = require("../../Util");
const moment = require("moment");
const platforms = {
    "YouTube": { icon: "https://www.stickpng.com/assets/images/580b57fcd9996e24bc43c545.png", color: 0xde2925 },
    "ВКонтакте": { icon: "https://pngicon.ru/file/uploads/vk.png", color: 0x4d76a1 },
    "Twitch": { icon: "https://www.stickpng.com/assets/images/580b57fcd9996e24bc43c540.png", color: 0x6440a5},
    "GoodGame": { icon: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Gg-clean-logo-dark-blue-slogan-eng.png", color: 0x243056 }
};
module.exports = class Streams extends Command {
    constructor (...args) {
        super (...args, {
            name: "streams",
            aliases: ["стримы", "stream", "стрим"],
            description: "{{@streams.DESCRIPTION}}",
            group: "{{%CATEGORIES.STATISTIC}}",
            options: { localeKey: "streams", botPerms: ["embedLinks"] }
        });
    }
    async handle ({ msg, plugins, settings }, responder) {
        try {
            const streams = await plugins.get("vimeworld").getOnline("streams");
            if (!streams.length) return responder.error("{{NO_STREAMS}}");
            moment.locale(settings.lang);
            return reactionMenu(msg, streams.map(stream => {
                return {
                    author: {
                        name: stream.owner,
                        icon_url: platforms[stream.platform].icon,
                        url: stream.url
                    },
                    color: platforms[stream.platform].color,
                    title: stream.title,
                    description: responder.t("{{STREAM_DESCRIPTION}}", [stream.viewers, moment(Date.now() - (stream.duration * 1000)).fromNow(), stream.user.username])
                };
            }), { fast: true });
        } catch {
            return responder.error("{{%errors.VIME}}");
        }
    }
};