# ============ STAGE 1: BUILD ============
FROM node:22-alpine AS builder
WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm ci

# Copiar el código y compilar
COPY . .
RUN npm run build -- --configuration=production

# ============ STAGE 2: NGINX ============
FROM nginx:1.27-alpine

# Copiar los archivos compilados
COPY --from=builder /app/dist/ecommerce-inventory-web/browser /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]