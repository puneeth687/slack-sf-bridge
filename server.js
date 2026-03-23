const express = require('express');
const axios = require('axios');
const qs = require('qs');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const SF_BASE_URL = 'https://ka1727761468637.my.salesforce.com';
const CONSUMER_KEY = '3MVG9VTfpJmxg1yjl829M_mPjACSCXX0bta2zOKi6PcnM7Yx2xAxTkAqv1yMxipjIU2WLRT6NqDHDDiIZ44T8';
const USERNAME = 'puneeth.r@kasmodigital.com';
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDdJmXyUNlzaH7I
Exv8ED8R2/0182c5bemrXmnlmKUDEXGJDs+CWE1fLg3xT+1ML7tccf8keYLpAZ4T
IJz3s9psr4iYA0olUcawNW/HvknSzuaSnubXG5PS81F6j3KtlwMH1N1UF47BOmM/
JEpF2oW+GnlYKqxvBgTyBvfkqLCMi/pTuE/uCoIZzoOqVhlfYrO2I0ImJutmwBph
qNgD2Hf4BawE2i3PC6qyhQ1asW3Ve6JVeIoYFpnM2slbtVG3jrA51bOeTEwDrXiW
C2w52AK0NFIah/Eb48uchK2tH2VRRTzFkAMKZfx5+uGNHcpmQfc6qWUhieJdEy4s
pBjngs83AgMBAAECggEAaVAE0kzwEIZdgZegBvwRnMafIVcE/BM8aHAwi7aSNhDT
eUpFRTQZvE6pMxY10ccVOSPMNalrztwHU+J+/XJ3fLRmnsVKRNVZgcYgsgULEMmY
gZAMK7mlPprCXVP8b2/vcIZM0+PYBmpworv8ZqF2eR4QVQ0VSlWae0sYN5qhYHvR
ikYKTpNYGF/+I7SWBhVB30Es3kMyADVcyDZlvJo6OWGF0iB98E1dtdoMoadA8gal
gGOa0+hwwj6zhRxLOrwm2glTsC3O/jzC/tispE0uuEBAqNQ4n0zRw8+ysAdSsz9P
cTWlSPebXf9l9MKpDEC7mJ2MoftlgUdJtRvCvHvrWQKBgQD0TrW+tiyWEycouCWc
+wxPUdu0RZYAockya8LDKFutEfmh20syebvqdLSvi6QlJkGXLxR+dR9zBJ9WYs+L
A0N7RHxesSc18x3eqe9ro2L0UaBQXJswaHUHfOhDOny3UTfxAbS7yVdBdXn7pW2N
vnHaNeKuSN89N+aO/rMIt9aDLQKBgQDnu/WtC4706XFmxuOnIYxbxk1YJ1r7U9Q5
ksRT2KyZhW3ECBa0QgyHef/jp9wrSJKQPU72a4dqjDmpr6xL8QYeTxw9ZYyUOyKi
RImxnrPU7esvvghNV1hIJEp9oMrVnWfKl4cyKwJoQUWAkzP/3ZV3AAaQAH2h7rF5
TdaeaXKqcwKBgH+c8bB5xlZqEMVjUzpppGd2cdX7lzwjRk5RHb4FQcXoosXaH7Bx
CCiS56LexVImZpKLJCBeG5xf6L8eBB0wCjrEblakIMA8ivi5OXe3M8Q9MwlnJiUm
GyNbKpObZHP5N8hrRLXmmO53Z817/vrQZPY/uXWiWQHIRmWhQ3GlXabNAoGBAM+v
tU+RvF3jmq7yMbXoa1MVNtx66R+20c2HrE05M/ejjezTEwYa6/+/Z4cxOjHQqQp8
5/gSBxuG8WcS+uhU65becADWsldnaHLl2kJGagW79bykI+ytC4IchGZzZVZt7Ee1
5oUf5thpJ1FEnKYEgaBVdYw55F7s/kIpcOAowYvhAoGAP2eZBQrnqYpCwQlXpsl5
/ZMoVSzgMq31riKzRAgKiGa4PgnlU0usuktV3ROY5S2WQJmvSA1FXTankPCjA5Uz
9XUUyS9BYcPG8Hr0KRuHP9GMYvfoDATlKYJfGa8FbHi3ZH3d+El2/63AQKDbE2G5
I6vfZazKtH01KvyXQ7N1OHA=
-----END PRIVATE KEY-----`;

async function getAccessToken() {
    const payload = {
        iss: CONSUMER_KEY,
        sub: USERNAME,
        aud: 'https://login.salesforce.com',
        exp: Math.floor(Date.now() / 1000) + 300
    };
    const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });
    const response = await axios.post(
        'https://login.salesforce.com/services/oauth2/token',
        qs.stringify({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: token
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data.access_token;
}

async function searchAccounts(accountName, token) {
    const query = `SELECT Id, Name, Phone, Industry, BillingCity FROM Account WHERE Name LIKE '%${accountName}%' LIMIT 10`;
    const response = await axios.get(
        `${SF_BASE_URL}/services/data/v59.0/query?q=${encodeURIComponent(query)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data.records;
}

async function deleteAccount(recordId, token) {
    await axios.delete(
        `${SF_BASE_URL}/services/data/v59.0/sobjects/Account/${recordId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
}

async function sendToSlack(responseUrl, message) {
    const decoded = decodeURIComponent(responseUrl);
    await axios.post(decoded, message, {
        headers: { 'Content-Type': 'application/json' }
    });
}

function buildConfirmMessage(responseUrl, acc) {
    const base = 'https://slack-sf-bridge.onrender.com';
    const enc = encodeURIComponent(responseUrl);
    return {
        response_type: 'ephemeral',
        text: ':warning: Are you sure you want to delete this Account?',
        attachments: [{
            color: '#FF0000',
            fields: [
                { title: 'Name', value: acc.Name || 'N/A', short: true },
                { title: 'Phone', value: acc.Phone || 'N/A', short: true },
                { title: 'Industry', value: acc.Industry || 'N/A', short: true },
                { title: 'City', value: acc.BillingCity || 'N/A', short: true }
            ],
            actions: [
                { type: 'button', text: '✅ Yes, Delete', style: 'danger',
                  url: `${base}/slack/confirm?recordId=${acc.Id}&accountName=${encodeURIComponent(acc.Name)}&responseUrl=${enc}` },
                { type: 'button', text: '❌ No, Cancel',
                  url: `${base}/slack/cancel?recordId=${acc.Id}&accountName=${encodeURIComponent(acc.Name)}&responseUrl=${enc}` }
            ]
        }]
    };
}

function buildMultipleMessage(responseUrl, accounts) {
    const base = 'https://slack-sf-bridge.onrender.com';
    const enc = encodeURIComponent(responseUrl);
    return {
        response_type: 'ephemeral',
        text: ':mag: Multiple accounts found! Choose one to delete:',
        attachments: accounts.map(acc => ({
            color: '#FF8C00',
            fields: [
                { title: 'Name', value: acc.Name || 'N/A', short: true },
                { title: 'Industry', value: acc.Industry || 'N/A', short: true },
                { title: 'City', value: acc.BillingCity || 'N/A', short: true }
            ],
            actions: [
                { type: 'button', text: `✅ Delete ${acc.Name}`, style: 'danger',
                  url: `${base}/slack/confirm?recordId=${acc.Id}&accountName=${encodeURIComponent(acc.Name)}&responseUrl=${enc}` },
                { type: 'button', text: '❌ Cancel',
                  url: `${base}/slack/cancel?recordId=${acc.Id}&accountName=${encodeURIComponent(acc.Name)}&responseUrl=${enc}` }
            ]
        }))
    };
}

// Slash command
app.post('/slack/delete', async (req, res) => {
    const { text, response_url } = req.body;
    res.json({ response_type: 'ephemeral', text: ':hourglass_flowing_sand: Processing your request...' });

    try {
        if (!text || !text.trim()) {
            await sendToSlack(response_url, { response_type: 'ephemeral', text: ':warning: Please provide an Account Name. Usage: `/delete-account Kasmo Digital`' });
            return;
        }
        const token = await getAccessToken();
        const accounts = await searchAccounts(text.trim(), token);
        if (!accounts || accounts.length === 0) {
            await sendToSlack(response_url, { response_type: 'ephemeral', text: `:x: No Account found with name: *${text}*` });
            return;
        }
        const msg = accounts.length > 1
            ? buildMultipleMessage(response_url, accounts)
            : buildConfirmMessage(response_url, accounts[0]);
        await sendToSlack(response_url, msg);
    } catch (err) {
        console.error('Search error:', err.response?.data || err.message);
        try {
            await sendToSlack(response_url, { response_type: 'ephemeral', text: `:x: Error: ${err.message}` });
        } catch(e) { console.error(e.message); }
    }
});

// Confirm deletion
app.get('/slack/confirm', async (req, res) => {
    const { recordId, accountName, responseUrl } = req.query;
    res.send('<h2>Processing deletion... you can close this tab.</h2>');
    try {
        const token = await getAccessToken();
        await deleteAccount(recordId, token);
        await sendToSlack(responseUrl, {
            response_type: 'ephemeral',
            text: `:white_check_mark: Account *${accountName}* deleted successfully!`
        });
    } catch (err) {
        console.error('Delete error:', err.response?.data || err.message);
        try {
            await sendToSlack(responseUrl, { response_type: 'ephemeral', text: `:x: Error deleting: ${err.message}` });
        } catch(e) { console.error(e.message); }
    }
});

// Cancel deletion
app.get('/slack/cancel', async (req, res) => {
    const { accountName, responseUrl } = req.query;
    res.send('<h2>Deletion cancelled. You can close this tab.</h2>');
    try {
        await sendToSlack(responseUrl, {
            response_type: 'ephemeral',
            text: `:x: Deletion cancelled. *${accountName}* is safe! :relieved:`
        });
    } catch (err) {
        console.error('Cancel error:', err.message);
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running on port 3000'));
