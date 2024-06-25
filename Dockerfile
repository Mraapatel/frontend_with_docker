# Stage 1: Build the Angular application
FROM node:alpine as build

WORKDIR /app

COPY package.json  ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the Angular application with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf *

# Copy built Angular app from Stage 1
COPY --from=build /app/dist/browser /usr/share/nginx/html
# COPY /app/dist/browser /usr/share/nginx/html

# Remove default nginx website
# RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration file
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
