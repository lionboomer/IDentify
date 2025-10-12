#!/bin/bash
start_time=$(date +%s)

# Überprüfen, ob MongoDB läuft
until mongosh --host localhost --eval "print(\"waited for connection\")"
do
    echo "Waiting for MongoDB to start..."
    sleep 2
done

# Importieren der fingerprints.json
echo "Starting import of fingerprints.json..."
mongoimport --host localhost --db fingerprintDB --collection fingerprints --type json --file /docker-entrypoint-initdb.d/fingerprintDB.fingerprints.json --jsonArray
if [ $? -eq 0 ]; then
  echo "Successfully imported fingerprints.json"
else
  echo "Failed to import fingerprints.json"
fi

# Importieren der canvassamples.json
echo "Starting import of canvassamples.json..."
mongoimport --host localhost --db fingerprintDB --collection canvassamples --type json --file /docker-entrypoint-initdb.d/fingerprintDB.canvassamples.json --jsonArray
if [ $? -eq 0 ]; then
  echo "Successfully imported canvassamples.json"
else
  echo "Failed to import canvassamples.json"
fi

end_time=$(date +%s)
total_elapsed_time=$((end_time - start_time))
echo "Total time elapsed for all imports: $total_elapsed_time seconds"