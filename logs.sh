#!/bin/bash

# Script pour afficher les logs
# Usage: ./logs.sh [service-name] [--tail=100]

SERVICE=$1
TAIL=${2:-all}

if [ -z "$SERVICE" ]; then
    echo "📋 Affichage des logs de tous les services..."
    if [ "$TAIL" = "all" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f $TAIL
    fi
else
    echo "📋 Affichage des logs de $SERVICE..."
    if [ "$TAIL" = "all" ]; then
        docker-compose logs -f $SERVICE
    else
        docker-compose logs -f $TAIL $SERVICE
    fi
fi
