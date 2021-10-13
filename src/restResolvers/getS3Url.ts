import { Request, Response } from "express";
import { s3config } from "./s3Config";
import { v4 } from "uuid";

const s3 = s3config();

const bucketName = process.env.S3_BUCKET_NAME;

export const getS3Url = async (req: Request, res: Response) => {
    const fileName = v4() + "." + req.body.extension;

    const params = {
        Key: fileName,
        Bucket: bucketName,
        Expires: 60
    };

    const url = await s3.getSignedUrlPromise("putObject", params);
    res.send({ url });
};
