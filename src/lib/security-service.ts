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
                // Generate comprehensive hash report
                const md5 = crypto.createHash('md5').update(primaryBuffer).digest('hex');
                const sha1 = crypto.createHash('sha1').update(primaryBuffer).digest('hex');
                const sha256 = crypto.createHash('sha256').update(primaryBuffer).digest('hex');
                const sha512 = crypto.createHash('sha512').update(primaryBuffer).digest('hex');

                const report = `File Hash Report
==================================================
File Size: ${primaryBuffer.length.toLocaleString()} bytes
Generated: ${new Date().toLocaleString()}
==================================================

MD5:
${md5}

SHA-1:
${sha1}

SHA-256:
${sha256}

SHA-512:
${sha512}

==================================================
`;
                outputBuffer = Buffer.from(report);
                contentType = 'text/plain';
                filename = `hashes_${Date.now()}.txt`;
                break;

            case 'secure-share':
                // 1. Generate a random salt and IV
                const salt = crypto.randomBytes(16);
                const ivShare = crypto.randomBytes(12); // GCM standard IV size

                // 2. Derive key from password using PBKDF2 (Matches Web Crypto API default usually)
                // We use standard params: PBKDF2, SHA-256, 100000 iterations
                const key = crypto.pbkdf2Sync(options.password || 'secret', salt, 100000, 32, 'sha256');

                // 3. Encrypt file using AES-GCM
                const cipherShare = crypto.createCipheriv('aes-256-gcm', key, ivShare);
                const encryptedShare = Buffer.concat([cipherShare.update(primaryBuffer), cipherShare.final()]);
                const authTag = cipherShare.getAuthTag();

                // 4. Prepare data for embedding
                // We need to bundle IV + AuthTag + EncryptedData so client can decrypt
                // Usually: Salt (16) + IV (12) + AuthTag (16) + EncryptedData
                // But we can embed them as separate base64 strings in the HTML for clarity.
                const payloadBase64 = encryptedShare.toString('base64');
                const saltBase64 = salt.toString('base64');
                const ivBase64 = ivShare.toString('base64');
                const tagBase64 = authTag.toString('base64');

                // 5. Expiration Logic
                const expirationHours = options.expiration || 24;
                const expirationTime = expirationHours > 0 ? Date.now() + (expirationHours * 60 * 60 * 1000) : null;
                const fileName = 'secure_file'; // or original filename if we passed it

                // 6. Generate Self-Decrypting HTML
                // We'll use a simple template with embedded vanilla JS using Web Crypto API
                const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure File Share</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; alignItems: center; height: 100vh; margin: 0; background-color: #f3f4f6; }
        .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; }
        h1 { margin-bottom: 1rem; color: #1f2937; }
        input { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; box-sizing: border-box; }
        button { background-color: #3b82f6; color: white; padding: 0.75rem; width: 100%; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
        button:hover { background-color: #2563eb; }
        .error { color: #ef4444; margin-top: 1rem; display: none; }
        .expired { color: #ef4444; font-weight: bold; }
    </style>
</head>
<body>
    <div class="card" id="loginCard">
        <h1>Secure File</h1>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">This file is password protected.</p>
        <p id="expirationMsg" style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem;"></p>
        <input type="password" id="password" placeholder="Enter Password" />
        <button onclick="decrypt()">Unlock & Download</button>
        <p class="error" id="errorMsg">Incorrect password or decryption failed.</p>
    </div>
    <script>
        const encryptedData = "${payloadBase64}";
        const salt = "${saltBase64}";
        const iv = "${ivBase64}";
        const tag = "${tagBase64}";
        const expiration = ${expirationTime}; // Timestamp
        const originalName = "downloaded_file"; // Placeholder

        // Check Expiration
        if (expiration && Date.now() > expiration) {
            document.body.innerHTML = '<div class="card"><h1 class="expired">Link Expired</h1><p>This secure file is no longer accessible.</p></div>';
        } else if (expiration) {
            const date = new Date(expiration);
            document.getElementById('expirationMsg').innerText = "Expires: " + date.toLocaleString();
        }

        async function decrypt() {
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('errorMsg');
            errorMsg.style.display = 'none';

            try {
                // 1. Convert Base64 to Buffers
                const saltBuf = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
                const ivBuf = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
                const tagBuf = Uint8Array.from(atob(tag), c => c.charCodeAt(0));
                const dataBuf = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

                // Combine data + tag for GCM (Web Crypto wants tag appended usually, or separate? AES-GCM in Web Crypto expects tag appended to ciphertext?)
                // Actually Web Crypto AES-GCM "decrypt" takes the tag APPENDED to the ciphertext if using standard implementation?
                // Node's GetAuthTag gives standalone tag.
                // Let's append tag to dataBuf for Web Crypto.
                const encryptedWithTag = new Uint8Array(dataBuf.length + tagBuf.length);
                encryptedWithTag.set(dataBuf);
                encryptedWithTag.set(tagBuf, dataBuf.length);

                // 2. Import Key
                const enc = new TextEncoder();
                const keyMaterial = await window.crypto.subtle.importKey(
                    "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
                );

                const key = await window.crypto.subtle.deriveKey(
                    { name: "PBKDF2", salt: saltBuf, iterations: 100000, hash: "SHA-256" },
                    keyMaterial,
                    { name: "AES-GCM", length: 256 },
                    true,
                    ["decrypt"]
                );

                // 3. Decrypt
                const decrypted = await window.crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: ivBuf },
                    key,
                    encryptedWithTag
                );

                // 4. Download
                const blob = new Blob([decrypted]);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = originalName; // Ideally we embed original name too
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
                
            } catch (e) {
                console.error(e);
                errorMsg.style.display = 'block';
            }
        }
    </script>
</body>
</html>
                `;

                outputBuffer = Buffer.from(htmlContent);
                contentType = 'text/html';
                filename = 'Secure_File_Share.html';
                break;

            case 'file-integrity': {
                const md5 = crypto.createHash('md5').update(primaryBuffer).digest('hex');
                const sha1 = crypto.createHash('sha1').update(primaryBuffer).digest('hex');
                const sha256 = crypto.createHash('sha256').update(primaryBuffer).digest('hex');
                const sha512 = crypto.createHash('sha512').update(primaryBuffer).digest('hex');

                let status = "REPORT GENERATED";
                let matchDetails = "No expected hash provided for verification.";

                if (options.expectedHash) {
                    const cleanExpected = options.expectedHash.trim().toLowerCase();
                    if (cleanExpected === md5 || cleanExpected === sha1 || cleanExpected === sha256 || cleanExpected === sha512) {
                        status = "MATCH CONFIRMED";
                        matchDetails = `The expected hash MATCHES the calculated file hash.
The file integrity is VERIFIED.`;
                    } else {
                        status = "⚠️ MISMATCH DETECTED ⚠️";
                        matchDetails = `The expected hash DOES NOT MATCH any calculated fingerprint.
The file may have been modified or corrupted.`;
                    }
                }

                const report = `File Integrity Report
==================================================
STATUS: ${status}
==================================================
File Size: ${primaryBuffer.length.toLocaleString()} bytes
Timestamp: ${new Date().toLocaleString()}

Verification Result:
${matchDetails}

--------------------------------------------------
Calculated File Hashes:

MD5:
${md5}

SHA-1:
${sha1}

SHA-256:
${sha256}

SHA-512:
${sha512}
==================================================
`;
                outputBuffer = Buffer.from(report);
                contentType = 'text/plain';
                filename = `integrity_check_${Date.now()}.txt`;
                break;
            }

            case 'verify-certificate':
                try {
                    // Check if X509Certificate is available (Node 15.6.0+)
                    const { X509Certificate } = crypto;

                    if (!X509Certificate) {
                        throw new Error('Certificate verification requires Node.js v15.6.0 or later.');
                    }

                    const cert = new X509Certificate(primaryBuffer);

                    const report = `Certificate Verification Report
--------------------------------------------------
Subject: ${cert.subject}
Issuer: ${cert.issuer}
Subject Alt Names: ${cert.subjectAltName || 'N/A'}
--------------------------------------------------
Validity Period:
  Valid From: ${cert.validFrom}
  Valid To:   ${cert.validTo}
--------------------------------------------------
Details:
  Serial Number: ${cert.serialNumber}
  Fingerprint (SHA-1): ${cert.fingerprint}
  Fingerprint (SHA-256): ${cert.fingerprint256}
--------------------------------------------------
Public Key:
  Type: ${cert.publicKey?.asymmetricKeyType || 'Unknown'}
  Details: ${JSON.stringify(cert.publicKey?.asymmetricKeyDetails || {}, null, 2)}
--------------------------------------------------
Status: Valid X.509 Structure
(Note: This tool verifies file structure and details. It does not perform online revocation checks.)
`;
                    outputBuffer = Buffer.from(report);
                    contentType = 'text/plain';
                    filename = `certificate_report_${Date.now()}.txt`;
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    outputBuffer = Buffer.from(`Error verifying certificate file:\n${msg}\n\nPlease ensure the file is a valid .pem, .crt, or .der certificate.`);
                    contentType = 'text/plain';
                    filename = 'verification_error.txt';
                }
                break;

            default:
                throw new Error(`Tool ${toolId} not implemented in SecurityService`);
        }

        return { buffer: outputBuffer, contentType, filename };
    }
}
