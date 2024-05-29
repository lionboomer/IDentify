const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");
const app = express(); // Create an instance of express
const http = require("http");
const os = require("os");
const bodyParser = require("body-parser");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Lese die Zertifikatsdateien
const privateKey = fs.readFileSync("src/Keys/privateKey.pem", "utf8");
const certificate = fs.readFileSync("src/Keys/certificate.pem", "utf8");

const credentials = { key: privateKey, cert: certificate };
let progress = 0; // Variable zur Speicherung des aktuellen Fortschritts

mongoose.connect("mongodb://localhost/fingerprintDB");

const FingerprintSchema = new mongoose.Schema({
  fingerprint: String,
  fingerprintHash: { type: String, unique: true }, // Make fingerprintHash the primary key
  name: String,
  username: String,
  canvases: [String], // Array to store the canvases
  createdAt: { type: Date, default: Date.now },
});

const Fingerprint = mongoose.model("Fingerprint", FingerprintSchema);
// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

app.post("/fingerprints", async (req, res) => {
  const { fingerprintHash, fingerprint } = req.body;

  console.log(
    `Received POST request to /fingerprints with fingerprintHash: ${fingerprintHash}, fingerprint: `
  );

  // Check if fingerprint is defined
  if (!fingerprint) {
    console.log("Missing fingerprint in request body");
    return res.status(400).send("Missing fingerprint");
  }

  // Find the fingerprint record
  let fingerprintRecord = await Fingerprint.findOne({ fingerprintHash });

  if (!fingerprintRecord) {
    // If the fingerprint record doesn't exist, create a new one
    console.log("No fingerprint record found, creating a new one");
    fingerprintRecord = new Fingerprint({ fingerprintHash, canvases: [] });
  }

  // Check if the fingerprint record's canvases array is not full
  if (fingerprintRecord.canvases.length < 20) {
    // Add the new fingerprint to the fingerprint record's canvases array
    console.log("Adding new fingerprint to canvases array");
    fingerprintRecord.canvases.push(fingerprint);

    // Aktualisieren Sie den Fortschritt
    progress = (fingerprintRecord.canvases.length / 20) * 100;
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

// Funktion, die die Anzahl der Canvases für einen bestimmten FingerprintHash zählt

app.get("/progress", async (req, res) => {
  const fingerprintHash = req.query.fingerprintHash;
  if (!fingerprintHash) {
    return res.status(400).json({ error: "FingerprintHash is required" });
  }

  // Get the fingerprint for the specific hash from the database
  const fingerprint = await Fingerprint.findOne({
    fingerprintHash: fingerprintHash,
  });

  // If a fingerprint was found for the hash
  if (fingerprint) {
    // The count of created canvas fingerprints is the length of the canvases  array
    const count = fingerprint.canvases.length;
    const progress = count >= 20 ? 100 : (count / 20) * 100;

    res.json({ progress });
  } else {
    // If no fingerprint was found for the hash, send an error message
    res.status(404).json({ error: "Fingerprint not found" });
  }
});
app.post("/fingerprint", async (req, res) => {
  const { fingerprint, fingerprintHash } = req.body;

  console.log(`Received fingerprint: ${fingerprint}`);
  console.log(`Received fingerprintHash: ${fingerprintHash}`);

  // Check if both the fingerprint and fingerprintHash are defined
  if (!fingerprint || !fingerprintHash) {
    console.log("Missing fingerprint or fingerprintHash in request body");
    return res.status(400).send("Missing fingerprint or fingerprintHash");
  }

  // Check if the fingerprint already exists in the database
  const existingFingerprint = await Fingerprint.findOne({ fingerprintHash });

  if (existingFingerprint) {
    console.log("Fingerprint already exists in the database");

    // If the fingerprint exists, return the ID and the name
    res.json({
      message: "Fingerprint recognized",
      id: existingFingerprint._id,
      name: existingFingerprint.name,
      username: existingFingerprint.username,
    });
  } else {
    console.log("Fingerprint does not exist in the database, creating a new one");

    // If the fingerprint does not exist, save it to the database
    const count = await Fingerprint.countDocuments();
    const name = `User ${count + 1}`;
    const username = `username_${count + 1}`; // Generate the username

    const newFingerprint = new Fingerprint({
      fingerprint: JSON.stringify(fingerprint),
      fingerprintHash,
      name,
      username, // Set the generated username
    });

    await newFingerprint.save();

    console.log("New fingerprint saved successfully");

    res.json({
      message: "Fingerprint saved successfully",
      id: newFingerprint._id,
      name,
      username,
    }); // Return the generated username
  }
});

app.get("/fingerprintCount/:fingerprinthash", async (req, res) => {
  // Get the fingerprint hash from the route parameters
  const fingerprinthash = req.params.fingerprinthash;
  console.log(
    `Received request for fingerprint count of hash: ${fingerprinthash}`
  );

  // Get the fingerprint for the specific hash from the database
  const fingerprint = await Fingerprint.findOne({
    fingerprintHash: fingerprinthash,
  });

  console.log(`Fingerprint for hash ${fingerprinthash}:`);

  // If a fingerprint was found for the hash
  if (fingerprint) {
    // The count of created canvas fingerprints is the length of the canvases array
    const createdCanvasCount = fingerprint.canvases.length;

    console.log(
      `Count of created canvas fingerprints for hash ${fingerprinthash}: ${createdCanvasCount}`
    );

    // Send the count of created canvas fingerprints as the response
    res.json({ count: createdCanvasCount });
  } else {
    // If no fingerprint was found for the hash, send an error message
    console.log(`No fingerprint found for hash ${fingerprinthash}`);
    res.status(404).json({ error: "Fingerprint not found" });
  }
});

const interfaces = os.networkInterfaces();
let serverIP = "";
for (let devName in interfaces) {
  let iface = interfaces[devName];

  for (let i = 0; i < iface.length; i++) {
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
// Create an HTTP service.
http.createServer(app).listen(80, () => {
  console.log(`HTTP Server is accessible on http://${serverIP}:80`);
});

// Create an HTTPS service identical to the HTTP service.
https.createServer(credentials, app).listen(443, () => {
  console.log(`HTTPS Server is accessible on https://${serverIP}:443`);
});
