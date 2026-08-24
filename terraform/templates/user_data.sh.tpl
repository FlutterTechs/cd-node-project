#!/bin/bash
set -e

# --- Install Docker Engine + Compose plugin (Ubuntu 22.04) ---
apt-get update -y
apt-get install -y ca-certificates curl gnupg

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker

# Deploy step SSHes in as ubuntu and needs to run docker without sudo
usermod -aG docker ubuntu

# --- App dir + compose file, image baked in by Terraform ---
mkdir -p /home/ubuntu/app
cat > /home/ubuntu/app/docker-compose.yml <<'EOF'
services:
  app:
    image: ${docker_image}
    restart: unless-stopped
    ports:
      - "80:3000"
    environment:
      - PORT=3000
      - HOST=0.0.0.0
EOF

chown -R ubuntu:ubuntu /home/ubuntu/app

# Best-effort first boot; if the GHCR image isn't reachable yet (private,
# not logged in) this just no-ops - the first CI deploy brings it up for real.
cd /home/ubuntu/app && /usr/bin/docker compose up -d || true
