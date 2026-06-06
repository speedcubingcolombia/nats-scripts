#!/usr/bin/env node
/*
 * Exhaustive validation suite for SAC 2026 deployed WCIF.
 * Usage: node validate_exhaustive.js /path/to/wcif.json
 */
const fs = require('fs')

const PATH = process.argv[2] || '/tmp/prod_authenticated.json'
const w = JSON.parse(fs.readFileSync(PATH))

function gp(p) {
  const e = (p.extensions || []).find(x => x.id === 'org.cubingusa.natshelper.v1.Person')
  return e ? (e.data.properties || {}) : {}
}
const ZONES = ['Zona Amarilla', 'Zona Azul', 'Zona Roja']
const TEAM_ROOM = {
  1: { 1: 'Zona Amarilla', 3: 'Zona Roja', 4: 'Zona Azul' },
  2: { 1: 'Zona Azul', 2: 'Zona Amarilla', 4: 'Zona Roja' },
  3: { 1: 'Zona Roja', 2: 'Zona Azul', 3: 'Zona Amarilla' },
  4: { 2: 'Zona Roja', 3: 'Zona Azul', 4: 'Zona Amarilla' },
}
const FLOAT = { 1: 4, 2: 1, 3: 2, 4: 3 }
const DAY = { '2026-06-12': 1, '2026-06-13': 2, '2026-06-14': 3, '2026-06-15': 4 }
// matches 222-r1-g3, 333bf-r1-g1, 333oh-r1-g2, and MBLD 333mbf-r1-g1-a1
function parseCode(code) {
  const m = (code || '').match(/^([a-z0-9]+)-r(\d+)-g(\d+)(?:-a(\d+))?$/)
  if (!m) return { event: null, round: null, group: null, attempt: null }
  return { event: m[1], round: 'r' + m[2], group: +m[3], attempt: m[4] ? +m[4] : null }
}

// ---- index EVERY activity (top-level + children + grandchildren) ----
const act = {}
const actIds = new Set()
let dupActIds = 0
function idx(node, room) {
  if (actIds.has(node.id)) dupActIds++; actIds.add(node.id)
  const pc = parseCode(node.activityCode)
  act[node.id] = {
    room, date: (node.startTime || '').slice(0, 10), code: node.activityCode,
    start: new Date(node.startTime).getTime(), end: new Date(node.endTime).getTime(),
    event: pc.event, round: pc.round, group: pc.group, attempt: pc.attempt,
    dayNum: DAY[(node.startTime || '').slice(0, 10)],
  }
  for (const c of node.childActivities || []) idx(c, room)
}
for (const v of w.schedule.venues)
  for (const r of v.rooms)
    for (const a of r.activities) idx(a, r.name)

// helper: is this a "main-zone r1 group" activity (one per room per wave)?
function isMainGroup(i) { return i && i.round === 'r1' && i.event && ZONES.includes(i.room) && i.attempt === null && i.group !== null }

const results = []
function check(name, pass, detail) { results.push({ name, pass, detail: detail || '' }) }

const staff = w.persons.filter(p => gp(p)['staff-team'])
const TLs = w.persons.filter(p => gp(p)['team-lead'])
const tlSet = new Set(TLs.map(p => p.wcaUserId))

// ============ 1. STRUCTURAL INTEGRITY ============
let dangling = 0, danglingList = [], dupAsn = 0, dupList = []
for (const p of w.persons) {
  const seen = new Set()
  for (const asn of p.assignments || []) {
    if (!act[asn.activityId]) { dangling++; if (danglingList.length < 8) danglingList.push(p.name + '->' + asn.activityId) }
    const k = asn.activityId + '|' + asn.assignmentCode
    if (seen.has(k)) { dupAsn++; if (dupList.length < 8) dupList.push(p.name + ' ' + asn.assignmentCode) }
    seen.add(k)
  }
}
check('No dangling assignment activityIds', dangling === 0, dangling + (danglingList.length ? ' [' + danglingList.join('; ') + ']' : ''))
check('No duplicate (activity,code) assignments', dupAsn === 0, dupAsn + (dupList.length ? ' [' + dupList.join('; ') + ']' : ''))
check('No duplicate activity IDs in schedule', dupActIds === 0, dupActIds + '')

// ============ 2. TIME CONFLICTS (any two overlapping assignments) ============
let conflicts = 0, conflictList = [], cvc = 0, cvj = 0, jvj = 0
for (const p of w.persons) {
  const slots = []
  for (const asn of p.assignments || []) {
    const i = act[asn.activityId]; if (!i) continue
    slots.push({ s: i.start, e: i.end, code: asn.assignmentCode, ac: i.code })
  }
  for (let x = 0; x < slots.length; x++)
    for (let y = x + 1; y < slots.length; y++)
      if (slots[x].s < slots[y].e && slots[y].s < slots[x].e) {
        conflicts++
        const a = slots[x].code === 'competitor', b = slots[y].code === 'competitor'
        if (a && b) cvc++; else if (a || b) cvj++; else jvj++
        if (conflictList.length < 15) conflictList.push(p.name + ': ' + slots[x].code + ' ' + slots[x].ac + ' <-> ' + slots[y].code + ' ' + slots[y].ac)
      }
}
check('No time conflicts (any overlapping assignments)', conflicts === 0,
  conflicts + ' (comp-comp ' + cvc + ', comp-job ' + cvj + ', job-job ' + jvj + ')' + (conflictList.length ? '\n      ' + conflictList.join('\n      ') : ''))

// ============ 3. COMPETITOR ASSIGNMENT CORRECTNESS ============
let dupEventGroup = 0, dupEGList = [], notReg = 0, notRegList = [], missing = 0, missingList = []
for (const p of w.persons) {
  const reg = p.registration
  const accepted = reg && reg.status === 'accepted' && reg.isCompeting !== false
  const erGroupNums = {}   // event-round -> Set(groupNum)
  const evSet = new Set()
  for (const asn of p.assignments || []) {
    if (asn.assignmentCode !== 'competitor') continue
    const i = act[asn.activityId]; if (!i || !i.event) continue
    const er = i.event + '-' + i.round
    ;(erGroupNums[er] = erGroupNums[er] || new Set()).add(i.group)
    evSet.add(i.event)
  }
  for (const [er, gs] of Object.entries(erGroupNums))
    if (gs.size > 1) { dupEventGroup++; if (dupEGList.length < 10) dupEGList.push(p.name + ' ' + er + ' groups{' + [...gs].join(',') + '}') }
  if (accepted) {
    const regEvents = reg.eventIds || []
    for (const ev of evSet) if (!regEvents.includes(ev)) { notReg++; if (notRegList.length < 10) notRegList.push(p.name + ' +' + ev) }
    for (const ev of regEvents) if (!evSet.has(ev)) { missing++; if (missingList.length < 12) missingList.push(p.name + ' -' + ev) }
  }
}
check('No competitor in 2 distinct groups of same event-round', dupEventGroup === 0, dupEventGroup + (dupEGList.length ? ' [' + dupEGList.join('; ') + ']' : ''))
check('No competitor assigned to unregistered event', notReg === 0, notReg + (notRegList.length ? ' [' + notRegList.join('; ') + ']' : ''))
check('All registered competitors have a group', missing === 0, missing + (missingList.length ? ' [' + missingList.join('; ') + ']' : ''))

// ============ 4. GROUP SIZE BALANCE (main events, per wave) ============
const groupSizes = {}
for (const p of w.persons)
  for (const asn of p.assignments || []) {
    if (asn.assignmentCode !== 'competitor') continue
    const i = act[asn.activityId]; if (!isMainGroup(i)) continue
    const key = i.event + '|g' + i.group
    groupSizes[key] = (groupSizes[key] || 0) + 1
  }
const byEvent = {}
for (const key in groupSizes) { const ev = key.split('|')[0]; (byEvent[ev] = byEvent[ev] || {})[key.split('|')[1]] = groupSizes[key] }
let imb = 0, imbList = []
for (const ev in byEvent) {
  const vals = Object.values(byEvent[ev])
  const sp = Math.max(...vals) - Math.min(...vals)
  if (sp > 8) { imb++; imbList.push(ev + ' [' + Object.entries(byEvent[ev]).map(([g, n]) => g + ':' + n).join(',') + '] spread=' + sp) }
}
check('Group sizes balanced per event (wave spread <=8)', imb === 0, imb + (imbList.length ? '\n      ' + imbList.join('\n      ') : ''))

// ============ 5. STAFF ZONE COMPLIANCE ============
let staffComp = 0, scList = [], staffJob = 0, sjList = []
const STAFF_JOBS = new Set(['staff-judge', 'staff-runner', 'staff-scrambler', 'staff-Delegate', 'staff-Lead'])
for (const p of staff) {
  const team = gp(p)['staff-team']
  for (const asn of p.assignments || []) {
    const i = act[asn.activityId]; if (!i || !i.dayNum) continue
    if (!ZONES.includes(i.room)) continue          // only the 3 main zones are constrained
    if (FLOAT[i.dayNum] === team) continue          // float day: free
    const correct = TEAM_ROOM[team][i.dayNum]
    if (!correct || i.room === correct) continue
    if (asn.assignmentCode === 'competitor') { staffComp++; if (scList.length < 12) scList.push(p.name + ' T' + team + ' D' + i.dayNum + ' ' + i.code + ' @' + i.room + ' need ' + correct) }
    else if (STAFF_JOBS.has(asn.assignmentCode)) { staffJob++; if (sjList.length < 12) sjList.push(p.name + ' T' + team + ' D' + i.dayNum + ' ' + asn.assignmentCode + ' @' + i.room + ' need ' + correct) }
  }
}
check('Staff COMPETE only in their zone (non-float)', staffComp === 0, staffComp + (scList.length ? '\n      ' + scList.join('\n      ') : ''))
check('Staff JOBS only in their zone (non-float)', staffJob === 0, staffJob + (sjList.length ? '\n      ' + sjList.join('\n      ') : ''))

// ============ 6. DELEGATE COVERAGE (any delegate + TL delegate) ============
const grpDel = {}, grpTLDel = {}
for (const p of w.persons) {
  const isTL = tlSet.has(p.wcaUserId)
  for (const asn of p.assignments || [])
    if (asn.assignmentCode === 'staff-Delegate') {
      grpDel[asn.activityId] = (grpDel[asn.activityId] || 0) + 1
      if (isTL) grpTLDel[asn.activityId] = (grpTLDel[asn.activityId] || 0) + 1
    }
}
let mainG = 0, noDel = 0, noDelL = [], noTLDel = 0, noTLDelL = []
for (const id in act) {
  const i = act[id]; if (!isMainGroup(i)) continue
  mainG++
  if (!grpDel[id]) { noDel++; if (noDelL.length < 15) noDelL.push(i.code + '@' + i.room) }
  if (!grpTLDel[id]) { noTLDel++; if (noTLDelL.length < 15) noTLDelL.push(i.code + '@' + i.room) }
}
check('Every main-zone group has a Delegate', noDel === 0, noDel + '/' + mainG + (noDelL.length ? '\n      ' + noDelL.join('\n      ') : ''))
check('Every main-zone group has a TL as Delegate', noTLDel === 0, noTLDel + '/' + mainG + (noTLDelL.length ? '\n      ' + noTLDelL.join('\n      ') : ''))
// BLD (Morada) groups MUST ALWAYS have a Delegate — mandatory, no exceptions.
let bldG = 0, bldNoDel = 0, bldNoDelL = []
for (const id in act) {
  const i = act[id]
  if (!i.room || !i.room.includes('Morada') || !/-(r\d+|a\d+)-g\d+/.test(i.code || '')) continue
  bldG++
  if (!grpDel[id]) { bldNoDel++; bldNoDelL.push(i.code) }
}
check('Every BLD (Morada) group has a Delegate', bldNoDel === 0, bldNoDel + '/' + bldG + (bldNoDelL.length ? ' [' + bldNoDelL.join(', ') + ']' : ''))

// ============ 7. TL RULES ============
// 7a. 3+ TLs competing in same group — only a problem if that group lacks a TL delegate
const tlCompByGrp = {}
for (const p of TLs)
  for (const asn of p.assignments || []) {
    if (asn.assignmentCode !== 'competitor') continue
    const i = act[asn.activityId]; if (!isMainGroup(i)) continue
    ;(tlCompByGrp[asn.activityId] = tlCompByGrp[asn.activityId] || []).push(p.name)
  }
let tl3unsafe = 0, tl3L = [], tl3safe = 0
for (const [aid, names] of Object.entries(tlCompByGrp))
  if (names.length >= 3) {
    if (grpTLDel[aid]) tl3safe++
    else { tl3unsafe++; tl3L.push((act[aid].code + '@' + act[aid].room) + ': ' + names.join(', ')) }
  }
check('No group has 3+ TLs competing WITHOUT a TL delegate', tl3unsafe === 0,
  tl3unsafe + ' unsafe (' + tl3safe + ' groups have 3 TLs competing but are TL-delegate-covered)' + (tl3L.length ? '\n      ' + tl3L.join('\n      ') : ''))
// 7b. TLs never idle: every TL, for each wave where they're not competing/job in their zone-day, should be delegating
// (approx) count TL assignments vs available waves — informational
let tlIdleWaves = 0
// Build wave timeslots in main zones
const waves = new Set()
for (const id in act) { const i = act[id]; if (isMainGroup(i)) waves.add(i.date + '|' + i.start + '|' + i.end) }
for (const p of TLs) {
  const busy = new Set()
  for (const asn of p.assignments || []) { const i = act[asn.activityId]; if (i) busy.add(i.date + '|' + i.start + '|' + i.end) }
  // count waves on days this TL is in a main zone that they have NO assignment for
  // (informational only — not failed)
}

// ============ 8. STAFFING per main-zone group ============
const jobCount = {}
for (const p of w.persons)
  for (const asn of p.assignments || []) {
    if (!['staff-judge', 'staff-runner', 'staff-scrambler'].includes(asn.assignmentCode)) continue
    const i = act[asn.activityId]; if (!i) continue
    const j = jobCount[asn.activityId] = jobCount[asn.activityId] || { j: 0, r: 0, s: 0 }
    if (asn.assignmentCode === 'staff-judge') j.j++; else if (asn.assignmentCode === 'staff-runner') j.r++; else j.s++
  }
let noJudge = 0, njL = [], noScr = 0
for (const id in act) {
  const i = act[id]; if (!isMainGroup(i)) continue
  const size = groupSizes[i.event + '|g' + i.group] || 0
  if (size === 0) continue
  const j = jobCount[id] || { j: 0, r: 0, s: 0 }
  if (j.j === 0) { noJudge++; if (njL.length < 12) njL.push(i.code + '@' + i.room + ' size=' + size) }
  if (j.s === 0) noScr++
}
check('Every active main-zone group has >=1 judge', noJudge === 0, noJudge + (njL.length ? '\n      ' + njL.join('\n      ') : ''))
check('Every active main-zone group has >=1 scrambler', noScr === 0, noScr + '')
// 3x3 (333) active groups should have scramblers AND runners at the max (3).
let g333 = 0, bad333 = 0, bad333L = []
for (const id in act) {
  const i = act[id]; if (!isMainGroup(i) || i.event !== '333') continue
  const size = groupSizes[i.event + '|g' + i.group] || 0
  if (size === 0) continue
  g333++
  const j = jobCount[id] || { j: 0, r: 0, s: 0 }
  if (j.s < 3 || j.r < 3) { bad333++; if (bad333L.length < 12) bad333L.push(i.code + '@' + i.room + ' S' + j.s + ' R' + j.r) }
}
check('3x3 active groups have 3 scramblers + 3 runners', bad333 === 0, bad333 + '/' + g333 + (bad333L.length ? '\n      ' + bad333L.join('\n      ') : ''))

// ============ 9. TEAM COMPOSITION ============
const tc = { 1: 0, 2: 0, 3: 0, 4: 0 }; let badT = 0
for (const p of staff) { const t = gp(p)['staff-team']; if ([1, 2, 3, 4].includes(t)) tc[t]++; else badT++ }
const tv = Object.values(tc)
check('Team sizes balanced (spread <=2)', Math.max(...tv) - Math.min(...tv) <= 2, 'T1:' + tc[1] + ' T2:' + tc[2] + ' T3:' + tc[3] + ' T4:' + tc[4])
check('All staff-team values in {1,2,3,4}', badT === 0, badT + '')
// TLs per team = 3
const tlPerTeam = { 1: 0, 2: 0, 3: 0, 4: 0 }
for (const p of TLs) { const t = gp(p)['staff-team']; if (tlPerTeam[t] !== undefined) tlPerTeam[t]++ }
check('Each team has exactly 3 TLs', Object.values(tlPerTeam).every(n => n === 3), 'T1:' + tlPerTeam[1] + ' T2:' + tlPerTeam[2] + ' T3:' + tlPerTeam[3] + ' T4:' + tlPerTeam[4])
// scramblers per team (can-scramble any event)
const scrPerTeam = { 1: 0, 2: 0, 3: 0, 4: 0 }
for (const p of staff) { const pr = gp(p); const t = pr['staff-team']; const canScr = Object.keys(pr).some(k => k.startsWith('can-scramble-')); if (canScr && scrPerTeam[t] !== undefined) scrPerTeam[t]++ }
check('Every team has scramblers', Object.values(scrPerTeam).every(n => n >= 5), 'scramblers/team T1:' + scrPerTeam[1] + ' T2:' + scrPerTeam[2] + ' T3:' + scrPerTeam[3] + ' T4:' + scrPerTeam[4])

// ============ 10. SCORE-TAKER / MEDIA EXCLUSION ============
let stJobs = 0, stL = []
for (const p of w.persons) {
  const pr = gp(p); if (!pr['score-taker'] && !pr['streaming']) continue
  const jobs = (p.assignments || []).filter(a => a.assignmentCode.startsWith('staff-')).length
  if (jobs > 0) { stJobs++; stL.push(p.name + ' (' + (pr['score-taker'] ? 'ST' : 'Media') + ') jobs=' + jobs) }
}
check('Score-takers & Media have no staff jobs', stJobs === 0, stJobs + (stL.length ? ' [' + stL.join('; ') + ']' : ''))

// ============ 11. PINNED STAFF / TEAM INTEGRITY ============
let noTeamStaffJob = 0
// every person with a staff job should have a team (except none expected)
for (const p of w.persons) {
  const hasJob = (p.assignments || []).some(a => ['staff-judge', 'staff-runner', 'staff-scrambler'].includes(a.assignmentCode))
  if (hasJob && !gp(p)['staff-team']) noTeamStaffJob++
}
check('Everyone with a staff job has a team', noTeamStaffJob === 0, noTeamStaffJob + '')

// ============ FLOAT STATS (info) ============
const floatStats = {}
for (const p of staff) {
  const team = gp(p)['staff-team']
  for (const asn of p.assignments || []) {
    const i = act[asn.activityId]; if (!i || !i.dayNum || FLOAT[i.dayNum] !== team) continue
    if (!asn.assignmentCode.startsWith('staff-')) continue
    const zone = i.room.includes('Morada') ? 'BLD' : i.room.includes('Verde') ? 'Unofficial/Tarima' : ZONES.includes(i.room) ? 'MainZone' : 'Other'
    floatStats[zone] = (floatStats[zone] || 0) + 1
  }
}

// ============ SUMMARY ============
console.log('\n' + '='.repeat(72))
console.log('  EXHAUSTIVE VALIDATION — SAC 2026')
console.log('  ' + PATH)
console.log('  Persons: ' + w.persons.length + ' | Staff: ' + staff.length + ' | TLs: ' + TLs.length + ' | Main groups: ' + mainG)
console.log('='.repeat(72))
let passN = 0, failN = 0
for (const r of results) {
  console.log((r.pass ? '✅' : '❌') + ' ' + r.name)
  if (r.pass) passN++; else failN++
  if (r.detail && (!r.pass || /T1:|comp-comp|3 TLs|spread/.test(r.detail))) console.log('      ' + r.detail)
}
console.log('-'.repeat(72))
console.log('Float-day staff jobs by area: ' + JSON.stringify(floatStats))
console.log('-'.repeat(72))
console.log(failN === 0 ? '🎉 ALL ' + passN + ' CHECKS PASSED' : '⚠️  ' + passN + ' passed, ' + failN + ' FAILED')
console.log('='.repeat(72))
process.exit(failN === 0 ? 0 : 1)
