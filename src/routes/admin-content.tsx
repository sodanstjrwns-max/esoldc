// ============================================================
// 관리자 콘텐츠 CRUD — 비포애프터 / 블로그 / 공지사항
// ============================================================
import { Hono } from 'hono';
import { adminShell, requireAdmin, esc } from './admin';
import { DOCTORS, TREATMENTS } from '../data/clinic';

type Bindings = { DB?: D1Database; R2?: R2Bucket; ADMIN_PASSWORD?: string };

export const adminContent = new Hono<{ Bindings: Bindings }>();

const CATEGORIES = TREATMENTS.map(t => ({ slug: t.slug, name: t.name }));
const AGE_GROUPS = ['10대 미만', '10대', '20대', '30대', '40대', '50대', '60대', '70대 이상'];

// ============================================================
// 비포&애프터 목록
// ============================================================
adminContent.get('/cases', async (c) => {
  if (!(await requireAdmin(c))) return c.redirect('/admin');
  const db = c.env.DB!;
  const { results } = await db.prepare('SELECT * FROM cases ORDER BY id DESC LIMIT 300').all();
  const rows = (results as any[]).map(x => {
    const imgs = [x.img_pano_before, x.img_pano_after, x.img_oral_before, x.img_oral_after].filter(Boolean).length;
    const cat = CATEGORIES.find(ct => ct.slug === x.category)?.name || x.category;
    const doc = DOCTORS.find(d => d.slug === x.doctor_slug)?.name || '-';
    return `<tr>
      <td>${x.id}</td><td><strong>${esc(x.title)}</strong></td><td>${esc(cat)}</td><td>${esc(doc)}</td>
      <td>${imgs}/4장</td><td>${x.views}</td>
      <td><span class="badge ${x.published ? 'on' : 'off'}">${x.published ? '공개' : '비공개'}</span></td>
      <td style="white-space:nowrap">
        <a href="/admin/cases/${x.id}" class="btn btn-o btn-sm">수정</a>
        <button class="btn btn-d btn-sm" onclick="delItem('cases',${x.id})">삭제</button>
      </td></tr>`;
  }).join('');
  return c.html(adminShell('비포&애프터', 'cases', `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
    <h1>비포&애프터</h1>
    <a href="/admin/cases/new" class="btn btn-g"><i class="fas fa-plus"></i> 새 사례 등록</a>
  </div>
  <p class="sub">파노라마·구내포토 전후 사진은 업로드된 것만 표시됩니다. 애프터 사진은 회원 로그인 시에만 공개됩니다.</p>
  <div class="card" style="overflow-x:auto">
    <table><thead><tr><th>ID</th><th>제목</th><th>카테고리</th><th>담당원장</th><th>사진</th><th>조회수</th><th>상태</th><th></th></tr></thead>
    <tbody>${rows || '<tr><td colspan="8" style="text-align:center;color:var(--ink-soft);padding:30px">등록된 사례가 없습니다.</td></tr>'}</tbody></table>
  </div>
  ${DEL_SCRIPT}`));
});

// 비포&애프터 작성/수정 폼
adminContent.get('/cases/new', async (c) => {
  if (!(await requireAdmin(c))) return c.redirect('/admin');
  return c.html(adminShell('사례 등록', 'cases', caseForm(null)));
});
adminContent.get('/cases/:id', async (c) => {
  if (!(await requireAdmin(c))) return c.redirect('/admin');
  const db = c.env.DB!;
  const x = await db.prepare('SELECT * FROM cases WHERE id = ?').bind(c.req.param('id')).first<any>();
  if (!x) return c.redirect('/admin/cases');
  return c.html(adminShell('사례 수정', 'cases', caseForm(x)));
});

function caseForm(x: any): string {
  const isEdit = !!x;
  const imgSlot = (key: string, label: string) => {
    const has = x && x[key];
    return `
    <div class="img-slot ${has ? 'has' : ''}" id="slot-${key}" onclick="document.getElementById('file-${key}').click()">
      <button type="button" class="rm" onclick="event.stopPropagation();clearImg('${key}')">삭제</button>
      ${has ? `<img src="/api/img/${x[key]}" alt="${label}">` : '<i class="fas fa-cloud-upload-alt" style="font-size:1.4rem;color:var(--gold)"></i>'}
      <span class="lbl">${label}</span>
      <input type="file" id="file-${key}" accept="image/*" style="display:none" onchange="uploadImg('${key}',this)">
      <input type="hidden" id="key-${key}" value="${has ? esc(x[key]) : ''}">
    </div>`;
  };
  return `
  <h1>${isEdit ? '사례 수정' : '새 사례 등록'}</h1>
  <p class="sub">사진은 업로드된 것만 사이트에 표시됩니다. (미업로드 = 비표시)</p>
  <div class="card">
    <label>제목 *</label>
    <input type="text" id="f-title" value="${x ? esc(x.title) : ''}" placeholder="예: 상악 어금니 임플란트 식립 사례">
    <label>설명</label>
    <textarea id="f-desc" rows="4" placeholder="치료 과정과 내용을 설명해 주세요. (의료광고법: 치료 효과 보장·과장 표현 금지)">${x ? esc(x.description) : ''}</textarea>
    <div class="row3">
      <div><label>나이대</label>
        <select id="f-age">${AGE_GROUPS.map(a => `<option ${x && x.age_group === a ? 'selected' : ''}>${a}</option>`).join('')}</select></div>
      <div><label>성별</label>
        <select id="f-gender"><option ${x && x.gender === '여성' ? 'selected' : ''}>여성</option><option ${x && x.gender === '남성' ? 'selected' : ''}>남성</option></select></div>
      <div><label>치료 기간</label>
        <input type="text" id="f-duration" value="${x ? esc(x.duration) : ''}" placeholder="예: 3개월"></div>
    </div>
    <div class="row2">
      <div><label>진료 카테고리 *</label>
        <select id="f-category">${CATEGORIES.map(ct => `<option value="${ct.slug}" ${x && x.category === ct.slug ? 'selected' : ''}>${ct.name}</option>`).join('')}</select></div>
      <div><label>담당 원장 *</label>
        <select id="f-doctor">${DOCTORS.map(d => `<option value="${d.slug}" ${x && x.doctor_slug === d.slug ? 'selected' : ''}>${d.name} ${d.role}</option>`).join('')}</select></div>
    </div>
    <label>환자 거주 지역 <span style="font-weight:400;color:var(--ink-soft);font-size:.8rem">("초지" 입력 → 자동완성 선택)</span></label>
    <div class="autocomplete">
      <input type="text" id="f-region" value="${x ? esc(x.region) : ''}" placeholder="동/리 이름을 입력하세요" autocomplete="off">
      <div class="ac-list" id="ac-list"></div>
    </div>

    <label style="margin-top:24px">사진 (전후 4장 · 업로드된 것만 표시)</label>
    <div class="row2">
      ${imgSlot('img_pano_before', '파노라마 BEFORE')}
      ${imgSlot('img_pano_after', '파노라마 AFTER 🔒')}
    </div>
    <div class="row2" style="margin-top:14px">
      ${imgSlot('img_oral_before', '구내포토 BEFORE')}
      ${imgSlot('img_oral_after', '구내포토 AFTER 🔒')}
    </div>
    <p class="drop-hint">🔒 표시 사진(애프터)은 회원 로그인 시에만 공개됩니다.</p>

    <div class="row2" style="margin-top:18px;align-items:center">
      <div><label style="margin:0"><input type="checkbox" id="f-pub" ${!x || x.published ? 'checked' : ''} style="width:auto;margin-right:8px;accent-color:var(--gold)">사이트에 공개</label></div>
      <div style="text-align:right">
        <button class="btn btn-p" onclick="saveCase(${isEdit ? x.id : 'null'})"><i class="fas fa-save"></i> ${isEdit ? '수정 저장' : '등록하기'}</button>
      </div>
    </div>
    <div class="msg" id="m"></div>
  </div>
  <script>
  async function uploadImg(key,input){
    var f=input.files[0];if(!f)return;
    var slot=document.getElementById('slot-'+key);
    slot.querySelector('.lbl').textContent='업로드 중...';
    var fd=new FormData();fd.append('file',f);
    var r=await fetch('/admin/api/upload',{method:'POST',body:fd});
    var j=await r.json();
    if(j.ok){
      document.getElementById('key-'+key).value=j.key;
      slot.classList.add('has');
      var old=slot.querySelector('img');if(old)old.remove();
      var ic=slot.querySelector('i');if(ic)ic.remove();
      var img=document.createElement('img');img.src='/api/img/'+j.key;
      slot.insertBefore(img,slot.querySelector('.lbl'));
      slot.querySelector('.lbl').textContent='업로드 완료';
    }else{slot.querySelector('.lbl').textContent='업로드 실패: '+(j.error||'');}
  }
  function clearImg(key){
    document.getElementById('key-'+key).value='';
    var slot=document.getElementById('slot-'+key);
    slot.classList.remove('has');
    var img=slot.querySelector('img');if(img)img.remove();
    slot.querySelector('.lbl').textContent='삭제됨 (저장 시 반영)';
  }
  // 지역 자동완성
  (function(){
    var inp=document.getElementById('f-region'),list=document.getElementById('ac-list'),t;
    inp.addEventListener('input',function(){
      clearTimeout(t);var q=inp.value.trim();
      if(!q){list.style.display='none';return;}
      t=setTimeout(async function(){
        var r=await fetch('/api/regions?q='+encodeURIComponent(q));var j=await r.json();
        if(!j.results||!j.results.length){list.style.display='none';return;}
        list.innerHTML=j.results.map(function(x){return '<div>'+x+'</div>';}).join('');
        list.style.display='block';
        Array.prototype.forEach.call(list.children,function(d){
          d.onclick=function(){inp.value=d.textContent;list.style.display='none';};
        });
      },180);
    });
    document.addEventListener('click',function(e){if(!list.contains(e.target)&&e.target!==inp)list.style.display='none';});
  })();
  async function saveCase(id){
    var m=document.getElementById('m');
    var data={
      title:document.getElementById('f-title').value.trim(),
      description:document.getElementById('f-desc').value.trim(),
      age_group:document.getElementById('f-age').value,
      gender:document.getElementById('f-gender').value,
      duration:document.getElementById('f-duration').value.trim(),
      category:document.getElementById('f-category').value,
      doctor_slug:document.getElementById('f-doctor').value,
      region:document.getElementById('f-region').value.trim(),
      img_pano_before:document.getElementById('key-img_pano_before').value||null,
      img_pano_after:document.getElementById('key-img_pano_after').value||null,
      img_oral_before:document.getElementById('key-img_oral_before').value||null,
      img_oral_after:document.getElementById('key-img_oral_after').value||null,
      published:document.getElementById('f-pub').checked?1:0
    };
    if(!data.title){m.className='msg err';m.textContent='제목을 입력해 주세요.';return;}
    var url=id?'/admin/api/cases/'+id:'/admin/api/cases';
    var r=await fetch(url,{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    var j=await r.json();
    if(j.ok){m.className='msg ok';m.textContent='저장되었습니다!';setTimeout(function(){location.href='/admin/cases';},700);}
    else{m.className='msg err';m.textContent=j.error||'저장 실패';}
  }
  </script>`;
}

// ============================================================
// 블로그 목록 + 에디터
// ============================================================
adminContent.get('/posts', async (c) => {
  if (!(await requireAdmin(c))) return c.redirect('/admin');
  const db = c.env.DB!;
  const { results } = await db.prepare('SELECT id, slug, title, author_slug, views, published, created_at FROM posts ORDER BY id DESC LIMIT 300').all();
  const rows = (results as any[]).map(x => {
    const doc = DOCTORS.find(d => d.slug === x.author_slug)?.name || '-';
    return `<tr>
      <td>${x.id}</td><td><strong>${esc(x.title)}</strong><br><span style="font-size:.75rem;color:var(--ink-soft)">/blog/${esc(x.slug)}</span></td>
      <td>${esc(doc)}</td><td>${x.views}</td>
      <td><span class="badge ${x.published ? 'on' : 'off'}">${x.published ? '공개' : '비공개'}</span></td>
      <td style="font-size:.8rem;color:var(--ink-soft)">${(x.created_at || '').slice(0, 10)}</td>
      <td style="white-space:nowrap">
        <a href="/admin/posts/${x.id}" class="btn btn-o btn-sm">수정</a>
        <button class="btn btn-d btn-sm" onclick="delItem('posts',${x.id})">삭제</button>
      </td></tr>`;
  }).join('');
  return c.html(adminShell('블로그', 'posts', `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
    <h1>블로그</h1>
    <a href="/admin/posts/new" class="btn btn-g"><i class="fas fa-pen"></i> 새 글 작성</a>
  </div>
  <p class="sub">h2/h3 태그 구조로 작성하면 SEO에 유리합니다. 사진은 드래그앤드롭으로 본문에 삽입할 수 있습니다.</p>
  <div class="card" style="overflow-x:auto">
    <table><thead><tr><th>ID</th><th>제목</th><th>작성자</th><th>조회수</th><th>상태</th><th>작성일</th><th></th></tr></thead>
    <tbody>${rows || '<tr><td colspan="7" style="text-align:center;color:var(--ink-soft);padding:30px">작성된 글이 없습니다.</td></tr>'}</tbody></table>
  </div>
  ${DEL_SCRIPT}`));
});

adminContent.get('/posts/new', async (c) => {
  if (!(await requireAdmin(c))) return c.redirect('/admin');
  return c.html(adminShell('블로그 작성', 'posts', postForm(null)));
});
adminContent.get('/posts/:id', async (c) => {
  if (!(await requireAdmin(c))) return c.redirect('/admin');
  const db = c.env.DB!;
  const x = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(c.req.param('id')).first<any>();
  if (!x) return c.redirect('/admin/posts');
  return c.html(adminShell('블로그 수정', 'posts', postForm(x)));
});

function postForm(x: any): string {
  const isEdit = !!x;
  return `
  <h1>${isEdit ? '글 수정' : '새 글 작성'}</h1>
  <p class="sub">제목(h2)·소제목(h3) 버튼으로 구조화하고, 이미지는 본문에 드래그하여 삽입하세요.</p>
  <div class="card">
    <div class="row2">
      <div><label>제목 *</label><input type="text" id="f-title" value="${x ? esc(x.title) : ''}" placeholder="글 제목"></div>
      <div><label>URL 슬러그 *</label><input type="text" id="f-slug" value="${x ? esc(x.slug) : ''}" placeholder="예: implant-care-tips (영문/숫자/하이픈)"></div>
    </div>
    <div class="row2">
      <div><label>작성자(원장) *</label>
        <select id="f-author">${DOCTORS.map(d => `<option value="${d.slug}" ${x && x.author_slug === d.slug ? 'selected' : ''}>${d.name} ${d.role}</option>`).join('')}</select></div>
      <div><label>썸네일</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="f-thumb" value="${x && x.thumbnail ? esc(x.thumbnail) : ''}" placeholder="본문 이미지 자동 사용 또는 업로드" readonly style="flex:1">
          <button class="btn btn-o btn-sm" onclick="document.getElementById('thumb-file').click()">업로드</button>
          <input type="file" id="thumb-file" accept="image/*" style="display:none" onchange="uploadThumb(this)">
        </div></div>
    </div>
    <label>요약 (검색결과·목록에 표시)</label>
    <input type="text" id="f-excerpt" value="${x ? esc(x.excerpt) : ''}" placeholder="한두 문장 요약">
    <label>본문 *</label>
    <div class="editor-bar">
      <button onclick="fmt('formatBlock','h2')">H2 제목</button>
      <button onclick="fmt('formatBlock','h3')">H3 소제목</button>
      <button onclick="fmt('formatBlock','p')">본문</button>
      <button onclick="fmt('bold')"><b>B</b></button>
      <button onclick="fmt('italic')"><i>I</i></button>
      <button onclick="fmt('underline')"><u>U</u></button>
      <button onclick="fmt('insertUnorderedList')">• 목록</button>
      <button onclick="fmt('insertOrderedList')">1. 목록</button>
      <button onclick="insertQuote()">❝ 인용</button>
      <button onclick="document.getElementById('body-img').click()">🖼 사진 삽입</button>
      <input type="file" id="body-img" accept="image/*" multiple style="display:none" onchange="insertImgs(this.files)">
    </div>
    <div class="editor-body" id="editor" contenteditable="true">${x ? x.content_html : '<p>여기에 내용을 작성하세요...</p>'}</div>
    <p class="drop-hint"><i class="fas fa-hand-pointer"></i> 이미지 파일을 본문에 끌어다 놓으면 자동 업로드되어 삽입됩니다. (다중 선택 가능)</p>
    <div class="row2" style="margin-top:18px;align-items:center">
      <div><label style="margin:0"><input type="checkbox" id="f-pub" ${!x || x.published ? 'checked' : ''} style="width:auto;margin-right:8px;accent-color:var(--gold)">사이트에 공개</label></div>
      <div style="text-align:right"><button class="btn btn-p" onclick="savePost(${isEdit ? x.id : 'null'})"><i class="fas fa-save"></i> ${isEdit ? '수정 저장' : '발행하기'}</button></div>
    </div>
    <div class="msg" id="m"></div>
  </div>
  <script>
  function fmt(cmd,val){document.execCommand(cmd,false,val||null);document.getElementById('editor').focus();}
  function insertQuote(){document.execCommand('formatBlock',false,'blockquote');}
  async function uploadFile(f){
    var fd=new FormData();fd.append('file',f);
    var r=await fetch('/admin/api/upload',{method:'POST',body:fd});
    return await r.json();
  }
  async function insertImgs(files){
    var ed=document.getElementById('editor');
    for(var i=0;i<files.length;i++){
      var j=await uploadFile(files[i]);
      if(j.ok){
        var img=document.createElement('img');img.src='/api/img/'+j.key;img.alt=files[i].name;
        ed.appendChild(img);
        if(!document.getElementById('f-thumb').value)document.getElementById('f-thumb').value=j.key;
      }
    }
  }
  async function uploadThumb(input){
    if(!input.files[0])return;
    var j=await uploadFile(input.files[0]);
    if(j.ok)document.getElementById('f-thumb').value=j.key;
  }
  // 드래그앤드롭
  (function(){
    var ed=document.getElementById('editor');
    ed.addEventListener('dragover',function(e){e.preventDefault();ed.classList.add('dragover');});
    ed.addEventListener('dragleave',function(){ed.classList.remove('dragover');});
    ed.addEventListener('drop',async function(e){
      e.preventDefault();ed.classList.remove('dragover');
      var files=Array.prototype.filter.call(e.dataTransfer.files,function(f){return f.type.indexOf('image/')===0;});
      if(files.length)await insertImgs(files);
    });
  })();
  // 제목 → 슬러그 자동 제안
  document.getElementById('f-title').addEventListener('blur',function(){
    var s=document.getElementById('f-slug');
    if(!s.value.trim()){
      s.value=this.value.trim().toLowerCase().replace(/[^a-z0-9가-힣\\s-]/g,'').replace(/\\s+/g,'-').slice(0,60)||('post-'+Date.now());
    }
  });
  async function savePost(id){
    var m=document.getElementById('m');
    var data={
      title:document.getElementById('f-title').value.trim(),
      slug:document.getElementById('f-slug').value.trim(),
      excerpt:document.getElementById('f-excerpt').value.trim(),
      author_slug:document.getElementById('f-author').value,
      thumbnail:document.getElementById('f-thumb').value||null,
      content_html:document.getElementById('editor').innerHTML,
      published:document.getElementById('f-pub').checked?1:0
    };
    if(!data.title||!data.slug){m.className='msg err';m.textContent='제목과 슬러그를 입력해 주세요.';return;}
    var url=id?'/admin/api/posts/'+id:'/admin/api/posts';
    var r=await fetch(url,{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    var j=await r.json();
    if(j.ok){m.className='msg ok';m.textContent='저장되었습니다!';setTimeout(function(){location.href='/admin/posts';},700);}
    else{m.className='msg err';m.textContent=j.error||'저장 실패';}
  }
  </script>`;
}

// ============================================================
// 공지사항 목록 + 작성
// ============================================================
adminContent.get('/notices', async (c) => {
  if (!(await requireAdmin(c))) return c.redirect('/admin');
  const db = c.env.DB!;
  const { results } = await db.prepare('SELECT id, title, is_pinned, views, published, created_at FROM notices ORDER BY is_pinned DESC, id DESC LIMIT 300').all();
  const rows = (results as any[]).map(x => `<tr>
    <td>${x.id}</td>
    <td>${x.is_pinned ? '<span class="badge pin">📌 고정</span> ' : ''}<strong>${esc(x.title)}</strong></td>
    <td>${x.views}</td>
    <td><span class="badge ${x.published ? 'on' : 'off'}">${x.published ? '공개' : '비공개'}</span></td>
    <td style="font-size:.8rem;color:var(--ink-soft)">${(x.created_at || '').slice(0, 10)}</td>
    <td style="white-space:nowrap">
      <a href="/admin/notices/${x.id}" class="btn btn-o btn-sm">수정</a>
      <button class="btn btn-d btn-sm" onclick="delItem('notices',${x.id})">삭제</button>
    </td></tr>`).join('');
  return c.html(adminShell('공지사항', 'notices', `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
    <h1>공지사항</h1>
    <a href="/admin/notices/new" class="btn btn-g"><i class="fas fa-bullhorn"></i> 새 공지 작성</a>
  </div>
  <p class="sub">📌 고정 공지는 목록 최상단에 항상 표시됩니다.</p>
  <div class="card" style="overflow-x:auto">
    <table><thead><tr><th>ID</th><th>제목</th><th>조회수</th><th>상태</th><th>작성일</th><th></th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:var(--ink-soft);padding:30px">작성된 공지가 없습니다.</td></tr>'}</tbody></table>
  </div>
  ${DEL_SCRIPT}`));
});

adminContent.get('/notices/new', async (c) => {
  if (!(await requireAdmin(c))) return c.redirect('/admin');
  return c.html(adminShell('공지 작성', 'notices', noticeForm(null)));
});
adminContent.get('/notices/:id', async (c) => {
  if (!(await requireAdmin(c))) return c.redirect('/admin');
  const db = c.env.DB!;
  const x = await db.prepare('SELECT * FROM notices WHERE id = ?').bind(c.req.param('id')).first<any>();
  if (!x) return c.redirect('/admin/notices');
  return c.html(adminShell('공지 수정', 'notices', noticeForm(x)));
});

function noticeForm(x: any): string {
  const isEdit = !!x;
  return `
  <h1>${isEdit ? '공지 수정' : '새 공지 작성'}</h1>
  <div class="card">
    <label>제목 *</label>
    <input type="text" id="f-title" value="${x ? esc(x.title) : ''}" placeholder="공지 제목">
    <label>사진 (선택)</label>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="f-img" value="${x && x.image ? esc(x.image) : ''}" placeholder="사진 업로드 (선택)" readonly style="flex:1">
      <button class="btn btn-o btn-sm" onclick="document.getElementById('n-file').click()">업로드</button>
      <button class="btn btn-d btn-sm" onclick="document.getElementById('f-img').value=''">제거</button>
      <input type="file" id="n-file" accept="image/*" style="display:none" onchange="uploadN(this)">
    </div>
    <label>내용 *</label>
    <div class="editor-bar">
      <button onclick="fmt('formatBlock','h3')">소제목</button>
      <button onclick="fmt('bold')"><b>B</b></button>
      <button onclick="fmt('insertUnorderedList')">• 목록</button>
    </div>
    <div class="editor-body" id="editor" contenteditable="true" style="min-height:200px">${x ? x.content_html : '<p>공지 내용을 작성하세요...</p>'}</div>
    <div class="row3" style="margin-top:18px;align-items:center">
      <label style="margin:0"><input type="checkbox" id="f-pin" ${x && x.is_pinned ? 'checked' : ''} style="width:auto;margin-right:8px;accent-color:var(--gold)">📌 대장 공지로 고정</label>
      <label style="margin:0"><input type="checkbox" id="f-pub" ${!x || x.published ? 'checked' : ''} style="width:auto;margin-right:8px;accent-color:var(--gold)">사이트에 공개</label>
      <div style="text-align:right"><button class="btn btn-p" onclick="saveNotice(${isEdit ? x.id : 'null'})"><i class="fas fa-save"></i> 저장</button></div>
    </div>
    <div class="msg" id="m"></div>
  </div>
  <script>
  function fmt(cmd,val){document.execCommand(cmd,false,val||null);document.getElementById('editor').focus();}
  async function uploadN(input){
    if(!input.files[0])return;
    var fd=new FormData();fd.append('file',input.files[0]);
    var r=await fetch('/admin/api/upload',{method:'POST',body:fd});var j=await r.json();
    if(j.ok)document.getElementById('f-img').value=j.key;
  }
  async function saveNotice(id){
    var m=document.getElementById('m');
    var data={
      title:document.getElementById('f-title').value.trim(),
      content_html:document.getElementById('editor').innerHTML,
      image:document.getElementById('f-img').value||null,
      is_pinned:document.getElementById('f-pin').checked?1:0,
      published:document.getElementById('f-pub').checked?1:0
    };
    if(!data.title){m.className='msg err';m.textContent='제목을 입력해 주세요.';return;}
    var url=id?'/admin/api/notices/'+id:'/admin/api/notices';
    var r=await fetch(url,{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    var j=await r.json();
    if(j.ok){m.className='msg ok';m.textContent='저장되었습니다!';setTimeout(function(){location.href='/admin/notices';},700);}
    else{m.className='msg err';m.textContent=j.error||'저장 실패';}
  }
  </script>`;
}

const DEL_SCRIPT = `<script>
async function delItem(type,id){
  if(!confirm('정말 삭제할까요? 되돌릴 수 없습니다.'))return;
  await fetch('/admin/api/'+type+'/'+id,{method:'DELETE'});location.reload();
}
</script>`;

// ============================================================
// API — 업로드 / CRUD
// ============================================================
adminContent.post('/api/upload', async (c) => {
  if (!(await requireAdmin(c))) return c.json({ ok: false }, 403);
  const r2 = c.env.R2;
  if (!r2) return c.json({ ok: false, error: 'R2 스토리지가 연결되지 않았습니다.' }, 500);
  const form = await c.req.formData();
  const file = form.get('file') as File | null;
  if (!file) return c.json({ ok: false, error: '파일이 없습니다.' }, 400);
  if (file.size > 10 * 1024 * 1024) return c.json({ ok: false, error: '10MB 이하 이미지만 업로드 가능합니다.' }, 400);
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const key = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  await r2.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || 'image/jpeg' } });
  return c.json({ ok: true, key });
});

// ---- cases CRUD ----
adminContent.post('/api/cases', async (c) => {
  if (!(await requireAdmin(c))) return c.json({ ok: false }, 403);
  const b = await c.req.json();
  await c.env.DB!.prepare(`INSERT INTO cases (title, description, age_group, gender, category, region, doctor_slug, duration,
    img_pano_before, img_pano_after, img_oral_before, img_oral_after, published)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(b.title, b.description || '', b.age_group || '', b.gender || '', b.category || '', b.region || '', b.doctor_slug || '', b.duration || '',
      b.img_pano_before ?? null, b.img_pano_after ?? null, b.img_oral_before ?? null, b.img_oral_after ?? null, b.published ? 1 : 0).run();
  return c.json({ ok: true });
});
adminContent.put('/api/cases/:id', async (c) => {
  if (!(await requireAdmin(c))) return c.json({ ok: false }, 403);
  const b = await c.req.json();
  await c.env.DB!.prepare(`UPDATE cases SET title=?, description=?, age_group=?, gender=?, category=?, region=?, doctor_slug=?, duration=?,
    img_pano_before=?, img_pano_after=?, img_oral_before=?, img_oral_after=?, published=?, updated_at=datetime('now') WHERE id=?`)
    .bind(b.title, b.description || '', b.age_group || '', b.gender || '', b.category || '', b.region || '', b.doctor_slug || '', b.duration || '',
      b.img_pano_before ?? null, b.img_pano_after ?? null, b.img_oral_before ?? null, b.img_oral_after ?? null, b.published ? 1 : 0, c.req.param('id')).run();
  return c.json({ ok: true });
});
adminContent.delete('/api/cases/:id', async (c) => {
  if (!(await requireAdmin(c))) return c.json({ ok: false }, 403);
  await c.env.DB!.prepare('DELETE FROM cases WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ ok: true });
});

// ---- posts CRUD ----
adminContent.post('/api/posts', async (c) => {
  if (!(await requireAdmin(c))) return c.json({ ok: false }, 403);
  const b = await c.req.json();
  const dup = await c.env.DB!.prepare('SELECT id FROM posts WHERE slug = ?').bind(b.slug).first();
  if (dup) return c.json({ ok: false, error: '이미 사용 중인 슬러그입니다.' }, 409);
  await c.env.DB!.prepare(`INSERT INTO posts (slug, title, content_html, excerpt, thumbnail, author_slug, published) VALUES (?,?,?,?,?,?,?)`)
    .bind(b.slug, b.title, b.content_html || '', b.excerpt || '', b.thumbnail ?? null, b.author_slug || '', b.published ? 1 : 0).run();
  return c.json({ ok: true });
});
adminContent.put('/api/posts/:id', async (c) => {
  if (!(await requireAdmin(c))) return c.json({ ok: false }, 403);
  const b = await c.req.json();
  await c.env.DB!.prepare(`UPDATE posts SET slug=?, title=?, content_html=?, excerpt=?, thumbnail=?, author_slug=?, published=?, updated_at=datetime('now') WHERE id=?`)
    .bind(b.slug, b.title, b.content_html || '', b.excerpt || '', b.thumbnail ?? null, b.author_slug || '', b.published ? 1 : 0, c.req.param('id')).run();
  return c.json({ ok: true });
});
adminContent.delete('/api/posts/:id', async (c) => {
  if (!(await requireAdmin(c))) return c.json({ ok: false }, 403);
  await c.env.DB!.prepare('DELETE FROM posts WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ ok: true });
});

// ---- notices CRUD ----
adminContent.post('/api/notices', async (c) => {
  if (!(await requireAdmin(c))) return c.json({ ok: false }, 403);
  const b = await c.req.json();
  await c.env.DB!.prepare(`INSERT INTO notices (title, content_html, image, is_pinned, published) VALUES (?,?,?,?,?)`)
    .bind(b.title, b.content_html || '', b.image ?? null, b.is_pinned ? 1 : 0, b.published ? 1 : 0).run();
  return c.json({ ok: true });
});
adminContent.put('/api/notices/:id', async (c) => {
  if (!(await requireAdmin(c))) return c.json({ ok: false }, 403);
  const b = await c.req.json();
  await c.env.DB!.prepare(`UPDATE notices SET title=?, content_html=?, image=?, is_pinned=?, published=?, updated_at=datetime('now') WHERE id=?`)
    .bind(b.title, b.content_html || '', b.image ?? null, b.is_pinned ? 1 : 0, b.published ? 1 : 0, c.req.param('id')).run();
  return c.json({ ok: true });
});
adminContent.delete('/api/notices/:id', async (c) => {
  if (!(await requireAdmin(c))) return c.json({ ok: false }, 403);
  await c.env.DB!.prepare('DELETE FROM notices WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ ok: true });
});
