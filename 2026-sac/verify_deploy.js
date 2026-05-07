#!/usr/bin/env node
/**
 * SAC 2026 — Verify Deployed WCIF
 *
 * Fetches the authenticated WCIF from WCA and runs validation checks:
 *   - Staff competes in their team's zone (100% compliance expected)
 *   - Team Lead distribution (3/team, 1 BR + 1 CO each)
 *   - Score takers excluded from regular jobs
 *   - Persons out of pool have 0 staff assignments
 *   - Assignment counts and team sizes
 *
 * Usage:
 *   cd scc-scripts/2026-sac
 *   node verify_deploy.js              # fetch from WCA via OAuth
 *   node verify_deploy.js <file.json>  # use local WCIF file
 */

const path = require('path')
const http = require('http')
const fs = require('fs')

const COMPSCRIPT_DIR = path.resolve(__dirname, '../../compscript')
require(COMPSCRIPT_DIR + '/node_modules/dotenv').config({ path: COMPSCRIPT_DIR + '/.env.PROD' })

const WCA_HOST = process.env.WCA_HOST
const CLIENT_ID = process.env.API_KEY
const CLIENT_SECRET = process.env.API_SECRET
const REDIRECT_URI = 'http://localhost:3030/auth/oauth_response'

// Team rotation from _assigned_room.cs
// T1: D1=Amarilla, D2=Float, D3=Roja, D4=Azul
// T2: D1=Azul, D2=Amarilla, D3=Float, D4=Roja
// T3: D1=Roja, D2=Azul, D3=Amarilla, D4=Float
// T4: D1=Float, D2=Roja, D3=Azul, D4=Amarilla
const TEAM_ROOM = {
  '1-1': 'Zona Amarilla', '1-3': 'Zona Roja', '1-4': 'Zona Azul',
  '2-1': 'Zona Azul', '2-2': 'Zona Amarilla', '2-4': 'Zona Roja',
  '3-1': 'Zona Roja', '3-2': 'Zona Azul', '3-3': 'Zona Amarilla',
  '4-2': 'Zona Roja', '4-3': 'Zona Azul', '4-4': 'Zona Amarilla',
}
const FLOAT_DAYS = new Set(['1-2', '2-3', '3-4', '4-1'])
const DAY_NUM = { '2026-06-12': 1, '2026-06-13': 2, '2026-06-14': 3, '2026-06-15': 4 }

function verify(wcif) {
  // Build activity map
  const actInfo = {}
  for (const v of wcif.schedule.venues) {
    for (const r of v.rooms) {
      for (const a of r.activities) {
        const day = DAY_NUM[a.startTime?.substring(0, 10)] || 0
        actInfo[a.id] = { room: r.name, day }
        for (const c of a.childActivities || []) {
          actInfo[c.id] = { room: r.name, day: DAY_NUM[c.startTime?.substring(0, 10)] || 0 }
        }
      }
    }
  }

  // Build person data
  const persons = wcif.persons.map(p => {
    const ext = (p.extensions || []).find(e => (e.id || '').includes('Person'))
    const props = ext?.data?.properties || {}
    return {
      name: p.name, wcaId: p.wcaId, country: p.countryIso2,
      team: props['staff-team'], tl: props['team-lead'], st: props['score-taker'],
      assignments: p.assignments || [],
    }
  })

  let pass = 0, fail = 0

  // Check 1: Staff zone compliance
  let correct = 0, floating = 0, violations = 0, violationSamples = []
  for (const p of persons) {
    if (!p.team) continue
    for (const a of p.assignments) {
      if (a.assignmentCode !== 'competitor') continue
      const info = actInfo[a.activityId]
      if (!info || !info.day) continue
      if (['Zona Morada (Sala BLD)', 'Zona Verde (TARIMA)'].includes(info.room)) continue
      const key = `${p.team}-${info.day}`
      if (FLOAT_DAYS.has(key)) { floating++ }
      else if (TEAM_ROOM[key] === info.room) { correct++ }
      else {
        violations++
        if (violationSamples.length < 3) violationSamples.push(`${p.name} T${p.team} D${info.day}: expected ${TEAM_ROOM[key]}, got ${info.room}`)
      }
    }
  }
  const zoneOk = violations === 0
  console.log(`${zoneOk ? '✅' : '❌'} Zone compliance: ${correct} correct, ${floating} floating, ${violations} violations`)
  if (violationSamples.length) violationSamples.forEach(v => console.log(`   ${v}`))
  if (zoneOk) pass++; else fail++

  // Check 2: TL distribution
  const tlTeams = {}
  for (const p of persons) {
    if (p.tl && p.team) {
      if (!tlTeams[p.team]) tlTeams[p.team] = { count: 0, br: 0, co: 0, names: [] }
      tlTeams[p.team].count++
      tlTeams[p.team].names.push(p.name?.substring(0, 20))
      if (p.country === 'BR') tlTeams[p.team].br++
      if (p.country === 'CO') tlTeams[p.team].co++
    }
  }
  const tlOk = Object.values(tlTeams).every(t => t.count >= 3 && t.br >= 1 && t.co >= 1)
  console.log(`${tlOk ? '✅' : '❌'} Team Leads:`)
  for (const [t, data] of Object.entries(tlTeams).sort()) {
    console.log(`   T${t}: ${data.count} TLs, ${data.br} BR, ${data.co} CO — ${data.names.join(', ')}`)
  }
  if (tlOk) pass++; else fail++

  // Check 3: Score takers
  const scoreTakers = persons.filter(p => p.st)
  const stOk = scoreTakers.every(p => p.assignments.filter(a => a.assignmentCode.startsWith('staff')).length === 0)
  console.log(`${stOk ? '✅' : '❌'} Score takers (${scoreTakers.length}): ${stOk ? 'all excluded from staff jobs' : 'SOME HAVE STAFF JOBS'}`)
  for (const p of scoreTakers) {
    const staff = p.assignments.filter(a => a.assignmentCode.startsWith('staff')).length
    const comp = p.assignments.filter(a => a.assignmentCode === 'competitor').length
    console.log(`   ${p.name?.substring(0, 30).padEnd(30)} staff=${staff} comp=${comp}`)
  }
  if (stOk) pass++; else fail++

  // Check 4: Persons out of pool
  const outOfPool = ['2021LOPE01'] // JF Gómez
  const outOk = persons.filter(p => outOfPool.includes(p.wcaId)).every(p =>
    p.assignments.filter(a => a.assignmentCode.startsWith('staff')).length === 0 && !p.team
  )
  console.log(`${outOk ? '✅' : '❌'} Out-of-pool persons:`)
  for (const wid of outOfPool) {
    const p = persons.find(pp => pp.wcaId === wid)
    if (p) console.log(`   ${p.name?.substring(0, 30).padEnd(30)} staff=0 team=${p.team || 'none'}`)
  }
  if (outOk) pass++; else fail++

  // Check 5: Assignment counts
  const byCodes = {}
  for (const p of persons) {
    for (const a of p.assignments) { byCodes[a.assignmentCode] = (byCodes[a.assignmentCode] || 0) + 1 }
  }
  const totalAssign = Object.values(byCodes).reduce((s, n) => s + n, 0)
  const assignOk = totalAssign > 5000
  console.log(`${assignOk ? '✅' : '❌'} Assignments: ${totalAssign} total`)
  for (const [code, count] of Object.entries(byCodes).sort()) { console.log(`   ${code}: ${count}`) }
  if (assignOk) pass++; else fail++

  // Check 6: Team sizes
  const teamSizes = {}
  for (const p of persons) { if (p.team) teamSizes[p.team] = (teamSizes[p.team] || 0) + 1 }
  const sizeOk = Object.values(teamSizes).every(s => s >= 22 && s <= 32)
  console.log(`${sizeOk ? '✅' : '❌'} Team sizes: ${Object.entries(teamSizes).sort().map(([t, s]) => `T${t}:${s}`).join(', ')}`)
  if (sizeOk) pass++; else fail++

  // Check 7: Groups
  let totalGroups = 0
  for (const v of wcif.schedule.venues) {
    for (const r of v.rooms) {
      for (const a of r.activities) { totalGroups += (a.childActivities || []).length }
    }
  }
  const groupsOk = totalGroups > 100
  console.log(`${groupsOk ? '✅' : '❌'} Groups: ${totalGroups}`)
  if (groupsOk) pass++; else fail++

  // Summary
  console.log(`\n${'='.repeat(40)}`)
  console.log(`${pass}/${pass + fail} checks passed`)
  if (fail > 0) process.exitCode = 1
}

// Main
const localFile = process.argv[2]
if (localFile) {
  console.log(`Loading WCIF from ${localFile}...\n`)
  verify(JSON.parse(fs.readFileSync(localFile)))
} else {
  console.log('Fetching authenticated WCIF from WCA...')
  console.log('Open http://localhost:3030 to authorize.\n')
  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://localhost:3030')
    if (u.pathname === '/auth/oauth_response' && u.searchParams.get('code')) {
      const t = await (await fetch(`${WCA_HOST}/oauth/token`, {
        method: 'POST',
        body: new URLSearchParams({ grant_type: 'authorization_code', code: u.searchParams.get('code'), client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI }).toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })).json()
      if (!t.access_token) { console.error('Token failed'); process.exit(1) }
      const wcif = await (await fetch(`${WCA_HOST}/api/v0/competitions/SAC2026/wcif`, {
        headers: { 'Authorization': `Bearer ${t.access_token}` }
      })).json()
      console.log(`Fetched: ${wcif.persons.length} persons\n`)
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end('<h1>Verification running in terminal...</h1>')
      server.close()
      verify(wcif)
    } else {
      res.writeHead(302, { Location: `${WCA_HOST}/oauth/authorize?client_id=${CLIENT_ID}&scope=public%20manage_competitions&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` })
      res.end()
    }
  })
  server.listen(3030)
}
