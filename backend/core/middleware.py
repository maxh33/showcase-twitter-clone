class CustomCorsMiddleware:
    """
    Custom middleware to force CORS headers on all responses.
    This is a failsafe in case the django-cors-headers package isn't working properly.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Handle OPTIONS requests directly to support preflight
        if request.method == 'OPTIONS':
            response = self.generate_preflight_response()
            return response
        
        # For non-OPTIONS requests, process normally then add headers
        response = self.get_response(request)
        self.add_cors_headers(response)
        return response
        
    def generate_preflight_response(self):
        """Generate a response for CORS preflight requests"""
        from django.http import HttpResponse
        response = HttpResponse()
        self.add_cors_headers(response)
        return response
        
    def add_cors_headers(self, response):
        """Add CORS headers to a response"""
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept, Authorization, X-Request-With"
        # Cannot use both Allow-Origin: * and Allow-Credentials: true, so commenting this out
        # response["Access-Control-Allow-Credentials"] = "true"
        response["Access-Control-Max-Age"] = "86400"  # 24 hours 