from flask import Flask, request, jsonify
from flask_cors import CORS
import pymongo
from pymongo import MongoClient
import base64
import numpy as np
from PIL import Image
from io import BytesIO
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
import os
import sys
import threading

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Verbindung zu MongoDB herstellen
client = MongoClient("mongodb://localhost:27017/")
db = client["fingerprintDB"]
collection = db["fingerprints"]

# Funktion zum Dekodieren von Base64-Bildern
def decode_base64_image(base64_string):
    base64_data = base64_string.split(",")[1]
    byte_data = base64.b64decode(base64_data)
    image_data = BytesIO(byte_data)
    image = Image.open(image_data)
    return np.array(image)

# Funktion zum Abrufen der Canvases
def get_canvases(data):
    return [decode_base64_image(canvas) for canvas in data["canvases"]]

# CNN-Modell erstellen
def create_cnn_model(input_shape):
    model = Sequential()
    model.add(Conv2D(32, (3, 3), activation='relu', input_shape=input_shape))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(64, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Flatten())
    model.add(Dense(128, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))  # Binäre Klassifikation
    return model

# Benutzername aus den Argumenten abrufen
username = sys.argv[1]
model_path = f'models/{username}_fingerprint_model.h5'

# Überprüfen, ob das Modell bereits existiert
if os.path.exists(model_path):
    print(f"Model for {username} already exists at {model_path}")
    sys.exit(0)

print(f"Creating model for {username}")

# Positive Beispiele (Canvases des aktuellen Benutzers)
user = collection.find_one({"username": username})
if user is None:
    print(f"No user found with username {username}")
    sys.exit(1)

user_canvases = get_canvases(user)
X_positive = np.array(user_canvases)
y_positive = np.ones(len(X_positive))

# Negative Beispiele (Canvases der anderen Benutzer)
X_negative = []
y_negative = []

for other_user in collection.find({"username": {"$ne": username}}):
    other_user_canvases = get_canvases(other_user)
    X_negative.extend(other_user_canvases)
    y_negative.extend([0] * len(other_user_canvases))

# Zufällig 2500 negative Beispiele auswählen
if len(X_negative) > 2500:
    indices = np.random.choice(len(X_negative), 2500, replace=False)
    X_negative = np.array(X_negative)[indices]
    y_negative = np.array(y_negative)[indices]
else:
    X_negative = np.array(X_negative)
    y_negative = np.array(y_negative)

# Kombinieren der Daten
X = np.concatenate((X_positive, X_negative), axis=0)
y = np.concatenate((y_positive, y_negative), axis=0)

# Aufteilen der Daten in Trainings- und Testsets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Modell erstellen und trainieren
input_shape = X_train.shape[1:]
model = create_cnn_model(input_shape)
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Globale Variablen für den Trainingsfortschritt
training_progress = 0
total_epochs = 10

# Callback-Klasse für den Trainingsfortschritt
class TrainingProgressCallback(tf.keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs=None):
        global training_progress
        training_progress = (epoch + 1) / total_epochs * 100
        print(f"Epoch {epoch + 1}/{total_epochs} - Progress: {training_progress:.2f}%")

# Trainingsfunktion
def train_model():
    model.fit(X_train, y_train, epochs=total_epochs, batch_size=32, validation_data=(X_test, y_test), callbacks=[TrainingProgressCallback()])
    try:
        model.save(model_path)
        print(f"Model for {username} saved successfully at {model_path}")
    except Exception as e:
        print(f"An error occurred while saving the model for {username}: {str(e)}")

# Endpunkt für den Trainingsfortschritt
@app.route('/training-progress', methods=['GET'])
def get_training_progress():
    return jsonify({'progress': training_progress}), 200

# Endpunkt für Konsolenmeldungen
@app.route('/console-logs', methods=['GET'])
def get_console_logs():
    with open('training.log', 'r') as f:
        logs = f.read()
    return jsonify({'logs': logs}), 200

# Starten des Trainings in einem separaten Thread
training_thread = threading.Thread(target=train_model)
training_thread.start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
