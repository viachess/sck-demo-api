const cors = require("cors");
const Errors = require("./errors_list.js");

let corsOptionsDelegate = function (req, callback) {
  const origins = process.env.CORS_ORIGIN;
  const originList = origins.split(",");
  let corsOptions;
 
  if (
    originList.indexOf(req.header("Origin")) !== -1 ||
    originList.indexOf(req.hostname) !== -1
  ) {
    corsOptions = {
      origin: true,
      credentials: true,
      optionsSuccessStatus: 200,
    }; // reflect (enable) the requested origin in the CORS response
    callback(null, corsOptions);
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
    callback(Errors["FORBIDDEN_ERROR"], corsOptions); // callback expects two parameters: error and options
  }
};

module.exports = cors(corsOptionsDelegate);

