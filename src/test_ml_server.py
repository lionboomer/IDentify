import numpy as np
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import base64
import requests

# Funktion zum Erstellen eines Canvas-Bildes aus einem String
def generate_random_canvas(txt):
    canvas = Image.new('RGBA', (280, 35), (255, 255, 255, 0))
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype("arial.ttf", 18)
    draw.text((2, 15), txt, font=font, fill="#069")
    draw.text((4, 19), txt, font=font, fill=(102, 204, 0, 179))  # Use RGBA tuple
    draw.text((2, 23), txt, font=font, fill="#069")
    draw.text((4, 27), txt, font=font, fill=(102, 204, 0, 179))  # Use RGBA tuple
    draw.text((2, 31), txt, font=font, fill="#069")
    draw.text((4, 35), txt, font=font, fill=(102, 204, 0, 179))  # Use RGBA tuple
    buffered = BytesIO()
    canvas.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_str}"

# Beispiel-String
example_string = "example text"
canvas_image = generate_random_canvas(example_string)

# Sende die Anfrage an das Backend
url = 'http://127.0.0.1:5000/predict'
fingerprint_hash = "1e19ea18d40fa0216127e9a8aebd7c312a4739e80d34a1b6a3dc096fd034ce55"  # Beispiel-Hash
username = "username_1"  # Beispiel-Username
response = requests.post(url, json={'fingerprint': canvas_image, 'fingerprintHash': fingerprint_hash, 'username': username})

# Antwort anzeigen
print(response.json())