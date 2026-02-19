'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Settings, BarChart3, Users, Trash2, Power, Edit, Plus, X } from 'lucide-react';
import { Tool, TOOLS } from '@/data/tools';
import { AnalyticsEvent } from '@/lib/analytics-service';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [tools, setTools] = useState<Tool[]>(TOOLS);
    const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
    const [visitorStats, setVisitorStats] = useState<{ date: string; count: number }[]>([]);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [newTool, setNewTool] = useState<{ title: string; id: string; description: string; category: string; code?: string }>({ title: '', id: '', description: '', category: 'PDF Tools', code: '' });
    const [loading, setLoading] = useState(false);

    // Blog State
    const [isEditingBlog, setIsEditingBlog] = useState(false);
    const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
    const [blogForm, setBlogForm] = useState({
        title: '',
        slug: '',
        description: '',
        content: '',
        toolId: '',
        keywords: '',
        date: ''
    });

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
        if (Array.isArray(data)) {
            setAnalytics(data);

            // Process visitor stats
            const visits = data.filter((e: any) => e.type === 'visitor');
            const dailyCounts: Record<string, Set<string>> = {};

            visits.forEach((v: any) => {
                const date = new Date(v.createdAt).toLocaleDateString();
                if (!dailyCounts[date]) dailyCounts[date] = new Set();
                if (v.ip) dailyCounts[date].add(v.ip); // Use IP or Session ID for uniqueness
            });

            const stats = Object.entries(dailyCounts).map(([date, ips]) => ({
                date,
                count: ips.size
            })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7); // Last 7 days

            setVisitorStats(stats);
        }
    };

    const fetchBlogs = async () => {
        try {
            const res = await fetch('/api/admin/blogs');
            const data = await res.json();
            if (Array.isArray(data)) setBlogs(data);
        } catch (error) {
            console.error("Failed to fetch blogs", error);
        }
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
        if (activeTab === 'analytics' || activeTab === 'dashboard') fetchAnalytics();
        if (activeTab === 'monetization') fetchSettings();
        if (activeTab === 'blogs') fetchBlogs();
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

    const handleSaveBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...blogForm,
            keywords: blogForm.keywords.split(',').map(k => k.trim())
        };

        try {
            if (isEditingBlog && editingBlogId) {
                await fetch(`/api/admin/blogs/${editingBlogId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                await fetch('/api/admin/blogs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            // Reset form
            setBlogForm({ title: '', slug: '', description: '', content: '', toolId: '', keywords: '', date: '' });
            setIsEditingBlog(false);
            setEditingBlogId(null);
            fetchBlogs();
            alert(isEditingBlog ? 'Blog updated!' : 'Blog created!');
        } catch (error) {
            alert('Failed to save blog');
        }
        setLoading(false);
    };

    const handleEditBlog = (blog: any) => {
        setBlogForm({
            title: blog.title,
            slug: blog.slug,
            description: blog.description,
            content: blog.content,
            toolId: blog.toolId,
            keywords: Array.isArray(blog.keywords) ? blog.keywords.join(', ') : blog.keywords || '',
            date: blog.date
        });
        setEditingBlogId(blog._id);
        setIsEditingBlog(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteBlog = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;
        try {
            await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
            fetchBlogs();
        } catch (error) {
            alert('Failed to delete blog');
        }
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

    const totalVisitors = analytics.filter(e => e.type === 'visitor').length;

    const stats = [
        { label: 'Total Events', value: analytics.length.toString(), icon: BarChart3, color: '#10b981' },
        { label: 'Unique Visitors (Est)', value: totalVisitors.toString(), icon: Users, color: '#4285f4' },
        { label: 'Active Tools', value: tools.length.toString(), icon: FileText, color: '#e5322d' },
    ];

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: 'var(--card)' }}>
            {/* Sidebar */}
            <aside style={{ width: '260px', borderRight: '1px solid var(--border)', padding: '2rem 1rem' }}>
                <h2 style={{ marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Admin Panel</h2>
                <nav className="flex flex-col gap-2">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'tools', label: 'Manage Tools', icon: Settings },
                        { id: 'blogs', label: 'Manage Blogs', icon: FileText },
                        { id: 'analytics', label: 'User Intelligence', icon: BarChart3 },
                        { id: 'monetization', label: 'Monetization', icon: null, emoji: '💰' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className="btn"
                            style={{
                                justifyContent: 'flex-start',
                                backgroundColor: activeTab === item.id ? 'var(--primary)10' : 'transparent',
                                color: activeTab === item.id ? 'var(--primary)' : 'var(--foreground)',
                                fontWeight: activeTab === item.id ? 600 : 400
                            }}
                        >
                            {item.icon && <item.icon size={20} />}
                            {item.emoji && <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>{item.emoji}</span>}
                            {item.label}
                        </button>
                    ))}
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

                        {/* Recent Visitor Chart Placeholder */}
                        <div className="card">
                            <h3 className="mb-4 text-lg font-bold">Recent Traffic Trend</h3>
                            {visitorStats.length > 0 ? (
                                <div className="flex items-end gap-2 h-40">
                                    {visitorStats.map((stat, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center">
                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: `${Math.max(stat.count * 5, 10)}%`, // Simple scaling
                                                    backgroundColor: 'var(--primary)',
                                                    opacity: 0.7,
                                                    borderRadius: '4px'
                                                }}
                                                title={`${stat.count} visitors`}
                                            ></div>
                                            <span className="text-xs text-muted-foreground mt-2 rotate-45 origin-left">{stat.date.slice(0, 5)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No data available yet.</p>
                            )}
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

                {activeTab === 'blogs' && (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="m-0">Manage Blog Posts</h1>
                            {!isEditingBlog && (
                                <button
                                    onClick={() => { setIsEditingBlog(true); setEditingBlogId(null); }}
                                    className="btn btn-primary flex items-center gap-2"
                                >
                                    <Plus size={18} /> New Post
                                </button>
                            )}
                        </div>

                        {isEditingBlog && (
                            <div className="card mb-8 animate-in fade-in slide-in-from-top-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3>{editingBlogId ? 'Edit Post' : 'Create New Post'}</h3>
                                    <button onClick={() => setIsEditingBlog(false)} className="btn text-muted-foreground"><X size={20} /></button>
                                </div>
                                <form onSubmit={handleSaveBlog} className="grid gap-4">
                                    <div className="grid grid-2 gap-4">
                                        <input
                                            placeholder="Post Title"
                                            className="p-2 border rounded"
                                            value={blogForm.title}
                                            onChange={e => setBlogForm({ ...blogForm, title: e.target.value })}
                                            required
                                        />
                                        <input
                                            placeholder="Slug (e.g., how-to-edit-pdf)"
                                            className="p-2 border rounded"
                                            value={blogForm.slug}
                                            onChange={e => setBlogForm({ ...blogForm, slug: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <input
                                        placeholder="Description (Meta)"
                                        className="p-2 border rounded w-full"
                                        value={blogForm.description}
                                        onChange={e => setBlogForm({ ...blogForm, description: e.target.value })}
                                        required
                                    />
                                    <div className="grid grid-2 gap-4">
                                        <input
                                            placeholder="Related Tool ID (Optional)"
                                            className="p-2 border rounded"
                                            value={blogForm.toolId}
                                            onChange={e => setBlogForm({ ...blogForm, toolId: e.target.value })}
                                        />
                                        <input
                                            placeholder="Keywords (comma separated)"
                                            className="p-2 border rounded"
                                            value={blogForm.keywords}
                                            onChange={e => setBlogForm({ ...blogForm, keywords: e.target.value })}
                                        />
                                    </div>
                                    <textarea
                                        placeholder="HTML Content (e.g., <h2>Intro</h2><p>...</p>)"
                                        className="p-2 border rounded w-full font-mono text-sm min-h-[300px]"
                                        value={blogForm.content}
                                        onChange={e => setBlogForm({ ...blogForm, content: e.target.value })}
                                        required
                                    />
                                    <div className="flex items-center gap-4">
                                        <button type="submit" disabled={loading} className="btn btn-primary w-full">
                                            {loading ? 'Saving...' : (editingBlogId ? 'Update Post' : 'Publish Post')}
                                        </button>
                                        <button type="button" onClick={() => setIsEditingBlog(false)} className="btn w-full bg-gray-100 text-gray-700">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {blogs.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground bg-gray-50 rounded-lg">
                                    No dynamic blog posts found in database.
                                </div>
                            ) : (
                                blogs.map((blog) => (
                                    <div key={blog._id} className="card flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold mb-1">{blog.title}</h3>
                                            <p className="text-sm text-gray-500 mb-2">/{blog.slug} • {blog.date}</p>
                                            <p className="text-sm text-gray-700 line-clamp-2">{blog.description}</p>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button onClick={() => handleEditBlog(blog)} className="btn p-2 text-blue-600 hover:bg-blue-50 rounded">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteBlog(blog._id)} className="btn p-2 text-red-600 hover:bg-red-50 rounded">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
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
                                                    backgroundColor: event.type === 'visitor' ? '#8b5cf620' : (event.type === 'search' ? '#3b82f620' : '#10b98120'),
                                                    color: event.type === 'visitor' ? '#8b5cf6' : (event.type === 'search' ? '#3b82f6' : '#10b981'),
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
