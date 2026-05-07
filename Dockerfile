FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git curl zip unzip libpq-dev libzip-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql mbstring zip exif pcntl bcmath gd \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Match the host user UID/GID so volume mounts are writable
RUN usermod -u 1000 www-data && groupmod -g 1000 www-data

WORKDIR /var/www

COPY --chown=www-data:www-data . .

RUN composer install --no-interaction --prefer-dist --optimize-autoloader

EXPOSE 9000
CMD ["php-fpm"]
