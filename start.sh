#!/usr/bin/env bash
set -e

echo "Installing runtime dependencies..."
python -m pip install --upgrade pip setuptools wheel

# === Debug: عرض قيم المتغيرات المهمة ===
echo "ALLOWED_HOSTS=$ALLOWED_HOSTS"
echo "CSRF_TRUSTED_ORIGINS=$CSRF_TRUSTED_ORIGINS"
echo "DEBUG=$DEBUG"

echo "Starting server..."
exec python -m gunicorn LUXEBIJOUX.wsgi --chdir LUXEBIJOUX --bind 0.0.0.0:$PORT --log-file -