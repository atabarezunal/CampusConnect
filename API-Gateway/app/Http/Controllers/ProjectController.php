<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProjectController extends Controller
{
    private function headers(Request $request): array
    {
        return [
            'Authorization'  => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY'),
        ];
    }

    private function url(): string
    {
        return env('PROJECT_SERVICE_URL');
    }

    public function createProject(Request $request)
    {
        $response = Http::withHeaders($this->headers($request))
            ->post($this->url() . '/api/projects', $request->all());
        return response()->json($response->json(), $response->status());
    }

    public function getProjects(Request $request)
    {
        $response = Http::withHeaders($this->headers($request))
            ->get($this->url() . '/api/projects');
        return response()->json($response->json(), $response->status());
    }

    public function deleteProject(Request $request, $id)
    {
        $response = Http::withHeaders($this->headers($request))
            ->delete($this->url() . "/api/projects/{$id}");
        return response()->json($response->json(), $response->status());
    }

    public function getProjectMembers(Request $request, $id)
    {
        $members = Http::withHeaders($this->headers($request))
            ->get($this->url() . "/api/projects/{$id}/members")
            ->json();

        // Enriquecer con nombre/email desde MySQL
        $userIds = collect($members)->pluck('user_id')->map(fn($id) => (int) $id)->all();
        $users   = \App\Models\User::whereIn('id', $userIds)
                        ->get(['id', 'name', 'email'])
                        ->keyBy('id');

        $enriched = collect($members)->map(function ($m) use ($users) {
            $user = $users->get((int) $m['user_id']);
            return [
                'user_id'    => $m['user_id'],
                'name'       => $user?->name  ?? 'Usuario desconocido',
                'email'      => $user?->email ?? '',
                'role'       => $m['role'],
                'id_project' => $m['id_project'],
            ];
        });

        return response()->json($enriched);
    }

    public function addMember(Request $request)
    {
        $response = Http::withHeaders($this->headers($request))
            ->post($this->url() . '/api/projects/members', $request->all());
        return response()->json($response->json(), $response->status());
    }

    public function removeProjectMember(Request $request, $id)
    {
        $request->validate(['user_id' => 'required']);
        $response = Http::withHeaders($this->headers($request))
            ->delete($this->url() . "/api/projects/{$id}/members", $request->all());
        return response()->json($response->json(), $response->status());
    }

    public function createTask(Request $request)
    {
        $response = Http::withHeaders($this->headers($request))
            ->post($this->url() . '/api/tasks', $request->all());
        return response()->json($response->json(), $response->status());
    }

    public function getTasks(Request $request, $id_project)
    {
        $response = Http::withHeaders($this->headers($request))
            ->get($this->url() . "/api/tasks/{$id_project}");
        return response()->json($response->json(), $response->status());
    }

    public function updateTaskStatus(Request $request, $id_task)
    {
        $request->validate(['status' => 'required|string']);
        $response = Http::withHeaders($this->headers($request))
            ->patch($this->url() . "/api/tasks/{$id_task}", $request->all());
        return response()->json($response->json(), $response->status());
    }
}