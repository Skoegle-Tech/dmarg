import InitializeSmtpConnection from "smtp-package";

const { sendOtpByEmail,
    sendOtpBySms,
    verifyOtp,
    sendCustomMessageByEmail,
    sendCustomMessageBySms } = InitializeSmtpConnection("https://otp.skoegle.com", "sf8s48fsf4s4f8s4d8f48sf");

export {
    sendOtpByEmail,
    sendOtpBySms,
    verifyOtp,
    sendCustomMessageByEmail,
    sendCustomMessageBySms
};