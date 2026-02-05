const medicine = (function(){
  let currentMedicineId = null;

  function renderList(){
    const ul = document.getElementById('medicine-list'); if(!ul) return;
    ul.innerHTML = '';
    const meds = storage.getMedicines();
    if(meds.length === 0){
      ul.innerHTML = '<li>No medicines added yet. Use the form above to add one.</li>';
      return;
    }
    meds.forEach(m =>{
      const li = document.createElement('li');
      const statusEmoji = m.status === 'taken' ? '✅' : m.status === 'missed' ? '❌' : '⏳';
      li.innerHTML = `${statusEmoji} <strong>${m.name}</strong> — ${m.time} — <span>${m.status}</span> `;
      const btn = document.createElement('button'); 
      btn.textContent = 'Mark Taken'; 
      btn.style.marginLeft='8px';
      btn.addEventListener('click', ()=>{ storage.setMedicineStatus(m.id, 'taken'); renderList(); voice.speak(`${m.name} marked as taken.`); });
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }

  function checkDue(){
    const meds = storage.getMedicines();
    const now = new Date();
    meds.forEach(m=>{
      if(!m.time) return;
      const [hh,mm] = m.time.split(':').map(Number);
      const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh||0, mm||0);
      const diff = now - due;
      
      // if within 2 minutes before/after due, remind
      if(Math.abs(diff) < 2*60*1000 && m.status !== 'taken'){
        currentMedicineId = m.id;
        voice.speak(`It is time to take ${m.name}. Say "Taken" when you have taken it, or say "Skip" to skip.`);
        voice.listenOnce((transcript)=>{
          const t = (transcript || '').toLowerCase();
          if(t.includes('taken') || t.includes('done')){
            storage.setMedicineStatus(m.id, 'taken');
            voice.speak(`Thank you. ${m.name} marked as taken.`);
            renderList();
          }else if(t.includes('skip')){
            voice.speak('Okay, I will remind you again soon.');
          }else {
            voice.speak(`I did not understand. Please say Taken or Skip.`);
          }
        }, {timeout:10000});
      }
      
      // escalate: mark missed if more than 15 minutes passed
      if(diff > 15*60*1000 && m.status !== 'taken' && m.status !== 'missed'){
        storage.setMedicineStatus(m.id, 'missed');
        voice.speak(`Alert: ${m.name} appears to be missed. Caregiver will be notified.`);
        renderList();
      }
    });
  }

  function init(){ 
    renderList(); 
    setInterval(checkDue, 30*1000); 
  }
  
  window.addEventListener('load', init);
  return { renderList, checkDue };
})();
window.medicine = medicine;