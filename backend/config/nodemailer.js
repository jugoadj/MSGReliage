const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'mailwalker.noreply@gmail.com',
        clientId: '472245683355-34u3sjqutb46mv5mujsqmk3piskh6d4k.apps.googleusercontent.com',
        clientSecret: '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',
        refreshToken: '1//04FHah3BdtiI3CgYIARAAGAQSNwF-L9Irrq4RCFKrEHqwVpj0ls9UCGoKF3nhg-IIj4FZpDYmXomasj_YRHR-2WGG9_RqU9tvZJ8',
        accessToken: 'ya29.a0AfB_byAYMd8zxWwAX_hQ1y0WqY1h32Dhc48AwnqcDsuhwfR4eTy_3oDrPsUwYrm9LBHf8-MOw9fyDsnRKmv0N7091LwXoxM8xjlx4CKzg42oF0YZ1ZNao4UJfHvhXPDnKVPg6QKzfYkiDz3ORNf-zGTiIVLJ4-2nmX7NaCgYKAekSARMSFQHGX2MipVi5eZ5e0dkNDhkK9khMuA0171',
    },
});

module.exports = transporter;
