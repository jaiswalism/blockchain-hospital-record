import React from 'react';
import { Container } from 'semantic-ui-react';
import MenuBar from './MenuBar';
import Head from 'next/head';

const Layout = (props) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>MediBlock — Decentralized Healthcare Records</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </Head>

      <style jsx global>{`
        /* Embedded Web3 Ember-Obsidian Theme */
        :root {
          --bg-canvas: #090A0E;
          --bg-surface: #12141B;
          --bg-surface-glass: rgba(18, 20, 27, 0.85);
          --bg-surface-elevated: #181B24;
          --border-subtle: rgba(255, 255, 255, 0.08);
          --border-hover: rgba(255, 77, 45, 0.45);
          --border-glow: #FF4D2D;
          --accent-primary: #FF4D2D;
          --accent-primary-hover: #FF6647;
          --accent-glow: rgba(255, 77, 45, 0.4);
          --accent-pill-bg: rgba(255, 77, 45, 0.08);
          --accent-pill-border: rgba(255, 77, 45, 0.32);
          --accent-pill-text: #FF7354;
          --text-main: #FFFFFF;
          --text-secondary: #94A3B8;
        }

        html, body {
          background-color: var(--bg-canvas) !important;
          color: var(--text-main) !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          margin: 0;
          padding: 0;
          min-height: 100vh;
          background-image: 
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255, 77, 45, 0.18), rgba(255, 77, 45, 0.03) 45%, transparent 75%),
            radial-gradient(circle 600px at 90% 70%, rgba(255, 77, 45, 0.04), transparent 70%);
          background-attachment: fixed;
        }

        .web3-nav {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(9, 10, 14, 0.85);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border-subtle);
          padding: 0.85rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .web3-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .web3-logo-icon {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #FF4D2D, #FF7B59);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(255, 77, 45, 0.45);
          color: #FFFFFF;
          font-weight: 800;
          font-size: 1.1rem;
        }

        .web3-brand-text {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #FFFFFF;
        }

        .web3-brand-text span {
          color: var(--accent-primary);
        }

        .web3-nav-links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .web3-nav-link {
          color: var(--text-secondary) !important;
          padding: 0.5rem 0.85rem;
          border-radius: 8px;
          font-size: 0.925rem;
          font-weight: 500;
          transition: all 0.2s ease;
          text-decoration: none !important;
          cursor: pointer;
        }

        .web3-nav-link:hover {
          color: #FFFFFF !important;
          background: rgba(255, 255, 255, 0.05);
        }

        .web3-wallet-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #151821;
          border: 1px solid var(--border-subtle);
          padding: 0.4rem 0.9rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-family: monospace;
          color: #E2E8F0;
        }

        .web3-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #10B981;
          box-shadow: 0 0 8px #10B981;
        }

        .web3-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: var(--accent-primary) !important;
          color: #FFFFFF !important;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.75rem 1.6rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          box-shadow: 0 0 22px var(--accent-glow);
          transition: all 0.25s ease;
        }

        .web3-btn-primary:hover {
          background: var(--accent-primary-hover) !important;
          box-shadow: 0 0 32px rgba(255, 77, 45, 0.6);
          transform: translateY(-2px);
        }

        .web3-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #181B24 !important;
          color: #E2E8F0 !important;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.75rem 1.6rem;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .web3-btn-secondary:hover {
          background: #232733 !important;
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .web3-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--accent-pill-bg);
          border: 1px solid var(--accent-pill-border);
          color: var(--accent-pill-text);
          padding: 0.35rem 1rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          box-shadow: 0 0 15px rgba(255, 77, 45, 0.12);
        }

        /* Semantic UI Overrides */
        .ui.segment {
          background: var(--bg-surface-glass) !important;
          border: 1px solid var(--border-subtle) !important;
          border-radius: 12px !important;
          color: var(--text-main) !important;
        }

        .ui.form .field > label {
          color: #CBD5E1 !important;
          font-weight: 500 !important;
        }

        .ui.form input, .ui.input > input, .ui.form select, .ui.form textarea {
          background: #0D0F15 !important;
          border: 1px solid var(--border-subtle) !important;
          color: #FFFFFF !important;
          border-radius: 8px !important;
        }

        .ui.form input:focus, .ui.input > input:focus, .ui.form textarea:focus {
          border-color: var(--accent-primary) !important;
          box-shadow: 0 0 10px rgba(255, 77, 45, 0.3) !important;
        }

        .ui.dropdown .menu {
          background: #151821 !important;
          border: 1px solid var(--border-subtle) !important;
        }

        .ui.dropdown .menu > .item {
          color: #E2E8F0 !important;
        }

        .ui.dropdown .menu > .item:hover {
          background: rgba(255, 77, 45, 0.15) !important;
          color: #FFFFFF !important;
        }

        .ui.button.primary {
          background: var(--accent-primary) !important;
          box-shadow: 0 0 20px var(--accent-glow) !important;
        }

        .ui.header {
          color: #FFFFFF !important;
        }

        .ui.table {
          background: var(--bg-surface-glass) !important;
          border: 1px solid var(--border-subtle) !important;
          color: #E2E8F0 !important;
        }

        .ui.table th {
          background: #181B24 !important;
          color: #FFFFFF !important;
        }

        .ui.table td {
          border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
          color: #CBD5E1 !important;
        }

        .ui.cards > .card, .ui.card {
          background: var(--bg-surface-glass) !important;
          border: 1px solid var(--border-subtle) !important;
          box-shadow: none !important;
          color: #FFFFFF !important;
        }

        .ui.cards > .card:hover, .ui.card:hover {
          border-color: var(--border-hover) !important;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5) !important;
        }

        .ui.card > .content > .header, .ui.cards > .card > .content > .header {
          color: #FFFFFF !important;
        }

        .ui.card > .content > .description {
          color: var(--text-secondary) !important;
        }
      `}</style>

      <MenuBar />

      <main style={{ flex: 1, padding: '2.5rem 0 4rem 0' }}>
        <Container>{props.children}</Container>
      </main>

      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(9, 10, 14, 0.95)',
          padding: '2rem 0',
          textAlign: 'center',
          color: '#64748B',
          fontSize: '0.875rem',
        }}
      >
        <Container>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#FF4D2D', fontWeight: 700 }}>MediBlock</span>
              <span>— Decentralized Hospital & Healthcare Records</span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>Ethereum Sepolia</span>
              <span>Smart Contract Security</span>
              <span>IPFS Ready</span>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Layout;
