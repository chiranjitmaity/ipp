export default function About() {
    return (
        <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem' }}>About Us</h1>
            <div className="flex flex-col gap-6" style={{ color: 'var(--foreground)', lineHeight: '1.8' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 500 }}>ilovepdftools was born out of a simple need: to make PDF and file manipulation accessible, fast, and secure for everyone.</p>

                <section style={{ padding: '0' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Our Mission</h2>
                    <p>We believe that powerful file tools shouldn&apos;t be expensive or complicated. Our mission is to provide a free, high-performance platform that solves all your document needs in one place, without forcing you to subscribe or install heavy software.</p>
                </section>

                <section style={{ padding: '0' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Why Choose Us?</h2>
                    <ul>
                        <li><strong>Speed:</strong> Our infrastructure is optimized for lightning-fast conversions.</li>
                        <li><strong>Privacy:</strong> We are a privacy-first company. Your data is your business.</li>
                        <li><strong>Simplicity:</strong> We focus on clean UI and ease of use. No manuals required.</li>
                        <li><strong>Accessibility:</strong> Works on desktop, tablet, and mobile browsers.</li>
                    </ul>
                </section>

                <section style={{ padding: '0' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Ownership & Leadership</h2>
                    <p>
                        <strong>ilovepdftools</strong> is a flagship product of
                        <strong> CMK FINANCIAL INDIAN PAYMENT PVT LTD</strong>. Our platform is managed with a
                        vision for excellence by our leadership team:
                    </p>
                    <ul style={{ marginTop: '1rem' }}>
                        <li><strong>Chiranjit Maity</strong> - Director</li>
                        <li><strong>Krishna Maity</strong> - Director</li>
                        <li><strong>Mami Rani Maity</strong> - Director</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
