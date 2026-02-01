<?php

require __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// API ключ Bitrix24 (скрыт от фронтенда)
$bitrixApiKey = $_ENV['BITRIX_API_KEY'];
$bitrixDomain = 'https://chotamshow.bitrix24.kz/rest/1/' . $bitrixApiKey;
// Отключаем вывод ошибок для production (ошибки будут в логах)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Устанавливаем заголовки
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Определяем метод запроса
$requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN');

// Обработка preflight OPTIONS запроса для CORS
if ($requestMethod === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Получаем данные из тела запроса
$input = file_get_contents('php://input');
$hasRequestBody = ($input !== false && $input !== '' && strlen(trim($input)) > 0);

// Если есть данные в теле запроса - обрабатываем как POST (независимо от REQUEST_METHOD)
// Это помогает обойти проблемы с определением метода на некоторых серверах
if (!$hasRequestBody) {
    // Если нет данных в теле запроса и метод не POST - ошибка
    if ($requestMethod !== 'POST') {
        http_response_code(405);
        echo json_encode([
            'success' => false, 
            'error' => 'Method not allowed. Use POST method with JSON body.',
            'received_method' => $requestMethod
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    // Если метод POST, но нет данных - тоже ошибка
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Empty request body'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$data = json_decode($input, true);

// Валидация данных
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'error' => 'Invalid JSON data: ' . json_last_error_msg()
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid data format'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Проверяем обязательные поля
$requiredFields = ['name', 'phone', 'eventType', 'eventDate'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || trim($data[$field]) === '') {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'error' => "Missing required field: $field"
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}

// Извлекаем данные
$name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
$phone = htmlspecialchars($data['phone'], ENT_QUOTES, 'UTF-8');
$eventType = htmlspecialchars($data['eventType'], ENT_QUOTES, 'UTF-8');
$eventDate = htmlspecialchars($data['eventDate'], ENT_QUOTES, 'UTF-8');
$guests = isset($data['guests']) ? htmlspecialchars($data['guests'], ENT_QUOTES, 'UTF-8') : '0';
$age = isset($data['age']) ? htmlspecialchars($data['age'], ENT_QUOTES, 'UTF-8') : 'Не указано';
$formatMain = isset($data['formatMain']) ? htmlspecialchars($data['formatMain'], ENT_QUOTES, 'UTF-8') : 'Не выбрано';
$formatTempo = isset($data['formatTempo']) ? htmlspecialchars($data['formatTempo'], ENT_QUOTES, 'UTF-8') : '';
$selectedGoals = isset($data['selectedGoals']) && is_array($data['selectedGoals']) ? $data['selectedGoals'] : [];
$goalsStr = !empty($selectedGoals) ? implode(', ', array_map(function($goal) {
    return htmlspecialchars($goal, ENT_QUOTES, 'UTF-8');
}, $selectedGoals)) : 'Не указано';

// Функция для отправки запроса в Bitrix24
function sendToBitrix($url, $payload) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json; charset=utf-8'
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        error_log('Bitrix24 cURL error: ' . $error);
        return ['error' => $error, 'http_code' => $httpCode];
    }
    
    if ($httpCode !== 200) {
        error_log('Bitrix24 HTTP error: ' . $httpCode . ' Response: ' . $response);
        return ['error' => 'HTTP error: ' . $httpCode, 'http_code' => $httpCode, 'raw_response' => $response];
    }
    
    $decoded = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log('Bitrix24 JSON decode error: ' . json_last_error_msg() . ' Response: ' . $response);
        return ['error' => 'Invalid JSON response: ' . json_last_error_msg(), 'http_code' => $httpCode, 'raw_response' => $response];
    }
    
    return $decoded;
}

try {
    // 1. Создаем контакт
    $contactPayload = [
        'fields' => [
            'NAME' => $name,
            'PHONE' => [['VALUE' => $phone, 'VALUE_TYPE' => 'MOBILE']]
        ]
    ];
    
    // 1. Создаем контакт
    $contactResponse = sendToBitrix($bitrixDomain . '/crm.contact.add.json', $contactPayload);
    $contactId = null;
    $contactCreated = false;
    
    if (isset($contactResponse['result']) && $contactResponse['result']) {
        $contactId = $contactResponse['result'];
        $contactCreated = true;
        error_log('Bitrix24 Contact created successfully: ' . $contactId);
    } else {
        $contactError = isset($contactResponse['error']) ? $contactResponse['error'] : 'Unknown error';
        error_log('Bitrix24 Contact creation error: ' . json_encode($contactResponse, JSON_UNESCAPED_UNICODE));
        // Продолжаем создание сделки даже если контакт не создался
    }
    
    // 2. Создаем сделку (даже если контакт не создался)
    $dealTitle = "$name | $phone | $eventType | $eventDate | $guests гостей | $age лет | $formatMain | $formatTempo | $goalsStr";
    $dealComments = "📋 ДАННЫЕ ИЗ QUIZ:\nИмя: $name\nТелефон: $phone\nТип мероприятия: $eventType\nДата: $eventDate\nГостей: $guests\nСредний возраст: $age\nФормат основной: $formatMain\nПрограмма: $formatTempo\nЦели: $goalsStr";
    
    // STAGE_ID для новой сделки (по умолчанию UC_NV0WXG)
    $stageId = isset($data['stageId']) ? htmlspecialchars($data['stageId'], ENT_QUOTES, 'UTF-8') : 'UC_NV0WXG';
    
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
    
    // Добавляем CONTACT_ID только если контакт был создан
    if ($contactId) {
        $dealPayload['fields']['CONTACT_ID'] = $contactId;
    }
    
    $dealResponse = sendToBitrix($bitrixDomain . '/crm.deal.add.json', $dealPayload);
    
    if (isset($dealResponse['result']) && $dealResponse['result']) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Заявка успешно отправлена в Bitrix24',
            'contactId' => $contactId,
            'contactCreated' => $contactCreated,
            'dealId' => $dealResponse['result']
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        $errorDetails = isset($dealResponse['error']) ? $dealResponse['error'] : (isset($dealResponse['error_description']) ? $dealResponse['error_description'] : 'Unknown error');
        $errorCode = isset($dealResponse['error']) ? $dealResponse['error'] : '';
        error_log('Bitrix24 Deal creation error: ' . json_encode($dealResponse, JSON_UNESCAPED_UNICODE));
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Ошибка при создании сделки в Bitrix24',
            'error_code' => $errorCode,
            'details' => $errorDetails,
            'contact_created' => $contactCreated
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
    
} catch (Exception $e) {
    error_log('Quiz PHP Error: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Внутренняя ошибка сервера',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Error $e) {
    error_log('Quiz PHP Fatal Error: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Критическая ошибка сервера',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
?>
