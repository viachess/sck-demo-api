const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

const WebSocket = require("ws");
const wss = new WebSocket.Server({ server });

const mockData = require("../mockData.json");

const chartRoute = require("./routes/chart");

const parseMessage = (msg) => {
  return JSON.parse(msg);
};

const sendMessage = (ws, obj) => {
  ws.send(JSON.stringify(obj));
};

let currentModeName = null;
let chunkSize = null;
let lastIndex = 0;
const datasetLength = mockData.length;

wss.on("connection", (ws) => {
  console.log("connection established");
  ws.on("message", (message) => {
    const msg = parseMessage(message);
    // different mode => drop current state and send fresh data
    if (msg.modeName !== currentModeName) {
      currentModeName = msg.modeName;
      chunkSize = msg.initialChunkSize;
      lastIndex = msg.initialChunkSize;
      sendMessage(ws, {
        data: mockData.slice(0, chunkSize + 1),
      });
    } else if (msg.modeName === currentModeName) {
      if (msg.chunkSize === chunkSize) {
        const preUpdLastIdx = lastIndex;
        lastIndex += chunkSize;
        if (lastIndex > datasetLength) {
          lastIndex = chunkSize;
          sendMessage(ws, {
            data: mockData.slice(0, lastIndex + 1),
          });
        } else {
          sendMessage(ws, {
            data: mockData.slice(preUpdLastIdx, lastIndex + 1),
          });
        }
      } else if (msg.chunkSize !== chunkSize) {
        chunkSize = msg.chunkSize;
        lastIndex = chunkSize;
        sendMessage(ws, {
          data: mockData.slice(0, lastIndex + 1),
        });
      }
    }

    // ws.send(
    //   JSON.stringify({
    //     mode: "mess",
    //   })
    // );
  });
  ws.on("error", (e) => {
    console.error(e);
  });
});

// --
app.use(express.urlencoded({ extended: true, parameterLimit: 500 }));
app.use(express.json());
const morgan = require("./middlewares/morgan.js");
const cors = require("./middlewares/cors.js");
app.use(cors);
app.use(morgan);

app.use("/chart", chartRoute);

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
