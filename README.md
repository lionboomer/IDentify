# 🎉 IDentify: Revolutionierung der Webanwendungssicherheit durch Canvas Fingerprinting 🎨

**🇬🇧 English Version:** [README_EN.md](./README_EN.md)

Willkommen bei **IDentify**! Dieses Projekt verbessert die Sicherheit von Webanwendungen durch den Einsatz von Canvas Fingerprinting und Machine Learning. Es basiert auf meiner Masterarbeit, die in zwei Formaten verfügbar ist:

- 📄 [IEEE-Standardversion](./docs/Documents/M_Sc_IDentify_IEEEF_LionWitte_675382.pdf)
- 📄 [Artikelstil-Version](./docs/Documents/M_Sc_IDentify_ArticleF_LionWitte_675382.pdf)

## 📁 Projektstruktur

```
IDentify/
├── 📄 README.md                    # Diese Datei (Deutsch)
├── 📄 README_EN.md                 # Englische Dokumentation
├── 🐳 docker-compose.yml           # Multi-Service Docker Setup
├── 🐳 Dockerfile.app              # Web-Anwendungs-Container
├── 🐳 Dockerfile.ml               # Machine Learning Server Container
├── 📦 package.json                # Node.js Abhängigkeiten
├── 🐍 requirements.txt             # Python Abhängigkeiten
├── 🐍 environment.yml              # Conda Umgebung
├── 📊 Database/                    # Datenbank-Skripte und Konfigurationen
├── 📚 docs/                       # Alle Dokumentationen und Forschungsarbeiten
├── 🤖 ml/                         # Machine Learning Code und Modelle
│   ├── notebooks/
│   │   ├── current/               # Aktive Entwicklungsnotebooks
│   │   └── archived/              # Ältere/veraltete Notebooks
│   ├── docker/                    # ML-spezifische Docker-Konfigurationen
│   └── requirements.txt           # ML-spezifische Python-Abhängigkeiten
├── 🔧 Scripts/                    # Hilfsskripte und Setup-Skripte
└── 💻 src/                       # Hauptanwendungs-Quellcode
```

---

## 🌟 Einführung

**IDentify** nutzt das HTML5-Canvas-Element, um einzigartige digitale Fingerabdrücke zu erstellen. Diese Technik ergänzt traditionelle Authentifizierungsmethoden und verbessert die Benutzerfreundlichkeit.

## 🥅 Ziele

- **Implementierung** eines Systems zur Erfassung von Canvas-Fingerprints
- **Optimierung** von Machine-Learning-Modellen zur Benutzererkennung
- **Erweiterung** durch zusätzliche Fingerprinting-Techniken

## 🔧 Technologien

- **Frontend:** HTML5, JavaScript
- **Backend:** Node.js, Express.js
- **Machine Learning:** TensorFlow, PyTorch
- **Datenbank:** MongoDB

## 🚀 Ergebnisse

- Erfolgreiche Implementierung eines Systems zur Benutzererkennung
- Training und Evaluierung von sechs Machine-Learning-Modellen (z. B. CNNs, Autoencoder)
- Herausforderungen: Verbesserungsbedarf bei der Wiedererkennung über mehrere Sitzungen hinweg

## 🚀 Schnellstart

### Docker verwenden (Empfohlen)

1. **Repository klonen:**
   ```bash
   git clone https://github.com/lionboomer/IDentify.git
   cd IDentify
   ```

2. **Alle Services starten:**
   ```bash
   docker-compose up -d
   ```

3. **Anwendung aufrufen:**
   - Web App: http://localhost:3000
   - ML Server: http://localhost:5000
   - MongoDB: mongodb://localhost:27018

### Manuelle Installation

1. **Node.js Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

2. **Python-Umgebung einrichten:**
   ```bash
   conda env create -f environment.yml
   conda activate myenv
   ```

3. **MongoDB starten:**
   ```bash
   # MongoDB lokal installieren und starten
   ```

4. **Services ausführen:**
   ```bash
   # Terminal 1: Web App
   npm start

   # Terminal 2: ML Server  
   conda activate myenv
   python src/ml_server.py
   ```

## 📖 Weitere Informationen

Für detaillierte Einblicke in Methodik, Ergebnisse und zukünftige Arbeiten lies die [Masterarbeit (PDF)](./docs/Documents/M_Sc_IDentify_IEEEF_LionWitte_675382.pdf) oder [Artikelstil-Version (PDF)](./docs/Documents/M_Sc_IDentify_ArticleF_LionWitte_675382.pdf).

📂 Zusätzlich findest du weitere Details zu mir und meinem beruflichen Hintergrund hier: [Lion Witte](./docs/Info_Lion.md).

---

## 📬 Kontakt

Für Fragen oder weitere Informationen: [lion.witte@kobil.com](mailto:lion@witte-maler.de)
