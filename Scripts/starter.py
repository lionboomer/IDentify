import subprocess

def run_command(command):
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Command failed: {e}")
        return False
    return True

def container_exists(container_name):
    result = subprocess.run(
        ["docker", "ps", "-a", "-f", f"name={container_name}"], capture_output=True, text=True)
    return container_name in result.stdout

def image_exists(image_name):
    result = subprocess.run(
        ["docker", "image", "inspect", image_name], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return result.returncode == 0

def main():
    image_name = "identify"
    container_name = "IDentify"
    dockerfile_path = "./Enviroment/Dockerfiles/Dockerfile.app"

    if not image_exists(image_name):
        print(f"Building the Docker image {image_name}...")
        if not run_command(["docker", "build", "-t", image_name, "-f", dockerfile_path, "."]):
            return

    if container_exists(container_name):
        print(f"Removing the existing Docker container {container_name}...")
        if not run_command(["docker", "rm", "-f", container_name]):
            return

    print(f"Starting the Docker container {container_name}...")
    if not run_command(["docker", "run", "-d", "--name", container_name, image_name]):
        return

    print("Following the Docker container logs...")
    run_command(["docker", "logs", "-f", container_name])

if __name__ == "__main__":
    main()