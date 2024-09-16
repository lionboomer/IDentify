  
import * as bsf from "./fingerprint.js";
import * as canvasFp from "./canvas.js";
import * as webglFp from "./webgl.js";

let GlobalfingerprintHash;
let username;
let localProgress = 0; // Variable zur Speicherung des lokalen Fortschritts
let deviceName = '';
let operatingSystem = '';


const hashFuntion = async (fingerprint) => {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(fingerprint))
  );
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const generateFingerprint = async () => {
  const fingerprint = {
    UserAgent: bsf.getUserAgent(),
    IpAddress: await bsf.getIpAddress(),
    ScreenResolution: bsf.getScreenResolution(),
    ColorDepth: bsf.getColorDepth(),
    AvailableScreenResolution: bsf.getAvailableScreenResolution(),
    PixelRatio: bsf.getPixelRatio(),
    TimezoneOffset: bsf.getTimezoneOffset(),
    SessionStorage: bsf.getSessionStorage(),
    LocalStorage: bsf.getLocalStorage(),
    IndexedDB: bsf.getIndexedDB(),
    CookiesEnabled: bsf.getCookiesEnabled(),
    TouchSupport: bsf.getTouchSupport(),
    DoNotTrack: bsf.getDoNotTrack(),
    HardwareConcurrency: bsf.getHardwareConcurrency(),
    Platform: bsf.getPlatform(),
    Plugins: bsf.getPlugins(),
    PdfViewerEnabled: bsf.getPdfViewerEnabled(),
    ForcedColors: bsf.getForcedColors(),
    canvasFingerprint: canvasFp.generateCanvasFingerprint(),
    webGLFingerprint: webglFp.webGLFingerprint,
  };
  const fingerprintHash = await hashFuntion(fingerprint);
  GlobalfingerprintHash = fingerprintHash;
  username = await getUsernameByFingerprintHash(GlobalfingerprintHash);
  return {
    fingerprint,
    fingerprintHash,
  };
};

const populateTable = (fingerprint) => {
  const tableBody = document.getElementById("fingerprint-table");

  for (const prop in fingerprint) {
    const row = document.createElement("tr");
    const propertyName = document.createElement("td");
    const propertyValue = document.createElement("td");

    propertyName.textContent = prop;

    if (prop === "canvasFingerprint") {
      // Create an image element for the canvas fingerprint
      const canvasFingerprintImage = document.createElement("img");
      canvasFingerprintImage.src = fingerprint.canvasFingerprint;
      propertyValue.appendChild(canvasFingerprintImage);
    } else {
      // For other properties, display the value
      propertyValue.textContent = fingerprint[prop];
    }

    row.appendChild(propertyName);
    row.appendChild(propertyValue);

    tableBody.appendChild(row);
  }
};

async function sendFingerprint() {
  // get the generated fingerprint
  const { fingerprint, fingerprintHash } = await generateFingerprint();

  if (!fingerprint || !fingerprintHash) {
    throw new Error("Fingerprint oder fingerprintHash ist null");
  }

  // Check if the fingerprint already exists
  const response = await fetch(`/get-username?fingerprintHash=${fingerprintHash}`);
  const data = await response.json();

  let deviceName = "";
  let operatingSystem = "";

  if (!data.username) {
    // Ask for device name and operating system if fingerprint is not recognized
    deviceName = prompt("Bitte geben Sie den Gerätenamen ein:");
    operatingSystem = prompt("Bitte geben Sie das Betriebssystem ein:");
  }

  // Send the fingerprint to the server
  const saveResponse = await fetch("/fingerprint", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fingerprint,
      fingerprintHash,
      deviceName,
      operatingSystem
    }),
  });

  const saveData = await saveResponse.json();
  console.log(saveData);
  if (saveData.message === "Fingerprint erkannt. Bitte vervollständigen Sie die Herausforderung.") {
    alert(`Fingerprint erkannt. Bitte vervollständigen Sie die Herausforderung. ID: ${saveData.id}, Name: ${saveData.name}, Benutzername: ${saveData.username}`);
    // Call the function to handle the challenge
    handleChallenge();
  } else {
    alert(`Fingerprint gespeichert. ID: ${saveData.id}, Name: ${saveData.name}, Benutzername: ${saveData.username}`);
  }

  // Now you can use fingerprintHash
  const hash_h1 = document.getElementById("fingerprint-hash");
  hash_h1.textContent = `Eindeutige ID: ${fingerprintHash}`;

  // Call the function to populate the table
  populateTable(fingerprint);
}

async function sendFingerprintToServer(fingerprint, fingerprintHash) {
  try {
    const response = await fetch("/fingerprint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fingerprint, fingerprintHash }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error sending fingerprint:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    if (
      data.message === "Fingerprint recognized. Please complete the challenge."
    ) {
      alert(
        `Fingerprint recognized. Please complete the challenge. ID: ${data.id}, Name: ${data.name}, Username: ${data.username}`
      );
      // Call the function to handle the challenge
      handleChallenge();
    } else {
      alert(
        `Fingerprint saved. ID: ${data.id}, Name: ${data.name}, Username: ${data.username}`
      );
    }
  } catch (error) {
    console.error("Error in sendFingerprintToServer:", error);
  }
}

// Function to handle the challenge
async function handleChallenge() {
  const newFingerprint = canvasFp.generateCanvasFingerprint();
  const response = await fetch("/verify-challenge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fingerprint: newFingerprint,
      fingerprintHash: GlobalfingerprintHash,
    }),
  });

  const data = await response.json();
  const verificationStatus = document.getElementById("verification-status");
  if (data.verified) {
    alert("Challenge passed. User verified.");
    verificationStatus.textContent = `User verified. Confidence: ${data.result}`;
    verificationStatus.style.color = "green";
  } else {
    alert("Challenge failed. User not verified.");
    verificationStatus.textContent = `User not verified. Confidence: ${data.result}`;
    verificationStatus.style.color = "red";
  }
}

function showDeviceInfoForm() {
  const deviceInfoForm = document.getElementById('device-info-form');
  deviceInfoForm.style.display = 'block';

  // Stellen Sie sicher, dass beide Felder im Formular vorhanden sind
  const deviceNameInput = document.getElementById('device-name');
  const operatingSystemInput = document.getElementById('operating-system');

  if (deviceNameInput && operatingSystemInput) {
    deviceInfoForm.appendChild(deviceNameInput);
    deviceInfoForm.appendChild(operatingSystemInput);
  } else {
    console.error("Eingabefelder für Gerätename und Betriebssystem nicht gefunden.");
  }
}

document.getElementById('device-form').addEventListener('submit', function (event) {
  event.preventDefault();
  deviceName = document.getElementById('device-name').value;
  operatingSystem = document.getElementById('operating-system').value;
  document.getElementById('device-info-form').style.display = 'none';
  runFunctionsSequentially();
});

// Function to generate a random canvas with text
function generateRandomCanvas(txt) {
  var canvas = document.createElement("canvas");
  canvas.width = 280;
  canvas.height = 35;
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "18px 'Arial'";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#069";
  ctx.fillText(txt, 2, 15, 280);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText(txt, 4, 19, 280);
  ctx.fillStyle = "#069";
  ctx.fillText(txt, 2, 23, 280);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText(txt, 4, 27, 280);
  ctx.fillStyle = "#069";
  ctx.fillText(txt, 2, 31, 280);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText(txt, 4, 35, 280);
  return canvas.toDataURL();
}

// Function to generate multiple canvas fingerprints
async function generateCanvasFingerprints(fingerprintsToGenerate) {
  console.log(
    `Starting generateCanvasFingerprints with ${fingerprintsToGenerate} fingerprints to generate`
  );

  let fingerprints = [];
  const progressBar = document.getElementById("local-progress");
  const progressPercent = document.getElementById("local-progress-percent");

  for (let i = 0; i < fingerprintsToGenerate; i++) {
    console.log(`Generating fingerprint ${i + 1}`);

    let txt = Math.random().toString(36).substring(2);
    let fingerprint = generateRandomCanvas(txt);
    fingerprints.push(fingerprint);

    console.log(`Generated fingerprint ${i + 1}: ${fingerprint}`);

    // Update the progress bar and progress percent
    const progress = ((i + 1) / fingerprintsToGenerate) * 100;
    progressBar.value = progress;
    progressPercent.textContent = `${progress.toFixed(2)}%`;
    console.log(`Updated progress to ${progress}%`);

    // Send the fingerprint to the server
    console.log(`Sending fingerprint ${i + 1} to the server`);
    //const fingerprintHash = await hashFingerprint(fingerprint);
    await sendFingerprints(fingerprint);
    console.log(`Sent fingerprint ${i + 1} to the server`);
  }

  console.log(`Finished generating ${fingerprintsToGenerate} fingerprints`);
  return fingerprints;
}

async function generateRequiredCanvasFingerprints(fingerprintHash) {
  console.log("Starting generateRequiredCanvasFingerprints function");

  if (fingerprintHash === undefined) {
    console.error("fingerprintHash is undefined");
    return;
  }

  console.log(`Fetching fingerprint count for hash: ${fingerprintHash}`);
  const response = await fetch(
    `/fingerprintCount/${encodeURIComponent(fingerprintHash)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`);
    return;
  }

  const data = await response.json();
  console.log(`Received data from server: ${JSON.stringify(data)}`);

  const existingFingerprintsCount = data.count;
  console.log(`Existing fingerprints count: ${existingFingerprintsCount}`);

  const fingerprintsToGenerate = 100000 - existingFingerprintsCount;
  console.log(`Fingerprints to generate: ${fingerprintsToGenerate}`);

  const fingerprints = await generateCanvasFingerprints(fingerprintsToGenerate);
  console.log(`Generated fingerprints: ${JSON.stringify(fingerprints)}`);

  const progressBar = document.getElementById("local-progress");
  progressBar.value = existingFingerprintsCount + fingerprints.length;

  console.log(
    `Generated ${fingerprints.length} new fingerprints. Total: ${existingFingerprintsCount + fingerprints.length
    } of 20`
  );
}

async function sendFingerprints(fingerprint) {
  console.log("Starting sendFingerprints function");

  if (!fingerprint) {
    console.error("No fingerprints provided");
    return;
  }

  const fingerprintHash = GlobalfingerprintHash;

  if (!fingerprintHash) {
    console.error("No fingerprintHash defined");
    return;
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fingerprint, fingerprintHash }),
  };

  const response = await fetch("/fingerprints", options);

  if (!response.ok) {
    const responseBody = await response.json();
    console.error(
      `HTTP error! status: ${response.status}, message: ${responseBody.message}`
    );

    if (responseBody.message === "Canvases array is full") {
      console.error("Canvases array is full.");
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  }

  console.log("Response status is OK");
}

async function getFingerprintCount(fingerprintHash) {
  const url = `/fingerprintCount/${encodeURIComponent(fingerprintHash)}`;
  console.log(`Fetching: ${url}`);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fingerprint count:", data.count);
    return data.count;
  } catch (error) {
    console.error("Error fetching fingerprint count:", error);
  }
}
async function predictFingerprint(username, fingerprint) {
  console.log("Predicting fingerprint for username:", username);
  console.log("Fingerprint:", fingerprint);
  try {
    const response = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, fingerprint }),
    });
    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error predicting fingerprint:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Prediction data:", data);
    return data;
  } catch (error) {
    console.error("Error in predictFingerprint:", error);
    throw error;
  }
}

async function updateServerProgressBar() {
  try {
    const response = await fetch(`/progress?fingerprintHash=${encodeURIComponent(GlobalfingerprintHash)}`);
    const { progress: serverProgress } = await response.json();
    const serverProgressBar = document.getElementById("server-progress");
    const serverProgressPercent = document.getElementById("server-progress-percent");

    const roundedServerProgress = serverProgress.toFixed(2);
    serverProgressBar.value = roundedServerProgress;
    serverProgressPercent.textContent = `${roundedServerProgress}%`;

    if (serverProgress === 100) {
      const localProgressBar = document.getElementById("local-progress");
      const localProgressPercent = document.getElementById("local-progress-percent");
      localProgressBar.value = 100;
      localProgressPercent.textContent = `100%`;
    }
  } catch (error) {
    console.error("Error updating server progress bar:", error);
  }
}

async function updateTerminalLogs() {
  try {
    const response = await fetch("http://localhost:5001/console-logs");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const logs = data.logs;

    const terminalOutput = document.getElementById("terminal-output");
    terminalOutput.textContent = logs.join("\n");
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  } catch (error) {
    console.error("Error updating terminal logs:", error);
  }
}
setInterval(updateServerProgressBar, 1000);

let terminalLogErrorCount = 0;
let progressBarErrorCount = 0;
const maxErrorAttempts = 0;


// Intervall zum regelmäßigen Abrufen der Konsolenmeldungen
const terminalLogsInterval = setInterval(updateTerminalLogs, 1000);

async function updateCircularProgressBar() {
  try {
    // Abrufen des Trainingsfortschritts
    const progressResponse = await fetch(
      "http://localhost:5001/training-progress"
    );
    if (!progressResponse.ok) {
      throw new Error(`HTTP error! status: ${progressResponse.status}`);
    }
    const progressData = await progressResponse.json();
    const trainingProgress = progressData.progress;

    // Aktualisieren der kreisförmigen Fortschrittsanzeige
    const circularProgressBar = document.getElementById("circular-progress");
    const circularProgressText = document.getElementById(
      "circular-progress-text"
    );

    // Runden des Fortschritts auf zwei Dezimalstellen
    const roundedProgress = trainingProgress.toFixed(2);

    // Aktualisieren des Fortschrittsbalkens und des Textes
    circularProgressBar.style.background = `conic-gradient(#4caf50 ${roundedProgress}%, #f3f3f3 ${roundedProgress}%)`;
    circularProgressText.textContent = `${roundedProgress}%`;

    progressBarErrorCount = 0; // Reset error count on success
  } catch (error) {
    progressBarErrorCount++;
    console.error("Error updating circular progress bar:", error);
    if (progressBarErrorCount >= maxErrorAttempts) {
      console.error(
        "Max error attempts reached for progress bar. Stopping updates."
      );
      clearInterval(progressBarInterval);
    }
  }
}

// Intervall zum regelmäßigen Aktualisieren der kreisförmigen Fortschrittsanzeige
const progressBarInterval = setInterval(updateCircularProgressBar, 1000);

// Funktion zum Überprüfen, ob das Modell existiert
async function checkModelStatus(username) {
  console.log("Requesting model status for username:", username);
  try {
    const response = await fetch(`/model-status?username=${username}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    console.log("Response was:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error checking model status:", errorText);
      return false;
    }

    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error("Error checking model status:", error);
    return false;
  }
}

async function createModel(username) {
  try {
    const response = await fetch("/create-model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error creating model:", errorText);
      return false;
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error creating model:", error);
    return false;
  }
}

// Funktion zum Abrufen des Benutzernamens basierend auf dem Fingerprint-Hash
async function getUsernameByFingerprintHash(fingerprintHash) {
  try {
    const response = await fetch(
      `/get-username?fingerprintHash=${fingerprintHash}`
    );
    const data = await response.json();
    return data.username;
  } catch (error) {
    console.error("Error fetching username:", error);
    throw error;
  }
}

// Hauptlogik in eine Funktion auslagern
async function checkAndCreateModel() {
  const statusMessage = document.getElementById("model-status");
  const username = await getUsernameByFingerprintHash(GlobalfingerprintHash);
  const modelExists = await checkModelStatus(username);
  console.log("Model exists:", modelExists);

  if (modelExists) {
    // Set Progress to 100% if model exists
    const localProgressBar = document.getElementById("local-progress");
    localProgressBar.value = 100;
    const circularProgressBar = document.getElementById("circular-progress");
    const circularProgressText = document.getElementById("circular-progress-text");
    circularProgressBar.style.background = `conic-gradient(#4caf50 100%, #f3f3f3 0%)`;
    circularProgressText.textContent = `100%`;
    statusMessage.textContent = "Model is trained and ready to use.";
    return true;
  } else {
    statusMessage.textContent = "Model does not exist. Creating model...";
    const success = await createModel(username);
    if (success) {
      statusMessage.textContent = "Model created successfully.";
      return true;
    } else {
      statusMessage.textContent = "Failed to create model.";
      return false;
    }
  }
}

async function exampleUsage() {
  try {
    let txt = Math.random().toString(36).substring(2);
    let fingerprint = generateRandomCanvas(txt);
    console.log("Generated fingerprint:", fingerprint);

    const username = await getUsernameByFingerprintHash(GlobalfingerprintHash);
    const predictionData = await predictFingerprint(username, fingerprint);
    console.log("Prediction result:", predictionData);

    displayPredictionResults(predictionData);
  } catch (error) {
    console.error("Error in exampleUsage:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  exampleUsage();
});

function displayPredictionResults(data) {
  const resultElement = document.getElementById("verification-status");
  const individualPredictionsElement = document.getElementById("individual-predictions");
  const modelDropdown = document.getElementById("model-dropdown");

  if (!resultElement || !individualPredictionsElement || !modelDropdown) {
    throw new Error("Element with ID 'verification-status', 'individual-predictions', or 'model-dropdown' not found in the DOM");
  }

  const averagePrediction = data.average_prediction;
  const majorityVote = data.majority_vote;
  const individualPredictions = data.individual_predictions;

  // Anzeige der Mehrheitsentscheidung
  if (majorityVote === 1) {
    resultElement.textContent = `Fingerprint authentication successful with an average confidence of ${averagePrediction.toFixed(2)}`;
    resultElement.style.color = "green";
  } else {
    resultElement.textContent = `Fingerprint authentication failed with an average confidence of ${averagePrediction.toFixed(2)}`;
    resultElement.style.color = "red";
  }

  // Anzeige der individuellen Vorhersagen
  individualPredictionsElement.innerHTML = "";
  modelDropdown.innerHTML = ""; // Clear existing options

  individualPredictions.forEach(prediction => {
    const predictionItem = document.createElement("li");

    const modelName = document.createElement("span");
    modelName.className = "model-name";
    // Extrahiere den Modellnamen ohne Pfad und Dateierweiterung
    const modelNameText = prediction.model.split('/').pop().replace('.h5', '');
    modelName.textContent = modelNameText;

    const predictionValue = document.createElement("span");
    predictionValue.className = "prediction-value";
    predictionValue.textContent = prediction.prediction.toFixed(2);
    if (prediction.prediction < 0.5) {
      predictionValue.classList.add("failed");
    }

    predictionItem.appendChild(modelName);
    predictionItem.appendChild(predictionValue);
    individualPredictionsElement.appendChild(predictionItem);

    // Dropdown-Option hinzufügen
    const option = document.createElement("option");
    option.value = modelNameText;
    option.textContent = modelNameText;
    modelDropdown.appendChild(option);
  });

  // Zeige das Haupt-Element an
  document.getElementById("main-content").style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  displayPredictionResults(exampleData);
});

// Funktion zum sequentiellen Ausführen von Funktionen
async function runFunctionsSequentially() {
  await sendFingerprint();
  await generateRequiredCanvasFingerprints(GlobalfingerprintHash);
  await sendFingerprintToServer();
  if (await checkAndCreateModel()) {
    await exampleUsage();
  }
}

// Show the stats form when the button is clicked
// Redirect to the stats page when the button is clicked
document.getElementById('open-stats-page').addEventListener('click', function() {
  window.location.href = 'stats.html';
});

// Handle the form submission
document.getElementById('user-stats-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const username = document.getElementById('stats-username').value;
  const statsContainer = document.getElementById('stats-container');
  const statsContent = document.getElementById('stats-content');
  const statsUsernameDisplay = document.getElementById('stats-username-display');
  const canvasDropdown = document.getElementById('canvas-dropdown');
  const canvasDisplay = document.getElementById('canvas-display');

  // Fetch the statistics from the server
  const response = await fetch(`/user-stats?username=${encodeURIComponent(username)}`);
  const data = await response.json();

  // Display the statistics
  statsUsernameDisplay.textContent = username;
  statsContent.innerHTML = `
    <p>Anzahl der Fingerabdrücke: ${data.fingerprintCount}</p>
    <p>Letzte Aktivität: ${data.lastActivity}</p>
    <p>Gerätename: ${data.deviceName}</p>
    <p>Betriebssystem: ${data.operatingSystem}</p>
  `;

  // Populate the canvas dropdown
  canvasDropdown.innerHTML = '';
  data.canvasSamples.forEach((sample, index) => {
    const option = document.createElement('option');
    option.value = sample;
    option.textContent = `Canvas Sample ${index + 1}`;
    canvasDropdown.appendChild(option);
  });

  // Display the selected canvas sample
  canvasDropdown.addEventListener('change', function() {
    const selectedSample = canvasDropdown.value;
    canvasDisplay.innerHTML = `<img src="data:image/png;base64,${selectedSample}" alt="Canvas Sample">`;
  });

  statsContainer.style.display = 'block';
});

async function fetchWithErrorHandling(url, options) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching ${url}: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in fetchWithErrorHandling: ${error}`);
    throw error;
  }
}
runFunctionsSequentially();

