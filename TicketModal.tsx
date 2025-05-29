import React from 'react';
import { Ticket, ServiceType } from '../types';

interface TicketModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  serviceTypes: ServiceType[];
}

const TicketModal: React.FC<TicketModalProps> = ({ ticket, onClose, serviceTypes }) => {
  if (!ticket) return null;

  const getServiceName = (serviceTypeId: string) => {
    return serviceTypes.find(st => st.id === serviceTypeId)?.name || 'Unknown Service';
  };
  const serviceName = getServiceName(ticket.serviceType);

  const qrData = `Ticket No: ${ticket.displayNumber}, Service: ${serviceName}, Issued: ${new Date(ticket.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=150x150&bgcolor=ffffff&color=000000&margin=10&qzone=1`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 print:bg-transparent print:items-start print:p-0">
      <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 print:shadow-none print:border-none print:rounded-none print:bg-white print:max-w-full print:w-[80mm] print:h-auto print:mx-auto print:my-0">
        {/* This is the printable area */}
        <div id="ticket-to-print" className="print:p-2">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-sky-400 mb-2 print:text-black print:text-lg print:mb-1">Your Queue Ticket</h2>
            <p className="text-slate-300 mb-1 print:text-black print:text-xs print:mb-0.5">Service: <span className="font-semibold print:font-bold">{serviceName}</span></p>
            <p className="text-5xl md:text-6xl font-extrabold text-white my-3 md:my-4 print:text-black print:text-4xl print:my-2">{ticket.displayNumber}</p>
            <div className="flex justify-center my-3 md:my-4 print:my-2">
              <img 
                src={qrCodeUrl} 
                alt={`QR Code for ticket ${ticket.displayNumber}. Data: ${qrData}`} 
                className="w-32 h-32 md:w-36 md:h-36 border-4 border-sky-500 rounded-lg print:border-black print:border-2 print:w-28 print:h-28" 
              />
            </div>
            <p className="text-slate-400 text-sm print:text-black print:text-xs">Issued: {new Date(ticket.issuedAt).toLocaleTimeString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-slate-300 mt-2 print:text-black print:text-xs print:mt-1">Please wait for your number to be called.</p>
            
            <div className="mt-3 border-t border-dashed border-slate-600 print:border-gray-400 pt-1 print-only">
                <p className="text-xs text-slate-500 print:text-black print:text-[8pt]">QueuePro System - {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
         {/* End of printable area */}

        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 no-print">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto flex-grow bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 flex items-center justify-center"
            aria-label="Print this ticket"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a8.518 8.518 0 0 1 3.586 0M6.72 13.829V3.85m0 9.979L3 16.5m3.72-2.671L6.75 16.5m-3-2.671a8.518 8.518 0 0 0 3.586 0M6.75 16.5L9 13.829m0 0L12 11.25m-2.25 2.579V18.25m0 0L12 15.5m0 2.75L14.25 13.829m0 0L17.25 11.25m-3 2.579V3.85m0 9.979l3.72-2.671m0 0L21 16.5m-3.72-2.671L17.25 16.5m3-2.671a8.518 8.518 0 0 0-3.586 0m3.586 0L17.25 13.829M12 11.25a2.25 2.25 0 0 0-2.25 2.25v.862c0 .48.12.94.336 1.358l.716 1.431a1.125 1.125 0 0 1-2.134.952L4.005 10.081a1.125 1.125 0 0 1-.224-1.423C3.98 8.282 4.48 7.5 5.25 7.5h13.5c.77 0 1.27.782 1.469 1.158a1.125 1.125 0 0 1-.224 1.423l-4.262 5.553a1.125 1.125 0 0 1-2.134-.952l.716-1.431c.216-.419.336-.879.336-1.358v-.862a2.25 2.25 0 0 0-2.25-2.25H12Z" />
            </svg>
            Print Ticket
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex-grow bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;