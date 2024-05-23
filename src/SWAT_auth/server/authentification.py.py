import numpy as np
from PIL import Image
from io import BytesIO
import base64
from model import load_model

def authenticate(user_id, new_canvases):
    model = load_model(user_id)
    new_images = []
    for canvas in new_canvases:
        img_data = base64.b64decode(canvas.split(",")[1])
        img = Image.open(BytesIO(img_data))
        img = img.resize((280, 35))
        img_array = np.array(img)
        new_images.append(img_array)
    new_images = np.array(new_images) / 255.0
    predictions = model.predict(new_images)
    return np.mean(predictions)
