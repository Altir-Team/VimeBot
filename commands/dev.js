const { Command } = require("../../");
module.exports = class Online extends Command{ 
	constructor (...args) {
		super (...args, {
			name: "dev",
			group: "Админ",
			subcommands: {
				eval: {
					usage: [{ name: "code", last: true }]
				}
			}
		});
	}
	handle (_, responder) {
		responder.reply("кто");
	}
	async eval (container, responder) {
		let { msg, client, admins, commands, modules, plugins, middleware, settings, args } = container; // eslint-disable-line
		try{
			let evaled = await eval(args.code),
				token_regexp = new RegExp(client.options.token, "g");
			evaled = require("util").inspect(evaled);
			return responder.send(evaled.replace(token_regexp, "[чел тв]").slice(0, 2000));
		}catch(e){
			console.log(e);
			return responder.format("code:js").send(e.stack);
		}
	}
};