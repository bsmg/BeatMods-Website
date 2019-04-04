#!/bin/bash
git fetch && git pull origin master && npm i && npm run build:prod && pm2 restart process.json --env production
