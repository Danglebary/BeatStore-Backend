// AWS imports
import { S3 } from "aws-sdk";

export const s3config = () => {
    const region = process.env.S3_REGION;
    const accessKey = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

    return new S3({
        region: region,
        credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretAccessKey
        }
    });
};
