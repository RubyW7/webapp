#!/bin/bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

sudo systemctl start postgresql
sudo systemctl enable postgresql

sudo -u postgres psql -c "CREATE USER ruby WITH PASSWORD 'Wyd0718520';"
sudo -u postgres psql -c "CREATE DATABASE myapp OWNER ruby;"

sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/g" /etc/postgresql/12/main/postgresql.conf
sudo echo "host    myapp             ruby             127.0.0.1/32            md5" >> /etc/postgresql/12/main/pg_hba.conf

sudo systemctl restart postgresql
