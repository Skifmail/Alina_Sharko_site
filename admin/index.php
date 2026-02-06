<?php
session_start();
if (!empty($_SESSION['admin'])) {
    header('Location: panel.php');
    exit;
}
$error = isset($_GET['error']);
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вход в админ-панель</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
        .box { background: #2d2d2d; padding: 2rem; border-radius: 12px; border: 1px solid #b30000; width: 100%; max-width: 360px; }
        h1 { margin: 0 0 1.5rem; font-size: 1.25rem; color: #b30000; }
        label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; }
        input[type="text"], input[type="password"] { width: 100%; padding: 10px 12px; margin-bottom: 1rem; border: 1px solid #555; border-radius: 6px; background: #1a1a1a; color: #fff; }
        button { width: 100%; padding: 12px; background: #b30000; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; }
        button:hover { background: #d40000; }
        .error { color: #ff6b6b; margin-bottom: 1rem; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="box">
        <h1>Вход в админ-панель</h1>
        <?php if ($error): ?><p class="error">Неверный логин или пароль.</p><?php endif; ?>
        <form method="post" action="auth.php">
            <label>Логин</label>
            <input type="text" name="login" required autocomplete="username">
            <label>Пароль</label>
            <input type="password" name="pass" required autocomplete="current-password">
            <button type="submit">Войти</button>
        </form>
    </div>
</body>
</html>
