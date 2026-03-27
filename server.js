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

async function searchAccounts(accountName, token) {
    const query = `SELECT Id, Name, Phone, Industry, BillingCity FROM Account WHERE Name LIKE '%${accountName}%' LIMIT 10`;
    const response = await axios.get(
        `${SF_BASE_URL}/services/data/v59.0/query?q=${encodeURIComponent(query)}`,
        {headers: {Authorization: `Bearer ${token}`}}
    );
    return response.data.records;
}

// ─────────────────────────────────────────
// SMART RECURSIVE DELETE
// ─────────────────────────────────────────

// Known objects that need special handling before delete
const SPECIAL_HANDLERS = {
    'Contact': async (headers, base, recordId) => {
        // Deactivate portal users first
        try {
            const contacts = await axios.get(
                `${base}/query?q=${encodeURIComponent(`SELECT Id FROM Contact WHERE AccountId = '${recordId}'`)}`,
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
    },
    'Order': async (headers, base, recordId) => {
        // Set to Draft before deleting
        try {
            const orders = await axios.get(
                `${base}/query?q=${encodeURIComponent(`SELECT Id FROM Order WHERE AccountId = '${recordId}'`)}`,
                {headers}
            );
            for (const r of orders.data.records) {
                try { await axios.patch(`${base}/sobjects/Order/${r.Id}`, {Status: 'Draft'}, {headers}); } catch(e) {}
                try { await axios.delete(`${base}/sobjects/Order/${r.Id}`, {headers}); } catch(e) {}
            }
        } catch(e) {}
    },
    'Opportunity': async (headers, base, recordId) => {
        // Unlock closed won opps first
        try {
            const opps = await axios.get(
                `${base}/query?q=${encodeURIComponent(`SELECT Id FROM Opportunity WHERE AccountId = '${recordId}'`)}`,
                {headers}
            );
            for (const r of opps.data.records) {
                try { await axios.patch(`${base}/sobjects/Opportunity/${r.Id}`, {StageName: 'Needs Analysis'}, {headers}); } catch(e) {}
                try { await axios.delete(`${base}/sobjects/Opportunity/${r.Id}`, {headers}); } catch(e) {}
            }
        } catch(e) {}
    },
    'ServiceContract': async (headers, base, recordId) => {
        // Delete line items first
        try {
            const scs = await axios.get(
                `${base}/query?q=${encodeURIComponent(`SELECT Id FROM ServiceContract WHERE AccountId = '${recordId}'`)}`,
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
    }
};

// Parse Salesforce error to extract blocking object names and record IDs
function parseBlockingObjects(errorMessage) {
    const blocking = [];

    // Pattern: "associated with the following <object plural>.: <ids>"
    const pattern = /associated with the following ([^.:]+)[.:]/gi;
    let match;
    while ((match = pattern.exec(errorMessage)) !== null) {
        const rawName = match[1].trim();
        blocking.push(rawName);
    }

    // Pattern: "some opportunities in that account were closed won"
    if (/closed won/i.test(errorMessage)) blocking.push('opportunities');

    // Pattern: "portal users"
    if (/portal users/i.test(errorMessage)) blocking.push('contacts');

    return [...new Set(blocking)];
}

// Map plural/description to Salesforce API object name
function resolveObjectName(raw) {
    const map = {
        'cases': 'Case',
        'case': 'Case',
        'contacts': 'Contact',
        'contact': 'Contact',
        'opportunities': 'Opportunity',
        'opportunity': 'Opportunity',
        'orders': 'Order',
        'order': 'Order',
        'contracts': 'Contract',
        'contract': 'Contract',
        'assets': 'Asset',
        'asset': 'Asset',
        'entitlements': 'Entitlement',
        'entitlement': 'Entitlement',
        'service contracts': 'ServiceContract',
        'service contract': 'ServiceContract',
        'channel program members': 'ChannelProgramMember',
        'channel program member': 'ChannelProgramMember',
        'portal users': 'Contact',
        'active orders': 'Order',
        'sales agreements': 'Asset',
    };
    return map[raw.toLowerCase()] || null;
}

// Generic delete all related records by AccountId
async function deleteRelated(objectName, accountId, headers, base) {
    // Use special handler if available
    if (SPECIAL_HANDLERS[objectName]) {
        await SPECIAL_HANDLERS[objectName](headers, base, accountId);
        return;
    }
    // Generic delete by AccountId
    try {
        const res = await axios.get(
            `${base}/query?q=${encodeURIComponent(`SELECT Id FROM ${objectName} WHERE AccountId = '${accountId}'`)}`,
            {headers}
        );
        for (const r of res.data.records) {
            try { await axios.delete(`${base}/sobjects/${objectName}/${r.Id}`, {headers}); } catch(e) {}
        }
    } catch(e) {
        console.log(`Could not delete ${objectName} by AccountId, trying other fields...`);
    }
}

// SMART RECURSIVE DELETE — max 10 attempts
async function deleteAccount(recordId, token) {
    const headers = {Authorization: `Bearer ${token}`, "Content-Type": "application/json"};
    const base = SF_BASE_URL + "/services/data/v59.0";
    const maxAttempts = 10;
    const deletedObjects = new Set();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            // Try to delete the account
            await axios.delete(`${base}/sobjects/Account/${recordId}`, {headers});
            console.log(`✅ Account ${recordId} deleted successfully on attempt ${attempt}`);
            return; // SUCCESS!

        } catch (err) {
            const errorData = err.response?.data;
            const errorMessage = Array.isArray(errorData)
                ? errorData.map(e => e.message).join(' ')
                : err.message;

            console.log(`Attempt ${attempt} failed: ${errorMessage}`);

            // Extract what's blocking
            const blockingRaw = parseBlockingObjects(errorMessage);
            console.log('Blocking objects detected:', blockingRaw);

            if (blockingRaw.length === 0) {
                // No recognizable blocker — throw the error
                throw err;
            }

            // Delete each blocking object
            let deletedSomething = false;
            for (const raw of blockingRaw) {
                const objectName = resolveObjectName(raw);
                if (!objectName) {
                    console.log(`Unknown object: ${raw} — skipping`);
                    continue;
                }
                if (deletedObjects.has(objectName)) {
                    console.log(`Already tried deleting ${objectName} — skipping`);
                    continue;
                }
                console.log(`Deleting blocking object: ${objectName}`);
                await deleteRelated(objectName, recordId, headers, base);
                deletedObjects.add(objectName);
                deletedSomething = true;
            }

            if (!deletedSomething) {
                // Nothing new to delete — give up
                throw err;
            }

            // Small delay before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    throw new Error(`Could not delete account after ${maxAttempts} attempts`);
}

async function sendToSlack(responseUrl, message) {
    await axios.post(responseUrl, message, {
        headers: {"Content-Type": "application/json"},
    });
}

function buildConfirmMessage(acc) {
    return {
        response_type: "ephemeral",
        text: ":warning: Are you sure you want to delete this Account?",
        attachments: [{
            color: "#FF0000",
            fields: [
                {title: "Name", value: acc.Name || "N/A", short: true},
                {title: "Phone", value: acc.Phone || "N/A", short: true},
                {title: "Industry", value: acc.Industry || "N/A", short: true},
                {title: "City", value: acc.BillingCity || "N/A", short: true},
            ],
            actions: [
                {type: "button", text: "✅ Yes, Delete", style: "danger", name: "action", value: `confirm|${acc.Id}|${acc.Name}`},
                {type: "button", text: "❌ No, Cancel", name: "action", value: `cancel|${acc.Id}|${acc.Name}`},
            ],
            callback_id: "delete_account",
        }],
    };
}

function buildMultipleMessage(accounts) {
    return {
        response_type: "ephemeral",
        text: ":mag: Multiple accounts found! Choose one to delete:",
        attachments: accounts.map((acc) => ({
            color: "#FF8C00",
            fields: [
                {title: "Name", value: acc.Name || "N/A", short: true},
                {title: "Industry", value: acc.Industry || "N/A", short: true},
                {title: "City", value: acc.BillingCity || "N/A", short: true},
            ],
            actions: [
                {type: "button", text: `✅ Delete ${acc.Name}`, style: "danger", name: "action", value: `confirm|${acc.Id}|${acc.Name}`},
                {type: "button", text: "❌ Cancel", name: "action", value: `cancel|${acc.Id}|${acc.Name}`},
            ],
            callback_id: "delete_account",
        })),
    };
}

// Slash command
app.post("/slack/delete", async (req, res) => {
    const {text, response_url} = req.body;
    res.json({response_type: "ephemeral", text: ":hourglass_flowing_sand: Processing your request..."});
    try {
        if (!text || !text.trim()) {
            await sendToSlack(response_url, {response_type: "ephemeral", text: ":warning: Please provide an Account Name."});
            return;
        }
        const token = await getAccessToken();
        const accounts = await searchAccounts(text.trim(), token);
        if (!accounts || accounts.length === 0) {
            await sendToSlack(response_url, {response_type: "ephemeral", text: `:x: No Account found with name: *${text}*`});
            return;
        }
        const msg = accounts.length > 1 ? buildMultipleMessage(accounts) : buildConfirmMessage(accounts[0]);
        await sendToSlack(response_url, msg);
    } catch (err) {
        console.error("Search error:", err.response?.data || err.message);
        try { await sendToSlack(response_url, {response_type: "ephemeral", text: `:x: Error: ${err.message}`}); } catch(e) {}
    }
});

// Interactive button handler
app.post("/slack/interact", async (req, res) => {
    const payload = JSON.parse(req.body.payload);
    const action = payload.actions[0].value;
    const responseUrl = payload.response_url;
    const [actionType, recordId, accountName] = action.split("|");

    if (actionType === "cancel") {
        res.json({
            response_type: "ephemeral",
            replace_original: true,
            text: `:x: Deletion cancelled. *${accountName}* is safe! :relieved:`,
        });
        return;
    }

    res.json({
        response_type: "ephemeral",
        replace_original: true,
        text: `:hourglass_flowing_sand: Deleting *${accountName}*...`,
    });

    try {
        const token = await getAccessToken();
        await deleteAccount(recordId, token);
        await sendToSlack(responseUrl, {
            response_type: "in_channel",
            replace_original: false,
            text: `:white_check_mark: *${accountName}* was deleted successfully by <@${payload.user.id}> on ${new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`,
        });
    } catch (err) {
        console.error("Delete error:", err.response?.data || err.message);
        try {
            let errorMsg = `:x: Could not delete *${accountName}*.`;
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
