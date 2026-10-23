                                      
export function initialCreative(seed       ,version                                            )       {
 return {...version,origin:'creative',seed:seed>>>0,rng:seed>>>0,birth:2100,year:2118,
 player:{name:'沈弦',location:'地球·织城',role:'图书馆兼职',qualification:0,knowledge:1,alive:true,mode:'存活条件下的创作切片',mobility:'未指定疾病或障碍'},
 world:{aiTutor:true,robotLab:false,localFab:false,habitat:false,automation:false,remoteStage:true,aiContractIdentity:false,distributedStage:false,longevityDebate:false},
 people:{jianlan:{name:'简澜',alive:true,active:true,location:'地球·织城',stance:'只对明确版本和场次作决定，不授权形象衍生复制'},zheguang:{name:'折光',alive:true,active:true,location:'织城服务节点',stance:'允许现场变化，不授权无限固定模板'}},
 project:{name:'回声剧场',workTitle:'无',stage:'尚未创作',participated:false,sponsor:'无',design:'未定',result:'未上演',contribution:'无'},
 finance:{cash:8,income:1.15,expense:1,assets:0,debt:0},
 contract:{status:'无',start:0,end:0,obligation:0},
 rights:{ai:'未授权',human:'未授权',platform:'无',version:'无',image:'未授权形象衍生复制',archiveConsent:'无',archive:'未安排'},
 flags:{remoteSlot:(seed>>>0)%2===0,access:'未选择',practice:'未开始',platformApplication:'无',platformOffer:false,career:'普通工作',proposal:'无',cooperation:'未建立',distribution:'无',future:'未选择',completedContract:false,archiveSeen:false},
 pending:null,queue:[],done:[],effectIDs:[],history:[],operations:[],ended:false};
}
export function creativeSummary(s      )       {
 return [
 `${Math.floor(s.year)} 年，${Math.floor(s.year-s.birth)} 岁。这是以本人存活为前提的叙事切片，不是寿命预测或完整一生。`,
 `你仍在${s.player.location}，现在的工作是${s.player.role}。没有发生工程派驻或太空迁居。`,
 s.project.participated?`你实际留下的最近作品《${s.project.workTitle}》，阶段：${s.project.stage}；参与内容：${s.project.contribution}；结果：${s.project.result}。`:'你没有制作并授权共同作品；你的观众和普通工作经历同样保留，不会被改写成创作事业。',
 `平台许可：${s.rights.platform}。当前作品版本：${s.rights.version}。形象权：${s.rights.image}。`,
 `简澜：${s.people.jianlan.stance}。折光：${s.people.zheguang.active?'仍有可用服务时段':'互动服务已停止，只保留获准保存的记录；不会生成它的新答复'}。`,
 `档案安排：${s.rights.archive}。未来意向：${s.flags.future}。没有因咨询新闻自动接受延寿。`,
 `现金 ${s.finance.cash.toFixed(2)}，月收入 ${s.finance.income.toFixed(2)}，月支出 ${s.finance.expense.toFixed(2)}，债务 ${s.finance.debt.toFixed(2)}。均为地球月基本生活费情境单位。`,
 '实际记录：',...s.history.map(h=>`${Math.floor(h.year)} · ${h.result}`)
 ].join('\n\n');
}
