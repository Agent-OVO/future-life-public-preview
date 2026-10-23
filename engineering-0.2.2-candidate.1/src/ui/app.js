import {initial,prepare,choose,next,prose,available,matches,serialize,restore,summary,validateContent,VERSION} from '../engine/index.js';
import {USE_OFFER} from '../engine/engineering-scenes.js';
import {createStore} from './candidate-storage.js';
const root=document.querySelector('#app');
const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const paras=x=>String(x).split('\n\n').filter(Boolean).map(p=>`<p>${esc(p).replaceAll('\n','<br>')}</p>`).join('');
const date=y=>`${Math.floor(y)}年${Number.isInteger(y)?'':` ${Math.round((y%1)*12)+1}月`}`;
let events,s=null,raw=null,pendingRaw=null,store,entry=true,busy=false,frozen=false,error='',notice='',epoch=0;
function download(text,name){if(text===null)return;const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function commit(candidate,archive=false){pendingRaw=serialize(candidate);restore(pendingRaw,events);const saved=await store.commit(raw,pendingRaw,{archive});s=candidate;raw=saved;pendingRaw=null;}
async function act(fn){if(busy||frozen)return;busy=true;root.querySelectorAll('button,input').forEach(n=>n.disabled=true);try{await fn();error='';}catch(e){frozen=true;error=String(e)+' 页面已停止推进。现有原文和待存内容可分别导出，刷新后核对。';}finally{busy=false;render();}}
function diagram(){const p=s.project;if(p.application!=='试种循环支路')return '';
 if(p.trialLayout==='未选择')return '<div class="lab-view" aria-label="布局待决"><b>循环组件已到位 · 余量 0</b><p>两个接口尚未连接。下一步由你选择水路与架位。</p></div>';
 const separate=p.trialLayout==='双独立回路';return `<figure class="lab-view" aria-label="${esc(p.trialLayout)}"><figcaption><b>${esc(p.trialLayout)}</b> · ${p.rackGroups} 组架位</figcaption><div class="racks ${separate?'separate':'shared'}">${Array.from({length:p.rackGroups},(_,i)=>`<div>架 ${i+1}<small>${separate?(i===0?'左路停换':'右路继续'):'整组停换'}</small></div>`).join('')}</div><p>${esc(p.switchMode)}<br>这套布局支持：${esc(p.trialTasks)}</p><small>布局与切换已检查；未记录收获。</small></figure>`;
}
function toolbar(){return `<div class="toolbar"><button id="export" ${raw===null?'disabled':''}>导出当前原文</button>${pendingRaw!==null?'<button id="pending-export">导出待存内容</button>':''}<button id="new">保留记录并新开</button><label class="file-button">导入候选记录<input id="import" type="file" accept="application/json,.json"></label><span>${VERSION.build}</span></div>`;}
function render(){const renderEpoch=++epoch,renderState=s;let body='';
 if(entry){
  body=`<section class="reading"><div class="eyebrow">工程独立候选 · 2100年出生</div><h1>灯塔壳层</h1><p>从一张工作台开始，选择让更多设备上路、让维护机器人离开一阵，或让当地工作台重做它。</p><p>林澄，18—43岁。三个相连现场：2127年设计、2130年验证、2138年实际应用。这里保留原来的工作、家庭和去留。</p>${s?'<button id="resume" class="primary">继续这段生活</button>':''}<details><summary>选择复现情境</summary><label>种子 <input id="seed" type="number" value="2100" min="0" max="4294967295" step="1"></label><p class="small">固定批次用于复现，不是现实成功率。默认 2100；1 可检查轻量失败路径。</p></details><button id="start" class="primary">${raw===null?'开始林澄的人生':'保留当前原文，开始新人生'}</button><p class="small">本候选使用独立记录位置。旧版记录请在旧版继续；不会自动转换或重置。</p></section>`;
  let archives=[];try{archives=store?.archives()??[];}catch{}
  body+=`<details class="panel"><summary>本候选已保留的记录 · ${archives.length}</summary>${archives.map((a,i)=>`<button data-archive="${i}" class="quiet">导出保留记录 ${i+1}</button>`).join('')}</details>`;
  root.innerHTML=toolbar()+messages()+body;
  root.querySelector('#start').onclick=()=>act(async()=>{const seed=Number(root.querySelector('#seed')?.value??2100);if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw Error('种子须为 0 至 4294967295 的整数。');await commit(prepare(initial(seed,'engineering'),events),raw!==null);entry=false;notice='已保存独立候选记录。';});
  const resume=root.querySelector('#resume');if(resume)resume.onclick=()=>{entry=false;render();};
  root.querySelectorAll('[data-archive]').forEach(n=>n.onclick=()=>download(archives[Number(n.dataset.archive)].raw,'engineering-preserved-original.json'));
 }else if(s){
  const event=events.find(e=>e.id===s.pending?.id),p=s.project;
  const choices=event?.options.filter(o=>matches(s,o.when))??[];
  const current=()=>epoch===renderEpoch&&s===renderState&&!entry;
  body=`<div class="layout"><section class="reading"><div class="chapter"><span>${date(s.year)} · ${Math.floor(s.year-s.birth)}岁</span><span>${esc(s.player.location)}</span></div><h2 id="event-title" tabindex="-1">${esc(s.ended?'下一张工作台':event.title)}</h2>`;
  if(s.ended)body+=`<div class="story">${paras(summary(s))}</div>`;
  else if(s.pending.stage==='choice')body+=`<div class="story">${paras(prose(s,event))}</div><div class="choices">${choices.map(o=>`<button class="choice" data-choice="${esc(o.id)}" ${available(s,o)?'':'disabled'}><strong>${esc(o.label)}</strong><span>${esc(o.hint)}${available(s,o)?'':' · 当前现金或安排不满足'}</span></button>`).join('')}</div>`;
  else body+=`<div class="result-tag">${s.pending.stage==='submitted'?'请求已提交 · 等待答复':'已经发生'}</div><div class="story result">${paras(s.pending.result)}</div><button id="next" class="primary">${s.pending.stage==='submitted'?'看答复 →':'读完，继续 →'}</button>`;
  if(s.pending?.id==='infrastructure_layout'||s.pending?.id==='infrastructure_use'&&p.application==='试种循环支路'||s.ended)body+=diagram();
  body+=`<details class="source"><summary>这一场的资料与安排</summary><p>人物、年份、费用、整包运输份额及未来设施均为原创情境。整包包括设备、保护件和约定周期备件；不代表一艘飞船或完整温室。</p>${p.useGrantId===USE_OFFER.id?`<p>本轮材料：${esc(USE_OFFER.materials)}。资源：${esc(USE_OFFER.resources)}。范围不含${esc(USE_OFFER.excludes)}。</p>`:''}<p><a href="./sources.html" target="_blank" rel="noopener">现实资料与原创情境说明</a></p></details></section>`;
  body+=`<aside><section class="panel"><div class="eyebrow">现在的生活</div><h3>林澄 · ${Math.floor(s.year-s.birth)}岁</h3><p>${esc(s.player.role)} · ${esc(s.player.location)}</p><dl><dt>现金</dt><dd>${s.finance.cash.toFixed(2)}</dd><dt>月收入 / 支出</dt><dd>${s.finance.income.toFixed(2)} / ${s.finance.expense.toFixed(2)}</dd><dt>预留 / 债务</dt><dd>${s.finance.assets.toFixed(2)} / ${s.finance.debt.toFixed(2)}</dd></dl><p class="small">情境生活单位，不是现实价格。</p></section><section class="panel"><h3>人和正在做的事</h3><p>许禾 · ${esc(s.people.partner.location)}<br>林芷 · ${esc(s.people.mother.location)}<br>岑遥 · ${esc(s.people.colleague.location)}</p><p>${esc(s.flags.family)}</p><p>合同：${esc(s.contract.status)}</p>${p.participated?`<p>${esc(p.contribution)}<br>${esc(p.design)} · ${esc(p.result)}</p><p>本轮：${esc(p.application)}<br>${esc(p.applicationStatus)}</p>`:'<p>社区工作继续，灯塔壳层由其他团队推进。</p>'}</section><details class="panel"><summary>已走过的路 · ${s.history.length}</summary>${s.history.map(h=>`<article><b>${date(h.year)}</b>${paras(h.result)}</article>`).join('')}</details></aside></div>`;
  root.innerHTML=toolbar()+messages()+body;
  root.querySelectorAll('[data-choice]').forEach(n=>n.onclick=()=>{if(!current())return;act(async()=>{await commit(choose(s,events,n.dataset.choice));notice='已保存这次选择。';focus();});});
  const n=root.querySelector('#next');if(n)n.onclick=()=>{if(!current())return;act(async()=>{await commit(next(s,events));notice='已推进到下一次变化。';focus();});};
 }
 wireCommon();if(busy||frozen)root.querySelectorAll('button,input').forEach(n=>{if(!['export','pending-export'].includes(n.id))n.disabled=true;});
}
function messages(){return `<p class="notice" role="status">${esc(notice)}</p><p class="error" role="alert">${esc(error)}</p>`;}
function focus(){setTimeout(()=>root.querySelector('#event-title')?.focus(),0);}
function wireCommon(){
 root.querySelector('#export').onclick=()=>download(raw,'engineering-current-original.json');
 const pending=root.querySelector('#pending-export');if(pending)pending.onclick=()=>download(pendingRaw,'engineering-UNCONFIRMED-pending.json');
 root.querySelector('#new').onclick=()=>{if(busy||frozen)return;entry=true;render();};
 root.querySelector('#import').onchange=async ev=>{
  const file=ev.target.files?.[0];if(!file||busy||frozen)return;
  let candidate;try{if(file.size>1024*1024)throw Error('记录超过 1MB');candidate=restore(await file.text(),events);if(candidate.origin!=='engineering')throw Error('本候选只接工程记录');}catch(e){error=String(e)+' 当前记录未改变。';render();return;}
  await act(async()=>{await commit(candidate,raw!==null);entry=false;notice='已保留原文并恢复候选记录。';});
 };
}
try{
 const response=await fetch('./content/events.json');if(!response.ok)throw Error('工程事件读取失败');events=await response.json();validateContent(events);
 store=createStore(localStorage,navigator.locks);raw=store.read();
 if(raw!==null){try{s=restore(raw,events);if(s.origin!=='engineering')throw Error('起点不符');entry=false;notice='已恢复本候选的实际停点。';}catch{s=null;entry=true;error='当前原文不兼容或已损坏，仍被保留。可以导出；新开会先另存原字节，失败即停止。';}}
 render();
}catch(e){root.textContent='未开始或写入人生：'+String(e)+'。请通过本机 HTTP 服务打开。';}
