FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directories
RUN mkdir -p /app/kontour_data /app/quantum_kontour_data

# Expose port
EXPOSE 8001

# Run the application
CMD ["uvicorn", "kontour_api:app", "--host", "0.0.0.0", "--port", "8001"]