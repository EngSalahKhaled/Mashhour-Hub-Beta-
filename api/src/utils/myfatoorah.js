const AppError = require('./AppError');

const BASE_URL = process.env.MYFATOORAH_BASE_URL || 'https://apitest.myfatoorah.com';
const API_KEY = process.env.MYFATOORAH_API_KEY;

/**
 * Initiates a payment session with MyFatoorah
 * @param {Object} paymentData - Invoice data
 * @returns {Object} Response from MyFatoorah containing InvoiceURL
 */
const sendPayment = async (paymentData) => {
    if (!API_KEY) {
        throw new AppError('MyFatoorah API Key is not configured. Payments are currently unavailable.', 503);
    }

    try {
        const response = await fetch(`${BASE_URL}/v2/SendPayment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(paymentData)
        });

        const data = await response.json();

        if (!response.ok || !data.IsSuccess) {
            console.error('[MyFatoorah SendPayment Error]', data);
            throw new AppError(data.Message || 'Failed to initiate payment with gateway.', 400);
        }

        return data.Data;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error('[MyFatoorah Network Error]', error.message);
        throw new AppError('Network error connecting to payment gateway.', 502);
    }
};

/**
 * Verifies a payment status with MyFatoorah
 * @param {String} paymentId - The ID returned by MyFatoorah webhook
 * @returns {Object} Verification response
 */
const getPaymentStatus = async (paymentId) => {
    if (!API_KEY) {
        throw new AppError('MyFatoorah API Key is not configured.', 503);
    }

    try {
        const response = await fetch(`${BASE_URL}/v2/GetPaymentStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({ KeyType: 'PaymentId', Key: paymentId })
        });

        const data = await response.json();

        if (!response.ok || !data.IsSuccess) {
            throw new AppError(data.Message || 'Failed to verify payment status.', 400);
        }

        return data.Data;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Network error connecting to payment gateway.', 502);
    }
};

module.exports = {
    sendPayment,
    getPaymentStatus
};
