# 🎉 IDentify: Revolutionizing Web Application Security with Canvas Fingerprinting 🎨

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

    3. Öffne deinen Browser und gehe zu [`http://localhost:3000`](http://localhost:3000).

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
        node src/app.js
        python src/ml_server.py
        ```

    6. Öffne deinen Browser und gehe zu [`http://localhost:3000`](http://localhost:3000).

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
        node src/app.js
        python src/ml_server.py
        ```

    6. Öffne deinen Browser und gehe zu [`http://localhost:3000`](http://localhost:3000).

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
        node src/app.js
        python src/ml_server.py
        ```

    7. Öffne deinen Browser und gehe zu [`http://localhost:3000`](http://localhost:3000).
   

   ## If you encounter any issues during the installation, please contact me via Email or LinkedIn. I will be happy to help you. 🤝