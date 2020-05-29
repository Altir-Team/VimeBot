const { Command } = require("../../");
module.exports = class Online extends Command { 
	constructor (...args) {
		super (...args, {
			name: "online",
			aliases: ["онлайн"],
			description: "Показывает онлайн на сервере и всех мини-играх",
			flags: [{ name: "staff", description: "Список онлайн модераторов на сервере" }],
			group: "Статистика",
			options: { botPerms: ['embedLinks'] }
		});
	}
	async handle ({ client, flags, plugins }, responder) {
		if (flags.staff) {
			try {
				const online = await plugins.get('vimeworld').getOnline('staff');
				return await responder.embed({
					title: 'Список онлайн модераторов на сервере',
					color: client.vimeColor,
					description: online.length ? online.map(x => x.username).join('\n') : 'Никого нет в сети'
				}).send();
			} catch {
				return await responder.error('Произошла ошибка. Попробуйте позже');
			}
		} else {
			try {
				const online = await plugins.get('vimeworld').getOnline('players');
				const types = Object.keys(online.separated);
				const { vimeGames } = client;
				return await responder.embed({
					title: 'Онлайн на сервере VimeWorld MiniGames',
					color: client.vimeColor,
					description: `Полный онлайн: ${online.total}\n\n${types.map(c => `\tОнлайн в ${c !== "lobby" ? vimeGames.find(g => g.id.toLowerCase() == c).name : "Lobby"}: ${online.separated[c] || "0"}`).join('\n')}`
				}).send();
			} catch {
				return await responder.error("Произошла ошибка. Попробуйте позже");
			}
		}
	}
};