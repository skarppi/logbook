#!/bin/bash

docker build -t skarppi/logbook . 
# set path other than root
# --build-arg PUBLIC_URL=/logbook