import jwt
from flask import request, jsonify
from functools import wraps
from app.config import Config

def secure_route(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        internal_key = request.headers.get('X-INTERNAL-KEY')
        if internal_key != Config.INTERNAL_API_KEY:
            return jsonify({'error': 'Forbidden'}), 403

        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Token requerido'}), 401

        try:
            token = auth_header.split(" ")[1]
            decoded = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
            request.user_id = decoded.get('sub')
        except:
            return jsonify({'error': 'Token inválido'}), 401

        return f(*args, **kwargs)

    return decorated