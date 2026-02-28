<?php

/** @var array $meta */
/** @var array $city */
/** @var string $phone */
/** @var string $whatsappNumber */
/** @var string $instagramUrl */
/** @var string $fullUrl */
?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />

    <title><?= htmlspecialchars($meta['title'], ENT_QUOTES, 'UTF-8') ?></title>
    <meta name="description" content="<?= htmlspecialchars($meta['description'], ENT_QUOTES, 'UTF-8') ?>">
    <meta name="keywords" content="<?= htmlspecialchars($meta['keywords'], ENT_QUOTES, 'UTF-8') ?>">

    <meta property="og:title" content="<?= htmlspecialchars($meta['og_title'], ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:description" content="<?= htmlspecialchars($meta['og_description'], ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image" content="<?= htmlspecialchars($meta['og_image'], ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:url" content="<?= htmlspecialchars($fullUrl, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:type" content="website">

    <link rel="canonical" href="<?= htmlspecialchars($fullUrl, ENT_QUOTES, 'UTF-8') ?>">

    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="stylesheet" href="/style.css">
</head>

<body>
    <header data-animate>
        <img src="/templates/logo_white.PNG" alt="Логотип" />
        <button class="menu-toggle" aria-label="Открыть меню">&#9776;</button>
        <nav class="desktop-nav">
            <a href="/"><?= htmlspecialchars($city['name'], ENT_QUOTES, 'UTF-8') ?></a>
            <a href="#main">Главная</a>
            <a href="#services">Услуги</a>
            <a href="#gallery">Галерея</a>
            <a href="#reviews">Отзывы</a>
            <a href="#packages">Цена</a>
            <a href="/<?= htmlspecialchars($city['slug'], ENT_QUOTES, 'UTF-8') ?>/quiz/">Квиз</a>
            <div class="city-switcher">
                <span class="city-switcher-label">Город:</span>
                <a href="/" class="city-switcher-link<?= $city['slug'] === 'astana' ? ' city-switcher-link--active' : '' ?>">Астана</a>
                <span class="city-switcher-separator">|</span>
                <a href="/almaty/" class="city-switcher-link<?= $city['slug'] === 'almaty' ? ' city-switcher-link--active' : '' ?>">Алматы</a>
            </div>
            <a href="<?= htmlspecialchars($instagramUrl, ENT_QUOTES, 'UTF-8') ?>" class="social-icon" target="_blank">Instagram</a>
            <a href="https://wa.me/<?= htmlspecialchars($whatsappNumber, ENT_QUOTES, 'UTF-8') ?>?text=Здравствуйте! Хочу организовать мероприятие в <?= urlencode($city['name']) ?>."
                class="social-icon" target="_blank">WhatsApp</a>
        </nav>
    </header>

    <button class="menu-toggle" aria-label="Открыть меню">&#9776;</button>
    <nav class="mobile-nav">
        <button class="close-menu">✖</button>
        <a href="#main">Главная</a>
        <a href="#services">Услуги</a>
        <a href="#gallery">Галерея</a>
        <a href="#reviews">Отзывы</a>
        <a href="#packages">Цена</a>
        <a href="/<?= htmlspecialchars($city['slug'], ENT_QUOTES, 'UTF-8') ?>/quiz/">Квиз</a>
    </nav>

    <div class="overlay"></div>

    <section class="hero" id="main" data-animate>
        <h1>
            <span class="highligted1">CHOTAM! SHOW</span> – организация мероприятий в
            <?= htmlspecialchars($city['name'], ENT_QUOTES, 'UTF-8') ?>
        </h1>
        <p>Развлекательные программы для любых мероприятий и вечеринок.</p>
        <h2>Организуем мероприятие любого масштаба под ключ!</h2>
        <p><span class="highligted">Более 150 000</span> довольных гостей</p>
        <a href="https://wa.me/<?= htmlspecialchars($whatsappNumber, ENT_QUOTES, 'UTF-8') ?>?text=Здравствуйте! Хочу организовать мероприятие в <?= urlencode($city['name']) ?>."
            target="_blank">
            <button>Связаться с нами</button>
        </a>
    </section>

    <section class="section" id="services" data-animate>
        <div class="container">
            <h2>Услуги в <?= htmlspecialchars($city['name'], ENT_QUOTES, 'UTF-8') ?></h2>
            <p>Свадьбы, корпоративы, дни рождения, детские праздники, тимбилдинги и другие события под ключ.</p>
        </div>
    </section>

    <section class="section" id="city-quiz" data-animate>
        <div class="container">
            <h2>Подобрать программу под ваш праздник</h2>
            <p>Ответьте на несколько вопросов, и мы пришлём персональное предложение.</p>
            <a href="/<?= htmlspecialchars($city['slug'], ENT_QUOTES, 'UTF-8') ?>/quiz/" class="button">
                Пройти квиз
            </a>
        </div>
    </section>

    <script src="/script.js"></script>
</body>

</html>