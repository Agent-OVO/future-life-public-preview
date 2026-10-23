import * as S from './systems.js';
                                                                                                                                                                                                                                                                                                                                                                                                                            
                                            
const get=(o    ,p       )=>p.split('.').reduce((v,k)=>v?.[k],o);
function put(o    ,p       ,v    ){const a=p.split('.');if(a.some(k=>['__proto__','constructor','prototype'].includes(k)))throw Error('无效状态路径');const k=a.pop() ;const parent=a.reduce((v,k)=>v?.[k],o);if(!parent||!(k in parent))throw Error('未知状态路径 '+p);parent[k]=v;}
const matches=(d    ,c      =[])=>c.every(x=>{const v=get(d,x.path);return x.op==='eq'?v===x.value:x.op==='ne'?v!==x.value:x.op==='gte'?v>=x.value:x.op==='lte'?v<=x.value:false;});
function sync(s     ){const t=s.system,d=s.data;d.year=t.at/12;d.birth=2100;d.player.mode=t.mode==='ordinary'?'普通':'不老预览';d.player.alive=t.alive;d.player.location=t.location;d.player.role=t.role;d.finance={cash:t.cash/100,income:t.income/100,expense:S.expense(t)/100,assets:t.reserve/100,debt:0};d.flags.asCurrentFieldFit=S.canField(t);if(t.treatment!=='none')d.flags.asRepairStatus=t.treatment;d.flags.asFunctionGain=t.functionGain;}
export function initial(pack     ,mode       ,profile          ,seed=2100,conditions             ='open')     {
 const system=S.initial(mode,profile,seed,conditions),d=structuredClone(pack.initial),c=S.CONDITIONS[conditions];
 Object.assign(d.flags,{asRepairEligible:c.repair,asRepairBenefitFixture:S.SCENARIOS[profile].benefit&&c.benefit,asCoastPlace:c.coast,asCoastRemoteSlot:c.remote,asExamPass:c.exam,asLunarFit:c.lunarFit,asLunarPlace:c.lunarPlace,asLunarRemoteSlot:c.lunarRemote,asAliveAt2190:system.death===null||system.death>2190*12});
 const s     ={...S.VERSION,origin:'care_aftershift',system,data:d,pending:null,done:[],history:[],effects:[],seenSystem:0,ended:false,operations:[]};sync(s);return prepare(s,pack);
}
function fx(s     ,list      ,prefix       ){for(let i=0;i<list.length;i++){const f=list[i],id=prefix+':'+i;if(s.effects.includes(id)||!matches(s.data,f.when))continue;const value=f.op==='inc'?Number(get(s.data,f.path))+Number(f.value):f.value;put(s.data,f.path,value);s.effects.push(id);
 if(f.path==='finance.cash')s.system.cash=Math.round(value*100);
 if(f.path==='finance.income')s.system.income=Math.round(value*100);
 if(f.path==='finance.expense')s.system.baseExpense=Math.round(value*100)-s.system.serviceExpense-s.system.mealExpense;
 if(f.path==='player.role')s.system.role=String(value);
 if(f.path==='player.location')s.system.location=String(value);
 }if(s.system.cash<0||s.system.baseExpense<0)throw Error('剧情效果制造不可支付安排');sync(s);}
function endSharedHousing(s     ){if(!s.data.flags.asShareActive)return;s.data.flags.asShareActive=false;if(s.system.at<2172*12)s.data.people.jilan.location='潮湾培训住处';}
function moveHousing(s     ,housing       ){if(s.system.housing!==housing)endSharedHousing(s);s.system.housing=housing;}
function systemAction(s     ,op            ){const prior=s.system.housing;s.system=S.act(s.system,op);if(s.system.housing!==prior)endSharedHousing(s);sync(s);}
function note(s     ,id       ,choice       ,result       ){s.history.push({year:s.system.at/12,event:id,choice,result});}
// Re-evaluate story eligibility at every system transition, not only after a later story date.
function advanceToward(s     ,to       ){const t=s.system;const boundaries=[t.treatmentEnd,t.repairReview,t.lunarReview,t.departureAt,t.arrivalAt,t.returnAt,t.contract.end,t.mealUntil,t.support.review,t.death,t.end].filter((v)            =>v!==null&&v>t.at);systemAction(s,{kind:'advance',to:Math.min(Math.round(to*12),...boundaries)/12});}
function eventNow(s     ,pack     ){return pack.events.find(e=>!['AS22','AS24'].includes(e.id)&&!s.done.includes(e.id)&&Math.round(e.year*12)>=s.system.at&&matches(s.data,e.when));}
function prepare(s     ,pack     )     {
 if(s.pending||s.ended)return s;sync(s);if(s.system.at>=2182*12&&s.data.flags.asMaintenance==='to2182')s.data.flags.asMaintenance='expired2182';if(s.system.at>=2188*12&&s.data.flags.asMaintenance==='to2188')s.data.flags.asMaintenance='closed_at2188';
 // Routine expiry and already-authorized settlement remain visible in the journal, not extra decision cards.
 if(s.seenSystem<s.system.history.length){for(const row of s.system.history.slice(s.seenSystem))s.history.push({year:row.at/12,event:row.id,choice:':system',result:row.text});s.seenSystem=s.system.history.length;}
 if(s.system.pending?.kind==='death'){s.pending={id:s.system.pending.id,source:'death',stage:'result',choice:null,result:s.system.pending.text};return s;}
 if(s.system.pending&&s.system.pending.kind!=='contract'){s.pending={id:s.system.pending.id,source:'system',stage:'choice',choice:null,result:null};return s;}
 const e=eventNow(s,pack);
 if(!e){if(!s.system.ended){advanceToward(s,s.system.end/12);return prepare(s,pack);}s.ended=true;return s;}
 if(Math.round(e.year*12)>s.system.end){if(!s.system.ended){advanceToward(s,s.system.end/12);return prepare(s,pack);}s.ended=true;return s;}
 if(s.system.pending?.kind==='contract'){
  if(!['AS28X','AS28XE'].includes(e.id)||Math.round(e.year*12)!==s.system.at)throw Error('岗位到期缺少对应剧情安排');
  s.system.pending=null;
 }
 if(Math.round(e.year*12)>s.system.at){advanceToward(s,e.year);return prepare(s,pack);}
 if(s.system.ended&&!['AS23','AS30'].includes(e.id)){s.ended=true;return s;}
 if(e.id==='AS28XE'){systemAction(s,{kind:'lunar_return',early:false});}
 // System-controlled money and arrival dates are not written a second time by authored effects.
 const controlled=['AS04','AS08','AS10','AS16','AS27','AS28D','AS28A','AS28X','AS28XE','AS28ER','AS28SR','AS28XR'];
 const effects=controlled.includes(e.id)?e.onEnter.filter((f    )=>!f.path.startsWith('finance.')&&!f.path.startsWith('player.')):e.onEnter;
 fx(s,effects,e.id+':enter');
 if(e.id==='AS11')moveHousing(s,'潮湾两间租屋，纪岚已迁出');
 if(e.automatic){const result=[e.text,e.automatic,...e.variants.filter((v    )=>matches(s.data,v.when)).map((v    )=>v.text)].join('\n\n');s.pending={id:e.id,source:'story',stage:'result',choice:null,result};note(s,e.id,':automatic',result);}
 else s.pending={id:e.id,source:'story',stage:'choice',choice:null,result:null};
 return s;
}
export function current(s     ,pack     )    {
 if(!s.pending)return null;if(s.pending.source==='story')return pack.events.find(e=>e.id===s.pending .id);
 if(s.pending.stage==='result')return {id:s.pending.id,title:s.pending.source==='death'?'后来的人只知道一部分':'这段日子里的变化',text:s.pending.result,options:[]};
 const budget=s.system.pending?.kind==='budget';return {id:s.pending.id,title:budget?'下个月的安排':'下一年的支持',text:s.system.pending?.text,options:budget?[
 {id:'near',label:'明确换到同街小屋',hint:'基础生活0.74U；已有支持单独保留。'},
 {id:'far',label:'明确换到远处小屋',hint:'基础生活0.70U，单程通勤80分钟；不可悄悄转移原服务。'},
 {id:'support',label:'接受固定窗口的公共补差',hint:'基础生活与支持共0.78U；每月0.02U直接付服务方，不补额外饭桌。'},
 {id:'shared_meal',label:'和纪岚改约公共饭桌、各自带饭',hint:'终止额外0.04U月支出，不等于关系结束。'}]:[
 {id:'paid_auto',label:'续一年原支持，并授权同条件可支付时续期',hint:'每月服务0.06U；未来一年不足时不能续。'},
 {id:'subsidized_auto',label:'改为固定窗口补差安排',hint:'服务由本人0.04U与公共0.02U分担。'},
 {id:'as_needed',label:'选择按需公共支持',hint:'保留0.74U基础生活，不要求朋友承担固定护理。'}]};
}
function optionAction(s     ,e    ,o    ){const key=e.id+'/'+o.id;let delegated=false;
 const operations                           ={
 'AS06/assess':{kind:'repair_apply'},'AS07/start':{kind:'treatment'},'AS28/resident':{kind:'lunar_apply'},'AS28M/accept':{kind:'lunar_sign'},'AS28F/return':{kind:'lunar_return',early:true},'AS28X/return':{kind:'lunar_return',early:false},'AS28X/extend':{kind:'lunar_extend'},'AS21/support':{kind:'support',choice:'paid_auto'},'AS21/compact':{kind:'support',choice:'as_needed'},'AS21/subsidized':{kind:'support',choice:'subsidized_auto'},'AS26/weekly':{kind:'meal',until:2202}};
 if(operations[key]){systemAction(s,operations[key]);delegated=true;}
 else {if(s.system.cash<Math.round((o.cost||0)*100))throw Error('现金不足');s.system.cash-=Math.round((o.cost||0)*100);sync(s);}
 const outcome=o.outcomes?.find((v    )=>matches(s.data,v.when));
 // Capture outcome before effects change contribution history.
 const skip=(f    )=>delegated&&(f.path.startsWith('finance.')||f.path.startsWith('contract.')||f.path==='player.location');
 fx(s,o.effects.filter((f    )=>!skip(f)),key);if(outcome)fx(s,outcome.effects.filter((f    )=>!skip(f)),key+':outcome');
 if(key==='AS04/bridge')s.system.contract={kind:'short',pay:28,end:2172*12,status:'周转箱过渡短班'};
 if(key==='AS15/job')s.system.contract={kind:'short',pay:20,end:Math.round(2175.5*12),status:'一年洄岸季节协作'};
 if(key==='AS09S/board'&&s.data.flags.asBridgeActive)s.system.contract.pay=0; // Wage paused until AS09E.
 if(['AS02/compact','AS11/compact','AS12H/near'].includes(key))moveHousing(s,'潮湾同街一室屋');
 if(key==='AS02/share')s.system.housing='潮湾两间租屋，与纪岚合住';
 if(key==='AS12H/far')moveHousing(s,'潮湾远处小屋，通勤80分钟');
 if(key==='AS28/earth'){moveHousing(s,'新岸长租小屋');s.system.support={kind:'none',autoRenew:false,review:null};s.system.serviceExpense=0;s.system.baseExpense=76;}
 sync(s);return o.result+(outcome?'\n\n'+outcome.text:'');
}
export function available(s     ,pack     ,id       )        {
 if(s.pending?.stage!=='choice'||!s.system.alive)return false;const e=current(s,pack),o=e.options.find((o    )=>o.id===id);if(!o)return false;
 try{const t=structuredClone(s);if(s.pending.source==='system'){systemAction(t,s.system.pending .kind==='budget'?{kind:'budget',choice:id       }:{kind:'support',choice:id       });return true;}
 if(!matches(s.data,o.when))return false;optionAction(t,e,o);return true;}catch{return false;}
}
function chooseInternal(s     ,pack     ,id       ){if(!available(s,pack,id))throw Error('当前选项不可用');const e=current(s,pack);let result       ;
 if(s.pending .source==='system'){
  const kind=s.system.pending .kind,wasShared=s.data.flags.asShareActive;systemAction(s,kind==='budget'?{kind:'budget',choice:id       }:{kind:'support',choice:id       });result=s.system.history.at(-1)?.text||'安排已调整。';
  if(['near','far'].includes(id))s.data.flags.asHousing=id==='far'?'far':'compact';if(wasShared&&!s.data.flags.asShareActive)result+='\n\n你们提前结束合住。纪岚回到培训住处，她的求职和未来出发仍按自己的安排继续。';
  if(id==='support'){s.data.flags.asHousing='compact';s.data.flags.asLivingSupport='regular';}
  if(id==='shared_meal')s.data.flags.asWeeklyMeal=false;
 }else result=optionAction(s,e,e.options.find((o    )=>o.id===id));
 s.pending={...s.pending ,stage:'result',choice:id,result};note(s,s.pending.id,id,result);return s;
}
function nextInternal(s     ,pack     ){if(s.pending?.stage==='choice')return s;if(s.pending?.source==='death'){systemAction(s,{kind:'ack'});s.pending=null;s.ended=true;return s;}
 if(s.pending?.source==='story'){const id=s.pending.id;s.done.push(id);if(id==='AS09E'&&s.data.flags.asBridgeActive)s.system.contract.pay=28;if(['AS23','AS30'].includes(id)){s.pending=null;s.ended=true;return s;}}
 s.pending=null;return prepare(s,pack);
}
export function choose(input     ,pack     ,id       ){const s=chooseInternal(structuredClone(input),pack,id);s.operations.push({kind:'choose',id});return s;}
export function next(input     ,pack     ){if(input.ended||input.pending?.stage==='choice')return structuredClone(input);const s=nextInternal(structuredClone(input),pack);s.operations.push({kind:'next'});return s;}
export function prose(s     ,pack     ){const e=current(s,pack);return e?[e.text,...(e.variants||[]).filter((v    )=>matches(s.data,v.when)).map((v    )=>v.text)].join('\n\n'):'';}
export const serialize=(s     )=>JSON.stringify(s,null,2);
function canonical(v    )       {return Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v);}
export function restore(raw       ,pack     )     {if(typeof raw!=='string'||raw.length>2*1024*1024)throw Error('存档结构无效或过大');let s     ;try{s=JSON.parse(raw);}catch{throw Error('存档JSON无效');}if(!s||s.schema!==S.VERSION.schema||s.content!==S.VERSION.content||s.build!==S.VERSION.build||s.origin!=='care_aftershift')throw Error('版本不兼容，请保留原档，不自动迁移');if(!s.system||!Array.isArray(s.operations)||s.operations.length>5000)throw Error('存档结构无效');let r=initial(pack,s.system.mode,s.system.profile,s.system.seed,s.system.conditions);for(const o of s.operations){if(o?.kind==='choose'&&typeof o.id==='string')r=choose(r,pack,o.id);else if(o?.kind==='next')r=next(r,pack);else throw Error('操作记录无效');}if(canonical(r)!==canonical(s))throw Error('存档与实际可重放人生不符');return r;}
export function summary(s     ){const d=s.data;return [S.summary(s.system),`实际洄岸经历：${d.flags.asCoastBoardTask==='supported_field'?'作业船与受支持现场':d.flags.asCoastBoardTask==='ship_remote'?'船内远身':d.flags.asCoastChoice==='remote'&&d.flags.asCoastRecord?'地球端远身':d.flags.asCoastRecord?'本地观察或短次参与':'未参加项目'}。`,d.flags.asLunarPhase==='returned'?'实际在岚脊生活后，已经返回另一间地球住屋。':d.flags.asLunarRemoteDone?'已完成地球端半年协作，没有月球居住履历。':`月球安排：${d.flags.asLunarPhase}。`,`纪岚：${d.people.jilan.location}；余青：${d.people.yuqing.alive?'仍按自己的安排生活':'已经去世'}。`,'实际记录：',...s.history.filter(h=>!h.event.startsWith('ledger:')&&!h.event.startsWith('support:')).map(h=>`${Math.floor(h.year)}年 · ${h.result}`)].join('\n\n');}
