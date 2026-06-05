import { EmailClient, IAuth } from "sendlix";
import type { Transport } from "nodemailer";
import type MailMessage from "nodemailer/lib/mailer/mail-message";

export interface SendlixTransportOptions {
    /**
     * Sendlix API Key
     */
    apiKey: string | IAuth;
}

export class SendlixTransport implements Transport {
    public name = 'SendlixTransport';
    public version = '1.0.0';
    public options: SendlixTransportOptions;
    private client: EmailClient;

    constructor(options: SendlixTransportOptions) {
        this.options = options;
        this.client = new EmailClient(options.apiKey);
    }

    /**
     * Sends an email using the Sendlix transport.
     * @param mail The MailMessage object from nodemailer
     * @param callback The callback function
     */
    public send(
        mail: MailMessage,
        callback: (err: Error | null, info?: any) => void
    ): void {
        const input = mail.message.createReadStream();
        const chunks: Buffer[] = [];

        input.on('data', (data: Buffer | string) => {
            chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(data));
        });

        input.on('end', () => {
            try {
                const chunk = Buffer.concat(chunks);
                this.client.sendEmlEmail(chunk)
                    .then((response: any) => {
                        callback(null, {
                            envelope: mail.data.envelope || mail.message.getEnvelope(),
                            messageId: response.messageList?.[0]
                        });
                    })
                    .catch((err: Error) => {
                        callback(err);
                    });
            } catch (err) {
                callback(err instanceof Error ? err : new Error(String(err)));
            }
        });

        input.on('error', (err: Error) => {
            callback(err);
        });
    }
}

/**
 * Creates a new Sendlix Transport instance for Nodemailer
 * @param options Transport options
 * @returns SendlixTransport instance
 */
export function sendlixTransport(options: SendlixTransportOptions) {
    return new SendlixTransport(options);
}
