# Verwende ein Basis-Image mit Miniconda
FROM continuumio/miniconda3

# Erstelle ein Arbeitsverzeichnis
WORKDIR /usr/src/app

# Kopiere die environment.yml-Datei
COPY environment.yml .

# Erstelle das Conda-Environment
RUN conda env create -f environment.yml

# Stelle sicher, dass das Conda-Environment aktiviert wird
SHELL ["conda", "run", "-n", "myenv", "/bin/bash", "-c"]

# Kopiere den Rest des Anwendungs-Codes
COPY . .

# Exponiere den Port für die Anwendung
EXPOSE 3000

# Starten Sie die Anwendung
CMD ["conda", "run", "--no-capture-output", "-n", "myenv", "python", "app.py"]