# Redis Setup Guide for StreetStashed MVP

## 🚀 **Quick Start (Recommended for Development)**

### Option 1: Docker (Easiest)
```bash
# Start Redis with Docker
docker run -d --name redis-streetstashed -p 6379:6379 redis:7-alpine

# Check if it's running
docker ps | grep redis

# Test connection
docker exec -it redis-streetstashed redis-cli ping
# Should return: PONG
```

### Option 2: Homebrew (macOS)
```bash
# Install Redis
brew install redis

# Start Redis service
brew services start redis

# Test connection
redis-cli ping
# Should return: PONG
```

### Option 3: Local Installation
```bash
# Download and install Redis from https://redis.io/download
# Start Redis server
redis-server

# In another terminal, test connection
redis-cli ping
```

## ⚙️ **Environment Configuration**

Add these to your `.env.local` file:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## 🔧 **Verification Steps**

1. **Start your app**: `pnpm run dev`
2. **Check logs**: You should see "Redis connected successfully"
3. **Test health endpoint**: `curl http://localhost:3000/api/health`
4. **Check Redis status**: Should show "healthy" instead of "unhealthy"

## 🐳 **Production with Docker Compose**

If you want to use the existing `docker-compose.yml`:

```bash
# Start Redis and other services
docker-compose up -d redis

# Check status
docker-compose ps
```

## ❌ **What Happens Without Redis**

- ✅ **App continues to work** (graceful fallback)
- ✅ **All features functional** (just no caching)
- ⚠️ **Performance monitoring** shows as unhealthy
- ⚠️ **Caching disabled** (slower response times)

## 🔍 **Troubleshooting**

### Redis Connection Refused
```bash
# Check if Redis is running
ps aux | grep redis

# Check if port 6379 is open
lsof -i :6379

# Restart Redis
brew services restart redis  # macOS
sudo systemctl restart redis  # Linux
```

### Permission Issues
```bash
# Check Redis logs
tail -f /usr/local/var/log/redis.log  # macOS
tail -f /var/log/redis/redis-server.log  # Linux
```

## 📊 **Performance Impact**

- **With Redis**: ~50-200ms response times
- **Without Redis**: ~200-500ms response times
- **Cache hit rate**: 60-80% (estimated)

## 🎯 **Next Steps**

1. **Choose installation method** (Docker recommended)
2. **Update environment variables**
3. **Restart your app**
4. **Verify Redis connection**
5. **Enjoy faster performance!**

---

**Note**: Redis is optional for development. Your app will work perfectly without it, just with slightly slower response times.
