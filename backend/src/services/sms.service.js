// src/services/sms.service.js

import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// send OTP for phone verification
const sendOTPSms = async (toPhone, otp) => {
    await client.messages.create({
        body: `Your AgriConnect OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: toPhone,
    });
};

// send order notification to farmer
const sendOrderNotificationSms = async (toPhone, farmerName, cropName, quantity) => {
    await client.messages.create({
        body: `Hi ${farmerName}, you have a new order on AgriConnect! Crop: ${cropName}, Quantity: ${quantity}kg. Login to check details.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: toPhone,
    });
};

// send payment confirmation to buyer
const sendPaymentConfirmationSms = async (toPhone, userName, amount) => {
    await client.messages.create({
        body: `Hi ${userName}, your payment of Rs.${amount} on AgriConnect is confirmed. Thank you!`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: toPhone,
    });
};

export {
    sendOTPSms,
    sendOrderNotificationSms,
    sendPaymentConfirmationSms,
};