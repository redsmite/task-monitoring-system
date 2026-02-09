<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DivisionsController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TimelineController;
use App\Http\Middleware\ExternalSessionAuth;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard.index');
})->middleware([ExternalSessionAuth::class]);


// Route::get('/dashboard', function () {
//     return redirect()->route('dashboard.index');
// })->middleware([ExternalSessionAuth::class, 'auth']);

Route::middleware([ExternalSessionAuth::class, 'auth'])->group(function () {
    // Dashboard
    Route::resource('dashboard', DashboardController::class);

    // Tasks
    Route::resource('task', TaskController::class);
    Route::post('task/{task}/updates', [TaskController::class, 'storeUpdate'])->name('task.updates.store');
    Route::patch('task/{task}/updates/{update}', [TaskController::class, 'updateUpdate'])->name('task.updates.update');
    Route::delete('task/{task}/updates/{update}', [TaskController::class, 'destroyUpdate'])->name('task.updates.destroy');

    // Assignee
    Route::resource('assignee', EmployeeController::class);

    // Division
    Route::resource('division', DivisionsController::class);

    // Timeline
    Route::resource('timeline', TimelineController::class);

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Test Page
    Route::get('/test', function() {
        return Inertia::render('test');
    });
});

require __DIR__.'/auth.php';
