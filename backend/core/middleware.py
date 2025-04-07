class CustomCorsMiddleware:
    """
    Custom middleware to force CORS headers on all responses.
    This is a failsafe in case the django-cors-headers package isn't working properly.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        response = self.get_response(request)
        
        # Add CORS headers to all responses
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept, Authorization, X-Request-With"
        response["Access-Control-Allow-Credentials"] = "true"
        
        return response 