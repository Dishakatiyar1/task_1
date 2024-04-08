const express = require("express");
const {unserialize, serialize} = require("php-serialize"); // Import php-serialize library
const axios = require("axios");
const csv = require("csv-parser");
const fs = require("fs");
const {createProxyMiddleware} = require("http-proxy-middleware");

const app = express();
const port = 5000;

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5000",
      changeOrigin: true,
    })
  );
};

// Example route to handle serialized data
app.get("/api/data", (req, res) => {
  try {
    // Read data from the CSV file
    const results = [];
    fs.createReadStream("./inputData.csv")
      .pipe(csv())
      .on("data", data => results.push(data))
      .on("end", () => {
        console.log("Parsed Data:", results);
        // Convert data to PHP serialized format
        const serializedData = serialize(results);

        // Parse serialized data
        const parsedData = unserialize(serializedData);
        res.json(parsedData);
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
