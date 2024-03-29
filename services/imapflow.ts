import { ImapFlow } from "imapflow";

class EmailService {
  private depth: number = 0;
  private client?: ImapFlow;

  public callback?: (uid: string, subject: string, body: string) => void;

  private static config = {
    host: process.env.IMAP_HOST!,
    port: Number(process.env.IMAP_PORT!),
    auth: {
      user: process.env.IMAP_USER!,
      pass: process.env.IMAP_PASSWORD,
    },
  };

  constructor() {
    this.connect();
  }

  async connect() {
    if (this.client) {
      this.depth += 1;

      this.client.removeAllListeners();
      this.client.close();

      console.log(`🛜 Retrying to connect for the ${this.depth} time...`);
    } else {
      console.log("🛜 Connecting to the IMAP server...");
    }

    // Overwrite the client with a new instance
    this.client = new ImapFlow({ ...EmailService.config, logger: false });

    this.client.on("close", this.onClose.bind(this));
    this.client.on("exists", this.onExists.bind(this));
    this.client.on("mailboxOpen", this.onOpen.bind(this));

    // Connect to the IMAP server
    await this.client.connect();
    await this.client.mailboxOpen("INBOX");

    return this.client;
  }

  async ignoreEmail(uid: string) {
    console.log("📧 Marking and moving email to be ignored");

    // Remove the email from the "Inbox" mailbox
    await this.client!.messageFlagsRemove({ uid }, ["\\Inbox"], {
      useLabels: true,
      uid: true,
    });

    // Move the email to the "Ignore" mailbox
    await this.client!.messageMove({ uid }, "Ignore", { uid: true });
  }

  async onExists(exists: { path: string; count: number; prevCount: number }) {
    if (!this.callback) {
      return;
    }

    const { count: countCurrent, prevCount: countPrevious } = exists;
    const countDiff = countCurrent - countPrevious;
    const countStart = countCurrent - countDiff + 1;

    const messages = this.client!.fetch(`${countStart}:${countCurrent}`, {
      envelope: true,
      source: true,
    });

    for await (const message of messages) {
      const uid = message.uid.toString();
      const subject = message.envelope.subject;
      const content = message.source.toString();

      console.log(`📧 Received email with subject: ${subject}`);

      this.callback(uid, subject, content);
    }
  }

  async onClose() {
    console.log("📧 Connection closed attempting to reconnect in 5 seconds...");

    await new Promise((resolve) => setTimeout(resolve, 5000));

    this.connect();
  }

  onOpen() {
    console.log("📧 Connection opened");
  }
}

export default EmailService;
