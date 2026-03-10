# IDentify

Canvas-based device fingerprinting with a Node.js web application, a Python ML inference service, and MongoDB. This repository documents the implementation that accompanied my Master's thesis in Applied Computer Science with a focus on network security.

## Scope

IDentify explores whether browser-generated canvas fingerprints can be combined with machine learning to support user recognition. The repository includes:
- a browser client for fingerprint collection
- an Express-based API for persistence and orchestration
- a Flask-based ML service for prediction
- research notebooks and thesis material used during the evaluation phase

## Repository Structure

```text
IDentify/
|- src/                    Main application code
|  |- app.js               Express server
|  |- ml_server.py         Flask ML API
|  |- public/              Frontend assets
|  |- SWAT_auth/           Model training scripts and legacy experiments
|- ml/                     Notebook-based research and ML setup
|  |- notebooks/current/   Current notebooks
|  |- notebooks/archived/  Historical experiments kept for reference
|- Database/               Database-related legacy scripts
|- docs/                   Installation notes and thesis documents
|- Scripts/                Helper scripts
|- docker-compose.yml      Local multi-service setup
```

## Quick Start

### Option 1: Docker Compose

```bash
docker-compose up --build
```

Available services after startup:
- Web application: `http://localhost:3000`
- ML service: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27018`

### Option 2: Manual Development Setup

1. Install Node.js dependencies:
   ```bash
   npm install
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start MongoDB locally.
4. Start the web server:
   ```bash
   npm run dev
   ```
5. Start the ML server in a second terminal:
   ```bash
   python src/ml_server.py
   ```

## Configuration

The application can be configured via environment variables. Copy `.env.example` to a local `.env` file if needed.

Important variables:
- `PORT`: Express application port, default `3000`
- `MONGO_URI`: MongoDB connection string
- `ML_SERVER_URL`: URL of the Flask prediction service
- `HTTP_PORT`: optional extra HTTP listener
- `HTTPS_PORT`: optional HTTPS listener
- `TLS_KEY_PATH` and `TLS_CERT_PATH`: optional TLS certificate paths for local HTTPS

By default, the repository does not require committed certificates. HTTPS is only enabled when explicit certificate paths are provided.

## Thesis Material

The following thesis documents are included for reference:
- [IEEE version](./docs/Documents/M_Sc_IDentify_IEEEF_LionWitte_675382.pdf)
- [Article version](./docs/Documents/M_Sc_IDentify_ArticleF_LionWitte_675382.pdf)

## Notes on Research Code

This repository contains both application code and research artefacts. Historical notebooks are intentionally retained to document the evolution of the thesis work, but they should be treated as research material rather than production-ready modules.

## Security and Publishing Notes

Before publishing or mirroring the repository:
- do not commit `.env` files, certificates, model artefacts, or generated datasets
- rotate any credentials or certificates that were previously stored in the repository
- review Git history for sensitive files, because removing a file from the current tree does not remove it from past commits

## Additional Documentation

- [Installation notes](./docs/Installation.md)
- [Project goals](./docs/Goals.md)
- [Master thesis goals](./docs/Masterarbeit_Ziele.md)
