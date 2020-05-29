module.exports = {
    name: 'verifySettings',
    priority: 2,
    process: (container) => {
        const {msg, client, isPrivate} = container;
        container.settings = { lang: 'ru', prefix: client.prefix };
        if (!isPrivate) {
            try {
                const { prefix } = client.db.prepare('SELECT prefix FROM guilds WHERE id = ?').get(msg.channel.guild.id);
                if (!!prefix) container.settings.prefix = prefix;
            } catch {
                client.db.prepare('INSERT INTO guilds (id) VALUES (?)').run(msg.channel.guild.id);
            }
        }
        return Promise.resolve(container);
    }
}