const axios = require('axios');
const express = require('express');

const auth = async(req, res = express.response) => {
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
        headers: { 
          'Authorization': 'Basic ' + Buffer.from(`${process.env.ZOOM_ACCOUNT_CLIENT}:${process.env.ZOOM_ACCOUNT_SECRET}`).toString('base64'),
        },
        data : {}
    }

    axios.request(config)
    .then((response) => {
        return res.status(201).json({
            ok: true,
            response: response.data
        })
    })
    .catch((error) => {
        console.log( error )
        return res.status(500).json({
            ok: false,
            msg: 'create: Internal Error'
        })
    });
}

module.exports = {
    auth,
}