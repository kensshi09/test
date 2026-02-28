<?php

/** @var array $meta */
/** @var array $city */
/** @var string $fullUrl */
?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <title>Квиз – <?= htmlspecialchars($city['name'], ENT_QUOTES, 'UTF-8') ?> | CHOTAM! SHOW</title>
    <meta name="description" content="<?= htmlspecialchars($meta['description'], ENT_QUOTES, 'UTF-8') ?>">
    <meta name="keywords" content="<?= htmlspecialchars($meta['keywords'], ENT_QUOTES, 'UTF-8') ?>">

    <meta property="og:title" content="Квиз – <?= htmlspecialchars($city['name'], ENT_QUOTES, 'UTF-8') ?> | CHOTAM! SHOW">
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

    <div class="quiz-wrapper" data-animate>
        <div class="quiz-card">
            <h1>Квиз для города <?= htmlspecialchars($city['name'], ENT_QUOTES, 'UTF-8') ?></h1>
            <p>Здесь можно встроить существующий квиз или его упрощённую версию.</p>
            <p>Пока что это базовый шаблон для проверки маршрутизации `/<?= htmlspecialchars($city['slug'], ENT_QUOTES, 'UTF-8') ?>/quiz/`.</p>
        </div>
    </div>
</body>

</html>