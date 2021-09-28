// Custom imports
import {
    ValidationResponse,
    RegisterUserInput,
    FieldError
} from "../orm_types";
import { validateIsEmail, validateStringLength } from "./validation_base";
import { MyContext } from "../types";
import { User } from "../entities/User";

const formatError: (field: string, message: string) => FieldError = (
    field,
    msg
) => {
    return {
        field: field,
        message: msg
    };
};

export const validateRegister: (
    data: RegisterUserInput,
    em: MyContext["em"]
) => Promise<ValidationResponse> = async (data, em) => {
    const errors: FieldError[] = [];

    const userByEmail = await em.findOne(User, { email: data.email });
    const userByUsername = await em.findOne(User, { userName: data.username });

    if (userByEmail) {
        errors.push(formatError("email", "account exists with this email"));
    }
    if (userByUsername) {
        errors.push(
            formatError("username", "account exists with this username")
        );
    }

    const emailValid = validateIsEmail(data.email);
    if (!emailValid) {
        errors.push(formatError("email", "invalid email"));
    }

    const usernameCharsValid = validateIsEmail(data.username);
    if (usernameCharsValid) {
        errors.push(formatError("username", "must not include '@'"));
    }

    // username length validation
    const usernameLengthValid = validateStringLength(data.username, 3, 60);
    if (!usernameLengthValid) {
        errors.push(
            formatError("username", "must contain at least 3 characters")
        );
    }
    // password length validation
    const passwordLengthValid = validateStringLength(data.password, 8, 300);
    if (!passwordLengthValid) {
        errors.push(
            formatError("password", "must contain at least 8 characters")
        );
    }

    if (errors.length > 0) return { errors: errors };

    return { valid: true };
};

export const validateChangePassword: (
    newPassword: string
) => ValidationResponse = (newPassword) => {
    const errors: FieldError[] = [];

    const passwordLengthValid = validateStringLength(newPassword, 8, 300);
    if (!passwordLengthValid) {
        errors.push(
            formatError("password", "must contain at least 8 characters")
        );
    }

    if (errors.length > 0) return { errors: errors };
    return { valid: true };
};
