const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");
const app = express();
const http = require("http");
const os = require("os");
const bodyParser = require("body-parser");
const axios = require("axios");
const { exit } = require("process");
const { exec } = require("child_process");

async function doesModelExist(username) {
  const modelPath = `src/SWAT_auth/models/${username}_fingerprint_model.h5`;
  return fs.existsSync(modelPath);
}

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const privateKey = fs.readFileSync("src/Keys/privateKey.pem", "utf8");
const certificate = fs.readFileSync("src/Keys/certificate.pem", "utf8");
const credentials = { key: privateKey, cert: certificate };

let progress = 0;

// app.js
async function connectDB() {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect("mongodb://127.0.0.1:27017/fingerprintDB", {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("Connected to MongoDB");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
}

connectDB();

// Weitere Anwendungslogik folgt...

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

const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

async function getUsernameByFingerprintHash(fingerprintHash) {
  try {
    const fingerprintRecord = await Fingerprint.findOne({ fingerprintHash });
    if (!fingerprintRecord) {
      throw new Error("Fingerprint not found");
    }
    return fingerprintRecord.username;
  } catch (error) {
    console.error("Error fetching username:", error);
    throw error;
  }
}

app.get("/get-username", async (req, res) => {
  const { fingerprintHash } = req.query;
  if (!fingerprintHash) {
    return res.status(400).json({ error: "FingerprintHash is required" });
  }

  try {
    const username = await getUsernameByFingerprintHash(fingerprintHash);
    res.json({ username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/fingerprints", async (req, res) => {
  const { fingerprintHash, fingerprint } = req.body;
  console.log(
    `Received POST request to /fingerprints with fingerprintHash: ${fingerprintHash}, fingerprint: ${fingerprint}`
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
    const count = fingerprint.canvases ? fingerprint.canvases.length : 0;
    const progress = count >= 1900 ? 100 : (count / 1900) * 100;
    res.json({ progress });
  } else {
    res.status(404).json({ error: "Fingerprint not found" });
  }
});

app.get("/fingerprintCount/:fingerprinthash", async (req, res) => {
  const fingerprinthash = req.params.fingerprinthash;
  console.log(
    `Received request for fingerprint count of hash: ${fingerprinthash}`
  );
  const fingerprint = await Fingerprint.findOne({
    fingerprintHash: fingerprinthash,
  });
  if (fingerprint) {
    const createdCanvasCount = fingerprint.canvases.length;
    console.log(
      `Count of created canvas fingerprints for hash ${fingerprinthash}: ${createdCanvasCount}`
    );
    res.json({ count: createdCanvasCount });
  } else {
    console.log(`No fingerprint found for hash ${fingerprinthash}`);
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
    console.log(
      "Fingerprint does not exist in the database, creating a new one"
    );

    let count = await Fingerprint.countDocuments();
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

app.get("/model-status", async (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  console.log(
    "Getting model status request for user with username: ",
    username
  );
  const modelExists = await doesModelExist(username);
  console.log(`Returning to Frontend: ${modelExists}`);
  res.json({ exists: modelExists });
});

app.post("/create-model", async (req, res) => {
  const username = req.body.username;
  console.log(`Creating model for user: ${username}`);

  // Überprüfen, ob das Modell bereits existiert
  const modelExists = await doesModelExist(username);

  if (modelExists) {
    console.log("Model already exists, please check index.js");
    return res.status(400).json({ error: "Model already exists" });
  }

  const command = `python src/SWAT_auth/train_model.py ${username}`;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");
  const process = exec(command);
  process.stdout.on("data", (data) => {
    res.write(JSON.stringify({ progress: data }));
  });
  process.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });
  process.on("close", (code) => {
    if (code === 0) {
      res.end(JSON.stringify({ success: true }));
    } else {
      res.end(JSON.stringify({ success: false }));
    }
  });
});

app.post("/verify-challenge", async (req, res, next) => {
  const { fingerprint, username } = req.body;
  if (!fingerprint || !username) {
    return res
      .status(400)
      .send("Missing fingerprint or username in request body");
  }

  console.log(
    `Received Prediction request for user ${username}: ${fingerprint}`
  );
  console.log("Checking if Python Server is running for Endpoint /predict");
  // Überprüfen, ob der ML-Server läuft
  try {
    const mlServerResponse = await axios.get("http://127.0.0.1:5000/status");
    if (mlServerResponse.status !== 200) {
      console.error("ML server is not running");
      return res.status(500).send("ML server is not running");
    }
  } catch (error) {
    console.error("Error checking ML server status:", error);
    return res.status(500).send("ML Server is not running");
  }

  console.log("Continueing with /predict Endpoint");
  try {
    const response = await axios.post("http://127.0.0.1:5000/predict", {
      fingerprint,
      username,
    });
    const result = response.data.prediction;
    res.json({ prediction: result });
  } catch (error) {
    next(error);
  }
});

async function areAllFingerprintsCollected(fingerprintHash) {
  const fingerprintRecord = await Fingerprint.findOne({ fingerprintHash });
  if (!fingerprintRecord) {
    throw new Error("Fingerprint not found");
  }
  return fingerprintRecord.canvases.length >= 1900;
}

async function runPythonScript(username) {
  return new Promise((resolve, reject) => {
    const command = `python src/SWAT_auth/train_model.py ${username}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return reject(new Error(stderr));
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

module.exports = { app, server };

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
