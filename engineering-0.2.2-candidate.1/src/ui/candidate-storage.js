export const STORAGE_KEY='future-life.engineering-scenes.0.2.2-candidate.1';
export const ARCHIVE_PREFIX=STORAGE_KEY+'.archive.';
export function createStore(storage,locks,uuid=()=>crypto.randomUUID()) {
 return {
  read:()=>storage.getItem(STORAGE_KEY),
  archives:()=>Array.from({length:storage.length},(_,i)=>storage.key(i)).filter(k=>k?.startsWith(ARCHIVE_PREFIX)).map(key=>({key,raw:storage.getItem(key)})),
  async commit(expected,raw,{archive=false}={}){
   if(!locks?.request)throw Error('当前浏览器缺少本机记录锁，尚未写入。请使用支持的本机浏览器。');
   return locks.request(STORAGE_KEY,async()=>{
    if(storage.getItem(STORAGE_KEY)!==expected)throw Error('这段记录已被另一页面改变，请刷新后继续。');
    if(archive&&expected!==null){
     const key=ARCHIVE_PREFIX+uuid();
     if(storage.getItem(key)!==null)throw Error('归档名称冲突，当前记录未替换。');
     storage.setItem(key,expected);
     if(storage.getItem(key)!==expected)throw Error('原记录保留未核实，当前记录未替换。');
    }
    storage.setItem(STORAGE_KEY,raw);
    if(storage.getItem(STORAGE_KEY)!==raw)throw Error('写入后的记录未核实，请导出待存内容并刷新核对。');
    return raw;
   });
  }
 };
}
