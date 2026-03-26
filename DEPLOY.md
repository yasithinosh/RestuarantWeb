# AWS Deployment Guide 🚀

This guide provides step-by-step instructions to deploy **La Bella Cucina** to an AWS EC2 instance with SSL and Monitoring.

## 1. AWS Instance Setup (EC2)

1. **Launch Instance**: Use **Ubuntu 22.04 LTS**.
2. **Elastic IP**: Allocate and associate an Elastic IP to your instance.
3. **Security Groups**: Add the following Inbound Rules:
   - **Port 22 (SSH)**: From your IP.
   - **Port 80 (HTTP)**: From Anywhere.
   - **Port 443 (HTTPS)**: From Anywhere.
   - **Port 3000 (Grafana)**: From Anywhere (or just your IP for better security).

## 2. DNS Configuration

In your domain provider's dashboard (e.g., Cloudflare, GoDaddy):
- Create an **A Record** for `labella.inovoid.me`.
- Point it to your **Elastic IP**.

## 3. Server Preparation (SSH)

Connect via Putty/SSH and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER && newgrp docker

# Install Docker Compose
sudo apt install docker-compose-v2 -y

# Clone Repository
git clone <your-repo-url>
cd Restuarant
```

## 4. Production Environment

1. **Create .env**:
   ```bash
   # Create a root .env file so Docker Compose loads it automatically
   cp backend/.env.prod.example .env
   nano .env
   ```
2. **Fill in real secrets**: Replace all `REPLACE_WITH_...` placeholders.

## 5. SSL Certificate Initialization

Before starting the full stack, we need to build and generate the certificates:

```bash
# 1. Build the images first
docker-compose -f docker-compose.prod.yml build

# 2. Start Nginx for SSL validation
docker-compose -f docker-compose.prod.yml up -d nginx

# 3. Run Certbot
docker exec labella_certbot_prod certbot certonly --webroot --webroot-path=/var/www/certbot --email <your-email> --agree-tos --no-eff-email -d labella.inovoid.me

# 4. Restart Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## 6. Launch Application

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 7. Monitoring

- **Grafana**: `https://labella.inovoid.me/grafana/`
  - **Login**: `admin`
  - **Password**: (The one you set in `.env.prod`)
- **Prometheus**: Internal (accessible via Grafana).
- **cAdvisor**: Internal (container metrics).

## 8. Database Seeding (Admin)

```bash
docker exec -it labella_backend_prod node scripts/seed-admin.js
```

---

## 🛠️ DevOps Maintenance

- **View Logs**: `docker-compose -f docker-compose.prod.yml logs -f <service_name>`
- **Backup Database**:
  ```bash
  docker exec labella_postgres_prod pg_dump -U labella -d labellacucina > backup.sql
  ```
- **Update Application**:
  ```bash
  git pull
  docker-compose -f docker-compose.prod.yml up -d --build
  ```
