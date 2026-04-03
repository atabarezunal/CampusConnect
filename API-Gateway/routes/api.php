<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserServiceController;


// --- RUTAS PÚBLICAS ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// --- RUTAS PROTEGIDAS POR JWT (AUTH) ---
Route::middleware('auth:api')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // --- RUTAS SOLO PARA ADMINISTRADORES ---
    Route::middleware('role:admin')->group(function () {});

    // --- RUTAS SOLO PARA ESTUDIANTES ---
    Route::middleware('role:student')->group(function () {
        Route::get('/profile/{id}', [UserServiceController::class, 'getProfile']);
        Route::post('/profile', [UserServiceController::class, 'createProfile']);

        Route::post('/skills', [UserServiceController::class, 'createSkill']);
        Route::get('/skills', [UserServiceController::class, 'getSkills']);
        Route::post('/skills/assign', [UserServiceController::class, 'assignSkill']);
    });
});
