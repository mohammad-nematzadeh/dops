/**
 * DOPS — Universal UI Controller
 * Manages Drawers, Modals, Tabs, Toast Feedback, and Interactive Elements.
 */
(function() {
  'use strict';

  // 1. Toast Notification System
  window.dopsToast = function(message, type) {
    var container = document.getElementById('dops-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'dops-toast-container';
      document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'dops-toast';

    var iconName = 'info';
    if (type === 'success') iconName = 'check_circle';
    if (type === 'error') iconName = 'error';

    toast.innerHTML = '<span class="material-symbols-outlined text-[20px] text-primary-container" style="color:var(--color-primary);">' +
                      iconName + '</span>' +
                      '<span>' + message + '</span>';

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(function() {
      toast.classList.add('show');
    });

    // Auto dismiss after 3.5 seconds
    setTimeout(function() {
      toast.classList.remove('show');
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3500);
  };

  // 2. Mobile Public Navigation Drawer & Dashboard Sidebar Drawer
  function initDrawers() {
    var mobileMenuBtn = document.querySelectorAll('[data-mobile-menu-btn], .mobile-nav-toggle');
    var mobileMenuDrawer = document.getElementById('mobile-nav-drawer');
    var mobileMenuBackdrop = document.getElementById('mobile-nav-backdrop');

    function openMobileMenu() {
      if (mobileMenuDrawer) mobileMenuDrawer.classList.add('open');
      if (mobileMenuBackdrop) mobileMenuBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      if (mobileMenuDrawer) mobileMenuDrawer.classList.remove('open');
      if (mobileMenuBackdrop) mobileMenuBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    mobileMenuBtn.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        openMobileMenu();
      });
    });

    if (mobileMenuBackdrop) {
      mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
    }

    var closeBtns = document.querySelectorAll('[data-close-drawer]');
    closeBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        closeMobileMenu();
        closeSidebar();
      });
    });

    if (mobileMenuDrawer) {
      mobileMenuDrawer.querySelectorAll('[data-modal-open]').forEach(function(trigger) {
        trigger.addEventListener('click', closeMobileMenu);
      });
    }

    // Dashboard Mobile Drawer Toggle
    var sidebarToggleBtn = document.querySelectorAll('[data-sidebar-toggle]');
    var dashboardSidebar = document.querySelector('.dashboard-sidebar');
    var sidebarBackdrop = document.getElementById('sidebar-backdrop');

    function openSidebar() {
      if (dashboardSidebar) dashboardSidebar.classList.add('open');
      if (sidebarBackdrop) sidebarBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      if (dashboardSidebar) dashboardSidebar.classList.remove('open');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    sidebarToggleBtn.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        if (dashboardSidebar && dashboardSidebar.classList.contains('open')) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });
    });

    if (sidebarBackdrop) {
      sidebarBackdrop.addEventListener('click', closeSidebar);
    }

    if (dashboardSidebar) {
      dashboardSidebar.querySelectorAll('.sidebar-link').forEach(function(link) {
        link.addEventListener('click', function() {
          if (window.innerWidth < 1024) {
            closeSidebar();
          }
        });
      });
    }
  }

  // 3. Tab Switching
  function initTabs() {
    var tabContainers = document.querySelectorAll('[data-tabs-container]');
    tabContainers.forEach(function(container) {
      var tabs = container.querySelectorAll('[data-tab-target]');
      tabs.forEach(function(tab) {
        tab.addEventListener('click', function(e) {
          e.preventDefault();
          var targetId = tab.getAttribute('data-tab-target');
          
          // Deactivate brothers
          tabs.forEach(function(t) {
            t.classList.remove('active', 'bg-surface-container-high', 'text-primary-container');
            t.classList.add('text-outline');
          });

          // Activate this
          tab.classList.add('active', 'bg-surface-container-high', 'text-primary-container');
          tab.classList.remove('text-outline');

          // Switch panels
          var parentSection = container.closest('section') || container.parentElement;
          var panels = parentSection.querySelectorAll('[data-tab-panel]');
          panels.forEach(function(p) {
            if (p.getAttribute('data-tab-panel') === targetId) {
              p.style.display = '';
            } else {
              p.style.display = 'none';
            }
          });
        });
      });
    });
  }

  // 4. Modals (Auth & Share)
  function initModals() {
    // Open modal triggers: [data-modal-open="auth-modal"]
    document.addEventListener('click', function(e) {
      var openTrigger = e.target.closest('[data-modal-open]');
      if (openTrigger) {
        e.preventDefault();
        var targetId = openTrigger.getAttribute('data-modal-open');
        var modal = document.getElementById(targetId);
        if (modal) {
          modal.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      }

      // Close modal triggers: [data-modal-close]
      var closeTrigger = e.target.closest('[data-modal-close]');
      if (closeTrigger) {
        e.preventDefault();
        var parentModal = closeTrigger.closest('.dops-modal-backdrop');
        if (parentModal) {
          parentModal.classList.remove('open');
          document.body.style.overflow = '';
        }
      }

      // Backdrop click outside content
      if (e.target.classList.contains('dops-modal-backdrop')) {
        e.target.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        var openModals = document.querySelectorAll('.dops-modal-backdrop.open');
        openModals.forEach(function(m) {
          m.classList.remove('open');
        });
        document.body.style.overflow = '';
      }
    });
  }

  // 5. Follow & Bookmark Toggle Buttons
  function initInteractiveButtons() {
    document.addEventListener('click', function(e) {
      // Follow button toggle
      var followBtn = e.target.closest('.btn-follow, [data-follow-btn]');
      if (followBtn) {
        e.preventDefault();
        var label = followBtn.querySelector('span:not(.material-symbols-outlined)') || followBtn;
        var icon = followBtn.querySelector('.material-symbols-outlined');
        if (followBtn.classList.contains('followed')) {
          followBtn.classList.remove('followed');
          followBtn.classList.remove('bg-primary-container', 'text-on-primary-container');
          label.textContent = 'دنبال کردن پادکست';
          if (icon) icon.textContent = 'notifications_active';
          window.dopsToast('پادکست از فهرست دنبال‌شده‌ها برداشته شد');
        } else {
          followBtn.classList.add('followed');
          followBtn.classList.add('bg-primary-container', 'text-on-primary-container');
          label.textContent = 'دنبال شده ✓';
          if (icon) icon.textContent = 'check';
          window.dopsToast('پادکست با موفقیت دنبال شد!', 'success');
        }
      }

      // Bookmark button toggle
      var bookmarkBtn = e.target.closest('.btn-bookmark, [data-bookmark-btn]');
      if (bookmarkBtn) {
        e.preventDefault();
        var bIcon = bookmarkBtn.querySelector('.material-symbols-outlined') || bookmarkBtn;
        if (bIcon.classList.contains('fill-current') || bookmarkBtn.classList.contains('active')) {
          bookmarkBtn.classList.remove('active');
          bIcon.classList.remove('fill-current');
          bIcon.style.color = '';
          window.dopsToast('قسمت از نشان‌شده‌ها حذف شد');
        } else {
          bookmarkBtn.classList.add('active');
          bIcon.classList.add('fill-current');
          bIcon.style.color = 'var(--color-primary)';
          window.dopsToast('قسمت ذخیره شد ✓', 'success');
        }
      }

      // Share button copy link
      var shareBtn = e.target.closest('[data-share-copy]');
      if (shareBtn) {
        e.preventDefault();
        navigator.clipboard.writeText(window.location.href).then(function() {
          window.dopsToast('پیوند صفحه با موفقیت کپی شد!', 'success');
        }).catch(function() {
          window.dopsToast('پیوند صفحه کپی شد');
        });
      }
    });
  }

  // 6. Global Search Keyboard Shortcut (Cmd+K / Ctrl+K)
  function initSearchShortcut() {
    document.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        var searchInput = document.querySelector('input[type="text"][placeholder*="جستجو"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    });
  }

  
  // 7. Audio Equalizer Interactive Presets
  function initEqualizerPresets() {
    var presets = {
      balanced: { 60: 0, 230: 0, 910: 0, '4k': 0, '14k': 0 },
      vocal: { 60: -2, 230: 1, 910: 4, '4k': 3, '14k': 1 },
      bass: { 60: 6, 230: 4, 910: 0, '4k': 1, '14k': 2 },
      hifi: { 60: 4, 230: 2, 910: -1, '4k': 3, '14k': 5 },
      night: { 60: -4, 230: -2, 910: 2, '4k': 0, '14k': -3 }
    };

    document.addEventListener('click', function(e) {
      var presetBtn = e.target.closest('.eq-preset-btn');
      if (presetBtn) {
        e.preventDefault();
        var presetKey = presetBtn.getAttribute('data-preset');
        var data = presets[presetKey];
        if (!data) return;

        // Active state
        var allPresetBtns = document.querySelectorAll('.eq-preset-btn');
        allPresetBtns.forEach(function(b) {
          b.classList.remove('active', 'bg-surface-container-high', 'text-primary-container', 'border-primary-container/40');
          b.classList.add('bg-surface-container', 'text-outline', 'border-transparent');
        });
        presetBtn.classList.add('active', 'bg-surface-container-high', 'text-primary-container', 'border-primary-container/40');
        presetBtn.classList.remove('bg-surface-container', 'text-outline', 'border-transparent');

        // Update Sliders
        Object.keys(data).forEach(function(freq) {
          var val = data[freq];
          var slider = document.getElementById('eq-slider-' + freq);
          var indicator = document.getElementById('eq-val-' + freq);
          if (slider) slider.value = val;
          if (indicator) indicator.textContent = (val > 0 ? '+' : '') + val + 'dB';
        });

        window.dopsToast('پریست اکولایزر: ' + presetBtn.textContent.trim(), 'success');
      }
    });
  }

  
  // 8. Comments Smooth Scroll & Pulse Highlight
  function initCommentsScroll() {
    document.addEventListener('click', function(e) {
      var trigger = e.target.closest('a[href="#comments"]');
      if (trigger) {
        var target = document.getElementById('comments');
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.classList.add('ring-2', 'ring-primary-container', 'shadow-glow');
          setTimeout(function() {
            target.classList.remove('ring-2', 'ring-primary-container', 'shadow-glow');
          }, 2500);
        }
      }
    });
  }

  // 9. Auth Methods Switcher & OTP Flow (Phone SMS & Email Support)
  function initAuthFlow() {
    // Sub-method switcher (OTP vs Password / OTP vs Email)
    document.addEventListener('click', function(e) {
      var subtabBtn = e.target.closest('[data-auth-method]');
      if (subtabBtn) {
        e.preventDefault();
        var method = subtabBtn.getAttribute('data-auth-method');
        var container = subtabBtn.closest('form') || subtabBtn.closest('[data-tab-panel]');
        if (!container) return;

        // Toggle active button style
        var siblingBtns = container.querySelectorAll('[data-auth-method]');
        siblingBtns.forEach(function(b) {
          b.classList.remove('active', 'bg-surface-container-high', 'text-primary-container');
          b.classList.add('text-outline');
        });
        subtabBtn.classList.add('active', 'bg-surface-container-high', 'text-primary-container');
        subtabBtn.classList.remove('text-outline');

        // Toggle method views
        var methodPanels = container.querySelectorAll('[data-method-view]');
        methodPanels.forEach(function(panel) {
          if (panel.getAttribute('data-method-view') === method) {
            panel.style.display = '';
          } else {
            panel.style.display = 'none';
          }
        });
      }

      // Send OTP code button trigger
      var sendOtpBtn = e.target.closest('[data-send-otp]');
      if (sendOtpBtn) {
        e.preventDefault();
        var form = sendOtpBtn.closest('form');
        var phoneInput = form ? form.querySelector('input[type="tel"]') : null;
        var phoneVal = phoneInput ? phoneInput.value.trim() : '';

        if (phoneVal.length < 10) {
          window.dopsToast('لطفاً شماره موبایل معتبر (۱۱ رقم) وارد نمایید', 'error');
          if (phoneInput) phoneInput.focus();
          return;
        }

        // Show toast with simulated OTP code
        var dummyOtp = Math.floor(10000 + Math.random() * 90000);
        window.dopsToast('کد تایید پیامکی داپس: ' + dummyOtp, 'success');

        // Switch to OTP verify step
        var stepPhone = form.querySelector('.otp-step-phone');
        var stepVerify = form.querySelector('.otp-step-verify');
        var targetPhoneLabel = form.querySelector('.otp-target-phone');
        if (targetPhoneLabel) targetPhoneLabel.textContent = phoneVal;

        if (stepPhone && stepVerify) {
          stepPhone.style.display = 'none';
          stepVerify.style.display = '';
          var firstOtpInput = stepVerify.querySelector('.dops-otp-input');
          if (firstOtpInput) firstOtpInput.focus();

          // Start 120s countdown timer
          var timerEl = form.querySelector('.otp-timer-count');
          var resendBtn = form.querySelector('.otp-resend-btn');
          if (timerEl && resendBtn) {
            resendBtn.style.display = 'none';
            timerEl.parentElement.style.display = '';
            var timeLeft = 120;
            var interval = setInterval(function() {
              timeLeft--;
              var mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
              var secs = String(timeLeft % 60).padStart(2, '0');
              timerEl.textContent = mins + ':' + secs;
              if (timeLeft <= 0) {
                clearInterval(interval);
                timerEl.parentElement.style.display = 'none';
                resendBtn.style.display = '';
              }
            }, 1000);
          }
        }
      }

      // Edit phone button in OTP step
      var editPhoneBtn = e.target.closest('[data-edit-phone]');
      if (editPhoneBtn) {
        e.preventDefault();
        var form = editPhoneBtn.closest('form');
        var stepPhone = form.querySelector('.otp-step-phone');
        var stepVerify = form.querySelector('.otp-step-verify');
        if (stepPhone && stepVerify) {
          stepVerify.style.display = 'none';
          stepPhone.style.display = '';
          var phoneInput = stepPhone.querySelector('input[type="tel"]');
          if (phoneInput) phoneInput.focus();
        }
      }
    });

    // Auto-advance OTP inputs
    document.addEventListener('input', function(e) {
      if (e.target.classList.contains('dops-otp-input')) {
        var input = e.target;
        var val = input.value;
        if (val.length >= 1) {
          input.value = val.slice(-1);
          var next = input.nextElementSibling;
          if (next && next.classList.contains('dops-otp-input')) {
            next.focus();
          }
        }
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.target.classList.contains('dops-otp-input') && e.key === 'Backspace') {
        var input = e.target;
        if (!input.value) {
          var prev = input.previousElementSibling;
          if (prev && prev.classList.contains('dops-otp-input')) {
            prev.focus();
          }
        }
      }
    });
  }

  // Initialize all on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    initDrawers();
    initTabs();
    initModals();
    initInteractiveButtons();
    initSearchShortcut();
    initEqualizerPresets();
    initCommentsScroll();
    initAuthFlow();
  });

  // 9. Password Visibility Toggle & Account Settings Handler
  window.togglePasswordVisibility = function(inputId, btn) {
    var input = document.getElementById(inputId);
    if (!input) return;
    var isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    var icon = btn.querySelector('.material-symbols-outlined') || btn;
    if (icon) {
      icon.textContent = isPass ? 'visibility_off' : 'visibility';
    }
  };

  window.handleAccountSettingsSave = function(event) {
    event.preventDefault();
    var currentPass = document.getElementById('current-password-input');
    var newPass = document.getElementById('new-password-input');
    var confirmPass = document.getElementById('confirm-password-input');
    
    var newPassVal = newPass ? newPass.value.trim() : '';
    var confirmPassVal = confirmPass ? confirmPass.value.trim() : '';
    
    if (newPassVal || confirmPassVal) {
      if (newPassVal.length < 8) {
        window.dopsToast('رمز عبور جدید باید حداقل ۸ کاراکتر باشد', 'error');
        return;
      }
      if (newPassVal !== confirmPassVal) {
        window.dopsToast('رمز عبور جدید با تکرار آن یکسان نیست', 'error');
        return;
      }
      window.dopsToast('گذرواژه ورود و مشخصات حساب با موفقیت ذخیره شد!', 'success');
      if (currentPass) currentPass.value = '';
      if (newPass) newPass.value = '';
      if (confirmPass) confirmPass.value = '';
    } else {
      window.dopsToast('مشخصات حساب کاربری با موفقیت به‌روزرسانی شد', 'success');
    }
    
    var modal = document.getElementById('account-settings-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  };
})();
