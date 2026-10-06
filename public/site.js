// CinchStack's only script: loads Google Analytics 4 when this visitor may be measured.
// - Never when the browser sends Global Privacy Control, or after the visitor says no.
// - Only after an explicit "Allow" when the device's time zone is in the EEA, the UK or
//   Switzerland, or cannot be read.
// - By default everywhere else; the switch on /privacy/#analytics turns it off.
// Advertising features stay off. Clicks on links to vendors are recorded as events.
(function () {
  var me = document.currentScript;
  var id = me && me.getAttribute('data-ga');
  if (!id) return;
  var KEY = 'cs-analytics';
  var saved = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var save = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} };
  var tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
  var ask = !tz || /^(Europe\/|Etc\/|Atlantic\/(Azores|Canary|Faroe|Jan_Mayen|Madeira|Reykjavik)$|Arctic\/Longyearbyen$|Africa\/Ceuta$|Asia\/(Nicosia|Famagusta)$|Indian\/(Reunion|Mayotte)$|America\/(Cayenne|Guadeloupe|Martinique|Marigot|St_Barthelemy)$|(CET|EET|WET|MET|GB|GB-Eire|Eire|Iceland|Poland|Portugal|UTC|UCT|GMT|Universal|Zulu)$)/.test(tz);
  var gpc = navigator.globalPrivacyControl === true;
  var loaded = false;

  function load() {
    window['ga-disable-' + id] = false;
    if (loaded) { window.gtag('consent', 'update', { analytics_storage: 'granted' }); return; }
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
    window.gtag('js', new Date());
    // Cookies last 13 months at most; Google signals and ad personalization are off.
    window.gtag('config', id, { allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 34128000 });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
  }
  function stop() {
    window['ga-disable-' + id] = true;
    if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n.indexOf('_ga') !== 0) return;
      ['', '; domain=' + location.hostname, '; domain=.' + location.hostname].forEach(function (d) {
        document.cookie = n + '=; Max-Age=0; path=/' + d;
      });
    });
  }
  function choose(v) {
    save(v);
    if (v === 'granted') load(); else stop();
    var b = document.getElementById('consent');
    if (b) b.parentNode.removeChild(b);
    render();
  }
  function on(el) {
    el.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-v');
      if (v) choose(v);
    });
  }
  // The switch on the privacy page, which without this script says nothing is measured.
  var box = document.getElementById('analytics-choice');
  function render() {
    if (!box) return;
    var running = loaded && saved() !== 'denied';
    box.innerHTML = gpc
      ? '<p><strong>Your browser sends a Global Privacy Control signal, so Google Analytics is off for you and stays off.</strong></p>'
      : '<p><strong>Google Analytics is ' + (running ? 'on' : 'off') + ' for you in this browser.</strong></p>' +
        '<p><button type="button" class="btn" data-v="' + (running ? 'denied' : 'granted') + '">' + (running ? 'Turn analytics off' : 'Allow analytics') + '</button></p>';
  }
  if (box) on(box);

  var choice = saved();
  if (!gpc && (choice === 'granted' || (!ask && choice !== 'denied'))) load();
  else if (!gpc && ask && !choice && !box) {
    var n = document.createElement('section');
    n.id = 'consent';
    n.className = 'consent';
    n.setAttribute('aria-label', 'Analytics choice');
    n.innerHTML = '<p>Can we count your visit with Google Analytics? It shows us which pages help. No ads, and we never sell data. <a href="/privacy/#analytics">Details</a></p>' +
      '<p class="consent-actions"><button type="button" class="btn" data-v="granted">Allow</button><button type="button" class="btn" data-v="denied">No thanks</button></p>';
    on(n);
    document.body.appendChild(n);
  }
  render();

  // A sent enquiry is the services funnel's conversion; the contact form is counted separately.
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !loaded || window['ga-disable-' + id] || !f.getAttribute) return;
    var name = f.getAttribute('name');
    if (name === 'services') {
      var pkg = f.querySelector('[name="package"]');
      var found = f.querySelector('[name="found"]');
      window.gtag('event', 'generate_lead', { form: 'services', package: pkg ? pkg.value : '', found: found ? found.value : '', page: location.pathname });
    } else if (name === 'contact') {
      window.gtag('event', 'contact_form', { page: location.pathname });
    }
  });

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[data-tool]') : null;
    if (!a || !loaded || window['ga-disable-' + id]) return;
    window.gtag('event', a.getAttribute('data-paid') === '1' ? 'affiliate_click' : 'outbound_plain', {
      tool: a.getAttribute('data-tool'),
      placement: a.getAttribute('data-placement'),
      page: location.pathname,
    });
  });
})();
