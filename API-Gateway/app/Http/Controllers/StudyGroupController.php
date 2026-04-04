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
        $request->validate([
            'name' => 'required|string|max:255',
            'id_subject' => 'required'
        ]);

        $response = Http::withHeaders([
            'Authorization' => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->post(env('STUDY_SERVICE_URL') . "/api/study/", $request->all());

        return response()->json($response->json(), $response->status());
    }

    public function createSession($groupId, Request $request)
    {
        $response = Http::withHeaders([
            'Authorization'  => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->post(env('STUDY_SERVICE_URL') . "/api/study/{$groupId}/sessions", $request->all());

        return response()->json($response->json(), $response->status());
    }

    public function getSessions($groupId, Request $request)
    {
        $response = Http::withHeaders([
            'Authorization'  => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->get(env('STUDY_SERVICE_URL') . "/api/study/{$groupId}/sessions");

        return response()->json($response->json(), $response->status());
    }

    public function assignRole(Request $request)
    {
        $response = Http::withHeaders([
            'Authorization' => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->put(env('STUDY_SERVICE_URL') . "/api/study/assign-role", $request->all());
        return response()->json($response->json(), $response->status());
    }

    public function inviteUser(Request $request)
    {
        $studyResponse = Http::withHeaders([
            'Authorization' => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->post(env('STUDY_SERVICE_URL') . "/api/study/invite", $request->all());
        if ($studyResponse->successful()) {
            $invitation = $studyResponse->json();
            $invitedUser = \App\Models\User::find($request->invitedUserId);
            if ($invitedUser) {
                Http::withHeaders(['X-INTERNAL-KEY' => env('INTERNAL_API_KEY')])
                    ->post(env('NOTIFICATION_SERVICE_URL') . "/api/notifications/send", [
                        'userId'       => $invitedUser->id,
                        'userName'     => $invitedUser->name,
                        'groupName'    => 'Nuevo Grupo de Estudio', // Podrías pasar el nombre real si lo tienes
                        'invitationId' => $invitation['id']
                    ]);
            }
        }
        return response()->json($studyResponse->json(), $studyResponse->status());
    }


    public function getMyInvitations(Request $request)
    {
        $response = Http::withHeaders([
            'Authorization' => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->get(env('STUDY_SERVICE_URL') . "/api/study/my-invitations");

        return response()->json($response->json(), $response->status());
    }

    public function acceptInvitation(Request $request)
    {
        $response = Http::withHeaders([
            'Authorization' => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->post(env('STUDY_SERVICE_URL') . "/api/study/accept-invitation", $request->all());

        return response()->json($response->json(), $response->status());
    }

    public function rejectInvitation(Request $request)
    {
        $response = Http::withHeaders([
            'Authorization' => $request->header('Authorization'),
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->post(env('STUDY_SERVICE_URL') . "/api/study/reject-invitation", $request->all());

        return response()->json($response->json(), $response->status());
    }
}
