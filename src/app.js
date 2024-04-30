const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql');

let connection;

function handleDisconnect() {
  connection = mysql.createConnection({
    host: 'db',
    user: 'root',  // Ändern Sie den Benutzernamen auf 'root'
    password: 'KOBIL123!',  // Ändern Sie das Passwort auf 'root'
    database: 'fingerprint',
    port: 3306
  });

  connection.connect(function(err) {
    if(err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    }                                     
  });                                     

  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();                         
    } else {                                      
      throw err;                                  
    }
  });
}

handleDisconnect();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/fingerprint', (req, res) => {
  const fingerprintData = req.body;
  console.log("Fingerprint data received:", fingerprintData);
  
  const query = 'INSERT INTO fingerprint (browserFingerprint) VALUES (?)';  // Ändern Sie den Tabellennamen auf 'fingerprint'
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