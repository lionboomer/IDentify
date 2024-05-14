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

- [x] Machine Learning for Cybersecurity: [ACM](https://dl.acm.org/doi/abs/10.1145/3386040?casa_token=027mVneiDnwAAAAA:MnDDy8r-IfQwmX69w4iuJZQo2Ow8EG__mWksXG2W5ttQ-ycGeb3PHSP2qTlpCTNmQCxo8LyT4eU)
- [ ] [Web-based Fingerprinting Techniques](https://www.scitepress.org/PublishedPapers/2016/59656/59656.pdf)  
  Bernardo V. and Domingos D. (2016). In Proceedings of the 13th International Joint Conference on e-Business and Telecommunications - Volume 4: SECRYPT, (ICETE 2016) ISBN 978-989-758-196-0, pages 271-282. DOI: [10.5220/0005965602710282](https://doi.org/10.5220/0005965602710282)
- [x] [SWAT: Seamless Web Authentication Technology](https://dl.acm.org/doi/10.1145/3308558.3313637)  
  Authors: Florentin Rochet, Kyriakos Efthymiadis, FranÃ§ois Koeune, Olivier Pereira  
  WWW '19: The World Wide Web Conference, May 2019, Pages 1579–1589. DOI: [10.1145/3308558.3313637](https://doi.org/10.1145/3308558.3313637)
- [ ] [Device fingerprinting for augmenting web authentication: classification and analysis of methods](https://dl.acm.org/doi/10.1145/2991079.2991091)  
  Authors: Furkan Alaca, P. C. van Oorschot  
  ACSAC '16: Proceedings of the 32nd Annual Conference on Computer Security Applications, December 2016, Pages 289–301. DOI: [10.1145/2991079.2991091](https://doi.org/10.1145/2991079.2991091)
- [x] [Browser Fingerprinting: A survey](https://arxiv.org/abs/1905.01051)  
  Pierre Laperdrix, Nataliia Bielova, Benoit Baudry, Gildas Avoine  
  Subjects: Cryptography and Security (cs.CR); Computers and Society (cs.CY); Software Engineering (cs.SE)  
  DOI: [10.48550/arXiv.1905.01051](https://doi.org/10.48550/arXiv.1905.01051)



## Time Schedule

- [x] Read Literature until 24th of May
- [ ] Complete implementation of JavaScript data collection module: by 10th of April
- [ ] Build and train machine learning models: by 15th June
- [ ] Develop AI-based anomaly detection system: by 30th June
