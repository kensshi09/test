// Глобальный трекинг UTM / клик-ID / landing / referrer / city

(function () {
  try {
    const now = new Date();
    const params = new URLSearchParams(window.location.search || '');
    const pathname = window.location.pathname || '/';
    const referrer = document.referrer || '';

    // --- UTM / click IDs ---
    const utmKeys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'gclid',
      'yclid',
      'fbclid',
      'ttclid',
    ];

    utmKeys.forEach((key) => {
      const value = params.get(key);
      if (value) {
        document.cookie = key + '=' + encodeURIComponent(value) + '; path=/; max-age=2592000';
      }
    });

    // --- first_landing / last_landing / referrer ---
    const fullUrl = window.location.href;
    const cookies = document.cookie.split(';').reduce((acc, raw) => {
      const [k, v] = raw.split('=');
      if (!k) return acc;
      acc[k.trim()] = decodeURIComponent((v || '').trim());
      return acc;
    }, {});

    if (!cookies.first_landing) {
      document.cookie = 'first_landing=' + encodeURIComponent(fullUrl) + '; path=/; max-age=2592000';
      if (referrer) {
        document.cookie = 'first_referrer=' + encodeURIComponent(referrer) + '; path=/; max-age=2592000';
      }
      document.cookie = 'first_visit_at=' + encodeURIComponent(now.toISOString()) + '; path=/; max-age=2592000';
    }

    document.cookie = 'last_landing=' + encodeURIComponent(fullUrl) + '; path=/; max-age=2592000';
    if (referrer) {
      document.cookie = 'last_referrer=' + encodeURIComponent(referrer) + '; path=/; max-age=2592000';
    }

    // --- citySlug из URL: /{citySlug}/... ---
    // Пример: /almaty/quiz/ -> citySlug = 'almaty'
    var citySlug = '';
    var pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      var firstPart = pathParts[0].toLowerCase();
      // Игнорируем технические директории
      var excluded = ['quiz', 'lead', 'welcome', 'templates', 'vendor', 'whatsapp_astana', 'config', 'city', 'assets'];
      if (excluded.indexOf(firstPart) === -1) {
        citySlug = firstPart;
      }
    }

    if (citySlug) {
      document.cookie = 'city_slug=' + encodeURIComponent(citySlug) + '; path=/; max-age=2592000';
    }

    // --- Утилита для форм: собрать трекинг-данные ---
    window.getTrackingData = function () {
      const c = document.cookie.split(';').reduce((acc, raw) => {
        const [k, v] = raw.split('=');
        if (!k) return acc;
        acc[k.trim()] = decodeURIComponent((v || '').trim());
        return acc;
      }, {});

      const data = {
        landingPage: fullUrl,
        firstLandingPage: c.first_landing || '',
        lastLandingPage: c.last_landing || '',
        referrer: referrer || c.first_referrer || '',
        citySlug: citySlug || c.city_slug || '',
      };

      utmKeys.forEach((key) => {
        if (c[key]) data[key] = c[key];
      });

      return data;
    };
  } catch (e) {
    console && console.error && console.error('Tracking init error:', e);
  }
})();

