const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express(); // Create an instance of express

mongoose.connect('mongodb://localhost/fingerprintDB');

const FingerprintSchema = new mongoose.Schema({
  fingerprint: String,
  fingerprintHash: String,
  name: String, // Add this line,
  username: String, // Add this line
  createdAt: { type: Date, default: Date.now }
});

const Fingerprint = mongoose.model('Fingerprint', FingerprintSchema);

// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));


app.post('/fingerprint', async (req, res) => {
  const { fingerprint, fingerprintHash } = req.body;

  // Check if the fingerprint already exists in the database
  const existingFingerprint = await Fingerprint.findOne({ fingerprintHash });

  if (existingFingerprint) {
    // If the fingerprint exists, return the ID and the name
    res.json({ message: 'Fingerprint recognized', id: existingFingerprint._id, name: existingFingerprint.name, username: existingFingerprint.username });
  } else {
    // If the fingerprint does not exist, save it to the database
    const count = await Fingerprint.countDocuments();
    const name = `User ${count + 1}`;
    const username = `username_${count + 1}`; // Generate the username

    const newFingerprint = new Fingerprint({
      fingerprint: JSON.stringify(fingerprint),
      fingerprintHash,
      name,
      username // Set the generated username
    });

    await newFingerprint.save();

    res.json({ message: 'Fingerprint saved successfully', id: newFingerprint._id, name, username }); // Return the generated username
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});