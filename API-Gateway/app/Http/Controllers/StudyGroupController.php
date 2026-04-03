<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class StudyGroupController extends Controller
{
    private $baseUrl;

    public function __construct()
    {
        $this->baseUrl = env('STUDY_SERVICE_URL') . '/api/study';
    }

    public function index(Request $request)
    {
        $response = Http::withHeaders([
            'Authorization'  => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->get("{$this->baseUrl}/my-groups");

        return response()->json($response->json(), $response->status());
    }

    public function store(Request $request)
    {
        $response = Http::withHeaders([
            'Authorization'  => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->post("{$this->baseUrl}/", $request->all());

        return response()->json($response->json(), $response->status());
    }
}