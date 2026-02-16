export default function Disclaimer() {
    return (
        <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Disclaimer</h1>
            <div className="flex flex-col gap-6" style={{ color: 'var(--foreground)', lineHeight: '1.8' }}>
                <p>The information provided by ilovepdftools is for general informational purposes only. All information on the site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability or completeness of any information on the site.</p>

                <section style={{ padding: '0' }}>
                    <h2 style={{ marginBottom: '1rem' }}>No Professional Advice</h2>
                    <p>The tools and services provided by ilovepdftools do not constitute legal, financial, or professional advice. Use of our file conversion and manipulation tools is at your own risk.</p>
                </section>

                <section style={{ padding: '0' }}>
                    <h2 style={{ marginBottom: '1rem' }}>External Links</h2>
                    <p>The Site may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability or completeness by us.</p>
                </section>

                <section style={{ padding: '0' }}>
                    <h2 style={{ marginBottom: '1rem' }}>No Responsibility for Data Loss</h2>
                    <p>While we take every precaution to ensure the safety of your files during processing, ilovepdftools is not responsible for any loss of data, file corruption, or unauthorized access that may occur during the use of our services. Always maintain backups of your original documents.</p>
                </section>

                <section style={{ padding: '0' }}>
                    <h2 style={{ marginBottom: '1rem' }}>&quot;As Is&quot; Basis</h2>
                    <p>Our services are provided on an &quot;as is&quot; and &quot;as available&quot; basis. We reserve the right to modify or discontinue any part of the service without notice at any time.</p>
                </section>
            </div>
        </div>
    );
}
