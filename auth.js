(function () {
  // ─── Inject auth modal ───
  document.body.insertAdjacentHTML('beforeend', `
    <div id="auth-modal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div class="modal-backdrop" id="auth-backdrop"></div>
      <div class="modal-content">
        <button id="auth-close" class="modal-close" aria-label="Close">✕</button>
        <h2 id="auth-title">Sign in to Only Beans</h2>
        <p class="auth-subtitle" id="auth-subtitle-text">We'll email you a magic link — no password needed.</p>

        <div id="auth-step-email">
          <div class="form-group">
            <label for="auth-email">Email</label>
            <input type="email" id="auth-email" placeholder="you@example.com" autocomplete="email">
          </div>
          <div class="form-error hidden" id="auth-error"></div>
          <button id="auth-send-btn" class="submit-btn">Send magic link</button>
        </div>

        <div id="auth-step-otp" class="hidden">
          <p class="auth-check-email">Check your inbox for a 6-digit code.</p>
          <div class="form-group">
            <label for="auth-otp">6-digit code</label>
            <input type="text" id="auth-otp" placeholder="123456" maxlength="6" inputmode="numeric" autocomplete="one-time-code">
          </div>
          <div class="form-error hidden" id="auth-otp-error"></div>
          <button id="auth-verify-btn" class="submit-btn">Verify code</button>
          <button type="button" id="auth-back-btn" class="auth-link-btn">← Use a different email</button>
        </div>
      </div>
    </div>

    <div id="user-menu" class="user-menu hidden" role="menu">
      <a href="liked.html" class="user-menu-item" role="menuitem">♥ Liked Beans</a>
      <a href="my-beans.html" class="user-menu-item" role="menuitem">🫘 My Uploads</a>
      <button id="signout-btn" class="user-menu-item user-menu-signout" role="menuitem">Sign out</button>
    </div>
  `);

  let pendingEmail = '';

  // ─── Open / close ───
  window.openAuthModal = function (subtitle) {
    document.getElementById('auth-subtitle-text').textContent =
      subtitle || 'We\'ll email you a magic link — no password needed.';
    document.getElementById('auth-step-email').classList.remove('hidden');
    document.getElementById('auth-step-otp').classList.add('hidden');
    document.getElementById('auth-error').classList.add('hidden');
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('auth-email').focus(), 50);
  };

  function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
  }

  document.getElementById('auth-close').addEventListener('click', closeAuthModal);
  document.getElementById('auth-backdrop').addEventListener('click', closeAuthModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAuthModal();
  });

  // ─── Send magic link ───
  document.getElementById('auth-send-btn').addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value.trim();
    const errEl = document.getElementById('auth-error');
    errEl.classList.add('hidden');

    if (!email || !email.includes('@')) {
      errEl.textContent = 'Please enter a valid email address.';
      errEl.classList.remove('hidden');
      return;
    }

    const btn = document.getElementById('auth-send-btn');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });

    btn.textContent = 'Send magic link';
    btn.disabled = false;

    if (error) {
      errEl.textContent = error.message;
      errEl.classList.remove('hidden');
      return;
    }

    pendingEmail = email;
    document.getElementById('auth-step-email').classList.add('hidden');
    document.getElementById('auth-step-otp').classList.remove('hidden');
    setTimeout(() => document.getElementById('auth-otp').focus(), 50);
  });

  // ─── Verify OTP ───
  document.getElementById('auth-verify-btn').addEventListener('click', async () => {
    const token = document.getElementById('auth-otp').value.trim();
    const errEl = document.getElementById('auth-otp-error');
    errEl.classList.add('hidden');

    if (token.length < 6) {
      errEl.textContent = 'Enter the 6-digit code from your email.';
      errEl.classList.remove('hidden');
      return;
    }

    const btn = document.getElementById('auth-verify-btn');
    btn.textContent = 'Verifying…';
    btn.disabled = true;

    const { error } = await supabase.auth.verifyOtp({
      email: pendingEmail,
      token,
      type: 'email'
    });

    btn.textContent = 'Verify code';
    btn.disabled = false;

    if (error) {
      errEl.textContent = 'Invalid code — check your email and try again.';
      errEl.classList.remove('hidden');
      return;
    }

    closeAuthModal();
  });

  // ─── Back to email step ───
  document.getElementById('auth-back-btn').addEventListener('click', () => {
    document.getElementById('auth-step-otp').classList.add('hidden');
    document.getElementById('auth-step-email').classList.remove('hidden');
    document.getElementById('auth-otp').value = '';
    pendingEmail = '';
  });

  // ─── Sign out ───
  document.getElementById('signout-btn').addEventListener('click', async () => {
    document.getElementById('user-menu').classList.add('hidden');
    await supabase.auth.signOut();
  });

  // ─── Render header auth UI ───
  function renderAuthUI(user) {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;

    headerRight.querySelectorAll('.auth-signin-btn, .auth-avatar').forEach(el => el.remove());

    if (!user) {
      const btn = document.createElement('button');
      btn.className = 'auth-signin-btn';
      btn.textContent = 'Sign in';
      btn.addEventListener('click', () => openAuthModal());
      headerRight.appendChild(btn);
    } else {
      const initial = (user.email || 'U')[0].toUpperCase();
      const avatar = document.createElement('button');
      avatar.className = 'auth-avatar';
      avatar.setAttribute('aria-label', 'Account menu');
      avatar.textContent = initial;
      avatar.addEventListener('click', e => {
        e.stopPropagation();
        const menu = document.getElementById('user-menu');
        const rect = avatar.getBoundingClientRect();
        menu.style.top = (rect.bottom + 8) + 'px';
        menu.style.right = (window.innerWidth - rect.right) + 'px';
        menu.classList.toggle('hidden');
      });
      headerRight.appendChild(avatar);
    }
  }

  // Close user menu when clicking outside
  document.addEventListener('click', () => {
    document.getElementById('user-menu').classList.add('hidden');
  });

  // ─── Auth state ───
  supabase.auth.onAuthStateChange((event, session) => {
    window.currentUser = session?.user ?? null;
    renderAuthUI(window.currentUser);
    if (event === 'SIGNED_IN' && typeof window.flushPendingLikes === 'function') {
      window.flushPendingLikes();
    }
  });

  // Restore session on load
  supabase.auth.getSession().then(({ data: { session } }) => {
    window.currentUser = session?.user ?? null;
    renderAuthUI(window.currentUser);
  });
})();
