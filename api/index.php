<?php
/**
 * Vercel(vercel-php) 진입점 — 검토용 배포 전용. public/index.php 와 같은 역할(bootstrap → routes).
 * 모든 비정적 요청이 vercel.json rewrites 로 여기로 온다. public/*.php 는 .vercelignore 로 정적 업로드에서 제외.
 * 서버리스 제약: 세션은 /tmp(인스턴스별), 관리자 이미지 업로드는 동작하지 않는다(읽기 전용 파일시스템).
 */
declare(strict_types=1);
ini_set('session.save_path', '/tmp');
$_SERVER['HTTPS'] = 'on';
require dirname(__DIR__) . '/app/bootstrap.php';
require APP_PATH . '/routes.php';
