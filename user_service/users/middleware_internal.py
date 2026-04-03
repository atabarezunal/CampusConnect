from django.conf import settings
from django.http import JsonResponse

class InternalOnlyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        internal_key = request.headers.get('X-INTERNAL-KEY')

        if internal_key != settings.INTERNAL_API_KEY:
            return JsonResponse({'error': 'Forbidden'}, status=403)

        return self.get_response(request)