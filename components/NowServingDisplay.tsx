
import React from 'react';
import { Ticket, Station, TicketStatus } from '../types';

interface NowServingDisplayProps {
  tickets: Ticket[];
  stations: Station[];
}

const NowServingDisplay: React.FC<NowServingDisplayProps> = ({ tickets, stations }) => {
  const servingTickets = stations
    .filter(station => station.currentTicketId && (station.status === 'SERVING' || station.status === 'CALLING'))
    .map(station => {
      const ticket = tickets.find(t => t.id === station.currentTicketId);
      return ticket ? { ...ticket, stationName: station.name, stationStatus: station.status } : null;
    })
    .filter(Boolean) as (Ticket & { stationName: string, stationStatus: Station['status'] })[];

  if (servingTickets.length === 0) {
    return (
      <div className="w-full bg-slate-800 p-6 rounded-xl shadow-xl text-center">
        <h2 className="text-xl font-semibold text-sky-400 mb-2">Now Serving</h2>
        <p className="text-slate-400 text-lg">No tickets currently being served.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-800 p-6 rounded-xl shadow-xl">
      <h2 className="text-xl font-semibold text-sky-400 mb-4 text-center">Now Serving / Called</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {servingTickets.sort((a,b) => (a.calledAt && b.calledAt ? new Date(a.calledAt).getTime() - new Date(b.calledAt).getTime() : 0)).map(ticket => (
          <div 
            key={ticket.id} 
            className={`p-4 rounded-lg shadow-lg transition-all duration-300
                        ${ticket.stationStatus === 'SERVING' ? 'bg-green-700/50 border-green-500' : 'bg-yellow-600/50 border-yellow-400 animate-pulseFast'} border-2`}
            role="status"
            aria-live="polite"
          >
            <p className="text-3xl md:text-4xl font-extrabold text-white text-center">{ticket.displayNumber}</p>
            <p className="text-md text-slate-200 text-center mt-1">{ticket.stationName}</p>
            <p className={`text-xs text-center mt-0.5 ${ticket.stationStatus === 'SERVING' ? 'text-green-300' : 'text-yellow-200'}`}>
              Status: {ticket.stationStatus}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NowServingDisplay;
