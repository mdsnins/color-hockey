FROM nginx:latest

COPY default.conf /etc/nginx/conf.d/default.conf
COPY html /var/www/html

RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 775 /var/www/html

CMD ["nginx", "-g", "daemon off;"]
