# Docker Setup for Yaralex Frontend

This document provides instructions for running the Yaralex frontend application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# Google OAuth Configuration (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# Node Environment
NODE_ENV=production
```

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and start the application:**
   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode:**
   ```bash
   docker-compose up -d --build
   ```

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. **Build the image:**
   ```bash
   docker build -t yaralex-frontend .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_BASE_URL=http://localhost:8000 \
     -e NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id \
     yaralex-frontend
   ```

## Development Mode

For development with hot reload, uncomment the volume mounts in `docker-compose.yaml`:

```yaml
volumes:
  - .:/app
  - /app/node_modules
  - /app/.next
```

Then run:
```bash
docker-compose -f docker-compose.yaml up --build
```

## Production Deployment

### With Nginx (Recommended for production)

Uncomment the nginx service in `docker-compose.yaml` and create an `nginx.conf` file:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server yaralex-frontend:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Environment-specific configurations

Create different compose files for different environments:

- `docker-compose.dev.yaml` - Development
- `docker-compose.staging.yaml` - Staging
- `docker-compose.prod.yaml` - Production

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   # Kill the process or change the port in docker-compose.yaml
   ```

2. **Build fails due to memory issues:**
   ```bash
   # Increase Docker memory limit in Docker Desktop settings
   # Or build with limited parallelism
   docker build --build-arg NODE_OPTIONS="--max-old-space-size=4096" .
   ```

3. **Environment variables not working:**
   - Ensure your `.env` file is in the same directory as `docker-compose.yaml`
   - Check that variable names match exactly (case-sensitive)
   - Restart containers after changing environment variables

### Logs

View application logs:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs yaralex-frontend

# Follow logs in real-time
docker-compose logs -f yaralex-frontend
```

### Container Shell Access

Access the running container:
```bash
docker-compose exec yaralex-frontend sh
```

## Performance Optimization

The Dockerfile uses multi-stage builds and Next.js standalone output for optimal performance:

- **Multi-stage build**: Reduces final image size by excluding build dependencies
- **Standalone output**: Creates a minimal runtime with only necessary files
- **Alpine Linux**: Lightweight base image
- **Non-root user**: Runs application as `nextjs` user for security

## Security Considerations

- Application runs as non-root user (`nextjs`)
- Sensitive files excluded via `.dockerignore`
- Environment variables should be managed securely in production
- Consider using Docker secrets for sensitive data in production

## Monitoring

For production deployments, consider adding:
- Health checks in the Dockerfile
- Monitoring tools (Prometheus, Grafana)
- Log aggregation (ELK stack, Fluentd)
- Container orchestration (Kubernetes, Docker Swarm) 