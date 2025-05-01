import React, { ReactNode } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import WalletConnection from './WalletConnection';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Quantum Blockchain' }) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Quantum-resistant blockchain platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold">Quantum Blockchain</span>
              </div>
              <nav className="ml-6 flex space-x-4">
                <a href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                  {t('common.welcome')}
                </a>
                <a href="/wallet" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                  {t('wallet.myWallet')}
                </a>
                <a href="/transactions" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                  {t('wallet.transactions')}
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <WalletConnection />
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      
      <footer className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm">&copy; {new Date().getFullYear()} Quantum Blockchain. {t('settings.termsOfService')}</p>
            </div>
            <div className="flex space-x-4">
              <a href="/about" className="text-sm hover:underline">
                {t('settings.about')}
              </a>
              <a href="/privacy" className="text-sm hover:underline">
                {t('settings.privacyPolicy')}
              </a>
              <a href="/help" className="text-sm hover:underline">
                {t('settings.help')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;