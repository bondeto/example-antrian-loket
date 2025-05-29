
import React from 'react';
import { Station, Ticket, TicketStatus } from '../types';

interface StationCardProps {
  station: Station;
  currentTicket: Ticket | null;
  onCallNext: () => void;
  onMarkServing: () => void;
  onCompleteService: () => void;
  onSkipTicket: () => void;
  isSpeechSupported: boolean;
  isSpeaking: boolean; // Local hook speaking state for this station's announcement intent
  disabled: boolean; // Global system announcing or other disabling conditions
  waitingCount: number;
}

const StationCard: React.FC<StationCardProps> = ({
  station,
  currentTicket,
  onCallNext,
  onMarkServing,
  onCompleteService,
  onSkipTicket,
  isSpeechSupported,
  isSpeaking, // local isSpeaking from the hook, indicates if THIS station's speech intent is active
  disabled,   // global disabled, e.g. if isSystemAnnouncing is true
  waitingCount
}) => {
  const getStatusColor = () => {
    if (station.status === 'SERVING') return 'bg-green-500';
    if (station.status === 'CALLING') return 'bg-yellow-500 animate-pulse';
    return 'bg-slate-600';
  };

  const currentTicketDisplay = currentTicket ? `${currentTicket.displayNumber} (${currentTicket.serviceType})` : 'None';

  // The 'disabled' prop now considers the global isSystemAnnouncing state from App.tsx
  const callNextDisabled = station.status !== 'IDLE' || disabled || waitingCount === 0;
  const markServingDisabled = disabled;
  const completeServiceDisabled = station.status !== 'SERVING' || disabled;
  const skipTicketDisabled = disabled;


  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-xl flex flex-col justify-between space-y-4 transition-all duration-300 hover:shadow-sky-500/30">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-2xl font-semibold text-sky-400">{station.name}</h3>
          <span className={`px-3 py-1 text-sm font-medium rounded-full text-white ${getStatusColor()}`}>
            {station.status}
          </span>
        </div>
        <p className="text-slate-400 text-sm mb-1">Supported: {station.supportedServiceTypes.join(', ')}</p>
        <p className="text-slate-300 text-lg">
          Serving: <span className="font-bold text-white">{currentTicketDisplay}</span>
        </p>
         <p className="text-slate-400 text-sm mt-1">
          Waiting for this station: <span className="font-semibold text-sky-400">{waitingCount}</span>
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onCallNext}
          disabled={callNextDisabled}
          className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150"
          aria-label={`Call next ticket for ${station.name}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
            <path d="M3.5 2.75a.75.75 0 0 0-1.5 0V4.5h.5A.75.75 0 0 1 3.25 6H4a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-.75.75H2a.75.75 0 0 1-.75-.75V7.64c0-.69.458-1.645 1.012-2.275A чувствительность.75.75 0 0 1 .25 4.5h.5V2.75ZM16.5 2.75a.75.75 0 0 0-1.5 0V4.5h.5A.75.75 0 0 1 16.25 6H17a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-.75.75h-2a.75.75 0 0 1-.75-.75V7.64c0-.69.458-1.645 1.012-2.275A.75.75 0 0 1 14.25 4.5h.5V2.75Z" />
            <path fillRule="evenodd" d="M6.058 1.016A.75.75 0 0 1 6.75 1h6.5a.75.75 0 0 1 .692.984l-2.044 7.05a.75.75 0 0 1-.692.516h-.316a3 3 0 0 0-2.896 1.953c-.052.117-.11.23-.172.342a.75.75 0 0 1-1.258-.668 4.479 4.479 0 0 1 .164-.517A3.001 3.001 0 0 0 4 10.75H3.25a.75.75 0 0 1-.692-.516L.514 3.184A.75.75 0 0 1 1.206 2.2L3.03 6.657A.75.75 0 0 1 4 7.25h.5A2.25 2.25 0 0 0 6.75 5h6.5A2.25 2.25 0 0 0 15.5 7.25h.5a.75.75 0 0 1 .724.557l1.824 4.427a.75.75 0 0 1-1.39.574L15.185 9.5H4.815L2.843 12.816a.75.75 0 0 1-1.258-.668L3.58 5.57A3.75 3.75 0 0 1 7.25 3H12a.75.75 0 0 1 0 1.5H7.25A2.25 2.25 0 0 0 5.31 5.942l-.252.419ZM8.75 16a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
          Call Next
          {/* isSpeaking is true if this station triggered speech, disabled is true if system is busy */}
          {isSpeechSupported && isSpeaking && station.status === 'CALLING' && <span className="ml-2 text-xs">(Announcing...)</span>}
          {isSpeechSupported && disabled && !isSpeaking && station.status === 'IDLE' && <span className="ml-2 text-xs text-yellow-400">(System Announcing)</span>}
        </button>

        {station.status === 'CALLING' && currentTicket && (
            <button
            onClick={onMarkServing}
            disabled={markServingDisabled}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150"
            aria-label={`Mark ticket ${currentTicket.displayNumber} as serving at ${station.name}`}
            >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 inline">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-4.75a.75.75 0 0 0 1.5 0V8.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0L6.2 9.74a.75.75 0 1 0 1.1 1.02l1.95-2.1v4.59Z" clipRule="evenodd" />
            </svg>
            Start Serving
            </button>
        )}

        {(station.status === 'SERVING' || (station.status === 'CALLING' && currentTicket)) && (
          <>
            <button
              onClick={onCompleteService}
              disabled={completeServiceDisabled}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150"
              aria-label={`Complete service for ticket at ${station.name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 inline">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.06 0l4-5.5Z" clipRule="evenodd" />
              </svg>
              Complete Service
            </button>
            <button
              onClick={onSkipTicket}
              disabled={skipTicketDisabled || (station.status !== 'SERVING' && station.status !== 'CALLING')} // Ensure ticket exists
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150"
              aria-label={`Skip ticket at ${station.name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 inline">
                <path fillRule="evenodd" d="M15.28 14.72a.75.75 0 0 1-1.06 0L10 10.06l-4.22 4.66a.75.75 0 0 1-1.06-1.06L8.94 9 4.66 4.72a.75.75 0 0 1 1.06-1.06L10 7.94l4.22-4.66a.75.75 0 1 1 1.06 1.06L11.06 9l4.22 4.22a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
              </svg>
              Skip Ticket
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StationCard;
