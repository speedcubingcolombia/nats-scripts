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

// Pipeline phases
const phase1 = `
#include "prep/import.cs"
#include "prep/add_missing_staff.cs"
#include "data/volunteer_properties.cs"
#include "prep/overrides.cs"
#include "prep/populate_r1.cs"
#include "prep/volunteer_teams.cs"
`
const phase2 = `
#include "groups/r1/777.cs"
#include "groups/r1/666.cs"
#include "groups/r1/minx.cs"
#include "groups/r1/sq1.cs"
#include "groups/r1/clock.cs"
#include "groups/r1/555.cs"
#include "groups/r1/444.cs"
#include "groups/r1/skewb.cs"
#include "groups/r1/333.cs"
#include "groups/r1/333bf.cs"
#include "groups/r1/333oh.cs"
#include "groups/r1/222.cs"
#include "groups/r1/pyram.cs"
#include "groups/r1/555bf.cs"
#include "groups/r1/444bf.cs"
#include "groups/r1/333mbf.cs"
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
  console.log('Step 1: Authorize + fetch authenticated WCIF...')
  console.log('Open http://localhost:3030 to authorize.\n')

  const authToken = await new Promise((resolve) => {
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

  console.log('Fetching authenticated WCIF...')
  // Use PUBLIC API for pipeline (correct activity IDs — authenticated API rearranges them)
  const wcifRes = await fetch(`${WCA_HOST}/api/v0/competitions/${COMP_ID}/wcif/public`)
  let wcif = await wcifRes.json()
  wcif.persons = wcif.persons.filter(p => p.registrantId !== null)
  wcif.persons.forEach(p => { p.assignments = []; p.extensions = [] })
  wcif.events.forEach(e => e.rounds.forEach(r => { r.results = [] }))
  for (const v of wcif.schedule?.venues || []) {
    for (const r of v.rooms || []) {
      for (const a of r.activities || []) { a.extensions = [] }
    }
  }
  console.log(`  Reset ${wcif.persons.length} persons\n`)

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

  // Step 2.5: Family team swaps
  console.log('\nPhase 1.5: Family team reassignment...')
  ;(function() {
    function setTeam(w, wcaId, userId, team) {
      const p = wcaId ? w.persons.find(pp => pp.wcaId === wcaId) : w.persons.find(pp => pp.wcaUserId === userId)
      if (!p) { console.log('  ⚠ not found: ' + (wcaId || userId)); return }
      let ext = (p.extensions || []).find(e => e.id === 'org.cubingusa.natshelper.v1.Person')
      if (!ext) { ext = { id: 'org.cubingusa.natshelper.v1.Person', specUrl: '', data: { properties: {} } }; p.extensions = p.extensions || []; p.extensions.push(ext) }
      ext.data = ext.data || {}; ext.data.properties = ext.data.properties || {}
      const old = ext.data.properties['staff-team']
      ext.data.properties['staff-team'] = team
      console.log('  ' + p.name.substring(0,30) + ': T' + (old||'?') + ' → T' + team)
    }
    setTeam(afterPhase1, '2022QUIN17', null, 2)
    setTeam(afterPhase1, null, 474236, 2)
    setTeam(afterPhase1, null, 440824, 1)
    setTeam(afterPhase1, '2024VALD01', null, 3)
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

  // Step 3: Phase 2
  const afterPhase2 = await runPhase('Phase 2 (group assignments)', phase2, afterPhase1)

  // Step 4: Phase 2.5
  console.log('\nPhase 2.5: Tagging compete-room properties...')
  tagCompeteRoom(afterPhase2)

  // Step 5: Phase 3
  const afterPhase3 = await runPhase('Phase 3 (staff assignments)', phase3, afterPhase2)

  // Phase 3.5 removed — unofficial competitor assignments handled operationally.
  // Staff for unofficial events is assigned by unofficial.cs in Phase 3.

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

  // Step 6: PATCH to WCA (using authToken from Step 1)
  console.log(`\n=== Deploy ===`)
  {
      const t = { access_token: authToken }

      // Step A: Skip schedule PATCH — using authenticated WCIF preserves correct schedule
      // Only PATCH schedule if childActivities need updating (rare)
      console.log('Schedule: using WCA live (no PATCH needed)')

      // Fetch authenticated WCIF for person cleaning only
      const liveWcif = await (await fetch(`${WCA_HOST}/api/v0/competitions/${COMP_ID}/wcif`, {
        headers: { 'Authorization': `Bearer ${t.access_token}` }
      })).json()
      // No remapping needed — pipeline uses public WCIF with correct activity IDs

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
