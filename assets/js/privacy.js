class PrivacyManager {
  collectUserData() {
    let sessionData = [];
    try {
      sessionData = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch (e) {}

    return {
      gameProgress: stateManager.state,
      achievements: stateManager.state.unlocked,
      scores: stateManager.state.bestScores,
      sessionData: sessionData,
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
  }

  exportData() {
    const data = this.collectUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservoir-quest-data-${Date.now()}.json`;
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    if (typeof toast === 'function') {
      toast('📋 User data exported successfully!');
    }
  }

  clearData() {
    if (confirm('This will delete ALL your progress, achievements, custom cards, and settings. Are you sure?')) {
      localStorage.clear();
      sessionStorage.clear();
      location.reload();
    }
  }

  showPrivacyPolicy() {
    // If modal already exists, remove it
    const existing = document.querySelector('.privacy-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'privacy-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Privacy Policy');
    modal.innerHTML = `
      <div class="privacy-content">
        <h2>🔒 Privacy Policy</h2>
        <p style="font-size:0.9rem; color:var(--text); line-height:1.5;">Reservoir Quest is built with privacy-first principles:</p>
        <ul style="font-size:0.88rem; color:var(--muted); padding-left:14px; margin:10px 0;">
          <li>✅ All game data is stored locally in your browser</li>
          <li>✅ No data is sent to external servers or databases</li>
          <li>✅ No persistent cookies are used for tracking</li>
          <li>✅ You can export your data or delete all progress at any time</li>
          <li>✅ No third-party ad networks or analytics</li>
        </ul>
        <button class="btn btn-primary" style="margin-top:12px; justify-content:center;" onclick="this.closest('.privacy-modal').remove()">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

const privacyManager = new PrivacyManager();

// Wrapper functions for HTML onclick attributes
function exportUserData() {
  privacyManager.exportData();
}

function clearUserData() {
  privacyManager.clearData();
}

function showPrivacyPolicy() {
  privacyManager.showPrivacyPolicy();
}
