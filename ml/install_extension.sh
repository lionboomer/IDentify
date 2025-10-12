#!/bin/bash
# Datei mit den Erweiterungen
extensions_file="extensions.txt"

# Überprüfen, ob die Datei existiert
if [[ ! -f "$extensions_file" ]]; then
  echo "Die Datei $extensions_file existiert nicht."
  exit 1
fi

# Erweiterungen aus der Datei installieren
while IFS= read -r extension; do
  # Überspringe leere Zeilen und Kommentare
  [[ -z "$extension" || "$extension" =~ ^# ]] && continue
  # Installiere die Erweiterung
  code --install-extension "$extension"
done < "$extensions_file"