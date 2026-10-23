// Independent late-life systems. No legacy state or storage is read or migrated.
export const VERSION={schema:5,content:'after-shift-2',build:'0.4.0-candidate.3'};
export const STORAGE_KEY='future-life.after-shift.0.4';
export const SCENARIOS={
 ordinary_78:{mode:'ordinary',deathYear:2178,endYear:2190,fieldFit:true,assistance:true,benefit:false,cash:8},
 ordinary_86:{mode:'ordinary',deathYear:2186,endYear:2190,fieldFit:false,assistance:true,benefit:true,cash:8},
 ordinary_boundary:{mode:'ordinary',deathYear:null,endYear:2190,fieldFit:true,assistance:true,benefit:true,cash:8},
 ordinary_low_cash:{mode:'ordinary',deathYear:null,endYear:2190,fieldFit:true,assistance:true,benefit:false,cash:0},
 ageless_boundary:{mode:'ageless',deathYear:null,endYear:2230,fieldFit:true,assistance:true,benefit:true,cash:8},
 ageless_interrupted:{mode:'ageless',deathYear:2217.5,endYear:2230,fieldFit:false,assistance:true,benefit:true,cash:8},
}         ;
export const CONDITIONS={open:{repair:true,benefit:true,coast:true,remote:true,exam:true,lunarFit:true,lunarPlace:true,lunarRemote:true},no_benefit:{repair:true,benefit:false,coast:true,remote:true,exam:true,lunarFit:true,lunarPlace:true,lunarRemote:true},no_service:{repair:false,benefit:false,coast:true,remote:true,exam:true,lunarFit:true,lunarPlace:true,lunarRemote:true},no_places:{repair:true,benefit:true,coast:false,remote:false,exam:true,lunarFit:true,lunarPlace:false,lunarRemote:false},training_failed:{repair:true,benefit:true,coast:true,remote:true,exam:false,lunarFit:true,lunarPlace:true,lunarRemote:true},lunar_fit_failed:{repair:true,benefit:true,coast:true,remote:true,exam:true,lunarFit:false,lunarPlace:true,lunarRemote:true}}         ;
                                               
                                      
                                           
const month=(y       )=>Math.round(y*12);
const year=(m       )=>m/12;
const cents=(n       )=>Math.round(n*100);
                                                                                                                                                                                                         
                                                                                                                  
                                                                                                                                                                                                                                                                                                                                                                                                   
                                                                                                      
                                                                                                     
                                                                                 
                                                                                 
                         
                                                                                                                                                                                                                                                                                                                                                                                                                                
export function initial(mode     ,profile        ,seed=2100,conditions           ='open')      {
 const p=SCENARIOS[profile];if(!CONDITIONS[conditions])throw Error('未知作者条件');if(!p||p.mode!==mode)throw Error('模式与作者情境不匹配');if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw Error('情境种子无效');
 return {...VERSION,seed,mode,profile,conditions,birth:2100,at:month(2168),end:month(p.endYear),death:p.deathYear===null?null:month(p.deathYear),alive:true,ended:false,
 cash:cents(p.cash),income:106,baseExpense:102,serviceExpense:0,mealExpense:0,reserve:0,debt:0,housing:'潮湾两间租屋',location:'地球·潮湾',role:'基础养老金加周转站短班',fieldFit:p.fieldFit,assistance:p.assistance,repairOffer:'none',repairReview:null,lunarOffer:'none',lunarReview:null,treatment:'none',treatmentEnd:null,departureAt:null,arrivalAt:null,returnAt:null,functionGain:false,
 support:{kind:'none',autoRenew:false,review:null},mealUntil:null,contract:{kind:'short',end:month(2170),status:'原短班至2170'},pending:null,history:[],effectIDs:[],operations:[]};
}
export const expense=(s      )=>s.baseExpense+s.serviceExpense+s.mealExpense;
export const canField=(s      )=>s.alive&&s.fieldFit&&s.assistance;
function log(s      ,id       ,text       ,cashDelta=0){if(s.effectIDs.includes(id))throw Error('重复系统效果');s.effectIDs.push(id);s.history.push({at:s.at,id,text,cashDelta});}
function travelTime(s      ,to       ){const delta=(to-s.at)*(s.income-expense(s));if(to<s.at||s.cash+delta<0)throw Error('未处理的预算缺口');s.cash+=delta;s.at=to;if(delta)log(s,`ledger:${s.at}:${s.history.length}`,`按原安排结算至${year(to)}，月入${s.income/100}，月支出${expense(s)/100}U。`,delta);}
function stopForBudget(s      ){s.pending={kind:'budget',id:`budget:${s.at}:${s.history.length}`,text:`下个月现有安排需要${expense(s)/100}U，收入${s.income/100}U，现金${s.cash/100}U。先决定怎样调整住处、支持或额外饭桌。`};}
function endLife(s      ){s.alive=false;s.income=0;s.baseExpense=0;s.serviceExpense=0;s.mealExpense=0;s.support.review=null;s.support.autoRenew=false;s.mealUntil=null;s.contract.status='因生命结束关闭，未履行部分不记作完成';s.contract.end=null;s.treatmentEnd=null;s.repairReview=null;s.lunarReview=null;s.departureAt=null;s.arrivalAt=null;s.returnAt=null;s.role='生前安排已停止';s.pending={kind:'death',id:`death:${s.at}`,text:`${year(s.at)}年，唐禾的生命结束。最后生活在${s.location}。后来的记忆由留下的人讲述，未完成的工作没有被补成履历。`};log(s,s.pending.id,s.pending.text);}
function supportReview(s      ){
 const affordable=s.cash+12*(s.income-expense(s))>=0;
 if(s.support.autoRenew&&affordable){s.support.review=s.at+12;log(s,`support:${s.at}`,'按此前明确授权的同条件年度安排续期；费用、窗口与补差不变。');return;}
 s.pending={kind:'support',id:`support-review:${s.at}`,text:'原年度支持到期。下一年是否继续，需要重新决定；不会自动产生欠款。'};
 // Last paid period is over; pending decision cannot advance time.
 s.support.review=null;s.serviceExpense=0;
}
function advance(s      ,to       ){if(s.pending||s.ended)return;if(to>s.end||to<s.at)throw Error('目标超出片段');
 while(s.at<to){
  let target=Math.min(to,s.death??Infinity,s.support.review??Infinity,s.mealUntil??Infinity,s.contract.end??Infinity,s.treatmentEnd??Infinity,s.departureAt??Infinity,s.arrivalAt??Infinity,s.returnAt??Infinity,s.repairReview??Infinity,s.lunarReview??Infinity);
  const deficit=expense(s)-s.income;
  if(deficit>0&&s.cash<(target-s.at)*deficit){const payable=Math.floor(s.cash/deficit);travelTime(s,s.at+payable);stopForBudget(s);return;}
  travelTime(s,target);
  // A life-ending boundary takes priority over same-month renewal or work.
  if(s.death===s.at){endLife(s);return;}
  if(s.at===s.end){s.ended=true;log(s,`boundary:${s.at}`,'到达这一作者情境的存活片段边界，不是死亡或完整一生。');return;}
  if(s.contract.end===s.at){
   if(s.contract.kind==='short'){const pay=s.contract.pay??28;const name=s.contract.status;s.income-=pay;s.contract={kind:'none',end:null,status:'原短班已自动到期'};s.role='基础养老金与日常生活';log(s,`job-end:${s.at}`,`${name}按期结束，${(pay/100).toFixed(2)}U工资停止，基础养老金保留。`);}
   else {s.income=78;s.role='月球岗位到期，等待返程安排';s.contract.end=null;s.contract.status=s.contract.extension?'月球启用期已到期，待安排返程':'月球六年已到期，待安排返程';s.pending={kind:'contract',id:`contract-end:${s.at}`,text:s.contract.extension?'两年启用期结束，工资停止，按已资助安排返地。':'六年岗位已结束，工资停止。按已资助安排返地；不能不续约继续领工资。'};log(s,s.pending.id,s.pending.text);return;}
  }
  if(s.repairReview===s.at){s.repairReview=null;s.repairOffer=CONDITIONS[s.conditions].repair?'offered':'unavailable';log(s,`repair-review:${s.at}`,s.repairOffer==='offered'?'当期评估适用，实际时段已给出；是否开始另行决定。':'当期评估没有给出适用的治疗安排，费用没有转作治疗费。');}
  if(s.lunarReview===s.at){s.lunarReview=null;s.lunarOffer=CONDITIONS[s.conditions].lunarFit&&CONDITIONS[s.conditions].lunarPlace?'offered':'unavailable';log(s,`lunar-review:${s.at}`,s.lunarOffer==='offered'?'当期培训适配通过，实际岗位与运力已给出；签约仍须另选。':'这期没有取得适配与席位均落实的赴月岗位，培训结束后仍留在地球。');}
  if(s.treatmentEnd===s.at){s.treatmentEnd=null;s.treatment='completed';s.functionGain=SCENARIOS[s.profile].benefit&&CONDITIONS[s.conditions].benefit;log(s,`treatment-end:${s.at}`,'已完成当期过程并取得功能复评；不改变模式、生命情境或岗位适配。');}
  if(s.departureAt===s.at){s.departureAt=null;s.location='地月交通中';s.housing='交通临时舱位；原潮湾租约已结束';s.role='赴月交通与入驻准备';s.baseExpense=78;s.serviceExpense=0;s.mealExpense=0;s.support={kind:'none',autoRenew:false,review:null};s.mealUntil=null;log(s,`departure:${s.at}`,'结束原地球租约并实际出发，尚未计月球岗位工资。');}
  if(s.arrivalAt===s.at){s.arrivalAt=null;s.location='月球·岚脊';s.housing='岚脊岗位配套住处';s.role='岚脊六年园艺协作';s.income=180;s.baseExpense=174;s.serviceExpense=0;s.mealExpense=0;s.support={kind:'none',autoRenew:false,review:null};s.mealUntil=null;s.contract.status='月球岗位履行中';s.contract.end=s.at+72;log(s,`lunar-arrival:${s.at}`,'交通与入驻完成，实际抵达；六年岗位从现在计薪。');}
  if(s.returnAt===s.at){s.returnAt=null;s.location='地球·潮湾新住处';s.housing='新落实长租小屋';s.role='基础养老金与返地日常';s.income=78;s.baseExpense=74;const released=s.reserve;s.cash+=released;s.reserve=0;s.contract={kind:'none',end:null,status:'已返地安顿；旧屋不恢复'};log(s,`earth-arrival:${s.at}`,'返程与安顿窗口结束，旧屋不恢复，释放未使用的本人返程储备。',released);}
  if(s.mealUntil===s.at){s.mealExpense=0;s.mealUntil=null;log(s,`meal-end:${s.at}`,'固定饭桌约定按期结束，追加支出停止。');}
  if(s.support.review===s.at){supportReview(s);if(s.pending)return;}
 }
 if(s.at===s.end){s.ended=true;log(s,`boundary:${s.at}`,'到达这一作者情境的存活片段边界，不是死亡或完整一生。');}
}
function setSupport(s      ,choice                                          ){
 if(choice==='paid_auto'&&s.cash+12*(s.income-(74+6+s.mealExpense))<0)throw Error('未来一年预算不足');
 s.baseExpense=74;s.housing='潮湾一室支持住屋';s.serviceExpense=choice==='paid_auto'?6:choice==='subsidized_auto'?4:0;
 s.support={kind:choice==='paid_auto'?'paid':choice==='subsidized_auto'?'subsidized':'none',autoRenew:choice!=='as_needed',review:choice==='as_needed'?null:s.at+12};
 log(s,`support-choice:${s.at}:${s.history.length}`,choice==='subsidized_auto'?'选择固定服务窗口；当地试点每月直接向服务方补差0.02U，不发现金，不补额外饭桌。授权同条件按年复核续期。':choice==='paid_auto'?'选择每月0.06U支持，授权预算可支付且条件不变时按年复核续期。':'改用按需公共支持，没有让亲友承担固定护理。');
}
function perform(s      ,op          ){
 if(op.kind==='ack'){if(s.pending?.kind!=='death')throw Error('没有可阅读后记');s.pending=null;s.ended=true;return;}
 if(!s.alive||s.ended)throw Error('生命已结束或片段已结束，不能继续本人操作');
 if(s.pending&&!(s.pending.kind==='budget'&&op.kind==='budget')&&!(s.pending.kind==='support'&&op.kind==='support')&&!(s.pending.kind==='contract'&&(op.kind==='lunar_return'||op.kind==='lunar_extend')))throw Error('先处理当前待决安排');
 switch(op.kind){
 case 'advance':if(!Number.isFinite(op.to)||month(op.to)/12!==op.to)throw Error('时间必须是完整月份');advance(s,month(op.to));break;
 case 'budget':{
  if(s.pending?.kind!=='budget')throw Error('没有预算待决卡');
  const previousExpense=expense(s);
  if(op.choice==='shared_meal'){if(!s.mealExpense)throw Error('没有额外饭桌');s.mealExpense=0;s.mealUntil=null;log(s,s.pending.id,'和纪岚改约公共饭桌、各自带饭。结束追加支出，不等于关系结束。');}
  else if(op.choice==='support'){setSupport(s,'subsidized_auto');log(s,s.pending.id,'选择已落实的支持补差；不能拿它支付其他消费。');}
  else {if(op.choice==='far'&&s.serviceExpense)throw Error('远处住房不能悄悄携带原支持服务；请先选择有支持的住房安排');s.baseExpense=op.choice==='near'?74:70;s.housing=op.choice==='near'?'潮湾同街一室屋':'潮湾远处小屋';log(s,s.pending.id,op.choice==='near'?'明确选择搬进同街小屋，搬运由既定服务承担；已选择的服务费用和固定窗口保持，预算分别列账。':'明确选择远处小屋，月基本支出0.70U，去实作点单程80分钟。');}
  if(expense(s)>=previousExpense)throw Error('该安排未减少当前预算缺口');
  s.pending=null;break;}
 case 'support':setSupport(s,op.choice);s.pending=null;break;
 case 'meal':if(s.mealUntil!==null||month(op.until)<=s.at)throw Error('饭桌约定无效');s.mealExpense=4;s.mealUntil=month(op.until);break;
 case 'retire':throw Error('原短班由合同日期自动到期，不能任意调用退休改变工资');
 case 'repair_apply':if(s.at!==month(2170.25)||s.cash<50||s.repairOffer!=='none')throw Error('不在本期评估窗口或无法支付');s.cash-=50;s.repairOffer='pending';s.repairReview=month(2170.5);break;
 case 'lunar_apply':if(s.mode!=='ageless'||s.at!==month(2215)||s.cash<60||s.lunarOffer!=='none')throw Error('不在月球培训窗口或无法支付');s.cash-=60;s.lunarOffer='pending';s.lunarReview=month(2215.5);break;
 case 'treatment':if(s.repairOffer!=='offered'||s.at!==month(2170.5)||s.cash<600||s.treatment!=='none')throw Error('必须在本期实际治疗窗口且有现金，不可重复开始');s.cash-=600;s.treatment='underway';s.treatmentEnd=month(2171);s.functionGain=false;break;
 case 'lunar_sign':if(s.lunarOffer!=='offered'||s.mode!=='ageless'||s.at!==month(2215.75)||s.cash<500||s.contract.kind!=='none')throw Error('尚不符合本情境签约条件');s.cash-=500;s.reserve=200;s.contract={kind:'lunar',end:null,status:'已签待出发'};s.departureAt=month(2216);s.arrivalAt=month(2216)+1;log(s,`reserve:${s.at}`,'行前费用3U；另将本人现金2U转为专用返程资产，无收益，不是赠款。',-500);break;
 case 'lunar_extend':if(s.contract.status!=='月球六年已到期，待安排返程')throw Error('没有可接受的两年新安排');s.contract={kind:'lunar',end:s.at+24,status:'月球岗位履行中',extension:true};s.income=163;s.baseExpense=154;s.housing='岚脊启用期小住处';s.role='两年启用期照看班';s.pending=null;break;
 case 'lunar_arrive':throw Error('抵达由交通与入驻时间推进，不能同刻调用');
 case 'lunar_return':if(s.location!=='月球·岚脊'||!['月球岗位履行中','月球六年已到期，待安排返程','月球启用期已到期，待安排返程'].includes(s.contract.status))throw Error('未在月球履行岗位');if(!op.early&&!['月球六年已到期，待安排返程','月球启用期已到期，待安排返程'].includes(s.contract.status))throw Error('六年尚未结束');if(op.early&&s.contract.status!=='月球岗位履行中')throw Error('原期已结束，不可误收提前返程费用');if(op.early){if(s.reserve!==200)throw Error('早返储备不完整');s.reserve=0;}s.location='返地交通与安顿中';s.housing='返程舱位与地球临时安顿住处';s.role='岗位已结束，返地安顿中';s.income=78;s.baseExpense=78;s.contract.end=null;s.returnAt=s.at+3;s.pending=null;s.contract.status=op.early?'已消费储备提前返程':'按约资助返程';break;
 case 'return_arrive':throw Error('返地由实际交通与安顿窗口推进，不能同刻调用');
 default:throw Error('未知操作');
 }
 if(s.cash<0||s.reserve<0||s.debt!==0)throw Error('新候选不能自动借贷');
}
export function act(input      ,op          )      {const s=structuredClone(input);perform(s,op);s.operations.push(structuredClone(op));return s;}
function canonical(v    )       {return Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v);}
export function serialize(s      ){return JSON.stringify(s,null,2);}
export function restore(raw       )      {
 if(typeof raw!=='string'||raw.length>1024*1024)throw Error('存档结构无效');let s      ;try{s=JSON.parse(raw);}catch{throw Error('存档JSON无效');}
 if(!s||s.schema!==VERSION.schema||s.content!==VERSION.content||s.build!==VERSION.build)throw Error('版本不兼容，保留原档，不自动迁移');
 if(!Array.isArray(s.operations)||s.operations.length>5000)throw Error('操作记录无效');let r=initial(s.mode,s.profile,s.seed,s.conditions);
 for(const op of s.operations){if(!op||typeof op!=='object')throw Error('操作记录无效');r=act(r,op);}
 if(canonical(r)!==canonical(s))throw Error('存档状态与可重放历史不符');return r;
}
export function summary(s      ){return `${year(s.at)}年，${Math.floor(year(s.at)-s.birth)}岁。${s.alive?'存活条件下的阶段记录':'生命结束后的旁观记录'}。${s.location}，${s.housing}。现金${(s.cash/100).toFixed(2)}U，专用返程资产${(s.reserve/100).toFixed(2)}U。${s.contract.status}。模式：${s.mode==='ordinary'?'普通自然生命周期作者情境':'显式不老作者情境，仍可能生命中断'}。`;}
