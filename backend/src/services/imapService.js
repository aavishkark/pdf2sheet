import imap from 'imap-simple';
import { simpleParser } from 'mailparser';
let connection = null;

export const connectImap = async () => {
    const config = {
        imap: {
            user: process.env.IMAP_USER,
            password: process.env.IMAP_PASSWORD,
            host: process.env.IMAP_HOST || 'imap.gmail.com',
            port: process.env.IMAP_PORT || 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            authTimeout: 3000
        }
    };

    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        connection = await imap.connect(config);
        console.log('IMAP Connected');

        await connection.openBox('INBOX');
        console.log('IMAP Inbox Opened');

        connection.on('mail', async (numNewMsgs) => {
            console.log(`Received ${numNewMsgs} new emails`);
            fetchNewEmails();
        });

    } catch (err) {
        console.error('IMAP Connection Error:', err);
    }
};

const fetchNewEmails = async () => {
    try {
        const searchCriteria = ['UNSEEN'];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: true
        };

        const messages = await connection.search(searchCriteria, fetchOptions);

        for (const item of messages) {
            const all = item.parts.find(part => part.which === '');
            const id = item.attributes.uid;

            if (all) {
                const mail = await simpleParser(all.body);
                console.log(`Processing email from: ${mail.from.text}`);

                if (mail.attachments && mail.attachments.length > 0) {
                    for (const attachment of mail.attachments) {
                        if (attachment.contentType === 'application/pdf') {
                            console.log(`Found PDF: ${attachment.filename}`);
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error('Error fetching emails:', err);
    }
};
