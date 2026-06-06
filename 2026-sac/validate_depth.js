#!/usr/bin/env node
/* Depth validations: scrambler qualification, staffing adequacy, load balance, capacity. */
const fs = require('fs')
const PATH = process.argv[2] || '/tmp/prod_authenticated.json'
const w = JSON.parse(fs.readFileSync(PATH))
function gp(p){const e=(p.extensions||[]).find(x=>x.id==='org.cubingusa.natshelper.v1.Person');return e?(e.data.properties||{}):{}}
const ZONES=['Zona Amarilla','Zona Azul','Zona Roja']
function parse(c){const m=(c||'').match(/^([a-z0-9]+)-r(\d+)-g(\d+)(?:-a(\d+))?$/);return m?{event:m[1],round:'r'+m[2],group:+m[3],attempt:m[4]?+m[4]:null}:{event:null}}
const act={}
function idx(node,room){const pc=parse(node.activityCode);act[node.id]={room,code:node.activityCode,event:pc.event,round:pc.round,group:pc.group,attempt:pc.attempt,start:new Date(node.startTime).getTime(),end:new Date(node.endTime).getTime(),date:(node.startTime||'').slice(0,10)};for(const c of node.childActivities||[])idx(c,room)}
for(const v of w.schedule.venues)for(const r of v.rooms)for(const a of r.activities)idx(a,r.name)
function isMain(i){return i&&i.round==='r1'&&i.event&&ZONES.includes(i.room)&&i.attempt===null&&i.group!=null}
const STATIONS=14
const results=[]
function check(n,p,d){results.push({n,p,d:d||''})}

// ---- 1. SCRAMBLER QUALIFICATION ----
let badScr=0,badScrL=[]
for(const p of w.persons){
  const pr=gp(p)
  for(const asn of p.assignments||[]){
    if(asn.assignmentCode!=='staff-scrambler')continue
    const i=act[asn.activityId];if(!i||!i.event)continue
    // map event code to can-scramble key (bld/oh/mbf scrambling tracked under base where applicable)
    const ev=i.event
    const key='can-scramble-'+ev
    // only enforce for events that have a can-scramble flag system (main puzzles)
    const hasFlagSystem=Object.keys(pr).some(k=>k.startsWith('can-scramble-'))||['222','333','444','555','666','777','clock','minx','pyram','skewb','sq1'].includes(ev)
    if(['222','333','444','555','666','777','clock','minx','pyram','skewb','sq1'].includes(ev)){
      if(!pr[key]){badScr++;if(badScrL.length<15)badScrL.push(p.name+' scrambles '+ev+' but no '+key)}
    }
  }
}
check('Scramblers only assigned events they can scramble',badScr===0,badScr+(badScrL.length?'\n      '+badScrL.join('\n      '):''))

// ---- 2. STAFFING ADEQUACY vs stations ----
const jc={}
for(const p of w.persons)for(const asn of p.assignments||[]){
  if(!['staff-judge','staff-runner','staff-scrambler'].includes(asn.assignmentCode))continue
  const i=act[asn.activityId];if(!i)continue
  const j=jc[asn.activityId]=jc[asn.activityId]||{j:0,r:0,s:0}
  if(asn.assignmentCode==='staff-judge')j.j++;else if(asn.assignmentCode==='staff-runner')j.r++;else j.s++
}
const gs={}
for(const p of w.persons)for(const asn of p.assignments||[]){if(asn.assignmentCode!=='competitor')continue;const i=act[asn.activityId];if(!isMain(i))continue;gs[asn.activityId]=(gs[asn.activityId]||0)+1}
let lowJudge=0,ljL=[],judgeRatios=[]
for(const id in act){const i=act[id];if(!isMain(i))continue;const size=gs[id]||0;if(size===0)continue;const j=jc[id]||{j:0,r:0,s:0}
  const need=Math.min(STATIONS,size) // ideally ~1 judge per active station
  judgeRatios.push(j.j)
  if(j.j<Math.ceil(need*0.7)){lowJudge++;if(ljL.length<15)ljL.push(i.code+'@'+i.room+' size='+size+' judges='+j.j+' (want >='+Math.ceil(need*0.7)+')')}
}
const avgJudge=judgeRatios.length?(judgeRatios.reduce((a,b)=>a+b,0)/judgeRatios.length).toFixed(1):0
check('Groups have enough judges (>=70% of stations used)',lowJudge===0,lowJudge+' under-judged (avg judges/group='+avgJudge+')'+(ljL.length?'\n      '+ljL.join('\n      '):''))

let lowScr=0,lsL=[]
for(const id in act){const i=act[id];if(!isMain(i))continue;const size=gs[id]||0;if(size===0)continue;const j=jc[id]||{j:0,r:0,s:0}
  if(j.s<2){lowScr++;if(lsL.length<15)lsL.push(i.code+'@'+i.room+' size='+size+' scramblers='+j.s)}}
check('Groups have >=2 scramblers',lowScr===0,lowScr+' under-scrambled'+(lsL.length?'\n      '+lsL.join('\n      '):''))

// ---- 3. LOAD BALANCE ----
const load={}
for(const p of w.persons){const pr=gp(p);if(!pr['staff-team'])continue
  const jobs=(p.assignments||[]).filter(a=>['staff-judge','staff-runner','staff-scrambler','staff-Delegate'].includes(a.assignmentCode)).length
  load[p.name]={jobs,team:pr['staff-team']}}
const loadVals=Object.values(load).map(x=>x.jobs)
const maxLoad=Math.max(...loadVals),minLoad=Math.min(...loadVals),avgLoad=(loadVals.reduce((a,b)=>a+b,0)/loadVals.length).toFixed(1)
const overloaded=Object.entries(load).filter(([,v])=>v.jobs>avgLoad*1.8).map(([n,v])=>n+'('+v.jobs+')')
const idle=Object.entries(load).filter(([,v])=>v.jobs===0).map(([n,v])=>n+' T'+v.team)
check('No staff grossly overloaded (<1.8x avg)',overloaded.length===0,'avg='+avgLoad+' min='+minLoad+' max='+maxLoad+(overloaded.length?' overloaded: '+overloaded.join(', '):''))
check('No active staff completely idle (0 jobs all event)',idle.length===0,idle.length+(idle.length?' [: '+idle.slice(0,12).join(', ')+']':''))

// ---- 4. CAPACITY: per-room group size vs stations+waiting ----
// waiting zone holds 36; with 14 stations a room-group of up to ~36-40 is fine
let overCap=0,ocL=[]
const CAP=44 // 14 stations + ~36 waiting buffer is generous; flag clearly-too-big
for(const id in act){const i=act[id];if(!isMain(i))continue;const size=gs[id]||0
  if(size>CAP){overCap++;ocL.push(i.code+'@'+i.room+' size='+size)}}
check('No room-group exceeds capacity ('+CAP+')',overCap===0,overCap+(ocL.length?'\n      '+ocL.join('\n      '):''))
// also report largest room-groups
const sizes=Object.entries(gs).map(([id,n])=>({code:act[id].code,room:act[id].room,n})).sort((a,b)=>b.n-a.n)
const top5=sizes.slice(0,5).map(x=>x.code+'@'+x.room.replace('Zona ','')+':'+x.n).join(', ')

// ---- 5. RUNNERS present per group (info/soft) ----
let noRunner=0
for(const id in act){const i=act[id];if(!isMain(i))continue;const size=gs[id]||0;if(size===0)continue;const j=jc[id]||{j:0,r:0,s:0};if(j.r===0)noRunner++}
check('Every active group has >=1 runner',noRunner===0,noRunner+' without runner')

console.log('\n'+'='.repeat(72))
console.log('  DEPTH VALIDATION — SAC 2026  ('+w.persons.length+' persons)')
console.log('  Largest room-groups: '+top5)
console.log('='.repeat(72))
let P=0,F=0
for(const r of results){console.log((r.p?'✅':'❌')+' '+r.n);if(r.d&&(!r.p||/avg|min|max/.test(r.d)))console.log('      '+r.d);r.p?P++:F++}
console.log('-'.repeat(72))
console.log(F===0?'🎉 ALL '+P+' DEPTH CHECKS PASSED':'⚠️  '+P+' passed, '+F+' FAILED')
console.log('='.repeat(72))
process.exit(F===0?0:1)
