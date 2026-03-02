import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: `"Kharcha" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your Kharcha Login OTP",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Login OTP</h2>
                <p>Your one-time password is:</p>
                <div style="background: #f0f0f0; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otp}</span>
                </div>
                <p style="color: #666; font-size: 14px;">This OTP expires in 5 minutes. Do not share it with anyone.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};
