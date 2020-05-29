module.exports = {
	name: 'parseMessage',
	priority: 3,
	process: (container) => {
		const {msg, client, commands, isPrivate} = container;
		let prefix = client.prefix;
		const prefixes = [client.prefix];
		if (!isPrivate && container.settings.prefix !== client.prefix) prefixes.push(container.settings.prefix);
		for (const p of prefixes) {
			if (msg.content.startsWith(p)) {
				prefix = p;
				break;
			}
		}
		if (!msg.content.startsWith(prefix)) return Promise.resolve();
		const rawArgs = msg.content.substring(prefix.length).trim().split(' ');
		container.trigger = rawArgs[0].toLowerCase();
		container.isCommand = commands.has(container.trigger);
		container.rawArgs = rawArgs.slice(1).filter((v) => v);
		return Promise.resolve(container);
	}
}