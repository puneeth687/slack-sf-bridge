const express = require("express");
const axios = require("axios");
const qs = require("qs");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

const SF_BASE_URL = "https://ka1727761468637.my.salesforce.com";
const CONSUMER_KEY = "3MVG9VTfpJmxg1yjl829M_mPjACSCXX0bta2zOKi6PcnM7Yx2xAxTkAqv1yMxipjIU2WLRT6NqDHDDiIZ44T8";
const USERNAME = "puneeth.r@kasmodigital.com";
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

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────
async function getAccessToken() {
    const payload = {
        iss: CONSUMER_KEY,
        sub: USERNAME,
        aud: "https://login.salesforce.com",
        exp: Math.floor(Date.now() / 1000) + 300,
    };
    const token = jwt.sign(payload, PRIVATE_KEY, {algorithm: "RS256"});
    const response = await axios.post(
        "https://login.salesforce.com/services/oauth2/token",
        qs.stringify({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: token,
        }),
        {headers: {"Content-Type": "application/x-www-form-urlencoded"}}
    );
    return response.data.access_token;
}

// ─────────────────────────────────────────
// SEARCH FUNCTIONS
// ─────────────────────────────────────────
async function searchRecords(objectType, searchText, token) {
    const headers = {Authorization: `Bearer ${token}`};
    const base = SF_BASE_URL + "/services/data/v59.0";
    let query = '';

    if (objectType === '/delete-account') {
        query = `SELECT Id, Name, Phone, Industry, BillingCity FROM Account WHERE Name LIKE '%${searchText}%' LIMIT 10`;
    } else if (objectType === '/delete-contact') {
        query = `SELECT Id, Name, Phone, Email, Account.Name FROM Contact WHERE Name LIKE '%${searchText}%' LIMIT 10`;
    } else if (objectType === '/delete-opportunity') {
        query = `SELECT Id, Name, CloseDate, Amount, StageName, Account.Name FROM Opportunity WHERE Name LIKE '%${searchText}%' LIMIT 10`;
    } else if (objectType === '/delete-lead') {
        query = `SELECT Id, Name, Company, LeadSource, Industry FROM Lead WHERE Name LIKE '%${searchText}%' LIMIT 10`;
    }

    const response = await axios.get(
        `${base}/query?q=${encodeURIComponent(query)}`,
        {headers}
    );
    return response.data.records;
}

// ─────────────────────────────────────────
// CHECK PORTAL USER
// ─────────────────────────────────────────
async function hasPortalUser(contactId, token) {
    const headers = {Authorization: `Bearer ${token}`};
    const base = SF_BASE_URL + "/services/data/v59.0";
    try {
        const res = await axios.get(
            `${base}/query?q=${encodeURIComponent(`SELECT Id FROM User WHERE ContactId = '${contactId}' AND IsActive = true LIMIT 1`)}`,
            {headers}
        );
        return res.data.records.length > 0;
    } catch(e) { return false; }
}

// ─────────────────────────────────────────
// DELETE FUNCTIONS
// ─────────────────────────────────────────

// Smart recursive delete for Account
function parseBlockingObjects(errorMessage) {
    const blocking = [];
    const pattern = /associated with the following ([^.:]+)[.:]/gi;
    let match;
    while ((match = pattern.exec(errorMessage)) !== null) {
        blocking.push(match[1].trim());
    }
    if (/closed won/i.test(errorMessage)) blocking.push('opportunities');
    if (/portal users/i.test(errorMessage)) blocking.push('contacts');
    return [...new Set(blocking)];
}

function resolveObjectName(raw) {
    const map = {
        'cases': 'Case', 'case': 'Case',
        'contacts': 'Contact', 'contact': 'Contact',
        'opportunities': 'Opportunity', 'opportunity': 'Opportunity',
        'orders': 'Order', 'order': 'Order',
        'contracts': 'Contract', 'contract': 'Contract',
        'assets': 'Asset', 'asset': 'Asset',
        'entitlements': 'Entitlement', 'entitlement': 'Entitlement',
        'service contracts': 'ServiceContract',
        'channel program members': 'ChannelProgramMember',
        'portal users': 'Contact',
        'active orders': 'Order',
        'sales agreements': 'Asset',
    };
    return map[raw.toLowerCase()] || null;
}

async function deleteRelated(objectName, accountId, headers, base) {
    if (objectName === 'Contact') {
        try {
            const contacts = await axios.get(
                `${base}/query?q=${encodeURIComponent(`SELECT Id FROM Contact WHERE AccountId = '${accountId}'`)}`,
                {headers}
            );
            for (const r of contacts.data.records) {
                try {
                    const users = await axios.get(
                        `${base}/query?q=${encodeURIComponent(`SELECT Id FROM User WHERE ContactId = '${r.Id}'`)}`,
                        {headers}
                    );
                    for (const u of users.data.records) {
                        try { await axios.patch(`${base}/sobjects/User/${u.Id}`, {IsActive: false}, {headers}); } catch(e) {}
                    }
                } catch(e) {}
                try { await axios.delete(`${base}/sobjects/Contact/${r.Id}`, {headers}); } catch(e) {}
            }
        } catch(e) {}
        return;
    }
    if (objectName === 'Order') {
        try {
            const orders = await axios.get(
                `${base}/query?q=${encodeURIComponent(`SELECT Id FROM Order WHERE AccountId = '${accountId}'`)}`,
                {headers}
            );
            for (const r of orders.data.records) {
                try { await axios.patch(`${base}/sobjects/Order/${r.Id}`, {Status: 'Draft'}, {headers}); } catch(e) {}
                try { await axios.delete(`${base}/sobjects/Order/${r.Id}`, {headers}); } catch(e) {}
            }
        } catch(e) {}
        return;
    }
    if (objectName === 'Opportunity') {
        try {
            const opps = await axios.get(
                `${base}/query?q=${encodeURIComponent(`SELECT Id FROM Opportunity WHERE AccountId = '${accountId}'`)}`,
                {headers}
            );
            for (const r of opps.data.records) {
                try { await axios.patch(`${base}/sobjects/Opportunity/${r.Id}`, {StageName: 'Needs Analysis'}, {headers}); } catch(e) {}
                try { await axios.delete(`${base}/sobjects/Opportunity/${r.Id}`, {headers}); } catch(e) {}
            }
        } catch(e) {}
        return;
    }
    if (objectName === 'ServiceContract') {
        try {
            const scs = await axios.get(
                `${base}/query?q=${encodeURIComponent(`SELECT Id FROM ServiceContract WHERE AccountId = '${accountId}'`)}`,
                {headers}
            );
            for (const r of scs.data.records) {
                try {
                    const lines = await axios.get(
                        `${base}/query?q=${encodeURIComponent(`SELECT Id FROM ContractLineItem WHERE ServiceContractId = '${r.Id}'`)}`,
                        {headers}
                    );
                    for (const l of lines.data.records) {
                        try { await axios.delete(`${base}/sobjects/ContractLineItem/${l.Id}`, {headers}); } catch(e) {}
                    }
                } catch(e) {}
                try { await axios.delete(`${base}/sobjects/ServiceContract/${r.Id}`, {headers}); } catch(e) {}
            }
        } catch(e) {}
        return;
    }
    // Generic
    try {
        const res = await axios.get(
            `${base}/query?q=${encodeURIComponent(`SELECT Id FROM ${objectName} WHERE AccountId = '${accountId}'`)}`,
            {headers}
        );
        for (const r of res.data.records) {
            try { await axios.delete(`${base}/sobjects/${objectName}/${r.Id}`, {headers}); } catch(e) {}
        }
    } catch(e) {}
}

async function smartDeleteAccount(recordId, token) {
    const headers = {Authorization: `Bearer ${token}`, "Content-Type": "application/json"};
    const base = SF_BASE_URL + "/services/data/v59.0";
    const maxAttempts = 10;
    const deletedObjects = new Set();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await axios.delete(`${base}/sobjects/Account/${recordId}`, {headers});
            console.log(`✅ Account deleted on attempt ${attempt}`);
            return;
        } catch (err) {
            const errorData = err.response?.data;
            const errorMessage = Array.isArray(errorData)
                ? errorData.map(e => e.message).join(' ')
                : err.message;
            const blockingRaw = parseBlockingObjects(errorMessage);
            if (blockingRaw.length === 0) throw err;
            let deletedSomething = false;
            for (const raw of blockingRaw) {
                const objectName = resolveObjectName(raw);
                if (!objectName || deletedObjects.has(objectName)) continue;
                await deleteRelated(objectName, recordId, headers, base);
                deletedObjects.add(objectName);
                deletedSomething = true;
            }
            if (!deletedSomething) throw err;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    throw new Error(`Could not delete account after ${maxAttempts} attempts`);
}

async function deleteContact(recordId, token) {
    const headers = {Authorization: `Bearer ${token}`, "Content-Type": "application/json"};
    const base = SF_BASE_URL + "/services/data/v59.0";
    // Deactivate portal user first
    try {
        const users = await axios.get(
            `${base}/query?q=${encodeURIComponent(`SELECT Id FROM User WHERE ContactId = '${recordId}'`)}`,
            {headers}
        );
        for (const u of users.data.records) {
            try { await axios.patch(`${base}/sobjects/User/${u.Id}`, {IsActive: false}, {headers}); } catch(e) {}
        }
    } catch(e) {}
    await axios.delete(`${base}/sobjects/Contact/${recordId}`, {headers});
}

async function deleteOpportunity(recordId, token) {
    const headers = {Authorization: `Bearer ${token}`, "Content-Type": "application/json"};
    const base = SF_BASE_URL + "/services/data/v59.0";
    // Unlock if closed won
    try { await axios.patch(`${base}/sobjects/Opportunity/${recordId}`, {StageName: 'Needs Analysis'}, {headers}); } catch(e) {}
    await axios.delete(`${base}/sobjects/Opportunity/${recordId}`, {headers});
}

async function deleteLead(recordId, token) {
    const headers = {Authorization: `Bearer ${token}`, "Content-Type": "application/json"};
    const base = SF_BASE_URL + "/services/data/v59.0";
    await axios.delete(`${base}/sobjects/Lead/${recordId}`, {headers});
}

// ─────────────────────────────────────────
// SLACK HELPERS
// ─────────────────────────────────────────
async function sendToSlack(responseUrl, message) {
    await axios.post(responseUrl, message, {
        headers: {"Content-Type": "application/json"},
    });
}

function buildConfirmMessage(objectType, rec) {
    let fields = [];
    let title = '';
    let recordName = rec.Name;

    if (objectType === '/delete-account') {
        title = '⚠️ Are you sure you want to delete this Account?';
        fields = [
            {title: 'Name', value: rec.Name || 'N/A', short: true},
            {title: 'Phone', value: rec.Phone || 'N/A', short: true},
            {title: 'Industry', value: rec.Industry || 'N/A', short: true},
            {title: 'City', value: rec.BillingCity || 'N/A', short: true},
        ];
    } else if (objectType === '/delete-contact') {
        title = '⚠️ Are you sure you want to delete this Contact?';
        fields = [
            {title: 'Name', value: rec.Name || 'N/A', short: true},
            {title: 'Phone', value: rec.Phone || 'N/A', short: true},
            {title: 'Email', value: rec.Email || 'N/A', short: true},
            {title: 'Account Name', value: rec.Account?.Name || 'N/A', short: true},
        ];
    } else if (objectType === '/delete-opportunity') {
        title = '⚠️ Are you sure you want to delete this Opportunity?';
        fields = [
            {title: 'Opportunity Name', value: rec.Name || 'N/A', short: true},
            {title: 'Stage', value: rec.StageName || 'N/A', short: true},
            {title: 'Close Date', value: rec.CloseDate || 'N/A', short: true},
            {title: 'Amount', value: rec.Amount ? `$${rec.Amount.toLocaleString()}` : 'N/A', short: true},
            {title: 'Account Name', value: rec.Account?.Name || 'N/A', short: true},
        ];
    } else if (objectType === '/delete-lead') {
        title = '⚠️ Are you sure you want to delete this Lead?';
        fields = [
            {title: 'Name', value: rec.Name || 'N/A', short: true},
            {title: 'Company', value: rec.Company || 'N/A', short: true},
            {title: 'Lead Source', value: rec.LeadSource || 'N/A', short: true},
            {title: 'Industry', value: rec.Industry || 'N/A', short: true},
        ];
    }

    return {
        response_type: 'ephemeral',
        text: title,
        attachments: [{
            color: '#FF0000',
            fields,
            actions: [
                {type: 'button', text: '✅ Yes, Delete', style: 'danger', name: 'action', value: `confirm|${rec.Id}|${recordName}|${objectType}`},
                {type: 'button', text: '❌ No, Cancel', name: 'action', value: `cancel|${rec.Id}|${recordName}|${objectType}`},
            ],
            callback_id: 'delete_record',
        }],
    };
}

function buildPortalWarningMessage(rec) {
    return {
        response_type: 'ephemeral',
        text: ':warning: *This contact has an active portal user!* Deleting will also deactivate their portal access. Are you sure?',
        attachments: [{
            color: '#FF8C00',
            fields: [
                {title: 'Name', value: rec.Name || 'N/A', short: true},
                {title: 'Phone', value: rec.Phone || 'N/A', short: true},
                {title: 'Email', value: rec.Email || 'N/A', short: true},
                {title: 'Account Name', value: rec.Account?.Name || 'N/A', short: true},
            ],
            actions: [
                {type: 'button', text: '✅ Yes, Delete & Deactivate Portal', style: 'danger', name: 'action', value: `confirm|${rec.Id}|${rec.Name}|/delete-contact`},
                {type: 'button', text: '❌ No, Cancel', name: 'action', value: `cancel|${rec.Id}|${rec.Name}|/delete-contact`},
            ],
            callback_id: 'delete_record',
        }],
    };
}

function buildMultipleMessage(objectType, records) {
    return {
        response_type: 'ephemeral',
        text: ':mag: Multiple records found! Choose one to delete:',
        attachments: records.map(rec => {
            let fields = [];
            if (objectType === '/delete-account') {
                fields = [
                    {title: 'Name', value: rec.Name || 'N/A', short: true},
                    {title: 'Industry', value: rec.Industry || 'N/A', short: true},
                    {title: 'City', value: rec.BillingCity || 'N/A', short: true},
                ];
            } else if (objectType === '/delete-contact') {
                fields = [
                    {title: 'Name', value: rec.Name || 'N/A', short: true},
                    {title: 'Email', value: rec.Email || 'N/A', short: true},
                    {title: 'Account', value: rec.Account?.Name || 'N/A', short: true},
                ];
            } else if (objectType === '/delete-opportunity') {
                fields = [
                    {title: 'Name', value: rec.Name || 'N/A', short: true},
                    {title: 'Stage', value: rec.StageName || 'N/A', short: true},
                    {title: 'Account', value: rec.Account?.Name || 'N/A', short: true},
                ];
            } else if (objectType === '/delete-lead') {
                fields = [
                    {title: 'Name', value: rec.Name || 'N/A', short: true},
                    {title: 'Company', value: rec.Company || 'N/A', short: true},
                ];
            }
            return {
                color: '#FF8C00',
                fields,
                actions: [
                    {type: 'button', text: `✅ Delete ${rec.Name}`, style: 'danger', name: 'action', value: `confirm|${rec.Id}|${rec.Name}|${objectType}`},
                    {type: 'button', text: '❌ Cancel', name: 'action', value: `cancel|${rec.Id}|${rec.Name}|${objectType}`},
                ],
                callback_id: 'delete_record',
            };
        }),
    };
}

// ─────────────────────────────────────────
// SLASH COMMAND HANDLER
// ─────────────────────────────────────────
app.post("/slack/delete", async (req, res) => {
    const {text, response_url, command} = req.body;
    const objectType = command; // /delete-account, /delete-contact etc.

    res.json({response_type: "ephemeral", text: ":hourglass_flowing_sand: Processing your request..."});

    try {
        if (!text || !text.trim()) {
            await sendToSlack(response_url, {
                response_type: "ephemeral",
                text: `:warning: Please provide a name. Usage: \`${command} John Smith\``,
            });
            return;
        }

        const token = await getAccessToken();
        const records = await searchRecords(objectType, text.trim(), token);

        if (!records || records.length === 0) {
            await sendToSlack(response_url, {
                response_type: "ephemeral",
                text: `:x: No record found with name: *${text}*`,
            });
            return;
        }

        // Special case: Contact with portal user warning
        if (objectType === '/delete-contact' && records.length === 1) {
            const portalExists = await hasPortalUser(records[0].Id, token);
            if (portalExists) {
                await sendToSlack(response_url, buildPortalWarningMessage(records[0]));
                return;
            }
        }

        const msg = records.length > 1
            ? buildMultipleMessage(objectType, records)
            : buildConfirmMessage(objectType, records[0]);
        await sendToSlack(response_url, msg);

    } catch (err) {
        console.error("Search error:", err.response?.data || err.message);
        try { await sendToSlack(response_url, {response_type: "ephemeral", text: `:x: Error: ${err.message}`}); } catch(e) {}
    }
});

// ─────────────────────────────────────────
// INTERACTIVE BUTTON HANDLER
// ─────────────────────────────────────────
app.post("/slack/interact", async (req, res) => {
    const payload = JSON.parse(req.body.payload);
    const action = payload.actions[0].value;
    const responseUrl = payload.response_url;
    const parts = action.split("|");
    const actionType = parts[0];
    const recordId = parts[1];
    const recordName = parts[2];
    const objectType = parts[3];

    if (actionType === "cancel") {
        res.json({
            response_type: "ephemeral",
            replace_original: true,
            text: `:x: Deletion cancelled. *${recordName}* is safe! :relieved:`,
        });
        return;
    }

    res.json({
        response_type: "ephemeral",
        replace_original: true,
        text: `:hourglass_flowing_sand: Deleting *${recordName}*...`,
    });

    try {
        const token = await getAccessToken();

        if (objectType === '/delete-account') {
            await smartDeleteAccount(recordId, token);
        } else if (objectType === '/delete-contact') {
            await deleteContact(recordId, token);
        } else if (objectType === '/delete-opportunity') {
            await deleteOpportunity(recordId, token);
        } else if (objectType === '/delete-lead') {
            await deleteLead(recordId, token);
        }

        const objectLabel = objectType.replace('/delete-', '').charAt(0).toUpperCase() +
                           objectType.replace('/delete-', '').slice(1);

        await sendToSlack(responseUrl, {
            response_type: "in_channel",
            replace_original: false,
            text: `:white_check_mark: *${objectLabel} - ${recordName}* was deleted successfully by <@${payload.user.id}> on ${new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`,
        });

    } catch (err) {
        console.error("Delete error:", err.response?.data || err.message);
        try {
            let errorMsg = `:x: Could not delete *${recordName}*.`;
            const sfErrors = err.response?.data;
            if (Array.isArray(sfErrors) && sfErrors.length > 0) {
                const raw = sfErrors[0].message || '';
                const lines = raw.split('\n').filter(l => l.trim() !== '');
                const cleanLines = lines.map(l => `• ${l.trim()}`).join('\n');
                errorMsg += `\n\n*Reason:*\n${cleanLines}`;
            } else {
                errorMsg += `\n\n*Reason:* ${err.message}`;
            }
            await sendToSlack(responseUrl, {
                response_type: "ephemeral",
                replace_original: true,
                text: errorMsg
            });
        } catch(e) { console.error(e.message); }
    }
});

app.listen(process.env.PORT || 3000, () => console.log("Server running on port 3000"));
