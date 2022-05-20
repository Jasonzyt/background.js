<?php

include 'internal.php';

// Handle $_GET
$requirement_str = $_GET['require'] ?? false;
$requirements = explode(',', $requirement_str);
checkAccessToken();

function require_vertical(): bool
{
    global $requirements;
    return in_array('vertical', $requirements);
}
function require_horizontal(): bool
{
    global $requirements;
    return in_array('horizontal', $requirements);
}

chdir('..');
session_start();

if (require_vertical() && require_horizontal()) {
    header('HTTP/1.1 400 Bad Request');
    exit;
}

$files = glob(backgroundDir . '*');
shuffle($files);

foreach ($files as $file) {
    if (is_dir($file)) {
        continue;
    }
    // Check if the file is a valid image
    $fileMime = finfo_file(finfo_open(FILEINFO_MIME_TYPE), $file);
    if (!str_starts_with($fileMime, 'image')) {
        continue;
    }
    // Get the image size
    $imageInfo = getimagesize($file);
    $imageMime = $imageInfo['mime'];
    $imageWidth = $imageInfo[0];
    $imageHeight = $imageInfo[1];

    $imageAspectRatio = $imageWidth / $imageHeight;
    
    if (!require_vertical() && !require_horizontal()) {
        output_img($file, $imageInfo);
    } else if (require_vertical() && $imageAspectRatio < 1) {
        output_img($file, $imageInfo);
    } else if (require_horizontal() && $imageAspectRatio >= 1) {
        output_img($file, $imageInfo);
    }
}