const fs = require("fs");
const fsPromises = fs.promises;

const path = require("path");

// const mockData = require("./mockData.json");
// const mockCsvFile = require("./csvData.csv");

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

const getTwoDigitsDateValue = (dateFn) => {
  const result = dateFn.toString();
  let rValue;
  if (result.length === 1) {
    rValue = `0${result}`;
  } else {
    rValue = result;
  }
  return rValue;
};

const getFormattedDate = (currDate) => {
  const year = getTwoDigitsDateValue(currDate.getFullYear());
  const month = getTwoDigitsDateValue(Number(currDate.getMonth()) + 1);
  const date = getTwoDigitsDateValue(currDate.getDate());
  const hours = getTwoDigitsDateValue(currDate.getHours());
  const minutes = getTwoDigitsDateValue(currDate.getMinutes());
  const seconds = getTwoDigitsDateValue(currDate.getSeconds());

  const formatted = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
  return formatted;
};
// const mockDataFilePath = path.join(__dirname, "mockData.json");
const mockCsvFilePath = path.join(__dirname, "csvData.csv");

async function generateMockData() {
  const DATA_LIMIT = 1000000;
  //   const DATA_LIMIT = 5;
  let mockCSV = '"x","y"\n';

  let ms = 0;
  const divider = 5;
  for (let j = 0; j < divider; j++) {
    for (let i = 0; i < DATA_LIMIT / divider; i += 1) {
      const currDate = new Date(ms);
      // 2013-10-04 22:23:00
      const generatedDate = getFormattedDate(currDate);
      const randomValue = getRandomInt(10000, 100000);

      // mockJSON.push({
      //   x: generatedDate,
      //   y: randomValue,
      // });
      mockCSV += `${generatedDate},${randomValue}\n`;
      ms += 10000000;
    }
  }
  //   console.log(mockJSON);
  // await fsPromises.writeFile(mockDataFilePath, JSON.stringify(mockJSON));
  await fsPromises.writeFile(mockCsvFilePath, mockCSV);
}

generateMockData();
// readMockData();
const CsvParser = require("csv-parse");
const { parse } = CsvParser;
async function parseCsv(csvFilePath) {
  try {
    const records = [];
    // Initialize the parser
    console.log("parsing initialized");
    const parser = parse();
    // Use the readable stream api to consume records
    parser.on("readable", function () {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });
    // Catch any error
    parser.on("error", function (err) {
      console.error(err.message);
    });
    parser.on("end", function () {
      console.log("parsing done");
    });
    const csvFile = await fsPromises.readFile(csvFilePath);
    parser.write(csvFile);
    parser.end();
    return records;
  } catch (err) {
    console.error(err);
  }
}

// parseCsv(mockCsvFilePath);

async function readMockData() {
  //   for (let i = 0; i < 10; i += 1) {
  //     console.log(mockData[i]);
  //   }
  //   console.log(mockData[5000000]);
  // console.log(Array.isArray(mockData));
  // await fsPromises.readFile(mockDataFilePath);
}
module.exports = parseCsv;
