const { Command, utils } = require("../../..");
module.exports = class Help extends Command {
    constructor (...args) {
        super (...args, {
            name: "help",
            aliases: ["commands", "cmds", "команды", "помощь"],
            group: "{{%CATEGORIES.CORE}}",
            usage: [{ name: "command", type: "command", optional: true, displayName: "{{@help.ARGS_COMMAND}}" }],
            description: "{{@help.DESCRIPTION}}",
            options: { localeKey: "help" }
        });
    }
    handle ({ args, commands, settings, plugins }, responder) {
        const { command } = args;
        if (!command) {
            const categories = commands.filter(command => !command.options.adminOnly).map(command => command.group).reduce((a, b) => {
                if(a.indexOf(b) < 0) a.push(b);
                return a;
            }, []).sort();
            responder.reply(["**{{COMMANDS_LIST}}**",
                categories.map(category => `\t* **${category}**: \n\t-\t${commands.filter(command => !command.options.adminOnly && command.group === category && command).reduce((a, b) => a.includes(b) ? a : [...a, b], []).map(command => "`" + command.name + "`").join(", ")}`).join("\n")]
            .join("\n"));
        } else {
            const { t } = responder;
            const data = [t("{{COMMAND_INFO}}", [command.name])];
            if (command.description) data.push(t("{{COMMAND_DESCRIPTION}}", [command.description]));
            if (command.triggers.length - 1) data.push(t("{{COMMAND_ALIASES}}", [command.triggers.slice(1).map(x => `\`${x}\``).join(", ")]));
            if (command.usage.length) data.push(t("{{COMMAND_ARGS}}", [command.usage.map(x => `\`${t(x.displayName)} (${x.types.join(", ")})${x.last ? " " + t("{{COMMAND_ARG_ALL_WORDS}}") : ""}\``).join("; ")]));
            if (command.options.permissions) data.push(t("{{COMMAND_PERMISSIONS}}", [command.options.permissions.map(x => utils.perms[x])]));
            if (command.flags.length) data.push(t("{{COMMAND_FLAGS}}", [command.flags.map(x => `\`${x.name} ${x.option ? `(${x.types.join(", ")}) ` : ""}- ${x.description || t("{{COMMAND_DESCRIPTION_NOT_FOUND}}")}\``).join("; ")]));
            data.push(t("{{COMMAND_FULL_USAGE}}", [t(this.resolver.getUsage(command.usage, { prefix: settings.prefix, command: command.name }, command.flags))]));
            for (const [, subcommand] of command.subcommands) {
                const sub = [t("> {{SUBCOMMAND}}", [subcommand.name])];
                if (subcommand.options.description) sub.push(t("\t{{COMMAND_DESCRIPTION}}", [subcommand.options.description]));
                if (subcommand.usage.length) sub.push(t("\t{{COMMAND_ARGS}}", [subcommand.usage.map(arg => `${arg.displayName || arg.name} (${arg.types.join(", ")})${arg.last ? " " + t("{{COMMAND_ARG_ALL_WORDS}}") : ""}`).join("; ")]));
                if (subcommand.flags.length) sub.push(t("\t{{COMMAND_FLAGS}}", [subcommand.flags.map(flag => `${flag.name} ${flag.options ? `(${flag.types.join(",")}) ` : ""}- ${flag.description || t("{{COMMAND_DESCRIPTION_NOT_FOUND}}")}`).join("; ")]));
                if (subcommand.options.permissions) sub.push(t("\t{{COMMAND_PERMISSIONS}}", [subcommand.options.permissions.map(perm => utils.perms[perm])]));
                sub.push(t("\t{{COMMAND_FULL_USAGE}}", [this.resolver.getUsage(subcommand.usage, { prefix: settings.prefix, command: command.name + " " + subcommand.name }, subcommand.flags)]));
                data.push(sub.join("\n"));
            }
            const locale = plugins.get("i18n").get(settings.lang)[command.name];
            if (locale?.USAGE_1) {
                data.push(t("\n> {{USAGES}}"));
                const usages = Object.keys(locale).filter(x => x.startsWith("USAGE_"));
                for (const item of usages)
                    data.push(`\t\`${settings.prefix + locale[item]}\` - \`${locale["EXPLANATION_" + item.split("_")[1]]}\``);
            }
            responder.format("emoji").send(data.join("\n"));
        }
    }
};