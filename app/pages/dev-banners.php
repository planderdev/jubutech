<?php
/** Local regression fixture, using the shipped BannerSlider and reviewed media. */
function bannerPreview(): void {
 $rows=require APP_PATH.'/data/banners.php';$promotion=$rows[0];$detail=$rows[3];
 $promotion['title']="우리 집에 필요한\n생활 지원금 찾아보기";$promotion['description']="달라진 생활에 맞춰\n신청 조건을 확인해요";
 $scenario=$_GET['scenario']??'mixed';
 if($scenario==='wide'){$detail['image']='/assets/images/banners/cream-cutout.webp';$detail['imagePreset']='wide';$detail['title']='뷰티 체험';$detail['benefit']='구성 먼저 확인';$detail['imageAlt']='금색 뚜껑의 크림 용기 스톡 예시';$detail['imageSource']='https://www.magnific.com/kr/free-photo/luxury-cream-jar-with-golden-lid-spatula_425575558.htm';$detail['imageCredit']='Photo: wahyu_t / Magnific';}
 echo '<div class="content-section" data-section-inset><h1 class="type-headline-1 my-16">배너 컴포넌트 검수</h1></div>';
 bannerSlider($scenario==='single'?[$promotion]:[$promotion,$detail],'배너 유형·이미지 검수');
}
