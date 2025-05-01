#!/bin/bash

# Kontour Coin Deployment Script
# This script automates the deployment of the Kontour Coin application

# Exit on error
set -e

# Configuration
ENVIRONMENT=$1
if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: ./deploy.sh [staging|production]"
  exit 1
fi

# Set environment-specific variables
if [ "$ENVIRONMENT" = "staging" ]; then
  FRONTEND_BUCKET="kontour-coin-staging"
  BACKEND_SERVER="staging.kontourcoin.io"
  BACKEND_PORT=8001
  CLOUDFRONT_DISTRIBUTION_ID="E1ABCDEFGHIJKL"
elif [ "$ENVIRONMENT" = "production" ]; then
  FRONTEND_BUCKET="kontour-coin-production"
  BACKEND_SERVER="api.kontourcoin.io"
  BACKEND_PORT=8001
  CLOUDFRONT_DISTRIBUTION_ID="E2ABCDEFGHIJKL"
else
  echo "Invalid environment: $ENVIRONMENT"
  echo "Valid options: staging, production"
  exit 1
fi

echo "Deploying Kontour Coin to $ENVIRONMENT environment"

# Build frontend
echo "Building frontend..."
cd frontend
npm ci
npm run build
cd ..

# Build backend
echo "Building backend..."
cd backend
pip install -r requirements.txt
cd ..

# Deploy frontend to S3
echo "Deploying frontend to S3 bucket: $FRONTEND_BUCKET"
aws s3 sync frontend/build s3://$FRONTEND_BUCKET --delete

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache: $CLOUDFRONT_DISTRIBUTION_ID"
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

# Deploy backend to server
echo "Deploying backend to server: $BACKEND_SERVER"
ssh ubuntu@$BACKEND_SERVER "mkdir -p ~/kontour-coin"
scp -r backend/* ubuntu@$BACKEND_SERVER:~/kontour-coin/
ssh ubuntu@$BACKEND_SERVER "cd ~/kontour-coin && docker-compose down && docker-compose up -d"

# Run performance tests
if [ "$ENVIRONMENT" = "staging" ]; then
  echo "Running performance tests..."
  cd performance-tests
  npm ci
  npm test
  cd ..
fi

echo "Deployment to $ENVIRONMENT completed successfully!"