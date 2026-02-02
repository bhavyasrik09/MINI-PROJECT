const sos = (function(){
  function triggerManualSOS(){
    voice.speak('SOS triggered. Attempting to get your location.');
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos=>{
        const entry = { time: new Date().toISOString(), lat: pos.coords.latitude, lon: pos.coords.longitude };
        storage.pushSOS(entry);
        voice.speak('Location captured and alert sent.');
        document.getElementById('alert-audio')?.play();
      }, err=>{
        const entry = { time: new Date().toISOString(), error: err.message };
        storage.pushSOS(entry);
        voice.speak('Could not get location, but alert was logged.');
      });
    }else{
      const entry = { time: new Date().toISOString(), error: 'geolocation-unavailable' };
      storage.pushSOS(entry);
      voice.speak('Geolocation not available in this browser.');
    }
  }
  function initPassiveListen(){
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition) return;
    const rec = new SpeechRecognition(); rec.lang='en-US'; rec.interimResults=false; rec.continuous=true;
    rec.onresult = (e)=>{
      const t = e.results[e.results.length-1][0].transcript.toLowerCase();
      if(t.includes('help') || t.includes('emergency')){
        triggerManualSOS();
      }
    };
    try{ rec.start(); }catch(e){}
  }
  window.addEventListener('load', ()=> setTimeout(initPassiveListen, 2000));
  return { triggerManualSOS };
})();
window.sos = sos;