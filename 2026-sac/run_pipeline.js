#!/usr/bin/env node
/**
 * SAC 2026 - Full Pipeline Runner
 *
 * Runs all CompScript scripts in order and saves the result to the WCIF cache.
 * Usage: cd compscript && ENV=DEV node ../scc-scripts/2026-sac/run_pipeline.js
 */

const path = require('path')
const COMPSCRIPT_DIR = path.resolve(__dirname, '../../compscript')
process.chdir(COMPSCRIPT_DIR)

require(COMPSCRIPT_DIR + '/node_modules/dotenv').config({ path: COMPSCRIPT_DIR + '/.env.' + (process.env.ENV || 'DEV') })
const compiler = require(COMPSCRIPT_DIR + '/node_modules/c-preprocessor')
const parser = require(COMPSCRIPT_DIR + '/parser/parser')
const functions = require(COMPSCRIPT_DIR + '/functions/functions')
const fs = require('fs')

const SCRIPT_BASE = process.env.SCRIPT_BASE || '../scc-scripts/2026-sac'
const CACHE_DIR = '.wcif_cache/' + (process.env.ENV || 'DEV')
const COMP_ID = process.argv[2] || 'SAC2026'

// Phase 1: Import, overrides, populate results, create groups, cluster teams
// Phase 2: Assign competitor groups (needs staff-team from phase 1 for room scorers)
// Phase 3: Staff assignments (needs team + group assignments from phases 1-2)
// Split because Cluster() blocks subsequent expressions in Node.js runner.
const phase1 = `
#include "prep/import.cs"
#include "prep/add_missing_staff.cs"
#include "data/volunteer_properties.cs"
#include "prep/overrides.cs"
#include "prep/populate_r1.cs"
#include "prep/volunteer_teams.cs"
`

// BLD events (2 groups each) are assigned FIRST. assign.js:215 hard-excludes any
// group that overlaps a person's existing competitor assignment. Assigning the
// most time-constrained events (BLD, fewest groups) first lets the regular events
// (more groups) dodge the overlap automatically — no post-hoc swap needed.
const phase2 = `
#include "groups/r1/333bf.cs"
#include "groups/r1/555bf.cs"
#include "groups/r1/444bf.cs"
#include "groups/r1/333mbf.cs"
#include "groups/r1/777.cs"
#include "groups/r1/666.cs"
#include "groups/r1/minx.cs"
#include "groups/r1/sq1.cs"
#include "groups/r1/clock.cs"
#include "groups/r1/555.cs"
#include "groups/r1/444.cs"
#include "groups/r1/skewb.cs"
#include "groups/r1/333.cs"
#include "groups/r1/333oh.cs"
#include "groups/r1/222.cs"
#include "groups/r1/pyram.cs"
`

const phase3 = `
#include "volunteers/day1.cs"
#include "volunteers/day2.cs"
#include "volunteers/day3.cs"
#include "volunteers/day4.cs"
#include "volunteers/unofficial.cs"
`

console.log(`SAC 2026 Pipeline Runner`)
console.log(`Competition: ${COMP_ID}`)
console.log(`Script base: ${SCRIPT_BASE}`)
console.log(`Cache: ${CACHE_DIR}/${COMP_ID}`)
console.log()

// Step 1: Reset WCIF
console.log('Step 1: Resetting WCIF...')
const wcif = JSON.parse(fs.readFileSync(`${CACHE_DIR}/${COMP_ID}`))
// Filter out entries with null registrantId (organizations, unregistered staff)
wcif.persons = wcif.persons.filter(p => p.registrantId !== null)
wcif.persons.forEach(p => { p.assignments = []; p.extensions = [] })
wcif.events.forEach(e => e.rounds.forEach(r => { r.results = [] }))
for (const v of wcif.schedule?.venues || []) {
  for (const r of v.rooms || []) {
    for (const a of r.activities || []) { a.extensions = []; for (const c of a.childActivities || []) { c.extensions = [] } }
  }
}
// Don't save to file — pass directly to parser
console.log(`  Reset ${wcif.persons.length} persons`)

// Phase 0.5: Compute scramble quality scores from WCIF personalBests
console.log('\nPhase 0.5: Computing scramble quality scores...')
;(function tagScramblerQuality() {
  const EVENTS = ['222', '333', '444', '555', '666', '777', 'clock', 'minx', 'pyram', 'skewb', 'sq1']
  const ELITE_THRESHOLD = 200

  const volPropsPath = path.resolve(__dirname, 'data/volunteer_properties.cs')
  const volProps = fs.readFileSync(volPropsPath, 'utf8')
  const canScramble = {}
  for (const m of volProps.matchAll(/SetProperty\(\[([^\]]+)\], "can-scramble-(\w+)", true\)/g)) {
    canScramble[m[2]] = new Set(m[1].split(',').map(s => s.trim()))
  }

  let tagged = 0
  for (const p of wcif.persons) {
    if (!p.wcaId) continue
    let anyScore = false
    for (const event of EVENTS) {
      if (!canScramble[event]?.has(p.wcaId)) continue
      const pb = (p.personalBests || []).find(b => b.eventId === event && b.type === 'single')
      let score = 1
      if (pb) {
        score = pb.continentalRanking <= ELITE_THRESHOLD ? 3 : 2
      }
      let ext = (p.extensions || []).find(e => e.id === 'org.cubingusa.natshelper.v1.Person')
      if (!ext) {
        ext = { id: 'org.cubingusa.natshelper.v1.Person', specUrl: '', data: { properties: {} } }
        p.extensions = p.extensions || []
        p.extensions.push(ext)
      }
      ext.data = ext.data || {}
      ext.data.properties = ext.data.properties || {}
      ext.data.properties[`scramble-quality-${event}`] = score
      anyScore = true
    }
    if (anyScore) tagged++
  }
  console.log(`  Tagged ${tagged} persons with scramble-quality scores`)
})()

async function runPhase(label, scriptSrc, competition) {
  return new Promise((resolve, reject) => {
    console.log(`\n${label}: Compiling...`)
    compiler.compile(scriptSrc, { basePath: SCRIPT_BASE + '/', newLine: '\n' }, async (err, out) => {
      if (err) return reject(new Error('Preprocess: ' + JSON.stringify(err).substring(0, 300)))
      out = out.replace(/\r/g, '').trim()
      console.log(`  ${out.split('\n').length} lines`)

      const ctx = {
        competition,
        command: out,
        allFunctions: functions.allFunctions,
        dryrun: true,
        logger: { start: () => {}, stop: () => {} },
        udfs: {},
      }

      console.log(`${label}: Executing...`)
      try {
        const result = await parser.parse(out, { session: {} }, {}, ctx, false)
        const errors = result.outputs.filter(o => o.type === 'Exception')
        if (errors.length) {
          errors.slice(0, 3).forEach(e => console.log('  ERROR:', e.data?.substring(0, 200)))
        }
        // Extract StaffAssignmentResult warnings (e.g. "Not enough people for activity X")
        for (const o of result.outputs) {
          if (o.type === 'StaffAssignmentResult' && Array.isArray(o.data?.warnings) && o.data.warnings.length) {
            for (const w of o.data.warnings) console.log('  WARN:', w)
          }
        }
        resolve(ctx.competition)
      } catch (e) {
        reject(e)
      }
    })
  })
}

// Phase 3.7 helper: remove staff jobs in blocked windows + backfill from
// eligible, conflict-free staff already working that same room+day.
function applyUnavailability(wcif) {
  const UNAVAILABILITY = [
    // Marvin Solano — Día 1 (Vie 12) en la mañana, hasta el almuerzo (~1pm local = 18:00Z)
    { id: '2018SOLA08', name: 'Marvin Solano', windows: [['2026-06-12T00:00:00Z', '2026-06-12T18:00:00Z']] },
    // Daniel Lizcano — todo el domingo (Día 3, Jun 14)
    { id: '2017MORA12', name: 'Daniel Lizcano', windows: [['2026-06-14T00:00:00Z', '2026-06-15T00:00:00Z']] },
  ]
  const BASE = { '333bf': '333', '333oh': '333', '444bf': '444', '555bf': '555', '333mbf': '333' }
  const ms = z => new Date(z).getTime()
  const gp = p => { const e = (p.extensions || []).find(x => x.id === 'org.cubingusa.natshelper.v1.Person'); return (e && e.data && e.data.properties) || {} }
  const actInfo = {}
  for (const v of wcif.schedule?.venues || []) for (const r of v.rooms || []) for (const a of r.activities || []) {
    const reg = c => { const code = c.activityCode || ''; actInfo[c.id] = { start: c.startTime, end: c.endTime, room: r.name, date: (c.startTime || '').slice(0, 10), code, event: code.split('-')[0] } }
    reg(a); for (const c of a.childActivities || []) reg(c)
  }
  const intervals = p => (p.assignments || []).map(a => actInfo[a.activityId]).filter(i => i && i.start).map(i => [ms(i.start), ms(i.end)])
  const conflict = (p, s, e) => intervals(p).some(([bs, be]) => bs < e && s < be)
  const staffCount = p => (p.assignments || []).filter(a => a.assignmentCode !== 'competitor').length
  const worksRoomDate = (p, room, date) => (p.assignments || []).some(a => { const i = actInfo[a.activityId]; return i && i.room === room && i.date === date })
  const inGroup = (p, actId) => (p.assignments || []).some(a => a.activityId === actId)

  let removed = 0, filled = 0, uncovered = 0
  for (const u of UNAVAILABILITY) {
    const p = wcif.persons.find(x => x.wcaId === u.id)
    if (!p) { console.log('  ⚠ not found: ' + u.id); continue }
    const wins = u.windows.map(([a, b]) => [ms(a), ms(b)])
    const freed = []
    p.assignments = (p.assignments || []).filter(a => {
      if (a.assignmentCode === 'competitor') return true
      const i = actInfo[a.activityId]; if (!i || !i.start) return true
      const s = ms(i.start), e = ms(i.end)
      if (wins.some(([ws, we]) => ws < e && s < we)) { freed.push({ actId: a.activityId, code: a.assignmentCode }); removed++; return false }
      return true
    })
    console.log('  ' + u.name + ': removed ' + freed.length + ' jobs in blocked window(s)')
    for (const slot of freed) {
      const i = actInfo[slot.actId]; const s = ms(i.start), e = ms(i.end)
      const isScr = slot.code === 'staff-scrambler', isDel = slot.code === 'staff-Delegate'
      const base = BASE[i.event] || i.event
      let best = null, bestKey = null
      for (const c of wcif.persons) {
        if (c === p) continue
        const pr = gp(c)
        if (!pr['staff-team'] || pr['score-taker'] || pr['streaming']) continue
        if (isDel ? !pr['team-lead'] : pr['team-lead']) continue
        if (isScr && !pr['can-scramble-' + base]) continue
        if (!worksRoomDate(c, i.room, i.date)) continue   // zone+day eligible by construction
        if (inGroup(c, slot.actId) || conflict(c, s, e)) continue
        const key = [staffCount(c), isScr ? -(pr['scramble-quality-' + base] || 0) : 0]
        if (!best || key[0] < bestKey[0] || (key[0] === bestKey[0] && key[1] < bestKey[1])) { best = c; bestKey = key }
      }
      if (best) { best.assignments = best.assignments || []; best.assignments.push({ activityId: slot.actId, assignmentCode: slot.code }); filled++ }
      else { uncovered++; console.log('    ⚠ sin reemplazo: ' + i.code + ' @ ' + i.room.replace('Zona ', '') + ' (' + slot.code.replace('staff-', '') + ')') }
    }
  }
  console.log('  → removidos ' + removed + ', recubiertos ' + filled + (uncovered ? ', SIN CUBRIR ' + uncovered : ', sin descubiertos ✓'))
}

// Phase 3.8 helper: reserve MBLD cube-submission crew (FLOAT team, good scramblers,
// free/freeable before each attempt) + guarantee a minimum staff per unofficial block.
// "Freeable" = removing a person's overlapping NON-competing jobs, never dropping a
// main-zone group below JUDGE_FLOOR judges.
function ensureCoverage(wcif) {
  const MBLD_SUB_MIN = parseInt(process.env.MBLD_SUB_MIN || '30', 10)
  const MBLD_CREW = 3, MBLD_JUDGE_TGT = 8, UNOFF_MIN_JUDGE = 2, UNOFF_MIN_RUNNER = 1, JUDGE_FLOOR = 13
  const FLOAT_BY_DAY = { 1: 4, 2: 1, 3: 2, 4: 3 }
  const DAY = { '2026-06-12': 1, '2026-06-13': 2, '2026-06-14': 3, '2026-06-15': 4 }
  const ms = z => new Date(z).getTime()
  const gp = p => { const e = (p.extensions || []).find(x => x.id === 'org.cubingusa.natshelper.v1.Person'); return (e && e.data && e.data.properties) || {} }
  const isMain = r => ['Zona Amarilla', 'Zona Azul', 'Zona Roja'].includes(r)
  const actInfo = {}
  for (const v of wcif.schedule?.venues || []) for (const r of v.rooms || []) for (const a of r.activities || []) {
    const reg = c => { const code = c.activityCode || ''; actInfo[c.id] = { start: c.startTime, end: c.endTime, room: r.name, date: (c.startTime || '').slice(0, 10), code, mainGrp: isMain(r.name) && /-r\d+-g\d+$/.test(code) } }
    reg(a); for (const c of a.childActivities || []) reg(c)
  }
  const rows = (p, exceptAid) => (p.assignments || []).filter(a => a.activityId !== exceptAid).map(a => ({ a, i: actInfo[a.activityId] })).filter(x => x.i && x.i.start)
  const competingIn = (p, s, e) => rows(p).some(x => x.a.assignmentCode === 'competitor' && ms(x.i.start) < e && s < ms(x.i.end))
  const staffCount = p => (p.assignments || []).filter(a => a.assignmentCode !== 'competitor').length
  const inGroup = (p, aid) => (p.assignments || []).some(a => a.activityId === aid)
  const worksRoomDate = (p, room, date) => (p.assignments || []).some(a => { const x = actInfo[a.activityId]; return x && x.room === room && x.date === date })
  const countRole = (aid, role) => wcif.persons.filter(p => (p.assignments || []).some(a => a.activityId === aid && a.assignmentCode === 'staff-' + role)).length
  // null if not freeable (would drop a main group below floor); else list of removable jobs
  // freeable: list of removable jobs, or null if removing would violate a floor.
  // Uses LIVE counts (countRole) so it's always correct as assignments mutate.
  const freeable = (p, s, e, keepAid) => {
    const confs = rows(p, keepAid).filter(x => x.a.assignmentCode !== 'competitor' && ms(x.i.start) < e && s < ms(x.i.end))
    for (const x of confs) {
      if (x.i.room.includes('Morada')) return null  // NEVER pull anyone out of BLD (protect MBLD/BLD staffing)
      if (x.a.assignmentCode === 'staff-judge' && x.i.mainGrp && countRole(x.a.activityId, 'judge') <= JUDGE_FLOOR) return null
      if (x.a.assignmentCode === 'staff-scrambler' && countRole(x.a.activityId, 'scrambler') <= 2) return null   // keep >=2 scramblers
      if (x.a.assignmentCode === 'staff-runner' && countRole(x.a.activityId, 'runner') <= 1) return null         // keep >=1 runner
    }
    return confs
  }
  const freeUp = (p, confs) => {
    const k = new Set(confs.map(x => x.a.activityId + '|' + x.a.assignmentCode))
    p.assignments = p.assignments.filter(a => !k.has(a.activityId + '|' + a.assignmentCode))
  }

  // --- MBLD cube-submission crew (float team only, prefer good scramblers) ---
  console.log('  MBLD cube-submission crew (float, window ' + MBLD_SUB_MIN + ' min, swap to keep MBLD count):')
  const W = MBLD_SUB_MIN * 60000
  for (const [idStr, i] of Object.entries(actInfo)) {
    if (!i.code || !/^333mbf-r1-g\d+-a\d+$/.test(i.code)) continue
    const aid = parseInt(idStr), start = ms(i.start), end = ms(i.end), wstart = start - W
    const floatTeam = FLOAT_BY_DAY[DAY[i.date]]
    // The crew must BE MBLD's own staff (no inflating the MBLD roster). Ensure >=MBLD_CREW
    // of the attempt's staff are free in the submission window; if not, swap a not-free-before
    // (non-Delegate) MBLD staffer for a free-before float member — keeping the count constant.
    const onMbld = wcif.persons.filter(p => (p.assignments || []).some(a => a.activityId === aid && a.assignmentCode !== 'competitor'))
    const roleOn = p => ((p.assignments.find(a => a.activityId === aid && a.assignmentCode !== 'competitor')) || {}).assignmentCode
    const freeBefore = p => !competingIn(p, wstart, start) && freeable(p, wstart, start, aid) !== null
    const crew = onMbld.filter(freeBefore)
    let need = MBLD_CREW - crew.length, swapped = 0
    if (need > 0) {
      const repPool = wcif.persons.map(p => ({ p, pr: gp(p), confs: freeable(p, wstart, end, aid) }))
        .filter(x => x.pr['staff-team'] === floatTeam && !x.pr['score-taker'] && !x.pr['streaming'] && !onMbld.includes(x.p) && x.confs !== null && !competingIn(x.p, wstart, end))
      repPool.sort((A, B) => {
        const sa = A.pr['can-scramble-333'] ? 1 : 0, sb = B.pr['can-scramble-333'] ? 1 : 0; if (sb !== sa) return sb - sa
        const qa = A.pr['scramble-quality-333'] || 0, qb = B.pr['scramble-quality-333'] || 0; if (qb !== qa) return qb - qa
        if (A.confs.length !== B.confs.length) return A.confs.length - B.confs.length
        return staffCount(A.p) - staffCount(B.p)
      })
      const swapOut = onMbld.filter(p => !freeBefore(p) && roleOn(p) !== 'staff-Delegate')
      while (need > 0 && repPool.length && swapOut.length) {
        const out = swapOut.shift(), rep = repPool.shift()
        out.assignments = out.assignments.filter(a => !(a.activityId === aid && a.assignmentCode !== 'competitor'))
        freeUp(rep.p, rep.confs)
        if (!inGroup(rep.p, aid)) rep.p.assignments.push({ activityId: aid, assignmentCode: rep.pr['can-scramble-333'] ? 'staff-scrambler' : 'staff-judge' })
        crew.push(rep.p); need--; swapped++
      }
    }
    const finalCrew = crew.slice(0, MBLD_CREW)
    for (const c of finalCrew) { const cf = freeable(c, wstart, start, aid); if (cf) freeUp(c, cf) }
    const names = finalCrew.map(p => { const pr = gp(p); return p.name.split(' ')[0] + (pr['scramble-quality-333'] ? '(q' + pr['scramble-quality-333'] + ')' : '') + (pr['team-lead'] ? '·TL' : '') })
    const total = wcif.persons.filter(p => (p.assignments || []).some(a => a.activityId === aid && a.assignmentCode !== 'competitor')).length
    console.log('    ' + i.code + ' @ ' + i.date + ' (T' + floatTeam + ', ' + total + ' staff MBLD, ' + swapped + ' swaps): crew ' + finalCrew.length + '/' + MBLD_CREW + (finalCrew.length >= MBLD_CREW ? ' ✅' : ' ⚠') + ' → ' + names.join(', '))
  }

  // --- MBLD judges top-up to target (float team, free during the attempt) ---
  console.log('  MBLD judges a target (' + MBLD_JUDGE_TGT + '):')
  for (const [idStr, i] of Object.entries(actInfo)) {
    if (!i.code || !/^333mbf-r1-g\d+-a\d+$/.test(i.code)) continue
    const aid = parseInt(idStr), s = ms(i.start), e = ms(i.end), floatTeam = FLOAT_BY_DAY[DAY[i.date]]
    let added = 0, reloc = 0
    while (countRole(aid, 'judge') < MBLD_JUDGE_TGT) {
      const cand = wcif.persons.map(p => ({ p, pr: gp(p), confs: freeable(p, s, e, aid) }))
        .filter(x => x.pr['staff-team'] === floatTeam && !x.pr['score-taker'] && !x.pr['streaming'] && !x.pr['team-lead']
          && x.confs !== null && !competingIn(x.p, s, e) && !inGroup(x.p, aid))
        .sort((a, b) => (a.confs.length - b.confs.length) || (staffCount(a.p) - staffCount(b.p)))[0]
      if (!cand) break
      freeUp(cand.p, cand.confs); cand.p.assignments.push({ activityId: aid, assignmentCode: 'staff-judge' }); added++
    }
    // Still short? Relocate a float member's OWN competing (scorecards not printed) out of the
    // MBLD window to a non-overlapping wave of the same event+round+zone, then use them as judge.
    while (countRole(aid, 'judge') < MBLD_JUDGE_TGT) {
      let did = false
      for (const F of wcif.persons) {
        const pr = gp(F)
        if (pr['staff-team'] !== floatTeam || pr['team-lead'] || pr['score-taker'] || pr['streaming'] || inGroup(F, aid)) continue
        const ov = (F.assignments || []).map(a => ({ a, i: actInfo[a.activityId] })).filter(x => x.i && x.i.start && ms(x.i.start) < e && s < ms(x.i.end))
        if (ov.length !== 1 || ov[0].a.assignmentCode !== 'competitor') continue   // only thing in window must be their competing
        const x = ov[0], m = (x.i.code || '').match(/^(.+)-r(\d+)-g\d+/); if (!m) continue
        const prefix = m[1] + '-r' + m[2] + '-g', room = x.i.room
        const sizeOf = act2 => wcif.persons.filter(pp => (pp.assignments || []).some(a => a.activityId === act2 && a.assignmentCode === 'competitor')).length
        const target = Object.entries(actInfo).find(([tid, ti]) => {
          if (ti.room !== room || !ti.code || !ti.code.startsWith(prefix) || parseInt(tid) === x.a.activityId) return false
          const ts = ms(ti.start), te = ms(ti.end)
          if (ts < e && s < te) return false                                       // target must NOT overlap MBLD
          if (sizeOf(parseInt(tid)) - sizeOf(x.a.activityId) >= 6) return false      // keep wave spread small
          return !(F.assignments || []).some(aa => { const ii = actInfo[aa.activityId]; return ii && ii.start && ms(ii.start) < te && ts < ms(ii.end) })
        })
        if (!target) continue
        x.a.activityId = parseInt(target[0])                                        // move competing to non-overlapping wave
        F.assignments.push({ activityId: aid, assignmentCode: 'staff-judge' })
        reloc++; did = true; break
      }
      if (!did) break
    }
    console.log('    ' + i.code + ': jueces ' + countRole(aid, 'judge') + '/' + MBLD_JUDGE_TGT + (added ? ' (+' + added + ' libres)' : '') + (reloc ? ' (+' + reloc + ' reubicando su 333oh)' : ''))
  }

  // --- BLD Delegate guarantee: every BLD group MUST have >=1 Delegate (float TL) ---
  console.log('  BLD Delegate guarantee:')
  let bldFixed = 0, bldMiss = 0
  for (const [idStr, i] of Object.entries(actInfo)) {
    if (!i.room.includes('Morada') || !/-(r\d+|a\d+)-g\d+$/.test(i.code || '')) continue
    const aid = parseInt(idStr), s = ms(i.start), e = ms(i.end)
    if (countRole(aid, 'Delegate') >= 1) continue
    const floatTeam = FLOAT_BY_DAY[DAY[i.date]]
    const cand = wcif.persons.map(p => ({ p, pr: gp(p), confs: freeable(p, s, e, aid) }))
      .filter(x => x.pr['staff-team'] === floatTeam && x.pr['team-lead'] && x.confs !== null && !competingIn(x.p, s, e) && !inGroup(x.p, aid))
      .sort((a, b) => a.confs.length - b.confs.length)[0]
    if (cand) { freeUp(cand.p, cand.confs); cand.p.assignments.push({ activityId: aid, assignmentCode: 'staff-Delegate' }); bldFixed++ }
    else { bldMiss++; console.log('    ⚠ ' + i.code + ' sin Delegate y sin TL flotante libre') }
  }
  console.log('    ' + (bldFixed ? bldFixed + ' grupos BLD con Delegate añadido' : 'todos los grupos BLD ya tienen Delegate ✅') + (bldMiss ? ' (' + bldMiss + ' SIN CUBRIR)' : ''))

  // --- Scrambler/runner minimums on every ACTIVE main group (>=2 scr, >=1 run);
  //     3x3 (333) raised to max (3 + 3). Borrows from surplus, never below floors. ---
  console.log('  Scrambler/runner mínimos (activos: >=2scr/>=1run; 333: 3/3):')
  let topped = 0, topMiss = 0
  for (const [idStr, i] of Object.entries(actInfo)) {
    if (!i.mainGrp) continue
    const aid = parseInt(idStr), s = ms(i.start), e = ms(i.end), ev = i.code.split('-')[0]
    if (!wcif.persons.some(p => (p.assignments || []).some(a => a.activityId === aid && a.assignmentCode === 'competitor'))) continue // active only
    const base = (ev === '333bf' || ev === '333oh') ? '333' : ev
    const scrT = ev === '333' ? 3 : 2, runT = ev === '333' ? 3 : 1
    for (const [role, tgt] of [['scrambler', scrT], ['runner', runT]]) {
      while (countRole(aid, role) < tgt) {
        const cand = wcif.persons.map(p => ({ p, pr: gp(p), confs: freeable(p, s, e, aid) }))
          .filter(x => x.pr['staff-team'] && !x.pr['score-taker'] && !x.pr['streaming'] && !x.pr['team-lead']
            && x.confs !== null && !competingIn(x.p, s, e) && !inGroup(x.p, aid) && worksRoomDate(x.p, i.room, i.date)
            && (role !== 'scrambler' || x.pr['can-scramble-' + base]))
          .sort((a, b) => (a.confs.length - b.confs.length) || (staffCount(a.p) - staffCount(b.p)))[0]
        if (!cand) { topMiss++; break }
        freeUp(cand.p, cand.confs); cand.p.assignments.push({ activityId: aid, assignmentCode: 'staff-' + role }); topped++
      }
    }
  }
  console.log('    ' + (topped ? topped + ' slots añadidos' : 'todos los grupos ya en mínimo ✅') + (topMiss ? ' (' + topMiss + ' sin completar)' : ''))

  // --- Unofficial leads: Maarten + Angie on EVERY Tarima block they're free for ---
  // (Maarten competes a couple blocks → skipped there; Angie never competes → all blocks.)
  ;(function () {
    const leads = [['Maarten', wcif.persons.find(p => p.wcaId === '2024GOOS03')], ['Angie', wcif.persons.find(p => p.wcaUserId === 542051)]]
    for (const [label, L] of leads) {
      if (!L) { console.log('  Unoff lead ' + label + ': no encontrado'); continue }
      L.assignments = L.assignments || []
      let added = 0
      for (const [idStr, i] of Object.entries(actInfo)) {
        if (!i.room.includes('Verde')) continue
        const aid = parseInt(idStr), s = ms(i.start), e = ms(i.end)
        if (inGroup(L, aid) || competingIn(L, s, e)) continue   // skip if already there or busy competing
        L.assignments.push({ activityId: aid, assignmentCode: 'staff-Lead' }); added++
      }
      console.log('  Unoff lead ' + label + ' → +' + added + ' bloques Tarima (cubre todos los que está libre)')
    }
  })()

  // --- Unofficial (Zona Verde) minimum staff (borrow from surplus) ---
  console.log('  Unofficial minimum (Lead + ' + UNOFF_MIN_JUDGE + ' judge + ' + UNOFF_MIN_RUNNER + ' runner):')
  let backf = 0, short = 0
  for (const [idStr, i] of Object.entries(actInfo)) {
    if (!i.room.includes('Verde')) continue
    const aid = parseInt(idStr), s = ms(i.start), e = ms(i.end)
    const have = { judge: 0, runner: 0 }
    for (const p of wcif.persons) for (const a of p.assignments || []) if (a.activityId === aid) { const c = a.assignmentCode.replace('staff-', ''); if (c in have) have[c]++ }
    for (const [role, min] of [['judge', UNOFF_MIN_JUDGE], ['runner', UNOFF_MIN_RUNNER]]) {
      let deficit = min - have[role]
      while (deficit > 0) {
        let pick = null, pc = null
        for (const p of wcif.persons) {
          const pr = gp(p)
          if (!pr['staff-team'] || pr['score-taker'] || pr['streaming'] || pr['team-lead'] || inGroup(p, aid) || competingIn(p, s, e)) continue
          const confs = freeable(p, s, e, aid); if (confs === null) continue
          if (!pick || confs.length < pc.length || (confs.length === pc.length && staffCount(p) < staffCount(pick))) { pick = p; pc = confs }
        }
        if (!pick) { short++; break }
        freeUp(pick, pc)
        pick.assignments.push({ activityId: aid, assignmentCode: 'staff-' + role }); backf++; deficit--
      }
    }
  }
  console.log('    Backfilled ' + backf + ' unofficial slots' + (short ? ', ' + short + ' sin cubrir' : ' ✅'))
}

// Run both phases
;(async () => {
  try {
    // Phase 1: Import, overrides, populate, create groups, cluster teams
    const afterPhase1 = await runPhase('Phase 1 (import + teams)', phase1, wcif)

    // Phase 1.5: Post-hoc team overrides (TL pinning + families)
    console.log('\nPhase 1.5: Team overrides (TL pinning + families)...')
    ;(function() {
      const fixedSet = new Set()  // wcaUserId of every explicitly-pinned (fixed) staff
      function setTeam(w, wcaId, userId, team) {
        const p = wcaId ? w.persons.find(pp => pp.wcaId === wcaId) : w.persons.find(pp => pp.wcaUserId === userId)
        if (!p) { console.log('  ⚠ not found: ' + (wcaId || userId)); return }
        let ext = (p.extensions || []).find(e => e.id === 'org.cubingusa.natshelper.v1.Person')
        if (!ext) { ext = { id: 'org.cubingusa.natshelper.v1.Person', specUrl: '', data: { properties: {} } }; p.extensions = p.extensions || []; p.extensions.push(ext) }
        ext.data = ext.data || {}; ext.data.properties = ext.data.properties || {}
        const old = ext.data.properties['staff-team']
        ext.data.properties['staff-team'] = team
        if (p.wcaUserId != null) fixedSet.add(p.wcaUserId)
        console.log('  ' + p.name.substring(0,30) + ': T' + (old||'?') + ' → T' + team)
      }
      // ALL STAFF PINNED — definitive team assignments (94 + Johana pending)
      // T1 (23)
      setTeam(afterPhase1, '2017GAET01', null, 1);setTeam(afterPhase1, '2017PINT05', null, 1);setTeam(afterPhase1, '2017POPA01', null, 1)
      setTeam(afterPhase1, '2025ACEV05', null, 1);setTeam(afterPhase1, '2016CABA07', null, 1);setTeam(afterPhase1, '2019LUCE01', null, 1)
      setTeam(afterPhase1, '2025LASP01', null, 1);setTeam(afterPhase1, '2022LIZA02', null, 1);setTeam(afterPhase1, '2024SOLE01', null, 1)
      setTeam(afterPhase1, '2025MONG07', null, 1);setTeam(afterPhase1, '2024MEDI13', null, 1);setTeam(afterPhase1, '2017RODR53', null, 1)
      setTeam(afterPhase1, '2015RODR37', null, 1);setTeam(afterPhase1, '2024BLAN13', null, 1);setTeam(afterPhase1, '2018RODR43', null, 1)
      setTeam(afterPhase1, '2017CUES02', null, 1);setTeam(afterPhase1, '2024COLO04', null, 1);setTeam(afterPhase1, '2018KUMA01', null, 1)
      setTeam(afterPhase1, '2018MORO01', null, 1);setTeam(afterPhase1, '2024GUTI02', null, 1);setTeam(afterPhase1, '2025LANC04', null, 1)
      setTeam(afterPhase1, '2021MONS01', null, 1);setTeam(afterPhase1, '2013CAST14', null, 1)
      // T2 (24)
      setTeam(afterPhase1, '2016SUZU03', null, 2);setTeam(afterPhase1, '2014IBAR01', null, 2);setTeam(afterPhase1, '2017SOUZ14', null, 2)
      setTeam(afterPhase1, null, 474236, 2);setTeam(afterPhase1, '2023RODR80', null, 2);setTeam(afterPhase1, '2013VEGA03', null, 2)
      setTeam(afterPhase1, '2022MARI01', null, 2);setTeam(afterPhase1, '2010ROSE03', null, 2);setTeam(afterPhase1, '2017MORA12', null, 2) // Lizcano back in T2 (removal was undeployed, reverted 2026-06-05)
      setTeam(afterPhase1, '2013MOTT01', null, 2);setTeam(afterPhase1, '2009GARC02', null, 2);setTeam(afterPhase1, '2016RIVE01', null, 2)
      setTeam(afterPhase1, '2013GONZ09', null, 2);setTeam(afterPhase1, '2023MORE20', null, 2);setTeam(afterPhase1, '2017BARR25', null, 2)
      setTeam(afterPhase1, '2013RIVE03', null, 2);setTeam(afterPhase1, null, 510444, 1);setTeam(afterPhase1, '2024QUIN14', null, 2) // Marcela Ortiz T2→T1 (balance move 2026-06-05)
      setTeam(afterPhase1, '2023GONZ30', null, 2);setTeam(afterPhase1, '2017CULM01', null, 2);setTeam(afterPhase1, '2022QUIN17', null, 2)
      setTeam(afterPhase1, '2019SANC20', null, 2);setTeam(afterPhase1, '2022MARQ01', null, 2);setTeam(afterPhase1, '2025FUEN05', null, 2)
      // T3 (24)
      setTeam(afterPhase1, '2017ONDE01', null, 3);setTeam(afterPhase1, '2016MART84', null, 3);setTeam(afterPhase1, '2014YUNO01', null, 3)
      setTeam(afterPhase1, '2021VARG02', null, 3);setTeam(afterPhase1, '2019GUAM01', null, 3);setTeam(afterPhase1, '2019GUTI14', null, 3)
      setTeam(afterPhase1, '2017GUZM05', null, 3);setTeam(afterPhase1, '2023AZUA01', null, 3);setTeam(afterPhase1, '2015CAND01', null, 3)
      setTeam(afterPhase1, '2015TERR01', null, 2);setTeam(afterPhase1, '2023MORR23', null, 3);setTeam(afterPhase1, '2023ESPI07', null, 3) // 2015TERR01 (Fabricio Yañez) movido T3->T2
      setTeam(afterPhase1, '2014QUIN03', null, 3);setTeam(afterPhase1, '2007HERN02', null, 3);setTeam(afterPhase1, '2011DION02', null, 3)
      setTeam(afterPhase1, '2012MARI04', null, 3);setTeam(afterPhase1, '2023BEYA01', null, 3);setTeam(afterPhase1, '2023ZVIN01', null, 3)
      setTeam(afterPhase1, '2023LAND18', null, 3);setTeam(afterPhase1, '2022CUER01', null, 3);setTeam(afterPhase1, '2018CRUZ17', null, 3)
      setTeam(afterPhase1, '2023SILV54', null, 3);setTeam(afterPhase1, '2014BENA03', null, 3);setTeam(afterPhase1, '2022CUBI01', null, 3)
      // T4 (23 + Johana pending)
      setTeam(afterPhase1, '2017GARC48', null, 4);setTeam(afterPhase1, '2014MORE05', null, 4);setTeam(afterPhase1, '2014SANC19', null, 4)
      setTeam(afterPhase1, '2016NINO01', null, 4);setTeam(afterPhase1, '2024SANT99', null, 4);setTeam(afterPhase1, '2023FILH05', null, 4)
      setTeam(afterPhase1, '2024SANC61', null, 4);setTeam(afterPhase1, '2025BELT01', null, 3);setTeam(afterPhase1, null, 508852, 4) // Carlos Beltrán T4→T3 (balance move 2026-06-05)
      setTeam(afterPhase1, '2011PARR02', null, 4);setTeam(afterPhase1, '2016SANC08', null, 4);setTeam(afterPhase1, '2016PIMI02', null, 4)
      setTeam(afterPhase1, '2023RAMI49', null, 4);setTeam(afterPhase1, '2025CARD14', null, 4);setTeam(afterPhase1, '2023MONT31', null, 4)
      setTeam(afterPhase1, '2015HENR02', null, 4);setTeam(afterPhase1, '2025FAND01', null, 4);setTeam(afterPhase1, '2025CADE01', null, 4)
      setTeam(afterPhase1, '2018SOLA08', null, 4);setTeam(afterPhase1, '2016RIVE14', null, 4);setTeam(afterPhase1, '2024VALD01', null, 4)
      setTeam(afterPhase1, '2024SANC70', null, 4);setTeam(afterPhase1, '2025ROJA24', null, 4)
      setTeam(afterPhase1, null, 440824, 4)  // Johana Suarez (pending NCP)
      setTeam(afterPhase1, null, 541873, 4)  // Laura Fandiño (added 2026-06-05, with daughter Marcela Ballén)

      // TL properties for group distribution
      function setTLPin(w, wcaId, prop) {
        var p = w.persons.find(pp => pp.wcaId === wcaId); if (!p) return;
        var ext = (p.extensions||[]).find(e => e.id === 'org.cubingusa.natshelper.v1.Person');
        if (!ext) { ext = { id:'org.cubingusa.natshelper.v1.Person', specUrl:'', data:{properties:{}} }; p.extensions=p.extensions||[]; p.extensions.push(ext) }
        ext.data = ext.data || {}; ext.data.properties = ext.data.properties || {};
        ext.data.properties[prop] = true;
      }
      setTLPin(afterPhase1, '2017POPA01', 'tl-early');setTLPin(afterPhase1, '2017GAET01', 'tl-late')
      setTLPin(afterPhase1, '2014IBAR01', 'tl-early');setTLPin(afterPhase1, '2017SOUZ14', 'tl-late')
      setTLPin(afterPhase1, '2016MART84', 'tl-early');setTLPin(afterPhase1, '2017ONDE01', 'tl-late')
      setTLPin(afterPhase1, '2017GARC48', 'tl-early');setTLPin(afterPhase1, '2014MORE05', 'tl-late')

      function getTeam(p) {
        var ext = (p.extensions||[]).find(e => e.id === 'org.cubingusa.natshelper.v1.Person')
        return ext?.data?.properties?.['staff-team']
      }
      // TEAMS ARE FIXED. Auto-rebalance is DISABLED — nobody is ever moved off their
      // pinned team. Verify every staff member was explicitly pinned; warn on any
      // imbalance or unpinned-staff (clustering leftover).
      var unpinned = afterPhase1.persons.filter(function(p) {
        if (getTeam(p) == null) return false
        return !fixedSet.has(p.wcaUserId)
      })
      if (unpinned.length) {
        console.log('  ⚠️  WARNING: ' + unpinned.length + ' staff have a team from clustering but were NOT explicitly pinned (could float):')
        unpinned.forEach(function(p){ console.log('      - ' + p.name + ' (T' + getTeam(p) + ')') })
      } else {
        console.log('  ✅ All staff teams are FIXED (every member explicitly pinned).')
      }
      var final = {}
      for (var p of afterPhase1.persons) { var t = getTeam(p); if (t) final[t] = (final[t]||0)+1 }
      var fc = Object.values(final), fmax = Math.max.apply(null, fc), fmin = Math.min.apply(null, fc)
      if (fmax - fmin > 1) console.log('  ⚠️  WARNING: teams imbalanced — review pins (nobody auto-moved).')
      console.log('  Teams (fixed): ' + Object.entries(final).sort().map(([t,c])=>'T'+t+':'+c).join(' '))
    })()

    // Phase 1.55: Staff spread — mark half of each team's staff as "scr-spread"
    // Pushed to late groups by ByFilters in event .cs files,
    // guaranteeing each group has ~50% of team's staff free for Phase 3.
    // Scramblers are prioritized (spread first) so they're always distributed.
    console.log('\nPhase 1.55: Staff spread tagging...')
    ;(function() {
      function getProps55(p) { var ext = (p.extensions||[]).find(e=>e.id==='org.cubingusa.natshelper.v1.Person'); return ext?.data?.properties||{}; }
      function setProp55(p, k, v) {
        var ext = (p.extensions||[]).find(e=>e.id==='org.cubingusa.natshelper.v1.Person');
        if (!ext) { ext = { id:'org.cubingusa.natshelper.v1.Person', specUrl:'', data:{properties:{}} }; p.extensions=p.extensions||[]; p.extensions.push(ext) }
        ext.data = ext.data||{}; ext.data.properties = ext.data.properties||{};
        ext.data.properties[k] = v;
      }
      var tagged = 0;
      for (var team = 1; team <= 4; team++) {
        var members = afterPhase1.persons.filter(function(p) {
          var pr = getProps55(p);
          return pr['staff-team'] === team && !pr['team-lead'] && !pr['score-taker'];
        });
        // Sort: scramblers first (by # events), then non-scramblers
        members.sort(function(a, b) {
          var pa = getProps55(a), pb = getProps55(b);
          var sa = Object.keys(pa).filter(function(k) { return k.startsWith('can-scramble-'); }).length;
          var sb = Object.keys(pb).filter(function(k) { return k.startsWith('can-scramble-'); }).length;
          return sb - sa;
        });
        // Mark alternating: odd-index → scr-spread (prefer late groups)
        for (var i = 0; i < members.length; i++) {
          if (i % 2 === 1) {
            setProp55(members[i], 'scr-spread', true);
            tagged++;
          }
        }
        console.log('  T' + team + ': ' + members.length + ' staff, ' + members.filter(function(p){return getProps55(p)['scr-spread'];}).length + ' spread');
      }
      console.log('  Total: ' + tagged + ' tagged');
    })()

    // Phase 1.6: Balance float sub-zones for even distribution across rooms
    console.log('\nPhase 1.6: Balancing float zone distribution...')
    ;(function() {
      const FLOAT_BY_DAY = { 1: 4, 2: 1, 3: 2, 4: 3 }
      const ZONES = ['amarilla', 'azul', 'roja']
      let tagged = 0
      for (const [dayNum, floatTeam] of Object.entries(FLOAT_BY_DAY)) {
        const members = afterPhase1.persons.filter(p => {
          let ext = (p.extensions || []).find(e => e.id === 'org.cubingusa.natshelper.v1.Person')
          return ext?.data?.properties?.['staff-team'] === floatTeam && !ext?.data?.properties?.['team-lead']
        })
        for (let i = 0; i < members.length; i++) {
          const zone = ZONES[i % 3]
          let ext = (members[i].extensions || []).find(e => e.id === 'org.cubingusa.natshelper.v1.Person')
          if (!ext) continue
          ext.data.properties['float-zone-d' + dayNum] = zone
          tagged++
        }
        const dist = {}
        members.forEach((m, i) => { const z = ZONES[i % 3]; dist[z] = (dist[z] || 0) + 1 })
        console.log('  D' + dayNum + ' T' + floatTeam + ': ' + Object.entries(dist).map(([z, c]) => z + ':' + c).join(' '))
      }
      console.log('  Tagged ' + tagged + ' float zone assignments')
    })()

    // Phase 1.7: Tag unofficial competitors for group optimization
    console.log('\nPhase 1.7: Tagging unofficial competitors...')
    ;(function() {
      const tags = {
        'unoff-mirror': ['2018KUMA01','2023RODR80','2023BELT07','2023SUAR08','2022QUIN17','2021SOTO01','2019GUTI14','2012MARI04','2016CRUZ16','2016BARO02','2024GUTI02','2024HENA04','2023CELI06','2024COLO04','2023MORR23','2023MORE31','2025FUEN05','2023FLOR03','2021OROZ01','2022CUER01','2016CHAV12','2015TERR01','2015TORR12','2017MART94','2023VELE05','2025COND15','2012PERE04','2019DEVE02','2023LOPE96','2024LOPE19','2023PINH03','2024RINC06','2019RODR66','2014BULU01','2015OSPI01','2023STRA33','2023GODO07','2023VALD02','2023VALD03','2023MAZU05','2024ORTI07','2018GONZ30','2023GOME49','2016SUZU03'],
        'unoff-kilominx': ['2023RODR80','2023SUAR08','2018KUMA01','2021SOTO01','2022MUNA04','2012MARI04','2016CRUZ16','2016BARO02','2019BUIT01','2023CELI06','2024COLO04','2023MORR23','2021OROZ01','2015TERR01','2017MART94','2023VELE05','2012PERE04','2024MEJI05','2023LOPE96','2024LOPE19','2023PINH03','2019RODR66','2014BULU01','2018CRUZ17','2023STRA33','2023GODO07','2023MAZU05','2018GONZ30','2023GOME49'],
        'unoff-fto': ['2023RODR80','2023SUAR08','2022QUIN17','2019GUTI14','2016CRUZ16','2016BARO02','2017POPA01','2019BUIT01','2014ARGA01','2023MORR23','2016SUZU03','2022CUER01','2024ESCA04','2015TERR01','2023VILL10','2017MART94','2024GOOS03','2024LOPE19','2019DEVE02','2023PINH03','2019RODR66','2014BULU01','2018GONZ30'],
        'unoff-tb': ['2023BELT07','2023CELI06','2014AMAY01','2022SAND19','2023SUAR08','2021SOTO01','2022QUIN17','2023MORE50','2019GUTI14','2024GUTI02','2017POPA01','2017MUNO06','2014ARGA01','2016GONZ52','2024COLO04','2023MORR23','2025FUEN05','2023MONT31','2023FLOR03','2021OROZ01','2017CUES02','2022PUEN01','2017MART94','2017TOYS01','2023VELE05','2022CUER01','2018GONZ09','2017SANC20','2024MEJI05','2024ORTI07','2023LOPE96','2024LOPE19','2023PINH03','2023VIDA12','2019RODR66','2014BULU01','2016CARD07','2019DEVE02','2023STRA33','2023GODO07'],
      }
      let count = 0
      for (const [tag, ids] of Object.entries(tags)) {
        for (const wcaId of ids) {
          const p = afterPhase1.persons.find(pp => pp.wcaId === wcaId)
          if (!p) continue
          let ext = (p.extensions || []).find(e => e.id === 'org.cubingusa.natshelper.v1.Person')
          if (!ext) { ext = { id: 'org.cubingusa.natshelper.v1.Person', specUrl: '', data: { properties: {} } }; p.extensions = p.extensions || []; p.extensions.push(ext) }
          ext.data = ext.data || {}; ext.data.properties = ext.data.properties || {}
          ext.data.properties[tag] = true
          count++
        }
      }
      console.log('  Tagged ' + count + ' unofficial competitor properties')
    })()

    // Phase 1.8: Staff group pre-assignment
    // Pre-compute which group each staff member should compete in.
    // Tags force-g{N}-{eventCode} = true. Enforced by -200000 scorers in .cs files.
    console.log('\nPhase 1.8: Staff group pre-assignment...')
    ;(function() {
      function gp(p) { var ext = (p.extensions||[]).find(e=>e.id==='org.cubingusa.natshelper.v1.Person'); return ext?.data?.properties||{}; }
      function sp(p, k, v) {
        var ext = (p.extensions||[]).find(e=>e.id==='org.cubingusa.natshelper.v1.Person');
        if (!ext) { ext = {id:'org.cubingusa.natshelper.v1.Person',specUrl:'',data:{properties:{}}}; p.extensions=p.extensions||[]; p.extensions.push(ext) }
        ext.data=ext.data||{}; ext.data.properties=ext.data.properties||{};
        ext.data.properties[k] = v;
      }

      const TEAM_ROOM = {
        1: {1:'Zona Amarilla',3:'Zona Roja',4:'Zona Azul'},
        2: {1:'Zona Azul',2:'Zona Amarilla',4:'Zona Roja'},
        3: {1:'Zona Roja',2:'Zona Azul',3:'Zona Amarilla'},
        4: {2:'Zona Roja',3:'Zona Azul',4:'Zona Amarilla'},
      }
      const FLOAT_TEAM = {1:4,2:1,3:2,4:3}
      const EVENT_DAY = {'777':1,'666':1,'minx':1,'sq1':1,'clock':1,'555':1,
        '444':2,'skewb':2,'333':2,'333bf':3,'333oh':3,'222':3,'pyram':3}

      // Get group counts per event per room from schedule
      var groupCounts = {}
      for (var v of afterPhase1.schedule?.venues || []) {
        for (var r of v.rooms || []) {
          for (var a of r.activities || []) {
            if (!a.activityCode || !a.activityCode.endsWith('-r1')) continue
            var ev = a.activityCode.replace('-r1','')
            var nGroups = (a.childActivities||[]).length
            if (nGroups > 0) {
              if (!groupCounts[ev]) groupCounts[ev] = {}
              groupCounts[ev][r.name] = nGroups
            }
          }
        }
      }

      var totalTagged = 0
      for (var [ev, dayNum] of Object.entries(EVENT_DAY)) {
        var nGroupsSample = Object.values(groupCounts[ev] || {})[0]
        if (!nGroupsSample) continue

        // For each main room (3 rooms)
        for (var team = 1; team <= 4; team++) {
          var room = TEAM_ROOM[team]?.[dayNum]
          if (!room) continue // float team
          var nGroups = groupCounts[ev]?.[room] || nGroupsSample

          // Get team's staff registered for this event (non-TL, non-ST)
          var teamMembers = afterPhase1.persons.filter(function(p) {
            var pr = gp(p)
            if (pr['staff-team'] !== team) return false
            if (pr['score-taker']) return false
            if (!p.registration?.eventIds?.includes(ev === '333bf' ? '333bf' : ev === '333oh' ? '333oh' : ev)) return false
            return true
          })

          // Separate TLs and non-TLs
          var tls = teamMembers.filter(function(p) { return gp(p)['team-lead'] })
          var nonTLs = teamMembers.filter(function(p) { return !gp(p)['team-lead'] })

          // Sort non-TLs: scramblers first (by scramble event count desc)
          var puzzle = {'333bf':'333','333oh':'333'}[ev] || ev
          nonTLs.sort(function(a,b) {
            var pa = gp(a), pb = gp(b)
            var sa = pa['can-scramble-'+puzzle] ? 1 : 0
            var sb = pb['can-scramble-'+puzzle] ? 1 : 0
            if (sb !== sa) return sb - sa // scramblers first
            // Among scramblers, sort by quality desc
            var qa = pa['scramble-quality-'+puzzle] || 0
            var qb = pb['scramble-quality-'+puzzle] || 0
            return qb - qa
          })

          // TLs: no force-group. Room scorer (-500000) keeps them in correct zone.
          // tl-early/tl-late helps separation but zone compliance is priority.

          // Assign non-TLs: round-robin (scramblers distributed first due to sort)
          for (var i = 0; i < nonTLs.length; i++) {
            var g = (i % nGroups) + 1
            sp(nonTLs[i], 'force-g' + g + '-' + ev, true)
            totalTagged++
          }
        }

        // Also handle float team members with float-zone assignments
        var floatTeam = FLOAT_TEAM[dayNum]
        var floatMembers = afterPhase1.persons.filter(function(p) {
          var pr = gp(p)
          return pr['staff-team'] === floatTeam && !pr['score-taker'] &&
                 p.registration?.eventIds?.includes(ev)
        })
        // Distribute float across rooms evenly, then round-robin within each room
        var rooms = Object.keys(groupCounts[ev] || {}).filter(function(r) { return !r.includes('Morada') && !r.includes('Verde') })
        floatMembers.forEach(function(p, i) {
          var roomIdx = i % rooms.length
          var room = rooms[roomIdx]
          var nGroups = groupCounts[ev]?.[room] || nGroupsSample
          var gInRoom = Math.floor(i / rooms.length) % nGroups + 1
          sp(p, 'force-g' + gInRoom + '-' + ev, true)
          totalTagged++
        })
      }
      console.log('  Tagged ' + totalTagged + ' force-group assignments')
    })()

    // Phase 2: Assign competitor groups (needs staff-team from phase 1)
    const afterPhase2 = await runPhase('Phase 2 (group assignments)', phase2, afterPhase1)

    // Phase 2.2: Room compliance swap.
    // The optimizer is a soft scorer + per-iteration one-per-group cap, so it can
    // push staff into the wrong room when many same-team members compete in an
    // event with few room-groups. This deterministic swap fixes that: each staff
    // in the wrong room swaps groups with a non-staff competitor in the correct
    // room (same group number = same time = no conflict, group sizes preserved).
    console.log('\nPhase 2.2: Room compliance swap...')
    ;(function() {
      const TEAM_ROOM_S = {
        1: {1:'Zona Amarilla',3:'Zona Roja',4:'Zona Azul'},
        2: {1:'Zona Azul',2:'Zona Amarilla',4:'Zona Roja'},
        3: {1:'Zona Roja',2:'Zona Azul',3:'Zona Amarilla'},
        4: {2:'Zona Roja',3:'Zona Azul',4:'Zona Amarilla'},
      }
      const FLOAT_TEAM_S = {1:4,2:1,3:2,4:3}
      const DAY_S = {'2026-06-12':1,'2026-06-13':2,'2026-06-14':3,'2026-06-15':4}
      function gp2(p){var ext=(p.extensions||[]).find(e=>e.id==='org.cubingusa.natshelper.v1.Person');return ext?.data?.properties||{};}

      // Map: activityId -> {event, room, groupNum, date}
      const actInfo = {}
      // Map: event|date|groupNum|room -> activityId (to find swap targets)
      const actByKey = {}
      for (const v of afterPhase2.schedule?.venues || []) {
        for (const r of v.rooms || []) {
          for (const a of r.activities || []) {
            for (const c of a.childActivities || []) {
              const m = c.activityCode.match(/^(\w+)-r1-g(\d+)$/)
              if (!m) continue
              const info = { event: m[1], room: r.name, groupNum: +m[2], date: (c.startTime||'').slice(0,10) }
              actInfo[c.id] = info
              actByKey[m[1]+'|'+info.date+'|'+m[2]+'|'+r.name] = c.id
            }
          }
        }
      }

      // Index: activityId -> list of person objects (competitors)
      const compByActivity = {}
      for (const p of afterPhase2.persons) {
        for (const asn of p.assignments || []) {
          if (asn.assignmentCode !== 'competitor') continue
          if (!actInfo[asn.activityId]) continue
          ;(compByActivity[asn.activityId] = compByActivity[asn.activityId] || []).push(p)
        }
      }

      let swaps = 0, unfixable = 0
      for (const staff of afterPhase2.persons) {
        const pr = gp2(staff)
        const team = pr['staff-team']
        if (!team) continue
        for (const asn of staff.assignments || []) {
          if (asn.assignmentCode !== 'competitor') continue
          const info = actInfo[asn.activityId]
          if (!info) continue
          if (info.room.includes('Morada') || info.room.includes('Verde')) continue // BLD/unofficial: no room constraint
          const day = DAY_S[info.date]
          if (!day || FLOAT_TEAM_S[day] === team) continue // float day = no constraint
          const correctRoom = TEAM_ROOM_S[team]?.[day]
          if (!correctRoom || info.room === correctRoom) continue // already correct

          // Find the matching group in the correct room (same group number = same time)
          const targetActId = actByKey[info.event+'|'+info.date+'|'+info.groupNum+'|'+correctRoom]
          if (!targetActId) { unfixable++; continue }

          // Find a non-staff competitor in the target group to swap with
          const candidates = compByActivity[targetActId] || []
          const swapTarget = candidates.find(c => {
            const cpr = gp2(c)
            return !cpr['staff-team'] && !cpr['score-taker'] && !cpr['streaming']
          })
          if (!swapTarget) { unfixable++; continue }

          // Swap: staff -> targetActId, swapTarget -> staff's old activity
          const staffAsn = staff.assignments.find(x => x.activityId === asn.activityId && x.assignmentCode === 'competitor')
          const targetAsn = swapTarget.assignments.find(x => x.activityId === targetActId && x.assignmentCode === 'competitor')
          staffAsn.activityId = targetActId
          targetAsn.activityId = asn.activityId
          // Update index so subsequent swaps see the new state
          compByActivity[asn.activityId] = (compByActivity[asn.activityId]||[]).filter(p => p !== staff)
          compByActivity[asn.activityId].push(swapTarget)
          compByActivity[targetActId] = (compByActivity[targetActId]||[]).filter(p => p !== swapTarget)
          compByActivity[targetActId].push(staff)
          swaps++
        }
      }
      console.log('  Swapped ' + swaps + ' staff into correct room' + (unfixable > 0 ? ' (' + unfixable + ' unfixable)' : ''))
    })()

    // Phase 2.5: Tag each person with compete-d{N}-{room} properties so
    // day scripts can reward staffers for staying in the room they compete in.
    console.log('\nPhase 2.5: Tagging compete-room properties...')
    const ROOM_SLUG = {
      'Zona Amarilla': 'amarilla',
      'Zona Azul': 'azul',
      'Zona Roja': 'roja',
      'Zona Morada (Sala BLD)': 'bld',
      'Zona Verde (TARIMA)': 'verde',
    }
    const DAY_NUM = {
      '2026-06-12': 1,
      '2026-06-13': 2,
      '2026-06-14': 3,
      '2026-06-15': 4,
    }
    const actMap = {}
    for (const v of afterPhase2.schedule?.venues || []) {
      for (const r of v.rooms || []) {
        for (const a of r.activities || []) {
          actMap[a.id] = { date: (a.startTime || '').slice(0, 10), room: r.name }
          for (const c of a.childActivities || []) {
            actMap[c.id] = { date: (c.startTime || '').slice(0, 10), room: r.name }
          }
        }
      }
    }
    let tagged = 0
    for (const p of afterPhase2.persons) {
      const keys = new Set()
      for (const a of p.assignments || []) {
        if (a.assignmentCode !== 'competitor') continue
        const info = actMap[a.activityId]
        if (!info) continue
        const d = DAY_NUM[info.date]
        const s = ROOM_SLUG[info.room]
        if (d && s) keys.add(`compete-d${d}-${s}`)
      }
      if (!keys.size) continue
      let ext = (p.extensions || []).find(e => e.id === 'org.cubingusa.natshelper.v1.Person')
      if (!ext) {
        ext = { id: 'org.cubingusa.natshelper.v1.Person', specUrl: '', data: { properties: {} } }
        p.extensions = p.extensions || []
        p.extensions.push(ext)
      }
      ext.data = ext.data || {}
      ext.data.properties = ext.data.properties || {}
      for (const k of keys) ext.data.properties[k] = true
      tagged++
    }
    console.log(`  Tagged ${tagged} persons with compete-room properties`)

    // Phase 2.7: Assign float "home room" — the room where each float member competes most
    console.log('\nPhase 2.7: Assigning float home rooms...')
    ;(function() {
      const FLOAT_BY_DAY = { '2026-06-12': 4, '2026-06-13': 1, '2026-06-14': 2, '2026-06-15': 3 }
      const MAIN_ROOMS = ['Zona Amarilla', 'Zona Azul', 'Zona Roja']
      let tagged = 0
      for (const p of afterPhase2.persons) {
        let ext = (p.extensions || []).find(e => e.id === 'org.cubingusa.natshelper.v1.Person')
        if (!ext) continue
        const team = ext.data?.properties?.['staff-team']
        if (!team) continue

        for (const [date, floatTeam] of Object.entries(FLOAT_BY_DAY)) {
          if (team !== floatTeam) continue
          const dayNum = DAY_NUM[date]
          const roomCounts = {}
          for (const a of p.assignments || []) {
            if (a.assignmentCode !== 'competitor') continue
            const info = actMap[a.activityId]
            if (!info || info.date !== date || !MAIN_ROOMS.includes(info.room)) continue
            roomCounts[info.room] = (roomCounts[info.room] || 0) + 1
          }
          const best = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0]
          if (best) {
            const slug = ROOM_SLUG[best[0]]
            ext.data.properties['float-home-d' + dayNum] = slug
            tagged++
          }
        }
      }
      console.log(`  Tagged ${tagged} float home rooms`)
    })()

    // Phase 3: Staff assignments (needs team + group data from phases 1-2)
    const afterPhase3 = await runPhase('Phase 3 (staff assignments)', phase3, afterPhase2)

    // Phase 3.5: Delegate backfill — TLs must ALWAYS delegate in their zone when free
    console.log('\nPhase 3.5: Delegate backfill...')
    ;(function() {
      const ROOM_TEAM_D = {
        1: {'Zona Amarilla':1,'Zona Azul':2,'Zona Roja':3},
        2: {'Zona Amarilla':2,'Zona Azul':3,'Zona Roja':4},
        3: {'Zona Amarilla':3,'Zona Azul':4,'Zona Roja':1},
        4: {'Zona Amarilla':4,'Zona Azul':1,'Zona Roja':2},
      }
      const actMap3 = {}
      for (const v of afterPhase3.schedule?.venues || []) {
        for (const r of v.rooms || []) {
          for (const a of r.activities || []) {
            for (const c of a.childActivities || []) {
              actMap3[c.id] = { code: c.activityCode, room: r.name, start: c.startTime, end: c.endTime, date: (c.startTime||'').slice(0,10) }
            }
          }
        }
      }
      function getProps3(p) { const ext = (p.extensions||[]).find(e=>e.id==='org.cubingusa.natshelper.v1.Person'); return ext?.data?.properties||{}; }
      function isOccupied(p, gStart, gEnd) {
        for (const a of p.assignments || []) {
          if (a.assignmentCode !== 'competitor' && a.assignmentCode !== 'staff-Delegate') continue
          const act = actMap3[a.activityId]; if (!act || !act.start) continue
          const s = new Date(act.start).getTime(), e = new Date(act.end).getTime()
          if (s < gEnd && gStart < e) return true
        }
        return false
      }

      // Find groups without Delegate
      const groupDel = {}
      for (const v of afterPhase3.schedule?.venues || []) {
        for (const r of v.rooms || []) {
          for (const a of r.activities || []) {
            for (const c of a.childActivities || []) {
              if (!c.activityCode.match(/-r\d+-g\d+/) && !c.activityCode.match(/-a\d+-g\d+/)) continue
              groupDel[c.id] = { code: c.activityCode, room: r.name, start: c.startTime, end: c.endTime, date: (c.startTime||'').slice(0,10), hasDel: false }
            }
          }
        }
      }
      for (const p of afterPhase3.persons) {
        for (const a of p.assignments || []) {
          if (a.assignmentCode === 'staff-Delegate' && groupDel[a.activityId]) groupDel[a.activityId].hasDel = true
        }
      }

      let filled = 0
      for (const [gId, g] of Object.entries(groupDel)) {
        if (g.hasDel) continue
        if (g.room.includes('Morada') || g.room.includes('Verde')) continue
        const day = DAY_NUM[g.date]; if (!day) continue
        const teamForRoom = ROOM_TEAM_D[day]?.[g.room]; if (!teamForRoom) continue
        const gStart = new Date(g.start).getTime(), gEnd = new Date(g.end).getTime()

        // Find free TL of this team
        for (const p of afterPhase3.persons) {
          const pr = getProps3(p)
          if (!pr['team-lead'] || pr['staff-team'] !== teamForRoom) continue
          if (isOccupied(p, gStart, gEnd)) continue
          // Assign as Delegate
          p.assignments = p.assignments || []
          p.assignments.push({ activityId: parseInt(gId), assignmentCode: 'staff-Delegate' })
          filled++
          console.log('  Filled: ' + g.code + ' @ ' + g.room.replace('Zona ','') + ' ← ' + p.name.substring(0,22))
          break
        }
      }
      if (filled === 0) console.log('  All groups already covered')
      else console.log('  Backfilled ' + filled + ' Delegate assignments')
    })()

    // Phase 3.7: Staff unavailability — remove jobs in blocked windows + backfill
    console.log('\nPhase 3.7: Staff unavailability windows...')
    applyUnavailability(afterPhase3)

    // Phase 3.8: MBLD submission crew + unofficial minimum staffing
    console.log('\nPhase 3.8: MBLD submission crew + unofficial minimum...')
    ensureCoverage(afterPhase3)

    // Save
    fs.writeFileSync(`${CACHE_DIR}/${COMP_ID}`, JSON.stringify(afterPhase3))
    console.log('\nSaved WCIF')

    // Stats
    const comp = afterPhase3
    const byCode = {}
    let teams = {}
    for (const p of comp.persons) {
      for (const a of p.assignments || []) {
        byCode[a.assignmentCode] = (byCode[a.assignmentCode] || 0) + 1
      }
      const ext = p.extensions?.find(e => e.id === 'org.cubingusa.natshelper.v1.Person')
      const team = ext?.data?.properties?.['staff-team']
      if (team) teams[team] = (teams[team] || 0) + 1
    }

    let totalGroups = 0
    for (const v of comp.schedule?.venues || []) {
      for (const r of v.rooms || []) {
        for (const a of r.activities || []) {
          totalGroups += (a.childActivities || []).length
        }
      }
    }

    console.log()
    console.log('=== Results ===')
    console.log(`Persons: ${comp.persons.length}`)
    console.log(`Groups: ${totalGroups}`)
    console.log(`Assignments:`)
    for (const [code, count] of Object.entries(byCode).sort()) {
      console.log(`  ${code}: ${count}`)
    }
    if (Object.keys(teams).length > 0) {
      console.log(`Teams:`)
      for (const [t, count] of Object.entries(teams).sort()) {
        console.log(`  Team ${t}: ${count} members`)
      }
    }
    console.log('\nDone!')
  } catch (e) {
    console.error('Pipeline error:', e.message)
    process.exit(1)
  }
})()
