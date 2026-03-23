const express = require('express');
const axios = require('axios');
const qs = require('qs');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const SF_URL = 'https://ka1727761468637.my.salesforce-sites.com/services/apexrest/slack/delete/';

app.post('/slack/delete', async (req, res) => {
    // Immediately respond to Slack within 3 seconds
    res.json({
        response_type: 'ephemeral',
        text: ':hourglass_flowing_sand: Processing your request...'
    });

    // Forward to Salesforce asynchronously
    try {
        await axios.post(SF_URL, qs.stringify(req.body), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    } catch (err) {
        console.error('SF Error:', err.message);
    }
});

app.get('/slack/delete', async (req, res) => {
    // Immediately respond
    res.json({
        response_type: 'ephemeral',
        text: ':hourglass_flowing_sand: Processing...'
    });

    // Forward to Salesforce asynchronously
    try {
        const params = new URLSearchParams(req.query).toString();
        await axios.get(SF_URL + '?' + params);
    } catch (err) {
        console.error('SF Error:', err.message);
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));