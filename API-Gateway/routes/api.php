<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserServiceController;
use App\Http\Controllers\StudyGroupController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\NotificationController;

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

        //MICROSERVICIO USUARIOS
        Route::get('/profile/{id}', [UserServiceController::class, 'getProfile']);
        Route::post('/profile', [UserServiceController::class, 'createProfile']);
        Route::post('/skills', [UserServiceController::class, 'createSkill']);
        Route::get('/skills', [UserServiceController::class, 'getSkills']);
        Route::post('/skills/assign', [UserServiceController::class, 'assignSkill']);

        //MICROSERVICIO GRUPOS DE ESTUDIO
        Route::get('/study-groups', [StudyGroupController::class, 'index']);
        Route::post('/study-groups', [StudyGroupController::class, 'store']);
        Route::get('/study-groups/{groupId}/sessions', [StudyGroupController::class, 'getSessions']);
        Route::post('/study-groups/{groupId}/sessions', [StudyGroupController::class, 'createSession']);
        Route::put('/study-groups/assign-role', [StudyGroupController::class, 'assignRole']);
        Route::post('/study-groups/invite', [StudyGroupController::class, 'inviteUser']);
        Route::get('/my-invitations', [StudyGroupController::class, 'getMyInvitations']);
        Route::post('/accept-invitation', [StudyGroupController::class, 'acceptInvitation']);
        Route::post('/reject-invitation', [StudyGroupController::class, 'rejectInvitation']);

        //MICROSERVICIO DE PROYECTOS
        Route::get('/projects', [ProjectController::class, 'getProjects']);
        Route::post('/projects', [ProjectController::class, 'createProject']);
        Route::delete('/projects/{id}', [ProjectController::class, 'deleteProject']);
        Route::post('/projects/members', [ProjectController::class, 'addMember']);
        Route::post('/tasks', [ProjectController::class, 'createTask']);
        Route::get('/tasks/{id_project}', [ProjectController::class, 'getTasks']);
        //MICROSERVICIO DE NOTIFICACIONES
        Route::get('/my-notifications', [NotificationController::class, 'getMyNotifications']);
    });
});
