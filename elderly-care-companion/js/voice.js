const voice = (function(){
  let isListening = false;
  let currentRec = null;

  function speak(text){
    if(!text) return;
    
    // Cancel any ongoing speech first
    speechSynthesis.cancel();
    
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = 'en-US';
    ut.rate = 0.9;
    ut.pitch = 1.0;
    ut.volume = 1.0;
    
    ut.onstart = ()=> console.log('[Voice] Speaking:', text);
    ut.onend = ()=> console.log('[Voice] Speech ended');
    ut.onerror = (e)=> console.error('[Voice] Speech error:', e);
    
    speechSynthesis.speak(ut);
  }

  function listenOnce(onResult, opts={timeout:8000}){
    if(isListening) return console.warn('[Voice] Already listening, ignoring new request');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition){
      console.error('[Voice] SpeechRecognition API not available in this browser');
      speak('Sorry, voice recognition is not available in your browser.');
      setTimeout(()=> onResult(''), 500);
      return;
    }
    
    isListening = true;
    const rec = new SpeechRecognition();
    currentRec = rec;
    
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    
    let done = false;
    let resultText = '';
    
    rec.onstart = ()=> {
      console.log('[Voice] Recognition started');
      updateVoiceDisplay('🎤 Listening...');
    };
    
    rec.onresult = (e)=> {
      if(!done){
        done = true;
        // Get best match
        const transcript = e.results[e.results.length - 1][0].transcript;
        const confidence = e.results[e.results.length - 1][0].confidence;
        resultText = transcript;
        console.log('[Voice] Heard:', transcript, '(Confidence:', Math.round(confidence * 100) + '%)');
        updateVoiceDisplay(`You said: "${transcript}"`);
      }
    };
    
    rec.onerror = (e)=> {
      console.error('[Voice] Error:', e.error);
      if(!done){
        done = true;
        const errorMsg = {
          'network': 'Network error. Please check your connection.',
          'no-speech': 'No speech detected. Please try again.',
          'not-allowed': 'Microphone access denied. Please enable in browser settings.',
          'permission-denied': 'Permission denied. Please allow microphone access.'
        }[e.error] || `Error: ${e.error}`;
        updateVoiceDisplay(`❌ ${errorMsg}`);
        speak(errorMsg);
      }
    };
    
    rec.onend = ()=> {
      isListening = false;
      console.log('[Voice] Recognition ended');
      if(!done){
        done = true;
        updateVoiceDisplay('No response detected.');
      }
      // Delay callback to ensure UI update
      setTimeout(()=> {
        currentRec = null;
        onResult(resultText);
      }, 200);
    };
    
    try{
      rec.start();
      console.log('[Voice] Started listening, timeout:', opts.timeout + 'ms');
    } catch(e){
      console.error('[Voice] Failed to start recognition:', e);
      isListening = false;
      currentRec = null;
      speak('Could not start voice recognition.');
      onResult('');
      return;
    }
    
    // Enforce timeout
    setTimeout(()=> {
      if(!done){
        done = true;
        console.log('[Voice] Timeout reached, stopping recognition');
        try{ rec.stop(); }catch(e){ console.log('[Voice] Stop error (expected):', e.message); }
      }
    }, opts.timeout);
  }

  function updateVoiceDisplay(msg){
    const el = document.getElementById('voice-result');
    if(el) el.textContent = msg;
  }

  return { speak, listenOnce };
})();
window.voice = voice;