# 🎉 IDentify: Revolutionizing Web Application Security with Canvas Fingerprinting 🎨

Welcome to **IDentify**! This project enhances web application security by leveraging Canvas Fingerprinting and machine learning. It is based on my Master's thesis, available in two formats:

- 📄 [IEEE Standard Version](./docs/Documents/M_Sc_IDentify_IEEEF_LionWitte_675382.pdf)
- 📄 [Article Style Version](./docs/Documents/M_Sc_IDentify_ArticleF_LionWitte_675382.pdf)

## 📁 Project Structure

```
IDentify/
├── 📄 README.md                    # German documentation
├── 📄 README_EN.md                 # This file (English)
├── 🐳 docker-compose.yml           # Multi-service Docker setup
├── 🐳 Dockerfile.app              # Web application container
├── 🐳 Dockerfile.ml               # Machine learning server container
├── 📦 package.json                # Node.js dependencies
├── 🐍 requirements.txt             # Python dependencies
├── 🐍 environment.yml              # Conda environment
├── 📊 Database/                    # Database scripts and configurations
├── 📚 docs/                       # All documentation and research papers
├── 🤖 ml/                         # Machine learning code and models
│   ├── notebooks/
│   │   ├── current/               # Active development notebooks
│   │   └── archived/              # Older/obsolete notebooks
│   ├── docker/                    # ML-specific Docker configurations
│   └── requirements.txt           # ML-specific Python dependencies
├── 🔧 Scripts/                    # Utility and setup scripts
└── 💻 src/                       # Main application source code
```

## 🌟 Introduction

**IDentify** uses the HTML5 canvas element to generate unique digital fingerprints. This technique complements traditional authentication methods while improving user experience.

## 🥅 Objectives

- **Implementation** of a system to capture canvas fingerprints
- **Optimization** of machine learning models for user recognition
- **Extension** through additional fingerprinting techniques

## 🔧 Technologies

- **Frontend:** HTML5, JavaScript
- **Backend:** Node.js, Express.js
- **Machine Learning:** TensorFlow, PyTorch
- **Database:** MongoDB

## 🚀 Results

- Successful implementation of a system for user recognition
- Training and evaluation of six machine learning models (e.g., CNNs, Autoencoders)
- Challenges: Improvements needed for cross-session recognition

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/lionboomer/IDentify.git
   cd IDentify
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Web App: http://localhost:3000
   - ML Server: http://localhost:5000
   - MongoDB: mongodb://localhost:27018

### Manual Setup

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Set up Python environment:**
   ```bash
   conda env create -f environment.yml
   conda activate myenv
   ```

3. **Start MongoDB:**
   ```bash
   # Install and start MongoDB locally
   ```

4. **Run services:**
   ```bash
   # Terminal 1: Web App
   npm start

   # Terminal 2: ML Server  
   conda activate myenv
   python src/ml_server.py
   ```

## 🔮 Further Information

For detailed insights into methodology, results, and future work, refer to the [Master's Thesis (PDF)](./docs/Documents/M_Sc_IDentify_IEEEF_LionWitte_675382.pdf) or [Article Style Version (PDF)](./docs/Documents/M_Sc_IDentify_ArticleF_LionWitte_675382.pdf).

📂 Additionally, you can find more details about me and my professional background here: [Lion Witte](./docs/Info_Lion.md).

---

## 📬 Contact

For inquiries or further information: [lion.witte@kobil.com](mailto:lion@witte-maler.de)