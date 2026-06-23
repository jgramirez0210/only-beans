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

// ─── Remove a bean ───
async function removeBean(beanId, tile) {
  if (!confirm('Remove this bean from the community deck?')) return;

  const { error } = await supabase
    .from('beans')
    .update({ is_removed: true })
    .eq('id', beanId)
    .eq('uploader_id', window.currentUser.id);

  if (error) {
    showToast('Could not remove — please try again.');
    return;
  }

  tile.style.transition = 'opacity 0.3s, transform 0.3s';
  tile.style.opacity = '0';
  tile.style.transform = 'scale(0.9)';
  setTimeout(() => {
    tile.remove();
    updateCount();
  }, 300);
}

function updateCount() {
  const tiles = document.querySelectorAll('#uploads-grid .bean-tile');
  const n = tiles.length;
  document.getElementById('upload-count').textContent = n > 0
    ? `${n} bean${n !== 1 ? 's' : ''}`
    : '';
  if (n === 0) {
    document.getElementById('uploads-content').classList.add('hidden');
    document.getElementById('uploads-empty').classList.remove('hidden');
  }
}

// ─── Render ───
function buildTile(bean) {
  const tile = document.createElement('div');
  tile.className = 'bean-tile';
  tile.dataset.id = bean.id;

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

  const uploadDate = new Date(bean.created_at);
  const dateStr = uploadDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const info = document.createElement('div');
  info.className = 'bean-tile-info';
  info.innerHTML = `
    <div class="bean-tile-name">${bean.name}</div>
    <span class="bean-tile-badge">${bean.type === 'cat' ? '🐾 Toe Bean' : '🫘 Edible'}</span>
    <div class="bean-tile-meta">Added ${dateStr}</div>
  `;

  const removeBtn = document.createElement('button');
  removeBtn.className = 'bean-tile-action remove-btn';
  removeBtn.setAttribute('aria-label', `Remove ${bean.name}`);
  removeBtn.textContent = '✕';
  removeBtn.addEventListener('click', () => removeBean(bean.id, tile));

  tile.append(img, info, removeBtn);
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

function renderUploads(beans) {
  const grid = document.getElementById('uploads-grid');
  grid.innerHTML = '';

  if (beans.length === 0) {
    document.getElementById('uploads-content').classList.add('hidden');
    document.getElementById('uploads-empty').classList.remove('hidden');
    return;
  }

  document.getElementById('upload-count').textContent =
    `${beans.length} bean${beans.length !== 1 ? 's' : ''}`;

  beans.forEach(bean => grid.appendChild(buildTile(bean)));
}

// ─── Load data ───
async function loadUploads() {
  renderSkeletons(4);
  document.getElementById('uploads-loading').classList.remove('hidden');

  const { data, error } = await supabase
    .from('beans')
    .select('*')
    .eq('uploader_id', window.currentUser.id)
    .eq('is_removed', false)
    .order('created_at', { ascending: false });

  document.getElementById('uploads-loading').classList.add('hidden');

  if (error) {
    showToast('Could not load uploads — please try again.');
    return;
  }

  document.getElementById('uploads-content').classList.remove('hidden');
  renderUploads(data || []);
}

// ─── Auth gate ───
function showAuthWall() {
  document.getElementById('auth-wall').classList.remove('hidden');
  document.getElementById('uploads-content').classList.add('hidden');
  document.getElementById('uploads-loading').classList.add('hidden');
  document.getElementById('uploads-empty').classList.add('hidden');
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
  window.currentUser = session.user;
  loadUploads();
});

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    window.currentUser = session.user;
    document.getElementById('auth-wall').classList.add('hidden');
    loadUploads();
  } else if (event === 'SIGNED_OUT') {
    showAuthWall();
  }
});
