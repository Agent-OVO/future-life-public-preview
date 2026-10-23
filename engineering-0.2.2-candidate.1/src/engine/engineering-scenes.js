// Authored scenario facts, not engineering measurements or real transport prices.
export const SCENE_VERSION = 'lighthouse-scenes-1';
export const COMPLETE_PACKAGE = Object.freeze({
  allotment:3, lightMass:2,
  coverage:Object.freeze(['设备','保护件','约定周期备件']),
  plantBayShellAndLightingReady:true
});
export function freightFor(s,pack=COMPLETE_PACKAGE){
  if(s.project.result!=='限定用途通过'||s.project.design!=='轻量')return 0;
  if(!['设备','保护件','约定周期备件'].every(x=>pack.coverage.includes(x)))return 0;
  return pack.allotment===3&&pack.lightMass===2?1:0;
}
export const sceneInitial = () => ({
  testPurpose:'未选择', groundUseChecked:false, groundCheckYear:0,
  useAccess:'无', useGrantId:'无', useScope:'无',
  freightRemaining:0, freightDisposition:'无份额', plantBayReady:false,
  application:'无新操作', applicationStatus:'未开始', trialLayout:'未选择',
  rackGroups:0, switchMode:'无', trialTasks:'无'
});

// A separately authored, one-session grant. An old sponsor label alone never
// authorizes a new action. This record also gives the unsponsored path access.
export const USE_OFFER = Object.freeze({
  id:'lighthouse-2138-single-session', year:2138,
  grantedBy:'栖灯工坊与原资料持有方',
  materials:'本轮目标所需的限定图纸、检验记录与当地同型台',
  resources:'工坊已安排的一轮机时、试验件及操作支持',
  excludes:'长期雇用、公开传播企业图纸、居民生产水路、清单外部件'
});

export function enterUse(s, offer=USE_OFFER) {
  const p=s.project;
  if(!p.participated)return;
  // A new, dated world fact: conversion is checked independently, not licensed
  // by the failed lunar batch. No cash, role or historical result is rewritten.
  const ground=p.result==='主动转向'||p.result==='失败后转向'||s.flags.application==='退出';
  if(ground){p.groundUseChecked=true;p.groundCheckYear=2137;}
  const passed=p.result==='限定用途通过';
  if(passed&&p.design==='轻量'&&!ground){
    p.freightRemaining=freightFor(s);p.freightDisposition='待调配';p.plantBayReady=COMPLETE_PACKAGE.plantBayShellAndLightingReady;
  }
  if(offer&&offer.id===USE_OFFER.id&&offer.year===s.year&&(ground||passed)){
    p.useAccess='本次限定试验';p.useGrantId=offer.id;
    p.useScope=ground?'地面改制':'月面整包';
  }
}

export function sceneRecap(s) {
  const p=s.project;if(!p.participated)return '';
  const lines=[`当年的目标是${p.design}；${p.testPurpose==='月面整包验证'?'你完成了月面整包补测':p.testPurpose==='地面改制'?'你选择改做地面用途':'当时尚未选择验证用途'}，记录仍为“${p.result}”。`];
  if(p.groundUseChecked)lines.push(`${p.groundCheckYear} 年，改制部件另行完成地面用途检查；这份记录没有改写原月面结论。`);
  const reports={
    '试种循环支路':p.trialLayout==='未选择'?'循环组件已占用唯一余量，布局仍待你决定。':`本轮试种台采用${p.trialLayout}：${p.rackGroups}组架位，${p.switchMode}；可做${p.trialTasks}。布局与切换已经检查，收获尚未发生。`,
    '追加同型备件':'唯一运输余量用于同型备件和更换演练，试种组件没有随这批到位。',
    '自主运行实验':'外沿隔离工作舱开始比较连续与集中用水。壳层的维护间隔让这里不必配常驻维修台；泵、控制与隔离由各自系统承担。',
    '下一代维护样件':'你用服役件重做维护布局，产物是待后续验证的新样件，没有继承旧认证。',
    '可换布局水路台':'本轮机时用于侧面与上方抽换接口的实物比较，没有同时增加通用备件。',
    '本地替换件':'本轮机时用于清单内壳板、支架和连接件；新布局推迟，精密功能件仍外购。',
    '地面模块比较':'你参与本轮地面隔离支路的模块比较，居民主供水保持独立；没有因此取得月面运力。',
    '地面稳定交接':'你将已检查的改制系统交接为稳定服务，本轮没有继续新研究。',
    '本次不参与':'你没有接受 2138 年的新操作；旧贡献仍在，后续由团队安排。'
  };
  if(reports[p.application])lines.push(reports[p.application]);
  return lines.join('\n\n');
}
