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
// -----------------------------------------------------------------------------------
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

// // Function to perform translation with retry logic
// const retryTranslation = (text, from, to, retries = 20) => {
//   return translate(text, { from, to, fetchOptions: { agent } })
//     .then((response) => {
//       return response.text;
//     })
//     .catch((err) => {
//       if (retries > 0) {
//         console.log(`Retrying translation... Attempts left: ${retries}`);
//         return retryTranslation(text, from, to, retries - 1);
//       } else {
//         throw err;
//       }
//     });
// };

// app.post("/translate", (req, res) => {
//   const { text, from, to } = req.body;

//   if (!text || !from || !to) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   // Call the retry function to perform translation
//   retryTranslation(text, from, to)
//     .then((translatedText) => {
//       res.status(200).json({ translatedText });
//     })
//     .catch((err) => {
//       console.error("Error during translation:", err);
//       res
//         .status(500)
//         .json({ error: "Translation failed after multiple attempts" });
//     });
// });

// const PORT = process.env.PORT || 10000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
//---------------------------------------------------------------
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

// List of proxy servers
const proxyList = [
  "http://181.41.194.186:80",
  "http://135.148.100.78:48149",
  "http://162.214.165.203:80",
];

// Function to perform translation with retry logic and multiple proxies
const retryTranslation = async (
  text,
  from,
  to,
  retries = 3,
  proxyIndex = 0
) => {
  if (proxyIndex >= proxyList.length) {
    // All proxies exhausted, fallback to direct request
    console.log("All proxies failed, trying direct request without proxy...");
    return translate(text, { from, to })
      .then((response) => response.text)
      .catch((err) => {
        throw new Error("All proxies failed and direct request also failed");
      });
  }

  const agent = new HttpProxyAgent(proxyList[proxyIndex]);

  try {
    const response = await translate(text, {
      from,
      to,
      fetchOptions: { agent },
    });
    return response.text;
  } catch (err) {
    if (retries > 0) {
      console.log(
        `Proxy ${proxyList[proxyIndex]} failed. Retrying... Attempts left: ${retries}`
      );
      return retryTranslation(text, from, to, retries - 1, proxyIndex);
    } else {
      console.log(
        `Proxy ${proxyList[proxyIndex]} failed. Switching to next proxy...`
      );
      return retryTranslation(text, from, to, 3, proxyIndex + 1); // Reset retries when switching proxies
    }
  }
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
