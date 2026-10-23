import {initialLived,livedSummary} from './lived.js';
import {initialCreative,creativeSummary} from './creative.js';
export const VERSION = {schema:4, content:'lived-years-1', build:'0.3.0-candidate.1'};
                                                             
                                       
                                                                            
                                                                                   
                                                    
                                                                                                                                                                                                              
                                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
const forbidden=['__proto__','prototype','constructor'];
export function get(s        ,path       )    {return path.split('.').reduce((v    ,k)=>v?.[k],s);}
function put(s      ,path       ,value       ){const parts=path.split('.');if(parts.some(x=>forbidden.includes(x)))throw Error('不允许的状态路径');const last=parts.pop() ;const parent=get(s,parts.join('.'));if(!parent||!(last in parent))throw Error('无效状态路径 '+path);parent[last]=value;}
export function matches(s      ,conditions            =[])        {return conditions.every(c=>{const a=get(s,c.path);return c.op==='eq'?a===c.value:c.op==='ne'?a!==c.value:c.op==='gte'?a>=c.value:a<=c.value;});}
export function initial(seed=2100,origin       ='engineering')       {
 if(origin==='creative-slice')return initialLived(seed,VERSION);
 if(origin==='creative')return initialCreative(seed,VERSION);
 if(origin!=='engineering')throw Error('未知人生起点');
 return {...VERSION,origin,rights:{},seed:seed>>>0,rng:seed>>>0,year:2118,birth:2100,
 player:{name:'林澄',location:'地球',role:'待选择',qualification:0,knowledge:0,alive:true,mode:'普通（延寿待扩展）'},
 world:{aiTutor:true,robotLab:false,localFab:false,habitat:false,automation:false},
 people:{mother:{name:'林芷',alive:true,location:'地球',trust:2},colleague:{name:'岑遥',alive:true,location:'地球',trust:1},partner:{name:'许禾',alive:true,location:'地球',consent:false,trust:2}},
 project:{name:'灯塔壳层',stage:'尚未参与',participated:false,sponsor:'无',design:'未定',result:'未验证',contribution:'无'},
 finance:{cash:8,income:1.1,expense:1,assets:0,debt:0},contract:{status:'无',start:0,end:0,obligation:0},
 flags:{study:'无',application:'无',family:'未讨论',future:'未选择',public:'无',career:'未定',validation:0},
 pending:null,queue:[],done:[],effectIDs:[],history:[],operations:[],ended:false};
}
function effect(s      ,e       ,id       ){if(s.effectIDs.includes(id)||!matches(s,e.when))return;put(s,e.path,e.op==='inc'?Number(get(s,e.path))+Number(e.value):e.value);s.effectIDs.push(id);}
function apply(s      ,effects         ,prefix       ){effects.forEach((e,i)=>effect(s,e,`${prefix}:${i}`));}
function advance(s      ,year       ){if(year<s.year)throw Error('时间不能倒退');const months=Math.round((year-s.year)*12);const net=months*(s.finance.income-s.finance.expense);s.finance.cash=Math.round((s.finance.cash+net)*100)/100;if(s.finance.cash<0){s.finance.debt-=s.finance.cash;s.finance.cash=0;}s.year=year;}
export function prepare(s      ,events        )       {
 if(s.pending||s.ended)return s;
 const event=events.find(e=>(e.origin??'engineering')===s.origin&&!s.done.includes(e.id)&&e.year>=s.year&&matches(s,e.when));
 if(!event){s.ended=true;s.queue=[];return s;}
 s.queue=events.filter(e=>(e.origin??'engineering')===s.origin&&!s.done.includes(e.id)&&e.year>=event.year&&matches(s,e.when)).map(e=>e.id);
 const from=s.year,cash=s.finance.cash,income=s.finance.income,expense=s.finance.expense;
 advance(s,event.year);
 if(s.origin==='creative-slice')s.transition={from,to:s.year,months:Math.round((s.year-from)*12),cashDelta:Math.round((s.finance.cash-cash)*100)/100,role:String(s.player.role),address:String(s.housing .address),income,expense};
 apply(s,event.onEnter,event.id+':enter');
 // A reproducible fixture for trial batch variability, not a real-world probability.
 if(event.id==='trial'&&!s.effectIDs.includes('trial:draw')){s.rng=(Math.imul(1664525,s.rng)+1013904223)>>>0;s.flags.validation=s.rng%3;s.effectIDs.push('trial:draw');}
 if(event.automatic){s.pending={id:event.id,stage:'result',choice:null,result:[event.automatic,...event.variants.filter(v=>matches(s,v.when)).map(v=>v.text)].join('\n\n')};s.history.push({year:s.year,event:event.id,choice:':automatic',result:s.pending.result });}
 else s.pending={id:event.id,stage:'choice',choice:null,result:null};return s;
}
export function available(s      ,o       )        {return matches(s,o.when)&&(o.cost||0)<=s.finance.cash;}
export function choose(input      ,events        ,id       )       {
 const s=structuredClone(input);if(!s.pending||s.pending.stage!=='choice')throw Error('当前没有待决选项');
 const event=events.find(e=>e.id===s.pending .id);const option=event?.options.find(o=>o.id===id);
 if(!event||!option||!available(s,option))throw Error('选项不可用：资格或现金不足');
 const outcome=option.outcomes?.find(o=>matches(s,o.when));
 apply(s,[{path:'finance.cash',op:'inc',value:-(option.cost||0)},...option.effects],event.id+':'+id);
 if(outcome&&!option.deferred)apply(s,outcome.effects,event.id+':'+id+':outcome');
 const result=option.result+(outcome&&!option.deferred?'\n\n'+outcome.text:'');
 s.pending={id:event.id,stage:option.deferred?'submitted':'result',choice:id,result};
 s.history.push({year:s.year,event:event.id,choice:id,result});s.operations.push({event:event.id,choice:id});return s;
}
export function next(input      ,events        )       {
 const s=structuredClone(input);
 if(s.pending?.stage==='submitted'){
  const event=events.find(e=>e.id===s.pending .id) ;const option=event.options.find(o=>o.id===s.pending .choice) ;
  const outcome=option.outcomes?.find(o=>matches(s,o.when));
  if(outcome)apply(s,outcome.effects,event.id+':'+option.id+':outcome');
  const result=(s.origin==='creative'?'对方答复：':'评审回复：')+(outcome?.text||'申请已处理。');
  s.pending={...s.pending,stage:'result',result};s.history.push({year:s.year,event:event.id,choice:option.id+':result',result});return s;
 }
 if(s.pending?.stage==='choice')return s; // Fast-forward never chooses or swallows an outcome.
 if(s.pending){s.done.push(s.pending.id);s.pending=null;}
 return prepare(s,events);
}
export function prose(s      ,e      )       {return [e.text,...e.variants.filter(v=>matches(s,v.when)).map(v=>v.text)].join('\n\n');}
export function serialize(s      )       {return JSON.stringify(s,null,2);}
function canonical(value    )        {if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';return JSON.stringify(value);}
export function restore(raw       ,events        )       {
 if(typeof raw!=='string'||raw.length>1024*1024)throw Error('存档结构无效或超过 1MB');
 let s      ;try{s=JSON.parse(raw);}catch{throw Error('存档不是有效 JSON');}
 if(!s||typeof s!=='object'||Array.isArray(s))throw Error('存档结构无效：需要对象');
 if(s.schema!==VERSION.schema||s.content!==VERSION.content||s.build!==VERSION.build)throw Error('存档版本不兼容，请保留原档并使用对应版本，不会自动改写。');
 // Restore only states obtainable from the exact initial state and operation sequence.
 if(!['engineering','creative','creative-slice'].includes(s.origin))throw Error('存档人生起点无效');
 if(!Number.isInteger(s.seed)||s.seed<0||s.seed>0xffffffff||!Array.isArray(s.operations)||s.operations.length>events.length)throw Error('存档结构无效');
 if(s.operations.some(o=>!o||typeof o.event!=='string'||typeof o.choice!=='string'))throw Error('存档操作历史结构无效');
 let replay=prepare(initial(s.seed,s.origin),events);
 for(const operation of s.operations){while(replay.pending&&replay.pending.stage!=='choice')replay=next(replay,events);if(replay.pending?.id!==operation.event)throw Error('存档事件历史不一致');replay=choose(replay,events,operation.choice);}
 // Only advance already committed results/system records; never invent a choice.
 for(let i=0;i<events.length*3&&canonical(replay)!==canonical(s)&&replay.pending&&replay.pending.stage!=='choice';i++)replay=next(replay,events);
 if(canonical(replay)!==canonical(s))throw Error('存档状态与回放不一致；拒绝损坏或修改的存档。');
 return replay;
}
export function summary(s      )        {
 if(s.origin==='creative-slice')return livedSummary(s);
 if(s.origin==='creative')return creativeSummary(s);
 const lines=[`${Math.floor(s.year)} 年，${Math.floor(s.year-s.birth)} 岁。你仍然活着；这里是测试片段的边界。`,
 `你现在在${s.player.location}，从事${s.player.role}。现金 ${s.finance.cash.toFixed(1)}，债务 ${s.finance.debt.toFixed(1)}，均为情境生活单位。`,
 s.project.participated?`你参与了${s.project.name}：${s.project.contribution}；项目${s.project.stage}，验证${s.project.result}。`:'你没有加入灯塔壳层研究；设施仍由别的团队建设。你的社区工作不是这项发明的署名。',
 `许禾目前在${s.people.partner.location}；家庭安排：${s.flags.family}。林芷仍在${s.people.mother.location}。`,
 `合同状态：${s.contract.status}。下一阶段：${s.flags.future}。`,
 '实际经历：',...s.history.map(h=>`${Math.floor(h.year)} · ${h.result}`)];return lines.join('\n\n');
}
export function validateContent(events        )      {
 const ids=new Set        ();
 for(const e of events){if(ids.has(e.id))throw Error('重复事件 ID');ids.add(e.id);if((!e.options.length&&!e.automatic)||e.repeat!=='once'||!e.scenario)throw Error('事件结构不完整');if(e.automatic&&e.options.length)throw Error('自动记录不能同时含选择');for(const fx of e.onEnter){if(get(initial(2100,e.origin??'engineering'),fx.path)===undefined)throw Error('无效进入效果路径 '+fx.path);}const opts=new Set();for(const o of e.options){if(opts.has(o.id))throw Error('重复选项 ID');opts.add(o.id);if((o.cost||0)<0)throw Error('负成本');for(const fx of [...e.onEnter,...o.effects,...(o.outcomes||[]).flatMap(x=>x.effects)]){if(get(initial(2100,e.origin??'engineering'),fx.path)===undefined)throw Error('无效效果路径 '+fx.path);}}}
 for(const e of events)for(const ref of e.followup)if(!ids.has(ref))throw Error('无效后续引用 '+ref);
 if(events.some((e,i)=>i>0&&e.year<events[i-1].year))throw Error('事件需按时间排序');
}
