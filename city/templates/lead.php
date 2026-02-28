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

    <title>Быстрая заявка – <?= htmlspecialchars($city['name'], ENT_QUOTES, 'UTF-8') ?> | CHOTAM! SHOW</title>
    <meta name="description" content="<?= htmlspecialchars($meta['description'], ENT_QUOTES, 'UTF-8') ?>">
    <meta name="keywords" content="<?= htmlspecialchars($meta['keywords'], ENT_QUOTES, 'UTF-8') ?>">

    <meta property="og:title" content="Быстрая заявка – <?= htmlspecialchars($city['name'], ENT_QUOTES, 'UTF-8') ?> | CHOTAM! SHOW">
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

    <div class="lead-wrapper">
        <div class="lead-card">
            <div class="lead-header">
                <h1 class="lead-title">Оставьте заявку</h1>
                <p class="lead-subtitle">
                    Мы свяжемся с вами и предложим варианты для города
                    <?= htmlspecialchars($city['name'], ENT_QUOTES, 'UTF-8') ?>.
                </p>
            </div>

            <form class="lead-form" id="leadFormCity">
                <div class="form-group">
                    <label for="leadNameCity" class="form-label">Ваше имя</label>
                    <input type="text" id="leadNameCity" name="name" class="form-input" required>
                </div>

                <div class="form-group">
                    <label for="leadPhoneCity" class="form-label">Номер телефона</label>
                    <input type="tel" id="leadPhoneCity" name="phone" class="form-input" required>
                </div>

                <button type="submit" class="lead-submit">
                    <span class="btn-text">Отправить заявку</span>
                </button>
            </form>
        </div>
    </div>
</body>

</html>