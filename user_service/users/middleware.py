import jwt
from django.conf import settings
from django.http import JsonResponse

class JWTMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return JsonResponse({'error': 'Token requerido'}, status=401)

        try:
            token = auth_header.split(" ")[1]
            decoded = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=["HS256"]
            )

            request.user_id = decoded.get('sub')

        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token expirado'}, status=401)

        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Token inválido'}, status=401)

        return self.get_response(request)
    