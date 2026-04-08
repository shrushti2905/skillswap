#!/usr/bin/env bash
set -o errexit

# Clean old static files to save space
rm -rf staticfiles/*

# Install dependencies
pip install -r requirements.txt --no-cache-dir

# Collect static files
python manage.py collectstatic --no-input --clear

# Run migrations
python manage.py migrate --no-input
