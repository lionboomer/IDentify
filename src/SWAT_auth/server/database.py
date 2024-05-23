import pymongo
import base64
import numpy as np
from PIL import Image
from io import BytesIO

# MongoDB Verbindung
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client['fingerprintDB']
collection = db['fingerprints']

# Funktion zur Extraktion und Verarbeitung der Canvas-Daten
def get_canvas_data(user_id):
    user_data = collection.find_one({"_id": pymongo.ObjectId(user_id)})
    canvases = user_data['canvases']
    images = []
    for canvas in canvases:
        img_data = base64.b64decode(canvas.split(",")[1])
        img = Image.open(BytesIO(img_data))
        img = img.resize((280, 35))  # Bildgröße anpassen
        img_array = np.array(img)
        images.append(img_array)
    return np.array(images)
