const apiBaseUrl = 'https://api.zoom.us/v2/'

const meetings = (userID) => `${apiBaseUrl}users/${userID}/meetings`;


module.exports = {
    meetings
}