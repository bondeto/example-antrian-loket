
import React, { useState } from 'react';
import { Station, ServiceType } from '../types';

interface StationManagementProps {
  stations: Station[];
  serviceTypes: ServiceType[];
  onAddStation: (name: string, supportedServices: string[]) => void;
  onRemoveStation: (stationId: string) => void;
}

const StationManagement: React.FC<StationManagementProps> = ({
  stations,
  serviceTypes,
  onAddStation,
  onRemoveStation,
}) => {
  const [newStationName, setNewStationName] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStationName.trim()) {
      alert('Station name cannot be empty.');
      return;
    }
    if (selectedServices.length === 0) {
      alert('Please select at least one service type for the station.');
      return;
    }
    onAddStation(newStationName, selectedServices);
    setNewStationName('');
    setSelectedServices([]);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-xl mb-8">
      <h2 className="text-2xl font-semibold text-sky-400 mb-6">Manage Stations</h2>
      
      {/* Add Station Form */}
      <form onSubmit={handleAddSubmit} className="mb-8 p-4 border border-slate-700 rounded-lg">
        <h3 className="text-lg font-medium text-slate-200 mb-3">Add New Station</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-1">
            <label htmlFor="stationName" className="block text-sm font-medium text-slate-300 mb-1">
              Station Name:
            </label>
            <input
              id="stationName"
              type="text"
              value={newStationName}
              onChange={(e) => setNewStationName(e.target.value)}
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-1 focus:ring-sky-500"
              placeholder="e.g., Counter 4"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">Supported Service Types:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 border border-slate-600 rounded-md max-h-32 overflow-y-auto">
              {serviceTypes.map(st => (
                <label key={st.id} className="flex items-center space-x-2 p-1.5 hover:bg-slate-600 rounded-md cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(st.id)}
                    onChange={() => handleServiceToggle(st.id)}
                    className="form-checkbox h-4 w-4 text-sky-500 bg-slate-600 border-slate-500 rounded focus:ring-sky-500 focus:ring-offset-slate-800"
                  />
                  <span className="text-sm text-slate-300">{st.name} ({st.prefix})</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-150"
        >
          Add Station
        </button>
      </form>

      {/* List Existing Stations */}
      <div>
        <h3 className="text-lg font-medium text-slate-200 mb-3">Existing Stations ({stations.length})</h3>
        {stations.length === 0 ? (
          <p className="text-slate-400">No stations configured yet.</p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {stations.map(station => (
              <div key={station.id} className="bg-slate-700 p-3 rounded-lg flex justify-between items-center shadow">
                <div>
                  <p className="text-md font-semibold text-white">{station.name}</p>
                  <p className="text-xs text-slate-400">
                    Services: {station.supportedServiceTypes.map(stId => serviceTypes.find(s => s.id === stId)?.prefix || stId).join(', ')}
                  </p>
                   <p className={`text-xs ${station.status === 'IDLE' ? 'text-green-400' : 'text-yellow-400'}`}>Status: {station.status}</p>
                </div>
                <button
                  onClick={() => onRemoveStation(station.id)}
                  disabled={station.status !== 'IDLE' || !!station.currentTicketId}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-1.5 px-3 rounded-md text-sm transition duration-150"
                  title={station.status !== 'IDLE' || !!station.currentTicketId ? "Station must be idle and empty to remove" : "Remove station"}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StationManagement;
