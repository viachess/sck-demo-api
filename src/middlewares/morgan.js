const morgan = require("morgan");

let mode = process.env.NODE_ENV === "development" ? "dev" : "combined";

module.exports = morgan(mode);
