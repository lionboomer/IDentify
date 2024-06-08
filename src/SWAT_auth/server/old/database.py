import pymongo
import base64
import numpy as np
from PIL import Image
from io import BytesIO

# Verbindung zur MongoDB herstellen
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["fingerprintDB"]
collection = db["fingerprints"]

# Daten abrufen
data = collection.find()

# Canvas-Bilder dekodieren und in numpy Arrays umwandeln
def decode_canvas(canvas_data):
    image_data = base64.b64decode(canvas_data.split(",")[1])
    image = Image.open(BytesIO(image_data))
    return np.array(image)

# Alle Canvas-Bilder dekodieren
canvases = []
labels = []
for record in data:
    for canvas in record["canvases"]:
        canvases.append(decode_canvas(canvas))
        labels.append(record["username"])

canvases = np.array(canvases)
labels = np.array(labels)
