/**
 * DOPS — Universal Persistent HTML5 Audio Player Engine
 * Controls playback, seeking, speeds, volume, track metadata, RTL waveform synchronization,
 * desktop horizontal alignment, and full-featured mobile expanded bottom sheet.
 */
(function() {
  'use strict';

  // Persian Numerals Helper
  function toPersianDigits(str) {
    if (str === null || str === undefined) return '';
    var persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, function(d) {
      return persianDigits[parseInt(d, 10)];
    });
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return toPersianDigits('۰۰:۰۰');
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    var padMins = mins < 10 ? '۰' + mins : mins;
    var padSecs = secs < 10 ? '۰' + secs : secs;
    return toPersianDigits(padMins + ':' + padSecs);
  }

  var defaultTrack = {
    title: 'آینده هوش مصنوعی و مدل‌های استدلال‌گر',
    podcast: 'پادکست دنیای فردا • اپیزود ۸۴',
    artwork: 'assets/images/podcasts/donye-farda.png',
    src: 'assets/audio/sample-episode.mp3',
    duration: 334 // ~05:34 in seconds for sample episode
  };

  var audio = new Audio();
  audio.preload = 'metadata';
  audio.src = defaultTrack.src;

  var currentTrack = defaultTrack;
  var isPlaying = false;
  var playbackSpeeds = [1.0, 1.25, 1.5, 2.0];
  var currentSpeedIndex = 0;

  // DOM Elements
  var dom = {
    player: null,
    playBtns: [],
    titleEl: null,
    podcastEl: null,
    artworkEl: null,
    currentTimeEl: null,
    durationEl: null,
    progressBar: null,
    progressFill: null,
    progressThumb: null,
    speedBtn: null,
    volumeSlider: null,
    volumeIcon: null,
    likeBtns: [],

    // Mobile Expanded Player Elements
    expandedPlayer: null,
    sheetBackdrop: null,
    expandedCloseBtn: null,
    sheetHandle: null,
    expandedTitle: null,
    expandedPodcast: null,
    expandedHeaderPodcast: null,
    expandedArtwork: null,
    expandedCurrentTime: null,
    expandedDuration: null,
    expandedProgressBar: null,
    expandedProgressFill: null,
    expandedSpeedBtn: null,
    expandedVolumeSlider: null,
    expandedVolumeIcon: null
  };

  function initElements() {
    dom.player = document.getElementById('dops-bottom-player');
    dom.playBtns = document.querySelectorAll('.dops-player-play-btn');
    dom.titleEl = document.getElementById('dops-player-title');
    dom.podcastEl = document.getElementById('dops-player-podcast');
    dom.artworkEl = document.getElementById('dops-player-artwork');
    dom.currentTimeEl = document.getElementById('dops-player-current-time');
    dom.durationEl = document.getElementById('dops-player-duration');
    dom.progressBar = document.getElementById('dops-player-progress-bar');
    dom.progressFill = document.getElementById('dops-player-progress-fill');
    dom.progressThumb = document.getElementById('dops-player-progress-thumb');
    dom.speedBtn = document.getElementById('dops-player-speed-btn');
    dom.volumeSlider = document.getElementById('dops-player-volume-slider');
    dom.volumeIcon = document.getElementById('dops-player-volume-icon');
    dom.likeBtns = document.querySelectorAll('#dops-player-like-btn, #dops-expanded-like-btn');

    // Mobile Expanded Sheet
    dom.expandedPlayer = document.getElementById('dops-mobile-expanded-player');
    dom.sheetBackdrop = document.getElementById('dops-mobile-sheet-backdrop');
    dom.expandedCloseBtn = document.getElementById('dops-expanded-close-btn');
    dom.sheetHandle = document.getElementById('dops-sheet-handle');
    dom.expandedTitle = document.getElementById('dops-expanded-title');
    dom.expandedPodcast = document.getElementById('dops-expanded-podcast');
    dom.expandedHeaderPodcast = document.getElementById('dops-expanded-header-podcast');
    dom.expandedArtwork = document.getElementById('dops-expanded-artwork');
    dom.expandedCurrentTime = document.getElementById('dops-expanded-current-time');
    dom.expandedDuration = document.getElementById('dops-expanded-duration');
    dom.expandedProgressBar = document.getElementById('dops-expanded-progress-bar');
    dom.expandedProgressFill = document.getElementById('dops-expanded-progress-fill');
    dom.expandedSpeedBtn = document.getElementById('dops-expanded-speed-btn');
    dom.expandedVolumeSlider = document.getElementById('dops-expanded-volume-slider');
    dom.expandedVolumeIcon = document.getElementById('dops-expanded-volume-icon');
  }

  function openExpandedPlayer() {
    if (dom.sheetBackdrop) {
      dom.sheetBackdrop.classList.add('active');
    }
    if (dom.expandedPlayer) {
      dom.expandedPlayer.classList.add('active');
    }
  }

  function closeExpandedPlayer() {
    if (dom.sheetBackdrop) {
      dom.sheetBackdrop.classList.remove('active');
    }
    if (dom.expandedPlayer) {
      dom.expandedPlayer.classList.remove('active');
    }
  }

  function updatePlayerUI() {
    // Desktop / Compact UI
    if (dom.titleEl) dom.titleEl.textContent = currentTrack.title;
    if (dom.podcastEl) dom.podcastEl.textContent = currentTrack.podcast;
    if (dom.artworkEl) dom.artworkEl.src = currentTrack.artwork;
    if (dom.durationEl) {
      dom.durationEl.textContent = formatTime(audio.duration || currentTrack.duration);
    }

    // Expanded Mobile Sheet UI
    if (dom.expandedTitle) dom.expandedTitle.textContent = currentTrack.title;
    if (dom.expandedPodcast) dom.expandedPodcast.textContent = currentTrack.podcast;
    if (dom.expandedHeaderPodcast) {
      var parts = currentTrack.podcast.split('•');
      dom.expandedHeaderPodcast.textContent = parts[0].trim();
    }
    if (dom.expandedArtwork) dom.expandedArtwork.src = currentTrack.artwork;
    if (dom.expandedDuration) {
      dom.expandedDuration.textContent = formatTime(audio.duration || currentTrack.duration);
    }

    // Play/pause icon update across all buttons
    dom.playBtns.forEach(function(btn) {
      var icon = btn.querySelector('.material-symbols-outlined') || btn;
      if (isPlaying) {
        icon.textContent = 'pause';
      } else {
        icon.textContent = 'play_arrow';
      }
    });

    // Toggle animated equalizer state across page
    document.querySelectorAll('.eq-visualizer').forEach(function(el) {
      if (isPlaying) {
        el.classList.add('eq-playing');
        el.classList.remove('eq-paused');
      } else {
        el.classList.remove('eq-playing');
        el.classList.add('eq-paused');
      }
    });
  }

  function togglePlay() {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
    } else {
      audio.play().then(function() {
        isPlaying = true;
        updatePlayerUI();
      }).catch(function(err) {
        console.log('Audio playback notice:', err);
        isPlaying = true; // Visual state fallback for demo
        updatePlayerUI();
      });
    }
    updatePlayerUI();
  }

  function seekToPercent(percent) {
    percent = Math.max(0, Math.min(1, percent));
    var dur = audio.duration || currentTrack.duration;
    audio.currentTime = dur * percent;
    updateProgressUI(audio.currentTime, dur);
  }

  function updateProgressUI(current, total) {
    if (!total || isNaN(total)) total = currentTrack.duration;
    var pct = Math.min(100, Math.max(0, (current / total) * 100));

    // Desktop
    if (dom.progressFill) dom.progressFill.style.width = pct + '%';
    if (dom.currentTimeEl) dom.currentTimeEl.textContent = formatTime(current);
    if (dom.durationEl) dom.durationEl.textContent = formatTime(total);

    // Mobile Expanded
    if (dom.expandedProgressFill) dom.expandedProgressFill.style.width = pct + '%';
    if (dom.expandedCurrentTime) dom.expandedCurrentTime.textContent = formatTime(current);
    if (dom.expandedDuration) dom.expandedDuration.textContent = formatTime(total);

    // Inline sync scrubbers
    document.querySelectorAll('[data-sync-progress-fill]').forEach(function(el) {
      el.style.width = pct + '%';
    });
    document.querySelectorAll('[data-sync-current-time]').forEach(function(el) {
      el.textContent = formatTime(current);
    });
  }

  function cycleSpeed() {
    currentSpeedIndex = (currentSpeedIndex + 1) % playbackSpeeds.length;
    var speed = playbackSpeeds[currentSpeedIndex];
    audio.playbackRate = speed;
    var speedText = toPersianDigits(speed.toFixed(1)) + 'x';
    if (dom.speedBtn) dom.speedBtn.textContent = speedText;
    if (dom.expandedSpeedBtn) dom.expandedSpeedBtn.textContent = speedText;
    if (window.dopsToast) {
      window.dopsToast('سرعت پخش: ' + toPersianDigits(speed.toFixed(1)) + ' برابر');
    }
  }

  function setVolume(val) {
    val = Math.max(0, Math.min(1, val));
    audio.volume = val;
    if (dom.volumeSlider) dom.volumeSlider.value = val;
    if (dom.expandedVolumeSlider) dom.expandedVolumeSlider.value = val;

    var iconName = 'volume_up';
    if (val === 0) iconName = 'volume_off';
    else if (val < 0.5) iconName = 'volume_down';

    if (dom.volumeIcon) dom.volumeIcon.textContent = iconName;
    if (dom.expandedVolumeIcon) dom.expandedVolumeIcon.textContent = iconName;
  }

  // Public API to play a specific track from any card on any page
  window.dopsPlayTrack = function(trackData) {
    if (!trackData) return;
    currentTrack = Object.assign({}, defaultTrack, trackData);
    audio.src = currentTrack.src || defaultTrack.src;
    audio.currentTime = 0;
    audio.play().then(function() {
      isPlaying = true;
      updatePlayerUI();
      if (window.dopsToast) {
        window.dopsToast('در حال پخش: ' + currentTrack.title);
      }
    }).catch(function() {
      isPlaying = true;
      updatePlayerUI();
      if (window.dopsToast) {
        window.dopsToast('در حال پخش: ' + currentTrack.title);
      }
    });
    updatePlayerUI();
  };

  // Audio Event Listeners
  audio.addEventListener('loadedmetadata', function() {
    if (audio.duration && !isNaN(audio.duration)) {
      currentTrack.duration = audio.duration;
      updatePlayerUI();
      updateProgressUI(audio.currentTime, audio.duration);
    }
  });

  audio.addEventListener('timeupdate', function() {
    updateProgressUI(audio.currentTime, audio.duration || currentTrack.duration);
  });

  audio.addEventListener('ended', function() {
    isPlaying = false;
    audio.currentTime = 0;
    updatePlayerUI();
    if (window.dopsToast) {
      window.dopsToast('پخش اپیزود به پایان رسید');
    }
  });

  // Wire UI Controls
  document.addEventListener('DOMContentLoaded', function() {
    initElements();
    updatePlayerUI();

    // Play/Pause buttons
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('.dops-player-play-btn');
      if (btn) {
        e.preventDefault();
        togglePlay();
      }
    });

    // Skip Buttons
    document.addEventListener('click', function(e) {
      var rewind = e.target.closest('[data-player-rewind]');
      if (rewind) {
        e.preventDefault();
        audio.currentTime = Math.max(0, audio.currentTime - 15);
        if (window.dopsToast) window.dopsToast('۱۵ ثانیه به عقب برگشت');
        return;
      }

      var forward = e.target.closest('[data-player-forward]');
      if (forward) {
        e.preventDefault();
        var dur = audio.duration || currentTrack.duration;
        audio.currentTime = Math.min(dur, audio.currentTime + 30);
        if (window.dopsToast) window.dopsToast('۳۰ ثانیه به جلو رفت');
        return;
      }
    });

    // Progress Bar (Desktop & Mobile Compact)
    if (dom.progressBar) {
      dom.progressBar.addEventListener('click', function(e) {
        var rect = dom.progressBar.getBoundingClientRect();
        var clickX = rect.right - e.clientX; // RTL: 0 is on right
        seekToPercent(clickX / rect.width);
      });
    }

    // Progress Bar (Mobile Expanded Scrubber)
    if (dom.expandedProgressBar) {
      var handleExpandedSeek = function(clientX) {
        var rect = dom.expandedProgressBar.getBoundingClientRect();
        var clickX = rect.right - clientX; // RTL
        seekToPercent(clickX / rect.width);
      };

      dom.expandedProgressBar.addEventListener('click', function(e) {
        handleExpandedSeek(e.clientX);
      });

      dom.expandedProgressBar.addEventListener('touchstart', function(e) {
        if (e.touches && e.touches[0]) handleExpandedSeek(e.touches[0].clientX);
      }, { passive: true });

      dom.expandedProgressBar.addEventListener('touchmove', function(e) {
        if (e.touches && e.touches[0]) handleExpandedSeek(e.touches[0].clientX);
      }, { passive: true });
    }

    // Speed Selectors
    if (dom.speedBtn) {
      dom.speedBtn.addEventListener('click', function(e) {
        e.preventDefault();
        cycleSpeed();
      });
    }
    if (dom.expandedSpeedBtn) {
      dom.expandedSpeedBtn.addEventListener('click', function(e) {
        e.preventDefault();
        cycleSpeed();
      });
    }

    // Volume Sliders
    if (dom.volumeSlider) {
      dom.volumeSlider.addEventListener('input', function(e) {
        setVolume(parseFloat(e.target.value));
      });
    }
    if (dom.expandedVolumeSlider) {
      dom.expandedVolumeSlider.addEventListener('input', function(e) {
        setVolume(parseFloat(e.target.value));
      });
    }

    // Volume Icons Mute Toggle
    var handleMuteToggle = function() {
      if (audio.volume > 0) {
        audio.dataset.prevVolume = audio.volume;
        setVolume(0);
      } else {
        var restored = parseFloat(audio.dataset.prevVolume || 0.85);
        setVolume(restored);
      }
    };

    if (dom.volumeIcon) dom.volumeIcon.addEventListener('click', handleMuteToggle);
    if (dom.expandedVolumeIcon) dom.expandedVolumeIcon.addEventListener('click', handleMuteToggle);

    // Expand Mobile Bottom Sheet
    document.addEventListener('click', function(e) {
      var expandTrigger = e.target.closest('[data-player-expand]');
      if (expandTrigger) {
        e.preventDefault();
        openExpandedPlayer();
        return;
      }

      var compactMeta = e.target.closest('.compact-player-trigger');
      if (compactMeta) {
        e.preventDefault();
        openExpandedPlayer();
        return;
      }

      var closeTrigger = e.target.closest('#dops-expanded-close-btn, #dops-sheet-handle, #dops-mobile-sheet-backdrop');
      if (closeTrigger) {
        e.preventDefault();
        closeExpandedPlayer();
        return;
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeExpandedPlayer();
      }
    });

    // Favorite / Like Buttons (Synced)
    document.addEventListener('click', function(e) {
      var likeBtn = e.target.closest('#dops-player-like-btn, #dops-expanded-like-btn');
      if (likeBtn) {
        e.preventDefault();
        var isFav = false;
        var icon = likeBtn.querySelector('.material-symbols-outlined') || likeBtn;
        if (icon.classList.contains('text-red-500') || icon.classList.contains('fill-current')) {
          isFav = false;
        } else {
          isFav = true;
        }

        document.querySelectorAll('#dops-player-like-btn, #dops-expanded-like-btn').forEach(function(btn) {
          var ic = btn.querySelector('.material-symbols-outlined') || btn;
          if (isFav) {
            ic.classList.add('text-red-500', 'fill-current');
            ic.style.color = '#ff5252';
          } else {
            ic.classList.remove('text-red-500', 'fill-current');
            ic.style.color = '';
          }
        });

        if (window.dopsToast) {
          window.dopsToast(isFav ? 'به نشان‌شده‌ها اضافه شد' : 'از نشان‌شده‌ها حذف شد');
        }
      }
    });

    // Connect any Track Trigger on the page: [data-track-title]
    document.addEventListener('click', function(e) {
      var trigger = e.target.closest('[data-podcast-play], .play-episode-btn');
      if (trigger) {
        e.preventDefault();
        var title = trigger.getAttribute('data-track-title') || 'اپیزود جدید داپس';
        var podcast = trigger.getAttribute('data-track-podcast') || 'پادکست دنیای فردا';
        var artwork = trigger.getAttribute('data-track-artwork') || 'assets/images/podcasts/donye-farda.png';
        window.dopsPlayTrack({
          title: title,
          podcast: podcast,
          artwork: artwork,
          src: 'assets/audio/sample-episode.mp3'
        });
      }
    });
  });
})();
