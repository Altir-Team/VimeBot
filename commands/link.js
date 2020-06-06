const { Command } = require("../../");
const moment = require('moment');
module.exports = class Link extends Command {
	constructor(...args) {
		super(...args, {
			name: "link",
			aliases: ["привязка", "привязать"],
			description: "{{@link.DESCRIPTION}}",
			usage: [{ name: "nickname", displayName: '{{@link.ARGS_NICKNAME}}' }],
            group: "{{%CATEGORIES.CONFIGURATION}}",
            subcommands: { reset: { options: { description: "{{@link.reset.DESCRIPTION}}" } } },
            options: { localeKey: 'link' }
		});
	}
	async handle({msg, client, settings, plugins, args}, responder) {
        moment.locale(settings.lang);
        const user = client.db.prepare('SELECT * FROM links WHERE user = ?').get(msg.author.id);
        if (user?.linkTime > Date.now() - 2.628e9) return responder.error('{{RECENTLY_LINKED}}', [moment.utc(user.linkTime + 2.628e9).format('LL')]);
        const [vimeUser] = await plugins.get('vimeworld').getUser(args.nickname);
        if (!vimeUser) return responder.error('{{PLAYER_NOT_FOUND}}');
        const check = client.db.prepare('SELECT vime FROM links WHERE vime = ?').all(vimeUser.id);
        if (check.length) return responder.error('{{PLAYER_LINKED}}', [vimeUser.username]);
        const { PROMPT_YES: yes, PROMPT_NO: no } = plugins.get('i18n').get(settings.lang).link;
        const { ans } = await responder.format('emoji:link').dialog([{ prompt: '{{PROMPT}}', input: { name: 'ans', type: 'string', choices: [yes, no] }, ...vimeUser, yes, no }]);
        if (ans == yes) {
            client.db.prepare('INSERT OR REPLACE INTO links (user, vime, linkTime) VALUES (?, ?, ?)').run(msg.author.id, vimeUser.id, Date.now());
            return responder.success('LINK_SUCCESSFULL', [vimeUser.username]);
        } else {
            return responder.format('emoji:').reply('LINK_REFUSED', [vimeUser.username]);
        }
    }
    reset ({ msg, settings, client }, responder) {
        if (!settings.vimeAccount) return responder.error('{{reset.NOT_LINKED}}');
        client.db.prepare('UPDATE links SET vime = null WHERE user = ?').run(msg.author.id);
        return responder.success('{{reset.UNLINK_SUCCESSFULL}}');
    }
};
