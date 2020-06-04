const { Command } = require("../../");
const moment = require('moment');
module.exports = class Link extends Command {
	constructor(...args) {
		super(...args, {
			name: "link",
			aliases: ["привязка", "привязать"],
			description: "Привязка VimeWorld аккаунта к вашему Discord аккаунту",
			usage: [{ name: "nickname" }],
            group: "Настройка",
            subcommands: { reset: { options: { description: "Отвязать аккаунт VimeWorld от своего Discord аккаунта" } } }
		});
	}
	async handle({msg, client, settings, plugins, args}, responder) {
        moment.locale(settings.lang);
        const user = client.db.prepare('SELECT * FROM links WHERE user = ?').get(msg.author.id);
        if (user?.linkTime > Date.now() - 2.628e9) return responder.error(`вы недавно привязывали VimeWorld аккаунт к своему Discord аккаунту. Вы можете привязать новый аккаунта \`${moment.utc(user.linkTime + 2.628e9).format('LL')}\``);
        const [vimeUser] = await plugins.get('vimeworld').getUser(args.nickname);
        if (!vimeUser) return responder.error('такого игрока на VimeWorld нету');
        const check = client.db.prepare('SELECT vime FROM links WHERE vime = ?').all(vimeUser.id);
        if (check.length) return responder.error(`игрок \`${vimeUser.username}\` уже привязан к какому-то аккаунту`);
        const { ans } = await responder.format('emoji:link').dialog([{ prompt: `Вы действительно хотите привязать \`${vimeUser.username}\` к своему Discord аккаунту? Если вы не владелец аккаунта, то владелец аккаунта может отвязать этот аккаунт от вашего Discord аккаунта.
\n✍️ Напишите \`yes\` для согласия или \`no\` для отмены`, input: { name: 'ans', type: 'string', choices: ['yes', 'no'] } }]);
        if (ans == 'yes') {
            client.db.prepare('INSERT OR REPLACE INTO links (user, vime, linkTime) VALUES (?, ?, ?)').run(msg.author.id, vimeUser.id, Date.now());
            return responder.success(`аккаунт \`${vimeUser.username}\` успешно привязан`);
        } else {
            return responder.format('emoji:').reply(`вы отказались от привязки аккаунта \`${vimeUser.username}\``)
        }
    }
    reset ({ msg, settings, client }, responder) {
        if (!settings.vimeAccount) return responder.error('тебе даже отвязывать нечего 😳');
        client.db.prepare('UPDATE links SET vime = null WHERE user = ?').run(msg.author.id);
        return responder.success('вы успешно отвязали свой VimeWorld аккаунт. Но от перерыва между привязками так просто не избавиться 😔');
    }
};
