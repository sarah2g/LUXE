#!/usr/bin/env bash
set -e

echo "=== start.sh debug ==="
echo "Python: $(python -V)"
echo "pip: $(pip -V)"

echo "Checking setuptools installation..."
python -m pip show setuptools || true

echo "Ensuring setuptools and wheel are present and up to date..."
python -m pip install --upgrade setuptools wheel

echo "Starting Gunicorn..."
exec python -m gunicorn LUXEBIJOUX.wsgi --chdir LUXEBIJOUX --bind 0.0.0.0:$PORT --log-file -
