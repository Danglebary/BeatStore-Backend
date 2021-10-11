// Custom imports
import {
    CreateBeatInput,
    FieldError,
    UpdateBeatInput,
    ValidationResponse
} from "../orm_types";
import {
    formatError,
    validateStringLength,
    validateMusicalKey
} from "./validation_base";

export const validateBeatUpload: (
    options: CreateBeatInput
) => ValidationResponse = (options) => {
    const errors: FieldError[] = [];

    // validate title
    const isTitleValid = validateStringLength(options.title, 2, 100);
    if (!isTitleValid) errors.push(formatError("title", "Too short"));

    // validate genre
    const isGenreValid = validateStringLength(options.genre, 2, 100);
    if (!isGenreValid) errors.push(formatError("genre", "Too short"));

    // validate key
    const isKeyValid = validateMusicalKey(options.key);
    if (!isKeyValid) errors.push(formatError("key", "invalid value"));

    if (errors.length > 0) return { errors };

    return { valid: true };
};

export const validateBeatUpdate: (
    options: UpdateBeatInput
) => ValidationResponse = (options) => {
    const errors: FieldError[] = [];

    // validate title
    const isTitleValid = validateStringLength(options.title, 2, 100);
    if (!isTitleValid) errors.push(formatError("title", "Too short"));

    // validate genre
    const isGenreValid = validateStringLength(options.genre, 2, 100);
    if (!isGenreValid) errors.push(formatError("genre", "Too short"));

    // validate key
    const isKeyValid = validateMusicalKey(options.key);
    if (!isKeyValid) errors.push(formatError("key", "invalid value"));

    if (errors.length > 0) return { errors };
    return { valid: true };
};
