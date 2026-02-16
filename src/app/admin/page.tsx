'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Settings, BarChart3, Users, Trash2, Power } from 'lucide-react';
import { Tool, TOOLS } from '@/data/tools';
import { AnalyticsEvent } from '@/lib/analytics-service';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [tools, setTools] = useState<Tool[]>(TOOLS);
    const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
    const [newTool, setNewTool] = useState<{ title: string; id: string; description: string; category: string; code?: string }>({ title: '', id: '', description: '', category: 'PDF Tools', code: '' });
    const [loading, setLoading] = useState(false);

    // Monetization Settings State
    const [settings, setSettings] = useState({
        adSenseId: '',
        headerScripts: '',
        footerScripts: '',
        showHeaderAd: true,
        showFooterAd: true
    });
    const [settingsLoading, setSettingsLoading] = useState(false);

    const fetchTools = async () => {
        const res = await fetch('/api/admin/tools');
        const data = await res.json();
        if (Array.isArray(data)) setTools([...TOOLS, ...data]);
    };

    const fetchAnalytics = async () => {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        if (Array.isArray(data)) setAnalytics(data);
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data && !data.error) {
                setSettings({
                    adSenseId: data.adSenseId || '',
                    headerScripts: data.headerScripts || '',
                    footerScripts: data.footerScripts || '',
                    showHeaderAd: data.showHeaderAd !== undefined ? data.showHeaderAd : true,
                    showFooterAd: data.showFooterAd !== undefined ? data.showFooterAd : true
                });
            }
        } catch {
            console.error("Failed to fetch settings");
        }
    };

    useEffect(() => {
        if (activeTab === 'tools') fetchTools();
        if (activeTab === 'analytics') fetchAnalytics();
        if (activeTab === 'monetization') fetchSettings();
    }, [activeTab]);

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsLoading(true);
        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            alert('Settings saved successfully!');
        } catch {
            alert('Failed to save settings');
        }
        setSettingsLoading(false);
    };



    const handleAddTool = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await fetch('/api/admin/tools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTool)
        });
        setNewTool({ title: '', id: '', description: '', category: 'PDF Tools' });
        fetchTools();
        setLoading(false);
    };

    const exportData = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Type,Data,URL,Date,IP\n"
            + analytics.map(e => `${e.type},"${JSON.stringify(e.data).replace(/"/g, '""')}",${e.url},${e.timestamp},${e.ip}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "user_intelligence_data.csv");
        document.body.appendChild(link);
        link.click();
    };

    const stats = [
        { label: 'Total Users', value: '12,450', icon: Users, color: '#4285f4' },
        { label: 'Downloads', value: '45,670', icon: BarChart3, color: '#10b981' },
        { label: 'Active Tools', value: tools.length.toString(), icon: FileText, color: '#e5322d' },
    ];

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: 'var(--card)' }}>
            {/* Sidebar */}
            <aside style={{ width: '260px', borderRight: '1px solid var(--border)', padding: '2rem 1rem' }}>
                <h2 style={{ marginBottom: '2rem', fontSize: '1.25rem' }}>Admin Panel</h2>
                <nav className="flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className="btn"
                        style={{
                            justifyContent: 'flex-start',
                            backgroundColor: activeTab === 'dashboard' ? 'var(--primary)10' : 'transparent',
                            color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--foreground)'
                        }}
                    >
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('tools')}
                        className="btn"
                        style={{
                            justifyContent: 'flex-start',
                            backgroundColor: activeTab === 'tools' ? 'var(--primary)10' : 'transparent',
                            color: activeTab === 'tools' ? 'var(--primary)' : 'var(--foreground)'
                        }}
                    >
                        <Settings size={20} /> Manage Tools
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className="btn"
                        style={{
                            justifyContent: 'flex-start',
                            backgroundColor: activeTab === 'analytics' ? 'var(--primary)10' : 'transparent',
                            color: activeTab === 'analytics' ? 'var(--primary)' : 'var(--foreground)'
                        }}
                    >
                        <BarChart3 size={20} /> User Intelligence
                    </button>
                    <button
                        onClick={() => setActiveTab('monetization')}
                        className="btn"
                        style={{
                            justifyContent: 'flex-start',
                            backgroundColor: activeTab === 'monetization' ? 'var(--primary)10' : 'transparent',
                            color: activeTab === 'monetization' ? 'var(--primary)' : 'var(--foreground)'
                        }}
                    >
                        <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>💰</span> Monetization
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem 3rem' }}>
                {activeTab === 'dashboard' && (
                    <div>
                        <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
                        <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
                            {stats.map((stat) => (
                                <div key={stat.label} className="card flex items-center gap-4">
                                    <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: `${stat.color}15`, color: stat.color }}>
                                        <stat.icon size={24} />
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{stat.label}</p>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'tools' && (
                    <div>
                        <h1 style={{ marginBottom: '2rem' }}>Manage Tools</h1>

                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Add New Tool</h3>
                            <form onSubmit={handleAddTool} className="grid grid-2 gap-4">
                                <input
                                    placeholder="Tool Title"
                                    className="p-2 border rounded"
                                    value={newTool.title}
                                    onChange={e => setNewTool({ ...newTool, title: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="Tool ID (slug)"
                                    className="p-2 border rounded"
                                    value={newTool.id}
                                    onChange={e => setNewTool({ ...newTool, id: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="Category"
                                    className="p-2 border rounded"
                                    value={newTool.category}
                                    onChange={e => setNewTool({ ...newTool, category: e.target.value })}
                                />
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Code / Script (Optional)</label>
                                    <textarea
                                        placeholder="<script>... or <div>..."
                                        className="p-2 border rounded"
                                        value={newTool.code || ''}
                                        onChange={e => setNewTool({ ...newTool, code: e.target.value })}
                                        style={{ width: '100%', minHeight: '150px', fontFamily: 'monospace', fontSize: '0.875rem' }}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="btn btn-primary">
                                    {loading ? 'Adding...' : 'Add Tool'}
                                </button>
                            </form>
                        </div>

                        <div className="grid grid-1 gap-4">
                            {tools.map((tool) => (
                                <div key={tool.id} className="card flex items-center justify-between" style={{ padding: '1rem 1.5rem' }}>
                                    <div className="flex items-center gap-4">
                                        <FileText size={24} color="var(--primary)" />
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{tool.title}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{tool.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="btn" style={{ padding: '0.5rem', color: '#10b981' }} title="Enable/Disable"><Power size={18} /></button>
                                        <button className="btn" style={{ padding: '0.5rem', color: 'var(--primary)' }} title="Delete"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div>
                        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                            <h1>User Intelligence</h1>
                            <button onClick={exportData} className="btn btn-primary">
                                Export Data (CSV)
                            </button>
                        </div>

                        <div className="card" style={{ padding: 0 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', backgroundColor: 'var(--muted)10' }}>
                                        <th style={{ padding: '1rem' }}>Type</th>
                                        <th style={{ padding: '1rem' }}>Data</th>
                                        <th style={{ padding: '1rem' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.map((event, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    backgroundColor: event.type === 'search' ? '#3b82f620' : '#10b98120',
                                                    color: event.type === 'search' ? '#3b82f6' : '#10b981',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>
                                                    {event.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace' }}>
                                                {JSON.stringify(event.data)}
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
                                                {event.createdAt ? new Date(event.createdAt).toLocaleString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {analytics.length === 0 && (
                                        <tr>
                                            <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                                                No analytics data collected yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'monetization' && (
                    <div>
                        <h1 style={{ marginBottom: '2rem' }}>Monetization Settings</h1>
                        <div className="card">
                            <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
                                <div className="grid grid-2 gap-4">
                                    <div className="flex items-center gap-2 p-4 border rounded bg-background">
                                        <input
                                            type="checkbox"
                                            id="showHeaderAd"
                                            checked={settings.showHeaderAd}
                                            onChange={(e) => setSettings({ ...settings, showHeaderAd: e.target.checked })}
                                            style={{ width: '1.25rem', height: '1.25rem' }}
                                        />
                                        <label htmlFor="showHeaderAd" style={{ fontWeight: 600, cursor: 'pointer' }}>Show Header Ad Space</label>
                                    </div>
                                    <div className="flex items-center gap-2 p-4 border rounded bg-background">
                                        <input
                                            type="checkbox"
                                            id="showFooterAd"
                                            checked={settings.showFooterAd}
                                            onChange={(e) => setSettings({ ...settings, showFooterAd: e.target.checked })}
                                            style={{ width: '1.25rem', height: '1.25rem' }}
                                        />
                                        <label htmlFor="showFooterAd" style={{ fontWeight: 600, cursor: 'pointer' }}>Show Footer Ad Space</label>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label style={{ fontWeight: 600 }}>Google AdSense Publisher ID</label>
                                    <input
                                        type="text"
                                        placeholder="pub-XXXXXXXXXXXXXXXX"
                                        value={settings.adSenseId}
                                        onChange={(e) => setSettings({ ...settings, adSenseId: e.target.value })}
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                                    />
                                    <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Format: pub-1234567890123456</p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label style={{ fontWeight: 600 }}>Custom Header Scripts</label>
                                    <textarea
                                        placeholder="<script>...</script>"
                                        value={settings.headerScripts}
                                        onChange={(e) => setSettings({ ...settings, headerScripts: e.target.value })}
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', minHeight: '150px', fontFamily: 'monospace' }}
                                    />
                                    <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Injects into &lt;head&gt;. Good for Google Analytics, Meta Pixel, etc.</p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label style={{ fontWeight: 600 }}>Custom Footer Scripts</label>
                                    <textarea
                                        placeholder="<script>...</script>"
                                        value={settings.footerScripts}
                                        onChange={(e) => setSettings({ ...settings, footerScripts: e.target.value })}
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', minHeight: '150px', fontFamily: 'monospace' }}
                                    />
                                    <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Injects before &lt;/body&gt;.</p>
                                </div>

                                <button type="submit" disabled={settingsLoading} className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem' }}>
                                    {settingsLoading ? 'Saving...' : 'Save Settings'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
