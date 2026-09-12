FROM php:8.2-apache

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache mod_rewrite (useful for APIs and routing)
RUN a2enmod rewrite

# Copy backend files into the Apache document root
COPY . /var/www/html/

# Expose port 80
EXPOSE 80

# Update the default Apache configuration to allow overrides
RUN echo "<Directory /var/www/html/>\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>" > /etc/apache2/conf-available/override.conf \
    && a2enconf override
