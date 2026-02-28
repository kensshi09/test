<?php

// Простой роутер для городских страниц.
// Ожидаемые URL:
//   /{citySlug}/
//   /{citySlug}/quiz/
//   /{citySlug}/lead/
//   /{citySlug}/welcome/

$citiesConfigPath = __DIR__ . '/../config/cities.php';

if (!file_exists($citiesConfigPath)) {
    http_response_code(500);
    echo 'Cities config not found.';
    exit;
}

/** @var array<string,array> $cities */
$cities = require $citiesConfigPath;

$citySlug = isset($_GET['city']) ? strtolower(trim($_GET['city'])) : '';
$page     = isset($_GET['page']) ? strtolower(trim($_GET['page'])) : '';

if ($citySlug === '' || !isset($cities[$citySlug])) {
    http_response_code(404);
    echo 'City not found.';
    exit;
}

$city = $cities[$citySlug];

// Определяем тип страницы
switch ($page) {
    case 'quiz':
        $template = __DIR__ . '/templates/quiz.php';
        break;
    case 'lead':
        $template = __DIR__ . '/templates/lead.php';
        break;
    case 'welcome':
        $template = __DIR__ . '/templates/welcome.php';
        break;
    default:
        $template = __DIR__ . '/templates/home.php';
        break;
}

if (!file_exists($template)) {
    http_response_code(500);
    echo 'Template not found.';
    exit;
}

// Делаем переменные доступными в шаблоне
$meta = [
    'title' => $city['meta_title'] ?? 'CHOTAM! SHOW',
    'description' => $city['meta_description'] ?? '',
    'keywords' => $city['meta_keywords'] ?? '',
    'og_title' => $city['og_title'] ?? $city['meta_title'] ?? 'CHOTAM! SHOW',
    'og_description' => $city['og_description'] ?? $city['meta_description'] ?? '',
    'og_image' => $city['og_image'] ?? 'https://chotamshow.kz/templates/logo_black.PNG',
];

$phone = $city['phone'] ?? '+7 702 165 61 23';
$whatsappNumber = $city['whatsapp_number'] ?? '77021656123';
$instagramUrl = $city['instagram_url'] ?? 'https://instagram.com/chotam_astana';

// Для канонического URL и аналитики
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'chotamshow.kz';
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$fullUrl = $scheme . '://' . $host . $requestUri;

include $template;
