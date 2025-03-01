import React, { useState } from 'react';
import { Settings, Moon, Sun, Globe } from 'lucide-react';
import { NumPad } from './components/NumPad';
import { PaymentMethod } from './components/PaymentMethod';
import { SecurityIndicator } from './components/SecurityIndicator';
import { CardPaymentScreen } from './components/CardPaymentScreen';
import { LightningPaymentScreen } from './components/LightningPaymentScreen';
import { ECashPaymentScreen } from './components/ECashPaymentScreen';
import { formatCurrency } from './lib/utils';

function App() {
  const [amount, setAmount] = useState('0');
  const [darkMode, setDarkMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [language, setLanguage] = useState('en');
  const [showCardPayment, setShowCardPayment] = useState(false);
  const [showLightningPayment, setShowLightningPayment] = useState(false);
  const [showECashPayment, setShowECashPayment] = useState(false);

  const handleNumberClick = (num: string) => {
    if (num === '.' && amount.includes('.')) return;
    setAmount(prev => {
      if (prev === '0' && num !== '.') return num;
      return prev + num;
    });
  };

  const handleClear = () => {
    setAmount(prev => prev.slice(0, -1) || '0');
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      if (paymentMethod === 'card') {
        setShowCardPayment(true);
      } else if (paymentMethod === 'digital') {
        setShowLightningPayment(true);
      } else if (paymentMethod === 'cash') {
        setShowECashPayment(true);
      }
    }
  };

  const handleCancelPayment = () => {
    setShowCardPayment(false);
    setShowLightningPayment(false);
    setShowECashPayment(false);
  };

  return (
    <div className={`min-h-screen h-screen overflow-hidden ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="container mx-auto max-w-2xl h-full p-2 flex flex-col">
        <header className="flex justify-between items-center mb-2">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Smart EFTPOS
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-6 h-6 text-white" /> : <Moon className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Change language"
            >
              <Globe className={`w-6 h-6 ${darkMode ? 'text-white' : ''}`} />
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Settings"
            >
              <Settings className={`w-6 h-6 ${darkMode ? 'text-white' : ''}`} />
            </button>
          </div>
        </header>

        <main className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3 flex-1 overflow-hidden ${darkMode ? 'text-white' : ''}`}>
          {showCardPayment ? (
            <CardPaymentScreen 
              amount={formatCurrency(parseFloat(amount))}
              onCancel={handleCancelPayment}
            />
          ) : showLightningPayment ? (
            <LightningPaymentScreen
              amount={amount}
              onCancel={handleCancelPayment}
            />
          ) : showECashPayment ? (
            <ECashPaymentScreen
              amount={amount}
              onCancel={handleCancelPayment}
            />
          ) : (
            <>
              <div className="text-center mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount Due</p>
                <h2 className="text-3xl font-bold mb-2">{formatCurrency(parseFloat(amount))}</h2>
                <SecurityIndicator />
              </div>

              <div className="mb-3">
                <h3 className="text-sm font-semibold mb-2">Select Payment Method</h3>
                <PaymentMethod
                  selected={paymentMethod}
                  onSelect={setPaymentMethod}
                />
              </div>

              <NumPad
                onNumberClick={handleNumberClick}
                onClear={handleClear}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </main>

        <footer className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 Smart EFTPOS. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;