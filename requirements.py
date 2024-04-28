import subprocess
import sys

def install_dependencies():
    packages = ["docker", "mysql-connector-python"]
    subprocess.check_call([sys.executable, "-m", "pip", "install"] + packages)

def run_script(script_name):
    subprocess.check_call([sys.executable, script_name])

def main():
    install_dependencies()
    run_script("docker_manager.py")
    run_script("starter.py")

if __name__ == "__main__":
    main()