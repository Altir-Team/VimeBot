module.exports = {
    name: 'verifySettings',
    priority: 2,
    process: (container) => {
        const {msg, client, isPrivate} = container;
        container.settings = { lang: 'ru', prefix: client.prefix, vimeAccount: null };
        if (!isPrivate) {
            try {
                const { prefix } = client.db.prepare('SELECT prefix FROM guilds WHERE id = ?').get(msg.channel.guild.id);
                if (!!prefix) container.settings.prefix = prefix;
            } catch {
                client.db.prepare('INSERT INTO guilds (id) VALUES (?)').run(msg.channel.guild.id);
            }
        }
        const user = client.db.prepare('SELECT vime FROM links WHERE user = ?').get(msg.author.id);
        if (user) container.settings.vimeAccount = user.vime;
        return Promise.resolve(container);
    }
}