from database import get_canvas_data
from model import create_and_train_model
from authentication import authenticate

# Beispieldaten von einem Benutzer extrahieren
user_id = "664f4d221f493438173d25f4"  # Beispiel-Benutzer-ID
images = get_canvas_data(user_id)
labels = np.ones(len(images))  # Label für den Benutzer setzen

# Modell erstellen und trainieren
create_and_train_model(images, labels, user_id)

# Neue Canvas-Daten zum Testen (füge hier deine tatsächlichen neuen Canvas-Daten ein)
new_canvases = [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARgAAAAjCAYAAABPRBVWAAAA...",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARgAAAAjCAYAAABPRBVWAAAA...",
    # weitere Canvas-Daten
]

authentication_score = authenticate(user_id, new_canvases)

print(f"Authentication score: {authentication_score}")
