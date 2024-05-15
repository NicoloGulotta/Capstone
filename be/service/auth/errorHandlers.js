const HTTP_STATUS_CODES = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};

const createErrorHandler = (statusCode, defaultMessage) => {
    return (err, req, res, next) => {
        if (err.status === statusCode) {
            const message = err.message || defaultMessage;
            const errors = statusCode === HTTP_STATUS_CODES.BAD_REQUEST ? err.errorList?.map((error) => error.msg) : undefined;

            res.status(statusCode).json({
                success: false,
                message,
                ...(errors && { errors }), // Include validation errors for 400 only if they exist
            });
        } else {
            next(err);
        }
    };
};

// Create error handlers for each status code
export const badRequestHandler = createErrorHandler(HTTP_STATUS_CODES.BAD_REQUEST, 'Invalid request parameters');
export const unauthorizedHandler = createErrorHandler(HTTP_STATUS_CODES.UNAUTHORIZED, 'Authorization failed');
export const forbiddenHandler = createErrorHandler(HTTP_STATUS_CODES.FORBIDDEN, 'You do not have permission to access this resource');
export const notFoundHandler = createErrorHandler(HTTP_STATUS_CODES.NOT_FOUND, 'The requested resource was not found');
export const conflictHandler = createErrorHandler(HTTP_STATUS_CODES.CONFLICT, 'Resource conflict occurred');
export const tooManyRequestsHandler = createErrorHandler(HTTP_STATUS_CODES.TOO_MANY_REQUESTS, 'Too many requests. Please try again later.');
export const serviceUnavailableHandler = createErrorHandler(HTTP_STATUS_CODES.SERVICE_UNAVAILABLE, 'Service is temporarily unavailable. Please try again later.');
export const errorHandler = createErrorHandler(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 'Service is temporarily unavailable. Please try again later.');

