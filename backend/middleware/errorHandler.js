// Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    console.error(err.stack);

    // Default Error Status and Message
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Handle Specific Postgres Database Errors
    if (err.code === "23505") {
        // Unique violation (e.g., email already exists)
        statusCode = 409;
        message = "A record with that information already exists.";
    }

    if (err.code === "23503") {
        // Foreign key violation
        statusCode = 400;
        message = "Invalid reference block. Operation failed.";
    }

    // Handle generic bad requests marked manually in controllers
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = err.message;
    }

    res.status(statusCode).json({
        status: "error",
        statusCode,
        message,
        // In development, send stack trace. In production, hide it.
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

export default errorHandler;
