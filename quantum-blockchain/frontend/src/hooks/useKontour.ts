import { useContext } from 'react';
import { KontourContext } from '../contexts/KontourContext';

export const useKontour = () => {
  const context = useContext(KontourContext);
  
  if (context === undefined) {
    throw new Error('useKontour must be used within a KontourProvider');
  }
  
  return context;
};