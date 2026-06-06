#!/usr/bin/env node
/**
 * Add Johana Suarez (wcaUserId 440824) as NCP to SAC2026.
 * Fetches live WCIF, adds her if missing, PATCHes persons back.
 *
 * Usage: node add_ncp_johana.js
 * Then open http://localhost:3030 in your browser.
 */

const http = require('http')
const path = require('path')
require(path.resolve(__dirname, '../../compscript/node_modules/dotenv')).config({
  path: path.resolve(__dirname, '../../compscript/.env.PROD')
})

const COMP_ID = 'SAC2026'
const WCA_HOST = process.env.WCA_HOST
const CLIENT_ID = process.env.API_KEY
const CLIENT_SECRET = process.env.API_SECRET
const REDIRECT_URI = 'http://localhost:3030/auth/oauth_response'

const TARGET = { wcaUserId: 440824, name: 'Johana Suarez' }

async function getToken(code) {
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

;(async () => {
  console.log(`Adding ${TARGET.name} (userId ${TARGET.wcaUserId}) as NCP to ${COMP_ID}`)
  console.log('Open http://localhost:3030 to authorize.\n')

  const token = await new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      const u = new URL(req.url, 'http://localhost:3030')
      if (u.pathname === '/auth/oauth_response' && u.searchParams.get('code')) {
        const t = await getToken(u.searchParams.get('code'))
        if (!t.access_token) { res.writeHead(500); res.end('Token failed'); server.close(); return }
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end('<h1>Authorized! Check terminal...</h1>')
        server.close()
        resolve(t.access_token)
      } else {
        res.writeHead(302, {
          Location: `${WCA_HOST}/oauth/authorize?client_id=${CLIENT_ID}&scope=public%20manage_competitions&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
        })
        res.end()
      }
    })
    server.listen(3030)
  })

  // Fetch authenticated WCIF
  console.log('Fetching authenticated WCIF...')
  const wcifRes = await fetch(`${WCA_HOST}/api/v0/competitions/${COMP_ID}/wcif`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const wcif = await wcifRes.json()
  console.log(`  ${wcif.persons.length} persons in WCIF`)

  // Find existing person
  const existing = wcif.persons.find(p => p.wcaUserId === TARGET.wcaUserId)
  if (!existing) {
    console.log(`\n${TARGET.name} not found in WCIF. Use AddPerson flow instead.`)
    process.exit(1)
  }

  console.log(`\nFound ${TARGET.name} (registrantId: ${existing.registrantId})`)
  console.log(`  Current: status=${existing.registration?.status}, isCompeting=${existing.registration?.isCompeting}`)
  console.log(`  Events: ${JSON.stringify(existing.registration?.eventIds)}`)

  // Convert to NCP
  existing.registration.isCompeting = false
  existing.registration.status = 'accepted'
  existing.registration.eventIds = []
  if (!existing.registration.comments) existing.registration.comments = 'Staff'
  existing.assignments = []

  console.log(`  New:     status=${existing.registration.status}, isCompeting=${existing.registration.isCompeting}`)

  // Ensure all persons have registration.comments
  for (const p of wcif.persons) {
    if (!p.registration) {
      p.registration = { eventIds: [], isCompeting: false, comments: 'Staff' }
    } else if (!p.registration.comments || p.registration.comments === '') {
      p.registration.comments = 'Staff'
    }
  }

  // PATCH persons only
  console.log(`PATCHing ${wcif.persons.length} persons...`)
  const patchRes = await fetch(`${WCA_HOST}/api/v0/competitions/${COMP_ID}/wcif`, {
    method: 'PATCH',
    body: JSON.stringify({ persons: wcif.persons }),
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  const status = patchRes.status
  const body = await patchRes.text()

  if (status === 200) {
    console.log(`\nDone! ${TARGET.name} added as NCP.`)
  } else {
    console.error(`\nPATCH failed (${status}):`)
    console.error(body.substring(0, 500))
  }
  process.exit(status === 200 ? 0 : 1)
})().catch(e => { console.error('Error:', e.message); process.exit(1) })
