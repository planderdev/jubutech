<?php
/** Read-only fixture; it exercises real HTML without changing demo session data. */
function contentPreview(): void {
 global $isAdmin;if($isAdmin)echo '<div class="admin-user-preview">';contentStart(); ?>
 <nav class="row gap-8 py-16" aria-label="본문 검수 구역"><a class="text-button" href="#prose-hierarchy">제목</a><a class="text-button" href="#prose-lists">목록</a><a class="text-button" href="#prose-media">이미지</a><a class="text-button" href="#prose-table">표</a></nav>
 <article class="post post--flush" aria-label="본문 스타일 검수">
  <h1 id="prose-hierarchy">장보기 전 10분, 생활의 기준을 세워요</h1>
  <p>한 주의 식비를 돌아보는 데 거창한 계획은 필요하지 않아요. 냉장고에 남은 재료부터 살펴보고, 가족이 함께 먹을 메뉴를 정해 보세요.</p>
  <p>이 문단은 두 번째 문단입니다. <strong>작고 꾸준한 실천</strong>을 기록하고, <em>이번 주에 가능한 일</em>을 먼저 골라 보세요. <small>화면 검수용 예시이며 금융·정책 안내가 아닙니다.</small></p>
  <h2>지금 필요한 정보를 확인해요</h2>
  <p>출처가 있는 정보는 <a href="/finance/articles/i2">장보기 루틴 자세히 읽기</a>처럼 링크임을 알 수 있어야 해요. 긴 주소도 본문 폭 안에서 읽을 수 있어요: <a href="https://example.com/jubutech/content-review/very-long-resource-address-without-spaces-abcdefghijklmnopqrstuvwxyz-0123456789?campaign=weekly-review&amp;reference=content-style-validation">https://example.com/jubutech/content-review/very-long-resource-address-without-spaces-abcdefghijklmnopqrstuvwxyz-0123456789?campaign=weekly-review&amp;reference=content-style-validation</a></p>
  <h3>식단을 준비하는 순서</h3><p>큰 제목 아래 소제목은 본문의 흐름과 연결됩니다.</p>
  <h4>자주 쓰는 재료부터</h4><p>제목과 본문 사이에는 한 번의 간격만 적용합니다.</p>
  <h5>보관 방법 메모</h5><p>짧은 메모도 기본 본문 크기를 유지합니다.</p>
  <h6>확인한 날짜</h6><p>2026년 10월 21일에 작성한 검수용 콘텐츠입니다.</p>
  <h2 id="prose-lists">이번 주 체크할 목록</h2>
  <ul><li>냉장고에 남은 재료를 확인해요.<ul><li>채소는 보관 상태를 살펴요.</li><li>유통기한을 먼저 확인해요.<ol><li>날짜가 빠른 순서로 정리해요.</li><li>사용할 메뉴에 연결해요.</li></ol></li></ul></li><li>필요한 양만 장보기 목록에 적어요.</li></ul>
  <ol><li><p>이번 주 메뉴 두 가지를 정해요.</p><p>한 가지 재료를 여러 메뉴에 쓸 수 있는지 살펴요.</p></li><li>목록과 실제 사용량을 비교해요.<ul><li>남은 재료는 다음 기록에 반영해요.</li></ul></li></ol>
  <dl><dt>기록 기준</dt><dd>금액과 함께 필요했던 이유를 적어요.</dd><dt>돌아볼 시점</dt><dd>일주일 뒤에 계획과 실제 사용을 비교해요.</dd></dl>
  <blockquote><p>작은 기록이 모이면 나에게 맞는 기준이 보여요.</p><p>완벽한 기록보다 이어가는 기록을 선택해 보세요.</p></blockquote>
  <hr class="hr">
  <h2 id="prose-media">이미지와 설명도 한 흐름으로</h2>
  <figure><img src="/assets/images/groceries.webp" alt="장보기 전에 비교할 수 있는 채소 진열대" width="1440" height="1024" loading="lazy" decoding="async"><figcaption>장보기 참고 이미지 · <a href="https://unsplash.com/photos/bunch-of-vegetables-D6Tu_L3chLE">nrd / Unsplash</a></figcaption></figure>
  <h2 id="prose-table">일주일 계획 비교</h2>
  <table><caption>요일별 식단과 준비 계획</caption><thead><tr><th scope="col">구분</th><th scope="col">월요일</th><th scope="col">화요일</th><th scope="col">수요일</th><th scope="col">목요일</th><th scope="col">금요일</th></tr></thead><tbody><tr><th scope="row">메뉴</th><td>채소 볶음밥</td><td>두부 샐러드</td><td>남은 재료 활용</td><td>버섯 덮밥</td><td>가족과 함께 정하기</td></tr><tr><th scope="row">확인할 것</th><td>냉장고 재료</td><td>필요한 양</td><td>보관 상태</td><td>다음 주 목록</td><td>기록 돌아보기</td></tr></tbody></table>
  <p>표의 내용이 넓으면 표 영역 안에서 좌우로 확인할 수 있습니다.</p>
  <h2>본문 링크와 조작 요소의 구분</h2>
  <p><a href="/finance/articles/i2">본문 링크</a>와 <a class="button button--weak" href="/finance/categories">정보 목록</a>은 서로 다른 역할로 표시합니다.</p>
  <a class="card card--group card--interactive" href="/finance/articles/i2"><div class="card__body">카드 전체 링크 · 본문용 밑줄 없음</div></a>
  <nav aria-label="본문 안 메뉴 예시"><ul class="list"><li><a class="text-button" href="/finance">재테크 홈</a></li><li><a class="text-button" href="/journal">매매일지</a></li></ul></nav>
  <p>마지막 문단 뒤에는 불필요한 바깥 여백이 붙지 않습니다.</p>
 </article>
 <?php contentEnd();if($isAdmin)echo '</div>';
}
