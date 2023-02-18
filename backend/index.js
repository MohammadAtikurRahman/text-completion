require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
const fs = require("fs");
const csv = require("csv-parser");

let dataArray = [];

fs.createReadStream("idiya.csv")
  .pipe(csv())
  .on("data", (data) => {
    dataArray.push(data);
  })
  .on("end", () => {
    processData(dataArray);
  });

const processData = (data) => {
  // console.log(data);
};

app.post("/api/", async (req, res) => {


  const message = req.body.message;

  const properties = [
    { name: "name", property: "name" },

    { name: "sku", property: "sku" },
    { name: "price", property: "price" },
    { name: "brand", property: "brand" },
    { name: "quantity", property: "quantity" },
    { name: "width", property: "width" },
    { name: "height", property: "height" },
    { name: "length", property: "length" },
    { name: "weight", property: "Weight" },
    { name: "description", property: "description" },
  ];

  for (const prop of properties) {
    const matchingData = dataArray.find(
      (d) => message.includes(d.name) && message.includes(prop.name)
    );

    if (matchingData) {
      res.json({
        botResponse: `\n\n${matchingData.name} of ${prop.name}: ${
          matchingData[prop.property]
        }`,
      });
      return;
    }
  }

  const API_KEY = process.env.OPENAI_API_KEY;

  try {
    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/engines/text-davinci-003/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      data: {
        prompt: message,
        max_tokens: 100,
        n: 1,
        stop: "",
        temperature: 0.5,
      },
    });
    res.json({ botResponse: "\n" + response.data.choices[0].text });
  } catch (error) {
    res.status(500).send({ error: "Could not generate text completion" });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
