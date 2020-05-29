const { ReactionCollector } = require('../');
/**
 * Utils class
 */
module.exports = class Utils {
	/**
     * Creates reaction menu
     * @param {Object} message Message object
     * @param {Array<Object|String>} pages Array of pages
     * @param {Object} [options] Menu options 
     * @param {Boolean} [options.agree] Add agree reaction to menu, if it pressed - returns page and index of page
     * @param {Function} [options.mapFunc] Map (change display view) array of pages
     * @param {Boolean} [options.fast] Add fast arrows reactions
     */
	static reactionMenu(message, pages = [], options = {}) {
        const {agree = false, mapFunc = (x) => x, fast = false} = options;
        const getMessage = (content) => {
            const obj = { content: '', embed: {} };
            switch (typeof content) {
            case 'string':
                return { content };
            case 'object':
                if (content.title || content.type ||
                    content.description || content.url ||
                    content.timestamp || content.color ||
                    content.footer || content.image ||
                    content.thumbnail || content.video ||
                    content.provider || content.author ||
                    content.fields) obj.embed = content;
                if (content.content) obj.content = content.content;
                if (content.embed) obj.embed = content.embed;
                return obj;
            }
        };
		return new Promise(async (resolve) => { // eslint-disable-line
			const contents = pages.map(mapFunc);
            const msg = await message._client.createMessage(message.channel.id, getMessage(contents[0]));
            let page = 0;
            if (message.channel.guild && !message.channel.permissionsOf(message._client.user.id).has('addReactions')) return resolve([pages[0], 0]);
            if (contents.length <= 1) return resolve([pages[0], 0]);
            if (fast) await msg.addReaction('⏮');
            await msg.addReaction('◀');
            if (agree) await msg.addReaction('✅');
            await msg.addReaction('▶');
            if (fast) await msg.addReaction('⏭');
            await msg.addReaction('⏹');
            const collector = new ReactionCollector(msg, (_, emoji, userID) => ['◀', '▶', '⏹'].concat(agree ? '✅' : [], fast ? ['⏮', '⏭'] : []).includes(emoji.name) && userID == message.author.id);
            const edit = () => msg.edit(getMessage(contents[page]));
            collector.on('collect', (_, emoji) => {
                if (emoji.name == '◀') {
                    if (page == 0) return;
                    page--;
                    edit();
                }
                if (emoji.name == '▶') {
                    if (page == contents.length - 1) return;
                    page++;
                    edit();
                }
                if (agree && emoji.name == '✅') {
                    collector.stop();
                    return resolve([pages[page], page]);
                }
                if (emoji.name == '⏹') {
                    collector.stop();
                    return resolve([]);
                }
                if (fast && emoji.name == '⏮') {
                    page = 0;
                    edit();
                }
                if (fast && emoji.name == '⏭') {
                    page = pages.length - 1;
                    edit();
                }
            });
            collector.on('remove', (_, emoji) => {
                if (emoji.name == '◀') {
                    if (page == 0) return;
                    page--;
                    edit();
                }
                if (emoji.name == '▶') {
                    if (page == contents.length - 1) return;
                    page++;
                    edit();
                }
                if (fast && emoji.name == '⏮') {
                    page = 0;
                    edit();
                }
                if (fast && emoji.name == '⏭') {
                    page = pages.length - 1;
                    edit();
                }
            });
            collector.on('end', () => {
                msg.removeReactions().catch(() => {});
            });
        });
    }
	static get colors() {
		return {
			"&0": 0x000000,
			"&1": 0x0000AA,
			"&2": 0x00AA00,
			"&3": 0x00AAAA,
			"&4": 0xAA0000,
			"&5": 0xAA00AA,
			"&6": 0xFFAA00,
			"&7": 0xAAAAAA,
			"&8": 0x555555,
			"&a": 0x55FF55,
			"&b": 0x55FFFF,
			"&c": 0xFF5555,
			"&d": 0xFF55FF,
			"&e": 0xFFFF55,
			"&f": 0xFFFFFF
		};
	}
	static declOfNum (number, titles) {
		const n = Math.abs(number) % 100;
		const n1 = n % 10;
		if (n > 10 && n < 20) { return titles[2]; }
		if (n1 > 1 && n1 < 5) { return titles[1]; }
		if (n1 == 1) { return titles[0]; }
		return titles[2];
	}
	static timeObj (milliseconds) {
		let days, hours, minutes, seconds;
		seconds = Math.floor(milliseconds / 1000);
		minutes = Math.floor(seconds / 60);
		seconds = seconds % 60;
		hours = Math.floor(minutes / 60);
		minutes = minutes % 60;
		days = Math.floor(hours / 24);
		hours = hours % 24;
		return {
			days,
			hours,
			minutes,
			seconds
		};
    }
    static applyDescription (array, { mapFunc = (x) => x, separator = ', ' }) {
        do {
            array.pop();
        } while (array.map(mapFunc).join(separator) > 2048)
        return array;
    }
};
Number.prototype.isFloat = function() {
	return this % 1 === 0;
};
Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
};
String.prototype.trunc = String.prototype.trunc ||
function(n) {
	return (this.length > n) ? this.substr(0, n - 1) + "..." : this;
};
String.prototype.capitalize = function() {
	return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};