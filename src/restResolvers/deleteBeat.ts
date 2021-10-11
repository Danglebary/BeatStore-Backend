// Custom imports
import { DeleteObjectRequest } from "aws-sdk/clients/s3";
import { s3config } from "./s3Config";

const bucketName = process.env.S3_BUCKET_NAME;

const s3 = s3config();

export const deleteBeat = async (key: string) => {
    const params: DeleteObjectRequest = {
        Key: key,
        Bucket: bucketName
    };
    await s3.deleteObject(params).promise();
};
