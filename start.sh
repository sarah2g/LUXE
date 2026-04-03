#!/usr/bin/env bash
set -e

echo "Installing runtime dependencies..."
python -m pip install --upgrade pip setuptools wheel

echo "Starting server..."
exec python -m gunicorn LUXEBIJOUX.wsgi --chdir LUXEBIJOUX --bind 0.0.0.0:$PORT --log-file -