// ============================================================================
// GA4 + 전환 이벤트 트래킹
// - 측정 ID는 환경변수 GA_MEASUREMENT_ID로 주입 (없으면 자동 비활성 → 안전)
// - 광고비 효율(전환당 비용)을 측정하기 위한 전환 이벤트를 자동 수집:
//   · 전화 클릭(tel:)        → generate_lead (method: phone)
//   · 예약 폼 제출 성공       → generate_lead (method: form) + conversion
//   · 길찾기/지도 클릭        → directions_click
//   · 카카오/외부 채널 클릭   → channel_click
//   · 진료/지역 페이지 도달   → page_view (GA4 자동)
// ============================================================================

// 현재 요청의 GA 측정 ID를 보관 (요청 단위가 아닌 SSR 모듈 전역이지만,
// Cloudflare Workers는 요청마다 격리 실행되므로 안전)
let _gaId: string | undefined;

export function setGaId(id: string | undefined) {
  _gaId = id && id.trim() ? id.trim() : undefined;
}

export function getGaId(): string | undefined {
  return _gaId;
}

// <head>에 삽입할 GA4 기본 스니펫 (측정 ID 없으면 빈 문자열)
export function gaHeadSnippet(): string {
  if (!_gaId) return '';
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${_gaId}"></script>
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${_gaId}',{anonymize_ip:true});
</script>`;
}

// <body> 끝에 삽입할 전환 이벤트 위임 스크립트
// (gtag 미존재 시에도 에러 없이 동작 — 측정 ID 없으면 빈 문자열)
export function conversionTrackingSnippet(): string {
  if (!_gaId) return '';
  return `<script>
(function(){
  function track(name,params){ if(typeof gtag==='function'){ try{ gtag('event',name,params||{}); }catch(e){} } }
  // 전화 클릭 → 리드
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a'); if(!a)return;
    var href=a.getAttribute('href')||'';
    if(href.indexOf('tel:')===0){ track('generate_lead',{method:'phone',value:1,location:location.pathname}); }
    else if(href.indexOf('/directions')===0||href.indexOf('map')>-1||href.indexOf('naver.me')>-1||href.indexOf('kko.to')>-1){ track('directions_click',{location:location.pathname}); }
    else if(href.indexOf('kakao')>-1||href.indexOf('pf.kakao')>-1||href.indexOf('open.kakao')>-1){ track('channel_click',{channel:'kakao'}); }
  },{passive:true});
  // 예약 폼 성공 제출 → 전역 커스텀 이벤트(misc 폼이 dispatch)
  window.addEventListener('isol:reservation_success',function(ev){
    var d=(ev&&ev.detail)||{};
    track('generate_lead',{method:'form',treatment:d.treatment||'',value:1,location:'/reservation'});
    track('reservation_submit',{treatment:d.treatment||''});
  });
})();
</script>`;
}
