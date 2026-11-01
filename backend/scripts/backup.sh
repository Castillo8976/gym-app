#!/usr/bin/env sh
set -eu

: "${DB_HOST:?DB_HOST is required}"
: "${DB_PORT:=3306}"
: "${DB_NAME:?DB_NAME is required}"
: "${DB_USER:?DB_USER is required}"
: "${DB_PASSWORD:?DB_PASSWORD is required}"
: "${BACKUP_DIR:=./backups}"

mkdir -p "$BACKUP_DIR"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
output="$BACKUP_DIR/${DB_NAME}-${timestamp}.sql.gz"

mysqldump --single-transaction --routines --triggers \
  -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "-p$DB_PASSWORD" "$DB_NAME" \
  | gzip > "$output"

printf 'Created backup: %s\n' "$output"
