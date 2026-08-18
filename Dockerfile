# ==========================================
# Stage 1: Build the Angular Application
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency definition files and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy the entire source code
COPY . .

# Disable Angular CLI telemetry prompts
RUN npx ng analytics disable

# Build the Angular application for production
RUN npx ng build --configuration production

# ==========================================
# Stage 2: Production Server (Nginx)
# ==========================================
FROM nginx:alpine

# Copy custom Nginx configuration to listen on port 4200
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled build artifacts from the build stage to Nginx public web directory
COPY --from=build /app/dist/front-epi/browser /usr/share/nginx/html

# Expose port 4200
EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
