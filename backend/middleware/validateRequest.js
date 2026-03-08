import { ZodError } from "zod";

const validateRequest = (schema) => async (req, res, next) => {
    try {
        const result = await schema.safeParseAsync(req.body);
        if (!result.success) {
            const errors = result.error.issues.reduce((acc, curr) => {
                const field = curr.path.join(".");
                acc[field] = curr.message;
                return acc;
            }, {});

            return res.status(400).json({
                status: "fail",
                message: "Validation Error",
                errors
            });
        }

        // Overwrite req.body with parsed/sanitized data
        req.body = result.data;
        next();
    } catch (error) {
        next(error);
    }
};

export default validateRequest;
