/**
 * DOPS — Analytics Chart Engine (Creator Dashboard)
 * Metronic-inspired smooth bezier spline chart with thin crisp stroke,
 * elegant gradient fill, and interactive node tooltips.
 */
(function() {
  'use strict';

  var datasets = {
    '7d': {
      label: '۷ روز گذشته',
      points: [
        { x: 50, y: 155, date: '۲۴ شهریور', plays: '۱,۴۲۰' },
        { x: 200, y: 135, date: '۲۵ شهریور', plays: '۱,۸۵۰' },
        { x: 350, y: 115, date: '۲۶ شهریور', plays: '۲,۱۰۰' },
        { x: 500, y: 75, date: '۲۷ شهریور', plays: '۲,۸۴۰' },
        { x: 650, y: 95, date: '۲۸ شهریور', plays: '۲,۴۵۰' },
        { x: 800, y: 55, date: '۲۹ شهریور', plays: '۳,۲۰۰' },
        { x: 950, y: 35, date: '۳۰ شهریور', plays: '۳,۶۵۰' }
      ],
      totalPlays: '۱۷,۵۱۰ بار',
      dailyAvg: '۲,۵۰۰ بار',
      growthRate: '+۱۸.۴٪',
      retention: '۶۸٪ طول قسمت'
    },
    '30d': {
      label: '۳۰ روز اخیر',
      points: [
        { x: 30, y: 185, date: '۱ شهریور', plays: '۹۸۰' },
        { x: 180, y: 150, date: '۶ شهریور', plays: '۱,۴۲۰' },
        { x: 340, y: 120, date: '۱۲ شهریور', plays: '۱,۸۹۰' },
        { x: 500, y: 100, date: '۱۸ شهریور', plays: '۲,۳۰۰' },
        { x: 680, y: 48, date: '۲۲ شهریور', plays: '۳,۴۵۰' },
        { x: 830, y: 65, date: '۲۶ شهریور', plays: '۳,۱۰۰' },
        { x: 970, y: 32, date: '۳۰ شهریور', plays: '۳,۸۲۰' }
      ],
      totalPlays: '۴۸,۶۲۰ بار',
      dailyAvg: '۱,۶۲۰ بار',
      growthRate: '+۱۲.۸۶٪',
      retention: '۶۴٪ طول قسمت'
    },
    '3m': {
      label: '۳ ماه گذشته',
      points: [
        { x: 50, y: 195, date: 'تیر', plays: '۳۲,۰۰۰' },
        { x: 280, y: 160, date: 'مرداد اول', plays: '۴۱,۰۰۰' },
        { x: 520, y: 105, date: 'مرداد پایان', plays: '۵۵,۰۰۰' },
        { x: 750, y: 65, date: 'شهریور اول', plays: '۶۸,۰۰۰' },
        { x: 960, y: 35, date: 'شهریور پایان', plays: '۸۲,۰۰۰' }
      ],
      totalPlays: '۱۴۲,۵۰۰ بار',
      dailyAvg: '۱,۵۸۰ بار',
      growthRate: '+۲۲.۴٪',
      retention: '۶۱٪ طول قسمت'
    },
    '1y': {
      label: '۱ سال گذشته',
      points: [
        { x: 50, y: 205, date: 'پاییز ۱۴۰۴', plays: '۱۱۰,۰۰۰' },
        { x: 350, y: 165, date: 'زمستان ۱۴۰۴', plays: '۱۶۵,۰۰۰' },
        { x: 660, y: 95, date: 'بهار ۱۴۰۵', plays: '۲۴۰,۰۰۰' },
        { x: 960, y: 25, date: 'تابستان ۱۴۰۵', plays: '۳۸۵,۰۰۰' }
      ],
      totalPlays: '۵۸۰,۰۰۰ بار',
      dailyAvg: '۱,۵۹۰ بار',
      growthRate: '+۳۴.۲٪',
      retention: '۵۹٪ طول قسمت'
    }
  };

  /**
   * Builds smooth Metronic-style cubic spline path
   */
  function buildSmoothSvgPath(points) {
    if (!points || points.length === 0) return '';
    var d = 'M ' + points[0].x + ',' + points[0].y;
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[i];
      var p1 = points[i + 1];
      var dx = (p1.x - p0.x) / 2;
      d += ' C ' + (p0.x + dx) + ',' + p0.y + ' ' + (p1.x - dx) + ',' + p1.y + ' ' + p1.x + ',' + p1.y;
    }
    return d;
  }

  function renderChart(periodKey) {
    var data = datasets[periodKey] || datasets['30d'];
    var curvePathEl = document.getElementById('chart-curve-path');
    var areaPathEl = document.getElementById('chart-area-path');
    var pointsContainer = document.getElementById('chart-points-container');
    var tooltipEl = document.getElementById('chart-tooltip');

    if (!curvePathEl || !areaPathEl) return;

    var lineD = buildSmoothSvgPath(data.points);
    var lastPt = data.points[data.points.length - 1];
    var firstPt = data.points[0];
    var areaD = lineD + ' L ' + lastPt.x + ',235 L ' + firstPt.x + ',235 Z';

    curvePathEl.setAttribute('d', lineD);
    areaPathEl.setAttribute('d', areaD);

    // Update bottom stats summary
    var totalEl = document.getElementById('stat-total-plays');
    var avgEl = document.getElementById('stat-avg-plays');
    var growthEl = document.getElementById('stat-growth-rate');
    var retentionEl = document.getElementById('stat-retention');

    if (totalEl) totalEl.textContent = data.totalPlays;
    if (avgEl) avgEl.textContent = data.dailyAvg;
    if (growthEl) growthEl.textContent = data.growthRate;
    if (retentionEl) retentionEl.textContent = data.retention;

    // Render interactive Metronic-style node dots
    if (pointsContainer) {
      pointsContainer.innerHTML = '';
      data.points.forEach(function(pt) {
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pt.x);
        circle.setAttribute('cy', pt.y);
        circle.setAttribute('r', '4');
        circle.setAttribute('class', 'chart-node');

        circle.addEventListener('mouseenter', function() {
          if (tooltipEl) {
            tooltipEl.innerHTML = '<div class="font-bold text-on-surface text-[12px]">' + pt.date + '</div>' +
                                  '<div class="text-primary font-semibold text-[11px]">' + pt.plays + ' پخش روزانه</div>';
            tooltipEl.style.opacity = '1';
            // Position relative to container percentage
            tooltipEl.style.left = (pt.x / 10) + '%';
            tooltipEl.style.top = (pt.y / 2.4 - 12) + '%';
          }
        });

        circle.addEventListener('mouseleave', function() {
          if (tooltipEl) {
            tooltipEl.style.opacity = '0';
          }
        });

        pointsContainer.appendChild(circle);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    renderChart('30d');

    var filterBtns = document.querySelectorAll('[data-chart-period]');
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var period = btn.getAttribute('data-chart-period');
        filterBtns.forEach(function(b) {
          b.classList.remove('bg-primary-container', 'text-on-primary-container', 'active');
          b.classList.add('bg-surface-container-high', 'text-on-surface');
        });
        btn.classList.add('bg-primary-container', 'text-on-primary-container', 'active');
        btn.classList.remove('bg-surface-container-high', 'text-on-surface');
        renderChart(period);
      });
    });
  });
})();
