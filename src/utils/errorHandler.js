export class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with an error
    const { status, data } = error.response;
    const message = data?.message || 'An error occurred while processing your request';
    return new ApiError(message, status, data);
  } else if (error.request) {
    // Request was made but no response was received
    return new ApiError('No response from server', 504);
  } else {
    // Something happened in setting up the request
    return new ApiError(error.message, 500);
  }
};

export const formatError = (error) => {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details
    };
  }
  return {
    message: error.message || 'An unexpected error occurred',
    statusCode: 500
  };
};
