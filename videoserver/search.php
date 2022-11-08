<?php

// Search mp4/mov files for flights.
//
// Usage:
// search.php?date=2019-03-24[&plane=planeid][&session=sessionnumber]

// Configure root folders. Loop subfolders matching 
// date using YEAR and QUARTER placeholders.
$directories = array(
	'/volume1/video/YEAR/QUARTER/'
);

// Other allowed subfolders to navigate to
$subdirectories = ['Footage'];

$path = pathinfo("//{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}");

$base_url = $path['dirname'] . "/dl.php?file=";

if (isset($_GET['date'])) {
	$date = strtotime($_GET['date']);

	$year = date('Y', $date);
	$quarter = ceil(date('m', $date) / 3);

	$files = array_map(
		function($dir) use($year, $quarter) {
			$dir = str_replace('YEAR', $year, $dir);
			$dir = str_replace('QUARTER', $quarter, $dir);

			if(is_dir($dir)) {
				return list_dir($dir);
			}
		},
		$directories);

	$files = array_filter($files, function($file) {
		return !empty($file);
	});

	if(!empty($files)) {
		$files = array_merge(...$files);
	}

	header('Content-Type: application/json');
	header("Access-Control-Allow-Origin: *");
	echo json_encode($files);

} else {
	print("date parameter missing");
	http_response_code(400);
}

function filter_dir($file) {
	global $subdirectories;
	if (in_array($file, $subdirectories)) {
		return true;
	}
	return match_keys($file, ['date' => '']);
}

function filter_file($file) {
	if (match_keys($file, ['date' => '', 'plane' => '', 'session' => 'Session'])) {
		return in_array(substr(strtolower($file), -3), ['mov', 'mp4']);	
	}
	return false;
}

function list_dir($root_dir, $sub_dir = '', $depth=0) {
	$files = scandir($root_dir . $sub_dir);

	if(!$files) {
		return array();
	}

	$files = array_filter($files, function($file) {
		if(in_array($file[0], [".", "@"])) {
			return false;
		} else if(stripos($file, 'Adobe') !== false) {
			return false;
		} else {
			return true;
		}
	});

	$files = array_map(function($file) use($root_dir, $sub_dir) {
		global $base_url;

		$path = $root_dir . $sub_dir . $file;
		if(is_dir($path) && filter_dir($file)) {
			return list_dir($root_dir, $sub_dir . $file . '/', $depth+1);
		} else if(is_file($path) && filter_file($file)) {
			return array($base_url . $path);
		} else {
			return array();
		}
	}, $files);


	if(empty($files)) {
		return $files;
	} else {
		return array_merge(...$files);
	}
}

function match_keys($str, $keys) {

	foreach($keys as $key => $prefix) {
		if (isset($_GET[$key])) {

			if (strlen($prefix) > 0 && stripos($str, $prefix) === false) {
				// not starting with required prefix
				continue;
			}

			if (stripos($str, $prefix . $_GET[$key]) === false) {
				return false;
			}
		}
	}

	return true;
}

?>