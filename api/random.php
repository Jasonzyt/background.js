<?php

/**
 * @param  $file string  Path to the file to check
 * @return mixed         True if the file is allowed, false otherwise
 */
function parse_backgrounds(string $file = background_location_file): mixed {
    chdir('..');
    $json = file_get_contents($file);
    return json_decode($json, true);
}

/**
 * @param $tags array  The tags of a background
 * @return bool        Whether $tags can meet the $requirements
 */
function check_tags(array $tags) : bool {
    global $requirements;
    foreach ($requirements as $requirement) {
        $found = true;
        foreach ($requirement as $tag) {
            if (!in_array($tag, $tags)) {
                $found = false;
                break;
            }
        }
        if ($found) {
            return true;
        }
    }
    return false;
}

// Handle $_GET
$requirement_str = $_GET['require'] ?? false;

// Parse Requirements
$requirements = [];
if ($requirement_str !== false) {
    foreach (explode(',', $requirement_str) as $requirement) {
        $requirements[] = explode('+', $requirement);
    }
}

// Start the session to store background information
session_start();

// Change CWD to previous dir
chdir('..');

// Parse backgrounds list
$backgrounds = parse_backgrounds();

// Check validity of backgrounds list
if ($backgrounds == null || is_array($backgrounds) === false) {
    exit;
}

// Shuffle backgrounds list
shuffle($backgrounds);

// Find a background that matches the requirements
foreach ($backgrounds as $bg) {
    if ($bg["src"] == null) {
        continue;
    }
    $tags = $bg["tags"] ?? [];
    $image_info = getimagesize($bg["src"]);
    $image_width = $image_info[0];
    $image_height = $image_info[1];
    $image_mime = $image_info['mime'];
    $image_aspect = $image_width / $image_height;
    if ($image_aspect > 1) {
        $tags[] = "horizontal";
    }
    else if ($image_aspect < 1) {
        $tags[] = "vertical";
    }
    else {
        $tags[] = "square";
    }
    if (check_tags($tags)) {
        $_SESSION['current_background'] = [
            'src' => $bg["src"],
            'mime' => $image_mime,
            'width' => $image_width,
            'height' => $image_height,
            'tags' => $tags,
            'copyright' => $bg["copyright"],
        ];
        // Redirect to the background
        header('Location: ' . $bg["src"]);
    }
}