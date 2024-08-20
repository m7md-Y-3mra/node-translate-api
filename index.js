// const express = require("express");
// const cors = require("cors");
// const { translate } = require("@vitalets/google-translate-api");
// const { HttpProxyAgent } = require("http-proxy-agent");
// const app = express();

// // Enable CORS for all routes
// app.use(
//   cors({
//     origin: "*",
//   })
// );

// app.use(express.json());

// // Configure proxy agent
// const agent = new HttpProxyAgent("http://181.41.194.186:80");

// app.post("/translate", (req, res) => {
//   const { text, from, to } = req.body;

//   if (!text || !from || !to) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   // Perform the translation using the proxy agent
//   translate(text, { from, to, fetchOptions: { agent } })
//     .then((response) => {
//       // Send the translated text as response
//       res.status(200).json({ translatedText: response.text });
//     })
//     .catch((err) => {
//       console.error("Error during translation:", err);
//       res.status(500).json({ error: "Translation failed" });
//     });
// });

// const PORT = process.env.PORT || 10000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const { translate } = require("@vitalets/google-translate-api");
const { HttpProxyAgent } = require("http-proxy-agent");
const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// Configure proxy agent
const agent = new HttpProxyAgent("http://181.41.194.186:80");

// Function to perform translation with retry logic
const retryTranslation = (text, from, to, retries = 3) => {
  return translate(text, { from, to, fetchOptions: { agent } })
    .then((response) => {
      return response.text;
    })
    .catch((err) => {
      if (retries > 0) {
        console.log(`Retrying translation... Attempts left: ${retries}`);
        return retryTranslation(text, from, to, retries - 1);
      } else {
        throw err;
      }
    });
};

app.post("/translate", (req, res) => {
  const { text, from, to } = req.body;

  if (!text || !from || !to) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Call the retry function to perform translation
  retryTranslation(text, from, to)
    .then((translatedText) => {
      res.status(200).json({ translatedText });
    })
    .catch((err) => {
      console.error("Error during translation:", err);
      res
        .status(500)
        .json({ error: "Translation failed after multiple attempts" });
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
