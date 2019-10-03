<?php

// Stream videos for video player
//
// Usage:
// dl.php?file=/absolute/path/to/file

if (!isset($_GET['file'])) {
	http_response_code(400);
	return;
}

header("Content-Type: video/mp4");

$file = $_GET['file']; 
$size  = filesize($file);

// Open file in binary mode
$fp = fopen($file, 'rb');
if(!$fp) {
	die('Failed to open file ' . $file);
}

if (isset($_SERVER['HTTP_RANGE'])) {

	// Parse field value
    list($specifier, $value) = explode('=', $_SERVER['HTTP_RANGE']);
 
    // Can only handle bytes range specifier
    if ($specifier != 'bytes') {
        header('HTTP/1.1 400 Bad Request');
        return;
    }
 
    // Set start/finish bytes
    list($from, $to) = explode('-', $value);
    if (!$to) {
        $to = $size - 1;
    }
 
    // Response header
    header('HTTP/1.1 206 Partial Content');
    header('Accept-Ranges: bytes');
 
    // Response size
    header('Content-Length: ' . ($to - $from + 1));
 
    // Range being sent in the response
    header("Content-Range: bytes {$from}-{$to}/{$size}");
 
    // Advance to start byte
    fseek($fp, $from);
} else {
    header('Content-Length: ' . $size);

    $from = 0;
    $to = $size - 1;
}  

$chunkSize = 8192; // Read in 8kb blocks

// Send the data
while(true){
    // Check if all bytes have been sent
    if(ftell($fp) >= $to){
        break;
    }

    // Send data
    echo fread($fp, $chunkSize);

    // Flush buffer
    ob_flush();
    flush();
}

?>