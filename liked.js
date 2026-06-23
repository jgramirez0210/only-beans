// ─── Toast helper ───
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (t) t.remove();
  t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('hide'), 2200);
  setTimeout(() => t.remove(), 2600);
}

// ─── Sharing ───
async function shareBean(bean) {
  const shareData = {
    title: `${bean.name} — Only Beans`,
    text: bean.fact || `I liked ${bean.name} on Only Beans!`,
    url: window.location.origin + window.location.pathname.replace('liked.html', 'index.html')
  };
  try {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${bean.name}\n${shareData.text}`);
      showToast('Copied to clipboard!');
    }
  } catch (e) {
    if (e.name !== 'AbortError') showToast('Could not share — try copying manually.');
  }
}

async function shareAll(beans) {
  const lines = beans.map(b => `• ${b.name}`).join('\n');
  const shareData = {
    title: 'My Bean Rankings — Only Beans',
    text: `I liked ${beans.length} bean${beans.length !== 1 ? 's' : ''} on Only Beans:\n${lines}`,
    url: window.location.origin + window.location.pathname.replace('liked.html', 'index.html')
  };
  try {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      showToast('List copied to clipboard!');
    }
  } catch (e) {
    if (e.name !== 'AbortError') showToast('Could not share — try copying manually.');
  }
}

// ─── Render ───
function buildTile(bean) {
  const tile = document.createElement('div');
  tile.className = 'bean-tile';

  const img = document.createElement('img');
  img.className = 'bean-tile-img';
  img.src = bean.image_url;
  img.alt = bean.name;
  img.loading = 'lazy';
  img.addEventListener('error', () => {
    const fb = document.createElement('div');
    fb.className = 'bean-tile-fallback';
    fb.style.background = bean.bg || '#e8ddd0';
    fb.textContent = bean.emoji || '🫘';
    img.replaceWith(fb);
  });

  const info = document.createElement('div');
  info.className = 'bean-tile-info';
  info.innerHTML = `
    <div class="bean-tile-name">${bean.name}</div>
    <span class="bean-tile-badge">${bean.type === 'cat' ? '🐾 Toe Bean' : '🫘 Edible'}</span>
  `;

  const shareBtn = document.createElement('button');
  shareBtn.className = 'bean-tile-action share-btn';
  shareBtn.setAttribute('aria-label', `Share ${bean.name}`);
  shareBtn.textContent = '⬆';
  shareBtn.addEventListener('click', () => shareBean(bean));

  tile.append(img, info, shareBtn);
  return tile;
}

function renderSkeletons(n) {
  const grid = document.getElementById('skeleton-grid');
  grid.innerHTML = '';
  for (let i = 0; i < n; i++) {
    grid.insertAdjacentHTML('beforeend', `
      <div class="skeleton">
        <div class="skeleton-img"></div>
        <div class="skeleton-text"></div>
      </div>
    `);
  }
}

function renderLikedBeans(beans) {
  const grid = document.getElementById('liked-grid');
  grid.innerHTML = '';

  if (beans.length === 0) {
    document.getElementById('liked-content').classList.add('hidden');
    document.getElementById('liked-empty').classList.remove('hidden');
    return;
  }

  document.getElementById('liked-count').textContent = `${beans.length} bean${beans.length !== 1 ? 's' : ''}`;

  const shareWrap = document.getElementById('share-all-wrap');
  shareWrap.style.display = '';
  document.getElementById('share-all-btn').onclick = () => shareAll(beans);

  beans.forEach(bean => grid.appendChild(buildTile(bean)));
}

// ─── Load data ───
async function loadLikedBeans() {
  renderSkeletons(6);
  document.getElementById('liked-loading').classList.remove('hidden');

  const { data, error } = await supabase
    .from('likes')
    .select('liked_at, beans(*)')
    .order('liked_at', { ascending: false });

  document.getElementById('liked-loading').classList.add('hidden');

  if (error) {
    showToast('Could not load liked beans — please try again.');
    return;
  }

  const beans = (data || []).map(row => row.beans).filter(Boolean);
  document.getElementById('liked-content').classList.remove('hidden');
  renderLikedBeans(beans);
}

// ─── Auth gate ───
function showAuthWall() {
  document.getElementById('auth-wall').classList.remove('hidden');
  document.getElementById('liked-content').classList.add('hidden');
  document.getElementById('liked-loading').classList.add('hidden');
  document.getElementById('liked-empty').classList.add('hidden');
}

document.getElementById('wall-signin-btn').addEventListener('click', () => {
  if (typeof openAuthModal === 'function') openAuthModal();
});

// ─── Init ───
supabase.auth.getSession().then(({ data: { session } }) => {
  if (!session) {
    showAuthWall();
    return;
  }
  loadLikedBeans();
});

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    document.getElementById('auth-wall').classList.add('hidden');
    loadLikedBeans();
  } else if (event === 'SIGNED_OUT') {
    showAuthWall();
  }
});
