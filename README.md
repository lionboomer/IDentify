# IDentify: Strengthening Web Application Security

Welcome to IDentify, a project aimed at enhancing web application security through innovative machine learning-powered device fingerprinting techniques.

## Introduction

IDentify leverages machine learning algorithms to bolster the security of web applications by identifying and tracking individual devices through device fingerprinting. This README provides an overview of the project, its objectives, methodology, expected outcomes, and more.

## Objectives

The primary objectives of IDentify are:
- Design and implement a JavaScript-based data collection module to gather comprehensive device attributes.
- Build machine learning models to refine device fingerprinting accuracy and reduce false positives.
- Develop an AI-based anomaly detection system to flag suspicious changes in device fingerprints, potentially indicating malicious activity.

## Methodology

IDentify employs a comprehensive methodology that includes:
- JavaScript implementation for data collection, capturing WebGL properties, canvas fingerprinting, browser features, font detection, CPU and hardware specifications, and behavioral patterns.
- Integration of machine learning models for classification and anomaly detection.
- Security and privacy considerations such as transparency, data minimization, secure storage and handling, and compliance with relevant regulations.

## Expected Outcomes and Impact

The expected outcomes and impact of IDentify include:
- Enhanced security by strengthening user identification beyond conventional authentication methods.
- Fraud prevention by making it harder to spoof or impersonate legitimate devices.
- Improved user experience through potential reduction of friction in authentication processes for known and trusted devices.

## Getting Started

- `starter.py`: Dieses Python-Skript verwaltet den Docker-Container, in dem der Node.js-Server läuft. Es kann den Container erstellen, starten, stoppen und den Status überprüfen.

- `Dockerfile`: Dies ist das Dockerfile für den Docker-Container. Es erstellt ein Image basierend auf dem offiziellen Node.js-Image, kopiert die Anwendungsdateien in den Container und startet den Server, wenn der Container gestartet wird.

- `app.js`: Dies ist der Hauptcode für den Node.js-Server. Es definiert einen einfachen Express-Server, der statische Dateien aus dem `public`-Verzeichnis ausliefert und ein Skript ausführt, wenn auf die Hauptseite zugegriffen wird.

- `evaluate.js`: Dieses JavaScript-Datei verwendet Puppeteer, um einen Webseitenzugriff zu simulieren. Es setzt den User-Agent und den Viewport des Browsers und greift auf die Webseite zu.

- `fingerprint.js`: Dieses JavaScript-Datei sammelt Daten für die Browser-Fingerprinting-Analyse. Es sammelt Daten von WebGL, Canvas und dem Browser selbst und speichert sie in einer Datei.

## Anforderungen

- Python 3
- Docker
- Node.js

## Verwendung

1. Stellen Sie sicher, dass Sie Docker auf Ihrem System installiert haben.
2. Führen Sie `python starter.py start` aus, um den Docker-Container zu erstellen und zu starten.
3. Der Server sollte jetzt laufen und auf `http://localhost:3000` erreichbar sein.
4. Sie können `python starter.py stop` ausführen, um den Docker-Container zu stoppen.

## Hinweise

- Der Docker-Container verwendet Port 3000. Stellen Sie sicher, dass dieser Port auf Ihrem System verfügbar ist.
- Die gesammelten Fingerprinting-Daten werden in der Datei `fingerprint.log` gespeichert.

## License

IDentify is licensed under nothing yet.

## Contact

For questions or inquiries about IDentify, please contact [lion.witte@kobil.com](mailto:lion.witte@kobil.com).

## Literature Review

- [ ] Survey on Device Fingerprinting Techniques: [IEEE](https://ieeexplore.ieee.org/abstract/document/9519502)
- [ ] Survey on Device Fingerprinting Techniques: [arXiv](https://arxiv.org/abs/1905.01051)
- [ ] Machine Learning for Cybersecurity: [ACM](https://dl.acm.org/doi/abs/10.1145/3386040?casa_token=027mVneiDnwAAAAA:MnDDy8r-IfQwmX69w4iuJZQo2Ow8EG__mWksXG2W5ttQ-ycGeb3PHSP2qTlpCTNmQCxo8LyT4eM)
- [ ] Enhancing Cybersecurity with Machine Learning: [Emerald Insight](https://www.emerald.com/insight/content/doi/10.1108/JIC-04-2019-0067/full/html?casa_token=3GomGpyTYG0AAAAA:DHZzDpRn-wGuWNLt6pk3fVKcwCiIwjrgQoM7Dp67g5MjAnCTE68ub8E5oOKQzu5U-FTp5cOHk6XUG6C5Gjf0G08KcNUqK8GSSBlGjpPtKj8Ztih1Og)
- [ ] Advances in Machine Learning for Cybersecurity: [ACM](https://dl.acm.org/doi/abs/10.1145/3243734.3243768)
- [ ] Machine Learning Techniques for Security: [IEEE](https://ieeexplore.ieee.org/abstract/document/10431413)

## Time Schedule

- [ ] Read Literature until 24th of May
- [ ] Complete implementation of JavaScript data collection module: by 10th of April
- [ ] Build and train machine learning models: by 15th June
- [ ] Develop AI-based anomaly detection system: by 30th June
