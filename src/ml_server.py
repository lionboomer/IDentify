from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import base64
from PIL import Image
from io import BytesIO
import logging
from logging.config import dictConfig
from tensorflow.keras.utils import img_to_array
import os

app = Flask(__name__)

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

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        app.logger.debug(f"Received data: {{'username': {data.get('username')}, 'fingerprint': {data.get('fingerprint')}}}")
        fingerprint = data.get('fingerprint')
        username = data.get('username')

        if not fingerprint or not username:
            app.logger.error("Missing fingerprint or username in request.")
            return jsonify({'error': 'Missing fingerprint or username'}), 400

        app.logger.info(f"Processing prediction for username: {username}")

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

        # Debugging: Aktuelles Arbeitsverzeichnis ausgeben
        current_directory = os.getcwd()
        app.logger.debug(f"Current working directory: {current_directory}")

        # Modell laden
        model_path = f'SWAT_auth/models/{username}_fingerprint_model.h5'
        app.logger.debug(f"Loading model from path: {model_path}")
        model = tf.keras.models.load_model(model_path, compile=False)

        # Vorhersage treffen
        app.logger.debug("Making prediction...")
        prediction = model.predict(input_data)
        result = float(prediction[0][0])
        app.logger.info(f"Prediction made successfully: {result}")
        return jsonify({'prediction': result})

    except Exception as e:
        app.logger.error(f"Unexpected error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)