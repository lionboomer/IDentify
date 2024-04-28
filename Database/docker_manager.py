import docker
import sys
import mysql.connector
import subprocess
import time
import os

IMAGE_NAME = 'my-mysql'
CONTAINER_NAME = 'mysql-IDentify'
DEFAULT_TAG = 'latest'

client = docker.from_env()

def image_exists():
    try:
        client.images.get(f"{IMAGE_NAME}:{DEFAULT_TAG}")
        return True
    except docker.errors.ImageNotFound:
        return False

def container_exists():
    try:
        client.containers.get(CONTAINER_NAME)
        return True
    except docker.errors.NotFound:
        return False

def create_image():
    # Überprüfen Sie, in welchem Verzeichnis wir uns befinden
    current_dir = os.getcwd()
    project_dir = os.path.dirname(current_dir)  # Das Hauptverzeichnis Ihres Projekts

    # Erstellen Sie den absoluten Pfad zu den SQL-Dateien
    sql_dir = os.path.join(project_dir, "Database")

    print("Creating image...")
    try:
        subprocess.run(["docker", "build", "-f", "Enviroment/Dockerfiles/Dockerfile.db", "-t", f"{IMAGE_NAME}:{DEFAULT_TAG}", "--build-arg", f"SQL_DIR={sql_dir}", project_dir], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Failed to build the Docker image: {e}")
        raise SystemExit("Stopping script due to failed image creation.")

def create_container():
    print("Creating container...")
    client.containers.run(f"{IMAGE_NAME}:{DEFAULT_TAG}", name=CONTAINER_NAME, detach=True, ports={'3306/tcp': 3306})

def start_container():
    container = client.containers.get(CONTAINER_NAME)
    if container.status == 'running':
        print("Container is already running, skipping start...")
    else:
        print("Starting the container...")
        container.start()
    print("Waiting for the database to start...")
    time.sleep(10)

def recreate_all():
    print("Recreating everything...")
    if container_exists():
        container = client.containers.get(CONTAINER_NAME)
        container.stop()
        container.remove()
    if image_exists():
        image = client.images.get(f"{IMAGE_NAME}:{DEFAULT_TAG}")
        client.images.remove(image.id)
    create_image()
    create_container()

def print_container_logs():
    client = docker.from_env()
    container = client.containers.get(CONTAINER_NAME)
    print(container.logs())

def print_container_status():
    container = client.containers.get(CONTAINER_NAME)
    print(f"Container status: {container.status}")


def print_database_data():
    for _ in range(10):  # Versuchen Sie es bis zu 10 Mal
        try:
            db = mysql.connector.connect(
                host="localhost",
                user="KOBIL",
                password="KOBIL123!",
                database="fingerprint"
            )
            cursor = db.cursor()
            cursor.execute("SELECT * FROM fingerprints")
            rows = cursor.fetchall()
            for row in rows:
                print(row)
            break  # Wenn die Verbindung erfolgreich war, brechen Sie die Schleife ab
        except mysql.connector.errors.OperationalError:
            time.sleep(5)  # Wenn die Verbindung fehlgeschlagen ist, warten Sie 5 Sekunden und versuchen Sie es erneut

def main():
    print("Starting the script...")
    if len(sys.argv) > 1 and sys.argv[1] == 'fresh':
        print("Fresh start requested...")
        recreate_all()
    else:
        if not image_exists():
            print("Image does not exist, creating...")
            create_image()
        else:
            print("Image exists, skipping creation...")
        if not container_exists():
            print("Container does not exist, creating...")
            create_container()
        else:
            print("Container exists, skipping creation...")
        print("Starting the container...")
        start_container()
    print("Printing container status...")
    print_container_status()
    print("Printing database data...")
    print_database_data()
    print("Script finished.")



if __name__ == "__main__":
    main()