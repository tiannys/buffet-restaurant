# Buffet Restaurant System - Docker Deployment Guide

## 🐳 Quick Start with Docker

### Prerequisites
- Docker installed
- Docker Compose installed

### 1. Clone Repository
```bash
git clone https://github.com/tiannys/buffet-restaurant.git
cd buffet-restaurant
```

### 2. Start All Services
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Backend API (port 3000)
- Frontend (port 3001)

### 3. Check Status
```bash
docker-compose ps
```

All services should show "Up" status.

### 4. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 5. Seed Database
```bash
# Access backend container
docker exec -it buffet-backend sh

# Run seeding script
npx ts-node src/database/seed.ts

# Exit container
exit
```

### 6. Access Application
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api/v1
- Login: admin / admin123

---

## 🔧 Configuration

### Environment Variables

Edit `docker-compose.yml` to change:

**Database:**
```yaml
POSTGRES_USER: postgres
POSTGRES_PASSWORD: postgres123  # Change this!
POSTGRES_DB: buffet_restaurant
```

**Backend:**
```yaml
JWT_SECRET: your-super-secret-jwt-key-change-in-production  # Change this!
```

**Frontend:**
```yaml
NEXT_PUBLIC_API_URL: http://localhost:3000/api/v1
```

For production, update these to your actual domain/IP.

---

## 📦 Docker Commands

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes database)
```bash
docker-compose down -v
```

### Rebuild Services
```bash
docker-compose up -d --build
```

### Restart Specific Service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### View Resource Usage
```bash
docker stats
```

---

## 🚀 Production Deployment

### 1. Update Environment Variables
Edit `docker-compose.yml`:
- Change database password
- Change JWT secret
- Update API URL to your domain
- Set NODE_ENV to production

### 2. Use Nginx Reverse Proxy (Recommended)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔍 Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database not ready - wait for postgres health check
# 2. Port 3000 already in use - change port in docker-compose.yml
```

### Frontend won't start
```bash
# Check logs
docker-compose logs frontend

# Common issues:
# 1. Port 3001 already in use - change port in docker-compose.yml
# 2. Can't connect to backend - check NEXT_PUBLIC_API_URL
```

### Database connection failed
```bash
# Check postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Verify credentials match in docker-compose.yml
```

### Permission issues with uploads
```bash
# Fix permissions
sudo chown -R 1000:1000 backend/uploads
```

---

## 📊 Monitoring

### Check Container Health
```bash
docker-compose ps
```

### View Resource Usage
```bash
docker stats
```

### Database Backup
```bash
# Backup
docker exec buffet-postgres pg_dump -U postgres buffet_restaurant > backup.sql

# Restore
docker exec -i buffet-postgres psql -U postgres buffet_restaurant < backup.sql
```

---

## 🔄 Updates

### Pull Latest Code
```bash
git pull origin main
docker-compose up -d --build
```

---

## 📝 Notes

- Default database password is `postgres123` - **change this in production!**
- Default JWT secret is weak - **change this in production!**
- Database data persists in Docker volume `postgres_data`
- Uploaded files are stored in `backend/uploads`

---

**Made with ❤️ for Thai Buffet Restaurants** 🇹🇭
