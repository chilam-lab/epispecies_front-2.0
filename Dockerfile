FROM node:20-alpine

WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm ci

# Copy all source code
COPY . .

# Disable Angular analytics to prevent interactive prompts
RUN npx ng analytics disable

# Expose port and start dev server
EXPOSE 4200
CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]
