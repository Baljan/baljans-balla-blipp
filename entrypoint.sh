#!/bin/sh
set -e

export HTPASSWD=`htpasswd -nb ${BLIPP_USERNAME} ${BLIPP_PASSWORD}`
envsubst < /var/www/.htpasswd.tmpl > /etc/apache2/.htpasswd
envsubst < /var/www/html/credentials.tmpl.js > /var/www/html/credentials.js

# See https://github.com/docker-library/php/blob/e573f8f7fda5d7378bae9c6a936a298b850c4076/7.1/apache/docker-php-entrypoint
# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
	set -- apache2-foreground "$@"
fi

exec "$@"
