<?php
function adminBannerForm(string $id,array $row,array $schema): void {
 global $repo;$original=$id?$repo->find('banners',$id):[];$b=bannerDefaults($row);
 $b+=['title'=>'','mode'=>'finance','startAt'=>'2026-10-21T00:00','endAt'=>'2026-12-31T23:59'];
 foreach($schema['fields'] as $key=>$_)$b[$key]=oldValue($key,$b[$key]??'');
 formStart('admin_save',['table'=>'banners','id'=>$id,'expected'=>$id?rowVersion($original):'','listReturn'=>adminListUrl('banners')],'class="admin-panel" data-dirty-form data-banner-editor enctype="multipart/form-data"');
 echo '<div class="admin-edit-section"><h2 class="type-fixed-heading-2">앱 배너 '.($id?'수정':'등록').'</h2><p class="help">프로모션과 상품 상세를 같은 슬라이더에서 운영합니다. 제목은 두 줄 안에서 의미가 전달되도록 작성해 주세요.</p></div><div class="admin-banner-editor">';
 echo '<div>';
 $groups=['문구와 유형'=>['type','eyebrow','title','benefit','description','note'],'이미지와 배경'=>['image','imageAlt','background','imagePreset','imageSource','imageCredit'],'게시·노출 설정'=>['url','mode','order','startAt','endAt','enabled']];
 foreach($groups as $heading=>$keys){echo '<section class="admin-edit-section"><h3 class="type-headline-1 mb-16">'.e($heading).'</h3><div class="admin-form-grid">';
  foreach($keys as $key){[$label,$type]=$schema['fields'][$key];$value=$b[$key]??'';if($type==='datetime-local'&&$value)$value=(new DateTimeImmutable($value))->format('Y-m-d\TH:i');
   $onlyDetail=in_array($key,['benefit','note'],true);echo '<div'.($onlyDetail?' data-banner-detail-field':'').' class="'.(in_array($key,['title','description','image','imageSource','imageCredit'],true)?'full-span':'').'">';
   if(is_array($type))echo selectField($key,$label,$type,$value);elseif($type==='boolean')echo selectField($key,$label,['1'=>'사용','0'=>'사용 안 함'],$value?'1':'0');else echo field($key,$label,$value,$type,['maxlength'=>match($key){'title'=>40,'eyebrow'=>24,'benefit'=>24,'description'=>80,'note'=>32,default=>500}]+(in_array($key,['title','url','image','imageAlt'],true)?['required'=>'required']:[])+($type==='textarea'?['rows'=>2]:[]));
   if($key==='image'){echo '<p class="help">/assets/images/ 안의 파일을 사용하거나 업로드하세요. 상세형은 투명 PNG·WebP 사진이 필요합니다. 이미지를 해제한 배너는 중지 상태로 저장하세요.</p>';adminUploadControl();}
   if($key==='imagePreset')echo '<p class="help">세로형은 병·튜브, 가로형은 상자·세트에 맞춘 이미지 영역입니다.</p>';
   echo '</div>';
  }echo '</div></section>';
 }
 echo '</div><aside class="admin-banner-preview"><h3 class="type-headline-2">모바일 미리보기</h3><p class="help">390px 앱 기준 · 실제 슬라이드와 같은 컴포넌트</p><div class="admin-banner-preview-frame">';bannerSlider([$b],'작성 중인 배너 미리보기',true);echo '</div><p class="help" data-banner-preview-warning role="status"></p><p class="help">상품 사진은 실제 제공 상품과 일치해야 합니다. 스톡 예시는 하단 안내에 예시임을 표시해 주세요.</p></aside></div><div class="admin-edit-section"><div class="row gap-16"><a class="button button--neutral" href="/admin/banners">취소</a><button class="button">변경사항 저장</button></div></div></form>';
}
