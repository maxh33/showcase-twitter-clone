from rest_framework.throttling import AnonRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """
    Throttle for authentication endpoints to prevent brute force attacks.
    Limits the rate of API calls that can be made by a given IP.
    """
    scope = 'auth'


class LoginRateThrottle(AnonRateThrottle):
    """
    Throttle specifically for login attempts.
    This can be used to implement account lockout after multiple failed attempts.
    """
    scope = 'auth'
    
    def get_cache_key(self, request, view):
        # Use the email as part of the cache key
        email = request.data.get('email', '')
        if email:
            ident = email
        else:
            ident = self.get_ident(request)
            
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        } 