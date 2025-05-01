@echo off
echo Starting Quantum Blockchain PHP Backend...

REM Install dependencies
call composer install

REM Generate application key
call php artisan key:generate

REM Run migrations
call php artisan migrate

REM Seed the database
call php artisan db:seed

REM Start the server
call php artisan serve --port=8001