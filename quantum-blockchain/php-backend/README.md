# Quantum Blockchain PHP Backend

This is the Laravel backend for the Quantum Blockchain application.

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   composer install
   ```
3. Copy the `.env.example` file to `.env` and configure your environment:
   ```bash
   cp .env.example .env
   ```
4. Generate an application key:
   ```bash
   php artisan key:generate
   ```
5. Run migrations:
   ```bash
   php artisan migrate
   ```
6. Start the development server:
   ```bash
   php artisan serve
   ```

## Blockchain Sync

To synchronize blockchain data with the database:

```bash
# Sync the latest 10 blocks
php artisan blockchain:sync --latest=10

# Sync specific block range
php artisan blockchain:sync --start=1000 --end=1100

# Force sync (overwrite existing blocks)
php artisan blockchain:sync --force
```
