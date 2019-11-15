/**
 * Utils class
 */
module.exports = class Utils {
	/**
     * Creates reaction menu
     * @param {Object} message Discord.js message object
     * @param {Array} pages Array of pages
     * @param {Object} [options] Menu options 
     * @param {Boolean} [options.agree] Add agree reaction to menu, if it pressed - returns page and index of page
     * @param {Function} [options.mapFunc] Map (change display view) array of pages
     * @param {Boolean} [options.fast] Add fast arrows reactions
     */
	static reactionMenu(message, pages = [], options = {}) {
		const { agree = false, mapFunc = x => x, fast = false } = options;
		return new Promise(async (resolve) => { // eslint-disable-line
			let contents = pages.map(mapFunc),
				msg = await message.channel.send(contents[0]),
				page = 0;
			if(contents.length <= 1) return resolve([pages[0], 0]);
			if(fast) await msg.react("⏮");
			await msg.react("◀");
			if(agree) await msg.react("✅");
			await msg.react("▶");
			if(fast) await msg.react("⏭");
			await msg.react("⏹");
			let collector = msg.createReactionCollector((rec, user) => ["◀", "▶", "⏹"].concat(agree ? "✅" : [], fast ? ["⏮", "⏭"] : []) && user.id == message.author.id);
			collector.on("collect", (some) => {
				some._emoji.reaction.users.filter(x => x.id !== msg.author.id).map(x => some._emoji.reaction.remove(x).catch(() => {}));
				if(some._emoji.name == "◀"){
					if(page == 0) return;
					page--;
					msg.edit(contents[page]);
				}
				if(some._emoji.name == "▶"){
					if(page == contents.length - 1) return;
					page++;
					msg.edit(contents[page]);
				}
				if(agree && some._emoji.name == "✅") {
					collector.stop();
					return resolve([pages[page], page]);
				}
				if(some._emoji.name == "⏹") {
					collector.stop();
					return resolve([]);
				}
				if(fast && some._emoji.name == "⏮") {
					page = 0;
					msg.edit(contents[page]);
				}
				if(fast && some._emoji.name == "⏭") {
					page = pages.length - 1;
					msg.edit(contents[page]);
				}
			});
			collector.on("end", () => {
				collector.removeListener("collect", () => {});
				collector.removeListener("end", () => {});
				msg.clearReactions().catch(() => {});
			});
		});
	}
	static get colors() {
		return {
			"&0": "000000",
			"&1": "0000AA",
			"&2": "00AA00",
			"&3": "00AAAA",
			"&4": "AA0000",
			"&5": "AA00AA",
			"&6": "FFAA00",
			"&7": "AAAAAA",
			"&8": "555555",
			"&a": "55FF55",
			"&b": "55FFFF",
			"&c": "FF5555",
			"&d": "FF55FF",
			"&e": "FFFF55",
			"&f": "FFFFFF"
		};
	}
};
Number.prototype.isFloat = function() {
	return this % 1 === 0;
};
Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
};
Array.prototype.batch = function(size) {
	if(!size || size == 0 ||isNaN(Number(size))) size = 5;
	let result = Array(Math.ceil(this.length / size));
	for (let i = 0; i < result.length; i++) {
		const begin = i*size;
		result[i] = this.slice(begin, begin + size);
	}
	return result;
};
String.prototype.trunc = String.prototype.trunc ||
function(n) {
	return (this.length > n) ? this.substr(0, n - 1) + "..." : this;
};
String.prototype.capitalize = function() {
	return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};