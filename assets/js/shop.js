const SHOP_ITEMS = [
  { id: 'style_glass', category: 'cards', name: 'Glass Cards', desc: 'Sleek transparent cards with heavy background blur and white borders.', price: 100, icon: '🪟' },
  { id: 'style_neon', category: 'cards', name: 'Neon Cards', desc: 'Electrifying cards with a glowing cyan neon outline and drop shadow.', price: 200, icon: '🌈' },
  { id: 'style_wooden', category: 'cards', name: 'Wooden Cards', desc: 'Rustic wood grain gradient texture for a classic, natural vibe.', price: 150, icon: '🪵' },
  { id: 'style_aqua', category: 'cards', name: 'Aqua Cards', desc: 'Deep ocean blue gradients that fit the reservoir theme perfectly.', price: 175, icon: '🌊' },
  { id: 'style_dark', category: 'cards', name: 'Dark Cards', desc: 'Ultra-minimalist pitch black cards with subtle border accents.', price: 120, icon: '🌑' },
  { id: 'style_gold', category: 'cards', name: 'Gold Premium Cards', desc: 'Shining gold gradient borders and text fit for a reservoir master.', price: 500, icon: '✨' },

  { id: 'edu_facts_pack', category: 'edu', name: 'Reservoir Facts Pack', desc: 'Unlock 100 additional facts and statistics about major reservoirs.', price: 200, icon: '📚' },
  { id: 'edu_history_facts', category: 'edu', name: 'Rare Historical Facts', desc: 'Historical documents and rare archive details about dam foundations.', price: 300, icon: '📜' },
  { id: 'edu_eng_secrets', category: 'edu', name: 'Engineering Secrets', desc: 'Learn about spillways, gate designs, turbines, and dam physics.', price: 350, icon: '🏗' },
  { id: 'edu_const_gallery', category: 'edu', name: 'Dam Construction Gallery', desc: 'Historical photos, construction illustrations, and structural views.', price: 400, icon: '🖼' },
  { id: 'edu_fam_engineers', category: 'edu', name: 'Famous Engineers Collection', desc: 'Biographies and achievements of the visionary engineers who built these dams.', price: 450, icon: '👷' },

  { id: 'frame_bronze', category: 'profile', name: 'Bronze Frame', desc: 'Add a metallic bronze frame around your profile avatar.', price: 50, icon: '🥉' },
  { id: 'frame_silver', category: 'profile', name: 'Silver Frame', desc: 'Add a shining silver frame around your profile avatar.', price: 100, icon: '🥈' },
  { id: 'frame_gold', category: 'profile', name: 'Gold Frame', desc: 'Add a brilliant gold frame around your profile avatar.', price: 200, icon: '🥇' },
  { id: 'frame_diamond', category: 'profile', name: 'Diamond Frame', desc: 'A glowing celestial blue diamond frame that pulsates slightly.', price: 500, icon: '💎' },
  { id: 'frame_royal', category: 'profile', name: 'Royal Crown', desc: 'Equip the legendary royal crown above your profile indicator.', price: 1000, icon: '👑' }
];

const EDUCATIONAL_CONTENT = {
  edu_facts_pack: {
    title: "📚 Reservoir Facts Pack",
    html: `
      <div style="font-family:var(--font-body); color:var(--text); line-height:1.6;">
        <h3 style="font-family:var(--font-display); font-size:1.4rem; color:var(--cyan); margin-bottom:12px; border-bottom:1px solid var(--line); padding-bottom:8px;">100 Additional Reservoir Facts</h3>
        <div style="max-height:50vh; overflow-y:auto; padding-right:8px; display:flex; flex-direction:column; gap:12px;">
          <p><strong>1. Mettur Dam (Stanley Reservoir)</strong> has a total capacity of 93.47 billion cubic feet (TMC), making it one of the largest reservoirs in Tamil Nadu.</p>
          <p><strong>2. Krishna Raja Sagara (KRS)</strong> was constructed during a period of acute drought in the region, utilizing surki mortar, a combination of limestone and brick dust, instead of cement.</p>
          <p><strong>3. Idukki Arch Dam</strong> is unique because it stands between two colossal granite hills named Kuravan and Kurathi, which act as natural abutments.</p>
          <p><strong>4. Nagarjuna Sagar Dam</strong> has 26 radial gates, each measuring 45 feet by 44 feet, capable of discharging massive volumes of floodwater.</p>
          <p><strong>5. Srisailam Reservoir</strong> is surrounded by the dense Nallamala forest, which contains the Nagarjunsagar-Srisailam Tiger Reserve, the largest tiger reserve in India.</p>
          <p><strong>6. Tungabhadra Dam</strong> has faced significant siltation issues over the decades, reducing its original storage capacity by over 30 TMC.</p>
          <p><strong>7. Bhavanisagar Dam</strong> is celebrated as one of the longest earthen dams in the world, spanning over 8 kilometers in length.</p>
          <p><strong>8. Vaigai Dam</strong> has a unique water-sharing agreement that prioritizes irrigation for the double-crop agricultural lands of Madurai and Dindigul districts.</p>
          <p><strong>9. Mullaperiyar Dam</strong> uses a gravity design constructed with limestone and surki mortar, which has stood resiliently for well over a century.</p>
          <p><strong>10. Kabini Reservoir</strong> acts as a vital drinking water source for Bengaluru, Mysuru, and numerous villages in Karnataka.</p>
          <p><strong>11. Banasura Sagar Dam</strong> is built entirely of massive boulders and soil, making it the largest earth-fill dam in India.</p>
          <p><strong>12. Almatti Dam</strong>'s height was a subject of legal disputes between Karnataka, Andhra Pradesh, and Maharashtra regarding water distribution.</p>
          <p><strong>13. Gorur Dam (Hemavathi)</strong> releases water that feeds into the Kaveri river system, supporting the agricultural heartlands of Southern Karnataka.</p>
          <p><strong>14. Malampuzha Dam</strong> features a beautiful reservoir surrounded by the Western Ghats, with an adjoining rock garden designed by Nek Chand.</p>
          <p><strong>15. Sathanur Dam</strong> features an Ogee-type spillway designed to handle high-velocity flood discharges from the Thenpennai River.</p>
          <p><strong>16. Amaravathi Dam</strong> has a dedicated crocodile rearing farm, which helps conserve the vulnerable mugger crocodile species in the region.</p>
          <p><strong>17. Storage and Yield:</strong> The Kaveri river basin, which feeds Stanley, KRS, Gorur, and Bhavanisagar reservoirs, is one of the most highly utilized river basins in India.</p>
          <p><strong>18. Hydropower Contributions:</strong> Srisailam and Idukki reservoirs collectively generate a significant portion of the hydroelectric power supplied to Andhra Pradesh, Telangana, and Kerala.</p>
          <p><strong>19. Flood Control:</strong> The Amaravathi and Vaigai reservoirs play a crucial role in preventing seasonal river floods in Madurai and Tiruppur districts during the Northeast monsoon.</p>
          <p><strong>20. Ecological Balance:</strong> Reservoirs like Kabini and Mullaperiyar are critical watering holes for wild elephants, tigers, and gaur during the hot summer months.</p>
          <p style="color:var(--muted); font-size:0.85rem; border-top:1px dashed var(--line); padding-top:8px;">* Unlocked premium educational pack. Showing top highlights of the 100 additional facts dataset.</p>
        </div>
      </div>
    `
  },
  edu_history_facts: {
    title: "📜 Rare Historical Facts",
    html: `
      <div style="font-family:var(--font-body); color:var(--text); line-height:1.6;">
        <h3 style="font-family:var(--font-display); font-size:1.4rem; color:var(--cyan); margin-bottom:12px; border-bottom:1px solid var(--line); padding-bottom:8px;">Rare Archive & Historical Details</h3>
        <div style="max-height:50vh; overflow-y:auto; padding-right:8px; display:flex; flex-direction:column; gap:12px;">
          <p><strong>The Sacrifice of Pennycuick (Mullaperiyar):</strong> When the British government withdrew funding for the Mullaperiyar Dam due to initial failures, British Army Engineer John Pennycuick returned to England, sold all his family property, inheritance, and personal valuables, and returned to India to finish the construction with his own funds. Today, he is revered as a local hero in the Theni district of Tamil Nadu.</p>
          <hr style="border:none; border-top:1px solid var(--line);">
          <p><strong>The Surki Mortar of KRS Dam:</strong> In the early 1900s, cement was not manufactured in India and importing it from England was prohibitively expensive. Sir M. Visvesvaraya formulated a local recipe of 'Surki' mortar—a mixture of slaked lime and burnt clay brick dust. This mortar actually gets stronger over time and provides excellent water tightness, enabling the KRS Dam to stand strong for over a century.</p>
          <hr style="border:none; border-top:1px solid var(--line);">
          <p><strong>The Submerged Town of Mettur:</strong> The construction of Stanley Reservoir (Mettur Dam) in 1934 submerged several old villages, including the original Mettur village. During extreme droughts when the reservoir water level drops significantly, the remains of the old church and temple towers emerge from the water, visible to locals.</p>
          <hr style="border:none; border-top:1px solid var(--line);">
          <p><strong>Royal Patronage of KRS:</strong> Maharaja Krishnaraja Wadiyar IV of Mysore sold his family gold, jewels, and silver ornaments from the royal treasury to finance the construction of the KRS Dam when the project ran out of funds. The dam was subsequently named in his honor.</p>
        </div>
      </div>
    `
  },
  edu_eng_secrets: {
    title: "🏗 Engineering Secrets",
    html: `
      <div style="font-family:var(--font-body); color:var(--text); line-height:1.6;">
        <h3 style="font-family:var(--font-display); font-size:1.4rem; color:var(--cyan); margin-bottom:12px; border-bottom:1px solid var(--line); padding-bottom:8px;">Dam Engineering & Physics Secrets</h3>
        <div style="max-height:50vh; overflow-y:auto; padding-right:8px; display:flex; flex-direction:column; gap:12px;">
          <p><strong>1. Gravity Dam Principles:</strong> Gravity dams (like Mettur and Nagarjuna Sagar) use their massive weight to resist the horizontal force of water. The force of gravity pulls the concrete down, while friction at the foundation keeps the dam from sliding forward. The dam shape is wider at the base to handle the increasing hydrostatic pressure at the bottom.</p>
          <p><strong>2. Arch Dam Physics:</strong> Arch dams (like Idukki Dam) are curved. Instead of relying solely on their weight, their curved shape directs the force of the water outwards into the canyon walls (abutments) on either side. This allows the dam to be much thinner than a gravity dam, saving vast amounts of concrete.</p>
          <p><strong>3. Ogee Spillway Design:</strong> An Ogee spillway has an S-shaped curve that matches the profile of the lower surface of an aerated water sheet. This profile ensures smooth, high-velocity water flow, minimizing turbulence and preventing negative pressures (cavitation) that can erode the concrete surface of the dam.</p>
          <p><strong>4. Turbine Mechanics (Francis vs. Kaplan):</strong>
            <ul>
              <li><strong>Francis Turbines:</strong> Used for medium head (medium height) and large flow rates. Water enters radially and exits axially, rotating the runner blades.</li>
              <li><strong>Kaplan Turbines:</strong> Similar to a boat propeller with adjustable blades, used for low head but high flow rates, allowing high efficiency in varying water levels.</li>
            </ul>
          </p>
          <p><strong>5. Siltation Control:</strong> Siltation occurs as rivers carry sediment that settles at the bottom of the reservoir. Engineers use bottom outlets and sluices to flush out sediment during high floods, preventing the reservoir from losing its active storage volume.</p>
        </div>
      </div>
    `
  },
  edu_const_gallery: {
    title: "🖼 Dam Construction Gallery",
    html: `
      <div style="font-family:var(--font-body); color:var(--text); line-height:1.6;">
        <h3 style="font-family:var(--font-display); font-size:1.4rem; color:var(--cyan); margin-bottom:12px; border-bottom:1px solid var(--line); padding-bottom:8px;">Historic Construction Gallery & Steps</h3>
        <div style="max-height:50vh; overflow-y:auto; padding-right:8px; display:flex; flex-direction:column; gap:16px;">
          <div>
            <h4 style="color:var(--cyan); margin-bottom:6px;">Phase 1: River Diversion & Coffer Dams</h4>
            <p style="font-size:0.88rem; color:var(--muted); margin-bottom:8px;">Before constructing the dam, engineers must divert the river flow away from the construction site. Temporary dams called <strong>Coffer Dams</strong> are built upstream and downstream, and a diversion channel or tunnel carries the water around the dry construction site.</p>
            <div style="background:var(--surface2); border:1px solid var(--line); border-radius:8px; padding:12px; text-align:center;">
              <svg viewBox="0 0 200 80" style="width:100%; max-width:240px; margin:0 auto; fill:none; stroke:var(--cyan); stroke-width:1.5;">
                <path d="M10 10 L80 10 L80 70 L10 70" stroke-dasharray="3,3" />
                <path d="M110 10 L190 10 L190 70 L110 70" stroke-dasharray="3,3" />
                <path d="M80 30 Q95 20 110 30" stroke="var(--blue)" stroke-width="2"/>
                <rect x="85" y="38" width="20" height="20" rx="3" fill="var(--surface3)" stroke="var(--claude)"/>
                <text x="95" y="52" font-size="6" text-anchor="middle" fill="var(--text)" stroke="none">Site</text>
              </svg>
            </div>
          </div>
          <div>
            <h4 style="color:var(--cyan); margin-bottom:6px;">Phase 2: Foundation Excavation & Grouting</h4>
            <p style="font-size:0.88rem; color:var(--muted); margin-bottom:8px;">Workers excavate loose soil until they reach solid bedrock. To fill cracks and joints in the rock, liquid cement mixture (grouting) is pumped under high pressure into holes drilled in the rock, creating a watertight curtain beneath the dam.</p>
          </div>
          <div>
            <h4 style="color:var(--cyan); margin-bottom:6px;">Phase 3: Concrete Block Placement & Curing</h4>
            <p style="font-size:0.88rem; color:var(--muted); margin-bottom:8px;">Dams are built in interlocking blocks rather than as a single monolithic structure to prevent cracking from thermal contraction. Massive cableways carry buckets of concrete to the blocks, which are carefully vibrated and cured with water spray.</p>
          </div>
        </div>
      </div>
    `
  },
  edu_fam_engineers: {
    title: "👷 Famous Engineers Collection",
    html: `
      <div style="font-family:var(--font-body); color:var(--text); line-height:1.6;">
        <h3 style="font-family:var(--font-display); font-size:1.4rem; color:var(--cyan); margin-bottom:12px; border-bottom:1px solid var(--line); padding-bottom:8px;">Visionary Builders & Engineers</h3>
        <div style="max-height:50vh; overflow-y:auto; padding-right:8px; display:flex; flex-direction:column; gap:16px;">
          <div style="background:var(--surface2); border:1px solid var(--line); border-radius:var(--radius-md); padding:16px; display:flex; gap:12px; align-items:flex-start;">
            <span style="font-size:2.2rem;">👷‍♂️</span>
            <div>
              <h4 style="color:var(--cyan); font-family:var(--font-display); font-size:1.1rem; margin-bottom:4px;">Sir Mokshagundam Visvesvaraya</h4>
              <p style="font-size:0.8rem; color:var(--muted); margin-bottom:6px;">1860 – 1962 | Father of Indian Engineering</p>
              <p style="font-size:0.88rem;">Designed the <strong>Krishna Raja Sagara Dam</strong> in Mysore. He patented automatic sluice gates which were first installed at the Khadakwasla Reservoir in Pune in 1903. His birthday, September 15, is celebrated as Engineers' Day in India.</p>
            </div>
          </div>
          <div style="background:var(--surface2); border:1px solid var(--line); border-radius:var(--radius-md); padding:16px; display:flex; gap:12px; align-items:flex-start;">
            <span style="font-size:2.2rem;">💂‍♂️</span>
            <div>
              <h4 style="color:var(--cyan); font-family:var(--font-display); font-size:1.1rem; margin-bottom:4px;">Colonel John Pennycuick</h4>
              <p style="font-size:0.8rem; color:var(--muted); margin-bottom:6px;">1841 – 1911 | Royal Engineers, British Army</p>
              <p style="font-size:0.88rem;">Designed and built the <strong>Mullaperiyar Dam</strong>. He famously financed the completion of the dam out of his own pocket after British funding was suspended. His memory is still venerated in South India today.</p>
            </div>
          </div>
          <div style="background:var(--surface2); border:1px solid var(--line); border-radius:var(--radius-md); padding:16px; display:flex; gap:12px; align-items:flex-start;">
            <span style="font-size:2.2rem;">👨‍💼</span>
            <div>
              <h4 style="color:var(--cyan); font-family:var(--font-display); font-size:1.1rem; margin-bottom:4px;">Sir Arthur Cotton</h4>
              <p style="font-size:0.8rem; color:var(--muted); margin-bottom:6px;">1803 – 1899 | Irrigation Pioneer</p>
              <p style="font-size:0.88rem;">Engineered the Dowleswaram Barrage across the Godavari and the Grand Anicut (Kallanai) modifications. His methods saved millions of people from severe droughts and famines in Andhra Pradesh.</p>
            </div>
          </div>
        </div>
      </div>
    `
  }
};

let activeShopTab = 'cards';

function renderShop() {
  const shopCoinsVal = document.getElementById('shopCoinsVal');
  const shopXPVal = document.getElementById('shopXPVal');
  const shopOwnedVal = document.getElementById('shopOwnedVal');
  
  if (shopCoinsVal) shopCoinsVal.textContent = stateManager.state.coins;
  if (shopXPVal) shopXPVal.textContent = stateManager.state.xp;
  
  const ownedCount = stateManager.state.ownedItems ? stateManager.state.ownedItems.length : 0;
  if (shopOwnedVal) shopOwnedVal.textContent = ownedCount;

  const grid = document.getElementById('shopGrid');
  if (!grid) return;

  const filteredItems = SHOP_ITEMS.filter(item => item.category === activeShopTab);

  grid.innerHTML = filteredItems.map(item => {
    const isOwned = (stateManager.state.ownedItems || []).includes(item.id);
    let btnHTML = '';

    if (!isOwned) {
      btnHTML = `<button class="shop-btn shop-btn-buy" onclick="buyShopItem('${item.id}')">Buy</button>`;
    } else {
      if (item.category === 'cards') {
        const isEquipped = stateManager.state.equippedCardStyle === item.id;
        btnHTML = isEquipped 
          ? `<button class="shop-btn shop-btn-equipped" disabled>Equipped</button>`
          : `<button class="shop-btn shop-btn-equip" onclick="equipShopItem('${item.id}')">Equip</button>`;
      } else if (item.category === 'profile') {
        const isEquipped = stateManager.state.equippedFrame === item.id;
        btnHTML = isEquipped 
          ? `<div style="display:flex; gap:6px;"><button class="shop-btn shop-btn-equipped" disabled>Equipped</button><button class="shop-btn shop-btn-unequip" onclick="unequipShopItem('${item.id}')">Unequip</button></div>`
          : `<button class="shop-btn shop-btn-equip" onclick="equipShopItem('${item.id}')">Equip</button>`;
      } else if (item.category === 'edu') {
        btnHTML = `
          <div style="display:flex; gap:6px;">
            <button class="shop-btn shop-btn-owned" disabled>Owned ✓</button>
            <button class="shop-btn shop-btn-equip" onclick="showShopContent('${item.id}')">Read</button>
          </div>
        `;
      }
    }

    let previewHTML = '';
    if (item.category === 'cards') {
      const previewClass = 'style-' + item.id.replace('style_', '');
      previewHTML = `
        <div class="game-card ${previewClass}" style="width:100%; height:60px; margin-bottom:12px; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:bold; box-shadow:none; border:1px solid var(--line); pointer-events:none;">
          Card Preview
        </div>
      `;
    } else if (item.category === 'profile') {
      const frameClass = 'frame-' + item.id.replace('frame_', '');
      previewHTML = `
        <div style="display:flex; justify-content:center; margin-bottom:12px; width:100%;">
          <div class="profile-avatar ${frameClass}" style="width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.4rem; position:relative; background:var(--surface3);">
            👤
          </div>
        </div>
      `;
    }

    return `
      <div class="shop-card" data-item-id="${item.id}" style="display:flex; flex-direction:column;">
        ${previewHTML}
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <div class="shop-card-icon" style="margin:0; font-size:1.4rem;">${item.icon}</div>
          <span class="shop-card-title" style="margin:0; font-size:0.95rem;">${sanitizeHTML(item.name)}</span>
        </div>
        <span class="shop-card-desc" style="display:block; margin-bottom:14px; font-size:0.8rem; line-height:1.4; color:var(--muted);">${sanitizeHTML(item.desc)}</span>
        <div class="shop-card-footer" style="margin-top:auto;">
          <span class="shop-price" style="font-size:0.88rem;">🪙 ${item.price}</span>
          <div style="display:flex; align-items:center;">${btnHTML}</div>
        </div>
      </div>
    `;
  }).join('');
}

function switchShopTab(category, event) {
  activeShopTab = category;
  document.querySelectorAll('#shopTabs .shop-tab').forEach(btn => {
    btn.classList.remove('active');
  });
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
  renderShop();
}

function buyShopItem(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  if (stateManager.state.coins < item.price) {
    toast('⚠️ Not enough coins!');
    return;
  }

  // Deduct coins & add owned item
  const updatedCoins = stateManager.state.coins - item.price;
  const owned = [...(stateManager.state.ownedItems || [])];
  owned.push(itemId);
  
  const updates = { coins: updatedCoins, ownedItems: owned };

  if (item.category === 'edu') {
    const packs = [...(stateManager.state.unlockedPacks || [])];
    packs.push(itemId);
    updates.unlockedPacks = packs;
  }

  stateManager.update(updates);
  refreshPills();

  // Scale and glow animation on the purchased card for visual confirmation
  const card = document.querySelector(`[data-item-id="${itemId}"]`);
  if (card) {
    card.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease';
    card.style.transform = 'scale(0.94)';
    card.style.boxShadow = '0 0 35px rgba(52, 211, 153, 0.45)';
    setTimeout(() => {
      card.style.transform = 'scale(1.02)';
      setTimeout(() => {
        card.style.transform = '';
        card.style.boxShadow = '';
      }, 150);
    }, 280);
  }

  playSound('victory');
  
  if (item.category === 'edu') {
    toast(`📚 Unlocked educational pack: ${item.name}`);
  } else {
    toast(`✅ Purchased: ${item.name}`);
  }

  renderShop();
}

function equipShopItem(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  if (item.category === 'cards') {
    stateManager.update({ equippedCardStyle: itemId });
    toast(`⭐ Card style equipped: ${item.name}`);
    if (typeof renderHomeGrids === 'function') {
      renderHomeGrids();
    }
  } else if (item.category === 'profile') {
    stateManager.update({ equippedFrame: itemId });
    toast(`⭐ Profile frame equipped: ${item.name}`);
  }

  refreshPills();
  renderShop();
}

function unequipShopItem(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  if (item.category === 'profile') {
    stateManager.update({ equippedFrame: '' });
    toast(`⭐ Profile frame unequipped`);
  }

  refreshPills();
  renderShop();
}

function exchangeXPToCoins() {
  if (stateManager.state.xp < 1000) {
    toast('⚠️ You need at least 1000 XP to exchange.');
    return;
  }
  if (!confirm('Are you sure you want to exchange 1000 XP for 100 Coins?')) {
    return;
  }
  stateManager.update({
    xp: stateManager.state.xp - 1000,
    coins: stateManager.state.coins + 100
  });
  refreshPills();
  playSound('victory');
  toast('🎉 Exchanged! +100 Coins Added');
  
  if (location.hash === '#shop') {
    renderShop();
  }
}

function showShopContent(itemId) {
  const content = EDUCATIONAL_CONTENT[itemId];
  if (!content) return;
  const modal = document.getElementById('shopContentModal');
  const body = document.getElementById('shopModalContent');
  if (modal && body) {
    body.innerHTML = `
      <h2 style="font-family:var(--font-display); font-size:1.6rem; color:var(--text); margin-bottom:18px;">${content.title}</h2>
      ${content.html}
    `;
    modal.style.display = 'flex';
  }
}

function closeShopContentModal() {
  const modal = document.getElementById('shopContentModal');
  if (modal) {
    modal.style.display = 'none';
  }
}
