<?php

include 'internal.php';

// Handle $_GET
$path = $_GET['path'] ?? false;
checkAccessToken();
if ($path !== false) {
    $path = backgroundDir . $path;
}

chdir('..');
session_start();
$current = $_SESSION['current_background'] ?? false;

if ($path === false && $current === false) {
    header('HTTP/1.1 400 Bad Request');
    exit;
} else if ($path === false) {
    output_img($current["path"], getimagesize($current["path"]));
} else {
    if (!file_exists($path) || is_dir($path)) {
        header('HTTP/1.1 400 Bad Request');
        exit;
    }
    $info = getimagesize($path);
    output_img($path, $info);
}
