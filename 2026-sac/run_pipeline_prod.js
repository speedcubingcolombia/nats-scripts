#!/usr/bin/env node
/**
 * SAC 2026 — Production Pipeline + Deploy
 *
 * Runs the full pipeline (3 phases + 2.5) against the WCA live WCIF,
 * then PATCHes the result back to WCA via OAuth.
 *
 * Usage:
 *   cd scc-scripts/2026-sac
 *   node run_pipeline_prod.js [--restore-first]
 *
 * Options:
 *   --restore-first   Restore backup before running pipeline
 *
 * After pipeline completes, opens http://localhost:3030 for OAuth authorization.
 * Open that URL in your browser to complete the deploy.
 */

const path = require('path')
const http = require('http')
const fs = require('fs')

const COMPSCRIPT_DIR = path.resolve(__dirname, '../../compscript')
process.chdir(COMPSCRIPT_DIR)

require(COMPSCRIPT_DIR + '/node_modules/dotenv').config({ path: COMPSCRIPT_DIR + '/.env.PROD' })
const compiler = require(COMPSCRIPT_DIR + '/node_modules/c-preprocessor')
const parser = require(COMPSCRIPT_DIR + '/parser/parser')
const functions = require(COMPSCRIPT_DIR + '/functions/functions')

const SCRIPT_BASE = '../scc-scripts/2026-sac'
const BACKUP_PATH = path.resolve(__dirname, 'backups/WCIF_WCA_live_20260506_233446.json')
const COMP_ID = 'SAC2026'
const WCA_HOST = process.env.WCA_HOST
const CLIENT_ID = process.env.API_KEY
const CLIENT_SECRET = process.env.API_SECRET
const REDIRECT_URI = `http://localhost:3030/auth/oauth_response`

const RESTORE_FIRST = process.argv.includes('--restore-first')

// --- STAFF-ONLY mode (env-gated; default behavior unchanged) ---
// BASE_WCIF=<path>: load this WCIF as the frozen base instead of fetch+reset.
//   Skips Step 1 OAuth/fetch/reset, the OH regroup, phase 2 (group assignment)
//   and phase 2.2 (room swap) — i.e. NEVER regenerates competitor groups.
//   Only staff jobs (phase 3 + 3.5) are recomputed for the new team config.
// OUTPUT_FILE=<path>: write the resulting WCIF to disk and exit before deploy
//   (DEV validation — no OAuth needed). Also asserts competitor groups == base.
const BASE_WCIF = process.env.BASE_WCIF
const OUTPUT_FILE = process.env.OUTPUT_FILE
const STAFF_ONLY = !!BASE_WCIF

// Snapshot competitor assignments (registrantId -> sorted activityId list) for diff.
function snapshotCompetitor(wcif) {
  const m = {}
  for (const p of wcif.persons) {
    m[p.registrantId] = (p.assignments || [])
      .filter(a => a.assignmentCode === 'competitor')
      .map(a => a.activityId).sort((x, y) => x - y)
  }
  return m
}
function diffCompetitor(before, after) {
  const changes = []
  const ids = new Set([...Object.keys(before), ...Object.keys(after)])
  for (const id of ids) {
    const b = (before[id] || []).join(','), a = (after[id] || []).join(',')
    if (b !== a) changes.push({ registrantId: id, before: b, after: a })
  }
  return changes
}

// Pipeline phases
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

async function getOAuthToken(code) {
  const res = await fetch(`${WCA_HOST}/oauth/token`, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code', code,
      client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
    }).toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return res.json()
}

async function patchWCA(token, data) {
  const res = await fetch(`${WCA_HOST}/api/v0/competitions/${COMP_ID}/wcif`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  return { status: res.status, body: await res.text() }
}

async function runPhase(label, scriptSrc, competition) {
  return new Promise((resolve, reject) => {
    console.log(`\n${label}: Compiling...`)
    compiler.compile(scriptSrc, { basePath: SCRIPT_BASE + '/', newLine: '\n' }, async (err, out) => {
      if (err) return reject(new Error('Preprocess: ' + JSON.stringify(err).substring(0, 300)))
      out = out.replace(/\r/g, '').trim()
      console.log(`  ${out.split('\n').length} lines`)
      const ctx = {
        competition, command: out,
        allFunctions: functions.allFunctions,
        dryrun: true,
        logger: { start: () => {}, stop: () => {} },
        udfs: {},
      }
      console.log(`${label}: Executing...`)
      try {
        const result = await parser.parse(out, { session: {} }, {}, ctx, false)
        const errors = result.outputs.filter(o => o.type === 'Exception')
        if (errors.length) errors.slice(0, 3).forEach(e => console.log('  ERROR:', e.data?.substring(0, 200)))
        for (const o of result.outputs) {
          if (o.type === 'StaffAssignmentResult' && Array.isArray(o.data?.warnings) && o.data.warnings.length) {
            for (const w of o.data.warnings) console.log('  WARN:', w)
          }
        }
        resolve(ctx.competition)
      } catch (e) { reject(e) }
    })
  })
}

function tagCompeteRoom(wcif) {
  const ROOM_SLUG = { 'Zona Amarilla': 'amarilla', 'Zona Azul': 'azul', 'Zona Roja': 'roja', 'Zona Morada (Sala BLD)': 'bld', 'Zona Verde (TARIMA)': 'verde' }
  const DAY_NUM = { '2026-06-12': 1, '2026-06-13': 2, '2026-06-14': 3, '2026-06-15': 4 }
  const actMap = {}
  for (const v of wcif.schedule?.venues || []) {
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
  for (const p of wcif.persons) {
    const keys = new Set()
    for (const a of p.assignments || []) {
      if (a.assignmentCode !== 'competitor') continue
      const info = actMap[a.activityId]
      if (!info) continue
      const d = DAY_NUM[info.date]; const s = ROOM_SLUG[info.room]
      if (d && s) keys.add(`compete-d${d}-${s}`)
    }
    if (!keys.size) continue
    let ext = (p.extensions || []).find(e => e.id === 'org.cubingusa.natshelper.v1.Person')
    if (!ext) { ext = { id: 'org.cubingusa.natshelper.v1.Person', specUrl: '', data: { properties: {} } }; p.extensions = p.extensions || []; p.extensions.push(ext) }
    ext.data = ext.data || {}; ext.data.properties = ext.data.properties || {}
    for (const k of keys) ext.data.properties[k] = true
    tagged++
  }
  console.log(`  Tagged ${tagged} persons with compete-room properties`)
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

;(async () => {
  console.log('SAC 2026 — Production Pipeline + Deploy')
  console.log('========================================\n')

  // Step 0: Restore backup if requested
  if (RESTORE_FIRST) {
    console.log('Step 0: Restoring backup via OAuth...')
    console.log('Open http://localhost:3030 to authorize restore.\n')

    await new Promise((resolve) => {
      const server = http.createServer(async (req, res) => {
        const u = new URL(req.url, 'http://localhost:3030')
        if (u.pathname === '/auth/oauth_response' && u.searchParams.get('code')) {
          const t = await getOAuthToken(u.searchParams.get('code'))
          if (!t.access_token) { res.writeHead(500); res.end('Token failed'); server.close(); return }
          const backup = JSON.parse(fs.readFileSync(BACKUP_PATH))
          console.log(`  Restoring ${backup.persons.length} persons...`)
          const r = await patchWCA(t.access_token, { persons: backup.persons, schedule: backup.schedule, events: backup.events })
          console.log(`  Restore: ${r.status}`)
          if (r.status !== 200) { console.error(r.body.substring(0, 300)); process.exit(1) }
          res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<h1>Restored! Close this tab.</h1>')
          server.close(); resolve()
        } else {
          res.writeHead(302, { Location: `${WCA_HOST}/oauth/authorize?client_id=${CLIENT_ID}&scope=public%20manage_competitions&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` }); res.end()
        }
      })
      server.listen(3030)
    })
    console.log('  Backup restored!\n')
  }

  // Step 1: Get OAuth token + fetch authenticated WCIF (has correct activity IDs)
  // STAFF-ONLY mode skips OAuth entirely when only writing an output file (DEV).
  console.log('Step 1: Authorize + fetch authenticated WCIF...')

  const authToken = (STAFF_ONLY && OUTPUT_FILE) ? null : await new Promise((resolve) => {
    console.log('Open http://localhost:3030 to authorize.\n')
    const authServer = http.createServer(async (req, res) => {
      const u = new URL(req.url, 'http://localhost:3030')
      if (u.pathname === '/auth/oauth_response' && u.searchParams.get('code')) {
        const t = await getOAuthToken(u.searchParams.get('code'))
        if (!t.access_token) { res.writeHead(500); res.end('Token failed'); authServer.close(); return }
        res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<h1>Authorized! Pipeline running...</h1>')
        authServer.close(); resolve(t.access_token)
      } else {
        res.writeHead(302, { Location: `${WCA_HOST}/oauth/authorize?client_id=${CLIENT_ID}&scope=public%20manage_competitions&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` }); res.end()
      }
    })
    authServer.listen(3030)
  })

  let wcif, competitorSnapshot
  if (STAFF_ONLY) {
    // Load frozen base (already has competitor groups + schedule + results + props).
    console.log(`STAFF-ONLY: loading frozen base from ${BASE_WCIF}...`)
    wcif = JSON.parse(fs.readFileSync(path.resolve(__dirname, BASE_WCIF)))
    wcif.persons = wcif.persons.filter(p => p.registrantId !== null)
    competitorSnapshot = snapshotCompetitor(wcif)
    // Strip ONLY staff assignments; keep every `competitor` assignment intact.
    let strippedStaff = 0
    for (const p of wcif.persons) {
      const before = (p.assignments || []).length
      p.assignments = (p.assignments || []).filter(a => a.assignmentCode === 'competitor')
      strippedStaff += before - p.assignments.length
    }
    console.log(`  Loaded ${wcif.persons.length} persons; kept competitor groups frozen; stripped ${strippedStaff} staff assignments for regen`)
  } else {
    console.log('Fetching authenticated WCIF...')
    // Use PUBLIC API for pipeline (correct activity IDs — authenticated API rearranges them)
    const wcifRes = await fetch(`${WCA_HOST}/api/v0/competitions/${COMP_ID}/wcif/public`)
    wcif = await wcifRes.json()
    wcif.persons = wcif.persons.filter(p => p.registrantId !== null)
    wcif.persons.forEach(p => { p.assignments = []; p.extensions = [] })
    wcif.events.forEach(e => e.rounds.forEach(r => { r.results = [] }))
    for (const v of wcif.schedule?.venues || []) {
      for (const r of v.rooms || []) {
        for (const a of r.activities || []) { a.extensions = []; for (const c of a.childActivities || []) { c.extensions = [] } }
      }
    }
    console.log(`  Reset ${wcif.persons.length} persons`)
  }

  // Regroup OH R1: 3 waves → 4 waves (skipped in STAFF-ONLY — base is already regrouped)
  if (!STAFF_ONLY) {
  console.log('  Regrouping 333oh-r1: 3→4 waves...')
  let regrouped = 0
  for (const v of wcif.schedule?.venues || []) {
    for (const r of v.rooms || []) {
      for (const a of r.activities || []) {
        if (a.activityCode !== '333oh-r1') continue
        const startMs = new Date(a.startTime).getTime()
        const endMs = new Date(a.endTime).getTime()
        const GROUPS = 4
        const duration = (endMs - startMs) / GROUPS
        let maxId = 0
        for (const vv of wcif.schedule.venues) { for (const rr of vv.rooms) { for (const ra of rr.activities) { if (ra.id > maxId) maxId = ra.id; for (const c of ra.childActivities || []) { if (c.id > maxId) maxId = c.id } } } }
        a.childActivities = []
        for (let g = 0; g < GROUPS; g++) {
          const gStart = new Date(startMs + g * duration)
          const gEnd = new Date(startMs + (g + 1) * duration)
          // WCIF stores local Bogotá time with fake Z suffix — keep same format
          const fmtTime = (d) => d.toISOString().replace('.000Z', 'Z')
          a.childActivities.push({
            id: ++maxId,
            name: `${a.name} Group ${g + 1}`,
            activityCode: `333oh-r1-g${g + 1}`,
            startTime: fmtTime(gStart),
            endTime: fmtTime(gEnd),
            childActivities: [],
            scrambleSetId: g + 1,
            extensions: [],
          })
        }
        console.log(`    ${r.name}: ${a.childActivities.map(c => c.activityCode).join(', ')}`)
        console.log(`      Times: ${a.childActivities.map(c => c.startTime.split('T')[1]).join(' | ')}`)
        regrouped++
      }
    }
  }
  console.log(`  Regrouped ${regrouped} rooms\n`)
  } // end if (!STAFF_ONLY) regroup

  // Phase 0.5: Compute scramble quality scores from WCIF personalBests
  console.log('Phase 0.5: Computing scramble quality scores...')
  ;(function() {
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
    console.log(`  Tagged ${tagged} persons with scramble-quality scores\n`)
  })()

  // Step 2: Phase 1
  const afterPhase1 = await runPhase('Phase 1 (import + teams)', phase1, wcif)

  // Step 2.5: Post-hoc team overrides (TL pinning + families)
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
    // ALL STAFF PINNED — definitive team assignments
    // T1 (23)
    setTeam(afterPhase1,'2017GAET01',null,1);setTeam(afterPhase1,'2017PINT05',null,1);setTeam(afterPhase1,'2017POPA01',null,1)
    setTeam(afterPhase1,'2025ACEV05',null,1);setTeam(afterPhase1,'2016CABA07',null,1);setTeam(afterPhase1,'2019LUCE01',null,1)
    setTeam(afterPhase1,'2025LASP01',null,1);setTeam(afterPhase1,'2022LIZA02',null,1);setTeam(afterPhase1,'2024SOLE01',null,1)
    setTeam(afterPhase1,'2025MONG07',null,1);setTeam(afterPhase1,'2024MEDI13',null,1);setTeam(afterPhase1,'2017RODR53',null,1)
    setTeam(afterPhase1,'2015RODR37',null,1);setTeam(afterPhase1,'2024BLAN13',null,1);setTeam(afterPhase1,'2018RODR43',null,1)
    setTeam(afterPhase1,'2017CUES02',null,1);setTeam(afterPhase1,'2024COLO04',null,1);setTeam(afterPhase1,'2018KUMA01',null,1)
    setTeam(afterPhase1,'2018MORO01',null,1);setTeam(afterPhase1,'2024GUTI02',null,1);setTeam(afterPhase1,'2025LANC04',null,1)
    setTeam(afterPhase1,'2021MONS01',null,1);setTeam(afterPhase1,'2013CAST14',null,1)
    // T2 (24)
    setTeam(afterPhase1,'2016SUZU03',null,2);setTeam(afterPhase1,'2014IBAR01',null,2);setTeam(afterPhase1,'2017SOUZ14',null,2)
    setTeam(afterPhase1,null,474236,2);setTeam(afterPhase1,'2023RODR80',null,2);setTeam(afterPhase1,'2013VEGA03',null,2)
    setTeam(afterPhase1,'2022MARI01',null,2);setTeam(afterPhase1,'2010ROSE03',null,2);setTeam(afterPhase1,'2017MORA12',null,2) // Lizcano back in T2 (removal was undeployed, reverted 2026-06-05)
    setTeam(afterPhase1,'2013MOTT01',null,2);setTeam(afterPhase1,'2009GARC02',null,2);setTeam(afterPhase1,'2016RIVE01',null,2)
    setTeam(afterPhase1,'2013GONZ09',null,2);setTeam(afterPhase1,'2023MORE20',null,2);setTeam(afterPhase1,'2017BARR25',null,2)
    setTeam(afterPhase1,'2013RIVE03',null,2);setTeam(afterPhase1,null,510444,1);setTeam(afterPhase1,'2024QUIN14',null,2) // Marcela Ortiz T2→T1 (balance move 2026-06-05)
    setTeam(afterPhase1,'2023GONZ30',null,2);setTeam(afterPhase1,'2017CULM01',null,2);setTeam(afterPhase1,'2022QUIN17',null,2)
    setTeam(afterPhase1,'2019SANC20',null,2);setTeam(afterPhase1,'2022MARQ01',null,2);setTeam(afterPhase1,'2025FUEN05',null,2)
    // T3 (24)
    setTeam(afterPhase1,'2017ONDE01',null,3);setTeam(afterPhase1,'2016MART84',null,3);setTeam(afterPhase1,'2014YUNO01',null,3)
    setTeam(afterPhase1,'2021VARG02',null,3);setTeam(afterPhase1,'2019GUAM01',null,3);setTeam(afterPhase1,'2019GUTI14',null,3)
    setTeam(afterPhase1,'2017GUZM05',null,3);setTeam(afterPhase1,'2023AZUA01',null,3);setTeam(afterPhase1,'2015CAND01',null,3)
    setTeam(afterPhase1,'2015TERR01',null,2);setTeam(afterPhase1,'2023MORR23',null,3);setTeam(afterPhase1,'2023ESPI07',null,3) // 2015TERR01 (Fabricio Yañez) movido T3->T2
    setTeam(afterPhase1,'2014QUIN03',null,3);setTeam(afterPhase1,'2007HERN02',null,3);setTeam(afterPhase1,'2011DION02',null,3)
    setTeam(afterPhase1,'2012MARI04',null,3);setTeam(afterPhase1,'2023BEYA01',null,3);setTeam(afterPhase1,'2023ZVIN01',null,3)
    setTeam(afterPhase1,'2023LAND18',null,3);setTeam(afterPhase1,'2022CUER01',null,3);setTeam(afterPhase1,'2018CRUZ17',null,3)
    setTeam(afterPhase1,'2023SILV54',null,3);setTeam(afterPhase1,'2014BENA03',null,3);setTeam(afterPhase1,'2022CUBI01',null,3)
    // T4 (23 + Johana pending)
    setTeam(afterPhase1,'2017GARC48',null,4);setTeam(afterPhase1,'2014MORE05',null,4);setTeam(afterPhase1,'2014SANC19',null,4)
    setTeam(afterPhase1,'2016NINO01',null,4);setTeam(afterPhase1,'2024SANT99',null,4);setTeam(afterPhase1,'2023FILH05',null,4)
    setTeam(afterPhase1,'2024SANC61',null,4);setTeam(afterPhase1,'2025BELT01',null,3);setTeam(afterPhase1,null,508852,4) // Carlos Beltrán T4→T3 (balance move 2026-06-05)
    setTeam(afterPhase1,'2011PARR02',null,4);setTeam(afterPhase1,'2016SANC08',null,4);setTeam(afterPhase1,'2016PIMI02',null,4)
    setTeam(afterPhase1,'2023RAMI49',null,4);setTeam(afterPhase1,'2025CARD14',null,4);setTeam(afterPhase1,'2023MONT31',null,4)
    setTeam(afterPhase1,'2015HENR02',null,4);setTeam(afterPhase1,'2025FAND01',null,4);setTeam(afterPhase1,'2025CADE01',null,4)
    setTeam(afterPhase1,'2018SOLA08',null,4);setTeam(afterPhase1,'2016RIVE14',null,4);setTeam(afterPhase1,'2024VALD01',null,4)
    setTeam(afterPhase1,'2024SANC70',null,4);setTeam(afterPhase1,'2025ROJA24',null,4)
    setTeam(afterPhase1,null,440824,4)  // Johana Suarez (pending NCP)
    setTeam(afterPhase1,null,541873,4)  // Laura Fandiño (added 2026-06-05, with daughter Marcela Ballén)
    // TL properties
    function setTLPin(w,id,prop){var p=w.persons.find(pp=>pp.wcaId===id);if(!p)return;var e=(p.extensions||[]).find(x=>x.id==='org.cubingusa.natshelper.v1.Person');if(!e){e={id:'org.cubingusa.natshelper.v1.Person',specUrl:'',data:{properties:{}}};p.extensions=p.extensions||[];p.extensions.push(e)}e.data=e.data||{};e.data.properties=e.data.properties||{};e.data.properties[prop]=true;}
    setTLPin(afterPhase1,'2017POPA01','tl-early');setTLPin(afterPhase1,'2017GAET01','tl-late')
    setTLPin(afterPhase1,'2014IBAR01','tl-early');setTLPin(afterPhase1,'2017SOUZ14','tl-late')
    setTLPin(afterPhase1,'2016MART84','tl-early');setTLPin(afterPhase1,'2017ONDE01','tl-late')
    setTLPin(afterPhase1,'2017GARC48','tl-early');setTLPin(afterPhase1,'2014MORE05','tl-late')
    function getTeam(p) {
      var ext = (p.extensions||[]).find(e => e.id === 'org.cubingusa.natshelper.v1.Person')
      return ext?.data?.properties?.['staff-team']
    }
    // TEAMS ARE FIXED. Auto-rebalance is DISABLED — nobody is ever moved off their
    // pinned team. Instead we VERIFY every staff member was explicitly pinned and
    // warn loudly if any imbalance or unpinned-staff remains (deploy should stop).
    var unpinned = afterPhase1.persons.filter(function(p) {
      if (getTeam(p) == null) return false  // not on a team
      return !fixedSet.has(p.wcaUserId)      // has a team but was NOT explicitly pinned
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

  // Phase 1.55: Staff spread — mark half of each team as scr-spread
  console.log('\nPhase 1.55: Staff spread tagging...')
  ;(function() {
    function gp(p){var e=(p.extensions||[]).find(e=>e.id==='org.cubingusa.natshelper.v1.Person');return e?.data?.properties||{};}
    function sp(p,k,v){var e=(p.extensions||[]).find(e=>e.id==='org.cubingusa.natshelper.v1.Person');if(!e){e={id:'org.cubingusa.natshelper.v1.Person',specUrl:'',data:{properties:{}}};p.extensions=p.extensions||[];p.extensions.push(e)}e.data=e.data||{};e.data.properties=e.data.properties||{};e.data.properties[k]=v;}
    var tagged=0;
    for(var team=1;team<=4;team++){
      var members=afterPhase1.persons.filter(function(p){var pr=gp(p);return pr['staff-team']===team&&!pr['team-lead']&&!pr['score-taker'];});
      members.sort(function(a,b){var pa=gp(a),pb=gp(b);var sa=Object.keys(pa).filter(function(k){return k.startsWith('can-scramble-');}).length;var sb=Object.keys(pb).filter(function(k){return k.startsWith('can-scramble-');}).length;return sb-sa;});
      for(var i=0;i<members.length;i++){if(i%2===1){sp(members[i],'scr-spread',true);tagged++;}}
      console.log('  T'+team+': '+members.length+' staff, '+members.filter(function(p){return gp(p)['scr-spread'];}).length+' spread');
    }
    console.log('  Total: '+tagged);
  })()

  // Step 2.6: Balance float sub-zones
  console.log('\nPhase 1.6: Balancing float zone distribution...')
  ;(function() {
    const FLOAT_BY_DAY={1:4,2:1,3:2,4:3};const ZONES=['amarilla','azul','roja']
    let tagged=0
    for(const[dayNum,floatTeam]of Object.entries(FLOAT_BY_DAY)){
      const members=afterPhase1.persons.filter(p=>{let ext=(p.extensions||[]).find(e=>e.id==='org.cubingusa.natshelper.v1.Person');return ext?.data?.properties?.['staff-team']===floatTeam&&!ext?.data?.properties?.['team-lead']})
      for(let i=0;i<members.length;i++){const zone=ZONES[i%3];let ext=(members[i].extensions||[]).find(e=>e.id==='org.cubingusa.natshelper.v1.Person');if(!ext)continue;ext.data.properties['float-zone-d'+dayNum]=zone;tagged++}
      const dist={};members.forEach((m,i)=>{const z=ZONES[i%3];dist[z]=(dist[z]||0)+1})
      console.log('  D'+dayNum+' T'+floatTeam+': '+Object.entries(dist).map(([z,c])=>z+':'+c).join(' '))
    }
    console.log('  Tagged '+tagged+' float zone assignments')
  })()

  // Step 2.7: Tag unofficial competitors
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
      for (const wid of ids) {
        const p = afterPhase1.persons.find(pp => pp.wcaId === wid)
        if (!p) continue
        let ext = (p.extensions||[]).find(e => e.id === 'org.cubingusa.natshelper.v1.Person')
        if (!ext) { ext = { id: 'org.cubingusa.natshelper.v1.Person', specUrl: '', data: { properties: {} } }; p.extensions = p.extensions || []; p.extensions.push(ext) }
        ext.data = ext.data || {}; ext.data.properties = ext.data.properties || {}
        ext.data.properties[tag] = true
        count++
      }
    }
    console.log('  Tagged ' + count + ' unofficial competitor properties')
  })()

  // Phase 1.8: Staff group pre-assignment
  console.log('\nPhase 1.8: Staff group pre-assignment...')
  ;(function() {
    function gp(p){var e=(p.extensions||[]).find(e=>e.id==='org.cubingusa.natshelper.v1.Person');return e?.data?.properties||{};}
    function sp(p,k,v){var e=(p.extensions||[]).find(e=>e.id==='org.cubingusa.natshelper.v1.Person');if(!e){e={id:'org.cubingusa.natshelper.v1.Person',specUrl:'',data:{properties:{}}};p.extensions=p.extensions||[];p.extensions.push(e)}e.data=e.data||{};e.data.properties=e.data.properties||{};e.data.properties[k]=v;}
    var TEAM_ROOM={1:{1:'Zona Amarilla',3:'Zona Roja',4:'Zona Azul'},2:{1:'Zona Azul',2:'Zona Amarilla',4:'Zona Roja'},3:{1:'Zona Roja',2:'Zona Azul',3:'Zona Amarilla'},4:{2:'Zona Roja',3:'Zona Azul',4:'Zona Amarilla'}};
    var FLOAT_TEAM={1:4,2:1,3:2,4:3};
    var EVENT_DAY={'777':1,'666':1,'minx':1,'sq1':1,'clock':1,'555':1,'444':2,'skewb':2,'333':2,'333bf':3,'333oh':3,'222':3,'pyram':3};
    var groupCounts={};
    for(var v of afterPhase1.schedule?.venues||[])for(var r of v.rooms||[])for(var a of r.activities||[]){if(!a.activityCode||!a.activityCode.endsWith('-r1'))continue;var ev=a.activityCode.replace('-r1','');var n=(a.childActivities||[]).length;if(n>0){if(!groupCounts[ev])groupCounts[ev]={};groupCounts[ev][r.name]=n;}}
    var totalTagged=0;
    for(var[ev,dayNum]of Object.entries(EVENT_DAY)){
      var nSample=Object.values(groupCounts[ev]||{})[0];if(!nSample)continue;
      for(var team=1;team<=4;team++){
        var room=TEAM_ROOM[team]?.[dayNum];if(!room)continue;
        var nGroups=groupCounts[ev]?.[room]||nSample;
        var members=afterPhase1.persons.filter(function(p){var pr=gp(p);return pr['staff-team']===team&&!pr['score-taker']&&p.registration?.eventIds?.includes(ev);});
        var tls=members.filter(function(p){return gp(p)['team-lead'];});
        var nonTLs=members.filter(function(p){return !gp(p)['team-lead'];});
        var puzzle={'333bf':'333','333oh':'333'}[ev]||ev;
        nonTLs.sort(function(a,b){var pa=gp(a),pb=gp(b);var sa=pa['can-scramble-'+puzzle]?1:0,sb=pb['can-scramble-'+puzzle]?1:0;if(sb!==sa)return sb-sa;return(pb['scramble-quality-'+puzzle]||0)-(pa['scramble-quality-'+puzzle]||0);});
        // TLs: no force-group. Room scorer keeps them in correct zone.
        for(var i=0;i<nonTLs.length;i++){sp(nonTLs[i],'force-g'+((i%nGroups)+1)+'-'+ev,true);totalTagged++;}
      }
      var floatTeam=FLOAT_TEAM[dayNum];
      var floatMembers=afterPhase1.persons.filter(function(p){var pr=gp(p);return pr['staff-team']===floatTeam&&!pr['score-taker']&&p.registration?.eventIds?.includes(ev);});
      var rooms=Object.keys(groupCounts[ev]||{}).filter(function(r){return !r.includes('Morada')&&!r.includes('Verde');});
      floatMembers.forEach(function(p,i){var ri=i%rooms.length;var room=rooms[ri];var n=groupCounts[ev]?.[room]||nSample;var g=Math.floor(i/rooms.length)%n+1;sp(p,'force-g'+g+'-'+ev,true);totalTagged++;});
    }
    console.log('  Tagged '+totalTagged+' force-group assignments');
  })()

  // Step 3: Phase 2 (group assignments). SKIPPED in STAFF-ONLY — competitor
  // groups come frozen from the base and must never be regenerated.
  const afterPhase2 = STAFF_ONLY
    ? afterPhase1
    : await runPhase('Phase 2 (group assignments)', phase2, afterPhase1)

  // Phase 2.2: Room compliance swap. SKIPPED in STAFF-ONLY — it MOVES `competitor`
  // assignments between rooms, which would change scorecards.
  // The optimizer is a soft scorer + per-iteration one-per-group cap, so it can
  // push staff into the wrong room when many same-team members compete in an
  // event with few room-groups. This deterministic swap fixes that: each staff
  // in the wrong room swaps groups with a non-staff competitor in the correct
  // room (same group number = same time = no conflict, group sizes preserved).
  if (!STAFF_ONLY) {
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
  } // end if (!STAFF_ONLY) phase 2.2

  // Step 4: Phase 2.5
  console.log('\nPhase 2.5: Tagging compete-room properties...')
  tagCompeteRoom(afterPhase2)

  // Step 5: Phase 3
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
    const DAY_NUM_BF = {'2026-06-12':1,'2026-06-13':2,'2026-06-14':3,'2026-06-15':4}
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
      const day = DAY_NUM_BF[g.date]; if (!day) continue
      const teamForRoom = ROOM_TEAM_D[day]?.[g.room]; if (!teamForRoom) continue
      const gStart = new Date(g.start).getTime(), gEnd = new Date(g.end).getTime()
      for (const p of afterPhase3.persons) {
        const pr = getProps3(p)
        if (!pr['team-lead'] || pr['staff-team'] !== teamForRoom) continue
        if (isOccupied(p, gStart, gEnd)) continue
        p.assignments = p.assignments || []
        p.assignments.push({ activityId: parseInt(gId), assignmentCode: 'staff-Delegate' })
        filled++
        console.log('  Filled: ' + g.code + ' @ ' + g.room.replace('Zona ','') + ' <- ' + p.name.substring(0,22))
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

  // Stats
  const totalAssign = afterPhase3.persons.reduce((s, p) => s + (p.assignments || []).length, 0)
  const teams = {}
  for (const p of afterPhase3.persons) {
    const ext = p.extensions?.find(e => e.id === 'org.cubingusa.natshelper.v1.Person')
    const team = ext?.data?.properties?.['staff-team']
    if (team) teams[team] = (teams[team] || 0) + 1
  }
  console.log(`\n=== Pipeline Complete ===`)
  console.log(`Persons: ${afterPhase3.persons.length}`)
  console.log(`Assignments: ${totalAssign}`)
  console.log(`Teams: ${Object.entries(teams).map(([t, c]) => `T${t}:${c}`).join(', ')}`)

  // STAFF-ONLY + OUTPUT_FILE: assert competitor groups unchanged, write result, exit.
  if (OUTPUT_FILE) {
    console.log(`\n=== Competitor-freeze check (vs base) ===`)
    const afterSnap = snapshotCompetitor(afterPhase3)
    const changes = competitorSnapshot ? diffCompetitor(competitorSnapshot, afterSnap) : []
    if (!competitorSnapshot) {
      console.log('  ⚠ No base snapshot (not STAFF_ONLY) — skipping freeze check')
    } else if (changes.length === 0) {
      console.log(`  ✅ PASS — all competitor group assignments identical to base (${Object.keys(afterSnap).length} persons)`)
    } else {
      console.log(`  ❌ FAIL — ${changes.length} persons have changed competitor groups:`)
      changes.slice(0, 20).forEach(c => console.log(`     reg ${c.registrantId}: [${c.before}] → [${c.after}]`))
    }
    const outPath = path.resolve(__dirname, OUTPUT_FILE)
    fs.writeFileSync(outPath, JSON.stringify(afterPhase3))
    console.log(`\n  Wrote ${outPath}`)
    console.log(changes.length === 0 ? '  DEV run OK.' : '  DEV run FAILED freeze check — do NOT deploy.')
    process.exit(changes.length === 0 ? 0 : 1)
  }

  // Step 5.9: PRE-PATCH VALIDATION GATE — validate the EXACT data about to be deployed.
  // Aborts BEFORE any PATCH if any check fails, so nothing broken reaches the WCA.
  console.log(`\n=== Pre-PATCH validation gate ===`)
  {
    const { execSync } = require('child_process')
    const gatePath = path.resolve(__dirname, 'data/outputs/_predeploy_validate.json')
    fs.writeFileSync(gatePath, JSON.stringify(afterPhase3))
    try {
      execSync('node ' + path.resolve(__dirname, 'validate_exhaustive.js') + ' ' + gatePath, { stdio: 'inherit' })
      execSync('node ' + path.resolve(__dirname, 'validate_depth.js') + ' ' + gatePath, { stdio: 'inherit' })
    } catch (e) {
      console.error('\n❌ VALIDATION FAILED — abortando deploy. NADA se envió a la WCA. Revisa los checks arriba.')
      process.exit(1)
    }
    console.log('\n✅ Todas las validaciones pasaron sobre el resultado exacto a desplegar — procediendo al PATCH.')
  }

  // Step 6: PATCH to WCA (using authToken from Step 1)
  console.log(`\n=== Deploy ===`)
  {
      const t = { access_token: authToken }

      // Step A: PATCH schedule (needed when group counts change — e.g. OH R1: 3→4 waves)
      console.log('PATCHing schedule (new groups for OH R1)...')
      const rSched = await patchWCA(t.access_token, { schedule: afterPhase3.schedule })
      console.log(`  Schedule: ${rSched.status}`)
      if (rSched.status !== 200) {
        console.error('Schedule PATCH failed:', rSched.body.substring(0, 500))
        process.exit(1)
      }

      // Fetch authenticated WCIF (has correct activity IDs after schedule PATCH)
      const liveWcif = await (await fetch(`${WCA_HOST}/api/v0/competitions/${COMP_ID}/wcif`, {
        headers: { 'Authorization': `Bearer ${t.access_token}` }
      })).json()

      // Remap activity IDs: pipeline IDs → live IDs (schedule PATCH may reassign IDs)
      console.log('Remapping activity IDs...')
      const pipelineIdMap = {}, liveIdMap = {}
      for (const v of afterPhase3.schedule?.venues || []) {
        for (const r of v.rooms || []) {
          for (const a of r.activities || []) {
            for (const c of a.childActivities || []) { pipelineIdMap[c.activityCode + '@' + r.name] = c.id }
          }
        }
      }
      for (const v of liveWcif.schedule?.venues || []) {
        for (const r of v.rooms || []) {
          for (const a of r.activities || []) {
            for (const c of a.childActivities || []) { liveIdMap[c.activityCode + '@' + r.name] = c.id }
          }
        }
      }
      const idRemap = {}
      for (const [key, pipeId] of Object.entries(pipelineIdMap)) {
        const liveId = liveIdMap[key]
        if (liveId && liveId !== pipeId) idRemap[pipeId] = liveId
      }
      if (Object.keys(idRemap).length > 0) {
        console.log(`  Remapping ${Object.keys(idRemap).length} activity IDs`)
        for (const p of afterPhase3.persons) {
          for (const a of p.assignments || []) {
            if (idRemap[a.activityId]) a.activityId = idRemap[a.activityId]
          }
        }
      } else {
        console.log('  No remapping needed')
      }

      // Delegate backfill using LIVE activity IDs
      console.log('Delegate backfill (post-remap)...')
      {
        const ROOM_TEAM_D = {1:{'Zona Amarilla':1,'Zona Azul':2,'Zona Roja':3},2:{'Zona Amarilla':2,'Zona Azul':3,'Zona Roja':4},3:{'Zona Amarilla':3,'Zona Azul':4,'Zona Roja':1},4:{'Zona Amarilla':4,'Zona Azul':1,'Zona Roja':2}}
        const DAY_NUM_L = {'2026-06-12':1,'2026-06-13':2,'2026-06-14':3,'2026-06-15':4}
        const liveActMap = {}
        for (const v of liveWcif.schedule?.venues || []) {
          for (const r of v.rooms || []) {
            for (const a of r.activities || []) {
              for (const c of a.childActivities || []) {
                liveActMap[c.id] = {code:c.activityCode, room:r.name, start:c.startTime, end:c.endTime, date:(c.startTime||'').slice(0,10)}
              }
            }
          }
        }
        function gp(p){const e=(p.extensions||[]).find(e=>e.id==='org.cubingusa.natshelper.v1.Person');return e?.data?.properties||{};}
        function occ(p,gs,ge){for(const a of p.assignments||[]){if(a.assignmentCode!=='competitor'&&a.assignmentCode!=='staff-Delegate')continue;const ac=liveActMap[a.activityId];if(!ac||!ac.start)continue;const s=new Date(ac.start).getTime(),e=new Date(ac.end).getTime();if(s<ge&&gs<e)return true;}return false;}
        const gDel = {}
        for (const v of liveWcif.schedule?.venues || []) {
          for (const r of v.rooms || []) {
            for (const a of r.activities || []) {
              for (const c of a.childActivities || []) {
                if (!c.activityCode.match(/-r\d+-g\d+/)&&!c.activityCode.match(/-a\d+-g\d+/)) continue
                gDel[c.id] = {code:c.activityCode,room:r.name,start:c.startTime,end:c.endTime,date:(c.startTime||'').slice(0,10),hasDel:false}
              }
            }
          }
        }
        for (const p of afterPhase3.persons) {
          for (const a of p.assignments||[]) {
            if (a.assignmentCode==='staff-Delegate'&&gDel[a.activityId]) gDel[a.activityId].hasDel=true
          }
        }
        let filled=0
        for (const [gId,g] of Object.entries(gDel)) {
          if (g.hasDel) continue
          if (g.room.includes('Morada')||g.room.includes('Verde')) continue
          const day=DAY_NUM_L[g.date];if(!day)continue
          const teamForRoom=ROOM_TEAM_D[day]?.[g.room];if(!teamForRoom)continue
          const gs=new Date(g.start).getTime(),ge=new Date(g.end).getTime()
          for (const p of afterPhase3.persons) {
            const pr=gp(p)
            if(!pr['team-lead']||pr['staff-team']!==teamForRoom)continue
            if(occ(p,gs,ge))continue
            p.assignments=p.assignments||[]
            p.assignments.push({activityId:parseInt(gId),assignmentCode:'staff-Delegate'})
            filled++
            console.log('  Filled: '+g.code+' @ '+g.room.replace('Zona ','')+' <- '+p.name.substring(0,22))
            break
          }
        }
        if(filled===0)console.log('  All groups covered')
        else console.log('  Backfilled '+filled)
      }

      // Step B: Clean all persons (clear assignments + extensions)
      console.log('Cleaning all persons (clearing assignments + extensions)...')
      const cleanPersons = liveWcif.persons.map(p => ({
        ...p,
        assignments: [],
        extensions: [],
      }))
      const rClean = await patchWCA(t.access_token, { persons: cleanPersons })
      console.log(`  Clean: ${rClean.status} (${cleanPersons.length} persons)`)
      if (rClean.status !== 200) {
        console.error(rClean.body.substring(0, 500))
        process.exit(1)
      }

      // Fix: ensure all persons have registration.comments (WCA requires it)
      let fixedComments = 0
      for (const p of afterPhase3.persons) {
        if (!p.registration) {
          p.registration = { eventIds: [], isCompeting: false, comments: 'Staff' }
          fixedComments++
        } else if (!p.registration.comments || p.registration.comments === '') {
          p.registration.comments = 'Staff'
          fixedComments++
        }
      }
      if (fixedComments > 0) console.log(`  Fixed comments for ${fixedComments} persons`)

      // Step C: PATCH persons with pipeline data
      console.log(`PATCHing ${afterPhase3.persons.length} persons (${totalAssign} assignments)...`)
      const r = await patchWCA(t.access_token, { persons: afterPhase3.persons })
      console.log(`  Persons: ${r.status}`)
      console.log(`  Response: ${r.body.substring(0, 500)}`)
      if (r.status === 200) {
        console.log('\n✅ DEPLOY SUCCESSFUL!')
      } else {
        console.error(r.body.substring(0, 500))
      }
      process.exit(r.status === 200 ? 0 : 1)
  }
})().catch(e => { console.error('Pipeline error:', e.message); process.exit(1) })
