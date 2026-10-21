<?php
/** Plain-text fields remain escaped; blank lines become semantic paragraphs. */
function proseParagraphs(string $text): string {
 $blocks=preg_split('/\R[\t ]*\R+/u',trim($text),-1,PREG_SPLIT_NO_EMPTY);
 return implode('',array_map(fn($block)=>'<p>'.nl2br(e($block)).'</p>',$blocks?:[]));
}
