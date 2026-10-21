<?php
declare(strict_types=1);
define('APP_PATH', __DIR__);
date_default_timezone_set('Asia/Seoul');
ini_set('session.use_strict_mode', '1');
session_name('jubutech_demo');
session_set_cookie_params(['httponly'=>true, 'samesite'=>'Lax', 'secure'=>!empty($_SERVER['HTTPS'])]);
session_start();
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header("Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
header('Cache-Control: no-store');
require APP_PATH . '/repositories/DemoRepository.php';
require APP_PATH . '/helpers.php';
require APP_PATH . '/interactions.php';
require APP_PATH . '/media.php';
require APP_PATH . '/campaign-detail-content.php';
require APP_PATH . '/content.php';
require APP_PATH . '/banners.php';
require APP_PATH . '/admin-workflow.php';
$repo = new DemoRepository();
$_SESSION['csrf'] ??= bin2hex(random_bytes(24));
$path = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/') ?: '/';
$mode = str_starts_with($path, '/journal') ? 'journal' : ((str_starts_with($path, '/campaigns') || str_starts_with($path, '/applications')) ? 'campaigns' : (in_array($_GET['mode'] ?? '', ['finance','journal','campaigns']) ? $_GET['mode'] : 'finance'));
if(str_starts_with($path,'/community'))$mode='finance';
$isAdmin = str_starts_with($path, '/admin');
$errors = $_SESSION['errors'] ?? []; $old = $_SESSION['old'] ?? [];
unset($_SESSION['errors'], $_SESSION['old']);
if ($_SERVER['REQUEST_METHOD'] === 'POST') { require APP_PATH . '/actions.php'; exit; }
