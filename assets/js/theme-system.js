class ThemeSystem {
  constructor() {
    this.themes = {
      dark: {
        '--bg': '#0B1220',
        '--surface': '#111827',
        '--surface2': '#151E2E',
        '--surface3': '#1B2536',
        '--line': 'rgba(255,255,255,0.08)',
        '--text': '#EAEEF6',
        '--muted': '#9CA3B0',
        '--cyan': '#22D3EE',
        '--claude': '#D97757',
        '--claude2': '#F2B88A',
        '--shadow': '0 20px 60px -20px rgba(0,0,0,0.6)'
      },
      light: {
        '--bg': '#F4F7FB',
        '--surface': '#FFFFFF',
        '--surface2': '#EEF2F8',
        '--surface3': '#E4EAF3',
        '--line': 'rgba(15,23,42,0.08)',
        '--text': '#0F172A',
        '--muted': '#5B6576',
        '--cyan': '#0891B2',
        '--claude': '#C96442',
        '--claude2': '#F0A46E',
        '--shadow': '0 20px 50px -25px rgba(15,23,42,0.25)'
      },
      sepia: {
        '--bg': '#F2E8D9',
        '--surface': '#FDF8F0',
        '--surface2': '#EFE2CE',
        '--surface3': '#E3D2BA',
        '--line': 'rgba(61,43,31,0.08)',
        '--text': '#3D2B1F',
        '--muted': '#7A6B5E',
        '--cyan': '#8B6914',
        '--claude': '#A67B5B',
        '--claude2': '#C19D82',
        '--shadow': '0 20px 50px -25px rgba(61,43,31,0.15)'
      },
      'high-contrast': {
        '--bg': '#FFFFFF',
        '--surface': '#FFFFFF',
        '--surface2': '#E5E5E5',
        '--surface3': '#CCCCCC',
        '--line': '#000000',
        '--text': '#000000',
        '--muted': '#333333',
        '--cyan': '#0055CC',
        '--claude': '#CC4400',
        '--claude2': '#990000',
        '--shadow': 'none'
      }
    };
  }

  apply(themeName) {
    if (!this.themes[themeName]) return;
    
    // Set attribute on body
    document.body.setAttribute('data-theme', themeName);
    
    // Set variables on document element
    const theme = this.themes[themeName];
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme)) {
      root.style.setProperty(key, value);
    }
    
    // Update settings switch on page
    const switchDark = document.getElementById('switchDark');
    if (switchDark) {
      switchDark.classList.toggle('on', themeName === 'dark' || themeName === 'high-contrast');
    }
  }

  toggle() {
    const themes = Object.keys(this.themes);
    let nextIndex = 0;
    const current = stateManager.state.theme || 'dark';
    const currentIndex = themes.indexOf(current);
    if (currentIndex !== -1) {
      nextIndex = (currentIndex + 1) % themes.length;
    }
    const newTheme = themes[nextIndex];
    stateManager.update({ theme: newTheme });
    toast(`🎨 Theme: ${newTheme.toUpperCase()}`);
  }
}

const themeSystem = new ThemeSystem();

// Backward compatible functions
function toggleTheme() {
  themeSystem.toggle();
}

function applyTheme() {
  themeSystem.apply(stateManager.state.theme);
}
