import * as bsf from "./fingerprint.js";
import * as canvasFp from "./canvas.js";
import * as webglFp from "./webgl.js";

let GlobalfingerprintHash;
let localProgress = 0; // Variable zur Speicherung des lokalen Fortschritts
// Nun können Sie auf `globalFingerprintHash` von überall in Ihrem Code zugreifen
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
    throw new Error("Fingerprint or fingerprintHash is null");
  }

  // Send the fingerprint to the server
  fetch("/fingerprint", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fingerprint, fingerprintHash }), // Add username here
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.message === "Fingerprint recognized") {
        alert(
          `Fingerprint recognized. ID: ${data.id}, Name: ${data.name}, Username: ${data.username}`
        ); // Add username here
      } else {
        alert(
          `Fingerprint saved. ID: ${data.id}, Name: ${data.name}, Username: ${data.username}`
        ); // Add username here
      }
    })
    .catch((error) => {
      console.error(error);
    });

  // Now you can use fingerprintHash
  const hash_h1 = document.getElementById("fingerprint-hash");
  hash_h1.textContent = `unique Id: ${fingerprintHash}`;

  // Call the function to populate the table
  populateTable(fingerprint);
}

function sendFingerprintToServer(fingerprint) {
  fetch("/fingerprint", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fingerprint }),
  })
    .then((response) => {
      console.log("Response status:", response.status);
      return response.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });
}
// Generate multiple canvas elements and draw random texts

async function hashFingerprint(fingerprint) {
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}


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
  console.log(`Starting generateCanvasFingerprints with ${fingerprintsToGenerate} fingerprints to generate`);

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
  const response = await fetch(`/fingerprintCount/${encodeURIComponent(fingerprintHash)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`);
    return;
  }

  const data = await response.json();
  console.log(`Received data from server: ${JSON.stringify(data)}`);

  const existingFingerprintsCount = data.count;
  console.log(`Existing fingerprints count: ${existingFingerprintsCount}`);

  const fingerprintsToGenerate = 20 - existingFingerprintsCount;
  console.log(`Fingerprints to generate: ${fingerprintsToGenerate}`);

  const fingerprints = await generateCanvasFingerprints(fingerprintsToGenerate);
  console.log(`Generated fingerprints: ${JSON.stringify(fingerprints)}`);

  const progressBar = document.getElementById("local-progress");
  progressBar.value = existingFingerprintsCount + fingerprints.length;

  console.log(`Generated ${fingerprints.length} new fingerprints. Total: ${existingFingerprintsCount + fingerprints.length} of 20`);
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
    console.error(`HTTP error! status: ${response.status}, message: ${responseBody.message}`);

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

async function updateServerProgressBar() {
  const response = await fetch(`/progress?fingerprintHash=${encodeURIComponent(GlobalfingerprintHash)}`);
  const { progress: serverProgress } = await response.json();

  const serverProgressBar = document.getElementById("server-progress");
  const serverProgressPercent = document.getElementById("server-progress-percent");

  serverProgressBar.value = serverProgress;
  serverProgressPercent.textContent = `${serverProgress}%`;

  if (serverProgress === 100) {
    const localProgressBar = document.getElementById("local-progress");
    const localProgressPercent = document.getElementById("local-progress-percent");

    localProgressBar.value = 100;
    localProgressPercent.textContent = `100%`;
  }
}

setInterval(updateServerProgressBar, 1000);

async function runFunctionsSequentially() {
  await sendFingerprint();
  generateRequiredCanvasFingerprints(GlobalfingerprintHash);
  sendFingerprintToServer();
}

runFunctionsSequentially();
