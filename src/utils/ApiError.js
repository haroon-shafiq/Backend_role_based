class ApiError extends Error {
    constructor(statusCode, message, statusText) {
        super(message);
        this.statusCode = statusCode;
        this.statusText = statusText;
        this.success = false;
    }
}
export default ApiError;
