let deck = [];
let likeCount = 0;
let isAnimating = false;
let selectedType = 'cat';

async function init() {
  deck = [...BEANS].sort(() => Math.random() - 0.5);
  likeCount = 0;
  isAnimating = false;
  updateCounter();
  renderCards();

  // Merge in community uploads after local beans are already showing
  try {
    const { data: community } = await supabase
      .from('beans')
      .select('*')
      .eq('is_seed', false)
      .eq('is_removed', false)
      .order('created_at', { ascending: false });

    if (community && community.length > 0) {
      const normalized = community.map(b => ({
        id:    b.id,
        name:  b.name,
        type:  b.type,
        image: b.image_url,
        fact:  b.fact,
        emoji: b.emoji,
        bg:    b.bg
      }));
      deck = [...normalized, ...deck].sort(() => Math.random() - 0.5);
      renderCards();
    }
  } catch (_) {
    // network unavailable — seed beans already showing
  }
}

function updateCounter() {
  document.getElementById('like-count').textContent = likeCount;
}

function renderCards() {
  const stack = document.getElementById('card-stack');
  const emptyState = document.getElementById('empty-state');
  const controls = document.getElementById('controls');

  stack.innerHTML = '';

  if (deck.length === 0) {
    emptyState.classList.remove('hidden');
    controls.classList.add('hidden');
    document.getElementById('final-count').textContent = likeCount;
    return;
  }

  emptyState.classList.add('hidden');
  controls.classList.remove('hidden');

  const visible = Math.min(deck.length, 3);

  for (let i = visible - 1; i >= 0; i--) {
    const card = buildCard(deck[i]);
    if (i === 2) card.classList.add('card-bot');
    else if (i === 1) card.classList.add('card-mid');
    else card.classList.add('card-top');
    stack.appendChild(card);
  }

  attachDrag(stack.querySelector('.card-top'));
}

function buildCard(bean) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = bean.id;

  const img = document.createElement('img');
  img.className = 'card-image';
  img.alt = bean.name;
  img.draggable = false;
  img.src = bean.image;
  img.addEventListener('error', () => {
    const fallback = document.createElement('div');
    fallback.className = 'card-fallback';
    fallback.style.background = bean.bg;
    fallback.textContent = bean.emoji;
    img.replaceWith(fallback);
  });

  const info = document.createElement('div');
  info.className = 'card-info';

  const badge = document.createElement('span');
  badge.className = 'card-badge';
  badge.textContent = bean.type === 'cat' ? '🐾 Toe Bean' : '🫘 Edible';

  const name = document.createElement('div');
  name.className = 'card-name';
  name.textContent = bean.name;

  info.appendChild(badge);
  info.appendChild(name);

  if (bean.fact) {
    const fact = document.createElement('p');
    fact.className = 'card-fact';
    fact.textContent = bean.fact;
    info.appendChild(fact);
  }

  const overlayYes = document.createElement('div');
  overlayYes.className = 'card-overlay overlay-like';
  overlayYes.textContent = 'YES';

  const overlayNope = document.createElement('div');
  overlayNope.className = 'card-overlay overlay-nope';
  overlayNope.textContent = 'NOPE';

  card.append(img, info, overlayYes, overlayNope);
  return card;
}

function attachDrag(card) {
  if (!card) return;

  let startX = 0, startY = 0, dx = 0, dragging = false;
  const THRESHOLD = 90;

  card.addEventListener('pointerdown', e => {
    if (isAnimating) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    dx = 0;
    card.setPointerCapture(e.pointerId);
    card.style.transition = 'none';
  });

  card.addEventListener('pointermove', e => {
    if (!dragging) return;
    dx = e.clientX - startX;
    const dy = (e.clientY - startY) * 0.15;
    const rot = dx * 0.07;

    card.style.transform = `translateX(${dx}px) translateY(${dy}px) rotate(${rot}deg)`;

    const progress = Math.min(Math.abs(dx) / THRESHOLD, 1);
    card.querySelector('.overlay-like').style.opacity = dx > 0 ? progress : 0;
    card.querySelector('.overlay-nope').style.opacity = dx < 0 ? progress : 0;
  });

  const release = () => {
    if (!dragging) return;
    dragging = false;

    if (Math.abs(dx) >= THRESHOLD) {
      flyOff(card, dx > 0);
    } else {
      card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      card.style.transform = '';
      card.querySelector('.overlay-like').style.opacity = 0;
      card.querySelector('.overlay-nope').style.opacity = 0;
    }
  };

  card.addEventListener('pointerup', release);
  card.addEventListener('pointercancel', release);
}

function flyOff(card, liked) {
  if (isAnimating) return;
  isAnimating = true;

  if (liked) {
    likeCount++;
    updateCounter();
    persistLike(card.dataset.id);
  }

  card.style.transition = 'transform 0.42s ease-in, opacity 0.42s';
  card.style.transform = liked
    ? 'translateX(130vw) rotate(28deg)'
    : 'translateX(-130vw) rotate(-28deg)';
  card.style.opacity = '0';

  deck.shift();

  setTimeout(() => {
    isAnimating = false;
    renderCards();
  }, 400);
}

// ─── Persistence ───
async function persistLike(beanId) {
  if (!window.currentUser) {
    const pending = JSON.parse(localStorage.getItem('pendingLikes') || '[]');
    if (!pending.includes(beanId)) {
      localStorage.setItem('pendingLikes', JSON.stringify([...pending, beanId]));
    }
    return;
  }
  try {
    await supabase.from('likes').upsert(
      { user_id: window.currentUser.id, bean_id: beanId },
      { onConflict: 'user_id,bean_id', ignoreDuplicates: true }
    );
  } catch (_) {
    const pending = JSON.parse(localStorage.getItem('pendingLikes') || '[]');
    if (!pending.includes(beanId)) {
      localStorage.setItem('pendingLikes', JSON.stringify([...pending, beanId]));
    }
  }
}

window.flushPendingLikes = async function () {
  const pending = JSON.parse(localStorage.getItem('pendingLikes') || '[]');
  if (!pending.length || !window.currentUser) return;

  const rows = pending.map(beanId => ({
    user_id: window.currentUser.id,
    bean_id: beanId
  }));

  try {
    await supabase.from('likes').upsert(rows, {
      onConflict: 'user_id,bean_id',
      ignoreDuplicates: true
    });
    localStorage.removeItem('pendingLikes');
  } catch (_) {
    // keep in queue, try again next sign-in
  }
};

// ─── Button controls ───
document.getElementById('like-btn').addEventListener('click', () => {
  if (isAnimating) return;
  const top = document.querySelector('.card-top');
  if (top) flyOff(top, true);
});

document.getElementById('nope-btn').addEventListener('click', () => {
  if (isAnimating) return;
  const top = document.querySelector('.card-top');
  if (top) flyOff(top, false);
});

document.getElementById('restart-btn').addEventListener('click', init);

// Arrow key shortcuts
document.addEventListener('keydown', e => {
  if (!document.getElementById('modal').classList.contains('hidden')) return;
  if (!document.getElementById('auth-modal')?.classList.contains('hidden')) return;
  if (e.key === 'ArrowRight') document.getElementById('like-btn').click();
  else if (e.key === 'ArrowLeft') document.getElementById('nope-btn').click();
});

// ─── Upload modal ───
const modal = document.getElementById('modal');

function openModal() { modal.classList.remove('hidden'); }
function closeModal() { modal.classList.add('hidden'); }

document.getElementById('add-bean-btn').addEventListener('click', () => {
  if (!window.currentUser) {
    openAuthModal('Sign in to add a bean to the community deck.');
    return;
  }
  openModal();
});

document.getElementById('close-modal').addEventListener('click', closeModal);
document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// Type toggle
document.querySelectorAll('.type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedType = btn.dataset.type;
  });
});

// Photo preview
document.getElementById('bean-photo').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const preview = document.getElementById('file-preview');
    preview.innerHTML = '';
    const img = document.createElement('img');
    img.src = ev.target.result;
    img.alt = 'Preview';
    preview.appendChild(img);
  };
  reader.readAsDataURL(file);
});

// Upload form
document.getElementById('upload-form').addEventListener('submit', async e => {
  e.preventDefault();

  const nameVal   = document.getElementById('bean-name').value.trim();
  const photoInput = document.getElementById('bean-photo');
  const factVal   = document.getElementById('bean-fact').value.trim();
  const errorEl   = document.getElementById('form-error');
  const submitBtn = document.getElementById('upload-submit-btn');

  errorEl.classList.add('hidden');

  if (!photoInput.files[0] || !nameVal) {
    errorEl.textContent = 'Please add a photo and a name.';
    errorEl.classList.remove('hidden');
    return;
  }

  submitBtn.textContent = 'Uploading…';
  submitBtn.disabled = true;

  try {
    const file = photoInput.files[0];
    const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${window.currentUser.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('bean-images')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('bean-images')
      .getPublicUrl(path);

    const { data: newBean, error: insertError } = await supabase
      .from('beans')
      .insert({
        name:        nameVal,
        type:        selectedType,
        image_url:   publicUrl,
        fact:        factVal || null,
        emoji:       selectedType === 'cat' ? '🐾' : '🫘',
        bg:          selectedType === 'cat' ? '#f9c6c9' : '#c4956a',
        uploader_id: window.currentUser.id,
        is_seed:     false
      })
      .select()
      .single();

    if (insertError) throw insertError;

    deck.unshift({
      id:    newBean.id,
      name:  newBean.name,
      type:  newBean.type,
      image: newBean.image_url,
      fact:  newBean.fact,
      emoji: newBean.emoji,
      bg:    newBean.bg
    });

    closeModal();
    resetForm();
    renderCards();

  } catch (err) {
    errorEl.textContent = err.message || 'Upload failed — please try again.';
    errorEl.classList.remove('hidden');
  } finally {
    submitBtn.textContent = 'Add to Deck';
    submitBtn.disabled = false;
  }
});

function resetForm() {
  document.getElementById('upload-form').reset();
  document.getElementById('file-preview').innerHTML =
    '<span class="file-placeholder">Tap or click to choose a photo</span>';
  document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-type="cat"]').classList.add('active');
  document.getElementById('form-error').classList.add('hidden');
  selectedType = 'cat';
}

// ─── Auth UI styles injected so style.css stays unchanged ───
document.head.insertAdjacentHTML('beforeend', `<style>
  .auth-signin-btn {
    border: 2px solid var(--rose); background: transparent; color: var(--rose);
    border-radius: 999px; padding: 7px 16px; font-family: 'Nunito', sans-serif;
    font-weight: 800; font-size: 0.85rem; cursor: pointer;
    transition: background 0.2s, color 0.2s; white-space: nowrap;
  }
  .auth-signin-btn:hover { background: var(--rose); color: #fff; }
  .auth-avatar {
    width: 40px; height: 40px; border-radius: 50%; background: var(--sage);
    color: #fff; font-family: 'Fredoka One', sans-serif; font-size: 1.1rem;
    border: none; cursor: pointer; display: flex; align-items: center;
    justify-content: center; transition: background 0.2s, transform 0.1s; flex-shrink: 0;
  }
  .auth-avatar:hover { background: var(--sage-dark); }
  .auth-avatar:active { transform: scale(0.95); }
  .user-menu {
    position: fixed; z-index: 60; background: #fff; border-radius: 16px;
    box-shadow: 0 8px 32px rgba(61,44,30,0.18); overflow: hidden; min-width: 180px;
  }
  .user-menu-item {
    display: block; width: 100%; padding: 13px 18px; text-align: left;
    background: none; border: none; font-family: 'Nunito', sans-serif;
    font-weight: 700; font-size: 0.92rem; color: var(--text); cursor: pointer;
    text-decoration: none; transition: background 0.15s;
  }
  .user-menu-item:hover { background: var(--cream); }
  .user-menu-signout { color: var(--rose); border-top: 1px solid var(--border); }
  #auth-modal .modal-content h2 { font-size: 1.6rem; margin-bottom: 6px; }
  .auth-subtitle { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 22px; line-height: 1.5; }
  .auth-check-email { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 18px; line-height: 1.5; }
  .auth-link-btn {
    display: block; margin-top: 12px; background: none; border: none;
    color: var(--text-muted); font-family: 'Nunito', sans-serif; font-size: 0.85rem;
    font-weight: 700; cursor: pointer; text-align: center; width: 100%; padding: 8px;
  }
  .auth-link-btn:hover { color: var(--text); }
  #auth-modal .form-group {
    display: flex; flex-direction: column; gap: 7px; margin-bottom: 18px;
  }
  #auth-modal .form-group label {
    font-weight: 800; font-size: 0.78rem; text-transform: uppercase;
    letter-spacing: 0.06em; color: var(--text-muted);
  }
  #auth-modal .form-group input {
    border: 2px solid var(--border); border-radius: 12px; padding: 10px 14px;
    font-family: 'Nunito', sans-serif; font-size: 1rem; color: var(--text);
    outline: none; transition: border-color 0.2s; background: #fff; width: 100%;
  }
  #auth-modal .form-group input:focus { border-color: var(--sage); }
</style>`);

init();
