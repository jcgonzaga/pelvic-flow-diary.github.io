import { useState, useEffect } from 'react';
import { Record } from '@/types/record';

const STORAGE_KEY = 'pelvic-therapy-records';

export function useRecords() {
  const [records, setRecords] = useState<Record[]>([]);

  // Load records from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecords(parsed);
      } catch (error) {
        console.error('Error loading records:', error);
      }
    }
  }, []);

  // Save records to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const addRecord = (record: Omit<Record, 'id' | 'timestamp' | 'date' | 'time'>) => {
    const now = new Date();
    const newRecord: Record = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    } as Record;

    setRecords(prev => [newRecord, ...prev]);
    return newRecord;
  };

  const importRecords = (importedRecords: Omit<Record, 'id'>[]) => {
    const newRecords: Record[] = importedRecords.map(record => ({
      ...record,
      id: crypto.randomUUID(),
    } as Record));

    setRecords(prev => {
      const allRecords = [...prev, ...newRecords];
      // Sort by timestamp descending
      return allRecords.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const getRecordsByDate = (date: string) => {
    return records.filter(r => r.date === date);
  };

  const getTodayRecords = () => {
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return getRecordsByDate(today);
  };

  const getDailySummary = (date: string) => {
    const dayRecords = getRecordsByDate(date);
    const fluidIntake = dayRecords
      .filter(r => r.type === 'fluid-intake')
      .reduce((sum, r) => sum + (r as any).amount, 0);
    
    const urinations = dayRecords.filter(r => r.type === 'urination').length;
    const leakages = dayRecords.filter(r => r.type === 'leakage').length;
    const urgencies = dayRecords.filter(r => r.type === 'urgency').length;

    return { fluidIntake, urinations, leakages, urgencies };
  };

  return {
    records,
    addRecord,
    importRecords,
    deleteRecord,
    getRecordsByDate,
    getTodayRecords,
    getDailySummary,
  };
}
