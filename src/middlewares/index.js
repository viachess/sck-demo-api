const express = require("express");
const morgan = require("./morgan.js");
const cors = require("./cors.js");
const { notFound, errorHandler } = require("./error_handlers");

var compression = require("compression");

module.exports = (app) => {
  app.use(express.urlencoded({ extended: true, parameterLimit: 500 }));
  app.use(express.json());
  app.use(compression());
  app.use(cors);
  app.use(morgan);
  app.use(notFound);
  app.use(errorHandler);
};
