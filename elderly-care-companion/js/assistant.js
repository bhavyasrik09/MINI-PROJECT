const assistant = (function(){
  function parseAndRespond(text){
    const t = (text||'').toLowerCase();
    if(t.includes('help') || t.includes('what can i') || t.includes('what can i say')){
      speakUsage();
      return;
    }
    if(t.includes('next medicine')){
      const meds = storage.getMedicines();
      const next = meds.find(m=> m.status !== 'taken') || meds[0];
      if(next) voice.speak(`Next medicine is ${next.name} at ${next.time}`);
      else voice.speak('No medicines found.');
    }else if(t.includes('today') || t.includes('schedule')){
      const apps = storage.getAppointments();
      if(apps.length) voice.speak(`You have ${apps.length} appointments. Check the screen for details.`);
      else voice.speak('No appointments scheduled for today.');
    }else if(t.includes('call')){
      voice.speak('I can notify your caregiver. Please call directly if urgent.');
    }else{
      voice.speak('Sorry, I did not understand that. Try: Next medicine, Today schedule, Call my son, or say Help to hear tips.');
    }
  }
  function speakUsage(){
    const lines = [
      'You can use these voice commands: Next medicine, Today schedule, Call my son, or Say Help.',
      'When a medicine reminder plays, say Taken to mark it as taken.',
      'Press the SOS button to send your location to the caregiver dashboard.'
    ];
    voice.speak(lines.join(' '));
  }
  function listenForCommand(){
    voice.speak('Listening for command.');
    voice.listenOnce((t)=> parseAndRespond(t), {timeout:7000});
  }
  return { listenForCommand, speakUsage };
})();
window.assistant = assistant;