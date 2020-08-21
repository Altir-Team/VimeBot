module.exports = {
    name: "isPrivate",
    priority: 1,
    process: (container) => {
        container.isPrivate = !container.msg.channel.guild;
        return Promise.resolve(container);
    }
};