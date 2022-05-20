<?php

include '../config.php';

use JetBrains\PhpStorm\NoReturn;

function checkAccessToken() : void
{
    if (accessTokens != null) { // If access tokens are set
        $token = $_GET['token'] ?? false;
        if ($token === false) {
            $token = base64_decode($_SERVER['HTTP_AUTHORIZATION'] ?? '');
            if ($token === '') $token = false;
        }
        if ($token === false || !in_array($token, accessTokens)) {
            header('HTTP/1.1 401 Unauthorized');
            exit;
        }
    }
}

#[NoReturn]
function output_img($path, $info): void
{
    header('Content-Type: ' . $info['mime']);
    $_SESSION['current_background'] = [
        'path' => $path,
        'mime' => $info['mime'],
        'width' => $info[0],
        'height' => $info[1],
    ];
    readfile($path);
    exit();
}