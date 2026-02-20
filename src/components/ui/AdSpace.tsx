'use client';

interface AdSpaceProps {
    type: 'header' | 'sidebar' | 'footer' | 'in-article';
}

export const AdSpace = ({ type }: AdSpaceProps) => {
    const styles: Record<string, React.CSSProperties> = {
        header: { height: '90px', width: '100%', maxWidth: '728px', margin: '1rem auto' },
        sidebar: { height: '600px', width: '300px', margin: '0 auto' },
        footer: { height: '250px', width: '100%', maxWidth: '970px', margin: '2rem auto' },
        'in-article': { height: '250px', width: '100%', margin: '2rem 0' },
    };

    return (
        <div
            className="ad-placeholder"
            style={{
                ...styles[type],
                backgroundColor: 'var(--card)',
                border: '1px dashed var(--muted-foreground)',
                boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--muted)',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                backdropFilter: 'blur(5px)'
            }}
        >
            <div style={{ textAlign: 'center' }}>
                <p>ADVERTISEMENT</p>
                <p style={{ opacity: 0.5 }}>Placememt: {type}</p>
            </div>

            {/* 
        To activate AdSense, add the script in layout.tsx and 
        uncomment the following component once you have your client ID:
        
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
      */}
        </div>
    );
};
