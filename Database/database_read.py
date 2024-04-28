import mysql.connector
import time

def print_database_data():
    while True:
        try:
            db = mysql.connector.connect(
                host="localhost",
                user="KOBIL",
                password="KOBIL123!",
                database="fingerprint"
            )
            cursor = db.cursor()
            while True:
                cursor.execute("SELECT * FROM fingerprints")
                rows = cursor.fetchall()
                for row in rows:
                    print(row)
                time.sleep(5)  # Warte 5 Sekunden vor dem nächsten Abruf
            break  # Wenn die Verbindung erfolgreich war, brechen Sie die Schleife ab
        except mysql.connector.errors.InterfaceError as e:
            print(f"Error: {e}")
            print("Waiting for the MySQL server to start...")
            time.sleep(5)  # Wenn die Verbindung fehlgeschlagen ist, warten Sie 5 Sekunden und versuchen Sie es erneut

print_database_data()