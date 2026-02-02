const medicine = (function(){
  function renderList(){
    const ul = document.getElementById('medicine-list'); if(!ul) return;
    ul.innerHTML = '';
    const meds = storage.getMedicines();
    meds.forEach(m =>{
      const li = document.createElement('li');
      li.innerHTML = `${m.name} — ${m.time} — <strong>${m.status}</strong> `;
      const btn = document.createElement('button'); btn.textContent = 'Mark Taken'; btn.style.marginLeft='8px';
      btn.addEventListener('click', ()=>{ storage.setMedicineStatus(m.id, 'taken'); renderList(); });
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }
  function checkDue(){
    const meds = storage.getMedicines();
    const now = new Date();
    meds.forEach(m=>{
      const [hh,mm] = (m.time||'00:00').split(':').map(Number);
      const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh||0, mm||0);
      const diff = now - due;
      // if within 2 minutes before/after due, remind
      if(Math.abs(diff) < 2*60*1000 && m.status !== 'taken'){
        voice.speak(`Reminder: it's time to take ${m.name}. Please say Taken if you have taken it.`);
        voice.listenOnce((transcript)=>{
          if(transcript && transcript.toLowerCase().includes('taken')){
            storage.setMedicineStatus(m.id, 'taken');
            voice.speak('Thank you. Marked as taken.');
            renderList();
          }else{
            voice.speak('Okay, I will remind you again soon.');
          }
        }, {timeout:8000});
      }
      // escalate: mark missed if more than 15 minutes passed
      if(diff > 15*60*1000 && m.status !== 'taken' && m.status !== 'missed'){
        storage.setMedicineStatus(m.id, 'missed');
        voice.speak(`Alert: ${m.name} appears to be missed. Caregiver will be notified.`);
        renderList();
      }
    });
  }
  function init(){ renderList(); setInterval(checkDue, 30*1000); }
  window.addEventListener('load', init);
  return { renderList, checkDue };
})();
window.medicine = medicine;