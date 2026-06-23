let deck = [];
let likeCount = 0;
let isAnimating = false;
let selectedType = 'cat';

function init() {
  deck = [...BEANS].sort(() => Math.random() - 0.5);
  likeCount = 0;
  isAnimating = false;
  updateCounter();
  renderCards();
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

  // Render back-to-front so top card sits last in DOM (highest paint order)
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

  // Image with fallback
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

  // Info section
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

  // Swipe overlays
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

// Button controls
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
  if (e.key === 'ArrowRight') document.getElementById('like-btn').click();
  else if (e.key === 'ArrowLeft') document.getElementById('nope-btn').click();
});

// ─── Modal ───
const modal = document.getElementById('modal');

function openModal() { modal.classList.remove('hidden'); }
function closeModal() { modal.classList.add('hidden'); }

document.getElementById('add-bean-btn').addEventListener('click', openModal);
document.getElementById('close-modal').addEventListener('click', closeModal);
document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

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
document.getElementById('upload-form').addEventListener('submit', e => {
  e.preventDefault();
  const nameVal = document.getElementById('bean-name').value.trim();
  const photoInput = document.getElementById('bean-photo');
  const factVal = document.getElementById('bean-fact').value.trim();
  const errorEl = document.getElementById('form-error');

  if (!photoInput.files[0] || !nameVal) {
    errorEl.classList.remove('hidden');
    return;
  }
  errorEl.classList.add('hidden');

  const reader = new FileReader();
  reader.onload = ev => {
    const newBean = {
      id: Date.now(),
      name: nameVal,
      type: selectedType,
      image: ev.target.result,
      fact: factVal || null,
      emoji: selectedType === 'cat' ? '🐾' : '🫘',
      bg: selectedType === 'cat' ? '#f9c6c9' : '#c4956a'
    };

    // Drop it right on top of the deck
    deck.unshift(newBean);

    closeModal();
    resetForm();
    renderCards();
  };
  reader.readAsDataURL(photoInput.files[0]);
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

init();
