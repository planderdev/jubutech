<?php
// Shared admin forms use explicit entity and field allowlists.
$adminSchemas = [
 'articles'=>['title'=>'재테크 콘텐츠','icon'=>'newspaper','fields'=>['title'=>['제목','text'],'categoryId'=>['카테고리','category'],'summary'=>['요약','textarea'],'thumbnail'=>['대표 이미지 경로','text'],'body'=>['본문','textarea'],'source'=>['출처','text'],'sourceUrl'=>['출처 링크','url'],'publishedAt'=>['게시일','datetime-local'],'status'=>['게시 상태',['draft'=>'초안','published'=>'게시','hidden'=>'비공개']],'placement'=>['노출 위치',['list'=>'목록','featured'=>'편집 추천']]]],
 'categories'=>['title'=>'카테고리','icon'=>'list','fields'=>['name'=>['명칭','text'],'order'=>['순서','number'],'enabled'=>['사용 여부','boolean']]],
 'campaigns'=>['title'=>'체험단','icon'=>'gift','fields'=>['title'=>['캠페인명','text'],'brand'=>['브랜드','text'],'categoryId'=>['카테고리',['식품'=>'식품','육아'=>'육아','생활'=>'생활','반려생활'=>'반려생활','방문'=>'방문','설문'=>'설문']],'description'=>['소개','textarea'],'benefit'=>['제공 내역','text'],'capacity'=>['모집 인원','number'],'channel'=>['후기 채널','text'],'image'=>['대표 이미지',['food'=>'식품','lotion'=>'로션','survey'=>'설문','pet'=>'반려생활','home'=>'생활','cup'=>'컵','bread'=>'베이커리','soap'=>'세제']],'recruitmentStartAt'=>['모집 시작','datetime-local'],'recruitmentEndAt'=>['모집 종료','datetime-local'],'announcementAt'=>['선정 발표','datetime-local'],'reviewDueAt'=>['후기 마감','datetime-local'],'exposureStartAt'=>['노출 시작','datetime-local'],'exposureEndAt'=>['노출 종료','datetime-local'],'missions'=>['미션 (한 줄에 하나)','textarea'],'questions'=>['추가 질문 (한 줄에 하나)','textarea'],'conditions'=>['신청 조건','textarea'],'shipping'=>['배송형 캠페인','boolean'],'publicationStatus'=>['게시 상태',['draft'=>'초안','published'=>'게시','hidden'=>'숨김']]]],
 'notices'=>['title'=>'공지사항','icon'=>'megaphone','fields'=>['title'=>['제목','text'],'body'=>['본문','textarea'],'pinned'=>['상단 고정','boolean'],'status'=>['게시 상태',['draft'=>'초안','published'=>'게시','hidden'=>'비공개']]]],
 'banners'=>['title'=>'배너·노출','icon'=>'panels-top-left','fields'=>[
  'type'=>['배너 유형',['promotion'=>'A · 프로모션','detail'=>'B · 상품·혜택 상세']],
  'eyebrow'=>['강조 문구','text'],'title'=>['배너 제목','textarea'],'benefit'=>['핵심 금액 또는 혜택','text'],'description'=>['보조 설명','textarea'],'note'=>['하단 안내','text'],
  'image'=>['이미지 경로','text'],'imageAlt'=>['이미지 대체 텍스트','text'],'background'=>['배경 스타일',['white'=>'화이트','sky'=>'옅은 블루','mint'=>'옅은 민트','sand'=>'옅은 샌드','rose'=>'옅은 핑크']],
  'imagePreset'=>['이미지 크기·위치',['promotion'=>'프로모션 그래픽','tall'=>'세로형 상품','wide'=>'가로형 상품']],
  'imageSource'=>['이미지 출처 URL','url'],'imageCredit'=>['이미지 저작자 표시','text'],
  'url'=>['앱 내부 연결 경로','text'],'mode'=>['대상 서비스',['finance'=>'재테크 정보','journal'=>'주식매매일지','campaigns'=>'체험단 응모']],
  'order'=>['노출 순서','number'],'startAt'=>['노출 시작','datetime-local'],'endAt'=>['노출 종료','datetime-local'],'enabled'=>['노출 여부','boolean']
 ]],
 'checklist'=>['title'=>'체크리스트 템플릿','icon'=>'clipboard-check','fields'=>['title'=>['항목명','text'],'help'=>['점검 도움말','textarea'],'order'=>['순서','number'],'enabled'=>['사용 여부','boolean']]],
 'settings'=>['title'=>'운영 설정','icon'=>'settings','fields'=>['financeIntro'=>['재테크 홈 안내','textarea'],'journalIntro'=>['매매일지 안내','text'],'campaignsIntro'=>['체험단 홈 안내','textarea'],'defaultCategory'=>['기본 카테고리','category']]],
 'applications'=>['title'=>'응모·당첨자 선정','icon'=>'users'], 'reviews'=>['title'=>'리뷰 검수','icon'=>'clipboard-check'], 'members'=>['title'=>'회원 관리','icon'=>'user-round'], 'inquiries'=>['title'=>'문의 관리','icon'=>'message-circle'], 'posts'=>['title'=>'게시글 관리','icon'=>'messages-square'], 'comments'=>['title'=>'댓글 관리','icon'=>'message-circle'], 'reports'=>['title'=>'신고 관리','icon'=>'shield-check'], 'points'=>['title'=>'포인트 내역','icon'=>'wallet'], 'exchanges'=>['title'=>'교환 신청','icon'=>'coffee']
];
