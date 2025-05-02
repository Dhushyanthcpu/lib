@echo off
echo Installing Quantum Blockchain PHP Backend...

REM Check if composer is installed
where composer >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Composer is not installed. Please install composer first.
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
composer install

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    
    REM Generate app key
    php artisan key:generate
)

REM Run migrations
echo Running database migrations...
php artisan migrate

echo Installation completed successfully!
echo.
echo To start the development server, run:
echo php artisan serve
echo.
echo To sync blockchain data, run:
echo php artisan blockchain:sync --latest=10
