# Deployment Guide — labella.inovoid.me (AWS Free Tier)

> Deploy La Bella Cucina to AWS EC2 (t2.micro, free tier) with HTTPS and GitHub Actions auto-deploy.
> **Estimated monthly cost: $0** during the free tier period (12 months from AWS sign-up).

---

## What runs on the server

| Container | RAM usage | Purpose |
|---|---|---|
| `postgres` | ~150 MB | Database |
| `backend` | ~120 MB | Node.js API |
| `nginx` | ~15 MB | HTTPS, static files |
| `certbot` | ~30 MB | SSL certificate |
| **Total** | **~315 MB** | Well within 1 GB |

> [!NOTE]
> Monitoring (Grafana/Prometheus) is excluded from free tier deployment.
> Use **AWS CloudWatch** (free, built-in) for basic EC2 CPU/RAM/disk metrics.

---

## 1. Launch EC2 Instance (AWS Console)

1. **EC2 → Launch Instance**
2. **Name:** `labella-cucina`
3. **AMI:** `Ubuntu Server 22.04 LTS` ← must be this for free tier
4. **Instance type:** `t2.micro` ← free tier eligible
5. **Key pair:** Create new → download `.pem` → keep it safe
6. **Security Group — open exactly these ports:**

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | My IP | SSH (your IP only) |
| 80 | TCP | 0.0.0.0/0, ::/0 | HTTP |
| 443 | TCP | 0.0.0.0/0, ::/0 | HTTPS |

7. **Storage:** 20 GB gp2 (free tier gives 30 GB)
8. Click **Launch Instance**

### Allocate an Elastic IP (static public IP)
1. **EC2 → Elastic IPs → Allocate Elastic IP address → Allocate**
2. Select the new address → **Actions → Associate Elastic IP**
3. Choose your instance → **Associate**
4. Note down your Elastic IP — e.g. `54.xxx.xxx.xxx`

---

## 2. Point DNS to EC2 (Namecheap)

1. Log into **Namecheap → Domain List → inovoid.me → Manage**
2. Click **Advanced DNS**
3. Add a new **A Record**:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | `labella` | `54.xxx.xxx.xxx` | Automatic |

4. Save. Wait 5–15 minutes for DNS to propagate.
5. Test from your local machine:
```bash
ping labella.inovoid.me
# Should resolve to your Elastic IP
```

---

## 3. Connect to EC2

```bash
# Make key read-only (required)
chmod 400 your-key.pem

# SSH in
ssh -i your-key.pem ubuntu@labella.inovoid.me
```

---

## 4. Add Swap Space (important for t2.micro)

t2.micro has only 1 GB RAM. A 2 GB swap file prevents out-of-memory crashes:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
# Should show 2G under Swap
```

---

## 5. Install Docker

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin
docker compose version
# Should print: Docker Compose version v2.x.x
```

---

## 6. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /opt/labella
cd /opt/labella
```

---

## 7. Configure Environment Variables

```bash
cp backend/.env.production backend/.env
nano backend/.env
```

Edit every value marked `CHANGE_THIS`:

```env
PORT=5000
NODE_ENV=production

DB_HOST=postgres
DB_PORT=5432
DB_NAME=labellacucina
DB_USER=labella
DB_PASS=CHANGE_THIS_STRONG_PASSWORD

# Generate with: openssl rand -hex 32
JWT_SECRET=CHANGE_THIS_64_CHAR_RANDOM_STRING

PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_SECRET=your_merchant_secret
PAYHERE_SANDBOX=false

CLIENT_URL=https://labella.inovoid.me

ADMIN_EMAIL=admin@labella.inovoid.me
ADMIN_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
```

---

## 8. Issue SSL Certificate (Let's Encrypt — free)

```bash
# Step 1: Start nginx and backend (HTTP only first)
docker compose -f docker-compose.prod.yml up -d nginx backend postgres

# Step 2: Issue the SSL certificate
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your@email.com \
  --agree-tos \
  --no-eff-email \
  -d labella.inovoid.me
```

You should see:
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/labella.inovoid.me/fullchain.pem
```

```bash
# Step 3: Start all services with HTTPS
docker compose -f docker-compose.prod.yml up -d
```

---

## 9. Seed the Admin Account

```bash
docker compose -f docker-compose.prod.yml exec backend node scripts/seed-admin.js
```

---

## 10. Verify Deployment

```bash
# All 4 containers should show "Up"
docker compose -f docker-compose.prod.yml ps

# API health check
curl https://labella.inovoid.me/api/health
# Expected: {"status":"ok","time":"..."}
```

Open `https://labella.inovoid.me` in your browser — padlock should appear.

---

## 11. Set Up AWS CloudWatch Monitoring (Free)

CloudWatch is built into EC2 and monitors CPU, disk, and network for free.

**Enable detailed monitoring:**
1. **EC2 → Instances → Select your instance → Actions → Monitor and troubleshoot → Manage CloudWatch alarms**
2. Create an alarm: **CPU usage > 80% for 5 minutes → Send email notification**

**Enable billing alerts** (so you never get charged unexpectedly):
1. **AWS Console → Billing → Budgets → Create budget**
2. Set a $1 monthly budget → email alert at 80% of budget

---

## 12. Set Up GitHub Actions CI/CD

Every `git push` to `main` automatically deploys to EC2.

**Add these secrets to your GitHub repo:**
`Settings → Secrets and variables → Actions → New secret`

| Secret | Value |
|---|---|
| `EC2_HOST` | `labella.inovoid.me` |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Full contents of your `.pem` file |

The workflow file is already at `.github/workflows/deploy.yml` — push to `main` to trigger it.

---

## 13. Useful Commands

```bash
# View real-time logs
docker compose -f docker-compose.prod.yml logs -f backend

# Restart a service
docker compose -f docker-compose.prod.yml restart backend

# Check RAM usage
free -h

# Check disk usage
df -h

# Force SSL certificate renewal
docker compose -f docker-compose.prod.yml run --rm certbot renew
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Database backup
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U labella labellacucina > backup_$(date +%Y%m%d).sql
```

---

## Free Tier Limits to Watch

| Resource | Free Tier Allowance | This App Uses |
|---|---|---|
| EC2 hours | 750 hrs/month (t2.micro) | ~744 hrs (always-on) |
| EBS storage | 30 GB | ~20 GB |
| Data transfer out | 100 GB/month | Depends on traffic |
| Elastic IP | Free if associated | 1 IP |

> [!WARNING]
> The free tier lasts **12 months from your AWS account creation date**.
> After that, t2.micro costs ~$8.50/month. Set a billing alarm to get notified.
