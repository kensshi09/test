<?php

/** @var array $meta */
/** @var array $city */
/** @var string $fullUrl */
?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />

    <title>Welcome – <?= htmlspecialchars($city['name'], ENT_QUOTES, 'UTF-8') ?> | CHOTAM! SHOW</title>
    <meta name="description" content="<?= htmlspecialchars($meta['description'], ENT_QUOTES, 'UTF-8') ?>">
    <meta name="keywords" content="<?= htmlspecialchars($meta['keywords'], ENT_QUOTES, 'UTF-8') ?>">

    <meta property="og:title" content="Welcome – <?= htmlspecialchars($city['name'], ENT_QUOTES, 'UTF-8') ?> | CHOTAM! SHOW">
    <meta property="og:description" content="<?= htmlspecialchars($meta['og_description'], ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image" content="<?= htmlspecialchars($meta['og_image'], ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:url" content="<?= htmlspecialchars($fullUrl, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:type" content="website">

    <link rel="canonical" href="<?= htmlspecialchars($fullUrl, ENT_QUOTES, 'UTF-8') ?>">

    <link rel="icon" type="image/png" href="/favicon.png">
</head>

<body>
    <header data-animate>
        <a href="/" style="display: inline-block; text-decoration: none;">
            <img src="/templates/logo_white.PNG" alt="Логотип" />
        </a>
    </header>

    <main class="welcome-main">
        <section class="welcome-hero" data-animate>
            <h1>CHOTAM! SHOW в городе <?= htmlspecialchars($city['name'], ENT_QUOTES, 'UTF-8') ?></h1>
            <p>Рекламная посадочная страница для кампаний по этому городу.</p>
            <p>Здесь можно разместить спецпредложение, оффер или видео.</p>
        </section>
    </main>
</body>

</html>