const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'db',
  user: 'KOBIL',
  password: 'KOBIL123!',
  database: 'fingerprint'
});

setTimeout(() => {
  connection.connect(err => {
    if (err) {
      console.error('An error occurred while connecting to the DB')
      throw err
    }

    // Erstellen Sie die Tabelle, wenn sie nicht existiert
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS browserFingerprint (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fingerprint_hash VARCHAR(255) NOT NULL
      )
    `;
    connection.query(createTableQuery, err => {
      if (err) throw err;
      console.log("Table 'browserFingerprint' is ready.");
    });
  });
}, 5000);  // Warten Sie 5 Sekunden, bevor Sie versuchen, eine Verbindung herzustellen
connection.connect(err => {
  if (err) {
    console.error('An error occurred while connecting to the DB')
    throw err
  }

  // Erstellen Sie die Tabelle, wenn sie nicht existiert
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS browserFingerprint (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fingerprint_hash VARCHAR(255) NOT NULL
    )
  `;
  connection.query(createTableQuery, err => {
    if (err) throw err;
    console.log("Table 'browserFingerprint' is ready.");
  });
});

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/fingerprint', (req, res) => {
  const fingerprintData = req.body;
  console.log("Fingerprint data received:", fingerprintData);
  
  const query = 'INSERT INTO browserFingerprint (fingerprint_hash) VALUES (?)';
  connection.query(query, [fingerprintData.fingerprint], (error, results, fields) => {
    if (error) throw error;
    console.log("Fingerprint data saved to database.");
    console.log("Fingerprint:", fingerprintData.fingerprint);  // Ausgabe des Fingerabdrucks
  });

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});