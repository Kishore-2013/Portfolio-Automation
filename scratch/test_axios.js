const axios = require('axios');
const baseURL = 'http://localhost:3001/api';
const url = '/preview/1/status';

const fullURL = new URL(url, baseURL).href;
console.log('Native URL resolve:', fullURL);

// In Axios, it's usually baseURL + url (with some logic to avoid double slashes)
function combine(b, u) {
    return b.replace(/\/+$/, '') + '/' + u.replace(/^\/+/, '');
}
console.log('Axios combine simulation:', combine(baseURL, url));
