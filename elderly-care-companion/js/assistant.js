const assistant = (function(){
  
  // Smart command parser
  function parseUserQuery(text){
    const t = (text || '').toLowerCase().trim();
    
    // MEDICINE ADDITION: "add medicine X at time Y" or "take medicine X at Y"
    const medAddMatch = t.match(/add\s+medicine\s+(.+?)\s+at\s+(\d{1,2})[:\s]*(\d{2})|(add|take)\s+(.+?)\s+at\s+(\d{1,2})[:\s]*(\d{2})/i);
    if(medAddMatch){
      const name = medAddMatch[1] || medAddMatch[5];
      const hour = medAddMatch[2] || medAddMatch[6];
      const min = medAddMatch[3] || medAddMatch[7];
      return { type: 'addMedicine', name, time: `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}` };
    }

    // APPOINTMENT ADDITION: "add appointment X at Y" or "schedule appointment X at date time"
    const appAddMatch = t.match(/add\s+appointment\s+(.+?)\s+(?:at|on)\s+(.+?)(?:\s+phone\s+(.+))?$/i);
    if(appAddMatch){
      const title = appAddMatch[1];
      const datetime = appAddMatch[2];
      const phone = appAddMatch[3] || '';
      return { type: 'addAppointment', title, datetime, phone };
    }

    // HELP / NAVIGATION: "help", "how do i", "what can i do", "guide", "instructions"
    if(t.includes('help') || t.includes('how do') || t.includes('what can') || t.includes('guide') || t.includes('instruction')){
      return { type: 'help' };
    }

    // MEDICINE QUERY: "what's my next medicine", "which medicine", "my medicines"
    if(t.includes('next medicine') || t.includes('which medicine') || t.includes('my medicines') || t.includes('what medicine')){
      return { type: 'nextMedicine' };
    }

    // SCHEDULE / APPOINTMENTS: "schedule", "appointment", "today", "what's my schedule"
    if(t.includes('schedule') || t.includes('appointment') || t.includes('what do i have') || t.includes('upcoming')){
      return { type: 'schedule' };
    }

    // CALL / CONTACT: "call", "contact", "notify", "contact caregiver"
    if(t.includes('call') || t.includes('contact') || t.includes('notify') || t.includes('reach')){
      return { type: 'contact' };
    }

    // EMERGENCY: "help", "emergency", "sos", "danger"
    if(t.includes('emergency') || t.includes('danger') || t.includes('sos')){
      return { type: 'emergency' };
    }

    // LIST ALL: "list", "show all", "tell me everything"
    if(t.includes('list') || t.includes('show all') || t.includes('everything')){
      return { type: 'listAll' };
    }

    // DEFAULT: Generic response
    return { type: 'generic', query: t };
  }

  function handleAddMedicine(name, time){
    try{
      if(name && time){
        storage.addMedicine({ name, time });
        medicine.renderList();
        voice.speak(`Added ${name} at ${time}. I will remind you at that time.`);
        return true;
      }
    }catch(e){
      voice.speak(`Sorry, I could not add ${name}. Please try again.`);
    }
    return false;
  }

  function handleAddAppointment(title, datetime, phone){
    try{
      if(title && datetime){
        storage.addAppointment({ title, datetime, phone });
        appointment.renderList();
        const msg = phone ? `Added appointment ${title} at ${datetime}. You can call ${phone}.` : `Added appointment ${title} at ${datetime}.`;
        voice.speak(msg);
        return true;
      }
    }catch(e){
      voice.speak(`Sorry, I could not add the appointment. Please try again.`);
    }
    return false;
  }

  function handleNextMedicine(){
    const meds = storage.getMedicines();
    const next = meds.find(m=> m.status !== 'taken') || meds[0];
    if(next){
      voice.speak(`Your next medicine is ${next.name} at ${next.time}.`);
    } else {
      voice.speak('You have no pending medicines.');
    }
  }

  function handleSchedule(){
    const apps = storage.getAppointments();
    if(apps.length === 0){
      voice.speak('You have no appointments scheduled.');
      return;
    }
    const upcomingApps = apps.filter(a=> new Date(a.datetime) > new Date());
    if(upcomingApps.length === 0){
      voice.speak('You have no upcoming appointments.');
      return;
    }
    const appDetails = upcomingApps.map(a=> `${a.title} at ${a.datetime}`).join(', ');
    voice.speak(`Your upcoming appointments are: ${appDetails}`);
  }

  function handleListAll(){
    const state = storage.getState();
    const medCount = state.medicines.length;
    const appCount = state.appointments.length;
    voice.speak(`You have ${medCount} medicines and ${appCount} appointments. You can say "next medicine" or "my schedule" for details.`);
  }

  function handleHelp(){
    const msg = `I can help you with medicines and appointments. You can say: 
    "Add medicine Aspirin at 9 AM",
    "Add appointment Doctor Smith at February 15 10 AM",
    "What's my next medicine",
    "What's my schedule",
    "Call my caregiver",
    "Help",
    or any question about the app. Just speak naturally and I will help.`;
    voice.speak(msg);
  }

  function handleContact(){
    voice.speak('I can notify your caregiver. For emergencies, please press the SOS button or say Emergency.');
  }

  function handleEmergency(){
    voice.speak('Emergency detected. Sending SOS alert.');
    sos.triggerManualSOS();
  }

  function handleGenericQuery(query){
    // Try to answer based on context
    if(query.includes('medicine') || query.includes('drug') || query.includes('pill')){
      voice.speak('You can add medicines by saying "Add medicine [name] at [time]", or ask "What is my next medicine?"');
    }
    else if(query.includes('appointment') || query.includes('doctor') || query.includes('hospital')){
      voice.speak('You can add appointments by saying "Add appointment [doctor name] at [date and time]", or ask "What is my schedule?"');
    }
    else if(query.includes('voice') || query.includes('speak') || query.includes('command')){
      voice.speak('I understand natural language. Just speak to me like you are talking to a person. You can ask about medicines, appointments, get navigation help, or give me commands.');
    }
    else if(query.includes('how') || query.includes('what') || query.includes('where')){
      voice.speak('I am here to help. You can ask me about your medicines, appointments, or how to use this app. What do you need?');
    }
    else {
      voice.speak(`I understand you said: ${query}. If you need help with medicines or appointments, just ask me. Or say "Help" to hear what I can do.`);
    }
  }

  function parseAndRespond(text){
    if(!text || text.trim() === ''){
      voice.speak('I did not hear anything. Please try again.');
      return;
    }
    
    console.log('[Assistant] Processing:', text);
    const cmd = parseUserQuery(text);

    switch(cmd.type){
      case 'addMedicine':
        handleAddMedicine(cmd.name, cmd.time);
        break;
      case 'addAppointment':
        handleAddAppointment(cmd.title, cmd.datetime, cmd.phone);
        break;
      case 'nextMedicine':
        handleNextMedicine();
        break;
      case 'schedule':
        handleSchedule();
        break;
      case 'contact':
        handleContact();
        break;
      case 'emergency':
        handleEmergency();
        break;
      case 'listAll':
        handleListAll();
        break;
      case 'help':
        handleHelp();
        break;
      case 'generic':
        handleGenericQuery(cmd.query);
        break;
      default:
        voice.speak('I did not understand. Please try again.');
    }
  }

  function listenForCommand(){
    voice.speak('Listening. Tell me what you need.');
    setTimeout(()=> {
      voice.listenOnce((t)=> {
        console.log('[Assistant] Received input:', t);
        parseAndRespond(t);
      }, {timeout:10000});
    }, 500);
  }

  function speakUsage(){
    const lines = [
      'I can listen to natural language commands. Just speak to me naturally.',
      'You can say: Add medicine Aspirin at 9 AM, Add appointment with Dr. Smith at February 15, What is my next medicine, What is my schedule.',
      'You can also ask questions like: How do I use this app, What can I do, or Emergency.'
    ];
    voice.speak(lines.join(' '));
  }

  return { listenForCommand, speakUsage, parseAndRespond };
})();
window.assistant = assistant;