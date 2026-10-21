<?php
// Included only after the common authentication and CSRF checks.
if($action==='admin_logout'){unset($_SESSION['adminDemo']);redirect('/admin/login');}
if($action==='admin_operate'||$action==='admin_bulk'){
 $table=(string)($_POST['table']??'');$op=(string)($_POST['op']??'');$reason=trim((string)($_POST['reason']??''));
 $ids=$action==='admin_operate'?[$id]:($_POST['ids']??[]);if(!is_array($ids)||count($ids)>100)failForm(['general'=>'한 번에 현재 페이지의 최대 100개 항목을 선택해 주세요.'],$return);
 $ids=array_values(array_unique(array_filter($ids,'is_string')));if(!$ids)failForm(['general'=>'처리할 항목을 선택해 주세요.'],$return);
 $result=['table'=>$table,'op'=>$op,'success'=>0,'excluded'=>0,'failed'=>[]];
 foreach($ids as $target){try{$changed=adminMutate($table,$target,$op,$reason,(string)($action==='admin_operate'?($_POST['expected']??''):($_POST['versions'][$target]??'')));$result[$changed?'success':'excluded']++;}catch(DomainException $err){$result['failed'][]=['id'=>$target,'reason'=>$err->getMessage()];}}
 $_SESSION['adminResult']=$result;flash('성공 '.$result['success'].'건 · 제외 '.$result['excluded'].'건 · 실패 '.count($result['failed']).'건');redirect($return);
}
if($action==='admin_reorder'){
 $table=(string)($_POST['table']??'');if(!in_array($table,['categories','banners','checklist']))failForm(['general'=>'순서 변경이 허용되지 않습니다.'],$return);$orders=$_POST['orders']??[];$versions=$_POST['versions']??[];
 if(!is_array($orders)||count($orders)>100)failForm(['general'=>'잘못된 순서 요청입니다.'],$return);
 $pending=[];foreach($orders as $target=>$order){$r=$repo->find($table,(string)$target);if(!$r)failForm(['general'=>'대상이 삭제되었습니다. 목록을 새로고침해 주세요.'],$return);try{adminAssertVersion($r,(string)($versions[$target]??''));}catch(DomainException $err){failForm(['general'=>$err->getMessage()],$return);}if(filter_var($order,FILTER_VALIDATE_INT)===false||$order<0||$order>9999)failForm(['general'=>'순서는 0~9999 정수로 입력해 주세요.'],$return);if(($r['order']??null)!==(int)$order){$r['order']=(int)$order;$pending[]=$r;}}
 foreach($pending as $r){if($table==='checklist')$r['version']=max(array_column($repo->all('checklist'),'version'))+1;$r['adminRevision']=($r['adminRevision']??0)+1;$repo->put($table,$r);adminHistory($table,$r['id'],'노출 순서 변경');}flash('현재 페이지 '.count($pending).'개 항목의 순서를 저장했습니다.');redirect($return);
}
function adminUploadedImage(string $field): ?string {
 if(empty($_FILES[$field])||$_FILES[$field]['error']===UPLOAD_ERR_NO_FILE)return null;$file=$_FILES[$field];
 if($file['error']!==UPLOAD_ERR_OK||$file['size']>5*1024*1024)throw new DomainException('이미지는 5MB 이하 파일로 업로드해 주세요.');
 $dimensions=@getimagesize($file['tmp_name']);$mime=$dimensions['mime']??'';$ext=['image/png'=>'png','image/webp'=>'webp'][$mime]??null;
 if(!$ext||!$dimensions||$dimensions[0]>8000||$dimensions[1]>8000)throw new DomainException('가로·세로 8000px 이하 PNG·WebP 이미지를 선택해 주세요.');
 $dir=dirname(APP_PATH).'/public/assets/images/uploads';if(!is_dir($dir)&&!mkdir($dir,0755,true))throw new DomainException('이미지 저장 폴더를 만들지 못했습니다.');$name=bin2hex(random_bytes(16)).'.'.$ext;
 if(!move_uploaded_file($file['tmp_name'],$dir.'/'.$name))throw new DomainException('파일을 저장하지 못했습니다. 다시 시도해 주세요.');return '/assets/images/uploads/'.$name;
}
