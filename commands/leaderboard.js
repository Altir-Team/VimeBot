const { Command } = require('../../');
module.exports = class Leaderboard extends Command {
    constructor(...args) {
        super(...args, {
            name: 'leaderboard',
            description: 'Таблицы рекордов на VimeWorld MiniGames',
            group: '{{%CATEGORIES.STATISTIC}}',
            options: { adminOnly: true }
        });
    }
    async handle ({ plugins }, responder) {
        const [leaderboardObject] = await responder.selection(plugins.get('vimeworld').leaderboards, { mapFunc: x => x.description, title: 'Выберите таблицу рекордов' });
        const [sortType] = await responder.selection(['Пропустить', ...leaderboardObject.sort], { title: 'Выберите тип сортировки таблицы' });
        console.log(sortType, leaderboardObject)
        const board = await plugins.get('vimeworld').getLeaderboard(leaderboardObject.type, sortType == 'Пропустить' ? null : sortType);
        console.log(board.leaderboard)
    }
}