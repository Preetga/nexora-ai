/**
 * NEXORA AI — Firebase Authentication Module
 * Handles Firebase init, auth state, email/password, Google sign-in, and local fallback.
 */

(function () {
  'use strict';

  const NexoraAuth = {
    app: null,
    auth: null,
    currentUser: null,
    isFirebaseConfigured: false,
    isLocalMode: false,
    _onAuthCallbacks: [],

    /**
     * Initialize Firebase Auth or fall back to local mode
     */
    async init() {
      try {
        // Fetch Firebase config from backend
        const res = await fetch('/api/firebase-config');
        const data = await res.json();

        if (data.configured && data.config.apiKey && data.config.projectId) {
          // Wait for Firebase SDK to load
          await this._waitForFirebaseSDK();
          const fb = window._firebase;
          this.app = fb.initializeApp(data.config);
          this.auth = fb.getAuth(this.app);
          this.isFirebaseConfigured = true;

          // Listen for auth state changes
          fb.onAuthStateChanged(this.auth, (user) => {
            this.currentUser = user;
            this._notifyListeners(user);
          });

          console.log('[NexoraAuth] Firebase initialized successfully.');
        } else {
          this._initLocalMode();
        }
      } catch (err) {
        console.warn('[NexoraAuth] Firebase init failed, falling back to local mode:', err.message);
        this._initLocalMode();
      }
    },

    /**
     * Local development fallback — no Firebase required
     */
    _initLocalMode() {
      this.isLocalMode = true;
      this.isFirebaseConfigured = false;
      console.log('[NexoraAuth] Running in local development mode (no Firebase).');

      // Check for stored local session
      const stored = localStorage.getItem('nexora_local_user');
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
          this._notifyListeners(this.currentUser);
        } catch (e) {
          localStorage.removeItem('nexora_local_user');
          this._notifyListeners(null);
        }
      } else {
        this._notifyListeners(null);
      }
    },

    /**
     * Wait for Firebase SDK module to load
     */
    _waitForFirebaseSDK() {
      return new Promise((resolve) => {
        if (window._firebase) return resolve();
        window.addEventListener('firebase-sdk-ready', () => resolve(), { once: true });
        // Timeout fallback
        setTimeout(resolve, 5000);
      });
    },

    /**
     * Register auth state listener
     */
    onAuthStateChanged(callback) {
      this._onAuthCallbacks.push(callback);
      // Immediately call with current state if already resolved
      if (this.currentUser !== undefined) {
        callback(this.currentUser);
      }
    },

    _notifyListeners(user) {
      this._onAuthCallbacks.forEach(cb => {
        try { cb(user); } catch (e) { console.error('[NexoraAuth] Listener error:', e); }
      });
    },

    /**
     * Sign in with email and password
     */
    async signInWithEmail(email, password) {
      if (this.isLocalMode) {
        return this._localSignIn(email);
      }
      const fb = window._firebase;
      const result = await fb.signInWithEmailAndPassword(this.auth, email, password);
      return result.user;
    },

    /**
     * Sign up with email and password
     */
    async signUpWithEmail(email, password, displayName) {
      if (this.isLocalMode) {
        return this._localSignUp(email, displayName);
      }
      const fb = window._firebase;
      const result = await fb.createUserWithEmailAndPassword(this.auth, email, password);
      if (displayName) {
        await fb.updateProfile(result.user, { displayName: displayName });
      }
      return result.user;
    },

    /**
     * Sign in with Google popup
     */
    async signInWithGoogle() {
      if (this.isLocalMode) {
        return this._localSignIn('google-user@nexora.ai', 'Google User');
      }
      const fb = window._firebase;
      const provider = new fb.GoogleAuthProvider();
      const result = await fb.signInWithPopup(this.auth, provider);
      return result.user;
    },

    /**
     * Send password reset email
     */
    async resetPassword(email) {
      if (this.isLocalMode) {
        return; // No-op in local mode
      }
      const fb = window._firebase;
      await fb.sendPasswordResetEmail(this.auth, email);
    },

    /**
     * Sign out
     */
    async signOut() {
      if (this.isLocalMode) {
        localStorage.removeItem('nexora_local_user');
        this.currentUser = null;
        this._notifyListeners(null);
        return;
      }
      const fb = window._firebase;
      await fb.signOut(this.auth);
    },

    /**
     * Local mode helpers
     */
    _localSignIn(email, name) {
      const user = {
        uid: 'local-' + Date.now(),
        email: email,
        displayName: name || email.split('@')[0],
        photoURL: null,
        isLocal: true
      };
      localStorage.setItem('nexora_local_user', JSON.stringify(user));
      this.currentUser = user;
      this._notifyListeners(user);
      return user;
    },

    _localSignUp(email, name) {
      return this._localSignIn(email, name);
    },

    /**
     * Get current user info
     */
    getUser() {
      return this.currentUser;
    },

    getUserDisplayName() {
      if (!this.currentUser) return 'User';
      return this.currentUser.displayName || this.currentUser.email?.split('@')[0] || 'User';
    },

    getUserEmail() {
      if (!this.currentUser) return '';
      return this.currentUser.email || '';
    },

    getUserInitial() {
      const name = this.getUserDisplayName();
      return name.charAt(0).toUpperCase();
    }
  };

  // Expose globally
  window.NexoraAuth = NexoraAuth;

  // Auto-initialize
  NexoraAuth.init();
})();
