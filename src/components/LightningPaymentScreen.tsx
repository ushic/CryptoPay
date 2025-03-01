import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Zap, ArrowLeftCircle, AlertCircle, Smartphone, WifiOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface LightningPaymentScreenProps {
  amount: string;
  onCancel: () => void;
}

interface NFCStatus {
  supported: boolean;
  enabled: boolean;
  error?: string;
}

export function LightningPaymentScreen({ amount, onCancel }: LightningPaymentScreenProps) {
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

  // Check for NFC support and initialize it
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
      
      for (const record of message.records) {
        if (record.recordType === "text") {
          const textDecoder = new TextDecoder();
          const payload = textDecoder.decode(record.data);
          
          // Validate the lightning invoice
          if (payload.startsWith('lnbc')) {
            setPaymentStatus('success');
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

  // Share Lightning invoice via NFC
  const shareViaNFC = async () => {
    if (!('NDEFReader' in window)) {
      return;
    }

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.write({
        records: [{
          recordType: "text",
          data: mockLightningInvoice
        }]
      });
    } catch (error) {
      console.error('Error sharing via NFC:', error);
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

  // For demo purposes, we're using a mock lightning invoice
  const mockLightningInvoice = `lnbc${satsAmount}n1p3hkummpp5k6rh3uee9k9rk4znnrn4xqkf0ny8h9ue4e6qnhwjzs8yegf8hqhp5`;

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
        <h2 className="text-2xl font-bold text-red-500 mb-2">Invoice Expired</h2>
        <p className="text-gray-600 mb-4">Redirecting to payment selection...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold mb-1">Lightning Payment</h2>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <p className="text-3xl font-bold text-yellow-500">{satsAmount} sats</p>
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
          <div className="bg-white p-2 rounded-lg shadow-lg mb-3">
            {nfcStatus.supported && nfcStatus.enabled ? (
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={shareViaNFC}
                  className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                  title="Share via NFC"
                >
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </button>
              </div>
            ) : null}
            <QRCodeSVG
              value={mockLightningInvoice}
              size={200}
              level="H"
              includeMargin={true}
              className="rounded-lg"
            />
          </div>

          <div className="text-center space-y-1 mb-3">
            <p className="text-sm text-gray-600">
              {nfcStatus.supported && nfcStatus.enabled
                ? "Scan QR code or tap device to share"
                : "Scan with your Lightning wallet"}
            </p>
            {nfcStatus.error && (
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                <WifiOff className="w-4 h-4" />
                <span>{nfcStatus.error}</span>
              </div>
            )}
            <p className={cn(
              "text-sm font-medium",
              timeLeft <= 30 ? "text-red-500" : "text-gray-500"
            )}>
              Invoice expires in {formatTimeLeft()}
            </p>
            {paymentStatus === 'processing' && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-blue-600">Processing payment...</span>
              </div>
            )}
            {paymentStatus === 'success' && (
              <p className="text-sm text-green-600">Payment successful!</p>
            )}
            {paymentStatus === 'error' && (
              <p className="text-sm text-red-600">Payment failed. Please try again.</p>
            )}
          </div>

          <button
            onClick={onCancel}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm",
              "bg-gray-200 text-gray-800",
              "hover:bg-gray-300",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
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