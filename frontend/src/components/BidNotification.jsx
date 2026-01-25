import { useEffect, useRef, useState } from 'react';

// Shared audio instance that gets initialized on user interaction
let sharedAudio = null;
let audioReady = false;

// Initialize audio on first user interaction
function initAudio() {
  if (!audioReady && typeof window !== 'undefined') {
    try {
      sharedAudio = new Audio('/notification_sound.wav');
      sharedAudio.preload = 'auto';
      sharedAudio.volume = 0.7;
      sharedAudio.loop = false;
      
      // Try to load and unlock audio context
      sharedAudio.load();
      
      // Unlock audio context by playing a silent sound
      const unlockAudio = async () => {
        try {
          await sharedAudio.play();
          sharedAudio.pause();
          sharedAudio.currentTime = 0;
          audioReady = true;
          console.log('Audio context unlocked');
        } catch (e) {
          // Audio might not play without user interaction, that's okay
          // It will be ready for next time
          audioReady = true;
        }
      };
      
      unlockAudio();
    } catch (err) {
      console.error('Error initializing audio:', err);
    }
  }
}

// Set up event listeners to initialize audio on user interaction
if (typeof window !== 'undefined') {
  const initOnInteraction = () => {
    initAudio();
  };
  
  // Try multiple events to catch user interaction
  ['click', 'touchstart', 'keydown', 'mousedown'].forEach(event => {
    document.addEventListener(event, initOnInteraction, { once: true, passive: true });
  });
}

function BidNotification({ teamName, increment, onClose }) {
  const audioRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef(null);
  const fadeTimerRef = useRef(null);

  const handleClose = () => {
    // Clear any pending timers
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
    }
    setIsClosing(true);
    // Call onClose after fade animation
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    // Play notification sound - create new instance each time to ensure it plays
    const playSound = async () => {
      try {
        // Create a new audio instance for each notification to ensure sound plays
        const audioToPlay = new Audio('/notification_sound.wav');
        audioToPlay.volume = 0.7;
        audioToPlay.loop = false;
        audioRef.current = audioToPlay;
        
        // Play the audio
        try {
          await audioToPlay.play();
          console.log('Notification sound played successfully');
        } catch (playError) {
          console.error('Error playing audio:', playError);
          // Try to unlock audio context
          initAudio();
          // Retry after a short delay
          setTimeout(async () => {
            try {
              const retryAudio = new Audio('/notification_sound.wav');
              retryAudio.volume = 0.7;
              await retryAudio.play();
            } catch (retryError) {
              console.error('Retry audio also failed:', retryError);
            }
          }, 100);
        }
      } catch (err) {
        console.error('Error in playSound:', err);
      }
    };
    
    playSound();

    // Start fade-out animation after 2.7 seconds
    fadeTimerRef.current = setTimeout(() => {
      setIsClosing(true);
    }, 2700);

    // Auto-close after 3 seconds
    closeTimerRef.current = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => {
      // Clear timers on unmount
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
      // Clean up audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []); // Empty dependency array - run once when component mounts

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className={`bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-2xl p-6 border-2 border-yellow-600 min-w-[350px] max-w-[500px] pointer-events-auto transition-all duration-300 ease-in-out relative ${
        isClosing ? 'opacity-0 scale-95 translate-y-[-20px]' : 'animate-slide-in opacity-100 scale-100 translate-y-0'
      }`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-blue-900 hover:text-blue-700 font-bold text-xl sm:text-2xl w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-yellow-300 transition-colors"
          aria-label="Close notification"
        >
          ×
        </button>
        
        <div className="flex items-center gap-4 pr-6">
          <div className="text-4xl animate-bounce">🔔</div>
          <div className="flex-1">
            <div className="text-blue-900 font-bold text-2xl mb-1">
              {teamName} BID!
            </div>
            <div className="text-blue-800 text-lg font-semibold">
              +₹{increment.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BidNotification;

