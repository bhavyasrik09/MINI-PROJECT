const dashboard = (function(){
  function render(){
    const state = storage.getState();
    const cards = document.getElementById('status-cards');
    const medList = document.getElementById('med-status-list');
    const sosList = document.getElementById('sos-list');
    
    const total = state.medicines.length;
    const taken = state.medicines.filter(m=> m.status==='taken').length;
    const missed = state.medicines.filter(m=> m.status==='missed').length;
    const upcomingApps = state.appointments.filter(a=> new Date(a.datetime) > new Date()).length;
    
    if(cards) cards.innerHTML = `
      <div class="status-card"><strong>Last Interaction</strong><div>${state.lastInteraction ? new Date(state.lastInteraction).toLocaleString() : '—'}</div></div>
      <div class="status-card"><strong>Medicines Today</strong><div>Total: ${total}</div><div>✅ Taken: ${taken}</div><div>❌ Missed: ${missed}</div></div>
      <div class="status-card"><strong>Appointments</strong><div>${upcomingApps} upcoming</div></div>
    `;
    
    if(medList){ 
      medList.innerHTML = ''; 
      state.medicines.forEach(m=>{ 
        const li = document.createElement('li'); 
        const status = m.status === 'taken' ? '✅' : m.status === 'missed' ? '❌' : '⏳';
        li.innerHTML = `${status} <strong>${m.name}</strong> — ${m.time} — <span>${m.status}</span>`; 
        medList.appendChild(li); 
      }); 
    }
    
    if(sosList){ 
      sosList.innerHTML = ''; 
      const sos = state.sos || [];
      if(sos.length === 0) sosList.innerHTML = '<li>No SOS events</li>';
      else sos.forEach(s=>{ 
        const li = document.createElement('li'); 
        li.textContent = `${s.time} ${s.lat ? `@ ${s.lat.toFixed(4)},${s.lon.toFixed(4)}`: s.error||''}`; 
        sosList.appendChild(li); 
      }); 
    }
  }
  return { render };
})();
window.dashboard = dashboard;