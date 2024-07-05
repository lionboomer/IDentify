from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import base64
from PIL import Image
from io import BytesIO
import os

app = Flask(__name__)

@app.route('/status', methods=['GET'])
def status():
    return jsonify({'status': 'ML server is running'}), 200

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        fingerprint = data.get('fingerprint')
        username = data.get('username')
        if not fingerprint or not username:
            return jsonify({'error': 'Missing fingerprint or username'}), 400

        if isinstance(fingerprint, str):
            fingerprint_data = fingerprint.split(",")[1]
            decoded = base64.b64decode(fingerprint_data)
            img = Image.open(BytesIO(decoded))
            img_array = np.array(img) / 255.0  # Normalize to [0, 1]
            input_data = tf.image.resize(img_array, [35, 280])
            input_data = np.expand_dims(input_data, axis=0)
        else:
            raise ValueError("Fingerprint is not a string")

        input_data = tf.convert_to_tensor(input_data, dtype=tf.float32)

        model_paths = [f'models/{username}_fingerprint_model_{i}.h5' for i in range(6)]
        models = [tf.keras.models.load_model(model_path, compile=False) for model_path in model_paths]

        predictions = [model.predict(input_data)[0][0] for model in models]
        average_prediction = np.mean(predictions)
        majority_vote = np.round(np.mean(predictions))

        return jsonify({
            'average_prediction': float(average_prediction),
            'majority_vote': int(majority_vote),
            'individual_predictions': [float(pred) for pred in predictions]
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)