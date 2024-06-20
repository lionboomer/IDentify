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

// Ändern Sie die MongoDB-Verbindungs-URI
mongoose.connect("mongodb://127.0.0.1:27017/fingerprintDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Erhöhen Sie das Timeout auf 5000ms
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

// Funktion zum Abrufen des Benutzernamens basierend auf dem Fingerprint-Hash
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
    console.log(
      "Fingerprint does not exist in the database, creating a new one"
    );

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
async function areAllFingerprintsCollected(fingerprintHash) {
  const fingerprintRecord = await Fingerprint.findOne({ fingerprintHash });
  if (!fingerprintRecord) {
    throw new Error("Fingerprint not found");
  }
  return fingerprintRecord.canvases.length >= 1900;
}

// Funktion zum Ausführen des Python-Skripts
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

// API-Endpunkt für Vorhersagen
app.post("/predict", async (req, res, next) => {
  const { fingerprint, fingerprintHash } = req.body;

  if (!fingerprint || !fingerprintHash) {
    return res.status(400).send("Missing fingerprint or fingerprintHash");
  }

  try {
    // Ermitteln des Benutzernamens anhand des Fingerprint-Hashes
    const username = await getUsernameByFingerprintHash(fingerprintHash);

    if (!username) {
      console.log("No username found for fingerprint");
      return res.status(404).send("No username found for fingerprint");
    }

    console.log(`Username: ${username}`);

    // Überprüfen, ob alle Fingerprints gesammelt wurden
    const allFingerprintsCollected = await areAllFingerprintsCollected(fingerprintHash);
    if (!allFingerprintsCollected) {
      return res.status(400).send("Not all fingerprints collected");
    }

    // Überprüfen, ob das Modell bereits existiert
    const modelExists = await doesModelExist(username);
    let scriptOutput = '';
    if (!modelExists) {
      // Automatisches Ausführen des Python-Skripts zur Modellerstellung und -training
      scriptOutput = await runPythonScript(username);
      console.log(`Script output: ${scriptOutput}`);
    }

    // Senden des Fingerprints und des Benutzernamens an das Python-Backend
    console.log(`Sending data to Python API: { fingerprint: ${fingerprint}, username: ${username} }`);
    const response = await axios.post('http://127.0.0.1:5000/predict', { fingerprint, username });
    const result = response.data.prediction;
    console.log("Received prediction from Python API:", result);
    res.json({ prediction: result, scriptOutput });
  } catch (error) {
    next(error);
  }
});

// API-Endpunkt für Challenge-Verifizierung
app.post("/verify-challenge", async (req, res, next) => {
  const { fingerprint, fingerprintHash } = req.body;

  if (!fingerprint || !fingerprintHash) {
    return res.status(400).send("Missing fingerprint or fingerprintHash");
  }

  const existingFingerprint = await Fingerprint.findOne({ fingerprintHash });

  if (!existingFingerprint) {
    return res.status(404).send("Fingerprint not found");
  }

  try {
    const username = existingFingerprint.username;
    console.log(`Username: ${username}`);

    // Überprüfen, ob alle Fingerprints gesammelt wurden
    const allFingerprintsCollected = await areAllFingerprintsCollected(fingerprintHash);
    if (!allFingerprintsCollected) {
      return res.status(400).send("Not all fingerprints collected");
    }

    // Überprüfen, ob das Modell bereits existiert
    const modelExists = await doesModelExist(username);
    let scriptOutput = '';
    if (!modelExists) {
      // Automatisches Ausführen des Python-Skripts zur Modellerstellung und -training
      scriptOutput = await runPythonScript(username);
      console.log(`Script output: ${scriptOutput}`);
    }

    const response = await axios.post('http://127.0.0.1:5000/predict', { fingerprint, username });
    const result = response.data.prediction;

    // Berechne das Ergebnis in Prozent
    const resultPercentage = (result * 100).toFixed(2);

    if (result > 0.5) {
      res.json({ 
        message: "Challenge passed. User verified.", 
        verified: true, 
        result: `${resultPercentage}%`,
        scriptOutput
      });
    } else {
      res.json({ 
        message: "Challenge failed. User not verified.", 
        verified: false, 
        result: `${resultPercentage}%`,
        scriptOutput
      });
    }
  } catch (error) {
    next(error);
  }
});

// Globale Fehlerbehandlungsmiddleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    message: err.message,
    stack: err.stack
  });
});

app.get("/fingerprintCount/:fingerprinthash", async (req, res) => {
  const fingerprinthash = req.params.fingerprinthash;
  console.log(
    `Received request for fingerprint count of hash: ${fingerprinthash}`
  );

  const fingerprint = await Fingerprint.findOne({
    fingerprintHash: fingerprinthash,
  });

  console.log(`Fingerprint for hash ${fingerprinthash}:`);

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

async function runJupyterNotebook(username) {
  return new Promise((resolve, reject) => {
    const command = `jupyter nbconvert --to notebook --execute --inplace src/SWAT_auth/Model.ipynb --ExecutePreprocessor.timeout=None --ExecutePreprocessor.kernel_name=python3`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Jupyter Notebook: ${error.message}`);
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
