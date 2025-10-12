# Use an official Miniconda image as the base image
FROM continuumio/miniconda3

# Set the working directory in the container to /usr/src/app
WORKDIR /usr/src/app

# Copy the environment.yml file to the working directory
COPY environment.yml .

# Create the Conda environment
RUN conda env create -f environment.yml

# Ensure the Conda environment is activated
RUN echo "source activate tfjs_env" > ~/.bashrc
ENV PATH /opt/conda/envs/tfjs_env/bin:$PATH

# Copy the rest of the application code to the working directory
COPY . .

# Make port 5000 available outside the container
EXPOSE 5000

# Run the application when the container launches
CMD ["conda", "run", "--no-capture-output", "-n", "tfjs_env", "python", "src/ml_server.py"]