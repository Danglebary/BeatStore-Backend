import { FieldError } from "../orm_types";

export const validateStringLength: (
    data: string,
    min: number,
    max: number
) => boolean = (data, min, max) => {
    if (data.length < min || data.length > max) return false;
    return true;
};

export const validateIsEmail: (email: string) => boolean = (email) => {
    if (!email.includes("@")) return false;
    return true;
};

export const formatError: (field: string, message: string) => FieldError = (
    field,
    msg
) => {
    return {
        field: field,
        message: msg
    };
};
