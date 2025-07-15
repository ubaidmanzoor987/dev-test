#!/usr/bin/env bash

# Ensure Docker or Podman is installed
ensure_docker_or_podman() {
    if ! [ -x "$(command -v docker)" ] && ! [ -x "$(command -v podman)" ]; then
        echo "Docker or Podman is not installed. Please install docker or podman and try again.\nDocker install guide: https://docs.docker.com/engine/install/\nPodman install guide: https://podman.io/getting-started/installation"
        exit 1
    fi
}

# Set global DOCKER_CMD variable
select_docker_command() {
    if [ -x "$(command -v docker)" ]; then
        DOCKER_CMD="docker"
    else
        DOCKER_CMD="podman"
    fi
}

# Ensure Docker daemon is running
ensure_docker_running() {
    if ! $DOCKER_CMD info >/dev/null 2>&1; then
        echo "$DOCKER_CMD daemon is not running. Please start it and try again."
        exit 1
    fi
}

# Check if a port is already in use
check_port_available() {
    local PORT=$1

    if command -v nc >/dev/null 2>&1; then
        if nc -z localhost "$PORT" 2>/dev/null; then
            echo "Port $PORT is already in use."
            exit 1
        fi
    else
        echo "Warning: Unable to check if port $DB_PORT is already in use (netcat not installed)"
        read -p "Do you want to continue anyway? [y/N]: " -r REPLY
        if ! [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Aborting."
            exit 1
        fi
    fi
}

# Check if a container exists and is running
is_container_running() {
    local NAME=$1
    [ "$($DOCKER_CMD ps -q -f name=$NAME)" ]
}

# Check if a container exists but is stopped
is_container_stopped() {
    local NAME=$1
    [ "$($DOCKER_CMD ps -aq -f name=$NAME)" ]
}
