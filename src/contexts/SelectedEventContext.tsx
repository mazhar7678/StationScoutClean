import React, { createContext, useContext, useState } from 'react';
import { Event } from '../services/supabase';

interface SelectedEventContextType {
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
}

const SelectedEventContext = createContext<SelectedEventContextType | undefined>(undefined);

export function SelectedEventProvider({ children }: { children: React.ReactNode }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  return (
    <SelectedEventContext.Provider value={{ selectedEvent, setSelectedEvent }}>
      {children}
    </SelectedEventContext.Provider>
  );
}

export function useSelectedEvent() {
  const context = useContext(SelectedEventContext);
  if (!context) {
    throw new Error('useSelectedEvent must be used within SelectedEventProvider');
  }
  return context;
}