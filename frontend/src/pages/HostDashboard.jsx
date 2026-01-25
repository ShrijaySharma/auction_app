import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { logout } from '../services/auth';
import * as hostService from '../services/host';
import BidNotification from '../components/BidNotification';
import { getImageUrl } from '../utils/imageUtils';

// Auto-detect API URL based on current host
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const host = window.location.hostname;
  return `http://${host}:4000`;
};

const API_URL = getApiUrl();

function HostDashboard({ user }) {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [highestBid, setHighestBid] = useState(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [biddingLocked, setBiddingLocked] = useState(false);
  const [status, setStatus] = useState('STOPPED');
  const [bidIncrements, setBidIncrements] = useState({ increment1: 500, increment2: 1000, increment3: 5000 });
  const [bidFlash, setBidFlash] = useState(false);
  const [stats, setStats] = useState({ sold: 0, unsold: 0, available: 0 });
  const [allBids, setAllBids] = useState([]);
  const [notification, setNotification] = useState(null);
  const [notificationKey, setNotificationKey] = useState(0);
  const [previousBid, setPreviousBid] = useState(0);
  const [teams, setTeams] = useState([]);
  const previousBidRef = useRef(0);
  const currentPlayerRef = useRef(null);
  const audioInitializedRef = useRef(false);
  const audioElementRef = useRef(null);

  // Initialize audio on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioInitializedRef.current) {
        try {
          const audio = new Audio('/notification_sound.wav');
          audio.preload = 'auto';
          audio.volume = 0.7;
          // Try to load the audio
          audio.load();
          audioElementRef.current = audio;
          audioInitializedRef.current = true;
          console.log('Audio initialized for notifications');
        } catch (err) {
          console.error('Error initializing audio:', err);
        }
      }
    };

    // Initialize on any user interaction
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, initAudio, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, initAudio);
      });
    };
  }, []);

  useEffect(() => {
    // Initialize socket
    const newSocket = io(API_URL, { withCredentials: true });
    setSocket(newSocket);

    // Load initial data
    loadCurrentInfo();
    loadTeams();

    // Socket event listeners
    newSocket.on('player-loaded', (data) => {
      setCurrentPlayer(data.player);
      currentPlayerRef.current = data.player;
      setHighestBid(null);
      setPreviousBid(0);
      previousBidRef.current = 0;
      loadCurrentInfo();
    });

    newSocket.on('bid-placed', (data) => {
      setBidFlash(true);
      setTimeout(() => setBidFlash(false), 500);
      
      if (data.bid) {
        const newBid = data.bid.amount;
        
        // Use previous bid from server if available, otherwise use ref
        const prevBid = data.previousBid !== undefined ? data.previousBid : previousBidRef.current;
        
        // Calculate increment using server-provided previous bid or fallback
        let increment = 0;
        if (prevBid > 0 && prevBid < newBid) {
          increment = newBid - prevBid;
        } else if (prevBid === 0) {
          // First bid - calculate from base price
          const basePrice = currentPlayerRef.current?.base_price || currentBid || 0;
          increment = newBid - basePrice;
        } else {
          // Fallback: use ref if server didn't provide previous bid
          increment = newBid - previousBidRef.current;
        }
        
        // Update previous bid ref BEFORE showing notification to prevent race conditions
        previousBidRef.current = newBid;
        setPreviousBid(newBid);
        
        // Show notification immediately if there's a valid increment and team name
        if (increment > 0 && data.bid.team_name) {
          // Use a more unique key to force re-render
          const newKey = `${Date.now()}-${Math.random()}`;
          setNotificationKey(newKey);
          // Set notification immediately with unique ID
          setNotification({
            id: newKey,
            teamName: data.bid.team_name,
            increment: increment
          });
        }
      }
      
      // Load info after a small delay to ensure notification is set first
      setTimeout(() => {
        loadCurrentInfo();
        loadAllBids();
      }, 100);
    });

    newSocket.on('bid-updated', (data) => {
      setBidFlash(true);
      setTimeout(() => setBidFlash(false), 500);
      
      if (data.highestBid) {
        const newBid = data.highestBid.amount;
        
        // Use previous bid from server if available, otherwise use ref
        const prevBid = data.previousBid !== undefined ? data.previousBid : previousBidRef.current;
        
        // Calculate increment using server-provided previous bid or fallback
        let increment = 0;
        if (prevBid > 0 && prevBid < newBid) {
          increment = newBid - prevBid;
        } else if (prevBid === 0) {
          // First bid - calculate from base price
          const basePrice = currentPlayerRef.current?.base_price || currentBid || 0;
          increment = newBid - basePrice;
        } else {
          // Fallback: use ref if server didn't provide previous bid
          increment = newBid - previousBidRef.current;
        }
        
        // Update previous bid ref BEFORE showing notification to prevent race conditions
        previousBidRef.current = newBid;
        setPreviousBid(newBid);
        
        // Show notification immediately if there's a valid increment and team name
        if (increment > 0 && data.highestBid.team_name) {
          // Use a more unique key to force re-render
          const newKey = `${Date.now()}-${Math.random()}`;
          setNotificationKey(newKey);
          // Set notification immediately with unique ID
          setNotification({
            id: newKey,
            teamName: data.highestBid.team_name,
            increment: increment
          });
        }
      }
      
      // Load info after a small delay to ensure notification is set first
      setTimeout(() => {
        loadCurrentInfo();
        loadAllBids();
      }, 100);
    });

    newSocket.on('auction-status-changed', (data) => {
      setStatus(data.status);
    });

    newSocket.on('bidding-locked', (data) => {
      setBiddingLocked(data.locked);
    });

    newSocket.on('bid-increments-changed', (data) => {
      setBidIncrements({
        increment1: data.increment1,
        increment2: data.increment2,
        increment3: data.increment3
      });
    });

    newSocket.on('bidding-reset', () => {
      setHighestBid(null);
      setAllBids([]);
      loadCurrentInfo();
    });

    newSocket.on('player-marked', () => {
      loadCurrentInfo();
    });

    newSocket.on('team-budget-updated', () => {
      loadTeams();
    });

    // Poll for updates every 2 seconds as backup
    const interval = setInterval(loadCurrentInfo, 2000);

    return () => {
      newSocket.close();
      clearInterval(interval);
    };
  }, []);

  const loadCurrentInfo = async () => {
    try {
      const data = await hostService.getCurrentInfo();
      setCurrentPlayer(data.player);
      currentPlayerRef.current = data.player;
      setHighestBid(data.highestBid);
      const newBid = data.currentBid || 0;
      setCurrentBid(newBid);
      setBiddingLocked(data.biddingLocked);
      setStatus(data.status);
      setBidIncrements(data.bidIncrements);
      if (data.stats) {
        setStats(data.stats);
      }
      
      // Update previous bid if player changed
      if (data.player && (!currentPlayerRef.current || currentPlayerRef.current.id !== data.player.id)) {
        const basePrice = data.player.base_price || 0;
        previousBidRef.current = basePrice;
        setPreviousBid(basePrice);
      } else if (data.highestBid && data.highestBid.amount) {
        // Update previous bid to match the highest bid if it exists
        // Only update if it's different to avoid overwriting during notification
        if (previousBidRef.current !== data.highestBid.amount) {
          previousBidRef.current = data.highestBid.amount;
          setPreviousBid(data.highestBid.amount);
        }
      } else if (newBid > 0 && previousBidRef.current === 0) {
        // Initialize previous bid if we have a current bid but no previous bid
        previousBidRef.current = newBid;
        setPreviousBid(newBid);
      }
    } catch (error) {
      console.error('Error loading current info:', error);
    }
  };

  const loadAllBids = async () => {
    try {
      const data = await hostService.getAllBids();
      setAllBids(data.bids || []);
    } catch (error) {
      console.error('Error loading bids:', error);
    }
  };

  const loadTeams = async () => {
    try {
      const teamsData = await hostService.getAllTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Force full page reload to clear all state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout fails
      window.location.href = '/login';
    }
  };

  // Format number in Indian style (1,00,000)
  const formatIndianNumber = (num) => {
    return num.toLocaleString('en-IN');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Bid Notification */}
      {notification && (
        <BidNotification
          key={notification.id || notificationKey}
          teamName={notification.teamName}
          increment={notification.increment}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* Stadium Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/stadium_img.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Blurred overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-lg"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Top Navigation Bar - Mobile Responsive */}
        <div className="bg-gradient-to-r from-blue-900/95 to-green-900/95 border-b-2 border-yellow-400 shadow-lg">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 sm:py-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 w-full sm:w-auto">
                <div className="text-yellow-400 font-bold text-xl sm:text-2xl md:text-3xl">CricAuction™</div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-white text-sm sm:text-base md:text-lg flex gap-2 sm:gap-4">
                  <span className="text-yellow-400 font-bold">AUDIENCE VIEW</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold text-sm sm:text-base">
                    👁
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-yellow-400 text-sm sm:text-base md:text-lg px-2 py-1 font-bold"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Mobile Responsive */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 pb-2 sm:pb-3 flex flex-col h-[calc(100vh-70px)] overflow-hidden">
          {currentPlayer ? (
            <div className="flex flex-col gap-1.5 sm:gap-2 h-full">
              {/* Player Section */}
              <div className={`bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 border-2 transition-all flex-shrink-0 ${
                bidFlash ? 'border-yellow-400 shadow-2xl shadow-yellow-400/50' : 
                'border-yellow-400/50'
              }`}>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
                  {/* Circular Player Image */}
                  <div className="relative flex-shrink-0">
                    <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60 rounded-full border-4 border-yellow-400 p-1 bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-2xl">
                      <img
                        src={getImageUrl(currentPlayer.image)}
                        alt={currentPlayer.name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300?text=Player';
                        }}
                      />
                    </div>
                    {currentPlayer.serial_number && (
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-yellow-400 text-blue-900 font-bold text-xl sm:text-2xl md:text-3xl px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">
                        {currentPlayer.serial_number}
                      </div>
                    )}
                  </div>

                  {/* Player Info - Compact */}
                  <div className="flex-1 w-full text-center sm:text-left">
                    {/* Yellow Info Bars - Compact */}
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="bg-yellow-400 text-blue-900 px-2 sm:px-3 py-1 rounded-lg font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl shadow-lg">
                        {currentPlayer.name}
                      </div>
                      <div className="bg-yellow-400 text-blue-900 px-2 sm:px-3 py-1 rounded-lg font-bold text-base sm:text-lg md:text-xl lg:text-2xl shadow-lg">
                        {currentPlayer.role}
                      </div>
                      <div className="bg-yellow-400 text-blue-900 px-2 sm:px-3 py-1 rounded-lg font-bold text-sm sm:text-base md:text-lg lg:text-xl shadow-lg">
                        {currentPlayer.base_price ? `Base: ₹${formatIndianNumber(currentPlayer.base_price)}` : 'Base Price'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Bid Display - Separate Section, Centered */}
              <div className={`bg-yellow-400 rounded-xl p-2 sm:p-3 md:p-4 shadow-2xl border-2 border-blue-900/30 flex-shrink-0 transition-all ${
                bidFlash ? 'scale-105 shadow-yellow-400/50' : ''
              }`}>
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="text-blue-900 text-sm sm:text-base md:text-lg font-bold mb-1">CURRENT BID</div>
                  <div className={`text-blue-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold transition-all ${
                    bidFlash ? 'scale-110' : ''
                  }`}>
                    ₹{formatIndianNumber(currentBid)}
                  </div>
                  {highestBid && (
                    <div className="text-blue-700 text-sm sm:text-base md:text-lg lg:text-xl mt-1.5 font-bold">
                      Leading: <span className="font-bold text-blue-900">
                        {highestBid.team_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Teams Balance Panel - 2x4 Grid Layout */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 border-2 border-yellow-400/50 shadow-xl flex-1 overflow-hidden flex flex-col min-h-0">
                <h3 className="text-white font-bold text-base sm:text-lg md:text-xl mb-1.5 sm:mb-2 text-center">Team Balances</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 flex-1 auto-rows-fr min-h-0">
                  {teams.length > 0 ? (
                    teams.map((team) => (
                      <div key={team.id} className="bg-white/20 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center border border-yellow-400/30">
                        <div className="text-white font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-center mb-1 truncate w-full">
                          {team.name}
                        </div>
                        <div className="text-yellow-400 font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-center whitespace-nowrap">
                          ₹{formatIndianNumber(team.budget || 0)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 sm:col-span-4 text-center text-gray-300 py-8 text-base sm:text-lg font-bold">Loading teams...</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-900/95 to-green-900/95 rounded-xl sm:rounded-2xl p-8 sm:p-16 border-2 border-blue-700 text-center shadow-xl">
              <div className="text-yellow-400 text-4xl sm:text-5xl md:text-6xl mb-4">🏏</div>
              <p className="text-white text-2xl sm:text-3xl md:text-4xl font-bold">Waiting for auction to begin...</p>
              <p className="text-gray-300 mt-2 text-lg sm:text-xl md:text-2xl font-bold">The auction will start shortly</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HostDashboard;

