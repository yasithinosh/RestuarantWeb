# Serve static frontend files with nginx
FROM nginx:1.25-alpine

# Remove default nginx page
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy all frontend files
COPY . /usr/share/nginx/html

EXPOSE 80
