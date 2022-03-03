const Errors = require("./errors_list");

function notFound(req, res, next) {
  next(Errors["NOT_FOUND_ERROR"]);
}

function errorHandler(err, req, res, next) {
  if (err.name === "NOT_FOUND_ERROR" || "FORBIDDEN_ERROR") {
    res.status(err.code);
  } else {
    res.status(500);
  }
  console.log("ERROR TEXT\n--------------");
  console.log(err);
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    res.json({
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.end();
  }
}

module.exports = { notFound, errorHandler };
