from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import pymongo
from pymongo import MongoClient
import base64
import numpy as np
from PIL import Image
from io import BytesIO
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
import os
import sys
import threading
import logging
import eventlet

# Flask-Anwendung konfigurieren
app = Flask(__name__)
CORS(app)  # CORS für alle Routen aktivieren
socketio = SocketIO(app, cors_allowed_origins="*")

# Verbindung zu MongoDB herstellen
client = MongoClient("mongodb://localhost:27017/")
db = client["fingerprintDB"]
collection = db["fingerprints"]

# Funktion zum Dekodieren von Base64-Bildern
def decode_base64_image(base64_string):
    try:
        base64_data = base64_string.split(",")[1]
        byte_data = base64.b64decode(base64_data)
        image_data = BytesIO(byte_data)
        image = Image.open(image_data)
        return np.array(image)
    except (IndexError, ValueError) as e:
        raise ValueError("Invalid base64 string format") from e

# Funktion zum Abrufen der Canvases
def get_canvases(data):
    if "canvases" not in data or not isinstance(data["canvases"], list):
        raise ValueError("Invalid data format: 'canvases' key is missing or not a list")
    return [decode_base64_image(canvas) for canvas in data["canvases"]]

# CNN-Modelle erstellen
def create_model_1(input_shape):
    model = Sequential()
    model.add(Conv2D(32, (3, 3), activation='relu', input_shape=input_shape))
    model.add(MaxPooling2D((2, 2)))
    model.add(Flatten())
    model.add(Dense(128, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))
    return model

def create_model_2(input_shape):
    model = Sequential()
    model.add(Conv2D(64, (3, 3), activation='relu', input_shape=input_shape))
    model.add(MaxPooling2D((2, 2)))
    model.add(Flatten())
    model.add(Dense(256, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))
    return model

def create_model_3(input_shape):
    model = Sequential()
    model.add(Conv2D(64, (3, 3), activation='relu', input_shape=input_shape))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(128, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Flatten())
    model.add(Dense(256, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))
    return model

def create_model_4(input_shape):
    model = Sequential()
    model.add(Conv2D(32, (3, 3), activation='relu', input_shape=input_shape))
    model.add(Conv2D(32, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(64, (3, 3), activation='relu'))
    model.add(Conv2D(64, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Flatten())
    model.add(Dense(512, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))
    return model

def create_model_5(input_shape):
    model = Sequential()
    model.add(Conv2D(64, (7, 7), activation='relu', input_shape=input_shape))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(128, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(256, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Flatten())
    model.add(Dense(512, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))
    return model

def create_model_6(input_shape):
    model = Sequential()
    model.add(Conv2D(32, (3, 3), activation='relu', input_shape=input_shape))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(64, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(128, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2, 2)))
    model.add(Flatten())
    model.add(Dense(256, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))
    return model

username = sys.argv[1]
model_paths = [f'models/{username}_fingerprint_model_{i}.h5' for i in range(6)]

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
    try:
        other_user_canvases = get_canvases(other_user)
        X_negative.extend(other_user_canvases)
        y_negative.extend([0] * len(other_user_canvases))
    except ValueError as e:
        print(f"Skipping user {other_user['username']} due to error: {e}")

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

# Daten normalisieren
X_train = X_train / 255.0
X_test = X_test / 255.0

# Modelle erstellen und trainieren
input_shape = X_train.shape[1:]
models = [
    create_model_1(input_shape),
    create_model_2(input_shape),
    create_model_3(input_shape),
    create_model_4(input_shape),
    create_model_5(input_shape),
    create_model_6(input_shape)
]

model_names = ['Model 1', 'Model 2', 'Model 3', 'Model 4', 'Model 5', 'Model 6']

from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

# Callbacks
early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

# Modelle nacheinander trainieren und bewerten
results = []
for i, (model, name) in enumerate(zip(models, model_names), start=1):
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    model_checkpoint = ModelCheckpoint(f'models/{username}_{i}.h5', save_best_only=False, monitor='val_accuracy', mode='max')
    history = model.fit(X_train, y_train, epochs=50, batch_size=8, validation_data=(X_test, y_test), callbacks=[early_stopping, model_checkpoint])
    loss, accuracy = model.evaluate(X_test, y_test)
    print(f"{name} - Test Loss: {loss}")
    print(f"{name} - Test Accuracy: {accuracy}")
    results.append({'Model': name, 'Accuracy': accuracy})

# Globale Variablen für den Trainingsfortschritt
training_progress = 0
total_epochs = 50

# Logging konfigurieren
logging.basicConfig(filename='training.log', level=logging.INFO, format='%(asctime)s - %(message)s')

# Callback-Klasse für den Trainingsfortschritt
class TrainingProgressCallback(tf.keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs=None):
        global training_progress
        training_progress = (epoch + 1) / total_epochs * 100
        message = f"Epoch {epoch + 1}/{total_epochs} - Progress: {training_progress:.2f}%"
        logging.info(message)
        print(message)
        socketio.emit('progress', {'progress': training_progress, 'message': message})

    def on_batch_end(self, batch, logs=None):
        global training_progress
        progress_increment = 1 / (total_epochs * len(X_train) / 32) * 100
        training_progress += progress_increment
        message = f"Batch {batch} - Progress: {training_progress:.2f}%"
        logging.info(message)
        print(message)
        socketio.emit('progress', {'progress': training_progress, 'message': message})

# Trainingsfunktion
def train_model():
    for model in models:
        model.fit(X_train, y_train, epochs=total_epochs, batch_size=32, validation_data=(X_test, y_test), callbacks=[TrainingProgressCallback()])
    try:
        for i, model in enumerate(models):
            model.save(model_paths[i])
            message = f"Model {i+1} for {username} saved successfully at {model_paths[i]}"
            logging.info(message)
            print(message)
            socketio.emit('progress', {'progress': 100, 'message': message})
    except Exception as e:
        message = f"An error occurred while saving the model for {username}: {str(e)}"
        logging.error(message)
        print(message)
        socketio.emit('progress', {'progress': training_progress, 'message': message})

# Klasse für die Umleitung der Standardausgabe
class StreamToSocketIO:
    def __init__(self):
        self.line = ''
        self.logs = []

    def write(self, buffer):
        self.line += buffer
        if buffer.endswith('\n'):
            self.logs.append(self.line)  # Logs speichern
            socketio.emit('log_message', {'data': self.line})
            self.line = ''

    def flush(self):
        pass

    def get_logs(self):
        return self.logs

# Instanz von StreamToSocketIO erstellen
stream_to_socketio = StreamToSocketIO()
sys.stdout = stream_to_socketio

# Endpunkt für den Trainingsfortschritt
@app.route('/training-progress', methods=['GET'])
def get_training_progress():
    return jsonify({'progress': training_progress}), 200

# Endpunkt für Konsolenmeldungen
@app.route('/console-logs', methods=['GET'])
def get_console_logs():
    logs = stream_to_socketio.get_logs()  # Logs aus StreamToSocketIO abrufen
    return jsonify({'logs': logs}), 200

# Starten des Trainings in einem separaten Thread
training_thread = threading.Thread(target=train_model)
training_thread.start()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001)