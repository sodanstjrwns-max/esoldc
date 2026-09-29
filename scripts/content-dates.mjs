// ============================================================
// 콘텐츠 실제 수정일 산출 (사이트맵 lastmod · llms.txt 최종 갱신용)
// - git blame 으로 "지금 화면에 나오는 본문 줄"이 마지막으로 바뀐 커밋 날짜(KST)를 구한다.
// - .git-blame-ignore-revs 에 적힌 커밋(스키마·og 이미지·링크 정리 등 본문 변화 없는 커밋)은 건너뛴다.
// - vite.config.ts 가 빌드 시 __CONTENT_DATES__ 로 주입한다.
// - 얕은 클론·git 없음 → null → src/data/content-dates.fallback.json 사용.
//   폴백 갱신: node scripts/content-dates.mjs > src/data/content-dates.fallback.json
// - 진료·FAQ·용어사전은 화면 '최종 검토'(src/data/reviewed.ts)와 맞추기 위해 여기서 산출하지 않는다.
// ※ new Date() 로 오늘 날짜를 찍지 않는다 (2026-09-29 SEO/AEO 감사).
// ============================================================
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const run = (cmd) => execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).toString()

function ignoreRevs() {
  const p = resolve(ROOT, '.git-blame-ignore-revs')
  if (!existsSync(p)) return []
  return readFileSync(p, 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter((l) => /^[0-9a-f]{7,40}$/.test(l))
}

const kstDate = (sec) => new Date((sec + 9 * 3600) * 1000).toISOString().slice(0, 10)

/** 파일의 줄별 { text, date } (date = 그 줄을 마지막으로 바꾼 커밋의 KST 날짜, 미커밋·무시 커밋 줄은 '') */
function blame(file) {
  const revs = ignoreRevs()
  const out = run(`git blame --line-porcelain ${revs.map((r) => `--ignore-rev ${r}`).join(' ')} -- ${file}`)
  const rows = []
  let sha = ''
  let time = 0
  for (const line of out.split('\n')) {
    const h = /^([0-9a-f]{40}) \d+ \d+/.exec(line)
    if (h) { sha = h[1]; continue }
    if (line.startsWith('committer-time ')) { time = Number(line.slice(15)); continue }
    if (line.startsWith('\t')) {
      const skip = /^0+$/.test(sha) || revs.some((r) => sha.startsWith(r))
      rows.push({ text: line.slice(1), date: skip ? '' : kstDate(time) })
    }
  }
  return rows
}

const maxDate = (...ds) => ds.flat().filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d || '')).sort().pop() || ''
const datesOf = (rows) => rows.map((r) => r.date)

/** startRe 줄부터 endRe 줄 직전까지 (endRe 없거나 못 찾으면 파일 끝까지) */
function span(rows, startRe, endRe) {
  const s = rows.findIndex((r) => startRe.test(r.text))
  if (s < 0) return []
  let e = rows.length
  if (endRe) { const k = rows.findIndex((r, i) => i > s && endRe.test(r.text)); if (k > 0) e = k }
  return rows.slice(s, e)
}

/** 배열 안 객체 항목별 날짜: keyRe 로 slug 를 잡고, 들여쓰기 open/close 줄로 항목 경계를 찾는다 */
function entries(rows, keyRe, openRe, closeRe) {
  const map = {}
  rows.forEach((r, i) => {
    const m = keyRe.exec(r.text)
    if (!m) return
    let s = i
    while (s > 0 && !openRe.test(rows[s].text)) s--
    let e = i
    while (e < rows.length - 1 && !closeRe.test(rows[e].text)) e++
    map[m[1]] = maxDate(map[m[1]], datesOf(rows.slice(s, e + 1)))
  })
  return map
}

export function computeContentDates() {
  try {
    if (run('git rev-parse --is-shallow-repository').trim() === 'true') return null
    const clinic = blame('src/data/clinic.ts')
    const misc = blame('src/pages/misc.tsx')

    const clinicInfo = maxDate(datesOf(span(clinic, /^export const CLINIC\b/, /^\}/)))
    const doctors = entries(span(clinic, /^export const DOCTORS\b/, /^\];?/), /^ {4}slug: '([^']+)'/, /^ {2}\{\s*$/, /^ {2}\},?\s*$/)
    const areas = entries(span(clinic, /^export const NEARBY_AREAS\b/, /^\];?/), /^ {4}slug: '([^']+)'/, /^ {2}\{\s*$/, /^ {2}\},?\s*$/)
    const priceSeed = maxDate(datesOf(span(clinic, /^export const PRICING\b/, /^\];?/)))
    const fn = (start, end) => maxDate(datesOf(span(misc, start, end)))

    return {
      pages: {
        home: maxDate(datesOf(blame('src/pages/home.tsx')), clinicInfo),
        mission: maxDate(fn(/^export function MissionPage/, /^export function DirectionsPage/), clinicInfo),
        directions: maxDate(fn(/^export function DirectionsPage/, /^export function FaqPage/), clinicInfo),
        pricing: maxDate(fn(/^export function PricingPage/, /^export function ReservationPage/), priceSeed),
        reservation: maxDate(fn(/^export function ReservationPage/, /^export function CasesPage/), clinicInfo),
        doctorsList: maxDate(datesOf(span(blame('src/pages/doctors.tsx'), /^export function DoctorsListPage/, /^export function DoctorDetailPage/)), Object.values(doctors)),
        // 지역 페이지 템플릿(areaFaqs·AreaPage) — 페이지 날짜 = 템플릿·지역 데이터·진료 검토일 중 최신
        areaTemplate: maxDate(fn(/^export function areaFaqs/, /^export function AreaHubPage/), fn(/^export function AreaPage/, /^export function NotFoundPage/)),
      },
      doctors,
      areas,
    }
  } catch {
    return null
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(JSON.stringify(computeContentDates(), null, 2) + '\n')
}
