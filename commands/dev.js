const { Command } = require("../../");
module.exports = class Online extends Command { 
    constructor (...args) {
        super (...args, {
            name: "dev",
            subcommands: {
                eval: {
                    usage: [{ name: "code", last: true }],
                    flags: [{ name: "async" }]
                },
                reload: {}
            },
            options: { adminOnly: true }
        });
    }
    handle (_, responder) {
        responder.reply("кто");
    }
    async eval (container, responder) {
        const {msg, client, admins, commands, modules, plugins, middleware, settings, args, flags, logger} = container;
        try {
            args.code = args.code.replace(/^```js\n|```$/g, ""); 
            let evaled = await eval(flags.async ? `(async () => {${args.code}})()` : args.code);
            const token_regexp = new RegExp(client.options.token, "g");
            evaled = require("util").inspect(evaled, { depth: 0 });
            const strings = evaled.replace(/`/g, "`" + String.fromCharCode(8203)).match(/(.|[\r\n]){1,1980}/g);
            return await msg.channel.createMessage(strings[0].replace(token_regexp, "[че не открывается? делом займитесь нахуй. а то блять смотрите всякую хуйню блять]"));
        } catch (e) {
            logger.error(e);
            return await responder.format("code:").send(e.stack);
        }
    }
    reload({commands}, responder) {
        commands.reload();
        responder.success("hell yea");
    }
};