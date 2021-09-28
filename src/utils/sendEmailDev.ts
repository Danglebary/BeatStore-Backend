import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export const sendEmail = async (to: string, subject: string, html: string) => {
    // const testAccount = await nodemailer.createTestAccount();
    // console.log("[SERVER]:(emailer) Test account created: ", testAccount);

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: "k37qrniftb4cqgm2@ethereal.email",
            pass: "XvGtY8ZAXs8dC9GXRJ"
        }
    } as SMTPTransport.Options);

    const info = await transporter.sendMail({
        from: '"Fred Foo" <foo@example.com>',
        to,
        subject,
        html
    });

    console.log(`[SERVER]:(emailer) Message sent: ${info.messageId} `);

    console.log(
        `[SERVER]:(emailer) Preview url: ${nodemailer.getTestMessageUrl(info)}`
    );
};
