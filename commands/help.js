let { Command, utils } = require("../../");
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
				`**Описание:** \`${command.description ? command.description : "Описание куда-то пропало..."}\``];
			if ((command.triggers.length - 1)) data.push(`**Алиасы:** ${command.triggers.slice(1).map(x => `\`${x}\``).join(", ")}`);
			if (command.usage.length) data.push(`**Аргументы:** ${command.usage.map(x => `\`${x.displayName} (${x.types.join(", ")})${x.last ? " //Принимает все слова" : ""}\``).join("; ")}`);
			if (command.options.permissions) data.push(`**Необходимые права для запуска:** ${command.options.permissions.map(x => utils.perms[x])}`);
			if (command.flags.length) data.push(`**Флаги:** ${command.flags.map(x => `\`${x.name} ${x.option ? `(${x.types.join(", ")}) ` : "" }- ${x.description ? x.description : "Описание куда-то пропало..."}\``).join("; ")}`);
			data.push(`**Полный вид команды:** \`${this.resolver.getUsage(command.usage, { prefix: client.prefix, command: command.name }, command.flags)}\``);
			if (command.subcommands.size) {
				command.subcommands.map(x => {
					const sub = [`> Подкоманда \`${x.name.split(" ")[1]}\``, `Описание: ${x.description ? x.description : "Описание куда-то пропало.."}`];
					if (x.usage.length) sub.push(`Аргументы: ${x.usage.map(c => `${c.displayName} (${(c.type ? [c.type] : c.types).join(", ")})${c.last ? " //Принимает все слова" : ""}`).join("; ")}`);
					if (x.flags.length) sub.push(`Флаги: ${x.flags.map(c => `${c.name} ${c.options ? `(${c.types.join(",")}) ` : ""}- ${c.description ? c.description : "Описание куда-то пропало..."}`).join("; ")}`);
					if (x.options.permissions) sub.push(`Необходимые права для запуска: ${x.options.permissions.map(c => utils.perms[c])}`);
					data.push(sub.join("\n"));
				});
			}
			responder.format("emoji").send(data.join("\n"));
		}
	}
};