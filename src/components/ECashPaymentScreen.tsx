import React, { useEffect, useState } from 'react';
import { Coins, ArrowLeftCircle, AlertCircle, WifiOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface ECashPaymentScreenProps {
  amount: string;
  onCancel: () => void;
}

interface NFCStatus {
  supported: boolean;
  enabled: boolean;
  error?: string;
}

export function ECashPaymentScreen({ amount, onCancel }: ECashPaymentScreenProps) {
  const [btcAmount, setBtcAmount] = useState<string>('');
  const [satsAmount, setSatsAmount] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);
  const [nfcStatus, setNfcStatus] = useState<NFCStatus>({
    supported: false,
    enabled: false
  });
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'processing' | 'success' | 'error'>('waiting');

  useEffect(() => {
    const checkNFCSupport = async () => {
      if ('NDEFReader' in window) {
        try {
          const ndef = new (window as any).NDEFReader();
          await ndef.scan();
          setNfcStatus({ supported: true, enabled: true });
          
          ndef.addEventListener("reading", ({ message }: any) => {
            handleNFCPayment(message);
          });
          
          ndef.addEventListener("error", () => {
            setNfcStatus(prev => ({ ...prev, error: "Error reading NFC device" }));
          });
        } catch (error) {
          setNfcStatus({ 
            supported: true, 
            enabled: false, 
            error: "Please enable NFC on your device" 
          });
        }
      } else {
        setNfcStatus({ 
          supported: false, 
          enabled: false, 
          error: "NFC is not supported on this device" 
        });
      }
    };

    checkNFCSupport();
  }, []);

  const handleNFCPayment = async (message: any) => {
    try {
      setPaymentStatus('processing');
      
      // Parse the NFC message records
      for (const record of message.records) {
        if (record.recordType === "text") {
          const textDecoder = new TextDecoder();
          const payload = textDecoder.decode(record.data);
          
          // Validate the payment data
          // This is where you'd implement your actual payment validation logic
          const isValid = validatePaymentData(payload);
          
          if (isValid) {
            setPaymentStatus('success');
            // Wait 2 seconds to show success message then return to main screen
            setTimeout(() => {
              onCancel();
            }, 2000);
            return;
          }
        }
      }
      
      setPaymentStatus('error');
      setTimeout(() => {
        setPaymentStatus('waiting');
      }, 2000);
    } catch (error) {
      setPaymentStatus('error');
      setTimeout(() => {
        setPaymentStatus('waiting');
      }, 2000);
    }
  };

  const validatePaymentData = (payload: string): boolean => {
    try {
      // This is where you'd implement your actual validation logic
      // For example, checking digital signatures, amount matching, etc.
      const data = JSON.parse(payload);
      return data.amount === amount && data.currency === 'USD';
    } catch {
      return false;
    }
  };
  
  useEffect(() => {
    const fetchBTCPrice = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.coinconvert.net/convert/usd/btc?amount=${amount}`);
        const data = await response.json();
        
        if (data.status === 'success') {
          setBtcAmount(data.BTC.toFixed(8));
          // Convert BTC to Sats (1 BTC = 100,000,000 sats)
          const sats = Math.round(data.BTC * 100000000);
          setSatsAmount(sats.toLocaleString());
        } else {
          throw new Error('Failed to convert currency');
        }
      } catch (err) {
        setError('Failed to fetch Bitcoin price. Please try again.');
        console.error('Error fetching BTC price:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBTCPrice();
  }, [amount]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      // Redirect to main page after 3 seconds of showing expired message
      const redirectTimeout = setTimeout(() => {
        onCancel();
      }, 3000);
      return () => clearTimeout(redirectTimeout);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onCancel]);

  // Format time left into minutes and seconds
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-500 mb-2">Payment Request Expired</h2>
        <p className="text-gray-600 mb-4">Redirecting to payment selection...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold mb-1">eCash Payment</h2>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Coins className="w-5 h-5 text-emerald-500" />
          <p className="text-3xl font-bold text-emerald-500">{satsAmount} sats</p>
        </div>
        <p className="text-sm text-gray-500">≈ {btcAmount} BTC</p>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-64 h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <>
          <div className="relative w-full max-w-md aspect-video bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {paymentStatus === 'processing' ? (
                  <>
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-white text-lg font-semibold">Processing Payment...</p>
                  </>
                ) : paymentStatus === 'success' ? (
                  <>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2">
                      <Coins className="w-12 h-12 text-emerald-500" />
                    </div>
                    <p className="text-white text-lg font-semibold">Payment Successful!</p>
                  </>
                ) : paymentStatus === 'error' ? (
                  <>
                    <AlertCircle className="w-16 h-16 text-red-500 mb-2" />
                    <p className="text-white text-lg font-semibold">Payment Failed</p>
                  </>
                ) : nfcStatus.supported && nfcStatus.enabled ? (
                  <>
                    <Coins className="w-16 h-16 text-white mb-2 animate-pulse" />
                    <p className="text-white text-lg font-semibold">Tap your eCash wallet to pay</p>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-16 h-16 text-white mb-2" />
                    <p className="text-white text-lg font-semibold">{nfcStatus.error}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-center space-y-1 mb-3">
            <p className="text-sm text-gray-600">Hold your device near the payment terminal</p>
            <p className={cn(
              "text-sm font-medium",
              timeLeft <= 30 ? "text-red-500" : "text-gray-500"
            )}>
              Payment request expires in {formatTimeLeft()}
            </p>
          </div>

          <button
            onClick={onCancel}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm",
              "bg-gray-200 text-gray-800",
              "hover:bg-gray-300",
              "focus:outline-none focus:ring-2 focus:ring-gray-400",
              "transition-colors"
            )}
          >
            <ArrowLeftCircle className="w-5 h-5" />
            Cancel Payment
          </button>
        </>
      )}
    </div>
  );
}