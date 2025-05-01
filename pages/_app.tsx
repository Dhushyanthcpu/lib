import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { WalletContextProvider } from '../components/WalletContextProvider';
import { useTranslation } from 'react-i18next';
import '../utils/i18n'; // Import i18n configuration
import '../styles/globals.css';

// Import quantum-resistant cryptography
import { QuantumResistantCrypto } from '../blockchain/quantum-resistant/QuantumResistantCrypto';

export default function App({ Component, pageProps }: AppProps) {
  const { i18n } = useTranslation();

  // Initialize quantum-resistant cryptography
  useEffect(() => {
    // This is just for demonstration purposes
    // In a real app, you would initialize this in a more appropriate place
    try {
      const quantumCrypto = new QuantumResistantCrypto();
      console.log('Quantum-resistant cryptography initialized');
    } catch (error) {
      console.error('Failed to initialize quantum-resistant cryptography:', error);
    }
  }, []);

  // Set the HTML lang attribute when the language changes
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <WalletContextProvider>
      <Component {...pageProps} />
    </WalletContextProvider>
  );
} 