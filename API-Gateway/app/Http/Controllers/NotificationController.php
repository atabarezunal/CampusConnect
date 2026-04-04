<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class NotificationController extends Controller
{
    public function getMyNotifications(Request $request)
    {
        $userId = auth()->id();
        $url = env('NOTIFICATION_SERVICE_URL') . "/api/notifications/user/" . $userId;

        $response = Http::withHeaders([
            'X-INTERNAL-KEY' => env('INTERNAL_API_KEY')
        ])->get($url);

        return response()->json($response->json(), $response->status());
    }
}
