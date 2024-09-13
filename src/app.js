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
const winston = require('winston');
//const bcrypt = require('bcrypt');

// Funktion zum Überprüfen, ob alle 6 Modelle existieren

// Definieren Sie benutzerdefinierte Log-Level
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    development: 4 // Neues Level für Entwicklungslogs
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    development: 'magenta'
  }
};

// Erstellen Sie den Logger
const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Aktivieren Sie die Farben
winston.addColors(customLevels.colors);

// Beispiel für Log-Nachrichten
logger.development('Dies ist eine Entwicklungslog-Nachricht'); // Wird nur in der Entwicklung angezeigt
logger.info('Dies ist eine Info-Meldung');
logger.error('Dies ist eine Fehlermeldung');
winston.addColors(customLevels.colors);

// Funktion zum Löschen der Konsole
function clearConsole() {
  process.stdout.write('\x1Bc');
}
async function doesModelExist(username) {
  try {
      for (let i = 1; i <= 6; i++) {
          const modelPath = path.join(__dirname, `SWAT_auth/models/${username}_${i}.h5`);
          if (!fs.existsSync(modelPath)) {
            logger.warn(`Model does not exist: ${modelPath}`);
              return false;
          }
          logger.info(`Model exists: ${modelPath}`);
      }
      logger.info("All models exist for", username);
      return true;
  } catch (error) {
      logger.error("An error occurred:", error);
      return false;
  }
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
      const mongoUri = process.env.MONGO_URI || "mongodb://mongo:27018/fingerprintDB";
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      logger.info('Connected to MongoDB');
    }
  } catch (error) {
    logger.error("Error connecting to MongoDB", error);
  }
}

connectDB();

const CanvasSampleSchema = new mongoose.Schema({
  fingerprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fingerprint' },
  sampleData: String,
  createdAt: { type: Date, default: Date.now }
});

const FingerprintSchema = new mongoose.Schema({
  fingerprint: String,
  fingerprintHash: { type: String, unique: true },
  username: { type: String, unique: true },
  name: String,
  deviceName: String,
  operatingSystem: String,
  browser: String,
  canvasSampleCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
});

//FingerprintSchema.pre('save', async function(next) {
  //if (this.isModified('password')) {
    //this.password = await bcrypt.hash(this.password, 10);
  //}
  //next();
//});

const Fingerprint = mongoose.model("Fingerprint", FingerprintSchema);
const CanvasSample = mongoose.model("CanvasSample", CanvasSampleSchema);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  logger.info(`App listening at http://localhost:${port}`);
});

async function getUsernameByFingerprintHash(fingerprintHash) {
  try {
    const fingerprintRecord = await Fingerprint.findOne({ fingerprintHash });
    if (!fingerprintRecord) {
      throw new Error("Fingerprint not found");
    }
    return fingerprintRecord.username;
  } catch (error) {
    logger.error("Error fetching username:", error);
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

let progressLastTime = Date.now();

app.post("/fingerprints", async (req, res) => {
  const { fingerprintHash, fingerprint } = req.body;
  logger.development(
    `Received POST request to /fingerprints with fingerprintHash: ${fingerprintHash}, fingerprint: ${fingerprint}`
  );
  if (!fingerprint) {
    logger.warn("Missing fingerprint in request body");
    return res.status(400).send("Missing fingerprint");
  }

  const cleanedFingerprint = fingerprint.replace(/^data:image\/\w+;base64,/, "");

  let fingerprintRecord = await Fingerprint.findOne({ fingerprintHash });
  if (!fingerprintRecord) {
    logger.warn("No fingerprint record found, creating a new one");
    fingerprintRecord = new Fingerprint({ fingerprintHash });
    await fingerprintRecord.save();
  }

  if (fingerprintRecord.canvasSampleCount < 100000) {
    logger.development("Adding new fingerprint to CanvasSample collection");
    const newCanvasSample = new CanvasSample({
      fingerprintId: fingerprintRecord._id,
      sampleData: cleanedFingerprint
    });
    await newCanvasSample.save();

    fingerprintRecord.canvasSampleCount += 1;
    await fingerprintRecord.save();

    const progress = (fingerprintRecord.canvasSampleCount / 100000) * 100;

    const currentTime = Date.now();
    if (currentTime - progressLastTime >= 200) {
      clearConsole();
      logger.info(`Progress: ${progress.toFixed(2)}%`);
      progressLastTime = currentTime;
    }
  } else {
    logger.warn("Canvas sample limit reached");
    return res.status(400).send("Canvas sample limit reached");
  }

  logger.development("Fingerprint sample saved successfully");
  res.send("Fingerprint sample saved successfully");
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
    const progress = fingerprint.canvasSampleCount >= 100000 ? 100 : (fingerprint.canvasSampleCount / 100000) * 100;
    res.json({ progress });
  } else {
    res.status(404).json({ error: "Fingerprint not found" });
  }
});

app.get("/fingerprintCount/:fingerprinthash", async (req, res) => {
  const fingerprinthash = req.params.fingerprinthash;
  logger.development(
    `Empfangene Anfrage für Fingerabdruck-Zählung des Hashes: ${fingerprinthash}`
  );
  const fingerprint = await Fingerprint.findOne({
    fingerprintHash: fingerprinthash,
  });
  if (fingerprint) {
    const createdCanvasCount = fingerprint.canvasSampleCount;
    logger.development(
      `Anzahl der erstellten Canvas-Fingerabdrücke für Hash ${fingerprinthash}: ${createdCanvasCount}`
    );
    res.json({ count: createdCanvasCount });
  } else {
    logger.development(`Kein Fingerabdruck gefunden für Hash ${fingerprinthash}`);
    res.status(404).json({ error: "Fingerabdruck nicht gefunden" });
  }
});

app.post("/fingerprint", async (req, res) => {
  const { fingerprint, fingerprintHash, deviceName, operatingSystem } = req.body;

  logger.development(`Empfangener Fingerabdruck: ${fingerprint}`);
  logger.development(`Empfangener Fingerabdruck-Hash: ${fingerprintHash}`);
  logger.development(`Empfangener Gerätename: ${deviceName}`);
  logger.development(`Empfangenes Betriebssystem: ${operatingSystem}`);

  if (!fingerprint || !fingerprintHash) {
    logger.warn("Fehlender Fingerabdruck oder Fingerabdruck-Hash im Anfragekörper");
    return res.status(400).send("Fehlender Fingerabdruck oder Fingerabdruck-Hash");
  }

  const existingFingerprint = await Fingerprint.findOne({ fingerprintHash });

  if (existingFingerprint) {
    logger.info("Fingerabdruck existiert bereits in der Datenbank");

    // Aktualisieren Sie die Geräteinformationen, falls sie sich geändert haben
    if (deviceName && deviceName !== existingFingerprint.deviceName) {
      existingFingerprint.deviceName = deviceName;
    }
    if (operatingSystem && operatingSystem !== existingFingerprint.operatingSystem) {
      existingFingerprint.operatingSystem = operatingSystem;
    }
    await existingFingerprint.save();

    // Senden Sie eine Herausforderung an den Benutzer
    res.json({
      message: "Fingerabdruck erkannt. Bitte vervollständigen Sie die Herausforderung.",
      challenge: true,
      id: existingFingerprint._id,
      name: existingFingerprint.name,
      username: existingFingerprint.username,
    });
  } else {
    logger.warn(
      "Fingerabdruck existiert nicht in der Datenbank, erstelle einen neuen"
    );

    let count = await Fingerprint.countDocuments();
    let name = `Benutzer ${count + 1}`;
    let username = `benutzername_${count + 1}`;

    // Sicherstellen, dass der Benutzername eindeutig ist
    while (await Fingerprint.findOne({ username })) {
      count++;
      name = `Benutzer ${count + 1}`;
      username = `benutzername_${count + 1}`;
    }

    const newFingerprint = new Fingerprint({
      fingerprint: JSON.stringify(fingerprint),
      fingerprintHash,
      name,
      username,
      deviceName,
      operatingSystem,
    });

    await newFingerprint.save();

    logger.info("Neuer Fingerabdruck erfolgreich gespeichert");

    res.json({
      message: "Fingerabdruck erfolgreich gespeichert",
      id: newFingerprint._id,
      name,
      username,
    });
  }
});

// Endpunkt für den Modellstatus
app.get("/model-status", async (req, res) => {
  const username = req.query.username;
  if (!username) {
      return res.status(400).json({ error: "Username is required" });
  }
  logger.development("Getting model status request for user with username:", username);
  const modelExists = await doesModelExist(username);
  logger.development(`Returning to Frontend: ${modelExists}`);
  res.json({ exists: modelExists });
});

// Endpunkt zum Erstellen von Modellen
app.post("/create-model", async (req, res) => {
  const username = req.body.username;
  logger.info(`Creating model for user: ${username}`);
  const modelExists = await doesModelExist(username);
  if (modelExists) {
    logger.info("Models already exist, please check index.js");
      return res.status(400).json({ error: "Models already exist" });
  }
  const command = `python src/SWAT_auth/train_model.py ${username}`;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");
  const process = exec(command);
  process.stdout.on("data", (data) => {
      res.write(JSON.stringify({ progress: data }));
  });
  process.stderr.on("data", (data) => {
      logger.error(`stderr: ${data}`);
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

  logger.info(
    `Received Prediction request for user ${username}: ${fingerprint}`
  );
  logger.info("Checking if Python Server is running for Endpoint /predict");
  // Überprüfen, ob der ML-Server läuft
  try {
    const mlServerResponse = await axios.get("http://127.0.0.1:5000/status");
    if (mlServerResponse.status !== 200) {
      console.error("ML server is not running");
      return res.status(500).send("ML server is not running");
    }
    logger.info("ML server is running");
  } catch (error) {
    console.error("Error checking ML server status:", error);
    return res.status(500).send("ML Server is not running");
  }

  logger.info("Continue with /predict Endpoint");
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
  logger.info(`Running Python script for user: ${username}`);
  logger.info("WARNING TRAINING MODEL WILL BE STARTED!");
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
  logger.info(`HTTP Server is accessible on http://${serverIP}:80`);
});

https.createServer(credentials, app).listen(443, () => {
  logger.info(`HTTPS Server is accessible on https://${serverIP}:443`);
});
