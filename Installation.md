# 🎉 IDentify: Revolutionizing Web Application Security with Canvas Fingerprinting 🎨

Willkommen bei **IDentify**! Dieses Projekt hat erfolgreich die Sicherheit von Webanwendungen durch die Implementierung und Optimierung der Canvas Fingerprinting-Technik verbessert. Es bildet die Grundlage meiner Masterarbeit, die sich darauf konzentriert, die Modelle und Techniken weiter zu verfeinern und zu erweitern.

## 🌟 Einführung

In der digitalen Welt von heute ist die sichere Authentifizierung von Benutzern entscheidend. Traditionelle Methoden wie Passwörter sind oft unsicher und umständlich. **IDentify** bietet eine innovative Lösung durch die Nutzung von Canvas Fingerprinting, um einzigartige digitale Fingerabdrücke zu erstellen und die Benutzererfahrung zu verbessern.

## 🥅 Ziele

Die Hauptziele des Projekts waren:
- **Implementierung** der Canvas Fingerprinting-Technik zur sicheren Benutzeridentifikation.
- **Optimierung** der Machine Learning-Modelle zur Verbesserung der Erkennungsgenauigkeit.
- **Erweiterung** der Technik durch Integration zusätzlicher Fingerprinting-Methoden.

## 🔧 Methodik

- **Canvas Fingerprinting**: Nutzung des HTML5 Canvas-Elements zur Erstellung einzigartiger Fingerabdrücke.
- **Machine Learning-Modelle**: Entwicklung und Training von sechs Modellen zur zuverlässigen Klassifikation von Fingerabdrücken.
- **Mehrheitsabstimmung**: Einsatz einer Mehrheitsabstimmung zur Verbesserung der Modellgenauigkeit.

## 🚀 Ergebnisse und Auswirkungen

- **Erfolgreiche Implementierung**: Die Technik funktioniert wie erwartet und ermöglicht die Identifikation von Geräten basierend auf spezifischen Hardware- und Softwarekonfigurationen.
- **Herausforderungen**: Modelle haben Schwierigkeiten, denselben Nutzer über verschiedene Sitzungen hinweg zu erkennen, was auf die Notwendigkeit weiterer Optimierung hinweist.
- **Zukunftspotenzial**: Canvas Fingerprinting bietet eine vielversprechende Methode zur Verbesserung der Sicherheit und Benutzerfreundlichkeit von Authentifizierungssystemen.

## 🔮 Zukünftige Arbeiten

Die zukünftigen Arbeiten im Rahmen meiner Masterarbeit konzentrieren sich auf die Optimierung und Erweiterung der bestehenden Techniken. Weitere Details findest du in der [Masterarbeit-Ziele](Masterarbeit_Ziele.md) Datei.

## 📬 Kontakt

Für Fragen oder weitere Informationen über IDentify, kontaktieren Sie bitte [lion.witte@kobil.com](mailto:lion.witte@kobil.com).

## 🛠️ Installation

### 🐳 Docker-Installation

1. **Voraussetzungen**:
    - Docker
    - Docker Compose

2. **Schritte**:
    1. Klone das Repository:
        ```sh
        git clone https://github.com/username/IDentify.git
        cd IDentify
        ```

    2. Erstelle und starte die Docker-Container:
        ```sh
        docker-compose up --build
        ```

    3. Öffne deinen Browser und gehe zu [`http://localhost:3000`].

### 🖥️ Manuelle Installation

#### 🐧 Linux

1. **Voraussetzungen**:
    - Python 3.8+
    - Node.js 14+
    - MongoDB

2. **Schritte**:
    1. Klone das Repository:
        ```sh
        git clone https://github.com/username/IDentify.git
        cd IDentify
        ```

    2. Installiere die Python-Abhängigkeiten:
        ```sh
        pip install -r requirements.txt
        ```

    3. Installiere die Node.js-Abhängigkeiten:
        ```sh
        npm install
        ```

    4. Starte MongoDB:
        ```sh
        sudo systemctl start mongod
        ```

    5. Starte die Anwendung:
        ```sh
        python src/SWAT_auth/train_model.py
        ```

    6. Öffne deinen Browser und gehe zu [`http://localhost:3000`].

#### 🪟 Windows

1. **Voraussetzungen**:
    - Python 3.8+
    - Node.js 14+
    - MongoDB

2. **Schritte**:
    1. Klone das Repository:
        ```sh
        git clone https://github.com/username/IDentify.git
        cd IDentify
        ```

    2. Installiere die Python-Abhängigkeiten:
        ```sh
        pip install -r requirements.txt
        ```

    3. Installiere die Node.js-Abhängigkeiten:
        ```sh
        npm install
        ```

    4. Starte MongoDB:
        ```sh
        net start MongoDB
        ```

    5. Starte die Anwendung:
        ```sh
        python src/SWAT_auth/train_model.py
        ```

    6. Öffne deinen Browser und gehe zu [`http://localhost:3000`].

### 🐍 Installation mit Anaconda

1. **Voraussetzungen**:
    - Anaconda oder Miniconda

2. **Schritte**:
    1. Klone das Repository:
        ```sh
        git clone https://github.com/username/IDentify.git
        cd IDentify
        ```

    2. Erstelle eine neue Anaconda-Umgebung:
        ```sh
        conda create --name identify_env python=3.8
        conda activate identify_env
        ```

    3. Installiere die Python-Abhängigkeiten:
        ```sh
        pip install -r requirements.txt
        ```

    4. Installiere die Node.js-Abhängigkeiten:
        ```sh
        npm install
        ```

    5. Starte MongoDB:
        - Unter Linux:
            ```sh
            sudo systemctl start mongod
            ```
        - Unter Windows:
            ```sh
            net start MongoDB
            ```

    6. Starte die Anwendung:
        ```sh
        python src/SWAT_auth/train_model.py
        ```

    7. Öffne deinen Browser und gehe zu [`http://localhost:3000`](.

### 📤 Teilen der Anaconda-Umgebung

Um deine Anaconda-Umgebung zu teilen, kannst du eine `environment.yml` Datei erstellen:

1. Erstelle die `environment.yml` Datei:
    ```sh
    conda env export > environment.yml
    ```

2. Andere Benutzer können die Umgebung mit dieser Datei erstellen:
    ```sh
    conda env create -f environment.yml
    conda activate identify_env
    ```