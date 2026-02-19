import crypto from 'crypto';

export class SecurityService {
    static async process(input: Buffer | Buffer[], toolId: string, options: any = {}): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
        const buffers = Array.isArray(input) ? input : [input];
        const primaryBuffer = buffers[0];

        // Use a fixed key/iv for demo purposes or derive from password if provided
        // In a real app, we should ask for a password from the user
        const algorithm = 'aes-256-ctr';
        const secretKey = crypto.createHash('sha256').update(options.password || 'secret_key').digest();
        const iv = crypto.randomBytes(16);

        let outputBuffer: Buffer;
        let contentType = 'application/octet-stream';
        let filename = 'processed';

        switch (toolId) {
            case 'encrypt-file':
                const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
                const encrypted = Buffer.concat([cipher.update(primaryBuffer), cipher.final()]);
                // Prepend IV for decryption
                outputBuffer = Buffer.concat([iv, encrypted]);
                filename = `encrypted_${Date.now()}.enc`;
                break;

            case 'decrypt-file':
                // Extract IV
                const inputIv = primaryBuffer.subarray(0, 16);
                const encryptedContent = primaryBuffer.subarray(16);
                const decipher = crypto.createDecipheriv(algorithm, secretKey, inputIv);
                outputBuffer = Buffer.concat([decipher.update(encryptedContent), decipher.final()]);
                filename = `decrypted_${Date.now()}`;
                break;

            case 'hash-generator':
                // Generate simple text file with hashes
                const md5 = crypto.createHash('md5').update(primaryBuffer).digest('hex');
                const sha1 = crypto.createHash('sha1').update(primaryBuffer).digest('hex');
                const sha256 = crypto.createHash('sha256').update(primaryBuffer).digest('hex');

                const report = `File Hash Report\n\nMD5: ${md5}\nSHA1: ${sha1}\nSHA256: ${sha256}\n`;
                outputBuffer = Buffer.from(report);
                contentType = 'text/plain';
                filename = `hashes_${Date.now()}.txt`;
                break;

            case 'file-integrity':
                // Same as hash for now
                const hash = crypto.createHash('sha256').update(primaryBuffer).digest('hex');
                outputBuffer = Buffer.from(`SHA256: ${hash}`);
                contentType = 'text/plain';
                filename = `integrity_${Date.now()}.txt`;
                break;

            default:
                throw new Error(`Tool ${toolId} not implemented in SecurityService`);
        }

        return { buffer: outputBuffer, contentType, filename };
    }
}
