import subprocess
import sys

def install_dependencies():
    packages = ["docker", "mysql-connector-python"]
    subprocess.check_call([sys.executable, "-m", "pip", "install"] + packages)

def start_docker():
    try:
        subprocess.check_call(["docker", "start"])
    except subprocess.CalledProcessError:
        print("Docker is already running.")

def run_script(script_name):
    subprocess.check_call([sys.executable, script_name])

def main():
    install_dependencies()
    start_docker()
    run_script("docker_manager.py")
    run_script("starter.py")

if __name__ == "__main__":
    main()