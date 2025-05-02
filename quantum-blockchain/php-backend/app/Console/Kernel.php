<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Console\Commands\BlockchainSync;
use App\Console\Commands\BlockchainCleanup;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Sync blockchain every 5 minutes
        $schedule->command('blockchain:sync --latest=10')
                 ->everyFiveMinutes()
                 ->withoutOverlapping();
        
        // Clean up old data once a day
        $schedule->command('blockchain:cleanup')
                 ->daily()
                 ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
