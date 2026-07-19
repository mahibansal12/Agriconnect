// src/services/sms.service.js

import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Twilio requires E.164 format (e.g. +919876543210). Our forms collect a
// plain 10-digit Indian mobile number, so normalize before every send.
const toE164 = (phone) => {
    if (!phone) return phone;
    const trimmed = phone.trim();
    if (trimmed.startsWith("+")) return trimmed;
    const digitsOnly = trimmed.replace(/\D/g, "");
    // 10-digit local number -> assume India (+91). Already-prefixed
    // country codes (e.g. 91xxxxxxxxxx) are passed through with a "+".
    if (digitsOnly.length === 10) return `+91${digitsOnly}`;
    return `+${digitsOnly}`;
};

// send OTP for phone verification
const sendOTPSms = async (toPhone, otp) => {
    await client.messages.create({
        body: `Your AgriConnect OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: toE164(toPhone),
    });
};

// send order notification to farmer
const sendOrderNotificationSms = async (toPhone, farmerName, cropName, quantity) => {
    await client.messages.create({
        body: `Hi ${farmerName}, you have a new order on AgriConnect! Crop: ${cropName}, Quantity: ${quantity}kg. Login to check details.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: toE164(toPhone),
    });
};

// send payment confirmation to buyer
const sendPaymentConfirmationSms = async (toPhone, userName, amount) => {
    await client.messages.create({
        body: `Hi ${userName}, your payment of Rs.${amount} on AgriConnect is confirmed. Thank you!`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: toE164(toPhone),
    });
};

// notify buyer as their order moves through confirmed -> shipped -> delivered
const ORDER_STATUS_MESSAGES = {
    confirmed: (buyerName, cropName) =>
        `Hi ${buyerName}, your order for ${cropName} on AgriConnect has been confirmed by the farmer and is being prepared.`,
    shipped: (buyerName, cropName) =>
        `Hi ${buyerName}, your order for ${cropName} on AgriConnect has been shipped and is on its way!`,
    delivered: (buyerName, cropName) =>
        `Hi ${buyerName}, your order for ${cropName} on AgriConnect has been delivered. Enjoy!`,
};

const sendOrderStatusSms = async (toPhone, buyerName, cropName, status) => {
    const buildMessage = ORDER_STATUS_MESSAGES[status];
    if (!buildMessage) return; // unknown status — nothing to send
    await client.messages.create({
        body: buildMessage(buyerName, cropName),
        from: process.env.TWILIO_PHONE_NUMBER,
        to: toE164(toPhone),
    });
};

// notify farmer once admin has paid out their pending order/donation earnings
const sendPayoutConfirmationSms = async (toPhone, farmerName, amount) => {
    await client.messages.create({
        body: `Hi ${farmerName}, your AgriConnect payout of Rs.${amount} has been sent. Check your UPI/bank account.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: toE164(toPhone),
    });
};

// notify buyer that their refund has been initiated after cancellation
const sendRefundSms = async (toPhone, buyerName, amount, cropName) => {
    await client.messages.create({
        body: `Hi ${buyerName}, your order for ${cropName} on AgriConnect has been cancelled. A full refund of Rs.${amount} has been initiated and will reach you in 5-7 business days.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: toE164(toPhone),
    });
};

export {
    sendOTPSms,
    sendOrderNotificationSms,
    sendPaymentConfirmationSms,
    sendOrderStatusSms,
    sendPayoutConfirmationSms,
    sendRefundSms,
    toE164,
};