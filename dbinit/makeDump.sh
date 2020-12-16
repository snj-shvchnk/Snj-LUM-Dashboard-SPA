#!/bin/bash

# Backup mysql database 'luminhealth'
_now=$(date +"%Y_%m_%d_%H_%M_%S")
_dbname="luminhealth"
_file="./dumps/db-$_dbname-backup-$_now.sql"

echo "Starting backup to $_file..."
mysqldump -h 127.0.0.1 -u'root' -p'root' "$_dbname" > "$_file"

echo "DONE dump $_dbname to $_file."
