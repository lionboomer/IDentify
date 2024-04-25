import subprocess
import sys
import threading


def read_process_output(process):
    while True:
        output = process.stdout.readline()
        if output == '' and process.poll() is not None:
            break
        if output:
            print(output.strip())

def remove_docker_image(image_name):
    print(f"Removing the Docker image {image_name}...")
    try:
        subprocess.run(["docker", "rmi", "-f", image_name], check=True)
        print("Docker image removed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Failed to remove the Docker image: {e}")

def handle_user_input(container_name):
    while True:
        command = input()
        if command.strip().lower() == "stop":
            print("Stopping the Docker container...")
            try:
                subprocess.run(["docker", "stop", container_name], check=True)
            except subprocess.CalledProcessError as e:
                print(f"Failed to stop the Docker container: {e}")
            print("Stopping the Docker container...")
            try:
                subprocess.run(["docker", "stop", container_name], check=True)
                print("Docker container stopped successfully.")
            except subprocess.CalledProcessError as e:
                print(f"Failed to stop the Docker container: {e}")
            print("Script is exiting...")
            sys.exit(0)
        elif command.strip().lower() == "status":
            print("Checking the Docker container status...")
            try:
                subprocess.run(["docker", "ps", "-a", "-f",
                               f"name={container_name}"], check=True)
            except subprocess.CalledProcessError as e:
                print(f"Failed to check the Docker container status: {e}")


def manage_container(command):
    image_name = "identify"  # Ersetzen Sie dies durch den Namen Ihres Docker-Images
    # Ersetzen Sie dies durch den Namen Ihres Docker-Containers
    container_name = "IDentify"

    # Überprüfen Sie, ob das Docker-Image bereits existiert
    result = subprocess.run(
        ["docker", "images", "-q", image_name], capture_output=True, text=True)
    if result.stdout.strip() == "":
        # Das Docker-Image existiert nicht, erstellen Sie es
        print(f"Building the Docker image {image_name}...")
        try:
            subprocess.run(
                ["docker", "build", "-t", image_name, "."], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Failed to build the Docker image: {e}")
            return

    if command == "start":
        # Überprüfen Sie, ob der Docker-Container bereits existiert
        result = subprocess.run(
            ["docker", "ps", "-a", "-f", f"name={container_name}"], capture_output=True, text=True)
        if container_name in result.stdout:
            # Der Docker-Container existiert, entfernen Sie ihn
            print(f"Removing the existing Docker container {container_name}...")
            try:
                subprocess.run(["docker", "rm", "-f", container_name], check=True)
            except subprocess.CalledProcessError as e:
                print(f"Failed to remove the Docker container: {e}")
                return

        # Entfernen Sie das Docker-Image, bevor Sie es neu erstellen
        remove_docker_image(image_name)
        # Erstellen Sie das Docker-Image
        print(f"Building the Docker image {image_name}...")
        try:
            subprocess.run(
                ["docker", "build", "-t", image_name, "."], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Failed to build the Docker image: {e}")
            return
        # Erstellen Sie den Docker-Container
        print(f"Creating the Docker container {container_name}...")
        try:
            subprocess.run(["docker", "run", "-p", "3000:3000", "-d", "--name",
                            container_name, image_name], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Failed to create the Docker container: {e}")
            return
    
        print("Following the Docker container logs...")
        try:
            process = subprocess.Popen(
                ["docker", "logs", "-f", container_name], stdout=subprocess.PIPE)
            threading.Thread(target=read_process_output,
                             args=(process,)).start()
            threading.Thread(target=handle_user_input,
                             args=(container_name,)).start()
        except Exception as e:
            print(f"Ein Fehler ist aufgetreten: {e}")
        except subprocess.CalledProcessError:
            print("The Docker container has stopped.")
    elif command == "start fresh":
        print("Removing the Docker container...")
        try:
            subprocess.run(["docker", "rm", container_name], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Failed to remove the Docker container: {e}")
        print("Creating a new Docker container...")
        try:
            subprocess.run(["docker", "run", "-d", "--name",
                           container_name, image_name], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Failed to create the Docker container: {e}")
    else:
        print("Usage: python manage_container.py {start|start fresh}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python manage_container.py {start|start fresh}")
        sys.exit(1)

    manage_container(sys.argv[1])
