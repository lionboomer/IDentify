const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");
const app = express();
const http = require("http");
const os = require("os");
const bodyParser = require("body-parser");
const axios = require('axios');

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const privateKey = fs.readFileSync("src/Keys/privateKey.pem", "utf8");
const certificate = fs.readFileSync("src/Keys/certificate.pem", "utf8");

const credentials = { key: privateKey, cert: certificate };
let progress = 0;

// Ändern Sie die MongoDB-Verbindungs-URI
mongoose.connect("mongodb://127.0.0.1:27017/fingerprintDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Erhöhen Sie das Timeout auf 5000ms
});

const FingerprintSchema = new mongoose.Schema({
  fingerprint: String,
  fingerprintHash: { type: String, unique: true },
  name: String,
  username: { type: String, unique: true },
  canvases: [String],
  createdAt: { type: Date, default: Date.now },
});

const Fingerprint = mongoose.model("Fingerprint", FingerprintSchema);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

// API-Endpunkt für Vorhersagen
app.post("/predict", async (req, res) => {
  const { fingerprint } = req.body;

  if (!fingerprint) {
    return res.status(400).send("Missing fingerprint");
  }

  try {
    const response = await axios.post('http://127.0.0.1:5000/predict', { fingerprint });
    const result = response.data.prediction;
    res.json({ prediction: result });
  } catch (error) {
    console.error('Error calling Python API:', error);
    res.status(500).send('Error calling Python API');
  }
});

app.post("/fingerprints", async (req, res) => {
  const { fingerprintHash, fingerprint } = req.body;

  console.log(
    `Received POST request to /fingerprints with fingerprintHash: ${fingerprintHash}, fingerprint: `
  );

  if (!fingerprint) {
    console.log("Missing fingerprint in request body");
    return res.status(400).send("Missing fingerprint");
  }

  let fingerprintRecord = await Fingerprint.findOne({ fingerprintHash });

  if (!fingerprintRecord) {
    console.log("No fingerprint record found, creating a new one");
    fingerprintRecord = new Fingerprint({ fingerprintHash, canvases: [] });
  }

  if (fingerprintRecord.canvases.length < 1900) {
    console.log("Adding new fingerprint to canvases array");
    fingerprintRecord.canvases.push(fingerprint);
    progress = (fingerprintRecord.canvases.length / 1900) * 100;
    console.log(`Progress: ${progress}%`);
  } else {
    console.log("Canvases array is full");
    return res.status(400).send("Canvases array is full");
  }

  console.log("Saving fingerprint record");
  await fingerprintRecord.save();

  console.log("Fingerprint saved successfully");
  res.send("Fingerprint saved successfully");
});

app.get("/progress", async (req, res) => {
  const fingerprintHash = req.query.fingerprintHash;
  if (!fingerprintHash) {
    return res.status(400).json({ error: "FingerprintHash is required" });
  }

  const fingerprint = await Fingerprint.findOne({
    fingerprintHash: fingerprintHash,
  });

  if (fingerprint) {
    const count = fingerprint.canvases.length;
    const progress = count >= 1900 ? 100 : (count / 1900) * 100;
    res.json({ progress });
  } else {
    res.status(404).json({ error: "Fingerprint not found" });
  }
});

app.post("/fingerprint", async (req, res) => {
  const { fingerprint, fingerprintHash } = req.body;

  console.log(`Received fingerprint: ${fingerprint}`);
  console.log(`Received fingerprintHash: ${fingerprintHash}`);

  if (!fingerprint || !fingerprintHash) {
    console.log("Missing fingerprint or fingerprintHash in request body");
    return res.status(400).send("Missing fingerprint or fingerprintHash");
  }

  const existingFingerprint = await Fingerprint.findOne({ fingerprintHash });

  if (existingFingerprint) {
    console.log("Fingerprint already exists in the database");

    // Senden Sie eine Challenge an den Benutzer
    res.json({
      message: "Fingerprint recognized. Please complete the challenge.",
      challenge: true,
      id: existingFingerprint._id,
      name: existingFingerprint.name,
      username: existingFingerprint.username,
    });
  } else {
    console.log("Fingerprint does not exist in the database, creating a new one");

    const count = await Fingerprint.countDocuments();
    let name = `User ${count + 1}`;
    let username = `username_${count + 1}`;

    // Sicherstellen, dass der Benutzername eindeutig ist
    while (await Fingerprint.findOne({ username })) {
      count++;
      name = `User ${count + 1}`;
      username = `username_${count + 1}`;
    }

    const newFingerprint = new Fingerprint({
      fingerprint: JSON.stringify(fingerprint),
      fingerprintHash,
      name,
      username,
    });

    await newFingerprint.save();

    console.log("New fingerprint saved successfully");

    res.json({
      message: "Fingerprint saved successfully",
      id: newFingerprint._id,
      name,
      username,
    });
  }
});

app.post("/verify-challenge", async (req, res) => {
  const { fingerprint, fingerprintHash } = req.body;

  if (!fingerprint || !fingerprintHash) {
    return res.status(400).send("Missing fingerprint or fingerprintHash");
  }

  const existingFingerprint = await Fingerprint.findOne({ fingerprintHash });

  if (!existingFingerprint) {
    return res.status(404).send("Fingerprint not found");
  }

  try {
    const response = await axios.post('http://127.0.0.1:5000/predict', { fingerprint });
    const result = response.data.prediction;

    // Berechne das Ergebnis in Prozent
    const resultPercentage = (result * 100).toFixed(2);

    if (result > 0.5) {
      res.json({ 
        message: "Challenge passed. User verified.", 
        verified: true, 
        result: `${resultPercentage}%` 
      });
    } else {
      res.json({ 
        message: "Challenge failed. User not verified.", 
        verified: false, 
        result: `${resultPercentage}%` 
      });
    }
  } catch (error) {
    console.error('Error calling Python API:', error);
    res.status(500).send('Error calling Python API');
  }
});

app.get("/fingerprintCount/:fingerprinthash", async (req, res) => {
  const fingerprinthash = req.params.fingerprinthash;
  console.log(`Received request for fingerprint count of hash: ${fingerprinthash}`);

  const fingerprint = await Fingerprint.findOne({
    fingerprintHash: fingerprinthash,
  });

  console.log(`Fingerprint for hash ${fingerprinthash}:`);

  if (fingerprint) {
    const createdCanvasCount = fingerprint.canvases.length;
    console.log(`Count of created canvas fingerprints for hash ${fingerprinthash}: ${createdCanvasCount}`);
    res.json({ count: createdCanvasCount });
  } else {
    console.log(`No fingerprint found for hash ${fingerprinthash}`);
    res.status(404).json({ error: "Fingerprint not found" });
  }
});

const interfaces = os.networkInterfaces();
let serverIP = "";
for (let devName in interfaces) {
  let iface = interfaces[devName];

  for (let i = 0; iface && i < iface.length; i++) {
    let alias = iface[i];
    if (
      alias.family === "IPv4" &&
      alias.address !== "127.0.0.1" &&
      !alias.internal
    ) {
      serverIP = alias.address;
    }
  }
}

http.createServer(app).listen(80, () => {
  console.log(`HTTP Server is accessible on http://${serverIP}:80`);
});

https.createServer(credentials, app).listen(443, () => {
  console.log(`HTTPS Server is accessible on https://${serverIP}:443`);
});
