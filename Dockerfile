# Use base image with Miniconda for Python environment management
FROM continuumio/miniconda3

# Create working directory
WORKDIR /usr/src/app

# Copy environment.yml file for conda environment setup
COPY environment.yml .

# Create conda environment from yml file
RUN conda env create -f environment.yml

# Ensure conda environment is activated for subsequent commands
SHELL ["conda", "run", "-n", "myenv", "/bin/bash", "-c"]

# Copy the rest of the application code
COPY . .

# Expose port for the application
EXPOSE 3000

# Start the application using conda environment
CMD ["conda", "run", "--no-capture-output", "-n", "myenv", "python", "app.py"]