#!/usr/bin/env bash
# Script to start all Docker services (PostgreSQL, Meilisearch, and Tolgee)

source ./scripts/utils.sh

# Run safety checks
ensure_docker_or_podman
select_docker_command
ensure_docker_running

# Determine which env file to use
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  if [ -f ".env" ]; then
    ENV_FILE=".env"
    echo "Using .env file"
  else
    echo "No .env files found. Creating .env.local from example..."
    if [ -f ".env.example" ]; then
      cp .env.example .env.local
      ENV_FILE=".env.local"
      echo "Created .env.local from example"
    else
      echo "Error: No environment files found and no example to copy from."
      exit 1
    fi
  fi
else
  echo "Using .env.local file"
fi

# Check if containers are already running
SERVICES=("postgres" "meilisearch" "tolgee")
RUNNING_COUNT=0

for SERVICE in "${SERVICES[@]}"; do
  if is_container_running "nomey-next-$SERVICE"; then
    RUNNING_COUNT=$((RUNNING_COUNT+1))
    echo "- $SERVICE is already running"
  fi
done

if [ $RUNNING_COUNT -eq ${#SERVICES[@]} ]; then
  echo "All services are already running."
  exit 0
fi

# Check for stopped containers
STOPPED_COUNT=0
for SERVICE in "${SERVICES[@]}"; do
  if is_container_stopped "nomey-next-$SERVICE" && ! is_container_running "nomey-next-$SERVICE"; then
    STOPPED_COUNT=$((STOPPED_COUNT+1))
  fi
done

# Handle existing but stopped containers
if [ $STOPPED_COUNT -gt 0 ]; then
  echo "Some services are stopped. Would you like to:"
  echo "1) Start existing containers"
  echo "2) Recreate all containers"
  read -p "Choose an option [1-2]: " -r OPTION
  
  case $OPTION in
    1)
      for SERVICE in "${SERVICES[@]}"; do
        if is_container_stopped "nomey-next-$SERVICE" && ! is_container_running "nomey-next-$SERVICE"; then
          echo "Starting $SERVICE..."
          $DOCKER_CMD start "nomey-next-$SERVICE"
        fi
      done
      echo "Started existing containers."
      exit 0
      ;;
    2)
      echo "Recreating all containers..."
      $DOCKER_CMD compose down
      ;;
    *)
      echo "Invalid option. Exiting."
      exit 1
      ;;
  esac
fi

# Start services using docker-compose
echo "Starting all services..."
$DOCKER_CMD compose --env-file "$ENV_FILE" up -d

# Check if services started successfully
if [ $? -ne 0 ]; then
  echo "Error: Failed to start services. Check the Docker logs for details."
  exit 1
fi

# Show running services
echo -e "\nServices started successfully!"
$DOCKER_CMD ps --filter "name=nomey-next"

echo -e "\nConnection information:"
echo "- Database (PostgreSQL): localhost:${PG_PORT:-5432}"
echo "- Search Engine (Meilisearch): localhost:${MEILI_PORT:-7700}"
echo "- Translation Management (Tolgee): localhost:${DOCKER_TOLGEE_PORT:-8080}"