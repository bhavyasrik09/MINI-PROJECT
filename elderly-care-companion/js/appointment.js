const appointment = (function(){
  function renderList(){
    const ul = document.getElementById('appointment-list'); if(!ul) return;
    ul.innerHTML = '';
    const apps = storage.getAppointments();
    apps.forEach(a=>{
      const li = document.createElement('li');
      const phonePart = a.phone? ` — <a href="tel:${a.phone}">📞 Call</a>`: '';
      li.innerHTML = `<strong>${a.title}</strong> — ${a.datetime}${phonePart}`;
      ul.appendChild(li);
    });
  }
  function checkDue(){
    const apps = storage.getAppointments();
    const now = new Date();
    apps.forEach(a=>{
      try{
        const appTime = new Date(a.datetime);
        const diff = now - appTime;
        // if within 2 minutes before/after appointment, remind
        if(Math.abs(diff) < 2*60*1000 && !a.reminded){
          voice.speak(`You have an appointment: ${a.title}. It is at ${appTime.toLocaleTimeString()}.`);
          if(a.phone) voice.speak(`You can call the hospital at ${a.phone}`);
          // mark as reminded
          const s = storage.getState();
          const updated = s.appointments.map(x=> x.id===a.id? {...x, reminded:true}:x);
          s.appointments = updated;
          localStorage.setItem('ecc_state_v1', JSON.stringify(s));
        }
      }catch(e){}
    });
  }
  function init(){ renderList(); setInterval(checkDue, 30*1000); }
  window.addEventListener('load', init);
  return { renderList, checkDue };
})();
window.appointment = appointment;
