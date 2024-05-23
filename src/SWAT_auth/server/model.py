import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense

def create_and_train_model(images, labels, user_id):
    # Daten normalisieren
    images = images / 255.0

    # CNN Modell erstellen
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(35, 280, 4)),
        MaxPooling2D((2, 2)),
        Conv2D(64, (5, 5), activation='relu'),
        MaxPooling2D((2, 2)),
        Conv2D(128, (7, 7), activation='relu'),
        MaxPooling2D((2, 2)),
        Flatten(),
        Dense(128, activation='relu'),
        Dense(1, activation='sigmoid')
    ])

    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    # Trainieren des Modells
    model.fit(images, labels, epochs=10, batch_size=32, validation_split=0.2)

    # Modell speichern
    model.save(f"user_model_{user_id}.h5")

def load_model(user_id):
    return tf.keras.models.load_model(f"user_model_{user_id}.h5")
