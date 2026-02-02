const STORAGE_KEY = 'ecc_state_v1';
const storage = (function(){
  function defaultState(){
    return {
      medicines: [
        {id: 'm1', name: 'Aspirin', time: '09:00', status: 'pending'},
        {id: 'm2', name: 'Vitamin D', time: '20:00', status: 'pending'}
      ],
      appointments: [
        {id:'a1',title:'Dr. Smith', datetime: '', phone: ''}
      ],
      sos: [],
      lastInteraction: null
    };
  }
  function load(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw){ const s = defaultState(); save(s); return s; }
    try{ return JSON.parse(raw); }catch(e){ const s = defaultState(); save(s); return s; }
  }
  function save(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function getMedicines(){ return load().medicines; }
  function addMedicine({name, time}){
    const s = load();
    const id = 'm' + Date.now();
    s.medicines.push({ id, name, time, status: 'pending' });
    s.lastInteraction = new Date().toISOString(); save(s); return id;
  }
  function setMedicineStatus(id, status){ const s = load(); s.medicines = s.medicines.map(m=> m.id===id? {...m, status}:m); s.lastInteraction = new Date().toISOString(); save(s); }
  function updateMedicine(id, patch){ const s = load(); s.medicines = s.medicines.map(m=> m.id===id? {...m,...patch}:m); s.lastInteraction = new Date().toISOString(); save(s); }
  function addAppointment({title, datetime, phone}){ const s = load(); const id = 'a'+Date.now(); s.appointments.push({ id, title, datetime, phone }); s.lastInteraction = new Date().toISOString(); save(s); return id; }
  function getAppointments(){ return load().appointments; }
  function markMissedOlderThan(minutes){ const s = load(); const now = new Date(); s.medicines = s.medicines.map(m=>{
      try{ const [hh,mm] = m.time.split(':').map(Number); const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
        if(m.status !== 'taken' && (now - due) > minutes*60*1000){ return {...m, status:'missed'} }
      }catch(e){}
      return m;
    }); s.lastInteraction = new Date().toISOString(); save(s); }
  function pushSOS(entry){ const s = load(); s.sos.unshift(entry); s.lastInteraction = new Date().toISOString(); save(s); }
  function getSOS(){ return load().sos; }
  function getState(){ return load(); }
  function reset(){ const s = defaultState(); save(s); }
  return { getMedicines, updateMedicine, getAppointments, pushSOS, getSOS, getState, reset };
})();
window.storage = storage;