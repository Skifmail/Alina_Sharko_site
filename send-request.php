<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

function env_value(string $name, string $default = ''): string
{
    $value = getenv($name);
    if ($value === false || $value === null) {
        // Some hosting setups populate values in $_SERVER/$_ENV when using SetEnv in .htaccess.
        $value = $_SERVER[$name] ?? ($_ENV[$name] ?? null);
    }

    if ($value === false || $value === null) {
        return $default;
    }

    return (string)$value;
}

define('SMTP_HOST', env_value('SMTP_HOST', 'smtp.spaceweb.ru'));
define('SMTP_PORT', (int)env_value('SMTP_PORT', '465'));
define('SMTP_ENCRYPTION', env_value('SMTP_ENCRYPTION', 'ssl'));
define('SMTP_USERNAME', env_value('SMTP_USERNAME', 'info@ostorozhno-detali.ru'));
define('SMTP_PASSWORD', env_value('SMTP_PASSWORD', ''));
define('SMTP_FROM_EMAIL', env_value('SMTP_FROM_EMAIL', 'info@ostorozhno-detali.ru'));
define('SMTP_FROM_NAME', env_value('SMTP_FROM_NAME', 'ОСТОРОЖНО!!! ДЕТАЛИ!!!'));

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'error' => 'Method Not Allowed',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody ?: '', true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'Некорректные данные заявки',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function sanitize_text($value): string {
    return trim((string)($value ?? ''));
}

function normalize_budget(string $budget): string {
    $digits = preg_replace('/\D+/', '', $budget);
    if ($digits === null || $digits === '') {
        return '';
    }

    return number_format((int)$digits, 0, '', ' ') . ' ₽';
}

function smtp_expect($socket, array $codes): array {
    $response = '';

    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (isset($line[3]) && $line[3] === ' ') {
            break;
        }
    }

    $statusCode = (int)substr($response, 0, 3);
    if (!in_array($statusCode, $codes, true)) {
        throw new RuntimeException(trim($response) !== '' ? trim($response) : 'Unknown SMTP error');
    }

    return [$statusCode, trim($response)];
}

function smtp_command($socket, string $command, array $codes): array {
    fwrite($socket, $command . "\r\n");
    return smtp_expect($socket, $codes);
}

function smtp_send_mail(string $to, string $subject, string $body, string $replyTo): array {
    if (SMTP_PASSWORD === '') {
        return [
            'ok' => false,
            'error' => 'Не задан SMTP_PASSWORD (переменная окружения)',
        ];
    }

    $transport = SMTP_ENCRYPTION === 'ssl' ? 'ssl://' . SMTP_HOST : SMTP_HOST;
    $socket = @fsockopen($transport, SMTP_PORT, $errorNumber, $errorString, 15);

    if (!$socket) {
        return [
            'ok' => false,
            'error' => 'Не удалось подключиться к SMTP: ' . $errorString . ' (' . $errorNumber . ')',
        ];
    }

    stream_set_timeout($socket, 15);

    try {
        smtp_expect($socket, [220]);
        smtp_command($socket, 'EHLO ' . ($_SERVER['HTTP_HOST'] ?? 'localhost'), [250]);
        smtp_command($socket, 'AUTH LOGIN', [334]);
        smtp_command($socket, base64_encode(SMTP_USERNAME), [334]);
        smtp_command($socket, base64_encode(SMTP_PASSWORD), [235]);
        smtp_command($socket, 'MAIL FROM:<' . SMTP_FROM_EMAIL . '>', [250]);
        smtp_command($socket, 'RCPT TO:<' . $to . '>', [250, 251]);
        smtp_command($socket, 'DATA', [354]);

        $headers = [
            'Date: ' . date(DATE_RFC2822),
            'From: ' . SMTP_FROM_NAME . ' <' . SMTP_FROM_EMAIL . '>',
            'To: <' . $to . '>',
            'Reply-To: ' . $replyTo,
            'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
        ];

        $message = implode("\r\n", $headers) . "\r\n\r\n" . str_replace("\n.", "\n..", $body) . "\r\n.";
        fwrite($socket, $message . "\r\n");
        smtp_expect($socket, [250]);
        smtp_command($socket, 'QUIT', [221]);
        fclose($socket);

        return ['ok' => true];
    } catch (RuntimeException $exception) {
        fclose($socket);

        return [
            'ok' => false,
            'error' => $exception->getMessage(),
        ];
    }
}

$phone = sanitize_text($payload['phone'] ?? '');
$eventDate = sanitize_text($payload['eventDate'] ?? '');
$email = sanitize_text($payload['email'] ?? '');
$budget = normalize_budget((string)($payload['budget'] ?? ''));
$comments = sanitize_text($payload['comments'] ?? '');

if ($phone === '' || $eventDate === '' || $email === '' || $budget === '') {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'error' => 'Не заполнены обязательные поля',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'error' => 'Некорректный email',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$to = '108lav@gmail.com';
$subject = 'Новая заявка с сайта ostorozhno-detali.ru';
$mailLines = [
    'Новая заявка с сайта ostorozhno-detali.ru',
    '',
    'Телефон: ' . $phone,
    'Дата мероприятия: ' . $eventDate,
    'Email: ' . $email,
    'Бюджет: ' . $budget,
];

if ($comments !== '') {
    $mailLines[] = 'Комментарий: ' . $comments;
}

$mailBody = implode("\n", $mailLines);
$mailResult = smtp_send_mail($to, $subject, $mailBody, $email);
$mailSent = $mailResult['ok'] ?? false;

$telegramBotToken = getenv('TELEGRAM_BOT_TOKEN') ?: '';
$telegramChatId = '847497161';
$telegramSent = false;
$telegramError = null;

if ($telegramBotToken !== '' && $telegramChatId !== '') {
    $telegramLines = [
        '<b>📋 Новая заявка с сайта ostorozhno-detali.ru</b>',
        '',
        '<b>📱 Телефон:</b> ' . htmlspecialchars($phone, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        '<b>📅 Дата мероприятия:</b> ' . htmlspecialchars($eventDate, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        '<b>📧 Email:</b> ' . htmlspecialchars($email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        '<b>💰 Бюджет:</b> ' . htmlspecialchars($budget, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
    ];

    if ($comments !== '') {
        $telegramLines[] = '<b>💬 Комментарий:</b> ' . htmlspecialchars($comments, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    $telegramPayload = json_encode([
        'chat_id' => $telegramChatId,
        'text' => implode("\n", $telegramLines),
        'parse_mode' => 'HTML',
    ], JSON_UNESCAPED_UNICODE);

    $telegramContext = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $telegramPayload ?: '{}',
            'ignore_errors' => true,
            'timeout' => 10,
        ],
    ]);

    $telegramResponse = @file_get_contents(
        'https://api.telegram.org/bot' . $telegramBotToken . '/sendMessage',
        false,
        $telegramContext
    );

    if ($telegramResponse !== false) {
        $telegramDecoded = json_decode($telegramResponse, true);
        $telegramSent = is_array($telegramDecoded) && !empty($telegramDecoded['ok']);
        if (!$telegramSent) {
            $telegramError = 'Telegram API returned an error';
        }
    } else {
        $telegramError = 'Telegram request failed';
    }
}

if (!$mailSent) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Не удалось отправить письмо',
        'mail_error' => $mailResult['error'] ?? null,
        'telegram_sent' => $telegramSent,
        'telegram_error' => $telegramError,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'ok' => true,
    'mail_sent' => true,
    'telegram_sent' => $telegramSent,
], JSON_UNESCAPED_UNICODE);
