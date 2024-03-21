import { ImapFlow } from "imapflow";

const imapConfig = {
  host: process.env.IMAP_HOST!,
  port: Number(process.env.IMAP_PORT!),
  auth: {
    user: process.env.IMAP_USER!,
    pass: process.env.IMAP_PASSWORD,
  },
};

export async function ignoreEmail(uid: string) {
  const client = new ImapFlow({ ...imapConfig, logger: false });

  // Connect to the IMAP server
  await client.connect();
  await client.mailboxOpen("INBOX");

  // Mark the email as read
  await client.messageFlagsAdd({ uid }, ["\\Seen"]);
  await client.messageFlagsRemove({ uid }, ["\\Inbox"], {
    useLabels: true,
    uid: true,
  });

  // Move the email to the "Ignore" mailbox
  await client.messageMove({ uid }, "Ignore", { uid: true });

  await client.logout();
}

export async function listenEmail(
  callback: (uid: string, subject: string, body: string) => void
) {
  const client = new ImapFlow({ ...imapConfig, logger: false });

  await client.connect();
  await client.mailboxOpen("INBOX");

  client.on("exists", async (exists) => {
    const countCurrent = exists.count;
    const countPrevious = exists.prevCount;

    const countDiff = countCurrent - countPrevious;
    const countStart = countCurrent - countDiff + 1;

    // Only fetch the new emails
    const messages = client.fetch(`${countStart}:${countCurrent}`, {
      envelope: true,
      source: true,
    });

    for await (const message of messages) {
      const uid = message.uid.toString();
      const subject = message.envelope.subject;
      const content = message.source.toString();

      callback(uid, subject, content);
    }
  });
}
