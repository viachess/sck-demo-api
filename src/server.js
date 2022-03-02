const express = require("express");
const chartRoute = require("./routes/chart");

const app = express();
app.use(express.urlencoded({ extended: true, parameterLimit: 500 }));
app.use(express.json());
const morgan = require("./middlewares/morgan.js");
const cors = require("./middlewares/cors.js");
app.use(cors);
app.use(morgan);

app.use("/chart", chartRoute);

const http = require("http");
const server = http.createServer(app);

const WebSocket = require("ws");
const wss = new WebSocket.Server({ server });
const mockData = require("../mockData.json");

const parseMessage = (msg) => {
  return JSON.parse(msg);
};

const sendMessage = (ws, obj) => {
  ws.send(JSON.stringify(obj));
};

let currentModeName = null;
let currentChunkSize = null;
let lastIndex = 0;

wss.on("connection", (ws) => {
  const datasetLength = mockData.length;
  console.log("connection established");
  ws.on("message", (message) => {
    const mode = parseMessage(message);
    const { name, chunkSize, initialChunkSize } = mode;
    console.log("new mode");
    console.log(mode);
    // different mode => drop current state and send fresh data
    if (name !== currentModeName) {
      console.log(
        `MODE CHANGE DETECTED, NEW MODE: ${name}, OLD MODE: ${currentModeName}`
      );
      currentModeName = name;
      currentChunkSize = initialChunkSize;
      lastIndex = initialChunkSize;
      console.log(
        `INITIAL CHUNK SIZE RECEIVED: ${initialChunkSize}, CURRENT CHUNK SIZE POST EDIT: ${currentChunkSize}`
      );
      sendMessage(ws, {
        data: mockData.slice(1, currentChunkSize + 1),
      });
    } else if (name === currentModeName) {
      console.log(`SAME MODE DETECTED: ${name}`);
      if (chunkSize !== currentChunkSize) {
        console.log(
          `CHUNK SIZE CHANGED. OLD: ${currentChunkSize} NEW: ${chunkSize}`
        );
        currentChunkSize = chunkSize;
      }
      const preUpdLastIdx = lastIndex;
      lastIndex += chunkSize;
      if (lastIndex > datasetLength) {
        lastIndex = chunkSize;
        sendMessage(ws, {
          data: mockData.slice(0, lastIndex),
        });
      } else {
        sendMessage(ws, {
          data: mockData.slice(preUpdLastIdx, lastIndex),
        });
      }
    }
  });
  ws.on("error", (e) => {
    console.error(e);
  });
});

// --

// app.get("/", (req, res) => {
//   res.status(418).json({ message: `Greetings, citizen of ${req.hostname}` });
// });

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server runs on port ${PORT}`);
});
// server.on("upgrade", (request, socket, head) => {
//   wss.handleUpgrade(request, socket, head, (socket) => {
//     wss.emit("connection", socket, request);
//   });
// });
