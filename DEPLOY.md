# Deployment Guide — labella.inovoid.me

This guide explains how to deploy the La Bella Cucina application to your AWS EC2 instance (`t3.micro`) with a full DevOps monitoring stack and SSL.

---

## 🏗️ 1. AWS Security Group Setup

Ensure your EC2 Security Group allows the following **Inbound Rules**:

| Protocol | Port | Source | Description |
|---|---|---|---|
| SSH | 22 | My IP | Access via PuTTY |
| HTTP | 80 | 0.0.0.0/0 | Web access & SSL validation |
| HTTPS | 443 | 0.0.0.0/0 | Secure Web access |

---

## 🌐 2. DNS Configuration

1. Log in to your DNS provider (e.g., GoDaddy, Route 53).
2. Create an **A Record**:
   - **Name:** `labella`
   - **Value:** `YOUR_ELASTIC_IP`
   - **TTL:** 300 (or default)

---

## 🐚 3. Server Preparation (via PuTTY)

Connect to your EC2 and run these commands to install Docker:

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## 🚀 4. Application Setup

1. **Clone the repository:**
   ```bash
   git clone <YOUR_REPO_URL>
   cd Restuarant
   ```

2. **Configure Environment Variables:**
   ```bash
   cp .env.prod.example .env.prod
   nano .env.prod
   ```
   *Edit the values, especially passwords and secrets.*

---

## 🔒 5. SSL Certificate (First Run)

To get your SSL certificate from Let's Encrypt for the first time:

1. **Start nginx in "Challenge Only" mode:**
   ```bash
   # Temporarily use a simple config to get certs
   docker-compose -f docker-compose.prod.yml up -d frontend
   ```

2. **Run Certbot to request certificates:**
   ```bash
   docker-compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email your-email@example.com --agree-tos --no-eff-email -d labella.inovoid.me
   ```

3. **Generate Diffie-Hellman parameters (for extra security):**
   ```bash
   mkdir -p certbot/conf
   openssl dhparam -out certbot/conf/ssl-dhparams.pem 2048
   ```

4. **Restart with full production config:**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## 📊 6. Monitoring & DevOps

### Grafana Dashboard
1. Visit `https://labella.inovoid.me/grafana/`
2. **User:** `admin` | **Password:** (Set in `.env.prod`)
3. The **Prometheus** datasource is already pre-configured.
4. **DevOps Engineering:** You can now create dashboards to monitor:
   - **Host:** CPU, RAM, Disk usage (via Node Exporter)
   - **Containers:** Memory limits, CPU usage per service (via cAdvisor)
   - **App:** Backend health and uptime.

### Database Management
- Access pgAdmin at `http://YOUR_ELASTIC_IP:5050` (or proxy it via nginx for SSL).

---

## 🛠️ 7. Maintenance

**To update the app:**
```bash
git pull
docker-compose -f docker-compose.prod.yml up --build -d
```

**To view logs:**
```bash
docker-compose -f docker-compose.prod.yml logs -f
```
