from rest_framework.throttling import AnonRateThrottle
from django.conf import settings


class AuthRateThrottle(AnonRateThrottle):
    """
    Throttle for authentication endpoints to prevent brute force attacks.
    Limits the rate of API calls that can be made by a given IP.
    """
    def get_rate(self):
        if settings.TESTING:
            return None
        return '5/hour'

    def allow_request(self, request, view):
        if settings.TESTING:
            return True
        return super().allow_request(request, view)

    def get_cache_key(self, request, view):
        if settings.TESTING:
            return None
        return super().get_cache_key(request, view)


class LoginRateThrottle(AnonRateThrottle):
    """
    Throttle specifically for login attempts.
    This can be used to implement account lockout after multiple failed attempts.
    """
    def get_rate(self):
        if settings.TESTING:
            return None
        return '5/hour'

    def allow_request(self, request, view):
        if settings.TESTING:
            return True
        return super().allow_request(request, view)

    def get_cache_key(self, request, view):
        if settings.TESTING:
            return None
        if request.data and 'email' in request.data:
            ident = request.data['email']
        else:
            ident = self.get_ident(request)

        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        } 