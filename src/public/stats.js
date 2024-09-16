// Bearbeite das Formular-Submit-Event
document.getElementById('user-stats-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const username = document.getElementById('stats-username').value;
  const statsContainer = document.getElementById('stats-container');
  const statsContent = document.getElementById('stats-content');
  const statsUsernameDisplay = document.getElementById('stats-username-display');
  const canvasDropdown = document.getElementById('canvas-dropdown');
  const canvasDisplay = document.getElementById('canvas-display');

  // Statistiken vom Server abrufen
  const response = await fetch(`/user-stats?username=${encodeURIComponent(username)}`);
  if (!response.ok) {
    const errorData = await response.json();
    alert(errorData.error || 'Fehler beim Abrufen der Statistiken');
    return;
  }
  const data = await response.json();

  // Statistiken anzeigen
  statsUsernameDisplay.textContent = username;
  statsContent.innerHTML = `
    <p>Anzahl der Fingerabdrücke: ${data.fingerprintCount}</p>
    <p>Letzte Aktivität: ${data.lastActivity}</p>
    <p>Gerätename: ${data.deviceName}</p>
    <p>Betriebssystem: ${data.operatingSystem}</p>
  `;

  // Canvas-Dropdown befüllen
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