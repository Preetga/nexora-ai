/**
 * NEXORA AI — Complete Client Application
 * "Think. Remember. Create. Act."
 * Full SPA with hash-based routing, 12 interactive modules, and preserved Groq chat.
 */

(function () {
  'use strict';

  // =========================================================================
  // STATE
  // =========================================================================
  const state = {
    currentView: 'dashboard',
    currentChatId: null,
    chats: [],
    projects: [],
    goals: [],
    tasks: [],
    knowledgeDocs: [],
    learningPlans: [],
    researchTopics: [],
    memories: { preferences: [], goals: [], projects: [], learning: [] },
    selectedModel: 'qwen/qwen3.8-27b',
    models: [],
    temperature: 0.7,
    systemPrompt: '',
    isStreaming: false,
    attachedFile: null,
    isRecording: false,
    recognition: null,
    isKeyConfigured: false,
    theme: 'dark',
    accentColor: 'cyan',
    activityLog: []
  };

  // =========================================================================
  // DOM CACHE
  // =========================================================================
  function $(id) { return document.getElementById(id); }
  function $$(sel) { return document.querySelectorAll(sel); }

  const DOM = {};
  function cacheDom() {
    // Auth
    DOM.authScreen = $('authScreen');
    DOM.workspaceShell = $('workspaceShell');
    DOM.authError = $('authError');
    DOM.authSuccess = $('authSuccess');
    DOM.signInForm = $('signInForm');
    DOM.signUpForm = $('signUpForm');
    DOM.tabSignIn = $('tabSignIn');
    DOM.tabSignUp = $('tabSignUp');
    DOM.authCardTitle = $('authCardTitle');
    DOM.authCardSubtitle = $('authCardSubtitle');
    DOM.signInEmail = $('signInEmail');
    DOM.signInPassword = $('signInPassword');
    DOM.signUpName = $('signUpName');
    DOM.signUpEmail = $('signUpEmail');
    DOM.signUpPassword = $('signUpPassword');
    DOM.signInSubmitBtn = $('signInSubmitBtn');
    DOM.signUpSubmitBtn = $('signUpSubmitBtn');
    DOM.googleSignInBtn = $('googleSignInBtn');
    DOM.forgotPasswordBtn = $('forgotPasswordBtn');

    // Workspace
    DOM.sidebar = $('sidebar');
    DOM.sidebarToggleBtn = $('sidebarToggleBtn');
    DOM.sidebarCloseBtn = $('sidebarCloseBtn');
    DOM.sidebarOverlay = $('sidebarOverlay');
    DOM.sidebarNav = $('sidebarNav');
    DOM.breadcrumb = $('breadcrumb');
    DOM.breadcrumbSection = $('breadcrumbSection');
    DOM.headerStatusIndicator = $('headerStatusIndicator');
    DOM.logoutBtn = $('logoutBtn');
    DOM.userAvatarSidebar = $('userAvatarSidebar');
    DOM.userNameSidebar = $('userNameSidebar');
    DOM.userEmailSidebar = $('userEmailSidebar');
    DOM.headerNewChatBtn = $('headerNewChatBtn');

    // Chat
    DOM.chatSidebar = $('chatSidebar');
    DOM.chatSidebarToggle = $('chatSidebarToggle');
    DOM.chatSearchInput = $('chatSearchInput');
    DOM.newChatBtn = $('newChatBtn');
    DOM.historyList = $('historyList');
    DOM.clearAllHistoryBtn = $('clearAllHistoryBtn');
    DOM.currentChatTitle = $('currentChatTitle');
    DOM.modelSelectorBtn = $('modelSelectorBtn');
    DOM.selectedModelLabel = $('selectedModelLabel');
    DOM.modelDropdownMenu = $('modelDropdownMenu');
    DOM.chatViewport = $('chatViewport');
    DOM.welcomeContainer = $('welcomeContainer');
    DOM.messagesContainer = $('messagesContainer');
    DOM.chatTextarea = $('chatTextarea');
    DOM.sendBtn = $('sendBtn');
    DOM.attachBtn = $('attachBtn');
    DOM.fileInput = $('fileInput');
    DOM.attachmentPreview = $('attachmentPreview');
    DOM.attachmentName = $('attachmentName');
    DOM.attachmentSize = $('attachmentSize');
    DOM.attachmentRemoveBtn = $('attachmentRemoveBtn');
    DOM.voiceBtn = $('voiceBtn');

    // Dashboard
    DOM.dashboardGreeting = $('dashboardGreeting');
    DOM.statProjects = $('statProjects');
    DOM.statGoals = $('statGoals');
    DOM.statTasks = $('statTasks');
    DOM.statChats = $('statChats');
    DOM.activityList = $('activityList');

    // Settings
    DOM.groqApiKeyInput = $('groqApiKeyInput');
    DOM.saveApiKeyBtn = $('saveApiKeyBtn');
    DOM.apiKeyStatusBadge = $('apiKeyStatusBadge');
    DOM.keyStatusHint = $('keyStatusHint');
    DOM.systemPromptInput = $('systemPromptInput');
    DOM.tempSlider = $('tempSlider');
    DOM.tempValueDisplay = $('tempValueDisplay');
    DOM.saveSettingsBtn = $('saveSettingsBtn');
    DOM.resetDefaultsBtn = $('resetDefaultsBtn');
    DOM.settingsAvatar = $('settingsAvatar');
    DOM.settingsUserName = $('settingsUserName');
    DOM.settingsUserEmail = $('settingsUserEmail');
    DOM.navSettingsBtn = $('navSettingsBtn');

    // Other modules
    DOM.createProjectBtn = $('createProjectBtn');
    DOM.createProjectEmptyBtn = $('createProjectEmptyBtn');
    DOM.projectsGrid = $('projectsGrid');
    DOM.createGoalBtn = $('createGoalBtn');
    DOM.createGoalEmptyBtn = $('createGoalEmptyBtn');
    DOM.goalsGrid = $('goalsGrid');
    DOM.createTaskBtn = $('createTaskBtn');
    DOM.todoList = $('todoList');
    DOM.progressList = $('progressList');
    DOM.doneList = $('doneList');
    DOM.todoCount = $('todoCount');
    DOM.progressCount = $('progressCount');
    DOM.doneCount = $('doneCount');
    DOM.knowledgeFileInput = $('knowledgeFileInput');
    DOM.knowledgeBrowseBtn = $('knowledgeBrowseBtn');
    DOM.knowledgeNoteInput = $('knowledgeNoteInput');
    DOM.knowledgeNoteTitle = $('knowledgeNoteTitle');
    DOM.addKnowledgeNoteBtn = $('addKnowledgeNoteBtn');
    DOM.knowledgeCards = $('knowledgeCards');
    DOM.learnTopicInput = $('learnTopicInput');
    DOM.learnLevelSelect = $('learnLevelSelect');
    DOM.generateLearningPlanBtn = $('generateLearningPlanBtn');
    DOM.learnPlansContainer = $('learnPlansContainer');
    DOM.challengeCategory = $('challengeCategory');
    DOM.challengeIdeaInput = $('challengeIdeaInput');
    DOM.submitChallengeBtn = $('submitChallengeBtn');
    DOM.challengeResult = $('challengeResult');
    DOM.challengeOutput = $('challengeOutput');
    DOM.newResearchBtn = $('newResearchBtn');
    DOM.addMemoryBtn = $('addMemoryBtn');
    DOM.loadingOverlay = $('loadingOverlay');
    DOM.toastContainer = $('toastContainer');

    // Modals
    DOM.createModal = $('createModal');
    DOM.createModalTitle = $('createModalTitle');
    DOM.createModalBody = $('createModalBody');
    DOM.closeCreateModal = $('closeCreateModal');
    DOM.cancelCreateModal = $('cancelCreateModal');
    DOM.confirmCreateModal = $('confirmCreateModal');
  }

  // =========================================================================
  // INIT
  // =========================================================================
  function init() {
    cacheDom();
    loadState();
    loadPreferences();
    setupMarked();
    bindAuthEvents();
    bindWorkspaceEvents();
    bindChatEvents();
    bindModuleEvents();

    // Auth state listener
    if (window.NexoraAuth) {
      NexoraAuth.onAuthStateChanged(onAuthStateChanged);
    } else {
      // Fallback if auth module not loaded yet
      setTimeout(() => {
        if (window.NexoraAuth) {
          NexoraAuth.onAuthStateChanged(onAuthStateChanged);
        } else {
          showWorkspace();
        }
      }, 2000);
    }

    // Initialize 3D orb on auth screen
    if (window.NexoraOrb) {
      NexoraOrb.init('orbCanvas');
    }
  }

  // =========================================================================
  // AUTH
  // =========================================================================
  function onAuthStateChanged(user) {
    if (user) {
      showWorkspace(user);
    } else {
      showAuthScreen();
    }
  }

  function showAuthScreen() {
    if (DOM.authScreen) DOM.authScreen.style.display = '';
    if (DOM.workspaceShell) DOM.workspaceShell.style.display = 'none';
    if (window.NexoraOrb && !NexoraOrb.isActive) {
      NexoraOrb.init('orbCanvas');
    }
  }

  function showWorkspace(user) {
    if (DOM.authScreen) DOM.authScreen.style.display = 'none';
    if (DOM.workspaceShell) DOM.workspaceShell.style.display = '';
    if (window.NexoraOrb) NexoraOrb.stop();

    // Update user info
    if (user) {
      const name = user.displayName || user.email?.split('@')[0] || 'User';
      const email = user.email || '';
      const initial = name.charAt(0).toUpperCase();
      if (DOM.userAvatarSidebar) DOM.userAvatarSidebar.textContent = initial;
      if (DOM.userNameSidebar) DOM.userNameSidebar.textContent = name;
      if (DOM.userEmailSidebar) DOM.userEmailSidebar.textContent = email;
      if (DOM.settingsAvatar) DOM.settingsAvatar.textContent = initial;
      if (DOM.settingsUserName) DOM.settingsUserName.textContent = name;
      if (DOM.settingsUserEmail) DOM.settingsUserEmail.textContent = email;
    }

    // Initialize workspace
    fetchStatus();
    fetchModels();
    loadChatHistory();
    setupRouter();
    updateDashboard();
    setupSpeechRecognition();
  }

  function bindAuthEvents() {
    // Tab switching
    if (DOM.tabSignIn) DOM.tabSignIn.addEventListener('click', () => switchAuthTab('signin'));
    if (DOM.tabSignUp) DOM.tabSignUp.addEventListener('click', () => switchAuthTab('signup'));

    // Sign In
    if (DOM.signInForm) {
      DOM.signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAuthMessages();
        setAuthLoading(DOM.signInSubmitBtn, true);
        try {
          await NexoraAuth.signInWithEmail(DOM.signInEmail.value.trim(), DOM.signInPassword.value);
        } catch (err) {
          showAuthError(formatAuthError(err));
        }
        setAuthLoading(DOM.signInSubmitBtn, false);
      });
    }

    // Sign Up
    if (DOM.signUpForm) {
      DOM.signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAuthMessages();
        setAuthLoading(DOM.signUpSubmitBtn, true);
        try {
          await NexoraAuth.signUpWithEmail(
            DOM.signUpEmail.value.trim(),
            DOM.signUpPassword.value,
            DOM.signUpName.value.trim()
          );
        } catch (err) {
          showAuthError(formatAuthError(err));
        }
        setAuthLoading(DOM.signUpSubmitBtn, false);
      });
    }

    // Google Sign In
    if (DOM.googleSignInBtn) {
      DOM.googleSignInBtn.addEventListener('click', async () => {
        hideAuthMessages();
        try {
          await NexoraAuth.signInWithGoogle();
        } catch (err) {
          showAuthError(formatAuthError(err));
        }
      });
    }

    // Forgot Password
    if (DOM.forgotPasswordBtn) {
      DOM.forgotPasswordBtn.addEventListener('click', async () => {
        const email = DOM.signInEmail?.value.trim();
        if (!email) {
          showAuthError('Please enter your email address first.');
          return;
        }
        try {
          await NexoraAuth.resetPassword(email);
          showAuthSuccess('Password reset email sent! Check your inbox.');
        } catch (err) {
          showAuthError(formatAuthError(err));
        }
      });
    }
  }

  function switchAuthTab(tab) {
    DOM.tabSignIn.classList.toggle('active', tab === 'signin');
    DOM.tabSignUp.classList.toggle('active', tab === 'signup');
    DOM.signInForm.style.display = tab === 'signin' ? '' : 'none';
    DOM.signUpForm.style.display = tab === 'signup' ? '' : 'none';
    DOM.authCardTitle.textContent = tab === 'signin' ? 'Welcome Back' : 'Create Account';
    DOM.authCardSubtitle.textContent = tab === 'signin' ? 'Sign in to your workspace' : 'Join NEXORA AI workspace';
    hideAuthMessages();
  }

  function showAuthError(msg) {
    if (DOM.authError) { DOM.authError.textContent = msg; DOM.authError.style.display = ''; }
  }
  function showAuthSuccess(msg) {
    if (DOM.authSuccess) { DOM.authSuccess.textContent = msg; DOM.authSuccess.style.display = ''; }
  }
  function hideAuthMessages() {
    if (DOM.authError) DOM.authError.style.display = 'none';
    if (DOM.authSuccess) DOM.authSuccess.style.display = 'none';
  }
  function setAuthLoading(btn, loading) {
    if (!btn) return;
    const text = btn.querySelector('.auth-btn-text');
    const loader = btn.querySelector('.auth-btn-loader');
    if (text) text.style.display = loading ? 'none' : '';
    if (loader) loader.style.display = loading ? '' : 'none';
    btn.disabled = loading;
  }
  function formatAuthError(err) {
    const code = err?.code || '';
    const map = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid credentials. Please check and try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
      'auth/invalid-email': 'Invalid email address format.',
      'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
      'auth/network-request-failed': 'Network error. Check your connection.'
    };
    return map[code] || err?.message || 'Authentication failed. Please try again.';
  }

  // =========================================================================
  // ROUTER (Hash-based SPA navigation)
  // =========================================================================
  const VIEW_TITLES = {
    dashboard: 'Dashboard', chat: 'AI Chat', projects: 'Projects',
    goals: 'Goals', tasks: 'Tasks', knowledge: 'Knowledge Hub',
    learn: 'Learning', research: 'Research Studio', agents: 'AI Agents',
    challenge: 'Challenge Idea', memory: 'Memory', settings: 'Settings'
  };

  function setupRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  function handleRoute() {
    const hash = (window.location.hash || '#dashboard').replace('#', '');
    const view = VIEW_TITLES[hash] ? hash : 'dashboard';
    navigateTo(view, false);
  }

  function navigateTo(view, pushHash = true) {
    if (pushHash && window.location.hash !== '#' + view) {
      window.location.hash = view;
      return; // hashchange will call navigateTo again
    }

    state.currentView = view;

    // Update active nav
    $$('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === view);
    });

    // Show/hide view panels
    $$('.view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === 'view-' + view);
    });

    // Update breadcrumb
    if (DOM.breadcrumbSection) DOM.breadcrumbSection.textContent = VIEW_TITLES[view] || 'Dashboard';

    // Close mobile sidebar
    closeSidebar();

    // View-specific init
    if (view === 'dashboard') updateDashboard();
    if (view === 'tasks') renderTasks();
    if (view === 'chat') {
      if (DOM.chatSidebar) DOM.chatSidebar.classList.add('open');
    }
  }

  // =========================================================================
  // WORKSPACE EVENTS
  // =========================================================================
  function bindWorkspaceEvents() {
    // Sidebar toggle
    if (DOM.sidebarToggleBtn) DOM.sidebarToggleBtn.addEventListener('click', toggleSidebar);
    if (DOM.sidebarCloseBtn) DOM.sidebarCloseBtn.addEventListener('click', closeSidebar);
    if (DOM.sidebarOverlay) DOM.sidebarOverlay.addEventListener('click', closeSidebar);

    // Nav items
    $$('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(item.dataset.view);
      });
    });

    // Settings nav button
    if (DOM.navSettingsBtn) DOM.navSettingsBtn.addEventListener('click', () => navigateTo('settings'));

    // Logout
    if (DOM.logoutBtn) {
      DOM.logoutBtn.addEventListener('click', async () => {
        if (window.NexoraAuth) await NexoraAuth.signOut();
      });
    }

    // New Chat from header
    if (DOM.headerNewChatBtn) DOM.headerNewChatBtn.addEventListener('click', () => {
      navigateTo('chat');
      setTimeout(createNewChat, 100);
    });

    // Quick action tiles on dashboard
    $$('.quick-action-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const action = tile.dataset.action;
        if (action === 'new-chat') { navigateTo('chat'); setTimeout(createNewChat, 100); }
        else if (action === 'new-project') openCreateModal('project');
        else if (action === 'new-goal') openCreateModal('goal');
        else if (action === 'new-task') openCreateModal('task');
        else if (action === 'learn-topic') navigateTo('learn');
        else if (action === 'challenge') navigateTo('challenge');
      });
    });

    // Suggestion cards
    $$('.suggestion-card').forEach(card => {
      card.addEventListener('click', () => {
        const action = card.dataset.action;
        if (action === 'new-chat') {
          navigateTo('chat');
          setTimeout(() => {
            createNewChat();
            const prompt = card.dataset.prompt;
            if (prompt && DOM.chatTextarea) {
              DOM.chatTextarea.value = prompt;
              sendMessage();
            }
          }, 150);
        } else if (action === 'new-goal') navigateTo('goals');
        else if (action === 'learn-topic') navigateTo('learn');
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        navigateTo('chat');
        setTimeout(createNewChat, 100);
      }
    });

    // Theme & accent
    $$('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });
    $$('.accent-btn').forEach(btn => {
      btn.addEventListener('click', () => setAccentColor(btn.dataset.accent));
    });

    // Settings
    if (DOM.saveApiKeyBtn) DOM.saveApiKeyBtn.addEventListener('click', saveApiKey);
    if (DOM.tempSlider) DOM.tempSlider.addEventListener('input', () => {
      state.temperature = parseFloat(DOM.tempSlider.value);
      if (DOM.tempValueDisplay) DOM.tempValueDisplay.textContent = state.temperature.toFixed(2);
    });
    if (DOM.saveSettingsBtn) DOM.saveSettingsBtn.addEventListener('click', saveSettings);
    if (DOM.resetDefaultsBtn) DOM.resetDefaultsBtn.addEventListener('click', resetDefaults);
  }

  function toggleSidebar() {
    DOM.sidebar?.classList.toggle('open');
    DOM.sidebarOverlay?.classList.toggle('active');
  }
  function closeSidebar() {
    DOM.sidebar?.classList.remove('open');
    DOM.sidebarOverlay?.classList.remove('active');
  }

  // =========================================================================
  // CHAT EVENTS & LOGIC (Preserving existing Groq integration)
  // =========================================================================
  function bindChatEvents() {
    // Chat sidebar toggle
    if (DOM.chatSidebarToggle) DOM.chatSidebarToggle.addEventListener('click', () => {
      DOM.chatSidebar?.classList.toggle('open');
    });

    // New Chat
    if (DOM.newChatBtn) DOM.newChatBtn.addEventListener('click', createNewChat);

    // Clear all history
    if (DOM.clearAllHistoryBtn) DOM.clearAllHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear all chat history?')) {
        state.chats = [];
        state.currentChatId = null;
        saveState();
        renderChatHistory();
        showWelcome();
      }
    });

    // Chat search
    if (DOM.chatSearchInput) DOM.chatSearchInput.addEventListener('input', () => {
      renderChatHistory(DOM.chatSearchInput.value.trim().toLowerCase());
    });

    // Model selector
    if (DOM.modelSelectorBtn) DOM.modelSelectorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      DOM.modelDropdownMenu?.classList.toggle('show');
    });
    document.addEventListener('click', () => DOM.modelDropdownMenu?.classList.remove('show'));

    // Starter cards
    $$('.starter-card').forEach(card => {
      card.addEventListener('click', () => {
        const prompt = card.dataset.prompt;
        if (prompt && DOM.chatTextarea) {
          createNewChat();
          DOM.chatTextarea.value = prompt;
          sendMessage();
        }
      });
    });

    // Send
    if (DOM.sendBtn) DOM.sendBtn.addEventListener('click', sendMessage);
    if (DOM.chatTextarea) {
      DOM.chatTextarea.addEventListener('input', () => {
        autoResizeTextarea();
        DOM.sendBtn.disabled = !DOM.chatTextarea.value.trim() && !state.attachedFile;
      });
      DOM.chatTextarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (!DOM.sendBtn.disabled && !state.isStreaming) sendMessage();
        }
      });
    }

    // File attachment
    if (DOM.attachBtn) DOM.attachBtn.addEventListener('click', () => DOM.fileInput?.click());
    if (DOM.fileInput) DOM.fileInput.addEventListener('change', handleFileAttach);
    if (DOM.attachmentRemoveBtn) DOM.attachmentRemoveBtn.addEventListener('click', clearAttachment);

    // Voice
    if (DOM.voiceBtn) DOM.voiceBtn.addEventListener('click', toggleVoice);
  }

  function setupMarked() {
    if (window.marked) {
      marked.setOptions({
        gfm: true,
        breaks: true,
        highlight: function (code, lang) {
          if (window.hljs && lang && hljs.getLanguage(lang)) {
            try { return hljs.highlight(code, { language: lang }).value; } catch (e) {}
          }
          return code;
        }
      });
    }
  }

  // ---- Chat CRUD ----
  function createNewChat() {
    const chat = {
      id: 'chat-' + Date.now(),
      title: 'New Session',
      messages: [],
      createdAt: new Date().toISOString()
    };
    state.chats.unshift(chat);
    state.currentChatId = chat.id;
    saveState();
    renderChatHistory();
    showWelcome();
    if (DOM.chatTextarea) { DOM.chatTextarea.value = ''; DOM.chatTextarea.focus(); }
    if (DOM.currentChatTitle) DOM.currentChatTitle.textContent = 'New Session';
    addActivity('Created new chat session');
  }

  function loadChatHistory() {
    renderChatHistory();
    if (state.currentChatId) {
      const chat = state.chats.find(c => c.id === state.currentChatId);
      if (chat && chat.messages.length > 0) {
        showMessages();
        renderAllMessages(chat);
      } else {
        showWelcome();
      }
      if (DOM.currentChatTitle) DOM.currentChatTitle.textContent = chat?.title || 'New Session';
    }
  }

  function renderChatHistory(filter = '') {
    if (!DOM.historyList) return;
    const filtered = filter
      ? state.chats.filter(c => c.title.toLowerCase().includes(filter) || c.messages.some(m => m.content?.toLowerCase().includes(filter)))
      : state.chats;

    if (filtered.length === 0) {
      DOM.historyList.innerHTML = '<div class="empty-state-mini">No chats yet</div>';
      return;
    }

    DOM.historyList.innerHTML = filtered.map(chat => `
      <div class="history-item ${chat.id === state.currentChatId ? 'active' : ''}" data-id="${chat.id}">
        <div class="history-item-content">
          <span class="history-item-title">${escapeHtml(chat.title)}</span>
          <span class="history-item-date">${formatDate(chat.createdAt)}</span>
        </div>
        <button class="history-delete-btn" data-id="${chat.id}" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `).join('');

    // Click handlers
    DOM.historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.history-delete-btn')) return;
        switchChat(item.dataset.id);
      });
    });
    DOM.historyList.querySelectorAll('.history-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteChat(btn.dataset.id);
      });
    });

    // Update badge
    const badge = $('chatCountBadge');
    if (badge) {
      badge.textContent = state.chats.length;
      badge.style.display = state.chats.length > 0 ? '' : 'none';
    }
  }

  function switchChat(chatId) {
    state.currentChatId = chatId;
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return;

    if (chat.messages.length > 0) {
      showMessages();
      renderAllMessages(chat);
    } else {
      showWelcome();
    }
    if (DOM.currentChatTitle) DOM.currentChatTitle.textContent = chat.title;
    renderChatHistory();
    saveState();
  }

  function deleteChat(chatId) {
    state.chats = state.chats.filter(c => c.id !== chatId);
    if (state.currentChatId === chatId) {
      state.currentChatId = state.chats[0]?.id || null;
      if (state.currentChatId) switchChat(state.currentChatId);
      else showWelcome();
    }
    saveState();
    renderChatHistory();
  }

  function showWelcome() {
    if (DOM.welcomeContainer) DOM.welcomeContainer.style.display = '';
    if (DOM.messagesContainer) { DOM.messagesContainer.style.display = 'none'; DOM.messagesContainer.innerHTML = ''; }
  }

  function showMessages() {
    if (DOM.welcomeContainer) DOM.welcomeContainer.style.display = 'none';
    if (DOM.messagesContainer) DOM.messagesContainer.style.display = '';
  }

  function renderAllMessages(chat) {
    if (!DOM.messagesContainer) return;
    DOM.messagesContainer.innerHTML = '';
    chat.messages.forEach(msg => appendMessageBubble(msg.role, msg.content));
    scrollToBottom();
  }

  function appendMessageBubble(role, content) {
    if (!DOM.messagesContainer) return;
    const div = document.createElement('div');
    div.className = `message-bubble ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? (window.NexoraAuth?.getUserInitial() || 'U') : '✦';

    const body = document.createElement('div');
    body.className = 'message-body';

    const sender = document.createElement('div');
    sender.className = 'message-sender';
    sender.textContent = role === 'user' ? (window.NexoraAuth?.getUserDisplayName() || 'You') : 'NEXORA AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    if (role === 'assistant') {
      contentDiv.innerHTML = renderMarkdown(content);
      setTimeout(() => addCopyButtons(contentDiv), 50);
    } else {
      contentDiv.textContent = content;
    }

    body.appendChild(sender);
    body.appendChild(contentDiv);
    div.appendChild(avatar);
    div.appendChild(body);
    DOM.messagesContainer.appendChild(div);
  }

  function addCopyButtons(container) {
    container.querySelectorAll('pre code').forEach(block => {
      if (block.parentElement.querySelector('.code-copy-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(block.textContent).then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = 'Copy', 1500);
        });
      });
      block.parentElement.style.position = 'relative';
      block.parentElement.appendChild(btn);
    });
  }

  // ---- Send Message ----
  async function sendMessage() {
    if (state.isStreaming) return;

    let content = DOM.chatTextarea?.value.trim() || '';
    if (state.attachedFile) {
      content = `[Attached file: ${state.attachedFile.name}]\n\n${state.attachedFile.content}\n\n${content}`;
    }
    if (!content) return;

    // Ensure active chat
    if (!state.currentChatId || !state.chats.find(c => c.id === state.currentChatId)) {
      createNewChat();
    }

    const chat = state.chats.find(c => c.id === state.currentChatId);
    if (!chat) return;

    // Add user message
    chat.messages.push({ role: 'user', content });
    showMessages();
    appendMessageBubble('user', content);
    scrollToBottom();

    // Update title from first message
    if (chat.messages.length === 1) {
      chat.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
      if (DOM.currentChatTitle) DOM.currentChatTitle.textContent = chat.title;
      renderChatHistory();
    }

    // Clear input
    DOM.chatTextarea.value = '';
    autoResizeTextarea();
    DOM.sendBtn.disabled = true;
    clearAttachment();
    state.isStreaming = true;

    // Create assistant bubble for streaming
    const assistantDiv = document.createElement('div');
    assistantDiv.className = 'message-bubble assistant';
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '✦';
    const body = document.createElement('div');
    body.className = 'message-body';
    const sender = document.createElement('div');
    sender.className = 'message-sender';
    sender.textContent = 'NEXORA AI';
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = '<span class="typing-indicator"><span></span><span></span><span></span></span>';
    body.appendChild(sender);
    body.appendChild(contentDiv);
    assistantDiv.appendChild(avatar);
    assistantDiv.appendChild(body);
    DOM.messagesContainer.appendChild(assistantDiv);
    scrollToBottom();

    // Build messages payload
    const apiMessages = chat.messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model: state.selectedModel,
          temperature: state.temperature,
          system_prompt: state.systemPrompt,
          stream: true
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || err.message || 'Chat request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const payload = trimmed.slice(6);
          if (payload === '[DONE]') continue;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) {
              fullText += parsed.content;
              contentDiv.innerHTML = renderMarkdown(fullText);
              scrollToBottom();
            }
          } catch (e) {
            if (payload !== '[DONE]') console.warn('[Chat] Parse error:', e.message);
          }
        }
      }

      // Finalize
      chat.messages.push({ role: 'assistant', content: fullText });
      contentDiv.innerHTML = renderMarkdown(fullText);
      addCopyButtons(contentDiv);
      saveState();
      addActivity(`Chat: ${chat.title}`);
    } catch (err) {
      contentDiv.innerHTML = `<div class="error-text">⚠️ ${escapeHtml(err.message)}</div>`;
      console.error('[Chat] Error:', err);
    } finally {
      state.isStreaming = false;
      scrollToBottom();
    }
  }

  // ---- File Attachment ----
  function handleFileAttach(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) {
      showToast('File too large. Max 500KB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      state.attachedFile = { name: file.name, content: reader.result, size: file.size };
      if (DOM.attachmentPreview) DOM.attachmentPreview.style.display = '';
      if (DOM.attachmentName) DOM.attachmentName.textContent = file.name;
      if (DOM.attachmentSize) DOM.attachmentSize.textContent = `(${(file.size / 1024).toFixed(1)} KB)`;
      DOM.sendBtn.disabled = false;
    };
    reader.readAsText(file);
  }
  function clearAttachment() {
    state.attachedFile = null;
    if (DOM.attachmentPreview) DOM.attachmentPreview.style.display = 'none';
    if (DOM.fileInput) DOM.fileInput.value = '';
  }

  // ---- Voice ----
  function setupSpeechRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    state.recognition = new SR();
    state.recognition.continuous = false;
    state.recognition.interimResults = true;
    state.recognition.lang = 'en-US';
    state.recognition.onresult = (e) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      if (DOM.chatTextarea) DOM.chatTextarea.value = transcript;
      DOM.sendBtn.disabled = !transcript.trim();
    };
    state.recognition.onend = () => {
      state.isRecording = false;
      DOM.voiceBtn?.classList.remove('recording');
    };
  }

  function toggleVoice() {
    if (!state.recognition) return showToast('Voice input not supported in this browser.', 'error');
    if (state.isRecording) {
      state.recognition.stop();
    } else {
      state.recognition.start();
      state.isRecording = true;
      DOM.voiceBtn?.classList.add('recording');
    }
  }

  // =========================================================================
  // MODULE EVENTS
  // =========================================================================
  let pendingModalType = null;

  function bindModuleEvents() {
    // Projects
    const pBtn = (el) => el?.addEventListener('click', () => openCreateModal('project'));
    pBtn(DOM.createProjectBtn);
    pBtn(DOM.createProjectEmptyBtn);

    // Goals
    const gBtn = (el) => el?.addEventListener('click', () => openCreateModal('goal'));
    gBtn(DOM.createGoalBtn);
    gBtn(DOM.createGoalEmptyBtn);

    // Tasks
    if (DOM.createTaskBtn) DOM.createTaskBtn.addEventListener('click', () => openCreateModal('task'));

    // Knowledge
    if (DOM.knowledgeBrowseBtn) DOM.knowledgeBrowseBtn.addEventListener('click', () => DOM.knowledgeFileInput?.click());
    if (DOM.knowledgeFileInput) DOM.knowledgeFileInput.addEventListener('change', handleKnowledgeUpload);
    if (DOM.addKnowledgeNoteBtn) DOM.addKnowledgeNoteBtn.addEventListener('click', addKnowledgeNote);

    // Learning
    if (DOM.generateLearningPlanBtn) DOM.generateLearningPlanBtn.addEventListener('click', generateLearningPlan);

    // Challenge
    if (DOM.submitChallengeBtn) DOM.submitChallengeBtn.addEventListener('click', submitChallenge);

    // Research
    if (DOM.newResearchBtn) DOM.newResearchBtn.addEventListener('click', () => openCreateModal('research'));

    // Memory
    if (DOM.addMemoryBtn) DOM.addMemoryBtn.addEventListener('click', () => openCreateModal('memory'));

    // Agents
    $$('.agent-chat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.agent-card');
        const agentType = card?.dataset.agent;
        startAgentChat(agentType);
      });
    });

    // Modal
    if (DOM.closeCreateModal) DOM.closeCreateModal.addEventListener('click', closeModal);
    if (DOM.cancelCreateModal) DOM.cancelCreateModal.addEventListener('click', closeModal);
    if (DOM.confirmCreateModal) DOM.confirmCreateModal.addEventListener('click', confirmModal);
  }

  // ---- MODAL ----
  function openCreateModal(type) {
    pendingModalType = type;
    let title = '', body = '';

    if (type === 'project') {
      title = '📁 New Project';
      body = `
        <div class="auth-input-group"><label>Project Name</label><input type="text" id="modalInputName" placeholder="My Awesome Project" required></div>
        <div class="auth-input-group"><label>Description</label><textarea id="modalInputDesc" class="setting-textarea" rows="2" placeholder="What is this project about?"></textarea></div>
      `;
    } else if (type === 'goal') {
      title = '🎯 New Goal';
      body = `
        <div class="auth-input-group"><label>Goal Title</label><input type="text" id="modalInputName" placeholder="Launch my SaaS product" required></div>
        <div class="auth-input-group"><label>Description</label><textarea id="modalInputDesc" class="setting-textarea" rows="2" placeholder="Describe your goal..."></textarea></div>
        <div class="auth-input-group"><label>Deadline</label><input type="text" id="modalInputDeadline" placeholder="e.g. 3 months, December 2025" value="3 months"></div>
      `;
    } else if (type === 'task') {
      title = '✅ New Task';
      body = `
        <div class="auth-input-group"><label>Task Title</label><input type="text" id="modalInputName" placeholder="Design landing page" required></div>
        <div class="auth-input-group"><label>Priority</label>
          <select id="modalInputPriority" class="setting-select">
            <option value="High">🔴 High</option>
            <option value="Medium" selected>🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>
        </div>
        <div class="auth-input-group"><label>Due Date</label><input type="date" id="modalInputDue" class="setting-input"></div>
      `;
    } else if (type === 'research') {
      title = '🔬 New Research Topic';
      body = `
        <div class="auth-input-group"><label>Research Question</label><input type="text" id="modalInputName" placeholder="What are the latest advances in quantum computing?" required></div>
      `;
    } else if (type === 'memory') {
      title = '🧠 Add Memory';
      body = `
        <div class="auth-input-group"><label>Category</label>
          <select id="modalInputCategory" class="setting-select">
            <option value="preferences">Preferences</option>
            <option value="goals">Goals</option>
            <option value="projects">Projects</option>
            <option value="learning">Learning</option>
          </select>
        </div>
        <div class="auth-input-group"><label>Memory Content</label><textarea id="modalInputDesc" class="setting-textarea" rows="3" placeholder="What should NEXORA remember?"></textarea></div>
      `;
    }

    DOM.createModalTitle.textContent = title;
    DOM.createModalBody.innerHTML = body;
    DOM.createModal.style.display = '';
    setTimeout(() => DOM.createModal.querySelector('input')?.focus(), 100);
  }

  function closeModal() {
    if (DOM.createModal) DOM.createModal.style.display = 'none';
    pendingModalType = null;
  }

  function confirmModal() {
    const name = $('modalInputName')?.value.trim();
    const desc = $('modalInputDesc')?.value.trim();

    if (pendingModalType === 'project') {
      if (!name) return showToast('Project name is required.', 'error');
      const project = { id: 'proj-' + Date.now(), name, description: desc, progress: 0, tasks: [], notes: '', createdAt: new Date().toISOString() };
      state.projects.push(project);
      saveState();
      renderProjects();
      addActivity(`Created project: ${name}`);
      showToast('Project created!', 'success');
    } else if (pendingModalType === 'goal') {
      if (!name) return showToast('Goal title is required.', 'error');
      const deadline = $('modalInputDeadline')?.value.trim() || '3 months';
      const goal = { id: 'goal-' + Date.now(), title: name, description: desc, deadline, progress: 0, milestones: [], createdAt: new Date().toISOString() };
      state.goals.push(goal);
      saveState();
      renderGoals();
      addActivity(`Set goal: ${name}`);
      showToast('Goal created!', 'success');
    } else if (pendingModalType === 'task') {
      if (!name) return showToast('Task title is required.', 'error');
      const priority = $('modalInputPriority')?.value || 'Medium';
      const due = $('modalInputDue')?.value || '';
      const task = { id: 'task-' + Date.now(), title: name, priority, dueDate: due, status: 'todo', createdAt: new Date().toISOString() };
      state.tasks.push(task);
      saveState();
      renderTasks();
      addActivity(`Added task: ${name}`);
      showToast('Task created!', 'success');
    } else if (pendingModalType === 'research') {
      if (!name) return showToast('Research question is required.', 'error');
      const topic = { id: 'res-' + Date.now(), question: name, findings: '', sources: [], createdAt: new Date().toISOString() };
      state.researchTopics.push(topic);
      saveState();
      renderResearch();
      addActivity(`Started research: ${name}`);
      showToast('Research topic added!', 'success');
    } else if (pendingModalType === 'memory') {
      if (!desc) return showToast('Memory content is required.', 'error');
      const cat = $('modalInputCategory')?.value || 'preferences';
      const mem = { id: 'mem-' + Date.now(), content: desc, active: true, createdAt: new Date().toISOString() };
      state.memories[cat].push(mem);
      saveState();
      renderMemory();
      showToast('Memory saved!', 'success');
    }

    closeModal();
  }

  // ---- PROJECTS ----
  function renderProjects() {
    if (!DOM.projectsGrid) return;
    const empty = $('projectsEmptyState');

    if (state.projects.length === 0) {
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';

    // Remove empty state then render cards
    const cards = state.projects.map(p => `
      <div class="module-card project-card" data-id="${p.id}">
        <div class="module-card-header">
          <h3>${escapeHtml(p.name)}</h3>
          <button class="icon-btn-sm delete-project-btn" data-id="${p.id}" title="Delete">✕</button>
        </div>
        <p class="module-card-desc">${escapeHtml(p.description || 'No description')}</p>
        <div class="progress-bar"><div class="progress-fill" style="width:${p.progress}%"></div></div>
        <span class="module-card-meta">${formatDate(p.createdAt)}</span>
      </div>
    `).join('');

    DOM.projectsGrid.innerHTML = cards;
    DOM.projectsGrid.querySelectorAll('.delete-project-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.projects = state.projects.filter(p => p.id !== btn.dataset.id);
        saveState();
        renderProjects();
      });
    });
  }

  // ---- GOALS ----
  function renderGoals() {
    if (!DOM.goalsGrid) return;
    const empty = $('goalsEmptyState');

    if (state.goals.length === 0) {
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';

    const cards = state.goals.map(g => `
      <div class="module-card goal-card" data-id="${g.id}">
        <div class="module-card-header">
          <h3>${escapeHtml(g.title)}</h3>
          <button class="icon-btn-sm delete-goal-btn" data-id="${g.id}" title="Delete">✕</button>
        </div>
        <p class="module-card-desc">${escapeHtml(g.description || '')}</p>
        <div class="module-card-meta">Deadline: ${escapeHtml(g.deadline)}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${g.progress}%"></div></div>
        ${g.milestones.length > 0 ? `<div class="milestone-list">${g.milestones.map(m => `<div class="milestone-item">✓ ${escapeHtml(m.title)}</div>`).join('')}</div>` : ''}
        <button class="secondary-btn ai-breakdown-btn" data-id="${g.id}">🤖 AI Break Down Goal</button>
      </div>
    `).join('');

    DOM.goalsGrid.innerHTML = cards;

    DOM.goalsGrid.querySelectorAll('.delete-goal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.goals = state.goals.filter(g => g.id !== btn.dataset.id);
        saveState();
        renderGoals();
      });
    });

    DOM.goalsGrid.querySelectorAll('.ai-breakdown-btn').forEach(btn => {
      btn.addEventListener('click', () => breakdownGoal(btn.dataset.id));
    });
  }

  async function breakdownGoal(goalId) {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    showLoading(true);
    try {
      const res = await fetch('/api/ai/breakdown-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: goal.title, description: goal.description, deadline: goal.deadline })
      });
      const data = await res.json();
      if (data.success && data.plan) {
        goal.milestones = data.plan.milestones || [];
        if (data.plan.tasks) {
          data.plan.tasks.forEach(t => {
            state.tasks.push({
              id: 'task-' + Date.now() + Math.random().toString(36).slice(2, 6),
              title: t.title,
              priority: t.priority || 'Medium',
              status: 'todo',
              dueDate: '',
              createdAt: new Date().toISOString()
            });
          });
        }
        saveState();
        renderGoals();
        renderTasks();
        showToast('Goal broken down into milestones and tasks!', 'success');
        addActivity(`AI broke down goal: ${goal.title}`);
      } else {
        showToast(data.error || 'Failed to break down goal.', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
    showLoading(false);
  }

  // ---- TASKS ----
  function renderTasks() {
    const todo = state.tasks.filter(t => t.status === 'todo');
    const prog = state.tasks.filter(t => t.status === 'progress');
    const done = state.tasks.filter(t => t.status === 'done');

    renderTaskList(DOM.todoList, todo, 'todo');
    renderTaskList(DOM.progressList, prog, 'progress');
    renderTaskList(DOM.doneList, done, 'done');

    if (DOM.todoCount) DOM.todoCount.textContent = todo.length;
    if (DOM.progressCount) DOM.progressCount.textContent = prog.length;
    if (DOM.doneCount) DOM.doneCount.textContent = done.length;
  }

  function renderTaskList(container, tasks, status) {
    if (!container) return;
    if (tasks.length === 0) {
      container.innerHTML = '<div class="empty-state-mini">No tasks</div>';
      return;
    }
    container.innerHTML = tasks.map(t => {
      const priorityClass = t.priority === 'High' ? 'priority-high' : t.priority === 'Low' ? 'priority-low' : 'priority-medium';
      return `
        <div class="task-card" data-id="${t.id}">
          <div class="task-card-top">
            <span class="priority-badge ${priorityClass}">${t.priority}</span>
            <button class="icon-btn-sm delete-task-btn" data-id="${t.id}" title="Delete">✕</button>
          </div>
          <div class="task-title">${escapeHtml(t.title)}</div>
          ${t.dueDate ? `<div class="task-due">Due: ${t.dueDate}</div>` : ''}
          <div class="task-status-actions">
            ${status !== 'todo' ? `<button class="task-move-btn" data-id="${t.id}" data-to="todo">← To Do</button>` : ''}
            ${status !== 'progress' ? `<button class="task-move-btn" data-id="${t.id}" data-to="progress">In Progress</button>` : ''}
            ${status !== 'done' ? `<button class="task-move-btn" data-id="${t.id}" data-to="done">Done ✓</button>` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.task-move-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const task = state.tasks.find(t => t.id === btn.dataset.id);
        if (task) {
          task.status = btn.dataset.to;
          saveState();
          renderTasks();
        }
      });
    });

    container.querySelectorAll('.delete-task-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.tasks = state.tasks.filter(t => t.id !== btn.dataset.id);
        saveState();
        renderTasks();
      });
    });
  }

  // ---- KNOWLEDGE ----
  function handleKnowledgeUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const doc = {
        id: 'doc-' + Date.now(),
        title: file.name,
        content: reader.result,
        size: file.size,
        type: file.name.split('.').pop(),
        createdAt: new Date().toISOString()
      };
      state.knowledgeDocs.push(doc);
      saveState();
      renderKnowledge();
      addActivity(`Uploaded document: ${file.name}`);
      showToast('Document added to Knowledge Hub!', 'success');
    };
    reader.readAsText(file);
  }

  function addKnowledgeNote() {
    const text = DOM.knowledgeNoteInput?.value.trim();
    if (!text) return showToast('Enter some text content.', 'error');
    const title = DOM.knowledgeNoteTitle?.value.trim() || 'Note ' + (state.knowledgeDocs.length + 1);
    const doc = {
      id: 'doc-' + Date.now(),
      title,
      content: text,
      size: text.length,
      type: 'note',
      createdAt: new Date().toISOString()
    };
    state.knowledgeDocs.push(doc);
    saveState();
    renderKnowledge();
    if (DOM.knowledgeNoteInput) DOM.knowledgeNoteInput.value = '';
    if (DOM.knowledgeNoteTitle) DOM.knowledgeNoteTitle.value = '';
    showToast('Note added!', 'success');
  }

  function renderKnowledge() {
    if (!DOM.knowledgeCards) return;
    const empty = $('knowledgeEmptyState');
    if (state.knowledgeDocs.length === 0) {
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';

    DOM.knowledgeCards.innerHTML = state.knowledgeDocs.map(doc => `
      <div class="module-card knowledge-card" data-id="${doc.id}">
        <div class="module-card-header">
          <h3>${escapeHtml(doc.title)}</h3>
          <button class="icon-btn-sm delete-knowledge-btn" data-id="${doc.id}" title="Delete">✕</button>
        </div>
        <div class="module-card-meta">${doc.type.toUpperCase()} · ${(doc.size / 1024).toFixed(1)} KB</div>
        <div class="knowledge-actions">
          <button class="secondary-btn sm" data-id="${doc.id}" data-action="summarize">📝 Summarize</button>
          <button class="secondary-btn sm" data-id="${doc.id}" data-action="explain">💡 Explain</button>
          <button class="secondary-btn sm" data-id="${doc.id}" data-action="quiz">📋 Quiz</button>
          <button class="secondary-btn sm" data-id="${doc.id}" data-action="notes">📖 Notes</button>
        </div>
        <div class="knowledge-result" id="knowledge-result-${doc.id}" style="display:none;"></div>
      </div>
    `).join('');

    DOM.knowledgeCards.querySelectorAll('.delete-knowledge-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.knowledgeDocs = state.knowledgeDocs.filter(d => d.id !== btn.dataset.id);
        saveState();
        renderKnowledge();
      });
    });

    DOM.knowledgeCards.querySelectorAll('.knowledge-actions button').forEach(btn => {
      btn.addEventListener('click', () => runDocAction(btn.dataset.id, btn.dataset.action));
    });
  }

  async function runDocAction(docId, action) {
    const doc = state.knowledgeDocs.find(d => d.id === docId);
    if (!doc) return;
    const resultDiv = $('knowledge-result-' + docId);
    if (!resultDiv) return;

    resultDiv.style.display = '';
    resultDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';

    try {
      const res = await fetch('/api/ai/doc-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text: doc.content, title: doc.title })
      });
      const data = await res.json();
      if (data.success) {
        resultDiv.innerHTML = `<div class="ai-result-content">${renderMarkdown(data.result)}</div>`;
        addCopyButtons(resultDiv);
      } else {
        resultDiv.innerHTML = `<div class="error-text">${escapeHtml(data.error)}</div>`;
      }
    } catch (err) {
      resultDiv.innerHTML = `<div class="error-text">Error: ${escapeHtml(err.message)}</div>`;
    }
  }

  // ---- LEARNING ----
  async function generateLearningPlan() {
    const topic = DOM.learnTopicInput?.value.trim();
    const level = DOM.learnLevelSelect?.value || 'Intermediate';
    if (!topic) return showToast('Enter a topic to learn.', 'error');

    showLoading(true);
    try {
      const res = await fetch('/api/ai/generate-learning-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, level })
      });
      const data = await res.json();
      if (data.success && data.plan) {
        const plan = { id: 'learn-' + Date.now(), ...data.plan, createdAt: new Date().toISOString() };
        state.learningPlans.unshift(plan);
        saveState();
        renderLearningPlans();
        addActivity(`Generated learning plan: ${topic}`);
        showToast('Learning plan generated!', 'success');
      } else {
        showToast(data.error || 'Failed to generate plan.', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
    showLoading(false);
  }

  function renderLearningPlans() {
    if (!DOM.learnPlansContainer) return;
    const empty = $('learnEmptyState');
    if (state.learningPlans.length === 0) {
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';

    DOM.learnPlansContainer.innerHTML = state.learningPlans.map(plan => `
      <div class="module-card learn-card">
        <div class="module-card-header">
          <h3>📚 ${escapeHtml(plan.topic || 'Learning Plan')}</h3>
          <span class="badge">${escapeHtml(plan.level || '')}</span>
        </div>
        <p class="module-card-desc">${escapeHtml(plan.overview || '')}</p>
        <div class="learn-modules">
          ${(plan.modules || []).map(m => `
            <div class="learn-module-item">
              <div class="learn-module-phase">Phase ${m.phase}: ${escapeHtml(m.title)}</div>
              <div class="learn-module-duration">${escapeHtml(m.duration)}</div>
              <div class="learn-module-concepts">${(m.key_concepts || []).map(c => `<span class="concept-chip">${escapeHtml(c)}</span>`).join('')}</div>
              <div class="learn-module-exercise">🏋️ ${escapeHtml(m.exercise || '')}</div>
            </div>
          `).join('')}
        </div>
        ${plan.sample_quiz?.length ? `
          <div class="learn-quiz-section">
            <h4>📝 Sample Quiz</h4>
            ${plan.sample_quiz.map((q, i) => `
              <div class="quiz-question">
                <strong>Q${i + 1}: ${escapeHtml(q.question)}</strong>
                <div class="quiz-options">${(q.options || []).map(o => `<div class="quiz-option">${escapeHtml(o)}</div>`).join('')}</div>
                <details class="quiz-answer"><summary>Show Answer</summary><p>✅ ${escapeHtml(q.answer)} — ${escapeHtml(q.explanation || '')}</p></details>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  // ---- CHALLENGE ----
  async function submitChallenge() {
    const idea = DOM.challengeIdeaInput?.value.trim();
    const category = DOM.challengeCategory?.value || 'General Idea';
    if (!idea) return showToast('Describe your idea first.', 'error');

    showLoading(true);
    if (DOM.challengeResult) DOM.challengeResult.style.display = 'none';

    try {
      const res = await fetch('/api/ai/challenge-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, category })
      });
      const data = await res.json();
      if (data.success) {
        if (DOM.challengeResult) DOM.challengeResult.style.display = '';
        if (DOM.challengeOutput) {
          DOM.challengeOutput.innerHTML = renderMarkdown(data.critique);
          addCopyButtons(DOM.challengeOutput);
        }
        addActivity(`Challenged idea: ${idea.substring(0, 40)}...`);
      } else {
        showToast(data.error || 'Failed to critique idea.', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
    showLoading(false);
  }

  // ---- RESEARCH ----
  function renderResearch() {
    if (!$('researchContainer')) return;
    const empty = $('researchEmptyState');
    if (state.researchTopics.length === 0) {
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';

    $('researchContainer').innerHTML = state.researchTopics.map(r => `
      <div class="module-card research-card" data-id="${r.id}">
        <div class="module-card-header">
          <h3>${escapeHtml(r.question)}</h3>
          <button class="icon-btn-sm delete-research-btn" data-id="${r.id}">✕</button>
        </div>
        <div class="module-card-meta">${formatDate(r.createdAt)}</div>
      </div>
    `).join('');

    $$('.delete-research-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.researchTopics = state.researchTopics.filter(r => r.id !== btn.dataset.id);
        saveState();
        renderResearch();
      });
    });
  }

  // ---- MEMORY ----
  function renderMemory() {
    ['preferences', 'goals', 'projects', 'learning'].forEach(cat => {
      const container = $('memory' + cat.charAt(0).toUpperCase() + cat.slice(1));
      if (!container) return;
      const items = state.memories[cat] || [];
      if (items.length === 0) {
        container.innerHTML = '<div class="empty-state-mini">No items stored.</div>';
        return;
      }
      container.innerHTML = items.map(m => `
        <div class="memory-item ${m.active ? '' : 'disabled'}">
          <div class="memory-item-content">${escapeHtml(m.content)}</div>
          <div class="memory-item-actions">
            <button class="text-btn toggle-memory-btn" data-cat="${cat}" data-id="${m.id}">${m.active ? 'Disable' : 'Enable'}</button>
            <button class="text-btn-danger delete-memory-btn" data-cat="${cat}" data-id="${m.id}">Delete</button>
          </div>
        </div>
      `).join('');

      container.querySelectorAll('.toggle-memory-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const mem = state.memories[btn.dataset.cat].find(m => m.id === btn.dataset.id);
          if (mem) mem.active = !mem.active;
          saveState();
          renderMemory();
        });
      });
      container.querySelectorAll('.delete-memory-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.memories[btn.dataset.cat] = state.memories[btn.dataset.cat].filter(m => m.id !== btn.dataset.id);
          saveState();
          renderMemory();
        });
      });
    });
  }

  // ---- AGENTS ----
  function startAgentChat(agentType) {
    const personas = {
      planner: 'You are NEXORA Strategic Planner. You break down complex goals into structured, actionable execution plans with clear timelines and dependencies.',
      researcher: 'You are NEXORA Research Analyst. You conduct deep, structured research with cited findings and multiple perspectives.',
      coder: 'You are NEXORA Coding Mentor. You provide expert code review, debugging guidance, architecture advice, and best practices with clean code examples.',
      teacher: 'You are NEXORA Teacher. You explain concepts clearly with analogies, real-world examples, and step-by-step breakdowns suitable for the learner level.',
      writer: 'You are NEXORA Content Writer. You craft professional, polished emails, reports, articles, and documentation with exceptional clarity.',
      critic: "You are NEXORA Devil's Advocate. You challenge ideas rigorously, find blind spots, stress-test assumptions, and provide contrarian perspectives."
    };

    navigateTo('chat');
    setTimeout(() => {
      createNewChat();
      state.systemPrompt = personas[agentType] || '';
      if (DOM.systemPromptInput) DOM.systemPromptInput.value = state.systemPrompt;
      const chat = state.chats.find(c => c.id === state.currentChatId);
      if (chat) {
        const agentNames = { planner: 'Strategic Planner', researcher: 'Research Analyst', coder: 'Coding Mentor', teacher: 'Teacher', writer: 'Content Writer', critic: "Devil's Advocate" };
        chat.title = `🤖 ${agentNames[agentType] || 'Agent'} Session`;
        if (DOM.currentChatTitle) DOM.currentChatTitle.textContent = chat.title;
        renderChatHistory();
      }
      showToast(`${agentType.charAt(0).toUpperCase() + agentType.slice(1)} agent activated!`, 'success');
    }, 150);
  }

  // =========================================================================
  // API CALLS
  // =========================================================================
  async function fetchStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      state.isKeyConfigured = data.configured;

      const indicator = DOM.headerStatusIndicator;
      if (indicator) {
        indicator.classList.toggle('connected', data.configured);
        indicator.classList.toggle('disconnected', !data.configured);
        const badge = indicator.querySelector('.status-badge-text');
        if (badge) badge.textContent = data.configured ? 'Online' : 'Offline';
      }

      if (DOM.apiKeyStatusBadge) {
        DOM.apiKeyStatusBadge.textContent = data.configured ? '✓ Active' : '✗ Not Set';
        DOM.apiKeyStatusBadge.className = 'badge ' + (data.configured ? 'badge-success' : 'badge-error');
      }
    } catch (err) {
      console.error('[Status] Error:', err);
    }
  }

  async function fetchModels() {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      state.models = data.models || [];
      if (data.default) state.selectedModel = data.default;
      renderModelSelector();
    } catch (err) {
      console.error('[Models] Error:', err);
    }
  }

  function renderModelSelector() {
    if (!DOM.modelDropdownMenu) return;
    DOM.modelDropdownMenu.innerHTML = state.models.map(m => `
      <div class="model-option ${m.id === state.selectedModel ? 'active' : ''}" data-model="${m.id}">
        <div class="model-option-header">
          <span class="model-option-name">${escapeHtml(m.name)}</span>
          <span class="model-option-badge">${escapeHtml(m.badge)}</span>
        </div>
        <div class="model-option-desc">${escapeHtml(m.description)}</div>
      </div>
    `).join('');

    DOM.modelDropdownMenu.querySelectorAll('.model-option').forEach(opt => {
      opt.addEventListener('click', () => {
        state.selectedModel = opt.dataset.model;
        const model = state.models.find(m => m.id === state.selectedModel);
        if (DOM.selectedModelLabel) DOM.selectedModelLabel.textContent = model?.name || state.selectedModel;
        DOM.modelDropdownMenu.classList.remove('show');
        $$('.model-option').forEach(o => o.classList.toggle('active', o.dataset.model === state.selectedModel));
        savePreferences();
      });
    });

    const active = state.models.find(m => m.id === state.selectedModel);
    if (DOM.selectedModelLabel && active) DOM.selectedModelLabel.textContent = active.name;
  }

  async function saveApiKey() {
    const key = DOM.groqApiKeyInput?.value.trim();
    if (!key) return showToast('Enter an API key.', 'error');

    if (DOM.saveApiKeyBtn) DOM.saveApiKeyBtn.textContent = 'Validating...';
    try {
      const res = await fetch('/api/settings/save-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key })
      });
      const data = await res.json();
      if (data.success) {
        showToast('API Key saved successfully!', 'success');
        if (DOM.groqApiKeyInput) DOM.groqApiKeyInput.value = '';
        fetchStatus();
      } else {
        showToast(data.error || 'Failed to save key.', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
    if (DOM.saveApiKeyBtn) DOM.saveApiKeyBtn.textContent = 'Save to .env';
  }

  function saveSettings() {
    state.systemPrompt = DOM.systemPromptInput?.value.trim() || '';
    state.temperature = parseFloat(DOM.tempSlider?.value || 0.7);
    savePreferences();
    showToast('Settings saved!', 'success');
  }

  function resetDefaults() {
    state.temperature = 0.7;
    state.systemPrompt = '';
    if (DOM.tempSlider) DOM.tempSlider.value = 0.7;
    if (DOM.tempValueDisplay) DOM.tempValueDisplay.textContent = '0.70';
    if (DOM.systemPromptInput) DOM.systemPromptInput.value = '';
    savePreferences();
    showToast('Defaults restored.', 'success');
  }

  // =========================================================================
  // THEME & ACCENT
  // =========================================================================
  const ACCENT_VARS = {
    cyan: { primary: '#00f0ff', glow: 'rgba(0,240,255,0.3)', hover: '#33f3ff' },
    sky: { primary: '#38bdf8', glow: 'rgba(56,189,248,0.3)', hover: '#5ecbfa' },
    indigo: { primary: '#6366f1', glow: 'rgba(99,102,241,0.3)', hover: '#818cf8' },
    emerald: { primary: '#10b981', glow: 'rgba(16,185,129,0.3)', hover: '#34d399' },
    violet: { primary: '#8b5cf6', glow: 'rgba(139,92,246,0.3)', hover: '#a78bfa' }
  };

  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    $$('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
    savePreferences();
  }

  function setAccentColor(accent) {
    state.accentColor = accent;
    const vars = ACCENT_VARS[accent] || ACCENT_VARS.cyan;
    document.documentElement.style.setProperty('--accent-primary', vars.primary);
    document.documentElement.style.setProperty('--accent-glow', vars.glow);
    document.documentElement.style.setProperty('--accent-hover', vars.hover);
    $$('.accent-btn').forEach(b => b.classList.toggle('active', b.dataset.accent === accent));
    savePreferences();
  }

  // =========================================================================
  // DASHBOARD
  // =========================================================================
  function updateDashboard() {
    // Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const userName = window.NexoraAuth?.getUserDisplayName() || 'User';
    if (DOM.dashboardGreeting) DOM.dashboardGreeting.textContent = `${greeting}, ${userName} 👋`;

    // Stats
    if (DOM.statProjects) DOM.statProjects.textContent = state.projects.length;
    if (DOM.statGoals) DOM.statGoals.textContent = state.goals.length;
    if (DOM.statTasks) DOM.statTasks.textContent = state.tasks.filter(t => t.status !== 'done').length;
    if (DOM.statChats) DOM.statChats.textContent = state.chats.length;

    // Activity
    renderActivity();
  }

  function addActivity(text) {
    state.activityLog.unshift({ text, time: new Date().toISOString() });
    if (state.activityLog.length > 20) state.activityLog = state.activityLog.slice(0, 20);
    saveState();
  }

  function renderActivity() {
    if (!DOM.activityList) return;
    if (state.activityLog.length === 0) {
      DOM.activityList.innerHTML = '<div class="empty-state-mini">No activity yet. Start a chat, create a project, or set a goal!</div>';
      return;
    }
    DOM.activityList.innerHTML = state.activityLog.slice(0, 8).map(a => `
      <div class="activity-item">
        <span class="activity-text">${escapeHtml(a.text)}</span>
        <span class="activity-time">${formatRelativeTime(a.time)}</span>
      </div>
    `).join('');
  }

  // =========================================================================
  // PERSISTENCE
  // =========================================================================
  function saveState() {
    try {
      localStorage.setItem('nexora_state', JSON.stringify({
        chats: state.chats,
        currentChatId: state.currentChatId,
        projects: state.projects,
        goals: state.goals,
        tasks: state.tasks,
        knowledgeDocs: state.knowledgeDocs,
        learningPlans: state.learningPlans,
        researchTopics: state.researchTopics,
        memories: state.memories,
        activityLog: state.activityLog
      }));
    } catch (e) {
      console.warn('[State] Save error:', e);
    }
  }

  function loadState() {
    try {
      const stored = localStorage.getItem('nexora_state');
      if (stored) {
        const data = JSON.parse(stored);
        state.chats = data.chats || [];
        state.currentChatId = data.currentChatId || null;
        state.projects = data.projects || [];
        state.goals = data.goals || [];
        state.tasks = data.tasks || [];
        state.knowledgeDocs = data.knowledgeDocs || [];
        state.learningPlans = data.learningPlans || [];
        state.researchTopics = data.researchTopics || [];
        state.memories = data.memories || { preferences: [], goals: [], projects: [], learning: [] };
        state.activityLog = data.activityLog || [];
      }
    } catch (e) {
      console.warn('[State] Load error:', e);
    }
  }

  function savePreferences() {
    localStorage.setItem('nexora_prefs', JSON.stringify({
      selectedModel: state.selectedModel,
      temperature: state.temperature,
      systemPrompt: state.systemPrompt,
      theme: state.theme,
      accentColor: state.accentColor
    }));
  }

  function loadPreferences() {
    try {
      const stored = localStorage.getItem('nexora_prefs');
      if (stored) {
        const prefs = JSON.parse(stored);
        state.selectedModel = prefs.selectedModel || state.selectedModel;
        state.temperature = prefs.temperature ?? 0.7;
        state.systemPrompt = prefs.systemPrompt || '';
        state.theme = prefs.theme || 'dark';
        state.accentColor = prefs.accentColor || 'cyan';
      }
    } catch (e) {}

    // Apply
    setTheme(state.theme);
    setAccentColor(state.accentColor);
    if (DOM.tempSlider) DOM.tempSlider.value = state.temperature;
    if (DOM.tempValueDisplay) DOM.tempValueDisplay.textContent = state.temperature.toFixed(2);
    if (DOM.systemPromptInput) DOM.systemPromptInput.value = state.systemPrompt;
  }

  // =========================================================================
  // UTILITIES
  // =========================================================================
  function renderMarkdown(text) {
    if (!text) return '';
    if (window.marked) {
      try { return marked.parse(text); } catch (e) { return escapeHtml(text); }
    }
    return escapeHtml(text);
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function autoResizeTextarea() {
    if (!DOM.chatTextarea) return;
    DOM.chatTextarea.style.height = 'auto';
    DOM.chatTextarea.style.height = Math.min(DOM.chatTextarea.scrollHeight, 200) + 'px';
  }

  function scrollToBottom() {
    if (DOM.chatViewport) {
      DOM.chatViewport.scrollTop = DOM.chatViewport.scrollHeight;
    }
  }

  function showToast(msg, type = 'info') {
    if (!DOM.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    DOM.toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function showLoading(show) {
    if (DOM.loadingOverlay) DOM.loadingOverlay.style.display = show ? '' : 'none';
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatRelativeTime(iso) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  // =========================================================================
  // BOOT
  // =========================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
