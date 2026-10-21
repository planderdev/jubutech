<?php
declare(strict_types=1);
final class DemoRepository {
 public function __construct() { if (!isset($_SESSION['demo']) || ($_SESSION['demo']['meta']['version'] ?? 0)!==1) $this->reset();$this->migrateFixtures(); }
 private function migrateFixtures(): void {
  if(empty($_SESSION['demo']['meta']['bannerSliderSeeded'])){
   foreach(require APP_PATH.'/data/banners.php' as $banner)if(!$this->find('banners',$banner['id']))$this->put('banners',$banner);
   $_SESSION['demo']['meta']['bannerSliderSeeded']=true;
  }
  if(empty($_SESSION['demo']['meta']['financeBannerArtwork20261022'])){
   // Refresh the two original finance illustrations without resetting edited copy,
   // links, visibility or banners whose artwork has already been customized.
   $oldImages=['home-finance-support'=>'support-envelope.svg','home-finance-card'=>'benefit-coupons.svg'];
   foreach(require APP_PATH.'/data/banners.php' as $banner){
    if(!isset($oldImages[$banner['id']]))continue;
    $row=$this->find('banners',$banner['id']);
    if($row&&($row['image']??'')==='/assets/images/banners/'.$oldImages[$banner['id']]){
     foreach(['image','imageAlt','background'] as $key)$row[$key]=$banner[$key];
     $this->put('banners',$row);
    }
   }
   $_SESSION['demo']['meta']['financeBannerArtwork20261022']=true;
  }
  if(!empty($_SESSION['demo']['meta']['timelineFixed']))return;
  // Repair only the three unchanged seeded timestamps; preserve user-created
  // records, edited dates, selections, answers, and every other session table.
  foreach(['a1'=>['cp5','2026-10-14T10:00:00+09:00'],'a5'=>['cp8','2026-10-08T10:00:00+09:00'],'a6'=>['cp8','2026-10-08T10:00:00+09:00']] as $id=>[$campaign,$at]){
   $row=$this->find('applications',$id);
   if($row&&$row['campaignId']===$campaign&&$row['appliedAt']==='2026-10-19T10:00:00+09:00'){$row['appliedAt']=$at;$this->put('applications',$row);}
  }
  $_SESSION['demo']['meta']['timelineFixed']=true;
 }
 public function reset(): void { $_SESSION['demo']=require APP_PATH.'/data/fixtures.php'; $_SESSION['member']='m1'; }
 public function all(string $table): array {
  $rows=$_SESSION['demo'][$table] ?? [];
  if(in_array($table,['categories','checklist','banners']))usort($rows,fn($a,$b)=>($a['order']??0)<=>($b['order']??0));
  if($table==='notices')usort($rows,fn($a,$b)=>((int)$b['pinned']<=>(int)$a['pinned'])?:(strtotime($b['createdAt'])<=>strtotime($a['createdAt'])));
  if($table==='posts')usort($rows,fn($a,$b)=>strtotime($b['createdAt'])<=>strtotime($a['createdAt']));
  return $rows;
 }
 public function find(string $table,string $id): ?array { foreach($this->all($table) as $row) if (($row['id']??null)===$id) return $row; return null; }
 public function put(string $table,array $row): string { $row['id']??=substr($table,0,2).'_'.bin2hex(random_bytes(5)); foreach($_SESSION['demo'][$table]??[] as $i=>$existing) if(($existing['id']??'')===$row['id']) { $_SESSION['demo'][$table][$i]=$row; return $row['id']; } $_SESSION['demo'][$table][]=$row; return $row['id']; }
 public function remove(string $table,string $id): void { $_SESSION['demo'][$table]=array_values(array_filter($this->all($table),fn($r)=>$r['id']!==$id)); }
 public function set(string $table,array $data): void { $_SESSION['demo'][$table]=$data; }
 public function now(): DateTimeImmutable { return new DateTimeImmutable($_SESSION['demo']['meta']['now']); }
 public function member(): ?array { return $this->find('members',$_SESSION['member']??''); }
 public function mine(string $table): array { return array_values(array_filter($this->all($table), fn($r)=>($r['memberId']??'')===($_SESSION['member']??''))); }
 public function log(string $text): void { $this->put('activity',['text'=>$text,'createdAt'=>$this->now()->format(DATE_ATOM)]); }
 public function visibleArticle(array $a): bool { return $a['status']==='published' && strtotime($a['publishedAt'])<=$this->now()->getTimestamp(); }
 public function visibleCampaign(array $c): bool { $now=$this->now()->getTimestamp(); return $c['publicationStatus']==='published' && strtotime($c['exposureStartAt'])<=$now && strtotime($c['exposureEndAt'])>=$now; }
 public function campaignState(array $c): string { $now=$this->now()->getTimestamp(); return $now<strtotime($c['recruitmentStartAt'])?'upcoming':($now>strtotime($c['recruitmentEndAt'])?'closed':'open'); }
 public function application(string $campaignId): ?array { foreach($this->mine('applications') as $a) if($a['campaignId']===$campaignId && $a['selectionStatus']!=='cancelled') return $a; return null; }
 public function review(string $applicationId): ?array { foreach($this->all('reviews') as $r) if($r['applicationId']===$applicationId) return $r; return null; }
 public function notify(string $memberId,string $title,string $url,string $mode): void { $this->put('notifications', ['memberId'=>$memberId,'title'=>$title,'body'=>'변경된 내용을 확인해 주세요.','url'=>$url,'mode'=>$mode,'read'=>false,'createdAt'=>$this->now()->format('Y-m-d')]); }
}
