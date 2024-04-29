import subprocess
import sys
import os

def install_python_dependencies():
    print("Installing Python dependencies... (33% complete)")
    # Installieren Sie die Python-Abhängigkeiten
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    print("Python dependencies installed.")

def run_python_script(script_name, args=None):
    print(f"Running {script_name}... (66% complete)")
    # Führen Sie das Python-Skript aus
    command = [sys.executable, script_name]
    if args is not None:
        command.extend(args)
    subprocess.check_call(command)
    print(f"{script_name} completed.")

def main():
    actions = []

    # Installieren Sie die Python-Abhängigkeiten
    install_python_dependencies()
    actions.append("Installed Python dependencies.")

    # Führen Sie die Python-Skripte aus
    run_python_script("Database/docker_manager.py")
    actions.append("Ran Database/docker_manager.py.")
    run_python_script("Scripts/starter.py", ["start"])
    actions.append("Ran Scripts/starter.py.")



    print("All tasks completed! (100% complete)")
    print("Summary of actions taken:")
    for action in actions:
        print(f"- {action}")

if __name__ == "__main__":
    main()