// General imports
import { createReadStream, unlink } from "fs";
import { ManagedUpload, PutObjectRequest } from "aws-sdk/clients/s3";
// uuid imports
import { v4 } from "uuid";
// Custom imports
import { s3config } from "./s3Config";
// Type imports
import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

const bucketName = process.env.S3_BUCKET_NAME;

const handleProgress = (event: ManagedUpload.Progress, res: Response) => {
    const uploadPercent = Math.round((event.loaded / event.total) * 100);
    console.log(uploadPercent);
    const body = JSON.stringify({ body: uploadPercent });
    res.write(body);
};

const uploadToS3 = async (
    data: UploadedFile,
    res: Response
): Promise<string> => {
    const s3 = s3config();

    const fileName = v4() + "." + data.name.split(".")[1];
    const path = `./src/tmp/${fileName}`;
    await data.mv(path);
    const fileStream = createReadStream(path);

    const params: PutObjectRequest = {
        Key: fileName,
        Bucket: bucketName,
        ContentType: "audio/*",
        Body: fileStream
    };

    try {
        const result = await s3
            .upload(params)
            .on("httpUploadProgress", (event) => handleProgress(event, res))
            .promise()
            .then(async (data: ManagedUpload.SendData) => {
                unlink(path, (err) => {
                    if (err) {
                        console.log("could not delete tmp file: ", err);
                    }
                });
                return data.Key;
            });
        return result;
    } catch (err) {
        console.log(err);
        return err;
    }
};

export const uploadBeat = async (req: Request, res: Response) => {
    if (!req.files) {
        res.status(500).send({ message: "no file uploaded" });
        return;
    }

    try {
        const file = req.files.file as UploadedFile;
        const key = await uploadToS3(file, res);
        const body = JSON.stringify({ body: key });
        res.write(body);
        res.end();
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
        res.end();
    }
};
