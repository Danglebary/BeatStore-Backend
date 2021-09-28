export const validateStringLength: (
    data: string,
    min: number,
    max: number
) => boolean = (data, min, max) => {
    if (data.length < min || data.length > max) return false;
    return true;
};

export const validateIsEmail: (email: string) => boolean = (email) => {
    if (!email.includes('@')) return false;
    return true;
};
