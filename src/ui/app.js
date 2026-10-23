import {initial,prepare,choose,next,prose,available,serialize,restore,summary,validateContent,VERSION} from '../engine/index.js';
                                                           
const app=document.querySelector             ('#app') ;
const KEY='future-life.public-preview.0.2.1';
const escape=(v        )=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const dateLabel=(year       )=>`${Math.floor(year)} 年${Number.isInteger(year)?'':' '+(Math.round((year%1)*12)+1)+' 月'}`;
const paragraphs=(s       )=>s.split('\n\n').map(p=>`<p>${escape(p).replaceAll('\n','<br>')}</p>`).join('');
const sourceLinks                        ={
 S1:['AI 材料候选与实物验证的区别 · DeepMind 2023','https://deepmind.google/blog/millions-of-new-materials-discovered-with-deep-learning/'],
 S2:['月尘与密封件 · NASA 2020','https://www.nasa.gov/centers-and-facilities/ames/when-the-moon-dust-settles-it-wont-settle-in-vipers-wheels/'],
 S3:['NASA 载人空间站水回收实证 · 2023','https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station/'],
 S4:['光传播时间的物理边界 · NASA','https://science.nasa.gov/mission/webb/science-overview/science-explainers/how-does-webb-see-back-in-time/'],
 S5:['职业暴露不是个人失业命运 · ILO 2025','https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure'],
 S6:['人口预测不覆盖本片段未来社会 · UN WPP 2024','https://population.un.org/wpp/'],
 'D-S01':['火星通信时延与中断 · NASA 2023','https://www.nasa.gov/wp-content/uploads/2024/01/mars-communications-disruption-and-delay.pdf'],
 S7:['条件事件的设计方法 · Emily Short 2019','https://emshort.blog/2019/11/29/storylets-you-want-them/']};

let events        ,s      ,error='',notice='';
let incompatibleRaw            =null;
let selectingOrigin=false;
let hasProgress=false;
let replacementConfirmed=false;
let origins                                                               =[];
try {
 const response=await fetch('./content/origins.json');if(!response.ok)throw Error('起点库无法读取');origins=await response.json();
 events=(await Promise.all(origins.map(async o=>{const r=await fetch('./content/'+o.file);if(!r.ok)throw Error('事件库无法读取');return await r.json()           ;}))).flat().sort((a,b)=>a.year-b.year);validateContent(events);
 selectingOrigin=true;
 s=prepare(initial(),events);
 try{const saved=localStorage.getItem(KEY);if(saved){try{s=restore(saved,events);hasProgress=true;selectingOrigin=false;notice='已恢复本机存档。';}catch{incompatibleRaw=saved;error='本机存档不兼容或已损坏，原文仍被保留。请先导出原档，再明确开始新一段；也可以导入有效存档。新选择暂时禁用，不会自动覆盖原档。';}}}catch{notice='本机存储不可读取，请使用手动导出保存。';}
 render();
}catch(e){app.textContent='启动失败：'+String(e)+'。请通过 npm run build 和 npm start 启动，不要直接双击 HTML。';}
function persist(){if(incompatibleRaw!==null)return;try{localStorage.setItem(KEY,serialize(s));}catch{notice='浏览器未允许本机保存，请使用导出存档。';}}
function render(){
 if(selectingOrigin){renderOrigins();return;}
 const event=events.find(e=>e.id===s.pending?.id);
 const year=Math.floor(s.year),age=Math.floor(s.year-s.birth);
 const progress=Math.round(s.done.length/events.filter(e=>(e.origin??'engineering')===s.origin).length*100);
 const ended=s.ended;
 app.innerHTML=`<div class="hero"><div><div class="eyebrow">一段普通人的星际时代</div><h1>${s.origin==='creative'?'回声剧场':'灯塔壳层'}</h1><p>你不必改变整个文明。<br>但时代改变时，你的选择应当留下痕迹。</p></div><div class="orbital" aria-hidden="true"><div class="planet"></div><div class="orbit"></div><span>${s.origin==='creative'?'织城':'EARTH'}</span><i></i><b>${s.origin==='creative'?'远方来信':'LUNA'}</b></div></div>
 <div class="toolbar"><button id="export" class="quiet">${incompatibleRaw!==null?'导出保留的原档':'导出存档'}</button><label class="file-button">导入存档<input type="file" id="import" accept="application/json,.json"></label><button id="restart" class="quiet">开始新一段</button><span>版本 ${VERSION.build} · ${s.origin==='creative'?'织城创作起点':'工程起点'} / 种子 ${s.seed}</span></div>
 <div role="status" class="notice">${escape(notice)}</div><div role="alert" class="error">${escape(error)}</div>
 <div class="layout"><section class="reading" aria-labelledby="event-title"><div class="chapter"><span>${dateLabel(s.year)} · ${age} 岁</span><span>${escape(s.player.location)} / ${s.pending?.stage==='submitted'?'请求待答复':s.pending?.stage==='result'?'行动结果':ended?'阶段边界':'人生抉择'}</span></div>
 <div class="progress" aria-label="片段进度"><i style="width:${progress}%"></i></div>
 <h2 id="event-title" tabindex="-1">${ended?'下一段人生尚未开始':escape(event?.title||'')}</h2>
 ${ended?`<div class="story">${paragraphs(summary(s))}</div><div class="end-note">${s.origin==='creative'?'可玩范围：2118—2168，存活条件下的 50 年叙事切片。不模拟死亡或健康，不代表完整一生。':'可玩范围：2118—2143。此处不是死亡结局。'} 延寿与其他起点仍未制作。</div>`:s.pending?.stage!=='choice'?`<div class="result-tag">${s.pending?.stage==='submitted'?'已提交 · 尚待答复':'已经发生'}</div><div class="story result">${paragraphs(s.pending.result||'')}</div><button id="next" class="primary">${s.pending?.stage==='submitted'?'查看对方答复 →':'读完结果，去下一次重要变化 →'}</button><p class="small">快进只概括稳定年份，不替你选择下一张卡。</p>`:`<div class="story">${paragraphs(prose(s,event ))}</div><div class="choices">${event .options.map(o=>`<button class="choice" data-choice="${escape(o.id)}" ${available(s,o)&&incompatibleRaw===null?'':'disabled'}><strong>${escape(o.label)}</strong><span>${escape(o.hint)}${available(s,o)?'':' · 当前资格或现金不满足'}</span></button>`).join('')}</div>`}
 ${event?`<details class="source"><summary>情境与资料边界</summary><p>本事件人物、机构、年份、资格、合同和价格均为原创情境。真实资料只解释技术问题，不为人物概率背书。</p>${event.sources.map(id=>{const x=sourceLinks[id];return x?`<p><a href="${x[1]}" target="_blank" rel="noopener noreferrer">${escape(x[0])}</a></p>`:'';}).join('')}<p>完整资料与情境边界见页面底部的资料说明。</p></details>`:''}
 </section><aside><section class="panel"><div class="eyebrow">当前处境</div><h3>${escape(s.player.name)} <span>${age} 岁</span></h3><p>${escape(s.player.role)} · ${escape(s.player.location)}</p><dl><dt>现金</dt><dd>${s.finance.cash.toFixed(1)}</dd><dt>月收入 / 生活支出</dt><dd>${s.finance.income.toFixed(2)} / ${s.finance.expense.toFixed(2)}</dd><dt>预留资产 / 债务</dt><dd>${s.finance.assets.toFixed(1)} / ${s.finance.debt.toFixed(1)}</dd>${s.origin==='creative'?'<dt>作品版本</dt><dd>'+escape(s.rights.version)+'</dd>':'<dt>现场资格 / 知识基础</dt><dd>'+s.player.qualification+' / '+s.player.knowledge+'</dd>'}</dl><p class="small">计价基准：地球一个月基本生活费。跨地球/月球共用同一情境单位。</p></section>
 <section class="panel"><div class="eyebrow">人与未了的事</div><h3>你带着什么向前</h3><p>${Object.values(s.people).map(p=>escape(p.name)+' · '+escape(p.location)+(p.active===false?' · 已退出新合作':'')).join('<br>')}</p><p>${escape(s.origin==='creative'?s.flags.cooperation:s.flags.family)}</p>${s.origin==='creative'?'<p><b>使用范围</b> '+escape(s.rights.platform)+'<br>'+escape(s.rights.image)+'</p>':''}<p><b>合同</b> ${escape(s.contract.status)}</p><p><b>${escape(s.project.name)}</b> ${s.project.participated?escape(s.project.stage):'未加入'}${s.origin==='creative'&&s.project.participated?'<br>《'+escape(s.project.workTitle)+'》':''}<br><span class="small">${s.project.participated?escape(s.project.contribution):'世界仍在其他人的推动下前进'}</span></p></section>
 <details class="panel timeline" ${ended?'open':''}><summary>人生记录 · ${s.history.length} 条记录</summary>${s.history.length?s.history.map(h=>`<article><b>${dateLabel(h.year)} · ${escape(events.find(e=>e.id===h.event)?.title)}</b>${paragraphs(h.result)}</article>`).join(''):'第一项行动还未作出。'}</details>
 <section class="panel boundary"><b>这只是世界的一扇门</b><p>工程与共同创作是两个独立起点，不是所有人的必经之路。更广阔的职业、社会、长期寿命与远方文明留待后续内容，不以重复事件冒充无限人生。</p></section></aside></div>`;
 app.querySelectorAll                   ('[data-choice]').forEach(b=>b.onclick=()=>{if(incompatibleRaw!==null)return;try{s=choose(s,events,b.dataset.choice );notice='已记录结果并保存本机存档。';error='';persist();render();focus();}catch(e){error=String(e);render();}});
 const n=app.querySelector                   ('#next');if(n)n.onclick=()=>{s=next(s,events);notice='已推进到下一次重要变化。';error='';persist();render();focus();};
 app.querySelector                   ('#export') .onclick=()=>{const blob=new Blob([incompatibleRaw??serialize(s)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=incompatibleRaw!==null?'future-life-preserved-original.json':`future-life-${year}-${s.pending?.stage||'end'}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 wireCommon();
}
function renderOrigins(){
 app.innerHTML=`<div class="hero"><div><div class="eyebrow">未来人生 · 原创情境</div><h1>从哪一种生活开始</h1><p>出生于 2100 年。人生不必经过同一个工程，也不必迁居太空。</p></div></div><div class="toolbar"><button id="export" ${!hasProgress&&incompatibleRaw===null?'disabled':''}>${incompatibleRaw!==null?'导出保留的原档':'导出当前存档'}</button><label class="file-button">导入存档<input type="file" id="import" accept="application/json,.json"></label><button id="restart">明确开始新一段</button></div><p class="error" role="alert">${escape(error)}</p><p class="notice">${escape(notice)}</p><section class="reading choices"><label>情境种子 <input id="seed" type="number" min="0" max="4294967295" step="1" value="2100"></label><p class="small">用于复现名额等情境，不是现实概率。2100 有试演时段，2101 本期时段不足。</p>${origins.map(o=>`<button class="choice" data-origin="${o.id}" ${incompatibleRaw!==null&&!replacementConfirmed?'disabled':''}><strong>${escape(o.title)}</strong><span>${escape(o.tag)}<br>${escape(o.scope)}</span></button>`).join('')}</section>`;
 app.querySelectorAll                   ('[data-origin]').forEach(b=>b.onclick=()=>{if(incompatibleRaw!==null&&!replacementConfirmed)return;const seed=Number(app.querySelector                  ('#seed')?.value??2100);if(!Number.isInteger(seed)||seed<0||seed>4294967295){error='种子须为 0 至 4294967295 的整数。';render();return;}incompatibleRaw=null;replacementConfirmed=false;hasProgress=true;s=prepare(initial(seed,b.dataset.origin          ),events);selectingOrigin=false;error='';notice='已开始所选起点。';persist();render();});
 app.querySelector                   ('#export') .onclick=()=>{if(!hasProgress&&incompatibleRaw===null)return;const url=URL.createObjectURL(new Blob([incompatibleRaw??serialize(s)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=incompatibleRaw!==null?'future-life-preserved-original.json':'future-life-current.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 wireCommon();
}
function wireCommon(){
 app.querySelector                   ('#restart') .onclick=()=>{if(confirm('选择新起点将替换本机存档。请先导出需要保留的原档。确定放弃当前本机进度并选择新起点？')){replacementConfirmed=true;selectingOrigin=true;error='';notice='请选起点；选择后才写入新档。';render();}};
 app.querySelector                  ('#import') .onchange=async ev=>{const file=(ev.target                    ).files?.[0];if(!file)return;try{if(file.size>1024*1024)throw Error('存档超过 1MB 限制');const candidate=restore(await file.text(),events);s=candidate;hasProgress=true;incompatibleRaw=null;selectingOrigin=false;error='';notice='已恢复对应起点与待决结果。';persist();render();focus();}catch(e){error=String(e)+' 当前进度未改变。';render();}};
}
function focus(){document.querySelector             ('#event-title')?.focus();}
