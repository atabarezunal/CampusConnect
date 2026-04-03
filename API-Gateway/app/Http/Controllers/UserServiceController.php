<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class UserServiceController extends Controller
{
    public function getProfile($id, Request $request)
    {
        $response = Http::withHeaders([
            'Authorization' => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->get(env('USER_SERVICE_URL') . "/api/profile/$id");

        return response()->json($response->json(), $response->status());
    }

    public function createProfile(Request $request)
    {
        $response = Http::withHeaders([
            'Authorization' => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->post(env('USER_SERVICE_URL') . "/api/profile/", $request->all());

        return response()->json($response->json(), $response->status());
    }

    public function createSkill(Request $request)
    {
        $response = Http::withHeaders([
            'Authorization' => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->post(env('USER_SERVICE_URL') . "/api/skills/create/", $request->all());

        return response()->json($response->json(), $response->status());
    }

    public function getSkills(Request $request)
    {
        $response = Http::withHeaders([
            'Authorization' => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->get(env('USER_SERVICE_URL') . "/api/skills/");

        return response()->json($response->json(), $response->status());
    }
    public function assignSkill(Request $request)
    {
        $response = Http::withHeaders([
            'Authorization' => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->post(env('USER_SERVICE_URL') . "/api/skills/assign/", $request->all());

        return response()->json($response->json(), $response->status());
    }
}
