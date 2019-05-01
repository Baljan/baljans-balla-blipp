FROM php:7-apache

COPY web-root/ /var/www/html/

EXPOSE 80
CMD ["apache2-foreground"]
