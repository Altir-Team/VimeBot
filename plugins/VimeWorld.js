const { get } = require("https");
module.exports = class VimeWorld {
    constructor (_, token) {
        this._token = token;
        this.baseURL = "api.vimeworld.ru";
        this.achievements = null;
        this.games = null;
        this.leaderboards = null;
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
        };
    }

    /**
     * Регистрация плагина
     * @returns {Promise<VimeWorld>}
     */
    async register () {
        this.achievements = await this.getAchievements();
        this.games = await this.getGames();
        this.leaderboards = await this.getLeaderboardList();
        return this;
    }

    _request (path) {
        return new Promise((resolve, reject) => {
            const options = { host: this.baseURL, path: "/" + path };
            if (this._token) options.headers = { "Access-Token": this._token };
            get(options, (res) => {
                let chunks = "";
                res.on("data", (chunk) => chunks += chunk);
                res.on("end", () => {
                    try {
                        const obj = JSON.parse(chunks);
                        if (obj.error) return reject(new Error(obj.error.error_msg));
                        return resolve(obj);
                    } catch {
                        return reject(new Error("Failed to parse response"));
                    }
                });
            }).on("error", reject);
        });
    }
    /**
     * Получение объекта игрока
     * @param {Array<String|Number>|String|Number} identifiers Идентификаторы пользователей (ник, id)
     * @returns {Promise<Array<Object>>}
     */
    async getUser (identifiers) {
        let opts = [];
        let path = ":opt";
        if (Array.isArray(identifiers)) {
            opts = identifiers;
            if (typeof identifiers[0] === "number") path = "user/:opt";
            else path = "user/name/:opt";
        } else {
            opts.push(identifiers);
            if (typeof identifiers === "number") path = "user/:opt";
            else path = "user/name/:opt";
        }
        opts.length = 50;
        opts = opts.filter(x => !!x);
        return this._request(path.replace(":opt", opts.map(x => encodeURIComponent(typeof x === "string" ? x.split(",")[0] : x)).join(",")));
    }
    /**
     * Получение статистики игрока
     * @param {Number} ID ID игрока
     * @returns {Promise<Object>}
     */
    async getUserStats (ID) {
        if (typeof ID !== "number") throw new Error("ID must be a number");
        return this._request(`user/${ID}/stats`);
    }
    /**
     * Получение достижений игрока
     * @param {Number} ID ID игрока
     * @returns {Promise<Object>}
     */
    async getUserAchievements (ID) {
        if (typeof ID !== "number") throw new Error("ID must be a number");
        return this._request(`user/${ID}/achievements`);
    }
    /**
     * Получение мест игрока в топах
     * @param {Number} ID ID игрока
     * @returns {Promise<Object>}
     */
    async getUserLeaderboards (ID) {
        if (typeof ID !== "number") throw new Error("ID must be a number");
        return this._request(`user/${ID}/leaderboards`);
    }
    /**
     * Поиск гильдий по названию или тегу
     * @param {String} query Запрос для поиска
     * @returns {Promise<Array<Object>>}
     */
    async searchGuild (query) {
        if (typeof query !== "string") throw new Error("query must be a string");
        if (query.length < 2) throw new Error("query length must be 2 or more");
        return this._request("guild/search?query=" + encodeURIComponent(query));
    }
    /**
     * Получение полного объекта гильдии
     * @param {String|Number} query Запрос для поиска
     * @param {String} [type] Тип поиска
     * @returns {Promise<Object>}
     */
    async fetchGuild (query, type = "id") {
        switch (type) {
        case "id":
            if (typeof query !== "number") throw new Error("query with id search must be a number");
            return this._request("guild/get?id=" + query);
        case "name":
        case "tag":
            if (typeof query !== "string") throw new Error(`query with ${type === "name" ? "name" : "tag"} search must be a string`);
            return this._request(`guild/get?${type === "name" ? "name" : "tag"}=${encodeURIComponent(query)}`);
        default:
            throw new Error("Unknown search type");
        }
    }
    /**
     * Получение онлайна игроков/стримов/модерации
     * @param {String} [type] Тип онлайна 
     * @returns {Promise<Array<Object>|Object>}
     */
    async getOnline(type = "players") {
        let path;
        switch (type) {
        case "players":
            path = "online";
            break;
        case "streams":
            path = "online/streams";
            break;
        case "staff":
            path = "online/staff";
            break;
        default:
            throw new Error("Unknown online type");
        }
        return this._request(path);
    }
    /**
     * Получение списка игр, по которым ведется статистика
     * @returns {Promise<Array<Object>>}
     */
    async getGames () {
        return this._request("misc/games");
    }
    /**
     * Получение списка достижений
     * @returns {Promise<Object>}
     */
    async getAchievements () {
        return this._request("misc/achievements");
    }
    /**
     * Получение списка типов таблиц рекордов
     * @returns {Promise<Array<Object>>}
     */
    async getLeaderboardList () {
        return this._request("leaderboard/list");
    }
    /**
    * Получение официальной локализации
    * @param {String} [lang] Язык локализации
    * @param {Array<String>} [parts] Части локализации
    * @returns {Promise<Object>}
    */
    async getLocales (lang = "ru", parts = []) {
        if (typeof parts === "string") parts = parts.split(",");
        if (!Array.isArray(parts)) throw new Error("Parts must be string or array");
        return this._request("locale/" + lang + (parts.length ? `?parts=${parts.join(",")}` : ""));
    }
    /**
     * Получения таблицы рекордов
     * @param {String} type Тип таблицы рекордов
     * @param {Object} [options] Опции запроса
     * @param {String} [options.sort] Вариант таблицы
     * @param {Number} [options.size] Лимит рекордов
     * @param {Number} [options.offset] Отступ рекордов от начала
     */
    async getLeaderboard (type, options = {}) {
        const { sort = null, size = 100, offset = 0 } = options;
        if (typeof type !== "string") throw new Error("Invalid leaderboard type");
        const params = new URLSearchParams();
        if (size < 0 || size > 1000) throw new Error("Invalid size");
        if (size) params.set("size", size);
        if (offset) params.set("offset", offset);
        return this._request(`leaderboard/get/${type}${(sort ? "/" + sort : "") + (params.toString().length ? "?" + params.toString() : "")}`);
    }
};