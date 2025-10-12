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
                time.sleep(5)  # Wait 5 seconds before next query
            break  # If connection was successful, break the loop
        except mysql.connector.errors.InterfaceError as e:
            print(f"Error: {e}")
            print("Waiting for the MySQL server to start...")
            time.sleep(5)  # If connection failed, wait 5 seconds and retry

print_database_data()