const express = require("express");
const cors = require("cors");
const { translate } = require("@vitalets/google-translate-api");
const app = express();

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

app.post("/translate", (req, res) => {
  const { text, from, to } = req.body;

  if (!text || !from || !to) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Perform the translation
  translate(text, { from, to })
    .then((response) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Max-Age", "1800");
      res.setHeader("Access-Control-Allow-Headers", "content-type");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "PUT, POST, GET, DELETE, PATCH, OPTIONS"
      );
      // Send the translated text as response
      res.status(200).json({ translatedText: response.text });
    })
    .catch((err) => {
      console.error("Error during translation:", err);
      res.status(500).json({ error: "Translation failed" });
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
