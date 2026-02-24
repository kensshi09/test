<?php

require __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$bitrixApiKey = $_ENV['BITRIX_API_KEY'];
$bitrixDomain = 'https://chotamshow.bitrix24.kz/rest/1/' . $bitrixApiKey;

$telegramBotToken = $_ENV['TELEGRAM_BOT_TOKEN'] ?? '';
$telegramChatId = $_ENV['TELEGRAM_CHAT_ID'] ?? '';

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN');

if ($requestMethod === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($requestMethod !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false,'error' => 'Method not allowed. Use POST.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = file_get_contents('php://input');

if (!$input || trim($input) === '') {
    http_response_code(400);
    echo json_encode(['success' => false,'error' => 'Empty request body'], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE || !$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false,'error' => 'Invalid JSON'], JSON_UNESCAPED_UNICODE);
    exit;
}

$requiredFields = ['name', 'phone', 'eventType', 'eventDate'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || trim($data[$field]) === '') {
        http_response_code(400);
        echo json_encode(['success' => false,'error' => "Missing required field: $field"], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
$phone = htmlspecialchars($data['phone'], ENT_QUOTES, 'UTF-8');
$eventType = htmlspecialchars($data['eventType'], ENT_QUOTES, 'UTF-8');
$eventDate = htmlspecialchars($data['eventDate'], ENT_QUOTES, 'UTF-8');
$guests = isset($data['guests']) ? htmlspecialchars($data['guests'], ENT_QUOTES, 'UTF-8') : '0';
$age = isset($data['age']) ? htmlspecialchars($data['age'], ENT_QUOTES, 'UTF-8') : 'Не указано';
$formatMain = isset($data['formatMain']) ? htmlspecialchars($data['formatMain'], ENT_QUOTES, 'UTF-8') : 'Не выбрано';
$formatTempo = isset($data['formatTempo']) ? htmlspecialchars($data['formatTempo'], ENT_QUOTES, 'UTF-8') : '';
$city = isset($data['city']) ? htmlspecialchars($data['city'], ENT_QUOTES, 'UTF-8') : 'Не указано';
$selectedGoals = isset($data['selectedGoals']) && is_array($data['selectedGoals']) ? $data['selectedGoals'] : [];

$goalsStr = !empty($selectedGoals)
    ? implode(', ', array_map(fn($goal) => htmlspecialchars($goal, ENT_QUOTES, 'UTF-8'), $selectedGoals))
    : 'Не указано';


function sendToBitrix($url, $payload) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json; charset=utf-8'],
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error || $httpCode !== 200) {
        error_log('Bitrix error: ' . $error . ' | Code: ' . $httpCode . ' | Resp: ' . $response);
        return false;
    }

    return json_decode($response, true);
}


function sendToTelegram($botToken, $chatId, $payload) {

    if (!$botToken || !$chatId) {
        error_log('Telegram token or chat_id missing');
        return;
    }

    $message =
        "🚀 Новая заявка с квиза\n\n" .
        "👤 Имя: {$payload['name']}\n" .
        "📞 Телефон: {$payload['phone']}\n" .
        "🏙️ Город: {$payload['city']}\n" .
        "🎉 Тип мероприятия: {$payload['eventType']}\n" .
        "📅 Дата: {$payload['eventDate']}\n" .
        "👥 Гостей: {$payload['guests']}\n" .
        "🎂 Возраст: {$payload['age']}\n" .
        "🎭 Формат: {$payload['formatMain']}\n" .
        "⚡ Программа: {$payload['formatTempo']}\n" .
        "🎯 Цели: {$payload['goalsStr']}";

    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => [
            'chat_id' => $chatId,
            'text' => $message
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10
    ]);

    curl_exec($ch);
    curl_close($ch);
}


try {

    $contactPayload = [
        'fields' => [
            'NAME' => $name,
            'PHONE' => [['VALUE' => $phone, 'VALUE_TYPE' => 'MOBILE']]
        ]
    ];

    $contactResponse = sendToBitrix($bitrixDomain . '/crm.contact.add.json', $contactPayload);
    $contactId = $contactResponse['result'] ?? null;

    $dealTitle = "$name | $phone | $city | $eventType | $eventDate | $guests гостей | $age лет | $formatMain | $formatTempo | $goalsStr";

    $dealComments =
    "ДАННЫЕ ИЗ QUIZ:\n" .
    "Имя: $name\n" .
    "Телефон: $phone\n" .
    "Город: $city\n" .
    "Тип мероприятия: $eventType\n" .
    "Дата: $eventDate\n" .
    "Гостей: $guests\n" .
    "Средний возраст: $age\n" .
    "Формат основной: $formatMain\n" .
    "Программа: $formatTempo\n" .
    "Цели: $goalsStr";

    $stageId = isset($data['stageId'])
        ? htmlspecialchars($data['stageId'], ENT_QUOTES, 'UTF-8')
        : 'UC_NV0WXG';

    $dealPayload = [
        'fields' => [
            'TITLE' => $dealTitle,
            'CATEGORY_ID' => 0,
            'STAGE_ID' => $stageId,
            'CURRENCY_ID' => 'KZT',
            'OPPORTUNITY' => 0,
            'COMMENTS' => $dealComments
        ]
    ];

    if ($contactId) {
        $dealPayload['fields']['CONTACT_ID'] = $contactId;
    }

    $dealResponse = sendToBitrix($bitrixDomain . '/crm.deal.add.json', $dealPayload);

    if (isset($dealResponse['result'])) {

        // 🔥 Отправляем в Telegram только после успешной сделки
        sendToTelegram($telegramBotToken, $telegramChatId, [
            'name' => $name,
            'phone' => $phone,
            'city' => $city,
            'eventType' => $eventType,
            'eventDate' => $eventDate,
            'guests' => $guests,
            'age' => $age,
            'formatMain' => $formatMain,
            'formatTempo' => $formatTempo,
            'goalsStr' => $goalsStr
        ]);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'dealId' => $dealResponse['result']
        ], JSON_UNESCAPED_UNICODE);

    } else {

        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Ошибка при создании сделки'
        ], JSON_UNESCAPED_UNICODE);
    }

} catch (Throwable $e) {

    error_log('Quiz Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error'
    ], JSON_UNESCAPED_UNICODE);
}
