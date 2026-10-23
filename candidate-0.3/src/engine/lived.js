                                      
import {initialCreative} from './creative.js';
export function initialLived(seed       ,version                                            )      {
 const s=initialCreative(seed,version);s.origin='creative-slice';s.finance.cash=3.25;s.player.mode='18—23岁新情景候选';
 s.people.zheng={name:'郑箐',alive:true,active:true,location:'织城·新住处，等待你搬入',stance:'物流训练中，计划2120年搬到站区'};
 s.people.jianlan.stance='本地舞台兼职，已申请2120—2122外地巡演';
 s.people.zheguang.stance='本馆实时节拍节点';
 s.housing={address:'旧楼短租间',leaseEnd:2118.25,deposit:0,roommate:'尚未搬入郑箐的房间',recording:false,storage:false,commute:0};
 s.schedule={employer:'织城公共图书馆',kind:'临时代班',blocks:5,free:1,thursday:false,publicSlot:false,guaranteed:false,promise:'无',rehearsal:false,prepBlocks:0};
 s.experiences={works:0,firstRemote:false,training:false,recording:false,joint:false,festival:'未参加',keepsake:'无',returnMeeting:'未见',firstTitle:'无'};
 s.life={swapAllowed:(seed>>>0)%3!==1,slot:(seed>>>0)%2===0,entry:'未选',access:'未申请',currentHousingReferral:true,training:'无',application:'无',offer:false,decision:false,career:'未定',quarter:'未到',servicesImproved:false,prepared:false,prepRoom:false,prepWasFlexible:false};
 s.transition={from:2118,to:2118,months:0,cashDelta:0,role:String(s.player.role),address:String(s.housing.address),income:s.finance.income,expense:s.finance.expense};
 return s;
}
const date=(y        )=>{const n=Number(y);return n?`${Math.floor(n)}年${Math.round((n%1)*12)+1}月`:'无';};
export function livedSummary(s      )       {
 return [`${Math.floor(s.year)}年，23岁。候选在这一季结束，不自动接入旧版后半生。`,
 `你住在${s.housing .address}，${s.housing .roommate}。押金${s.housing .deposit}U；租约至${s.housing .leaseEnd}年。`,
 `现在从事${s.player.role}。每周必要班块${s.schedule .blocks}，可自由安排块${s.schedule .free}；${s.schedule .guaranteed?'基本收入受公共班组保障':'此岗位无固定班组收入保障'}。`,
 `2119年试点已经到来：公共基本服务费下降，固定班以3块保留原1.15U基本月收入。你的选择是${s.life .career}。`,
 `实际作品${s.experiences .works}件。${s.project.participated?'最近作品《'+s.project.workTitle+'》，'+s.project.contribution:'你没有作品署名，图书馆与社群经历仍真实发生'}。留在手边的是${s.experiences .keepsake}。`,
 `郑箐：${s.people.zheng.location}，${s.people.zheng.stance}。简澜：${s.people.jianlan.stance}。折光：${s.people.zheguang.stance}。`,
 `换班承诺：${s.schedule .promise}。试驻演申请：${s.life .application}。合同：${s.contract.status}，截止${date(s.contract.end)}。`,
 `现金${s.finance.cash.toFixed(2)}U，押金资产${s.finance.assets.toFixed(2)}U，债务${s.finance.debt.toFixed(2)}U；月入${s.finance.income.toFixed(2)}/支出${s.finance.expense.toFixed(2)}。`,
 '实际发生：',...s.history.map(h=>`${Math.floor(h.year)}年 · ${h.result}`)].join('\n\n');
}
