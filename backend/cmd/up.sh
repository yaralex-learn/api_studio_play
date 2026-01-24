#!/bin/bash

sudo git pull origin master
sudo docker compose build
sudo docker compose down
sudo docker compose rm -f
sudo docker compose up -d
sudo docker logs yaralex_api --tail 50 -f
