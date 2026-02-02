const voice = (function(){
  function speak(text){
    if(!text) return;
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = 'en-US';
    speechSynthesis.cancel();
    speechSynthesis.speak(ut);
  }
  function listenOnce(onResult, opts={timeout:7000}){
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition){
      console.warn('SpeechRecognition not available');
      setTimeout(()=> onResult(''), 500);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    let done = false;
    rec.onresult = (e)=>{ done=true; const t = e.results[0][0].transcript; onResult(t); rec.stop(); };
    rec.onerror = ()=>{ if(!done){ done=true; onResult(''); } };
    rec.onend = ()=>{ if(!done) onResult(''); };
    rec.start();
    setTimeout(()=>{ if(!done){ done=true; try{rec.stop()}catch(e){} onResult(''); } }, opts.timeout);
  }
  return { speak, listenOnce };
})();
window.voice = voice;