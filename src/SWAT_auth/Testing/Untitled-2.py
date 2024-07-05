# %%
import numpy as np
from pymongo import MongoClient
from PIL import Image
from io import BytesIO
import base64
import imagehash
import random

# Verbindung zu MongoDB herstellen
client = MongoClient("mongodb://192.168.0.76:27017/")
db = client["fingerprintDB"]
collection = db["fingerprints"]

# Funktion zum Dekodieren von Base64-Bildern
def decode_base64_image(base64_string):
    if "," in base64_string:
        base64_data = base64_string.split(",")[1]
    else:
        raise ValueError("Invalid base64 string format")
    byte_data = base64.b64decode(base64_data)
    image_data = BytesIO(byte_data)
    image = Image.open(image_data)
    return image

# Funktion zum Abrufen der Canvases
def get_canvases(data):
    if "canvases" not in data or not isinstance(data["canvases"], list):
        raise ValueError("Invalid data format: 'canvases' key is missing or not a list")
    return [decode_base64_image(canvas) for canvas in data["canvases"]]

# Benutzername aus den Argumenten abrufen
username1 = "username_1"
username2 = "username_2"

# Positive Beispiele (Canvases des aktuellen Benutzers)
user1 = collection.find_one({"username": username1})
user2 = collection.find_one({"username": username2})

if user1 is None or user2 is None:
    print(f"One or both users not found: {username1}, {username2}")
    sys.exit(1)

# Abrufen der Canvases
user1_canvases = get_canvases(user1)
user2_canvases = get_canvases(user2)

# Zufällige Auswahl eines Canvas von jedem Benutzer für den Vergleich
image1 = random.choice(user1_canvases)
image2 = random.choice(user2_canvases)

# Generieren der Hashes
hash1 = imagehash.phash(image1)
hash2 = imagehash.phash(image2)

# Vergleichen der Hashes
hash_difference = hash1 - hash2

print(f"Hash for {username1}: {hash1}")
print(f"Hash for {username2}: {hash2}")
print(f"Hash difference: {hash_difference}")

# Bestimmen der Ähnlichkeit
if hash_difference == 0:
    print("The images are identical.")
else:
    print(f"The images are different with a hash difference of {hash_difference}.")


# %%
import numpy as np
from pymongo import MongoClient
from PIL import Image
from io import BytesIO
import base64
import imagehash

# Verbindung zu MongoDB herstellen
client = MongoClient("mongodb://192.168.0.76:27017/")
db = client["fingerprintDB"]
collection = db["fingerprints"]

# Funktion zum Dekodieren von Base64-Bildern
def decode_base64_image(base64_string):
    if "," in base64_string:
        base64_data = base64_string.split(",")[1]
    else:
        raise ValueError("Invalid base64 string format")
    byte_data = base64.b64decode(base64_data)
    image_data = BytesIO(byte_data)
    image = Image.open(image_data)
    return image

# Funktion zum Abrufen der Canvases
def get_canvases(data):
    if "canvases" not in data or not isinstance(data["canvases"], list):
        raise ValueError("Invalid data format: 'canvases' key is missing or not a list")
    return [decode_base64_image(canvas) for canvas in data["canvases"]]

# Benutzername aus den Argumenten abrufen
username1 = "username_1"
username2 = "username_2"

# Positive Beispiele (Canvases des aktuellen Benutzers)
user1 = collection.find_one({"username": username1})
user2 = collection.find_one({"username": username2})

if user1 is None or user2 is None:
    print(f"One or both users not found: {username1}, {username2}")
    sys.exit(1)

# Abrufen der Canvases
user1_canvases = get_canvases(user1)
user2_canvases = get_canvases(user2)

# Nehmen Sie das erste Canvas von jedem Benutzer für den Vergleich
image1 = user1_canvases[0]
image2 = user2_canvases[0]

# Generieren der Hashes
hash1 = imagehash.phash(image1)
hash2 = imagehash.phash(image2)

# Vergleichen der Hashes
hash_difference = hash1 - hash2

print(f"Hash for {username1}: {hash1}")
print(f"Hash for {username2}: {hash2}")
print(f"Hash difference: {hash_difference}")

# Bestimmen der Ähnlichkeit
if hash_difference == 0:
    print("The images are identical.")
else:
    print(f"The images are different with a hash difference of {hash_difference}.")

# %%
import numpy as np
import pandas as pd
from pymongo import MongoClient
from PIL import Image
from io import BytesIO
import base64
import os
import sys
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

# GPU-Speicherwachstum aktivieren
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(e)

# Verbindung zu MongoDB herstellen
client = MongoClient("mongodb://192.168.0.76:27017/")
db = client["fingerprintDB"]
collection = db["fingerprints"]

# Funktion zum Dekodieren von Base64-Bildern
def decode_base64_image(base64_string):
    if "," in base64_string:
        base64_data = base64_string.split(",")[1]
    else:
        raise ValueError("Invalid base64 string format")
    byte_data = base64.b64decode(base64_data)
    image_data = BytesIO(byte_data)
    image = Image.open(image_data)
    return np.array(image)

# Funktion zum Abrufen der Canvases
def get_canvases(data):
    if "canvases" not in data or not isinstance(data["canvases"], list):
        raise ValueError("Invalid data format: 'canvases' key is missing or not a list")
    return [decode_base64_image(canvas) for canvas in data["canvases"]]

# Benutzername aus den Argumenten abrufen
username = "username_3"

# Modellpfad anpassen je nach dem wo das Skript ausgeführt wird
if 'src' in os.getcwd():
    model_path = f'src/SWAT_auth/models/{username}_fingerprint_model.h5'
else:
    model_path = f'SWAT_auth/models/{username}_fingerprint_model.h5'

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

# Daten normalisieren
X_train = X_train / 255.0
X_test = X_test / 255.0

print("Data preparation complete.")


# %%
# Modell 1 definieren
def create_model_1(input_shape):
    model = Sequential()
    model.add(Conv2D(32, (3, 3), activation='relu', input_shape=input_shape))
    model.add(MaxPooling2D((2, 2)))
    model.add(Flatten())
    model.add(Dense(128, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))
    return model

# Modell 2 definieren
def create_model_2(input_shape):
    model = Sequential()
    model.add(Conv2D(64, (3, 3), activation='relu', input_shape=input_shape))
    model.add(MaxPooling2D((2, 2)))
    model.add(Flatten())
    model.add(Dense(256, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))
    return model

# Modell 3 definieren
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

# Modell 4 definieren (z.B. VGG-ähnliche Architektur)
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

# Modell 5 definieren (z.B. ResNet-ähnliche Architektur)
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

# Modell 6 definieren (z.B. Inception-ähnliche Architektur)
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


# %%
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import os

# Callbacks
early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

best_accuracy = 0
best_model = None

# Modelle nacheinander trainieren und bewerten
results = []
for i, (model, name) in enumerate(zip(models, model_names), start=1):
    model.compile(optimizer=Adam(learning_rate=0.001), loss='binary_crossentropy', metrics=['accuracy'])
    
    # Speichern des Modells mit einem spezifischen Namen
    model_checkpoint = ModelCheckpoint(f'src/SWAT_auth/models/{username}_{i}.h5', save_best_only=True, monitor='val_accuracy', mode='max')
    
    history = model.fit(X_train, y_train, epochs=50, batch_size=8, validation_data=(X_test, y_test), callbacks=[early_stopping, model_checkpoint])
    
    # Modell bewerten
    loss, accuracy = model.evaluate(X_test, y_test)
    print(f"{name} - Test Loss: {loss}")
    print(f"{name} - Test Accuracy: {accuracy}")
    results.append({'Model': name, 'Accuracy': accuracy})

    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_model = model

# Bestes Modell speichern
if best_model is not None:
    best_model.save(f'models/{username}_best.h5')
    print(f"Best model saved at src/SWAT_auth/models/{username}_best.h5 with accuracy {best_accuracy}")
else:
    print("No model was trained successfully.")

# %%
  # Ergebnisse in einem DataFrame anzeigen
results_df = pd.DataFrame(results)
print(results_df)

# Ergebnisse visualisieren
plt.figure(figsize=(8, 6))
plt.bar(results_df['Model'], results_df['Accuracy'], color='skyblue')
plt.title('Modellvergleich')
plt.xlabel('Modell')
plt.ylabel('Genauigkeit')
plt.ylim(0, 1)
plt.show()


# %%
import visualkeras

#for model, name in zip(models, model_names):
    # Modellarchitektur visualisieren
#    visualkeras.layered_view(model, to_file=f'{name}_architecture.png').show()


# %%
from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns

for model, name in zip(models, model_names):
    # Modell bewerten
    loss, accuracy = model.evaluate(X_test, y_test)
    print(f"{name} - Test Loss: {loss}")
    print(f"{name} - Test Accuracy: {accuracy}")

    # Vorhersagen auf dem Testdatensatz
    y_pred = model.predict(X_test)
    y_pred_classes = (y_pred > 0.5).astype("int32")

    # Verwirrungsmatrix erstellen
    conf_matrix = confusion_matrix(y_test, y_pred_classes)
    plt.figure(figsize=(8, 6))
    sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues')
    plt.title(f'{name} - Verwirrungsmatrix')
    plt.xlabel('Vorhergesagte Klasse')
    plt.ylabel('Wahre Klasse')
    plt.show()

    # Klassifikationsbericht anzeigen
    print(f"{name} - Klassifikationsbericht")
    print(classification_report(y_test, y_pred_classes))


# %%
import numpy as np
from pymongo import MongoClient
from PIL import Image
from io import BytesIO
import base64
import imagehash
import random
import string
import tensorflow as tf
import matplotlib.pyplot as plt
from ipycanvas import Canvas
from IPython.display import display
import os

# Verbindung zu MongoDB herstellen
client = MongoClient("mongodb://192.168.0.76:27017/")
db = client["fingerprintDB"]
collection = db["fingerprints"]

# Funktion zum Dekodieren von Base64-Bildern
def decode_base64_image(base64_string):
    if "," in base64_string:
        base64_data = base64_string.split(",")[1]
    else:
        raise ValueError("Invalid base64 string format")
    byte_data = base64.b64decode(base64_data)
    image_data = BytesIO(byte_data)
    image = Image.open(image_data)
    return image

# Funktion zum Generieren eines zufälligen Strings
def generate_random_string(length=10):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

# Funktion zum Zeichnen des zufälligen Textes auf dem Canvas
def draw_random_text(canvas, text):
    canvas.clear()
    canvas.font = "18px Arial"
    canvas.fill_style = "#069"
    canvas.fill_text(text, 2, 15)
    canvas.fill_style = "rgba(102, 204, 0, 0.7)"
    canvas.fill_text(text, 4, 19)
    canvas.fill_style = "#069"
    canvas.fill_text(text, 2, 23)
    canvas.fill_style = "rgba(102, 204, 0, 0.7)"
    canvas.fill_text(text, 4, 27)
    canvas.fill_style = "#069"
    canvas.fill_text(text, 2, 31)
    canvas.fill_style = "rgba(102, 204, 0, 0.7)"
    canvas.fill_text(text, 4, 35)

# Funktion zum Abrufen der Bilddaten vom Canvas
def get_image_data(canvas):
    canvas.sleep(0.1)  # Kurz warten, um sicherzustellen, dass das Canvas aktualisiert wird
    image_data = canvas.get_image_data()
    image = Image.fromarray(image_data)
    return image

# Funktion zum Vorbereiten des Bildes für das Modell
def prepare_image(image):
    image_resized = image.resize((128, 128))  # Beispielgröße, anpassen je nach Modell
    image_array_resized = np.array(image_resized)
    image_array_normalized = image_array_resized / 255.0
    image_array_normalized = np.expand_dims(image_array_normalized, axis=0)
    return image_array_normalized

# Dynamisch die Modellpfade und Namen generieren
username = "username_1"  # Beispiel-Username, anpassen nach Bedarf
model_dir = 'src/SWAT_auth/models'
model_paths = [os.path.join(model_dir, f"{username}_{i}.h5") for i in range(1, 7)]
model_paths.append(os.path.join(model_dir, f"{username}_best.h5"))
model_names = [f'Model {i}' for i in range(1, 7)] + ['Best Model']

# Modelle laden ohne Kompilierung
models = []
for path in model_paths:
    if os.path.exists(path):
        models.append(tf.keras.models.load_model(path, compile=False))
    else:
        print(f"Model file not found: {path}")

# Modelle kompilieren
for model in models:
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Erstellen eines Canvas mit synchronisierten Bilddaten
canvas = Canvas(width=280, height=35, sync_image_data=True)
display(canvas)

# Tests durchführen
num_tests = 10  # Anzahl der Tests, kann auf 20 erhöht werden
all_results = {name: [] for name in model_names}

for test_num in range(num_tests):
    # Generieren eines zufälligen Textes und Zeichnen auf dem Canvas
    random_text = generate_random_string()
    draw_random_text(canvas, random_text)
    
    # Bilddaten abrufen und vorbereiten
    image = get_image_data(canvas)
    image_array_normalized = prepare_image(image)
    
    # Resize the input images to the expected shape
    image_array_resized = tf.image.resize(image_array_normalized, [35, 280])
    
    # Modelle testen und Ergebnisse speichern
    results = []
    for model, name in zip(models, model_names):
        prediction = model.predict(image_array_resized)
        results.append({'Model': name, 'Prediction': prediction[0][0]})
        all_results[name].append(prediction[0][0])
    
    # Ergebnisse für diesen Test grafisch darstellen
    fig, ax = plt.subplots()
    ax.bar([result['Model'] for result in results], [result['Prediction'] for result in results])
    ax.set_xlabel('Model')
    ax.set_ylabel('Prediction')
    ax.set_title(f'Model Predictions for Generated Fingerprint (Test {test_num + 1})')
    plt.show()

# Aggregierte Ergebnisse grafisch darstellen
average_results = {name: np.mean(predictions) for name, predictions in all_results.items()}

fig, ax = plt.subplots()
ax.bar(average_results.keys(), average_results.values())
ax.set_xlabel('Model')
ax.set_ylabel('Average Prediction')
ax.set_title('Average Model Predictions for Generated Fingerprints')
plt.show()

# %%



