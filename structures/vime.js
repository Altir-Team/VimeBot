const vimelib = require("vimelib");
const fetch = require("node-fetch");
module.exports = class VimeBot extends vimelib {
	constructor (token) {
		super (token);
	}
	findGuild (query) {
		return new Promise((resolve, reject) => {
			fetch(`http://api.vime.world/guild/search?query=${encodeURIComponent(query)}`, { 
				headers: {
					"Access-Token": this.access_token
				}
			}).then(x => x.json())
				.then(x => {
					if (x.error) { reject(x); }
					resolve(x);
				}).catch(e => reject(e));
		});
	}
};