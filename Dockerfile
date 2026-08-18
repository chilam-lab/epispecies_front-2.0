# ==========================================
# Etapa 1: Build de la aplicación
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias e instalar
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copiar todo el código fuente
COPY . .

# Desactivar analíticas de Angular
RUN npx ng analytics disable

# Compilar para producción (utiliza el target configurado en angular.json)
RUN npx ng build --configuration production

# ==========================================
# Etapa 2: Servidor de producción (Nginx)
# ==========================================
FROM nginx:alpine

# Copiar la configuración personalizada de Nginx para el puerto 4200
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar la salida compilada de 'front-epi' al directorio público de Nginx
COPY --from=build /app/dist/front-epi/browser /usr/share/nginx/html

# Exponer el puerto 4200
EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
