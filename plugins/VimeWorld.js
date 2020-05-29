const { get } = require('https');
module.exports = class VimeWorld {
    constructor (_, token) {
        this._token = token;
        this.baseURL = 'api.vimeworld.ru';
    }
    get rankMap () {
        return {
            PLAYER: {rank: "Игрок", prefix: "", color: null},
            VIP: {rank: "VIP", prefix: "[VIP]", color: 0x00be00},
            PREMIUM: {rank: "Premium", prefix: "[Premium]", color: 0x00dada},
            HOLY: {rank: "Holy", prefix: "[Holy]", color: 0xffba2d},
            IMMORTAL: {rank: "Immortal", prefix: "[Immortal]", color: 0xe800d5},
            BUILDER: {rank: "Билдер", prefix: "[Билдер]", color: 0x009c00},
            MAPLEAD: {rank: "Главный билдер", prefix: "[Гл. билдер]", color: 0x009c00},
            YOUTUBE: {rank: "YouTube", prefix: "[YouTube]", color: 0xfe3f3f},
            DEV: {rank: "Разработчик", prefix: "[Dev]", color: 0x00bebe},
            ORGANIZER: {rank: "Организатор", prefix: "[Организатор]", color: 0x00bebe},
            MODER: {rank: "Модератор", prefix: "[Модер]", color: 0x1b00ff},
            WARDEN: {rank: "Проверенный модератор", prefix: "[Пр. Модер]", color: 0x1b00ff},
            CHIEF: {rank: "Главный модератор", prefix: "[Гл. модер]", color: 0x1b00ff},
            ADMIN: {rank: "Главный админ", prefix: "[Гл. админ]", color: 0x00bebe}
        }
    }
    _request (path) {
        return new Promise((resolve, reject) => {
            const options = { host: this.baseURL, path: '/' + path };
            if (this._token) options.headers = { 'Access-Token': this._token };
            get(options, (res) => {
                let chunks = '';
                res.on('data', (chunk) => chunks += chunk);
                res.on('end', () => {
                    try {
                        const obj = JSON.parse(chunks);
                        if (obj.error) return reject(new Error(obj.error.error_msg));
                        return resolve(obj);
                    } catch {
                        return reject(new Error('Failed to parse response'));
                    }
                });
            }).on('error', reject);
        });
    }
    /**
     * Получение объекта игрока
     * @param {Array<String|Number>|String|Number} identifiers Идентификаторы пользователей (ник, id)
     * @returns {Promise<Array<Object>>}
     */
    async getUser (identifiers) {
        let opts = [];
        let path = ':opt';
        if (Array.isArray(identifiers)) {
            opts = identifiers;
            if (typeof identifiers[0] == 'number') path = 'user/:opt';
            else path = 'user/name/:opt';
        } else {
            opts.push(identifiers);
            if (typeof identifiers == 'number') path = 'user/:opt';
            else path = 'user/name/:opt';
        }
        opts.length = 50;
        opts = opts.filter(x => !!x);
        return await this._request(path.replace(':opt', opts.map(x => encodeURIComponent(x)).join(',')));
    }
    /**
     * Получение статистики игрока
     * @param {Number} ID ID игрока
     * @returns {Promise<Object>}
     */
    async getUserStats (ID) {
        if (typeof ID !== 'number') return Promise.reject('ID must be a number');
        return await this._request(`user/${ID}/stats`);
    }
    /**
     * Получение достижений игрока
     * @param {Number} ID ID игрока
     * @returns {Promise<Object>}
     */
    async getUserAchievements (ID) {
        if (typeof ID !== 'number') return Promise.reject('ID must be a number');
        return await this._request(`user/${ID}/achievements`);
    }
    /**
     * Получение мест игрока в топах
     * @param {Number} ID ID игрока
     * @returns {Promise<Object>}
     */
    async getUserLeaderboards (ID) {
        if (typeof ID !== 'number') return Promise.reject('ID must be a number');
        return await this._request(`user/${ID}/leaderboards`);
    }
    /**
     * Поиск гильдий по названию или тегу
     * @param {String} query Запрос для поиска
     * @returns {Promise<Array<Object>>}
     */
    async searchGuild (query) {
        if (typeof query !== 'string') return Promise.reject('query must be a string');
        if (query.length < 2) return Promise.reject('query length must be 2 or more');
        return await this._request('guild/search?query=' + encodeURIComponent(query));
    }
    /**
     * Получение полного объекта гильдии
     * @param {String|Number} query Запрос для поиска
     * @param {String} [type] Тип поиска
     * @returns {Promise<Object>}
     */
    async fetchGuild (query, type = 'id') {
        switch (type) {
            case 'id':
                if (typeof query !== 'number') return Promise.reject('query with id search must be a number');
                return await this._request('guild/get?id=' + query);
            case 'name':
            case 'tag':
                if (typeof query !== 'string') return Promise.reject(`query with ${type == 'name' ? 'name' : 'tag'} search must be a string`);
                return await this._request(`guild/get?${type == 'name' ? 'name' : 'tag'}=${encodeURIComponent(query)}`);
            default:
                return Promise.reject('Unknown search type');
        }
    }
    /**
     * Получение онлайна игроков/стримов/модерации
     * @param {String} [type] Тип онлайна 
     * @returns {Promise<Array<Object>|Object>}
     */
    async getOnline(type = 'players') {
        let path;
        switch (type) {
            case 'players':
                path = 'online';
                break;
            case 'streams':
                path = 'online/streams';
                break;
            case 'staff':
                path = 'online/staff';
                break;
            default:
                return Promise.reject('Unknown online type');
        }
        return await this._request(path);
    }
    /**
     * Получение списка игр, по которым ведется статистика
     * @returns {Promise<Array<Object>>}
     */
    async getGames () {
        return await this._request('misc/games');
    }
    /**
     * Получение списка достижений
     * @returns {Promise<Object>}
     */
    async getAchievements () {
        return await this._request('misc/achievements');
    }
    /**
     * Получение списка таблиц рекордов
     * @returns {Promise<Array<Object>>}
     */
    async getLeaderboardList () {
        return await this._request('leaderboard/list');
    }
    /**
    * Получение официальной локализации с сервера VimeWorld
    */
    async getLocales (lang = 'ru') {
        return await this._request('locale/' + lang);
    }
};