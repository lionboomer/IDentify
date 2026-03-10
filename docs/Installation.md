# Installation

This document complements the main repository README with a slightly more detailed local setup.

## Requirements

- Node.js 18 or newer
- Python 3.10 or newer
- MongoDB
- Optional: Docker and Docker Compose for the containerized setup

## Local Setup

1. Install JavaScript dependencies.

```bash
npm install
```

2. Install Python dependencies.

```bash
pip install -r requirements.txt
```

3. Start MongoDB locally and make sure the connection string matches `MONGO_URI`.

4. Create a local `.env` file if you want to override defaults.

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/fingerprintDB
ML_SERVER_URL=http://127.0.0.1:5000
```

5. Start the Express application.

```bash
npm run dev
```

6. Start the Flask ML service in a second terminal.

```bash
python src/ml_server.py
```

## Optional HTTPS for Local Development

HTTPS is disabled by default. To enable it locally, point the application to certificate files outside the repository:

```env
TLS_KEY_PATH=C:/path/to/private-key.pem
TLS_CERT_PATH=C:/path/to/certificate.pem
HTTPS_PORT=443
```

## Docker Setup

```bash
docker-compose up --build
```

This starts the web app, ML service, and MongoDB with development-friendly defaults.
