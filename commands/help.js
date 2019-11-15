let { Command } = require("../../");
module.exports = class Help extends Command {
	constructor (...args) {
		super (...args, {
			name: "help",
			group: "Основные",
			usage: [{ name: "command", type: "command", optional: true }],
			description: "Показывает список команд или полное описание команды"
		});
	}
	handle ({ args, commands, client }, responder) {
		let { command } = args;
		if (!command) {
			let categories = commands.filter(x => x.group !== "Админ").map(x => x.group).reduce((a, b) => {
				if(a.indexOf(b) < 0) a.push(b);
				return a;
			}, []).sort();
			responder.reply(["**Список команд**\n",
				"```",
				categories.map(x => `\t${x}: ${commands.filter(f => f.group == x && f).reduce((u, i) => u.includes(i) ? u : [...u, i], []).map(f => f.name).join(", ")}`).join("\n"),
				"```"].join("\n"));
		} else {
			let data = [`Информация по команде **${command.name}**`,
				`**Описание:** \`${command.description ? command.description : "Описание куда-то пропало.."}\``];
			if ((command.triggers.length - 1)) data.push(`**Алиасы:** ${command.triggers.slice(1).map(x => `\`${x}\``).join(", ")}`);
			if (command.usage.length) data.push(`**Аргументы:** ${command.usage.map(x => `\`${x.displayName} (${x.types.map(t => t)})${x.last ? " //Принимает все слова" : ""}\``).join(", ")}`);
			if (command.flags.length) data.push(`**Флаги:** ${command.flags.map(x => `\`${x.name} ${x.option ? `(${x.types.map(t => t)}) ` : "" }- ${x.description ? x.description : "Описание куда-то пропало..."}\``).join(", ")}`);
			data.push(`**Полный вид команды:** \`${this.resolver.getUsage(command.usage, { prefix: client.prefix, command: command.name }, command.flags)}\``);
			responder.format("emoji").send(data.join("\n"));
		}
	}
};