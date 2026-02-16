export default function PrivacyPolicy() {
    return (
        <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Privacy Policy</h1>
            <div className="flex flex-col gap-6" style={{ color: 'var(--foreground)', lineHeight: '1.8' }}>
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <section style={{ padding: '0' }}>
                    <h2 style={{ marginBottom: '1rem' }}>1. Introduction</h2>
                    <p>Welcome to ilovepdftools. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we handle your files and data when you use our services.</p>
                </section>

                <section style={{ padding: '0' }}>
                    <h2 style={{ marginBottom: '1rem' }}>2. File Security & Processing</h2>
                    <p>We take your privacy very seriously. Here is how we handle your files:</p>
                    <ul>
                        <li><strong>No Permanent Storage:</strong> We do not store your files permanently. All uploaded files are processed in-memory or in temporary storage.</li>
                        <li><strong>Automatic Deletion:</strong> All files (both original uploads and converted results) are automatically and permanently deleted from our servers within 1 hour of processing.</li>
                        <li><strong>No Access:</strong> Our staff does not have access to your files. The entire process is automated.</li>
                    </ul>
                </section>

                <section style={{ padding: '0' }}>
                    <h2 style={{ marginBottom: '1rem' }}>3. Data We Collect</h2>
                    <p>We do not require user accounts for basic features. We may collect minimal technical data such as IP addresses (for rate limiting) and browser types to improve our service.</p>
                </section>

                <section style={{ padding: '0' }}>
                    <h2 style={{ marginBottom: '1rem' }}>4. Cookies</h2>
                    <p>We use essential cookies to provide our services and may use third-party cookies (like Google Analytics) to understand how our website is used. You can manage your cookie preferences through our consent popup.</p>
                </section>

                <section style={{ padding: '0' }}>
                    <h2 style={{ marginBottom: '1rem' }}>5. Third-Party Services</h2>
                    <p>We may display advertisements provided by Google AdSense. These third-party vendors use cookies to serve ads based on your prior visits to our website or other websites.</p>
                </section>

                <section style={{ padding: '0' }}>
                    <h2 style={{ marginBottom: '1rem' }}>6. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at cmkfinancialindianpayment@gmail.com</p>
                </section>
            </div>
        </div>
    );
}
