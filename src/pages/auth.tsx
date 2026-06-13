import { html, raw } from 'hono/html';
import { CLINIC } from '../data/clinic';

const AUTH_CSS = `
.auth-wrap{min-height:72vh;display:flex;align-items:center;justify-content:center;padding:120px 20px 80px;background:var(--bg)}
.auth-card{width:100%;max-width:460px;background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);padding:44px 40px;box-shadow:var(--shadow-sm)}
.auth-card h1{font-size:1.7rem;margin-bottom:8px}
.auth-card .sub{color:var(--ink-soft);font-size:.92rem;margin-bottom:28px}
.auth-card label{display:block;font-weight:700;margin:16px 0 7px;font-size:.9rem}
.auth-card input[type=email],.auth-card input[type=tel],.auth-card input[type=text],.auth-card input[type=password]{width:100%;padding:13px 16px;border:1px solid var(--line);border-radius:12px;font-size:1rem;font-family:inherit;transition:border .3s;background:#fff}
.auth-card input:focus{outline:none;border-color:var(--gold)}
.agree-box{margin-top:22px;border:1px solid var(--line);border-radius:14px;padding:16px 18px;background:var(--bg)}
.agree-row{display:flex;gap:10px;align-items:flex-start;font-size:.86rem;color:var(--ink-soft);padding:6px 0}
.agree-row input{margin-top:3px;width:16px;height:16px;accent-color:var(--gold)}
.agree-row label{margin:0;font-weight:400;cursor:pointer}
.agree-row .req{color:var(--gold-3);font-weight:700}
.agree-detail{font-size:.76rem;color:var(--ink-soft);opacity:.75;margin:2px 0 0 26px;line-height:1.55}
.auth-msg{padding:13px 16px;border-radius:12px;margin-top:16px;display:none;font-weight:600;font-size:.9rem}
.auth-msg.ok{display:block;background:var(--gold-soft);color:var(--navy)}
.auth-msg.err{display:block;background:#fde8e8;color:#a33}
.auth-alt{text-align:center;margin-top:22px;font-size:.88rem;color:var(--ink-soft)}
.auth-alt a{color:var(--gold-3);font-weight:700;text-decoration:underline;text-underline-offset:3px}
`;

export function SignupPage() {
  return html`
  <style>${raw(AUTH_CSS)}</style>
  <section class="auth-wrap" id="signup-section">
    <div class="auth-card reveal">
      <div class="mono-lbl">JOIN US</div>
      <h1 style="margin-top:10px">회원가입</h1>
      <p class="sub">가입하시면 비포&애프터 치료 사례를 모두 보실 수 있습니다.</p>
      <form id="signupForm">
        <label for="su-name">성함 *</label>
        <input type="text" id="su-name" name="name" required placeholder="홍길동" autocomplete="name">
        <label for="su-email">이메일 *</label>
        <input type="email" id="su-email" name="email" required placeholder="example@email.com" autocomplete="email">
        <label for="su-phone">휴대전화 *</label>
        <input type="tel" id="su-phone" name="phone" required placeholder="010-0000-0000" autocomplete="tel">
        <label for="su-pw">비밀번호 * <span style="font-weight:400;color:var(--ink-soft);font-size:.8rem">(8자 이상)</span></label>
        <input type="password" id="su-pw" name="password" required minlength="8" placeholder="••••••••" autocomplete="new-password">
        <label for="su-pw2">비밀번호 확인 *</label>
        <input type="password" id="su-pw2" name="password2" required minlength="8" placeholder="••••••••" autocomplete="new-password">

        <div class="agree-box">
          <div class="agree-row">
            <input type="checkbox" id="agreeAll">
            <label for="agreeAll" style="font-weight:700;color:var(--navy)">전체 동의</label>
          </div>
          <div style="border-top:1px solid var(--line);margin:8px 0"></div>
          <div class="agree-row">
            <input type="checkbox" id="agreePrivacy" name="agree_privacy" required>
            <label for="agreePrivacy"><span class="req">[필수]</span> 개인정보 수집·이용 동의</label>
          </div>
          <p class="agree-detail">수집 항목: 성함, 이메일, 휴대전화번호 / 목적: 회원 관리, 치료 사례 열람 서비스 제공 / 보유 기간: 회원 탈퇴 시까지</p>
          <div class="agree-row">
            <input type="checkbox" id="agreeMarketing" name="agree_marketing">
            <label for="agreeMarketing"><span style="color:var(--ink-soft);font-weight:700">[선택]</span> 마케팅 정보 수신 동의</label>
          </div>
          <p class="agree-detail">병원 소식, 이벤트, 건강 정보를 이메일·문자로 받아보실 수 있습니다. 동의하지 않아도 회원가입이 가능합니다.</p>
        </div>

        <button type="submit" class="btn btn-accent" style="width:100%;margin-top:24px;justify-content:center"><i class="fas fa-user-plus"></i> 가입하기</button>
        <div class="auth-msg" id="suMsg"></div>
      </form>
      <p class="auth-alt">이미 회원이신가요? <a href="/login">로그인</a></p>
    </div>
  </section>
  <script>
    (function(){
      var all=document.getElementById('agreeAll'),p=document.getElementById('agreePrivacy'),m=document.getElementById('agreeMarketing');
      all.addEventListener('change',function(){p.checked=all.checked;m.checked=all.checked;});
      [p,m].forEach(function(cb){cb.addEventListener('change',function(){all.checked=p.checked&&m.checked;});});
      document.getElementById('su-phone').addEventListener('input',function(e){
        var v=e.target.value.replace(/[^0-9]/g,'');
        if(v.length>3&&v.length<=7)v=v.slice(0,3)+'-'+v.slice(3);
        else if(v.length>7)v=v.slice(0,3)+'-'+v.slice(3,7)+'-'+v.slice(7,11);
        e.target.value=v;
      });
      document.getElementById('signupForm').addEventListener('submit',async function(e){
        e.preventDefault();
        var msg=document.getElementById('suMsg');
        var pw=document.getElementById('su-pw').value,pw2=document.getElementById('su-pw2').value;
        if(pw!==pw2){msg.className='auth-msg err';msg.textContent='비밀번호가 서로 다릅니다.';return;}
        if(!p.checked){msg.className='auth-msg err';msg.textContent='필수 동의 항목에 체크해 주세요.';return;}
        var data={
          name:document.getElementById('su-name').value.trim(),
          email:document.getElementById('su-email').value.trim(),
          phone:document.getElementById('su-phone').value.trim(),
          password:pw,
          agree_privacy:p.checked?1:0,
          agree_marketing:m.checked?1:0
        };
        try{
          var r=await fetch('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
          var j=await r.json();
          if(j.ok){msg.className='auth-msg ok';msg.textContent='가입이 완료되었습니다! 잠시 후 이동합니다.';setTimeout(function(){location.href=j.redirect||'/';},900);}
          else{msg.className='auth-msg err';msg.textContent=j.error||'가입 중 오류가 발생했습니다.';}
        }catch(_){msg.className='auth-msg err';msg.textContent='네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';}
      });
    })();
  </script>`;
}

export function LoginPage(next?: string) {
  return html`
  <style>${raw(AUTH_CSS)}</style>
  <section class="auth-wrap" id="login-section">
    <div class="auth-card reveal">
      <div class="mono-lbl">WELCOME BACK</div>
      <h1 style="margin-top:10px">로그인</h1>
      <p class="sub">${CLINIC.name} 회원 로그인</p>
      <form id="loginForm">
        <label for="li-email">이메일</label>
        <input type="email" id="li-email" name="email" required placeholder="example@email.com" autocomplete="email">
        <label for="li-pw">비밀번호</label>
        <input type="password" id="li-pw" name="password" required placeholder="••••••••" autocomplete="current-password">
        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:24px;justify-content:center"><i class="fas fa-sign-in-alt"></i> 로그인</button>
        <div class="auth-msg" id="liMsg"></div>
      </form>
      <p class="auth-alt">아직 회원이 아니신가요? <a href="/signup">회원가입</a></p>
    </div>
  </section>
  <script>
    document.getElementById('loginForm').addEventListener('submit',async function(e){
      e.preventDefault();
      var msg=document.getElementById('liMsg');
      var data={email:document.getElementById('li-email').value.trim(),password:document.getElementById('li-pw').value};
      try{
        var r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
        var j=await r.json();
        if(j.ok){msg.className='auth-msg ok';msg.textContent='로그인되었습니다!';setTimeout(function(){location.href=${JSON.stringify(next || '')}||'/';},600);}
        else{msg.className='auth-msg err';msg.textContent=j.error||'이메일 또는 비밀번호를 확인해 주세요.';}
      }catch(_){msg.className='auth-msg err';msg.textContent='네트워크 오류가 발생했습니다.';}
    });
  </script>`;
}
