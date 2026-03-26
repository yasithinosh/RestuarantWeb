# La Bella Cucina — Production Deployment Guide 🚀

Follow these steps to deploy your application to your AWS EC2 `labella-cucina` instance.

## 1. Domain & DNS Setup
1. Log in to your domain registrar (where you bought `inovoid.me`).
2. Add an **A Record**:
   - **Host:** `labella`
   - **Value:** `YOUR_ELASTIC_IP`
   - **TTL:** 1 hour (or default)

## 2. AWS Security Group Rules
Ensure your EC2 instance's Security Group allows:
- **SSH (22):** Your IP
- **HTTP (80):** Anywhere (0.0.0.0/0)
- **HTTPS (443):** Anywhere (0.0.0.0/0)

## 3. Server Preparation (PuTTY)
Connect to your instance via PuTTY and run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
# Log out and log back in for group changes to take effect
```

## 4. Initial Deployment
1. Clone your repository:
   ```bash
   git clone <YOUR_GIT_REPO_URL>
   cd Restuarant
   ```
2. **Setup Production Secrets:**
   Create your production `.env` file from the template:
   ```bash
   cp backend/.env.prod.example backend/.env.prod
   ```
   **CRITICAL: Generate secrets before starting!**
   Open the file for editing: `nano backend/.env.prod`

   - **For `DB_PASS` and `JWT_SECRET`**: use strong random strings (run `openssl rand -base64 32` in another terminal to get one).
   - Change `ADMIN_PASSWORD` to something unique for your dashboard.
   - **Save and Exit:** Press `Ctrl + O`, then `Enter`, then `Ctrl + X`.

3. Start the application:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 5. SSL Certificate (Let's Encrypt)
Wait for the initial build to finish, then generate your SSL certificate:

```bash
# Install Certbot (if not using the docker container)
# The provided docker-compose.prod.yml uses a certbot container
docker-compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ -d labella.inovoid.me
```

## 6. DevOps Monitoring
- **API Health:** `https://labella.inovoid.me/api/health`
- **Grafana:** `https://labella.inovoid.me/grafana`
  - Default login: `admin` / `admin` (Change this immediately!)

## 7. Useful Commands
- **View Logs:** `docker-compose -f docker-compose.prod.yml logs -f`
- **Restart All:** `docker-compose -f docker-compose.prod.yml restart`
- **Rebuild After Code Changes:** `git pull && docker-compose -f docker-compose.prod.yml up --build -d`
