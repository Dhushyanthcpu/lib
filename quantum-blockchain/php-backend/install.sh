#!/bin/bash

echo "Installing Quantum Blockchain PHP Backend..."

# Check if composer is installed
if ! command -v composer &> /dev/null; then
    echo "Composer is not installed. Please install composer first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
composer install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    
    # Generate app key
    php artisan key:generate
fi

# Run migrations
echo "Running database migrations..."
php artisan migrate

echo "Installation completed successfully!"
echo ""
echo "To start the development server, run:"
echo "php artisan serve"
echo ""
echo "To sync blockchain data, run:"
echo "php artisan blockchain:sync --latest=10"
