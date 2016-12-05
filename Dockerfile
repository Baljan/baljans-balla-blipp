FROM php:7-apache

RUN apt-get update && \
    apt-get install --no-install-recommends -y libpq-dev && \
    docker-php-ext-install pgsql

COPY . /var/www/html/

EXPOSE 80
