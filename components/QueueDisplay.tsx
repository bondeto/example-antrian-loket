
import React, { useState } from 'react';
import { Ticket, TicketStatus, ServiceType, Station } from '../types';

interface QueueDisplayProps {
  title: string;
  tickets: Ticket[];
  serviceTypes: ServiceType[];
  stations: Station[];
  onRecallTicket?: (ticketId: string, stationId: string) => void;
  recallEnabled: boolean;
  isSystemAnnouncing: boolean; // Added for global announcement lock
}

const QueueDisplay: React.FC<QueueDisplayProps> = ({ title, tickets, serviceTypes, stations, onRecallTicket, recallEnabled, isSystemAnnouncing }) => {
  const [recallStationId, setRecallStationId] = useState<string>('');

  // Set default recallStationId when component mounts or stations/tickets change
  // to an available station for the first recallable ticket.
  React.useEffect(() => {
    if (recallEnabled && tickets.length > 0) {
      const firstRecallableTicket = tickets.find(t => t.status === TicketStatus.SKIPPED || t.status === TicketStatus.ABSENT);
      if (firstRecallableTicket) {
        const suitableStation = stations.find(s => s.status === 'IDLE' && s.supportedServiceTypes.includes(firstRecallableTicket.serviceType));
        if (suitableStation) {
          setRecallStationId(suitableStation.id);
        } else {
          setRecallStationId(''); // No suitable station initially
        }
      } else {
        setRecallStationId('');
      }
    }
  }, [tickets, stations, recallEnabled]);


  const getServiceName = (serviceTypeId: string) => {
    return serviceTypes.find(st => st.id === serviceTypeId)?.name || 'Unknown Service';
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-xl">
      <h3 className="text-xl font-semibold text-sky-400 mb-4">{title} ({tickets.length})</h3>
      {tickets.length === 0 ? (
        <p className="text-slate-400">No tickets in this queue.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-slate-700 p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <p className="text-2xl font-bold text-white">{ticket.displayNumber}</p>
                <p className="text-sm text-slate-300">{getServiceName(ticket.serviceType)}</p>
                <p className="text-xs text-slate-400">
                  Issued: {new Date(ticket.issuedAt).toLocaleTimeString()}
                  {ticket.status === TicketStatus.SKIPPED && ticket.calledAt && ` (Skipped at ${new Date(ticket.calledAt).toLocaleTimeString()})`}
                  {ticket.status === TicketStatus.ABSENT && ticket.calledAt && ` (Marked Absent after ${new Date(ticket.calledAt).toLocaleTimeString()})`}
                </p>
              </div>
              {recallEnabled && onRecallTicket && (ticket.status === TicketStatus.SKIPPED || ticket.status === TicketStatus.ABSENT) && (
                <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <select
                    value={recallStationId}
                    onChange={(e) => setRecallStationId(e.target.value)}
                    className="bg-slate-600 border border-slate-500 text-white text-sm rounded-md p-2 focus:ring-sky-500 focus:border-sky-500 min-w-[120px]"
                    aria-label={`Select station to recall ticket ${ticket.displayNumber}`}
                    disabled={isSystemAnnouncing} // Disable select if system is announcing
                  >
                    <option value="" disabled>Select Station</option>
                    {stations.filter(s => s.status === 'IDLE' && s.supportedServiceTypes.includes(ticket.serviceType)).map(station => (
                      <option key={station.id} value={station.id}>{station.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const stationForRecall = stations.find(s => s.id === recallStationId && s.status === 'IDLE' && s.supportedServiceTypes.includes(ticket.serviceType));
                      if (stationForRecall && onRecallTicket) {
                        onRecallTicket(ticket.id, stationForRecall.id);
                      } else {
                        alert(`Selected station (${stations.find(s=>s.id === recallStationId)?.name || 'Unknown'}) is not available or does not support ${getServiceName(ticket.serviceType)}.`);
                      }
                    }}
                    disabled={!recallStationId || isSystemAnnouncing || stations.filter(s => s.status === 'IDLE' && s.supportedServiceTypes.includes(ticket.serviceType)).length === 0}
                    className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md text-sm transition duration-150"
                    aria-label={`Recall ticket ${ticket.displayNumber}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 inline mr-1">
                        <path d="M10 3.5a.75.75 0 0 1 .75.75v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 .75-.75Z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-1.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" clipRule="evenodd" />
                    </svg>
                    Recall
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QueueDisplay;
