
import React, { useState, useEffect, useCallback } from 'react';
import { Ticket, Station, TicketStatus, AppState, ServiceType } from './types';
import TicketModal from './components/TicketModal';
import StationCard from './components/StationCard';
import QueueDisplay from './components/QueueDisplay';
import NowServingDisplay from './components/NowServingDisplay';
import StationManagement from './components/StationManagement'; // New Import
import useSpeechSynthesis from './hooks/useSpeechSynthesis';
// import { API_BASE_URL } from './config'; // Conceptually, you'd import this for backend calls

const initialServiceTypes: ServiceType[] = [
  { id: 'general', name: 'General Inquiry', prefix: 'A', nextNumber: 1 },
  { id: 'payments', name: 'Payments', prefix: 'B', nextNumber: 1 },
  { id: 'support', name: 'Technical Support', prefix: 'C', nextNumber: 1 },
];

const LOCAL_STORAGE_STATIONS_KEY = 'queueProStations';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    tickets: [],
    stations: [], // Initialize as empty, will load from localStorage
    showTicketModal: false,
    lastIssuedTicket: null,
    currentView: 'customer',
    serviceTypes: initialServiceTypes,
    selectedServiceType: initialServiceTypes[0]?.id || null,
  });
  const [isSystemAnnouncing, setIsSystemAnnouncing] = useState(false);

  const { speak, isSpeaking: localHookIsSpeaking, supported: speechSupported, selectedVoiceInfo } = useSpeechSynthesis();

  // Load stations from localStorage on initial mount
  useEffect(() => {
    const storedStations = localStorage.getItem(LOCAL_STORAGE_STATIONS_KEY);
    if (storedStations) {
      try {
        const parsedStations = JSON.parse(storedStations) as Station[];
        // Basic validation if needed
        if (Array.isArray(parsedStations)) {
             setState(prevState => ({ ...prevState, stations: parsedStations }));
        }
      } catch (error) {
        console.error("Error parsing stations from localStorage:", error);
        // Fallback to empty or default if parsing fails
        localStorage.removeItem(LOCAL_STORAGE_STATIONS_KEY); // Clear corrupted data
      }
    }
  }, []);

  // Save stations to localStorage whenever they change
  useEffect(() => {
    if (state.stations.length > 0 || localStorage.getItem(LOCAL_STORAGE_STATIONS_KEY)) { // Avoid writing empty array if it was never set
        localStorage.setItem(LOCAL_STORAGE_STATIONS_KEY, JSON.stringify(state.stations));
    }
  }, [state.stations]);


  const formatTicketNumber = (servicePrefix: string, num: number) => {
    return `${servicePrefix}-${String(num).padStart(3, '0')}`;
  };

  const handleIssueTicket = useCallback(() => {
    if (!state.selectedServiceType) {
      alert("Please select a service type.");
      return;
    }

    setState(prevState => {
      const serviceType = prevState.serviceTypes.find(st => st.id === prevState.selectedServiceType);
      if (!serviceType) return prevState;

      const newTicketNumber = serviceType.nextNumber;
      const newTicket: Ticket = {
        id: `ticket-${serviceType.prefix}-${newTicketNumber}-${Date.now()}`,
        number: newTicketNumber,
        displayNumber: formatTicketNumber(serviceType.prefix, newTicketNumber),
        status: TicketStatus.WAITING,
        issuedAt: new Date(),
        serviceType: serviceType.id,
      };

      const updatedServiceTypes = prevState.serviceTypes.map(st =>
        st.id === serviceType.id ? { ...st, nextNumber: st.nextNumber + 1 } : st
      );

      if (speechSupported) {
        const soundUtterance = new SpeechSynthesisUtterance("PLING");
        soundUtterance.lang = 'en-US'; 
        soundUtterance.pitch = 1.5;
        soundUtterance.rate = 3;
        soundUtterance.volume = 0.3;
        
        if (!localHookIsSpeaking && !isSystemAnnouncing) { 
            window.speechSynthesis.speak(soundUtterance);
        }
      }

      return {
        ...prevState,
        tickets: [...prevState.tickets, newTicket],
        serviceTypes: updatedServiceTypes,
        lastIssuedTicket: newTicket,
        showTicketModal: true,
      };
    });
  }, [state.selectedServiceType, speechSupported, localHookIsSpeaking, isSystemAnnouncing]);

  const handleCloseModal = () => {
    setState(prevState => ({ ...prevState, showTicketModal: false, lastIssuedTicket: null }));
  };

  const announceTicket = (ticketDisplayNumber: string, stationName: string) => {
    if (speechSupported && !isSystemAnnouncing) {
      const message = `Nomor antrian ${ticketDisplayNumber.replace('-', ' ')}, silahkan ke ${stationName}.`;
      speak(
        message,
        () => setIsSystemAnnouncing(true), 
        () => setIsSystemAnnouncing(false) 
      );
    } else if (isSystemAnnouncing) {
      console.log("System is currently announcing, new announcement queued or skipped.");
    }
  };

  const handleCallNext = useCallback((stationId: string) => {
    if (isSystemAnnouncing) {
        alert("Another announcement is in progress. Please wait.");
        return;
    }
    setState(prevState => {
      const station = prevState.stations.find(s => s.id === stationId);
      if (!station || station.status !== 'IDLE') return prevState;

      const nextTicket = prevState.tickets
        .filter(t => t.status === TicketStatus.WAITING && station.supportedServiceTypes.includes(t.serviceType))
        .sort((a, b) => new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime())[0];

      if (!nextTicket) {
        alert(`No waiting tickets for services supported by ${station.name}.`);
        return prevState;
      }
      
      announceTicket(nextTicket.displayNumber, station.name);

      const updatedTickets = prevState.tickets.map(t =>
        t.id === nextTicket.id ? { ...t, status: TicketStatus.CALLED, stationId: stationId, calledAt: new Date() } : t
      );
      const updatedStations = prevState.stations.map(s =>
        s.id === stationId ? { ...s, currentTicketId: nextTicket.id, status: 'CALLING' as const } : s
      );
      return { ...prevState, tickets: updatedTickets, stations: updatedStations };
    });
  }, [speak, speechSupported, isSystemAnnouncing]);


  const handleMarkServing = useCallback((stationId: string) => {
    setState(prevState => {
      const station = prevState.stations.find(s => s.id === stationId);
      if (!station || !station.currentTicketId || station.status !== 'CALLING') return prevState;

      const updatedTickets = prevState.tickets.map(t =>
        t.id === station.currentTicketId ? { ...t, status: TicketStatus.SERVING } : t
      );
      const updatedStations = prevState.stations.map(s =>
        s.id === stationId ? { ...s, status: 'SERVING' as const } : s
      );
      return { ...prevState, tickets: updatedTickets, stations: updatedStations };
    });
  }, []);

  const handleCompleteService = useCallback((stationId: string) => {
    setState(prevState => {
      const station = prevState.stations.find(s => s.id === stationId);
      if (!station || !station.currentTicketId) return prevState;

      const updatedTickets = prevState.tickets.map(t =>
        t.id === station.currentTicketId ? { ...t, status: TicketStatus.COMPLETED } : t
      );
      const updatedStations = prevState.stations.map(s =>
        s.id === stationId ? { ...s, currentTicketId: null, status: 'IDLE' as const } : s
      );
      return { ...prevState, tickets: updatedTickets, stations: updatedStations };
    });
  }, []);

  const handleSkipTicket = useCallback((stationId: string) => {
     setState(prevState => {
      const station = prevState.stations.find(s => s.id === stationId);
      if (!station || !station.currentTicketId) return prevState;

      const ticketToSkipId = station.currentTicketId;

      const updatedTickets = prevState.tickets.map(t =>
        t.id === ticketToSkipId ? { ...t, status: TicketStatus.SKIPPED, stationId: undefined, calledAt: new Date() } : t
      );
      const updatedStations = prevState.stations.map(s =>
        s.id === stationId ? { ...s, currentTicketId: null, status: 'IDLE' as const } : s
      );
      
      return { ...prevState, tickets: updatedTickets, stations: updatedStations };
    });
  }, []);
  
  const handleRecallTicket = useCallback((ticketId: string, stationId: string) => {
    if (isSystemAnnouncing) {
        alert("Another announcement is in progress. Please wait.");
        return;
    }
    setState(prevState => {
      const station = prevState.stations.find(s => s.id === stationId);
      const ticket = prevState.tickets.find(t => t.id === ticketId);

      if (!station || !ticket || station.status !== 'IDLE' || !(ticket.status === TicketStatus.SKIPPED || ticket.status === TicketStatus.ABSENT)) {
        alert("Station is busy, ticket cannot be recalled, or station does not support this service type.");
        return prevState;
      }
       if (!station.supportedServiceTypes.includes(ticket.serviceType)) {
        alert(`Station ${station.name} does not support ${prevState.serviceTypes.find(st => st.id === ticket.serviceType)?.name || 'this service'}.`);
        return prevState;
      }
      
      announceTicket(ticket.displayNumber, station.name);

      const updatedTickets = prevState.tickets.map(t =>
        t.id === ticketId ? { ...t, status: TicketStatus.CALLED, stationId: stationId, calledAt: new Date() } : t
      );
      const updatedStations = prevState.stations.map(s =>
        s.id === stationId ? { ...s, currentTicketId: ticketId, status: 'CALLING' as const } : s
      );
      return { ...prevState, tickets: updatedTickets, stations: updatedStations };
    });
  }, [speak, speechSupported, isSystemAnnouncing]);

  const handleAddStation = useCallback((name: string, supportedServices: string[]) => {
    if (!name.trim()) {
      alert("Station name cannot be empty.");
      return;
    }
    if (supportedServices.length === 0) {
      alert("Please select at least one service type for the station.");
      return;
    }
    setState(prevState => {
      const newStation: Station = {
        id: `station-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // More unique ID
        name: name.trim(),
        supportedServiceTypes: supportedServices,
        currentTicketId: null,
        status: 'IDLE',
      };
      return { ...prevState, stations: [...prevState.stations, newStation] };
    });
  }, []);

  const handleRemoveStation = useCallback((stationId: string) => {
    setState(prevState => {
      const stationToRemove = prevState.stations.find(s => s.id === stationId);
      if (stationToRemove && (stationToRemove.status !== 'IDLE' || stationToRemove.currentTicketId)) {
        alert(`Station ${stationToRemove.name} is currently busy or has an active ticket. It cannot be removed.`);
        return prevState;
      }
      const updatedStations = prevState.stations.filter(s => s.id !== stationId);
      return { ...prevState, stations: updatedStations };
    });
  }, []);


  const waitingTickets = state.tickets.filter(t => t.status === TicketStatus.WAITING);
  const skippedOrAbsentTickets = state.tickets.filter(t => t.status === TicketStatus.SKIPPED || t.status === TicketStatus.ABSENT);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prevState => {
        const now = new Date();
        const twoMinutesInMs = 2 * 60 * 1000;
        
        let ticketsChanged = false;
        let stationsChanged = false;

        const updatedTickets = prevState.tickets.map(ticket => {
          if (ticket.status === TicketStatus.CALLED && ticket.calledAt && (now.getTime() - new Date(ticket.calledAt).getTime() > twoMinutesInMs)) {
            const stationCalling = prevState.stations.find(s => s.currentTicketId === ticket.id && s.status === 'CALLING');
            if (stationCalling) { 
              ticketsChanged = true;
              return { ...ticket, status: TicketStatus.ABSENT, stationId: undefined };
            }
          }
          return ticket;
        });

        if (ticketsChanged) {
          const updatedStations = prevState.stations.map(station => {
            const ticketWasCalling = prevState.tickets.find(t => t.id === station.currentTicketId && t.status === TicketStatus.CALLED);
            const correspondingUpdatedTicket = updatedTickets.find(t => t.id === station.currentTicketId);

            if (station.status === 'CALLING' && ticketWasCalling && correspondingUpdatedTicket?.status === TicketStatus.ABSENT) {
              stationsChanged = true;
              return {...station, status: 'IDLE' as const, currentTicketId: null};
            }
            return station;
          });
          
          if (stationsChanged) {
            return { ...prevState, tickets: updatedTickets, stations: updatedStations };
          } 
          return { ...prevState, tickets: updatedTickets }; 
        }
        return prevState; 
      });
    }, 30 * 1000); 

    return () => clearInterval(interval);
  }, []);


  const currentTicketForStation = (stationId: string) => {
    const station = state.stations.find(s => s.id === stationId);
    if (station && station.currentTicketId) {
      return state.tickets.find(t => t.id === station.currentTicketId);
    }
    return null;
  };
  
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-900 text-slate-100">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-sky-400 tracking-tight">
          QueuePro <span className="text-slate-400">System</span>
        </h1>
        <div className="mt-4 no-print">
          <button
            onClick={() => setState(prev => ({ ...prev, currentView: prev.currentView === 'customer' ? 'admin' : 'customer' }))}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-150"
            aria-label={state.currentView === 'customer' ? "Switch to Admin View" : "Switch to Customer View"}
          >
            Switch to {state.currentView === 'customer' ? 'Admin' : 'Customer'} View
          </button>
        </div>
      </header>

      {state.currentView === 'customer' && (
        <section id="customer-view" className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-8">
          <div className="bg-slate-800 p-6 rounded-xl shadow-xl w-full no-print">
            <h2 className="text-2xl font-semibold text-sky-400 mb-4 text-center">Get Your Ticket</h2>
            <div className="mb-4">
              <label htmlFor="serviceType" className="block text-sm font-medium text-slate-300 mb-1">Select Service:</label>
              <select
                id="serviceType"
                value={state.selectedServiceType || ''}
                onChange={(e) => setState(prev => ({ ...prev, selectedServiceType: e.target.value }))}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                aria-label="Select service type"
              >
                {state.serviceTypes.map(st => (
                  <option key={st.id} value={st.id}>{st.name} ({st.prefix})</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleIssueTicket}
              disabled={!state.selectedServiceType}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 text-white font-bold py-4 px-6 rounded-lg text-xl shadow-lg transition duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
              aria-label="Issue a new ticket"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 inline-block mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
              </svg>
              Get Ticket
            </button>
          </div>
           <NowServingDisplay tickets={state.tickets} stations={state.stations} />
        </section>
      )}

      {state.currentView === 'admin' && (
        <section id="admin-view" className="space-y-8 no-print">
          <StationManagement
            stations={state.stations}
            serviceTypes={state.serviceTypes}
            onAddStation={handleAddStation}
            onRemoveStation={handleRemoveStation}
          />
          {state.stations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.stations.map(station => (
                <StationCard
                  key={station.id}
                  station={station}
                  currentTicket={currentTicketForStation(station.id)}
                  onCallNext={() => handleCallNext(station.id)}
                  onMarkServing={() => handleMarkServing(station.id)}
                  onCompleteService={() => handleCompleteService(station.id)}
                  onSkipTicket={() => handleSkipTicket(station.id)}
                  isSpeechSupported={speechSupported}
                  isSpeaking={localHookIsSpeaking} 
                  disabled={isSystemAnnouncing || localHookIsSpeaking} 
                  waitingCount={state.tickets.filter(t => t.status === TicketStatus.WAITING && station.supportedServiceTypes.includes(t.serviceType)).length}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-800 rounded-xl">
              <p className="text-xl text-slate-400">No stations configured.</p>
              <p className="text-slate-500">Please add a station using the form above to begin managing queues.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QueueDisplay
              title="Waiting Queue"
              tickets={waitingTickets}
              serviceTypes={state.serviceTypes}
              stations={state.stations} 
              onRecallTicket={handleRecallTicket}
              recallEnabled={false} 
              isSystemAnnouncing={isSystemAnnouncing}
            />
            <QueueDisplay
              title="Skipped/Absent Queue"
              tickets={skippedOrAbsentTickets}
              serviceTypes={state.serviceTypes}
              stations={state.stations} 
              onRecallTicket={handleRecallTicket}
              recallEnabled={true}
              isSystemAnnouncing={isSystemAnnouncing}
            />
          </div>
        </section>
      )}

      {state.showTicketModal && state.lastIssuedTicket && (
        <TicketModal 
          ticket={state.lastIssuedTicket} 
          onClose={handleCloseModal}
          serviceTypes={state.serviceTypes} />
      )}
      
      <div className="fixed bottom-4 right-4 space-y-2 no-print z-50">
        {isSystemAnnouncing && (
            <div
              role="status"
              aria-live="assertive" 
              className="bg-yellow-500 text-black p-3 rounded-lg shadow-md max-w-sm text-sm font-semibold">
               <p>System Announcing...</p>
            </div>
        )}
        {!speechSupported && (
            <div
              role="alert"
              aria-live="assertive" 
              className="bg-red-600 text-white p-3 rounded-lg shadow-md max-w-sm">
               <p className="font-semibold">Speech Synthesis Not Supported</p>
               <p className="text-sm">Voice announcements will not be available.</p>
            </div>
        )}
        {speechSupported && selectedVoiceInfo && (
           <div
              role="status"
              aria-live="polite" 
              className="bg-blue-600 text-white p-3 rounded-lg shadow-md max-w-sm text-xs">
               <p>{selectedVoiceInfo}</p>
            </div>
        )}
      </div>

    </div>
  );
};

export default App;
