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
#include "prep/overrides.cs"
#include "prep/populate_r1.cs"
#include "prep/create_groups.cs"
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

  // Step 1: Fetch fresh WCIF from WCA
  console.log('Step 1: Fetching WCIF from WCA...')
  const wcifRes = await fetch(`${WCA_HOST}/api/v0/competitions/${COMP_ID}/wcif/public`)
  let wcif = await wcifRes.json()
  wcif.persons = wcif.persons.filter(p => p.registrantId !== null)
  wcif.persons.forEach(p => { p.assignments = []; p.extensions = [] })
  wcif.events.forEach(e => e.rounds.forEach(r => { r.results = [] }))
  for (const v of wcif.schedule?.venues || []) {
    for (const r of v.rooms || []) {
      for (const a of r.activities || []) { a.childActivities = []; a.extensions = [] }
    }
  }
  console.log(`  Reset ${wcif.persons.length} persons\n`)

  // Step 2: Phase 1
  const afterPhase1 = await runPhase('Phase 1 (import + teams)', phase1, wcif)

  // Step 3: Phase 2
  const afterPhase2 = await runPhase('Phase 2 (group assignments)', phase2, afterPhase1)

  // Step 4: Phase 2.5
  console.log('\nPhase 2.5: Tagging compete-room properties...')
  tagCompeteRoom(afterPhase2)

  // Step 5: Phase 3
  const afterPhase3 = await runPhase('Phase 3 (staff assignments)', phase3, afterPhase2)

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

  // Step 6: PATCH to WCA via OAuth
  console.log(`\n=== Deploy ===`)
  console.log(`Open http://localhost:3030 to authorize PATCH to WCA.\n`)

  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://localhost:3030')
    if (u.pathname === '/auth/oauth_response' && u.searchParams.get('code')) {
      const t = await getOAuthToken(u.searchParams.get('code'))
      if (!t.access_token) { console.error('Token failed'); res.writeHead(500); res.end('Token failed'); server.close(); return }

      // Step A: Get live schedule from WCA and merge our childActivities into it
      console.log('Fetching live WCIF for schedule merge...')
      const liveWcif = await (await fetch(`${WCA_HOST}/api/v0/competitions/${COMP_ID}/wcif`, {
        headers: { 'Authorization': `Bearer ${t.access_token}` }
      })).json()

      // Build map of our childActivities by parent activityCode+room
      const ourChildren = {}
      for (const v of afterPhase3.schedule.venues) {
        for (const r of v.rooms) {
          for (const a of r.activities) {
            const key = `${r.name}::${a.activityCode || a.name}`
            if (a.childActivities && a.childActivities.length > 0) {
              ourChildren[key] = a.childActivities
            }
          }
        }
      }

      // Inject childActivities into live schedule, clipping times to parent
      let groupsAdded = 0
      for (const v of liveWcif.schedule.venues) {
        for (const r of v.rooms) {
          for (const a of r.activities) {
            const key = `${r.name}::${a.activityCode || a.name}`
            const children = ourChildren[key]
            if (children && children.length > 0 && (!a.childActivities || a.childActivities.length === 0)) {
              // Clip child times to fit within parent
              const parentStart = new Date(a.startTime).getTime()
              const parentEnd = new Date(a.endTime).getTime()
              const duration = parentEnd - parentStart
              const numChildren = children.length
              const childDuration = Math.floor(duration / numChildren)
              children.forEach((c, i) => {
                c.startTime = new Date(parentStart + i * childDuration).toISOString().replace('.000Z', 'Z')
                c.endTime = new Date(parentStart + (i + 1) * childDuration).toISOString().replace('.000Z', 'Z')
              })
              a.childActivities = children
              groupsAdded += children.length
            }
          }
        }
      }
      console.log(`  Injected ${groupsAdded} groups into live schedule`)

      // Step B: PATCH schedule (with groups)
      console.log('PATCHing schedule...')
      const rSched = await patchWCA(t.access_token, { schedule: liveWcif.schedule })
      console.log(`  Schedule: ${rSched.status}`)
      if (rSched.status !== 200) {
        console.error(rSched.body.substring(0, 500))
        res.writeHead(500, { 'Content-Type': 'text/html' })
        res.end(`<h1>Schedule PATCH failed</h1><pre>${rSched.body.substring(0, 300)}</pre>`)
        setTimeout(() => process.exit(1), 3000); return
      }

      // Step C: PATCH persons
      console.log(`PATCHing ${afterPhase3.persons.length} persons (${totalAssign} assignments)...`)
      const r = await patchWCA(t.access_token, { persons: afterPhase3.persons })
      console.log(`  Persons: ${r.status}`)
      if (r.status === 200) {
        console.log('\n✅ DEPLOY SUCCESSFUL!')
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(`<h1>Deploy successful!</h1><p>${groupsAdded} groups + ${afterPhase3.persons.length} persons + ${totalAssign} assignments.</p>`)
      } else {
        console.error(r.body.substring(0, 500))
        res.writeHead(500, { 'Content-Type': 'text/html' })
        res.end(`<h1>Persons PATCH failed</h1><pre>${r.body.substring(0, 500)}</pre>`)
      }
      setTimeout(() => process.exit(0), 3000)
    } else {
      res.writeHead(302, { Location: `${WCA_HOST}/oauth/authorize?client_id=${CLIENT_ID}&scope=public%20manage_competitions&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` })
      res.end()
    }
  })
  server.listen(3030)
})().catch(e => { console.error('Pipeline error:', e.message); process.exit(1) })
