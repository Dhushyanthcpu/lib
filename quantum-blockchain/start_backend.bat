@echo off
echo Starting Quantum Blockchain PHP Backend...

cd php-backend
call composer install
call php artisan key:generate
call php artisan migrate
call php artisan db:seed
call php artisan serve --port=8001