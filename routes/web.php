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
Route::middleware([ExternalSessionAuth::class, 'auth'])->group(function () {

    // Controllers accessible by ALL users
    Route::resource('dashboard', DashboardController::class)->only(['index', 'show']);

    // Profile
    // Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    // Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Test page
    Route::get('/test', function() {
        return Inertia::render('test');
    });

    // Admin-only routes for TaskController
    Route::middleware([AdminMiddleware::class])->group(function () {
        Route::resource('task', TaskController::class)
            ->only(['store', 'update', 'destroy']);

        Route::post('task/{task}/updates', [TaskController::class, 'storeUpdate'])->name('task.updates.store');
        Route::patch('task/{task}/updates/{update}', [TaskController::class, 'updateUpdate'])->name('task.updates.update');
        Route::delete('task/{task}/updates/{update}', [TaskController::class, 'destroyUpdate'])->name('task.updates.destroy');    
        Route::resource('timeline', TimelineController::class)->only(['index', 'show']);
        Route::resource('employee', EmployeeController::class)->only(['index', 'show']);
        Route::resource('division', DivisionsController::class)->only(['index', 'show']);
    });

    // Task index and show are accessible to all authenticated users
    Route::resource('task', TaskController::class)->only(['index', 'show']);
});

require __DIR__.'/auth.php';
