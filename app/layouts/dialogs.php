<dialog id="confirm-dialog" class="dialog dialog--confirm" aria-labelledby="confirm-title"><div class="dialog__header"><h2 id="confirm-title">진행하기 전에 확인해 주세요</h2></div><div class="dialog__body"><p id="confirm-copy"></p></div><div class="action-area"><button class="button button--neutral" data-close>돌아가기</button><button class="button" id="confirm-proceed">계속하기</button></div></dialog>
<dialog id="leave-dialog" class="dialog dialog--confirm" aria-labelledby="leave-title"><div class="dialog__header"><h2 id="leave-title">작성 중인 내용이 있어요</h2></div><div class="dialog__body"><p>이동하면 저장하지 않은 내용이 사라져요. 작성을 계속할까요?</p></div><div class="action-area"><button class="button button--neutral" data-close>계속 작성</button><button class="button" id="leave-proceed">저장없이 이동</button></div></dialog>
<?php
$feedback=null;$undo=$_SESSION['undo']??null;
if($errors)$feedback=['kind'=>'error','message'=>implode(' ',array_unique(array_values($errors))),'action'=>$old['action']??''];
elseif(isset($_SESSION['flash']))$feedback=['kind'=>'status','message'=>$_SESSION['flash'],'undo'=>(bool)$undo];
elseif($undo&&in_array($path,['/journal/entries','/community'])&&($undo['row']['memberId']??'')===($_SESSION['member']??''))$feedback=['kind'=>'status','message'=>'직전 삭제를 복구할 수 있어요. '.($undo['row']['stockName']??$undo['row']['title']??''),'undo'=>true,'undoLabel'=>'삭제 되돌리기'];
unset($_SESSION['flash']);
if($feedback): ?>
<div class="toast-region<?=$isAdmin?'':' toast-region--above'?>" data-feedback-fallback><div class="toast" data-feedback-message data-kind="<?=$feedback['kind']?>" data-form-action="<?=e($feedback['action']??'')?>" role="<?=$feedback['kind']==='error'?'alert':'status'?>"><?=icon($feedback['kind']==='error'?'circle-alert':'circle-check')?><span data-feedback-text><?=e($feedback['message'])?></span><?php if(!empty($feedback['undo']))echo actionForm('undo',['return'=>$_SERVER['REQUEST_URI']],$feedback['undoLabel']??'되돌리기','toast__action');?><button type="button" class="toast__close" aria-label="알림 닫기"><?=icon('x')?></button></div></div>
<?php endif; ?>
