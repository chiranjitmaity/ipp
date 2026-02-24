'use client';

import { ToolCard } from '@/components/tools/ToolCard';
import { TOOLS, TOOL_CATEGORIES } from '@/data/tools';
import { Search, ArrowRight, Star, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = TOOLS.filter(tool =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularTools = TOOLS.filter(tool => tool.popular);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" style={{
        textAlign: 'center',
        padding: '8rem 0 6rem',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border)'
      }}>
        {/* Decorative background blur blobs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '50%', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.1, zIndex: 0, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '40%', height: '50%', background: 'var(--secondary)', filter: 'blur(150px)', opacity: 0.1, zIndex: 0, borderRadius: '50%' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', maxWidth: '850px', margin: '0 auto 1.5rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Every tool you need to work with <br className="hidden md:block" />
            <span style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #ff8e53 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}>PDFs & Documents</span>.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
            Free, easy to use, and secure online tools to merge, split, compress, and convert your files in seconds.
          </p>

          <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto', zIndex: 10 }}>
            <Search size={22} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', zIndex: 2, pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search for a tool (e.g., 'Merge PDF')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '1.25rem 1.5rem 1.25rem 3.5rem',
                fontSize: '1.125rem',
                borderRadius: '50px',
                border: '2px solid transparent',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04), 0 0 40px rgba(0,0,0,0.05)',
                backgroundColor: 'var(--card)',
                color: 'var(--foreground)',
                outline: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(229, 50, 45, 0.15), 0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              onBlur={(e) => {
                e.target.style.borderColor = 'transparent';
                e.target.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04), 0 0 40px rgba(0,0,0,0.05)';
                setTimeout(() => setSearchQuery(''), 200);
              }}
            />

            {/* Auto Dropdown Menu */}
            <AnimatePresence>
              {searchQuery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    border: '1px solid var(--border)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    textAlign: 'left'
                  }}
                >
                  {filteredTools.length > 0 ? (
                    filteredTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link
                          key={tool.id}
                          href={tool.href}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.75rem 1rem',
                            textDecoration: 'none',
                            color: 'inherit',
                            borderRadius: '8px',
                            transition: 'background-color 0.2s ease'
                          }}
                          className="hover:bg-gray-50 drop-link"
                        >
                          <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: 'var(--primary)10',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)'
                          }}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--foreground)' }}>{tool.title}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                              {tool.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--muted)' }}>
                      No tools found matching "{searchQuery}"
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        {searchQuery ? (
          <section>
            <h2 style={{ marginBottom: '2rem' }}>Search Results</h2>
            <div className="grid grid-4">
              {filteredTools.length > 0 ? (
                filteredTools.map(tool => (
                  <ToolCard key={tool.id} {...tool} />
                ))
              ) : (
                <p>No tools found matching your search.</p>
              )}
            </div>
          </section>
        ) : (
          <>
            {/* Popular Tools */}
            <section style={{ paddingTop: 0 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '2rem' }}>
                <Star size={24} color="#f59e0b" fill="#f59e0b" />
                <h2 style={{ fontSize: '1.75rem' }}>Popular Tools</h2>
              </div>
              <div className="grid grid-4">
                {popularTools.map(tool => (
                  <ToolCard key={tool.id} {...tool} />
                ))}
              </div>
            </section>

            {/* Categorized Tools */}
            {Object.entries(TOOL_CATEGORIES).map(([key, categoryTitle]) => {
              const categoryTools = TOOLS.filter(tool => tool.category === categoryTitle);
              if (categoryTools.length === 0) return null;

              return (
                <section key={key}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem' }}>{categoryTitle}</h2>
                    <ArrowRight size={24} color="var(--primary)" />
                  </div>
                  <div className="grid grid-4">
                    {categoryTools.map(tool => (
                      <ToolCard key={tool.id} {...tool} />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </div>

      {/* Features/Trust Section */}
      <section style={{ backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="grid grid-3" style={{ textAlign: 'center' }}>
            <div className="flex flex-col items-center gap-4">
              <ShieldCheck size={48} color="var(--primary)" />
              <h3>Your privacy is our priority</h3>
              <p style={{ color: 'var(--muted)' }}>We delete your files automatically after 1 minute. No one but you can access them.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Zap size={48} color="var(--secondary)" />
              <h3>Cloud Processing</h3>
              <p style={{ color: 'var(--muted)' }}>High-speed servers process your files in seconds, not minutes.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <HelpCircle size={48} color="#10b981" />
              <h3>Easy to use</h3>
              <p style={{ color: 'var(--muted)' }}>No installation required. Everything works directly in your browser.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
