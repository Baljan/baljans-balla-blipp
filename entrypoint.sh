#!/bin/sh
set -e

envsubst < /var/www/.htpasswd.tmpl > /etc/apache2/.htpasswd

# See https://github.com/docker-library/php/blob/e573f8f7fda5d7378bae9c6a936a298b850c4076/7.1/apache/docker-php-entrypoint
# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
	set -- apache2-foreground "$@"
fi

exec "$@"
