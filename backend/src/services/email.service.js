// src/services/email.service.js

import nodemailer from "nodemailer";

// create reusable transporter using Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// send welcome email when user registers
const sendWelcomeEmail = async (toEmail, userName) => {
    const mailOptions = {
        from: `"AgriConnect" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Welcome to AgriConnect!",
        html: `
            <h2>Welcome to AgriConnect, ${userName}!</h2>
            <p>We are glad to have you on board.</p>
            <p>AgriConnect helps farmers and buyers connect directly 
            for a transparent supply chain.</p>
            <br/>
            <p>Happy Farming!</p>
            <p><strong>Team AgriConnect</strong></p>
        `,
    };

    await transporter.sendMail(mailOptions);
};

// send order confirmation email to buyer
const sendOrderConfirmationEmail = async (toEmail, userName, orderDetails) => {
    const mailOptions = {
        from: `"AgriConnect" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Order Confirmed - AgriConnect",
        html: `
            <h2>Order Confirmed!</h2>
            <p>Hi ${userName},</p>
            <p>Your order has been placed successfully.</p>
            <h3>Order Details:</h3>
            <ul>
                <li>Crop: ${orderDetails.cropName}</li>
                <li>Quantity: ${orderDetails.quantity} kg</li>
                <li>Total Amount: ₹${orderDetails.totalAmount}</li>
            </ul>
            <p>The farmer will contact you shortly.</p>
            <br/>
            <p><strong>Team AgriConnect</strong></p>
        `,
    };

    await transporter.sendMail(mailOptions);
};

// send password reset email
const sendPasswordResetEmail = async (toEmail, userName, resetLink) => {
    const mailOptions = {
        from: `"AgriConnect" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Password Reset Request - AgriConnect",
        html: `
            <h2>Password Reset Request</h2>
            <p>Hi ${userName},</p>
            <p>We received a request to reset your password.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}" 
               style="background:#4CAF50;color:white;padding:10px 20px;
               text-decoration:none;border-radius:5px;">
               Reset Password
            </a>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
            <br/>
            <p><strong>Team AgriConnect</strong></p>
        `,
    };

    await transporter.sendMail(mailOptions);
};

// send a numeric verification code — used for both pre-registration email
// verification and OTP-based login via email
const sendOtpEmail = async (toEmail, otp) => {
    const mailOptions = {
        from: `"AgriConnect" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Your AgriConnect verification code",
        html: `
            <h2>Your verification code</h2>
            <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${otp}</p>
            <p>This code expires in 10 minutes. Do not share it with anyone.</p>
            <br/>
            <p><strong>Team AgriConnect</strong></p>
        `,
    };

    await transporter.sendMail(mailOptions);
};

// send refund confirmation email to buyer when order is cancelled
const sendRefundEmail = async (toEmail, userName, orderDetails) => {
    const mailOptions = {
        from: `"AgriConnect" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Order Cancelled & Refund Initiated - AgriConnect",
        html: `
            <h2>Order Cancelled</h2>
            <p>Hi ${userName},</p>
            <p>Your order has been cancelled and a full refund has been initiated.</p>
            <h3>Refund Details:</h3>
            <ul>
                <li>Crop: ${orderDetails.cropName}</li>
                <li>Quantity: ${orderDetails.quantity} ${orderDetails.unit}</li>
                <li>Refund Amount: ₹${orderDetails.refundAmount}</li>
                <li>Razorpay Refund ID: ${orderDetails.refundId}</li>
            </ul>
            <p>The refund will reflect in your original payment source within <strong>5–7 business days</strong> (instant refunds may arrive sooner).</p>
            <p>If you have any questions, contact AgriConnect support.</p>
            <br/>
            <p><strong>Team AgriConnect</strong></p>
        `,
    };

    await transporter.sendMail(mailOptions);
};

export {
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendPasswordResetEmail,
    sendOtpEmail,
    sendRefundEmail,
};