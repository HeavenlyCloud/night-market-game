const KEY = "gg_save_v1";

export function loadSave(){
  try{
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  }catch{
    return null;
  }
}

export function saveNow(state){
  try{
    localStorage.setItem(KEY, JSON.stringify(state));
  }catch{}
}

export function wipeSave(){
  localStorage.removeItem(KEY);
}
