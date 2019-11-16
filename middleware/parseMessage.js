module.exports = {
	name: "parseMessage",
	priority: 2,
	process: container => {
		const { client, msg, commands } = container;
		container.isPrivate = !msg.guild;

		let data = client.db.prepare("SELECT prefix FROM guilds WHERE id = ?").all(msg.guild.id);
		if (!data.length) client.db.prepare("INSERT INTO guilds (id) VALUES (?)").run(msg.guild.id);
		data = client.db.prepare("SELECT prefix FROM guilds WHERE id = ?").all(msg.guild.id);

		const prefixes = [data[0].prefix, client.prefix];
		let prefix = client.prefix;

		// позволяет использовать и префикс клиента, и пользовательский префикс
		for (const prefixCheck of prefixes) {
			if (msg.content.startsWith(prefixCheck)) prefix = prefixCheck;
		}
		if (!msg.content.startsWith(prefix)) return Promise.resolve();

		const rawArgs = msg.content.substring(prefix.length).split(" ");
		const trigger = container.trigger = rawArgs[0].toLowerCase();
		container.isCommand = commands.has(trigger);
		container.rawArgs = rawArgs.slice(1).filter(v => !!v);

		container.settings = { lang: "ru", prefix: data[0].prefix || client.prefix };

		return Promise.resolve(container);
	}
};