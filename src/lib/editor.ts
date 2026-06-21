// ============================================================
// 공용 슈퍼 에디터 모듈 (richEditor)
// 블로그 / 공지 / 케이스 공통 — 툴바 + contenteditable + 이미지 SEO + SEO 패널
// ============================================================

// ---- 1) 에디터 CSS (admin.tsx의 <style>에 주입) ----
export const EDITOR_CSS = `
/* ===== 슈퍼 에디터 ===== */
.rte-wrap{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff}
.rte-bar{display:flex;gap:2px;flex-wrap:wrap;padding:8px 10px;background:linear-gradient(180deg,#fbf6ec,#f7f0e1);border-bottom:1px solid var(--line)}
.rte-bar .g{display:flex;gap:2px;align-items:center;padding:0 4px;border-right:1px solid var(--line)}
.rte-bar .g:last-child{border-right:none}
.rte-bar button{min-width:32px;height:32px;padding:0 9px;border:1px solid transparent;background:transparent;border-radius:7px;cursor:pointer;font-size:.82rem;font-weight:700;color:var(--ink);display:inline-flex;align-items:center;justify-content:center;gap:4px;transition:.15s}
.rte-bar button:hover{background:#fff;border-color:var(--line)}
.rte-bar button.active{background:var(--navy);color:#fff}
.rte-bar button i{font-size:.85rem}
.rte-body{min-height:380px;max-height:600px;overflow-y:auto;padding:22px 26px;background:#fff;font-size:1rem;line-height:1.8;color:var(--ink);outline:none;transition:.15s}
.rte-body:focus{box-shadow:inset 0 0 0 2px var(--gold-soft)}
.rte-body.dragover{box-shadow:inset 0 0 0 3px var(--gold);background:#fffdf7}
.rte-body[data-empty="true"]:before{content:attr(data-ph);color:#b8ab97;pointer-events:none}
.rte-body h2{font-size:1.5rem;font-weight:800;margin:1em 0 .45em;color:var(--navy);line-height:1.35;border-bottom:2px solid var(--gold-soft);padding-bottom:.25em}
.rte-body h3{font-size:1.22rem;font-weight:800;margin:.9em 0 .4em;color:var(--navy);line-height:1.4}
.rte-body h4{font-size:1.05rem;font-weight:700;margin:.8em 0 .35em;color:var(--gold)}
.rte-body p{margin:.6em 0;line-height:1.85}
.rte-body a{color:var(--gold);text-decoration:underline}
.rte-body ul,.rte-body ol{margin:.6em 0;padding-left:1.5em}
.rte-body li{margin:.3em 0;line-height:1.7}
.rte-body blockquote{margin:1em 0;padding:14px 20px;border-left:4px solid var(--gold);background:var(--gold-soft);border-radius:0 10px 10px 0;color:var(--navy);font-style:italic}
.rte-body hr{border:none;border-top:2px dashed var(--line);margin:1.6em 0}
.rte-body figure{margin:1.2em 0;text-align:center}
.rte-body figure img{max-width:100%;border-radius:12px;display:block;margin:0 auto;box-shadow:0 6px 20px rgba(62,44,31,.12)}
.rte-body figure figcaption{margin-top:8px;font-size:.85rem;color:var(--ink-soft);font-style:italic}
.rte-body img{max-width:100%;border-radius:12px}
.rte-body figure.sel,.rte-body img.sel{outline:3px solid var(--gold);outline-offset:2px}
.rte-uploading{display:inline-block;padding:10px 16px;background:var(--gold-soft);color:var(--navy);border-radius:10px;font-size:.85rem;font-weight:600;margin:6px 0}
/* 이미지 클릭 시 뜨는 미니 툴바 */
.rte-imgbar{position:absolute;z-index:60;background:var(--navy);border-radius:10px;padding:4px;display:none;gap:2px;box-shadow:0 8px 24px rgba(0,0,0,.25)}
.rte-imgbar button{height:30px;padding:0 10px;border:none;background:transparent;color:#fff;border-radius:6px;cursor:pointer;font-size:.78rem;font-weight:600}
.rte-imgbar button:hover{background:rgba(255,255,255,.15)}
.rte-imgbar button.del:hover{background:#c0392b}
/* SEO 패널 */
.seo-panel{background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px;margin-bottom:20px}
.seo-panel h3{font-size:1rem;color:var(--navy);margin-bottom:4px;display:flex;align-items:center;gap:8px}
.seo-panel h3 i{color:var(--gold)}
.seo-panel .seo-sub{font-size:.8rem;color:var(--ink-soft);margin-bottom:16px}
.ctr{font-size:.74rem;font-weight:700;float:right}
.ctr.ok{color:#2e7d4f}.ctr.warn{color:#b07000}.ctr.bad{color:#c0392b}
.serp{border:1px solid var(--line);border-radius:12px;padding:16px;background:#fdfbf6;margin-top:6px}
.serp .s-url{font-size:.78rem;color:#5b7a3a}
.serp .s-url .crumb{color:var(--ink-soft)}
.serp .s-title{font-size:1.1rem;color:#1a0dab;margin:3px 0 4px;line-height:1.3;font-weight:500}
.serp .s-desc{font-size:.84rem;color:#4d5156;line-height:1.5}
.analysis{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin-top:14px}
.analysis .a-box{background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:12px;text-align:center}
.analysis .a-box .a-n{font-size:1.3rem;font-weight:800;color:var(--navy)}
.analysis .a-box .a-l{font-size:.72rem;color:var(--ink-soft);margin-top:2px}
.seo-warn{margin-top:12px;display:none;padding:10px 14px;border-radius:10px;background:#fff3e0;color:#b07000;font-size:.82rem;font-weight:600}
.seo-warn.show{display:block}
.seo-warn ul{margin:6px 0 0;padding-left:18px}
.seo-warn li{margin:2px 0}
/* 모달 (alt/링크 입력) */
.rte-modal{position:fixed;inset:0;background:rgba(41,28,18,.5);z-index:200;display:none;align-items:center;justify-content:center;padding:20px}
.rte-modal.show{display:flex}
.rte-modal .box{background:#fff;border-radius:16px;padding:24px;width:100%;max-width:440px;box-shadow:0 30px 80px rgba(0,0,0,.3)}
.rte-modal h4{font-size:1.05rem;color:var(--navy);margin-bottom:6px}
.rte-modal p{font-size:.82rem;color:var(--ink-soft);margin-bottom:14px;line-height:1.5}
.rte-modal label{margin-top:10px}
.rte-modal .acts{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}
.rte-modal .mini-prev{margin-top:10px;text-align:center}
.rte-modal .mini-prev img{max-width:100%;max-height:160px;border-radius:10px}
`;

// ---- 2) 모달 + 이미지 미니툴바 HTML (페이지에 1회 삽입) ----
export const EDITOR_MODALS = `
<div class="rte-imgbar" id="rte-imgbar">
  <button onclick="rteImgAlign('left')" title="왼쪽"><i class="fas fa-align-left"></i></button>
  <button onclick="rteImgAlign('center')" title="가운데"><i class="fas fa-align-center"></i></button>
  <button onclick="rteImgAlign('right')" title="오른쪽"><i class="fas fa-align-right"></i></button>
  <button onclick="rteEditImgMeta()">설명/캡션</button>
  <button class="del" onclick="rteDelImg()"><i class="fas fa-trash"></i> 삭제</button>
</div>
<div class="rte-modal" id="rte-img-modal">
  <div class="box">
    <h4><i class="fas fa-image" style="color:var(--gold)"></i> 이미지 설명 (SEO)</h4>
    <p>대체텍스트(alt)는 검색엔진과 시각장애인 화면낭독기가 읽습니다. 사진 내용을 구체적으로 써 주세요. 캡션은 사진 아래 표시됩니다.</p>
    <div class="mini-prev"><img id="rte-img-prev" src="" alt=""></div>
    <label>대체텍스트 (alt) *</label>
    <input type="text" id="rte-img-alt" placeholder="예: 임플란트 시술 전후 파노라마 사진">
    <label>캡션 (선택)</label>
    <input type="text" id="rte-img-cap" placeholder="사진 아래 표시될 설명 (비워도 됨)">
    <div class="acts">
      <button class="btn btn-o" onclick="rteCloseImgModal()">취소</button>
      <button class="btn btn-p" onclick="rteApplyImgMeta()">적용</button>
    </div>
  </div>
</div>
<div class="rte-modal" id="rte-link-modal">
  <div class="box">
    <h4><i class="fas fa-link" style="color:var(--gold)"></i> 링크 삽입</h4>
    <p>선택한 텍스트에 링크를 겁니다. 내부 페이지(/reservation) 또는 외부 주소(https://...)를 입력하세요.</p>
    <label>링크 주소 *</label>
    <input type="text" id="rte-link-url" placeholder="https://... 또는 /reservation">
    <div class="acts">
      <button class="btn btn-o" onclick="rteCloseLinkModal()">취소</button>
      <button class="btn btn-p" onclick="rteApplyLink()">링크 걸기</button>
    </div>
  </div>
</div>
`;

// ---- 3) 툴바 HTML 생성 ----
// full=true: 블로그용 풀 툴바 / false: 공지용 간소 툴바
export function editorToolbar(opts: { id: string; full?: boolean }): string {
  const full = opts.full !== false;
  const heads = full
    ? `<button type="button" onclick="rteFmt('formatBlock','h2')" title="대제목"><i class="fas fa-heading"></i>2</button>
       <button type="button" onclick="rteFmt('formatBlock','h3')" title="중제목"><i class="fas fa-heading"></i>3</button>
       <button type="button" onclick="rteFmt('formatBlock','h4')" title="소제목"><i class="fas fa-heading"></i>4</button>
       <button type="button" onclick="rteFmt('formatBlock','p')" title="본문">본문</button>`
    : `<button type="button" onclick="rteFmt('formatBlock','h3')" title="소제목"><i class="fas fa-heading"></i></button>`;
  const align = full
    ? `<div class="g">
        <button type="button" onclick="rteFmt('justifyLeft')" title="왼쪽 정렬"><i class="fas fa-align-left"></i></button>
        <button type="button" onclick="rteFmt('justifyCenter')" title="가운데 정렬"><i class="fas fa-align-center"></i></button>
        <button type="button" onclick="rteFmt('justifyRight')" title="오른쪽 정렬"><i class="fas fa-align-right"></i></button>
       </div>`
    : '';
  const extra = full
    ? `<button type="button" onclick="rteFmt('insertOrderedList')" title="번호 목록"><i class="fas fa-list-ol"></i></button>
       <button type="button" onclick="rteQuote()" title="인용"><i class="fas fa-quote-right"></i></button>`
    : '';
  const linkBtns = full
    ? `<div class="g">
        <button type="button" onclick="rteOpenLink()" title="링크"><i class="fas fa-link"></i></button>
        <button type="button" onclick="rteFmt('unlink')" title="링크 해제"><i class="fas fa-unlink"></i></button>
        <button type="button" onclick="rteHr()" title="구분선"><i class="fas fa-minus"></i></button>
       </div>`
    : '';
  return `<div class="rte-bar">
    <div class="g">${heads}</div>
    <div class="g">
      <button type="button" onclick="rteFmt('bold')" title="굵게"><i class="fas fa-bold"></i></button>
      <button type="button" onclick="rteFmt('italic')" title="기울임"><i class="fas fa-italic"></i></button>
      <button type="button" onclick="rteFmt('underline')" title="밑줄"><i class="fas fa-underline"></i></button>
    </div>
    ${align}
    <div class="g">
      <button type="button" onclick="rteFmt('insertUnorderedList')" title="목록"><i class="fas fa-list-ul"></i></button>
      ${extra}
    </div>
    ${linkBtns}
    <div class="g">
      <button type="button" onclick="document.getElementById('${opts.id}-file').click()" title="사진 삽입"><i class="fas fa-image"></i> 사진</button>
      <input type="file" id="${opts.id}-file" accept="image/*" multiple style="display:none" onchange="rteInsertImgs(this.files);this.value=''">
    </div>
  </div>`;
}

// ---- 4) 에디터 본문 HTML ----
export function editorBody(opts: { id: string; html?: string; placeholder?: string; minHeight?: number }): string {
  const ph = opts.placeholder || '여기에 내용을 작성하세요. 사진은 툴바 또는 드래그앤드롭으로 본문 중간에 넣을 수 있어요.';
  const style = opts.minHeight ? ` style="min-height:${opts.minHeight}px"` : '';
  const content = (opts.html && opts.html.trim()) ? opts.html : '';
  return `<div class="rte-body" id="${opts.id}" contenteditable="true" data-ph="${ph.replace(/"/g, '&quot;')}"${style}>${content}</div>`;
}

// ---- 5) SEO 패널 HTML (블로그 전용) ----
export function seoPanel(opts: { titleId: string; descId: string; slugId: string; bodyId: string }): string {
  return `<div class="seo-panel">
    <h3><i class="fas fa-magnifying-glass-chart"></i> SEO 미리보기 & 분석</h3>
    <p class="seo-sub">구글 검색결과에 어떻게 보일지 미리 확인하고, 본문 SEO 점검 결과를 받아보세요.</p>
    <div class="serp">
      <div class="s-url"><span class="crumb">isoldc.kr › blog › </span><span id="serp-slug">slug</span></div>
      <div class="s-title" id="serp-title">글 제목이 여기에 표시됩니다</div>
      <div class="s-desc" id="serp-desc">요약(메타설명)이 여기에 표시됩니다. 검색 사용자가 가장 먼저 읽는 문장이에요.</div>
    </div>
    <div class="analysis">
      <div class="a-box"><div class="a-n" id="an-chars">0</div><div class="a-l">본문 글자수</div></div>
      <div class="a-box"><div class="a-n" id="an-read">0분</div><div class="a-l">예상 읽기시간</div></div>
      <div class="a-box"><div class="a-n" id="an-head">0</div><div class="a-l">제목(H) 개수</div></div>
      <div class="a-box"><div class="a-n" id="an-img">0</div><div class="a-l">이미지</div></div>
    </div>
    <div class="seo-warn" id="seo-warn"></div>
  </div>`;
}

// ---- 6) 에디터 엔진 JS (페이지에 1회 삽입) ----
// rteInit({editorId, fileId, thumbId, titleId, slugId, descId, onChange}) 로 초기화
export const EDITOR_JS = `<script>
(function(){
  var RTE = window.RTE = {
    ed:null, file:null, thumb:null, savedRange:null, selImg:null, cfg:{},
    placeholderCleared:false
  };
  // ---------- 초기화 ----------
  window.rteInit = function(cfg){
    RTE.cfg = cfg||{};
    RTE.ed = document.getElementById(cfg.editorId);
    if(!RTE.ed) return;
    RTE.thumb = cfg.thumbId ? document.getElementById(cfg.thumbId) : null;
    // 빈 상태 placeholder 처리
    updateEmpty();
    RTE.ed.addEventListener('input', function(){ updateEmpty(); fireChange(); });
    RTE.ed.addEventListener('blur', saveRange);
    RTE.ed.addEventListener('mouseup', saveRange);
    RTE.ed.addEventListener('keyup', function(){ saveRange(); refreshToolbarState(); });
    // 붙여넣기: 서식 제거(plain) 옵션 — 기본은 유지하되 이미지 base64 차단
    RTE.ed.addEventListener('paste', onPaste);
    // 이미지 클릭 → 미니툴바
    RTE.ed.addEventListener('click', onBodyClick);
    // 드래그앤드롭
    RTE.ed.addEventListener('dragover', function(e){ e.preventDefault(); RTE.ed.classList.add('dragover'); });
    RTE.ed.addEventListener('dragleave', function(){ RTE.ed.classList.remove('dragover'); });
    RTE.ed.addEventListener('drop', function(e){
      e.preventDefault(); RTE.ed.classList.remove('dragover');
      var files = Array.prototype.filter.call(e.dataTransfer.files, function(f){ return f.type.indexOf('image/')===0; });
      if(files.length){ placeCaretFromPoint(e.clientX, e.clientY); rteInsertImgs(files); }
    });
    fireChange();
  };
  function updateEmpty(){
    var t = RTE.ed.textContent.trim();
    var hasMedia = RTE.ed.querySelector('img,figure,ul,ol,blockquote,hr');
    RTE.ed.setAttribute('data-empty', (!t && !hasMedia) ? 'true' : 'false');
  }
  function fireChange(){ if(typeof RTE.cfg.onChange==='function') RTE.cfg.onChange(); analyze(); }
  function saveRange(){
    var sel = window.getSelection();
    if(sel.rangeCount>0 && RTE.ed.contains(sel.anchorNode)) RTE.savedRange = sel.getRangeAt(0).cloneRange();
  }
  function restoreRange(){
    if(RTE.savedRange){ var sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(RTE.savedRange); }
    else RTE.ed.focus();
  }
  function placeCaretFromPoint(x,y){
    var r=null;
    if(document.caretRangeFromPoint) r=document.caretRangeFromPoint(x,y);
    else if(document.caretPositionFromPoint){var p=document.caretPositionFromPoint(x,y); if(p){r=document.createRange();r.setStart(p.offsetNode,p.offset);}}
    if(r){var sel=window.getSelection();sel.removeAllRanges();sel.addRange(r);RTE.savedRange=r.cloneRange();}
  }

  // ---------- 서식 ----------
  window.rteFmt = function(cmd,val){
    RTE.ed.focus(); restoreRange();
    document.execCommand(cmd, false, val||null);
    saveRange(); refreshToolbarState(); fireChange();
  };
  window.rteQuote = function(){ rteFmt('formatBlock','blockquote'); };
  window.rteHr = function(){ rteFmt('insertHorizontalRule'); };
  function refreshToolbarState(){
    var bar = RTE.ed.parentElement.querySelector('.rte-bar'); if(!bar) return;
    ['bold','italic','underline'].forEach(function(c){
      var b = bar.querySelector('button[onclick*="\\''+c+'\\'"]');
      if(b){ try{ b.classList.toggle('active', document.queryCommandState(c)); }catch(e){} }
    });
  }

  // ---------- 붙여넣기 정리 ----------
  function onPaste(e){
    var items = (e.clipboardData||{}).items || [];
    for(var i=0;i<items.length;i++){
      if(items[i].type && items[i].type.indexOf('image/')===0){
        e.preventDefault();
        var f = items[i].getAsFile();
        if(f) rteInsertImgs([f]);
        return;
      }
    }
  }

  // ---------- 이미지 클라이언트 리사이즈 ----------
  function resizeImage(file, maxW){
    return new Promise(function(resolve){
      if(!/^image\\/(jpe?g|png|webp)$/.test(file.type)){ resolve(file); return; }
      var img=new Image(), url=URL.createObjectURL(file);
      img.onload=function(){
        URL.revokeObjectURL(url);
        if(img.width<=maxW){ resolve(file); return; }
        var scale=maxW/img.width, w=maxW, h=Math.round(img.height*scale);
        var cv=document.createElement('canvas'); cv.width=w; cv.height=h;
        cv.getContext('2d').drawImage(img,0,0,w,h);
        cv.toBlob(function(blob){
          if(!blob){ resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\\.[^.]+$/,'')+'.jpg', {type:'image/jpeg'}));
        }, 'image/jpeg', 0.86);
      };
      img.onerror=function(){ URL.revokeObjectURL(url); resolve(file); };
      img.src=url;
    });
  }
  function uploadFile(f){
    var fd=new FormData(); fd.append('file',f);
    return fetch('/admin/api/upload',{method:'POST',body:fd}).then(function(r){return r.json();});
  }

  // ---------- 이미지 삽입 (alt 입력 → figure) ----------
  window.rteInsertImgs = async function(files){
    RTE.ed.focus(); restoreRange();
    for(var i=0;i<files.length;i++){
      var ph=document.createElement('span'); ph.className='rte-uploading'; ph.textContent='⏳ 사진 업로드 중...';
      insertNodeAtCaret(ph);
      try{
        var resized = await resizeImage(files[i], 1600);
        var j = await uploadFile(resized);
        if(j && j.ok){
          var fig=document.createElement('figure');
          fig.contentEditable='false';
          var im=document.createElement('img');
          im.src='/api/img/'+j.key; im.alt=''; im.setAttribute('loading','lazy'); im.setAttribute('data-key',j.key);
          fig.appendChild(im);
          ph.parentNode.replaceChild(fig, ph);
          // 첫 이미지 → 썸네일 자동
          if(RTE.thumb && !RTE.thumb.value) RTE.thumb.value=j.key;
          // 즉시 alt 입력 유도
          RTE.selImg=fig; openImgModal(fig, true);
        } else {
          ph.textContent='⚠ 업로드 실패: '+((j&&j.error)||'');
        }
      }catch(e){ ph.textContent='⚠ 업로드 오류'; }
    }
    updateEmpty(); fireChange();
  };
  function insertNodeAtCaret(node){
    restoreRange();
    var sel=window.getSelection();
    if(sel.rangeCount>0 && RTE.ed.contains(sel.anchorNode)){
      var r=sel.getRangeAt(0); r.collapse(false); r.insertNode(node);
      var after=document.createElement('p'); after.innerHTML='<br>';
      if(node.parentNode) node.parentNode.insertBefore(after, node.nextSibling);
      r=document.createRange(); r.setStart(after,0); r.collapse(true);
      sel.removeAllRanges(); sel.addRange(r); RTE.savedRange=r.cloneRange();
    } else {
      RTE.ed.appendChild(node);
    }
  }

  // ---------- 이미지 선택 / 미니툴바 ----------
  function onBodyClick(e){
    clearImgSel();
    var fig = e.target.closest ? e.target.closest('figure') : null;
    var img = (e.target.tagName==='IMG') ? e.target : null;
    var target = fig || (img && !img.closest('figure') ? img : null);
    if(target){
      RTE.selImg = target; target.classList.add('sel');
      var bar=document.getElementById('rte-imgbar');
      var rect=target.getBoundingClientRect();
      bar.style.display='flex';
      bar.style.top=(window.scrollY+rect.top-44)+'px';
      bar.style.left=(window.scrollX+rect.left)+'px';
    }
  }
  function clearImgSel(){
    if(RTE.selImg) RTE.selImg.classList.remove('sel');
    RTE.selImg=null;
    var bar=document.getElementById('rte-imgbar'); if(bar) bar.style.display='none';
  }
  document.addEventListener('click', function(e){
    if(RTE.ed && !RTE.ed.contains(e.target) && !e.target.closest('#rte-imgbar') && !e.target.closest('.rte-modal')) clearImgSel();
  });
  window.rteImgAlign = function(dir){
    if(!RTE.selImg) return;
    RTE.selImg.style.textAlign = (RTE.selImg.tagName==='FIGURE') ? dir : '';
    if(RTE.selImg.tagName==='IMG'){
      RTE.selImg.style.display = dir==='center' ? 'block' : 'inline';
      RTE.selImg.style.margin = dir==='center' ? '0 auto' : (dir==='right' ? '0 0 0 auto' : '0');
    }
    fireChange();
  };
  window.rteDelImg = function(){
    if(RTE.selImg){ RTE.selImg.remove(); clearImgSel(); updateEmpty(); fireChange(); }
  };
  window.rteEditImgMeta = function(){ if(RTE.selImg) openImgModal(RTE.selImg, false); };

  // ---------- alt/캡션 모달 ----------
  function openImgModal(target, isNew){
    var img = target.tagName==='IMG' ? target : target.querySelector('img');
    var cap = target.tagName==='FIGURE' ? (target.querySelector('figcaption')||{}).textContent : '';
    document.getElementById('rte-img-prev').src = img ? img.src : '';
    document.getElementById('rte-img-alt').value = img ? (img.getAttribute('alt')||'') : '';
    document.getElementById('rte-img-cap').value = cap || '';
    RTE._modalTarget = target;
    document.getElementById('rte-img-modal').classList.add('show');
    setTimeout(function(){ document.getElementById('rte-img-alt').focus(); }, 50);
  }
  window.rteCloseImgModal = function(){ document.getElementById('rte-img-modal').classList.remove('show'); };
  window.rteApplyImgMeta = function(){
    var t=RTE._modalTarget; if(!t){ rteCloseImgModal(); return; }
    var alt=document.getElementById('rte-img-alt').value.trim();
    var cap=document.getElementById('rte-img-cap').value.trim();
    // IMG 단독이면 figure로 감싸기
    var fig=t, img;
    if(t.tagName==='IMG'){
      fig=document.createElement('figure'); fig.contentEditable='false';
      t.parentNode.insertBefore(fig, t); fig.appendChild(t); img=t;
    } else { img=fig.querySelector('img'); }
    if(img) img.setAttribute('alt', alt);
    var fc=fig.querySelector('figcaption');
    if(cap){
      if(!fc){ fc=document.createElement('figcaption'); fig.appendChild(fc); }
      fc.textContent=cap;
    } else if(fc){ fc.remove(); }
    rteCloseImgModal(); clearImgSel(); fireChange();
  };

  // ---------- 링크 ----------
  window.rteOpenLink = function(){
    saveRange();
    var sel=window.getSelection();
    if(!sel.toString().trim()){ alert('링크를 걸 텍스트를 먼저 선택해 주세요.'); return; }
    document.getElementById('rte-link-url').value='';
    document.getElementById('rte-link-modal').classList.add('show');
    setTimeout(function(){ document.getElementById('rte-link-url').focus(); },50);
  };
  window.rteCloseLinkModal = function(){ document.getElementById('rte-link-modal').classList.remove('show'); };
  window.rteApplyLink = function(){
    var url=document.getElementById('rte-link-url').value.trim();
    if(!url){ return; }
    restoreRange();
    document.execCommand('createLink', false, url);
    // 외부링크 target/rel 부여
    setTimeout(function(){
      var links=RTE.ed.querySelectorAll('a[href="'+url+'"]');
      links.forEach(function(a){
        if(/^https?:\\/\\//.test(url)){ a.setAttribute('target','_blank'); a.setAttribute('rel','noopener noreferrer'); }
      });
      fireChange();
    },10);
    rteCloseLinkModal();
  };

  // ---------- SEO 분석 ----------
  function analyze(){
    if(!document.getElementById('an-chars')) return; // SEO 패널 없는 폼(공지)은 스킵
    var text = RTE.ed.textContent.replace(/\\s+/g,'').length;
    var words = RTE.ed.textContent.trim().split(/\\s+/).filter(Boolean).length;
    var read = Math.max(1, Math.round(text/500)); // 한글 분당 ~500자
    var heads = RTE.ed.querySelectorAll('h2,h3,h4').length;
    var imgs = RTE.ed.querySelectorAll('img');
    var noAlt = 0; imgs.forEach(function(im){ if(!(im.getAttribute('alt')||'').trim()) noAlt++; });
    setText('an-chars', text.toLocaleString());
    setText('an-read', read+'분');
    setText('an-head', heads);
    setText('an-img', imgs.length);
    // 경고
    var warns=[];
    var titleEl=RTE.cfg.titleId?document.getElementById(RTE.cfg.titleId):null;
    var descEl=RTE.cfg.descId?document.getElementById(RTE.cfg.descId):null;
    if(titleEl){ var tl=titleEl.value.trim().length; if(tl<10) warns.push('제목이 너무 짧아요 (15~30자 권장)'); if(tl>40) warns.push('제목이 너무 길어요 (40자 이하 권장)'); }
    if(descEl){ var dl=descEl.value.trim().length; if(dl<30) warns.push('요약(메타설명)을 50~120자로 채우면 검색 노출에 좋아요'); }
    if(text<300) warns.push('본문이 짧아요 — 500자 이상이면 검색에 유리해요');
    if(heads===0 && text>200) warns.push('소제목(H2/H3)을 넣어 글을 구조화하세요');
    if(noAlt>0) warns.push(noAlt+'개 이미지에 대체텍스트(alt)가 없어요 (사진 클릭 → 설명/캡션)');
    var box=document.getElementById('seo-warn');
    if(box){
      if(warns.length){ box.classList.add('show'); box.innerHTML='<i class=\"fas fa-triangle-exclamation\"></i> 개선 제안 ('+warns.length+')<ul>'+warns.map(function(w){return '<li>'+w+'</li>';}).join('')+'</ul>'; }
      else { box.classList.add('show'); box.style.background='#e6f4ea'; box.style.color='#2e7d4f'; box.innerHTML='<i class=\"fas fa-circle-check\"></i> SEO 기본 점검 통과! 발행 준비 완료 👍'; }
    }
  }
  function setText(id,v){ var e=document.getElementById(id); if(e) e.textContent=v; }
  window.rteSerp = function(title, slug, desc){
    setText('serp-title', title||'글 제목이 여기에 표시됩니다');
    setText('serp-slug', slug||'slug');
    setText('serp-desc', desc||'요약(메타설명)이 여기에 표시됩니다.');
  };

  // 글자수 카운터 부착 헬퍼
  window.rteCounter = function(inputId, counterId, min, max){
    var inp=document.getElementById(inputId), ctr=document.getElementById(counterId);
    if(!inp||!ctr) return;
    function upd(){
      var n=inp.value.trim().length;
      ctr.textContent=n+(max?(' / '+max):'')+'자';
      ctr.className='ctr '+(n<min?'bad':(max&&n>max?'warn':'ok'));
    }
    inp.addEventListener('input', upd); upd();
  };
})();
</script>`;

