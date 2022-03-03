const express = require("express");
// const chartRoute = require("./routes/chart");
const websocket = require("./socket");
const app = express();

const middlewareSetup = require("./middlewares");

middlewareSetup(app);

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}\n`);
});

websocket(server);

process.on("message", (message) => {
  console.log(message);
});
