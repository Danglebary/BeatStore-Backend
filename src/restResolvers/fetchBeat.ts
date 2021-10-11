// Custom imports
import { s3config } from "./s3Config";
// Type imports
import { Request, Response } from "express";

const bucketName = process.env.S3_BUCKET_NAME;

const s3 = s3config();

const getS3FileStream = async (fileKey: string) => {
    const options = {
        Key: fileKey,
        Bucket: bucketName
    };

    // return await s3.getObject(options).promise();

    // const metaData = await s3.headObject(options).promise();
    return s3.getObject(options).createReadStream();
};

const getS3FileMetadata = async (fileKey: string) => {
    const options = {
        Key: fileKey,
        Bucket: bucketName
    };
    const metadata = await s3.headObject(options).promise();
    return metadata;
};

export const fetchBeat = async (req: Request, res: Response) => {
    const key = req.params.key;
    const metaData = await getS3FileMetadata(key);
    if (!metaData.ContentLength) {
        res.sendStatus(500);
        return;
    }
    const stream = await getS3FileStream(key);

    const range = req.headers.range;
    if (!range) {
        res.sendStatus(416);
        return;
    }

    const positions = range.replace(/bytes=/, "").split("-");
    const start = parseInt(positions[0], 10);
    const total = metaData.ContentLength;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    res.writeHead(200, {
        "content-range": "bytes " + start + "-" + end + "/" + total,
        "accept-ranges": metaData.AcceptRanges,
        "content-type": total,
        "content-length": metaData.ContentLength
    });

    stream.pipe(res);
};
