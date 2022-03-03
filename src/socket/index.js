const WebSocket = require("ws");

const mockData = require("../../mockData.json");

const sendMessage = async (ws, obj) => {
  const { data } = obj;
  if (data.length <= 5000) {
    await ws.send(
      JSON.stringify({
        data,
        isFinalChunk: true,
      })
    );
  } else {
    // const chunkSize = data.length * 0.1;
    let currentStep = 1;
    const totalSteps = data.length / 10000;
    let startIdx = 0;
    let endIdx = (currentStep) =>
      Math.floor(data.length * ((1 / totalSteps) * currentStep));

    const chunks = [];
    for (let i = 0; i < totalSteps; i++) {
      const CURRENT_END_INDEX = endIdx(currentStep);
      chunks.push(data.slice(startIdx, endIdx(currentStep)));
      //   console.log(
      //     `for loop iteration: ${i}, startIdx: ${startIdx}, endIdx: ${CURRENT_END_INDEX}, current step: ${currentStep}`
      //   );
      startIdx = CURRENT_END_INDEX;
      currentStep++;
    }
    // console.log(`chunks result array`, JSON.stringify(chunks));
    for await (const chunk of chunks) {
      let isFinalChunk = currentStep === totalSteps;
      await ws.send(
        JSON.stringify({
          data: chunk,
          isFinalChunk,
        })
      );
    }
  }
};

let currentModeName = null;
let currentChunkSize = null;
let lastIndex = 0;

module.exports = async (expressServer) => {
  const webSocketServer = new WebSocket.Server({
    noServer: true,
    path: "/chart-socket",
  });
  expressServer.on("upgrade", (request, socket, head) => {
    webSocketServer.handleUpgrade(request, socket, head, (socket) => {
      webSocketServer.emit("connection", socket, request);
    });
  });

  webSocketServer.on("connection", (ws) => {
    const datasetLength = mockData.length;
    console.log("connection established");
    ws.on("message", async (message) => {
      const mode = JSON.parse(message);
      const { name, chunkSize, initialChunkSize } = mode;
      //   console.log("new mode");
      //   console.log(mode);
      // different mode => drop current state and send fresh data
      if (name !== currentModeName) {
        // console.log(
        //   `MODE CHANGE DETECTED, NEW MODE: ${name}, OLD MODE: ${currentModeName}`
        // );
        currentModeName = name;
        currentChunkSize = initialChunkSize;
        lastIndex = initialChunkSize;
        // console.log(
        //   `INITIAL CHUNK SIZE RECEIVED: ${initialChunkSize}, CURRENT CHUNK SIZE POST EDIT: ${currentChunkSize}`
        // );

        await sendMessage(ws, {
          data: mockData.slice(1, currentChunkSize + 1),
        });
      } else if (name === currentModeName) {
        // console.log(`SAME MODE DETECTED: ${name}`);
        if (chunkSize !== currentChunkSize) {
          //   console.log(
          //     `CHUNK SIZE CHANGED. OLD: ${currentChunkSize} NEW: ${chunkSize}`
          //   );
          currentChunkSize = chunkSize;
        }
        const preUpdLastIdx = lastIndex;
        lastIndex += chunkSize;
        if (lastIndex > datasetLength) {
          lastIndex = chunkSize;
          await sendMessage(ws, {
            data: mockData.slice(0, lastIndex),
          });
        } else {
          await sendMessage(ws, {
            data: mockData.slice(preUpdLastIdx, lastIndex),
          });
        }
      }
    });
    ws.on("error", (e) => {
      console.error(e);
    });
  });
};
