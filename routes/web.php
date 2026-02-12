<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DivisionsController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TimelineController;
use App\Http\Middleware\ExternalSessionAuth;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect root to dashboard
Route::get('/', function () {
    return redirect()->route('dashboard.index');
})->middleware([ExternalSessionAuth::class]);

// Authenticated routes
Route::middleware([ExternalSessionAuth::class])->group(function () {

    Route::get('/', function () {
        return redirect()->route('dashboard.index');
    });

    Route::middleware(['auth'])->group(function () {

        Route::resource('dashboard', DashboardController::class)
            ->only(['index','show']);

        // ALL users can view tasks
        Route::resource('task', TaskController::class)
            ->only(['index','show']);

        // 🔴 ADMIN ONLY
        Route::middleware([AdminMiddleware::class])->group(function () {

            Route::resource('task', TaskController::class)
                ->only(['store','update','destroy']);

            Route::prefix('task/{task}/updates')->name('task.updates.')->group(function () {
                Route::post('/', [TaskController::class, 'storeUpdate'])->name('store');
                Route::patch('/{update}', [TaskController::class, 'updateUpdate'])->name('update');
                Route::delete('/{update}', [TaskController::class, 'destroyUpdate'])->name('destroy');
            });

            Route::resource('timeline', TimelineController::class)->only(['index','show']);
            Route::resource('employee', EmployeeController::class)->only(['index','show']);
            Route::resource('division', DivisionsController::class)->only(['index','show']);
        });


    });

});


require __DIR__.'/auth.php';
