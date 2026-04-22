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
    for (const a of r.activities || []) { a.childActivities = []; a.extensions = [] }
  }
}
// Don't save to file — pass directly to parser
console.log(`  Reset ${wcif.persons.length} persons`)

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

// Run both phases
;(async () => {
  try {
    // Phase 1: Import, overrides, populate, create groups, cluster teams
    const afterPhase1 = await runPhase('Phase 1 (import + teams)', phase1, wcif)

    // Phase 2: Assign competitor groups (needs staff-team from phase 1)
    const afterPhase2 = await runPhase('Phase 2 (group assignments)', phase2, afterPhase1)

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

    // Phase 3: Staff assignments (needs team + group data from phases 1-2)
    const afterPhase3 = await runPhase('Phase 3 (staff assignments)', phase3, afterPhase2)

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
