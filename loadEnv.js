const fs = require("fs");
const path = require("path");

module.exports = (filepath = path.join(process.cwd(), ".env")) => {
    if (!filepath) throw new Error("filepath is not providen");
    if (!fs.existsSync(filepath)) throw new Error(".env file is not found");
    for (const line of fs.readFileSync(filepath, "utf8").split(/\n|\r|\r\n/)) {
        const variable = line.split("=")[0];
        const value = line.slice(variable.length + 1);
        process.env[variable] = value;
    }
}