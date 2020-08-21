const https = require("https");
module.exports = class StatPoster {
    constructor(client) {
        this._client = client;
        this.lists = [];
        this.interval = null;
    }
    register(lists) {
        if (!Array.isArray(lists)) throw new Error("`lists` must be an array");
        this.lists = lists;
        this.runUpdates();
        return this;
    }
    runUpdates() {
        if (this.interval !== null) throw new Error("Updates are already started");
        this.interval = setInterval(() => {
            const client = this._client;
            for (const botList of this.lists) {
                const body = {};
                Object.keys(botList.bodyVars).forEach(x => {
                    body[x] = botList.bodyVars[x];
                });
                Promise.all(Object.keys(body).map(c => eval(body[c])))
                    .then(values => {
                        for (const key in body)
                            body[key] = values.shift();
                        const url = new URL(botList.url);
                        this._req({ hostname: url.hostname, pathname: url.pathname, headers: botList.headers }, require("querystring").stringify(body));
                    });
            }
        }, 6e5);
    }
    unregister() {
        if (this.interval !== null) { 
            clearInterval(this.interval);
            this.interval = null;
        }
        this.lists = [];
    }
    _req (opts, data) {
        const options = {
            hostname: opts.hostname,
            port: 443,
            path: opts.pathname,
            method: opts.method || "POST",
            headers: {
                "Content-Length": data.length,
                ...opts.headers
            }
        };

        return new Promise((resolve, reject) => {
            let req = https.request(options, (res) => {
                res.setEncoding("utf8");
                res.on("data", (d) => {
                    try { resolve(JSON.parse(d)); } catch(e) { reject(d); }
                });
            });

            req.on("error", reject);

            if(data) req.write(data);
            req.end();
        });
    }
};