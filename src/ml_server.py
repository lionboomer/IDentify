from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import base64
import logging
from logging.config import dictConfig
from tensorflow.keras.utils import img_to_array
from PIL import Image
from io import BytesIO

# Konfigurieren Sie das Logging
dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {'wsgi': {
        'class': 'logging.StreamHandler',
        'stream': 'ext://sys.stdout',
        'formatter': 'default'
    }},
    'root': {
        'level': 'DEBUG',
        'handlers': ['wsgi']
    }
})

app = Flask(__name__)

# Laden Sie das Modell
try:
    model = tf.keras.models.load_model('SWAT_auth/models/username_1_fingerprint_model.h5')
    app.logger.info("Model loaded successfully.")
except Exception as e:
    app.logger.error(f"Error loading model: {e}")
    raise

# Funktion zum Dekodieren von Base64-Bildern
def decode_base64_image(base64_string):
    byte_data = base64.b64decode(base64_string)
    image_data = BytesIO(byte_data)
    image = Image.open(image_data)
    return np.array(image)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        app.logger.debug(f"Received data: {data}")
        fingerprint = data.get('fingerprint')

        if not fingerprint:
            app.logger.error("Missing fingerprint in request.")
            return jsonify({'error': 'Missing fingerprint'}), 400

        if isinstance(fingerprint, str):
            # Remove the data URI prefix to extract raw base64 data
            fingerprint_data = fingerprint.split(",")[1]

            # Decode base64 to image
            decoded = base64.b64decode(fingerprint_data)
            img = Image.open(BytesIO(decoded))

            # Convert to NumPy array and preprocess (resizing, normalization)
            img_array = img_to_array(img) / 255.0  # Normalize to [0, 1]
            input_data = tf.image.resize(img_array, [35, 280])
            input_data = np.expand_dims(input_data, axis=0)
        else:
            raise ValueError("Fingerprint is not a string")

        # Convert to float32
        input_data = tf.convert_to_tensor(input_data, dtype=tf.float32)

        # Vorhersage treffen
        app.logger.debug("Making prediction...")
        prediction = model.predict(input_data)
        result = float(prediction[0][0])
        app.logger.info(f"Prediction made successfully: {result}")
        return jsonify({'prediction': result})

    except Exception as e:
        app.logger.error(f"Unexpected error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Fehlerbehandlung für 404 und 500 Fehler
@app.errorhandler(404)
def not_found_error(error):
    app.logger.error(f"404 error: {error}")
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f"500 error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
