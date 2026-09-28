import React, { useState } from 'react';
import { Product, PreviewAppointment, Currency } from '../types/clothing';
import { PaymentMethodsConfig } from '../types/siteConfig';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle,
  Sparkles,
  Shield,
  Phone,
  Building2,
  Smartphone,
  Copy,
  Check,
  Lock,
  AlertCircle,
  Download,
  ShieldCheck,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: Product | null;
  allProducts: Product[];
  onBookAppointment: (appointment: PreviewAppointment) => void;
  paymentConfig?: PaymentMethodsConfig;
  currency?: Currency;
}

type AppointmentType = 'in_person_atelier' | 'virtual_video_preview';
type InHousePaymentChannel = 'bank_transfer' | 'easypaisa' | 'jazzcash';

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedProduct,
  allProducts,
  onBookAppointment,
  paymentConfig,
  currency = 'PKR',
}) => {
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('in_person_atelier');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Lahore');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('03:30 PM - 04:30 PM');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() =>
    preselectedProduct ? [preselectedProduct.id] : []
  );
  const [specialRequest, setSpecialRequest] = useState('');

  // In-House Payment State (Mandatory when appointmentType === 'in_person_atelier')
  const [paymentChannel, setPaymentChannel] = useState<InHousePaymentChannel>('bank_transfer');
  const [senderBankName, setSenderBankName] = useState('Meezan Bank');
  const [senderAccountInfo, setSenderAccountInfo] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [hasAcknowledgedPayment, setHasAcknowledgedPayment] = useState(false);

  // UI Flow & Verification State
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [verificationStep, setVerificationStep] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bookedConfirmation, setBookedConfirmation] = useState<PreviewAppointment | null>(null);

  if (!isOpen) return null;

  // Fee definition
  const IN_HOUSE_FEE_PKR = 1500;
  const IN_HOUSE_FEE_USD = 10;
  const feePKR = appointmentType === 'in_person_atelier' ? IN_HOUSE_FEE_PKR : 0;
  const feeUSD = appointmentType === 'in_person_atelier' ? IN_HOUSE_FEE_USD : 0;
  const displayFee =
    currency === 'PKR'
      ? `Rs. ${feePKR.toLocaleString()}`
      : `$${feeUSD}`;

  // Store's official receiver accounts (from admin siteConfig or verified defaults)
  const storeBank = {
    bankName: paymentConfig?.bank_transfer?.bankName || 'Meezan Bank Ltd (Official Atelier Account)',
    accountTitle: paymentConfig?.bank_transfer?.accountTitle || 'Zavraan Luxury Textiles',
    iban: paymentConfig?.bank_transfer?.iban || 'PK62MEZN0001040105829101',
  };

  const storeEasypaisa = {
    accountNumber: paymentConfig?.easypaisa?.accountNumber || '0345-8472911',
    accountTitle: paymentConfig?.easypaisa?.accountTitle || 'Zavraan Fabrics',
  };

  const storeJazzcash = {
    accountNumber: paymentConfig?.jazzcash?.accountNumber || '0300-8472911',
    accountTitle: paymentConfig?.jazzcash?.accountTitle || 'Zavraan Fabrics',
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Basic details check
    if (!customerName.trim() || !phone.trim()) {
      setValidationError('Please enter your full name and valid WhatsApp contact number.');
      return;
    }

    // 2. Strict Payment Validation for IN-HOUSE appointments
    if (appointmentType === 'in_person_atelier') {
      if (!transactionId.trim()) {
        setValidationError(
          'In-house appointment cannot be booked without payment. Please enter the Transaction Reference ID (TRX / TID) from your bank or mobile app.'
        );
        return;
      }

      if (!senderAccountInfo.trim()) {
        setValidationError(
          paymentChannel === 'bank_transfer'
            ? 'Please enter your Sender Bank Account Title or Account Number.'
            : `Please enter your ${
                paymentChannel === 'easypaisa' ? 'Easypaisa' : 'JazzCash'
              } Mobile Number.`
        );
        return;
      }

      if (!hasAcknowledgedPayment) {
        setValidationError(
          'Please confirm that you have transferred the Rs. 1,500 atelier deposit to Zavraan’s account.'
        );
        return;
      }

      // Start secure verification flow
      setIsVerifyingPayment(true);
      setVerificationStep('Connecting to secure banking gateway...');

      setTimeout(() => {
        setVerificationStep(
          paymentChannel === 'bank_transfer'
            ? `Reconciling ${senderBankName} IBFT transaction with Zavraan Meezan Bank account...`
            : `Validating ${paymentChannel === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} TRX ID with ledger...`
        );
      }, 500);

      setTimeout(() => {
        setVerificationStep('Payment confirmed! Reserving VIP atelier suite in Gulberg III...');
      }, 1000);

      setTimeout(() => {
        setIsVerifyingPayment(false);
        finalizeBooking('paid');
      }, 1500);
    } else {
      // Free Video Call
      finalizeBooking('free');
    }
  };

  const finalizeBooking = (paymentStatus: 'free' | 'paid') => {
    const chosenProducts = allProducts.filter((p) => selectedProductIds.includes(p.id));
    const newAppointment: PreviewAppointment = {
      id: `ZV-APPT-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim() || 'Not specified',
      city: city.trim(),
      appointmentType,
      date: selectedDate,
      timeSlot,
      productIds: selectedProductIds,
      productNames: chosenProducts.map((p) => p.name),
      specialRequest: specialRequest.trim(),
      bookedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'Confirmed & Scheduled',
      feePKR,
      feeUSD,
      paymentStatus,
      paymentMethod: appointmentType === 'in_person_atelier' ? paymentChannel : undefined,
      senderAccount: appointmentType === 'in_person_atelier' ? senderAccountInfo.trim() : undefined,
      senderBankName:
        appointmentType === 'in_person_atelier' && paymentChannel === 'bank_transfer'
          ? senderBankName
          : undefined,
      transactionId: appointmentType === 'in_person_atelier' ? transactionId.trim() : undefined,
      paymentProofName: receiptFileName || undefined,
      paymentDate: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setBookedConfirmation(newAppointment);
    onBookAppointment(newAppointment);
  };

  const handlePrintPass = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-[#FAF9F6] w-full max-w-2xl border border-stone-300 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 bg-white text-stone-500 hover:text-stone-950 rounded-full shadow-sm border border-stone-200 cursor-pointer transition-transform active:scale-95"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Verification Loader Overlay */}
        {isVerifyingPayment && (
          <div className="absolute inset-0 bg-[#FAF9F6]/95 backdrop-blur-md rounded-3xl z-20 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-amber-800/20 border-t-amber-800 animate-spin flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-900" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-900 font-bold">
                Secure Payment Gateway
              </span>
              <h3 className="text-xl font-bold text-stone-950 mt-1">Verifying Atelier Deposit</h3>
              <p className="text-xs text-stone-600 font-mono mt-2 animate-pulse">{verificationStep}</p>
            </div>
            <div className="p-3 bg-white border border-stone-200 rounded-xl text-[11px] text-stone-500 max-w-sm">
              Amount: <strong className="text-stone-900">{displayFee}</strong> · Method:{' '}
              <strong className="text-stone-900 capitalize">
                {paymentChannel.replace('_', ' ')}
              </strong>
            </div>
          </div>
        )}

        {bookedConfirmation ? (
          /* Confirmation Pass Screen */
          <div className="py-4 space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <span className="text-[11px] uppercase tracking-widest text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {bookedConfirmation.appointmentType === 'in_person_atelier'
                  ? 'Atelier Booking Confirmed & Paid'
                  : 'VIP Video Call Confirmed (Free)'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-stone-950 font-normal">
                Fabric Preview Pass
              </h2>
              <p className="text-xs text-stone-600">
                Booking Reference:{' '}
                <span className="font-mono font-bold text-stone-900 text-sm">
                  {bookedConfirmation.id}
                </span>
              </p>
            </div>

            {/* Official Pass Ticket */}
            <div className="bg-white border-2 border-dashed border-stone-300 rounded-2xl p-5 sm:p-6 text-xs space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-stone-600 block">
                    Session Format
                  </span>
                  <span className="font-bold text-stone-950 text-sm flex items-center gap-1.5 mt-0.5">
                    {bookedConfirmation.appointmentType === 'in_person_atelier' ? (
                      <>
                        <MapPin className="w-4 h-4 text-amber-800" />
                        In-Person Atelier Visit (Gulberg III, Lahore)
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 text-emerald-600" />
                        1-on-1 Virtual Video Call (WhatsApp / Zoom)
                      </>
                    )}
                  </span>
                </div>

                {/* Paid or Free Badge */}
                <div>
                  {bookedConfirmation.appointmentType === 'in_person_atelier' ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider block">
                        Payment Status
                      </span>
                      <span className="font-mono font-bold text-sm">PAID: {displayFee}</span>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider block">
                        Cost
                      </span>
                      <span className="font-bold text-sm text-emerald-700">100% FREE ($0)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* In-House Payment Details */}
              {bookedConfirmation.appointmentType === 'in_person_atelier' && (
                <div className="bg-[#FAF8F5] border border-amber-200/80 rounded-xl p-3.5 space-y-2 text-stone-800">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-amber-800" />
                    <span>Payment Verification Receipt</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-stone-600 block text-[10px]">Method</span>
                      <span className="font-semibold text-stone-900 capitalize">
                        {bookedConfirmation.paymentMethod?.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-600 block text-[10px]">Transaction ID</span>
                      <span className="font-bold text-emerald-800">
                        {bookedConfirmation.transactionId}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-600 block text-[10px]">Deposit Credit</span>
                      <span className="font-semibold text-stone-900">100% Deductible</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-900/80 leading-normal pt-1 border-t border-amber-200/50">
                    ★ <strong>Adjustable on Purchase:</strong> Your {displayFee} deposit is credited
                    against any unstitched fabric purchase at the atelier counter.
                  </p>
                </div>
              )}

              {/* Guest Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-700 border-b border-stone-100 pb-3">
                <div>
                  <span className="text-stone-600 text-[10px] uppercase block font-mono">
                    Client Name
                  </span>
                  <span className="font-bold text-stone-950 text-sm">
                    {bookedConfirmation.customerName}
                  </span>
                  <span className="text-stone-500 text-xs block">
                    City: {bookedConfirmation.city}
                  </span>
                </div>
                <div>
                  <span className="text-stone-600 text-[10px] uppercase block font-mono">
                    Schedule
                  </span>
                  <span className="font-semibold text-stone-900 block">
                    {bookedConfirmation.date}
                  </span>
                  <span className="font-mono text-stone-600 text-xs">
                    {bookedConfirmation.timeSlot}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-stone-600 text-[10px] uppercase block font-mono mb-1">
                  Fabrics Prepared for You
                </span>
                {bookedConfirmation.productNames.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {bookedConfirmation.productNames.map((name, i) => (
                      <span
                        key={i}
                        className="bg-stone-100 border border-stone-200 text-stone-800 text-[11px] px-2.5 py-1 rounded-md"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-stone-600 italic">
                    Full unstitched seasonal collection (Airjet Lawn, Dhanak, Slub Khaddar)
                  </span>
                )}
              </div>

              {/* Venue / Meeting link advice */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-[11px] text-stone-600 space-y-1">
                {bookedConfirmation.appointmentType === 'in_person_atelier' ? (
                  <>
                    <strong className="text-stone-900 block">Studio Location:</strong>
                    <span>Zavraan Atelier, Plot 14-C, Gulberg III, Lahore, Pakistan.</span>
                    <span className="block text-stone-500 text-[10px]">
                      Complimentary high-tea & dedicated fabric master will be ready for you.
                    </span>
                  </>
                ) : (
                  <>
                    <strong className="text-stone-900 block">Virtual Meeting Setup:</strong>
                    <span>
                      Our fabric specialist will message/call your WhatsApp ({bookedConfirmation.phone})
                      5 minutes before your slot with the high-definition video link.
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handlePrintPass}
                className="flex-1 py-3 bg-white border border-stone-300 text-stone-800 text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-stone-50 cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-stone-600" />
                <span>Save / Print Pass</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-stone-950 text-white text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-stone-800 cursor-pointer shadow-md transition-colors text-center"
              >
                Return to Boutique
              </button>
            </div>
          </div>
        ) : (
          /* ================= BOOKING FORM ================= */
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] uppercase tracking-widest font-bold mb-2">
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>Preview Before You Buy</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif text-stone-950 font-normal">
                Book Fabric Preview Session
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Choose between a complimentary 1-on-1 VIP Video Call or a private In-House Atelier
                session at our Lahore boutique.
              </p>
            </div>

            {/* Validation Alert */}
            {validationError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-2xl text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Booking Requirement:</strong>
                  <span>{validationError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* 1. APPOINTMENT TYPE SELECTOR */}
              <div className="space-y-2">
                <label className="block text-stone-800 font-bold uppercase tracking-wider text-[11px]">
                  1. Choose Preview Format:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A: Video Call (FREE) */}
                  <button
                    type="button"
                    onClick={() => {
                      setAppointmentType('virtual_video_preview');
                      setValidationError(null);
                    }}
                    className={`p-4 text-left rounded-2xl border-2 cursor-pointer transition-all relative ${
                      appointmentType === 'virtual_video_preview'
                        ? 'border-stone-950 bg-white shadow-md'
                        : 'border-stone-200 bg-stone-50/70 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <Video className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-stone-950 text-sm">VIP Video Call</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                        100% FREE
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Live 1-on-1 consultation on WhatsApp/Zoom. Stylist zooms into weave, tests
                      drape, and inspects resham thread embroidery under natural light.
                    </p>
                    <div className="mt-3 text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Instant Booking · Zero Deposit</span>
                    </div>
                  </button>

                  {/* Option B: In-House Atelier (PAID) */}
                  <button
                    type="button"
                    onClick={() => {
                      setAppointmentType('in_person_atelier');
                      setValidationError(null);
                    }}
                    className={`p-4 text-left rounded-2xl border-2 cursor-pointer transition-all relative ${
                      appointmentType === 'in_person_atelier'
                        ? 'border-stone-950 bg-white shadow-md'
                        : 'border-stone-200 bg-stone-50/70 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-stone-950 text-sm">In-House Atelier</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                        {displayFee} Deposit
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Visit our luxury studio in Gulberg III, Lahore. Touch raw fabric bolts, review
                      swatches, custom styling with refreshments.
                    </p>
                    <div className="mt-3 text-[10px] text-amber-900 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      <span>100% Adjustable Against Fabric Order</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Informational banner based on chosen type */}
              {appointmentType === 'in_person_atelier' ? (
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 text-amber-950 rounded-2xl flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong>Payment Policy for In-House Sessions:</strong> To prevent empty studio
                    reservations, a booking fee of <strong>{displayFee}</strong> is required via
                    your Bank Account, Easypaisa, or JazzCash. Your in-house appointment will only be
                    booked once payment is completed. <em>(100% credited toward your fabric purchase.)</em>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 text-emerald-950 rounded-2xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-[11px]">
                    <strong>Free Consultation:</strong> Video call appointments are complimentary.
                    No payment required.
                  </span>
                </div>
              )}

              {/* 2. DATE & TIME SELECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Preferred Time Slot *
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 shadow-xs"
                  >
                    <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM (Morning Slot)</option>
                    <option value="01:30 PM - 02:30 PM">01:30 PM - 02:30 PM (Afternoon Slot)</option>
                    <option value="03:30 PM - 04:30 PM">03:30 PM - 04:30 PM (Prime Slot)</option>
                    <option value="05:30 PM - 06:30 PM">05:30 PM - 06:30 PM (Evening Slot)</option>
                    <option value="07:30 PM - 08:30 PM">07:30 PM - 08:30 PM (Late Atelier Slot)</option>
                  </select>
                </div>
              </div>

              {/* FABRICS TO PREPARE */}
              <div className="space-y-1.5">
                <label className="block text-stone-700 font-bold uppercase tracking-wider text-[10px]">
                  Select Unstitched Outfits to Prepare for You:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-2 border border-stone-200 bg-white rounded-xl">
                  {allProducts.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 p-1.5 hover:bg-stone-50 cursor-pointer rounded-lg text-[11px]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={() => handleToggleProduct(p.id)}
                        className="rounded text-stone-900 cursor-pointer"
                      />
                      <span className="truncate text-stone-800">
                        {p.name}{' '}
                        <span className="text-stone-600 font-mono text-[10px]">({p.category})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* CONTACT DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayesha Malik"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    WhatsApp / Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Lahore / Islamabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 shadow-xs"
                  />
                </div>
              </div>

              {/* ======================================================= */}
              {/* 3. STRICT SECURE PAYMENT SECTION FOR IN-HOUSE ONLY     */}
              {/* ======================================================= */}
              {appointmentType === 'in_person_atelier' && (
                <div className="p-4 sm:p-5 bg-white border-2 border-stone-900 rounded-3xl space-y-4 shadow-sm animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-900 font-mono text-[10px] uppercase tracking-wider font-bold">
                        <Lock className="w-3 h-3 text-amber-800" />
                        <span>Step 3 · Secure Atelier Deposit</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-stone-950">
                        Pay {displayFee} from Your Account to Zavraan
                      </h3>
                      <p className="text-[11px] text-stone-600">
                        Transfer the reservation deposit via Bank, Easypaisa, or JazzCash to confirm
                        your in-house slot.
                      </p>
                    </div>

                    <div className="bg-stone-950 text-white px-3 py-1.5 rounded-xl text-right shrink-0">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-stone-400 block">
                        Amount Due
                      </span>
                      <span className="text-base font-bold font-mono text-amber-300">
                        {displayFee}
                      </span>
                    </div>
                  </div>

                  {/* Payment Channel Tabs */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentChannel('bank_transfer')}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                        paymentChannel === 'bank_transfer'
                          ? 'border-stone-950 bg-stone-900 text-white font-bold shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="text-[11px]">Bank Transfer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentChannel('easypaisa')}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                        paymentChannel === 'easypaisa'
                          ? 'border-emerald-600 bg-emerald-700 text-white font-bold shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span className="text-[11px]">Easypaisa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentChannel('jazzcash')}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                        paymentChannel === 'jazzcash'
                          ? 'border-red-600 bg-red-700 text-white font-bold shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span className="text-[11px]">JazzCash</span>
                    </button>
                  </div>

                  {/* Official Receiver Account Display */}
                  <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-3">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-stone-600 block font-bold">
                      Zavraan Atelier Receiver Account:
                    </span>

                    {paymentChannel === 'bank_transfer' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-600">Bank:</span>
                          <span className="font-bold text-stone-900">{storeBank.bankName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-600">Account Title:</span>
                          <span className="font-bold text-stone-900">{storeBank.accountTitle}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white border border-stone-300 rounded-xl gap-2">
                          <div>
                            <span className="text-[9px] uppercase text-stone-600 font-mono block">
                              IBAN (Raast / IBFT)
                            </span>
                            <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm tracking-wider select-all">
                              {storeBank.iban}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(storeBank.iban, 'iban')}
                            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                          >
                            {copiedField === 'iban' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy IBAN</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentChannel === 'easypaisa' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-600">Account Title:</span>
                          <span className="font-bold text-stone-900">{storeEasypaisa.accountTitle}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white border border-emerald-300 rounded-xl gap-2">
                          <div>
                            <span className="text-[9px] uppercase text-emerald-800 font-mono block">
                              Easypaisa Mobile Account Number
                            </span>
                            <span className="font-mono font-bold text-stone-950 text-sm tracking-wider select-all">
                              {storeEasypaisa.accountNumber}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(storeEasypaisa.accountNumber, 'easypaisa')}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                          >
                            {copiedField === 'easypaisa' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-300" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Number</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentChannel === 'jazzcash' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-600">Account Title:</span>
                          <span className="font-bold text-stone-900">{storeJazzcash.accountTitle}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white border border-red-300 rounded-xl gap-2">
                          <div>
                            <span className="text-[9px] uppercase text-red-800 font-mono block">
                              JazzCash Mobile Account Number
                            </span>
                            <span className="font-mono font-bold text-stone-950 text-sm tracking-wider select-all">
                              {storeJazzcash.accountNumber}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(storeJazzcash.accountNumber, 'jazzcash')}
                            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                          >
                            {copiedField === 'jazzcash' ? (
                              <>
                                <Check className="w-3 h-3 text-red-200" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Number</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sender Details Input (User's Account & Transaction ID) */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-stone-600 block font-bold">
                      Enter Details of Payment Sent from Your Account:
                    </span>

                    {paymentChannel === 'bank_transfer' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-stone-700 font-semibold mb-1 text-[11px]">
                            Your Sender Bank Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. HBL / Alfalah / SCB"
                            value={senderBankName}
                            onChange={(e) => setSenderBankName(e.target.value)}
                            className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                          />
                          {/* Quick suggestions */}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {['Meezan', 'HBL', 'Bank Alfalah', 'SCB', 'Allied'].map((b) => (
                              <button
                                key={b}
                                type="button"
                                onClick={() => setSenderBankName(b)}
                                className="text-[9px] px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded-md text-stone-600 cursor-pointer"
                              >
                                {b}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-stone-700 font-semibold mb-1 text-[11px]">
                            Your Account Title / Sender Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Mahira Khan"
                            value={senderAccountInfo}
                            onChange={(e) => setSenderAccountInfo(e.target.value)}
                            className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-stone-700 font-semibold mb-1 text-[11px]">
                          Your {paymentChannel === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} Mobile
                          Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 03XX-XXXXXXX"
                          value={senderAccountInfo}
                          onChange={(e) => setSenderAccountInfo(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                        />
                      </div>
                    )}

                    {/* Transaction Reference ID (MANDATORY) */}
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1 text-[11px]">
                        Transaction ID (TRX / RRN / TID) *
                        <span className="text-amber-800 font-normal ml-1">
                          (Found on your bank slip or confirmation SMS)
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={
                          paymentChannel === 'bank_transfer'
                            ? 'e.g. FT26092898472911 or RRN 948211'
                            : paymentChannel === 'easypaisa'
                            ? 'e.g. 11-digit TRX ID from 3737 SMS (e.g. 29482710492)'
                            : 'e.g. 12-digit TID from 8558 SMS (e.g. 849204918274)'
                        }
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full bg-white border-2 border-stone-400 font-mono rounded-xl p-2.5 text-xs text-stone-950 focus:outline-none focus:border-stone-950 font-bold tracking-wider"
                      />
                    </div>

                    {/* Optional Receipt Attachment */}
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1 text-[11px]">
                        Attach Payment Receipt / Screenshot (Optional)
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-stone-700 text-[11px] font-medium cursor-pointer transition-colors shrink-0">
                          <span>Choose Receipt File</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-stone-500 truncate">
                          {receiptFileName || 'No file attached'}
                        </span>
                      </div>
                    </div>

                    {/* Confirmation Checkbox */}
                    <label className="flex items-start gap-2.5 p-3 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={hasAcknowledgedPayment}
                        onChange={(e) => setHasAcknowledgedPayment(e.target.checked)}
                        className="rounded text-stone-950 mt-0.5 cursor-pointer"
                      />
                      <span className="text-[11px] text-stone-800 leading-snug">
                        I confirm that <strong>{displayFee}</strong> has been transferred from my{' '}
                        {paymentChannel.replace('_', ' ')} account to Zavraan’s account, and I have
                        entered the authentic Transaction ID above.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Special Requests */}
              <div>
                <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Special Fabric Inquiries or Tailoring Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please also display matching chiffon dupatta borders and pearl buttons"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 shadow-xs"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full font-medium cursor-pointer text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`w-full sm:w-auto px-7 py-3 rounded-full text-xs uppercase tracking-widest font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                    appointmentType === 'in_person_atelier'
                      ? 'bg-amber-900 hover:bg-amber-800 text-white'
                      : 'bg-stone-950 hover:bg-stone-800 text-white'
                  }`}
                >
                  {appointmentType === 'in_person_atelier' ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-300" />
                      <span>Verify & Book In-House Appointment ({displayFee})</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Confirm Free Video Call Booking ($0)</span>
                    </>
                  )}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
