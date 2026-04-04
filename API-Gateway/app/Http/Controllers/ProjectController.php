<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProjectController extends Controller
{
    private function getHeaders($request) {
        return [
            'Authorization' => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ];
    }

    private function getUrl() {
        return env('PROJECT_SERVICE_URL'); 
    }



    public function createProject(Request $request) {
        $response = Http::withHeaders($this->getHeaders($request))
            ->post($this->getUrl() . "/api/projects", $request->all());
        return response()->json($response->json(), $response->status());
    }

    public function getProjects(Request $request) {
        $response = Http::withHeaders($this->getHeaders($request))
            ->get($this->getUrl() . "/api/projects");
        return response()->json($response->json(), $response->status());
    }

    public function deleteProject(Request $request, $id) {
        $response = Http::withHeaders($this->getHeaders($request))
            ->delete($this->getUrl() . "/api/projects/{$id}");
        return response()->json($response->json(), $response->status());
    }



    public function addMember(Request $request) {
        $response = Http::withHeaders($this->getHeaders($request))
            ->post($this->getUrl() . "/api/projects/members", $request->all());
        return response()->json($response->json(), $status = $response->status());
    }



    public function createTask(Request $request) {
        $response = Http::withHeaders($this->getHeaders($request))
            ->post($this->getUrl() . "/api/tasks", $request->all());
        return response()->json($response->json(), $response->status());
    }

    public function getTasks(Request $request, $id_project) {
        $response = Http::withHeaders($this->getHeaders($request))
            ->get($this->getUrl() . "/api/tasks/{$id_project}");
        return response()->json($response->json(), $response->status());
    }
}