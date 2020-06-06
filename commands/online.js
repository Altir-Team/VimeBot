const { Command } = require("../../");
const { applyDescription } = require('../Util');
module.exports = class Online extends Command { 
	constructor (...args) {
		super (...args, {
			name: "online",
			aliases: ["онлайн"],
			description: "{{@online.DESCRIPTION}}",
			flags: [{ name: "s", description: "{{@online.FLAG_S_DESCRIPTION}}" }],
			group: "{{%CATEGORIES.STATISTIC}}",
			options: { botPerms: ['embedLinks'], localeKey: 'online' }
		});
	}
	async handle ({ client, flags, plugins }, responder) {
		const { t } = responder;
		if (flags.s) {
			try {
				const online = await plugins.get('vimeworld').getOnline('staff');
				return await responder.embed({
					title: t('{{STAFF_ONLINE_TITLE}}'),
					color: client.vimeColor,
					description: online.length ? applyDescription(online, { mapFunc: x => `\`${x.username}\`` }) : t('{{STAFF_OFFLINE}}')
				}).send();
			} catch {
				return await responder.error('{{%errors.VIME}}');
			}
		} else {
			try {
				const online = await plugins.get('vimeworld').getOnline('players');
				const types = Object.keys(online.separated);
				const { vimeGames } = client;
				return await responder.embed({
					title: t('{{PLAYERS_TITLE}}'),
					color: client.vimeColor,
					description: t(`{{PLAYERS_ONLINE_FULL}}\n\n${types.map(c => t(`\t{{PLAYERS_ONLINE_TYPE}}`, [c !== "lobby" ? vimeGames.find(g => g.id.toLowerCase() == c).name : "Lobby", online.separated[c]])).join('\n')}`, [online.total])
				}).send();
			} catch {
				return await responder.error("{{%errors.VIME}}");
			}
		}
	}
};