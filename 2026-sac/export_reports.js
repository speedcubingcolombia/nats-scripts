#!/usr/bin/env node
/**
 * SAC 2026 - Export all reports to HTML files
 * Usage: ENV=DEV node export_reports.js
 * Output: ./output/*.html
 */

const path = require('path')
const COMPSCRIPT_DIR = path.resolve(__dirname, '../../compscript')
process.chdir(COMPSCRIPT_DIR)

require(COMPSCRIPT_DIR + '/node_modules/dotenv').config({ path: COMPSCRIPT_DIR + '/.env.' + (process.env.ENV || 'DEV') })
const compiler = require(COMPSCRIPT_DIR + '/node_modules/c-preprocessor')
const parser = require(COMPSCRIPT_DIR + '/parser/parser')
const functions = require(COMPSCRIPT_DIR + '/functions/functions')
const pugFunctions = require(COMPSCRIPT_DIR + '/pug_functions')
const pug = require(COMPSCRIPT_DIR + '/node_modules/pug')
const fs = require('fs')

const SCRIPT_BASE = '../scc-scripts/2026-sac'
const OUTPUT_DIR = path.resolve(__dirname, 'output')
const CACHE_PATH = '.wcif_cache/' + (process.env.ENV || 'DEV') + '/SAC2026'

const reports = [
  'reports/team_roster.cs',
  'reports/staff_summary.cs',
  'reports/volunteer_workload.cs',
  'reports/stage_lead_groups.cs',
  'reports/group_schedule_overview.cs',
  'reports/list_of_people.cs',
  'reports/pending_staff.cs',
]

const HTML_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SAC 2026 - REPORT_NAME</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 20px; background: #f5f5f5; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #333; padding-bottom: 8px; }
    h2 { color: #333; margin-top: 30px; }
    h3 { color: #555; margin-top: 25px; }
    table { border-collapse: collapse; margin: 10px 0 20px 0; width: 100%; }
    table, tr, td, th { border: 1px solid #ccc; padding: 6px 10px; }
    th { background: #333; color: white; text-align: left; }
    tr:nth-child(even) { background: #f9f9f9; }
    tr:hover { background: #e9e9e9; }
    .meta { color: #888; font-size: 12px; margin-top: 30px; }
    @media print { body { background: white; } }
  </style>
</head>
<body>
  <h1>SAC 2026 - REPORT_NAME</h1>
  CONTENT
  <div class="meta">Generated: TIMESTAMP</div>
</body>
</html>`

async function runReport(reportFile) {
  const script = `#include "${reportFile}"`

  return new Promise((resolve, reject) => {
    compiler.compile(script, { basePath: SCRIPT_BASE + '/', newLine: '\n' }, async (err, out) => {
      if (err) return reject(new Error('Preprocess: ' + JSON.stringify(err).substring(0, 200)))
      out = out.replace(/\r/g, '').trim()

      const wcif = JSON.parse(fs.readFileSync(CACHE_PATH))
      const ctx = {
        competition: wcif,
        command: out,
        allFunctions: functions.allFunctions,
        dryrun: true,
        logger: { start: () => {}, stop: () => {} },
        udfs: {},
      }

      try {
        const result = await parser.parse(out, { session: {} }, {}, ctx, false)

        // Render outputs to HTML (skip CompetitionWCIF which is the raw WCIF dump)
        let html = ''
        for (const output of result.outputs) {
          if (output.type === 'CompetitionWCIF') continue
          html += renderOutput(output)
        }
        resolve(html)
      } catch (e) {
        reject(e)
      }
    })
  })
}

function renderOutput(output) {
  switch (output.type) {
    case 'Header':
      return `<h2>${escapeHtml(output.data)}</h2>\n`
    case 'Table':
      return renderTable(output.data)
    case 'String':
      return `<div>${escapeHtml(String(output.data))}</div>\n`
    case 'Number':
      return `<div><strong>${output.data}</strong></div>\n`
    case 'Persons':
      return renderPersonList(output.data)
    case 'Multi':
      return output.data.map(sub => renderOutput(sub)).join('')
    case 'Exception':
      return `<div style="color:red">ERROR: ${escapeHtml(String(output.data).substring(0, 200))}</div>\n`
    default:
      if (output.data !== undefined && output.data !== null) {
        return `<div>${escapeHtml(String(output.data))}</div>\n`
      }
      return ''
  }
}

function renderTable(data) {
  if (!data || !data.rows || data.rows.length === 0) return '<div>(empty table)</div>\n'
  // Extract column headers from first row's cell titles
  const firstRow = data.rows[0]
  let html = '<table>\n<tr>'
  if (data.columns) {
    for (const col of data.columns) html += `<th>${escapeHtml(col.name || col.title || '')}</th>`
  } else if (Array.isArray(firstRow)) {
    for (const cell of firstRow) html += `<th>${escapeHtml(cell?.title || '')}</th>`
  }
  html += '</tr>\n'
  for (const row of data.rows) {
    html += '<tr>'
    if (Array.isArray(row)) {
      for (const cell of row) {
        const val = cell?.value !== undefined && cell?.value !== null ? String(cell.value) : ''
        html += `<td>${escapeHtml(val)}</td>`
      }
    }
    html += '</tr>\n'
  }
  html += '</table>\n'
  return html
}

function renderPersonList(persons) {
  if (!persons || !Array.isArray(persons)) return ''
  let html = '<div>'
  for (const p of persons) {
    html += `<div>${escapeHtml(p.name || 'Unknown')}</div>`
  }
  html += '</div>\n'
  return html
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function main() {
  console.log('SAC 2026 Report Exporter')
  console.log('Output:', OUTPUT_DIR)
  console.log()

  // Generate index page
  let indexLinks = ''

  for (const report of reports) {
    const name = path.basename(report, '.cs')
    const outFile = path.join(OUTPUT_DIR, name + '.html')

    process.stdout.write(`  ${report}... `)
    try {
      const content = await runReport(report)
      const html = HTML_TEMPLATE
        .replace(/REPORT_NAME/g, name.replace(/_/g, ' '))
        .replace('CONTENT', content)
        .replace('TIMESTAMP', new Date().toISOString())

      fs.writeFileSync(outFile, html)
      console.log('OK')
      indexLinks += `  <li><a href="${name}.html">${name.replace(/_/g, ' ')}</a></li>\n`
    } catch (e) {
      console.log('FAILED:', e.message?.substring(0, 100))
      indexLinks += `  <li>${name.replace(/_/g, ' ')} (failed)</li>\n`
    }
  }

  // Write index page
  const indexHtml = HTML_TEMPLATE
    .replace(/REPORT_NAME/g, 'Reports Index')
    .replace('CONTENT', `<ul>\n${indexLinks}</ul>`)
    .replace('TIMESTAMP', new Date().toISOString())
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml)

  console.log()
  console.log('Done! Open: file://' + path.join(OUTPUT_DIR, 'index.html'))
}

main().catch(e => { console.error(e); process.exit(1) })
