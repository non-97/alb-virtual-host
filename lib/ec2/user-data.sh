# -x to display the command to be executed
set -x

# Redirect /var/log/user-data.log and /dev/console
exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

dnf install httpd -y

tee /etc/httpd/conf.d/httpd-vhosts.conf << EOF > /dev/null
<VirtualHost *:80>
    ServerName hoge.web.non-97.net
    DocumentRoot /var/www/html/hoge

    <Directory /var/www/html/hoge>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/hoge_error_log
    CustomLog /var/log/httpd/hoge_access_log combined
</VirtualHost>

<VirtualHost *:80>
    ServerName fuga.web.non-97.net
    DocumentRoot /var/www/html/fuga

    <Directory /var/www/html/fuga>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/fuga_error_log
    CustomLog /var/log/httpd/fuga_access_log combined
</VirtualHost>
EOF

mkdir -p /var/www/html/hoge
mkdir -p /var/www/html/fuga

echo hoge > /var/www/html/hoge/index.html
echo fuga > /var/www/html/fuga/index.html

systemctl start httpd
systemctl enable httpd