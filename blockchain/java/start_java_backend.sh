#!/bin/bash
echo "Starting Kontour Coin Java Backend..."

# Build the project
mvn clean package -DskipTests

# Run the application
java -jar target/kontourcoin-java-1.0.0.jar