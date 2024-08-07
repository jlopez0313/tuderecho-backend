const axios = require('axios');
const { meetings } = require('../constants/zoom');

const createMeeting = async (userId, acces_token, payload) => {

    const { data } = await axios({
        url: meetings(userId),
        method: 'post',
        data: {
            topic: payload.titulo,
            agenda: payload.objetivo,
            type : 2,
            start_time: payload.fecha,
            duration: 60,
            schedule_for: 'jlopez0313@hotmail.com'
        },
        headers: {
            Authorization: `Bearer ${acces_token}`
        }
    }).then( response => {
        return response
    }).catch( error => {
        console.log( error.data );
        return error.data || { data: 'something went wrong'}
    });

    return data;
}

module.exports = {
    createMeeting
}