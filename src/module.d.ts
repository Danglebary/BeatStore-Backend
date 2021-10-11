declare namespace NodeJS {
    export interface ProcessEnv {
        PORT: number;
        COOKIE_NAME: string;
        FORGOT_PASSWORD_PREFIX: string;
        S3_BUCKET_NAME: string;
        S3_REGION: string;
        S3_ACCESS_KEY: string;
        S3_SECRET_ACCESS_KEY;
    }
}
