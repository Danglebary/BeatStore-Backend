// Custom imports
import { CreateBeatInput, FieldError, ValidationResponse } from "../orm_types";
import { formatError, validateStringLength } from "./validation_base";

export const validateBeatUpload: (
    options: CreateBeatInput
) => ValidationResponse = (options) => {
    const errors: FieldError[] = [];

    const isTitleValid = validateStringLength(options.title, 2, 100);
    if (!isTitleValid) {
        errors.push(formatError("title", "Too short"));
    }
    if (options.genre) {
        const isGenreValid = validateStringLength(options.genre, 2, 100);
        if (!isGenreValid) {
            errors.push(formatError("genre", "Too short"));
        }
    }

    if (errors.length > 0) return { errors };

    return { valid: true };
};
