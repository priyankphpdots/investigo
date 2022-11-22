const axios = require('axios');

const { CLIENT_ID, APP_SECRET, BASE } = process.env;

exports.createOrder = async function (amount) {
    const accessToken = await generateAccessToken();
    const url = `${BASE}/v2/checkout/orders`;

    const response = await axios.post(
        url,
        {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: process.env.CURRENCY,
                        value: amount,
                    },
                },
            ],
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
    return response.data;
};

exports.retriveOrder = async function (orderId) {
    const accessToken = await generateAccessToken();
    const url = `${BASE}/v2/checkout/orders/${orderId}`;

    const response = await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return response.data;
};

// not used
exports.capturePayment = async function (orderId) {
    const accessToken = await generateAccessToken();
    const url = `${BASE}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const data = await response.json();
    // console.log(data);
    return data;
};

async function generateAccessToken() {
    try {
        const response = await axios(BASE + '/v1/oauth2/token', {
            method: 'post',
            params: { grant_type: 'client_credentials' },
            headers: {
                Authorization:
                    'Basic ' +
                    Buffer.from(CLIENT_ID + ':' + APP_SECRET).toString(
                        'base64'
                    ),
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.log(error);
    }
}
