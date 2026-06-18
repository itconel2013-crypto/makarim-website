import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand & Ink
        ink: '#16242B',
        'ink-light': '#41494A',
        
        // Primary (Terracotta)
        primary: '#C2724A',
        'primary-dark': '#A8542F',
        'primary-hover': '#A8542F',
        
        // Teal (CMS)
        teal: '#14617A',
        'teal-hover': '#0F4F63',
        
        // Body text
        body: {
          dark: '#5A5448',
          DEFAULT: '#6B6457',
          light: '#9A9082',
        },
        
        // Page backgrounds & cards
        page: '#F4F1EA',
        card: {
          soft: '#FBF9F4',
          warm: '#F7ECE4',
          lighter: '#F0E4DC',
        },
        
        // Borders
        border: {
          light: '#EAE3D8',
          lighter: '#E2DBCF',
          warm: '#EFE8DC',
          soft: '#F2ECE1',
        },
        
        // Hero kicker
        kicker: '#F0CDA8',
        
        // Success / Green
        success: '#3E6B52',
        'success-bg': '#EAF0E8',
        'success-bg-alt': '#E3EEE4',
        
        // Medina (green dome)
        medina: '#3E7256',
        'medina-bg': '#EAF1EC',
        
        // Mekka (sand pill)
        mekka: '#A8542F',
        'mekka-bg': '#F2E8DF',
        
        // Status / Amber
        status: '#956214',
        'status-bg': '#F6ECD9',
        'status-dot': '#E0A23C',
        
        // WhatsApp
        whatsapp: '#25D366',
        
        // Links (SERP)
        link: '#1a0dab',
        'link-green': '#3E6B52',
      },
      
      fontFamily: {
        serif: ['Newsreader', 'serif'],
        sans: ['Schibsted Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Quicksand', 'sans-serif'],
      },
      
      fontSize: {
        // Kickers
        kicker: ['13px', { lineHeight: '1.4', letterSpacing: '0.2em' }],
        'kicker-sm': ['11px', { lineHeight: '1.2', letterSpacing: '0.2em' }],
        
        // Headings
        'h1-hero': ['62px', { lineHeight: '1.05', fontWeight: '400' }],
        'h1-detail': ['44px', { lineHeight: '1.2', fontWeight: '400' }],
        'h1-category': ['46px', { lineHeight: '1.2', fontWeight: '400' }],
        'h1-section': ['40px', { lineHeight: '1.2', fontWeight: '400' }],
        'h2-section': ['42px', { lineHeight: '1.2', fontWeight: '400' }],
        'h2-detail': ['28px', { lineHeight: '1.2', fontWeight: '400' }],
        'h2-cms': ['30px', { lineHeight: '1.2', fontWeight: '400' }],
        'h3-card': ['24px', { lineHeight: '1.2', fontWeight: '400' }],
        'h3-hotel': ['19px', { lineHeight: '1.3', fontWeight: '400' }],
        
        // Body
        body: ['16.5px', { lineHeight: '1.6' }],
        'body-lg': ['18px', { lineHeight: '1.75' }],
        'body-sm': ['14px', { lineHeight: '1.6' }],
        'body-xs': ['13.5px', { lineHeight: '1.5', fontWeight: '600' }],
      },
      
      spacing: {
        gutter: '40px',
        section: '80px',
      },
      
      borderRadius: {
        button: '9px',
        'button-md': '13px',
        pill: '16px',
        'pill-lg': '20px',
        card: '18px',
        band: '24px',
      },
      
      boxShadow: {
        card: '0 6px 22px rgba(40, 30, 20, 0.05)',
        'card-lg': '0 14px 34px rgba(40, 30, 20, 0.14)',
        'whatsapp': '0 8px 24px rgba(37, 211, 102, 0.45)',
      },
      
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
};

export default config;
