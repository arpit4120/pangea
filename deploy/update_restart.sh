#!/bin/bash

# any future command that fails will exit the script
set -e
# go to project folder
cd /home/ubuntu/apps/node-apps/moskenes-server

#list items
ls 
# stash any changes 
git stash 
# fetch & merge changes
git pull deployOrigin datasetmerged

# restart server & print logs 
pm2 restart 0 

# logout
exit

# echo message
echo "Deployment complete "

