#!/usr/bin/env sh
set -eu

: "${DB_HOST:?DB_HOST is required}"
: "${DB_PORT:=3306}"
: "${DB_NAME:?DB_NAME is required}"
: "${DB_USER:?DB_USER is required}"
: "${DB_PASSWORD:?DB_PASSWORD is required}"

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 backup.sql.gz" >&2
  exit 2
fi

gzip -dc "$1" | mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "-p$DB_PASSWORD" "$DB_NAME"
