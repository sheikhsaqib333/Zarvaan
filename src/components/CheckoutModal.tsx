import React, { useState } from 'react';
import { CartItem, Currency, OrderConfirmation, PaymentMethod } from '../types/clothing';
import { PaymentMethodsConfig } from '../types/siteConfig';
import { X, CheckCircle, Truck, CreditCard, Banknote, ShieldCheck, Printer, ArrowLeft, Smartphone, Building2, Store, QrCode } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  discount: number;
  promoCode: string;
  onOrderCompleted: () => void;
  paymentConfig?: PaymentMethodsConfig;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  discount,
  promoCode,
  onOrderCompleted,
  paymentConfig,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() => {
    if (paymentConfig?.cod?.enabled !== false) return 'cod';
    if (paymentConfig?.pay_at_studio?.enabled) return 'pay_at_studio';
    if (paymentConfig?.bank_transfer?.enabled) return 'bank_transfer';
    if (paymentConfig?.jazzcash?.enabled) return 'jazzcash';
    if (paymentConfig?.easypaisa?.enabled) return 'easypaisa';
    if (paymentConfig?.nayapay_sadapay?.enabled) return 'nayapay_sadapay';
    if (paymentConfig?.card?.enabled) return 'card';
    return 'cod';
  });
  
  // Specific payment method details
  const [mobileWalletNumber, setMobileWalletNumber] = useState('');
  const [bankReference, setBankReference] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [orderComplete, setOrderComplete] = useState<OrderConfirmation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const rawSubtotal = items.reduce((sum, item) => {
    const itemPrice = currency === 'PKR' ? item.itemPricePKR : item.itemPriceUSD;
    return sum + itemPrice * item.quantity;
  }, 0);

  const freeShippingThreshold = currency === 'PKR' ? 7500 : 30;
  const isFreeShipping = rawSubtotal >= freeShippingThreshold || paymentMethod === 'pay_at_studio';
  const shippingFee = isFreeShipping ? 0 : currency === 'PKR' ? 350 : 8;
  const finalTotal = rawSubtotal - discount + shippingFee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      setFormError('Please enter your full name and contact phone number.');
      return;
    }

    if (paymentMethod !== 'pay_at_studio' && !address.trim()) {
      setFormError('Please provide your street delivery address.');
      return;
    }

    if ((paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && !mobileWalletNumber.trim()) {
      setFormError('Please enter your mobile account number for wallet processing.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      let ref = undefined;
      if (paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') {
        ref = `Wallet: ${mobileWalletNumber}`;
      } else if (paymentMethod === 'bank_transfer') {
        ref = bankReference || 'Reference Pending';
      } else if (paymentMethod === 'card') {
        ref = `Card ending in ${cardNumber.slice(-4) || '4242'}`;
      }

      const generatedOrder: OrderConfirmation = {
        orderId: `ZV-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName,
        phone,
        email: email || 'Not provided',
        address: paymentMethod === 'pay_at_studio' ? 'Self-Pickup: Zavraan Studio, Gulberg III, Lahore' : address,
        city,
        paymentMethod,
        paymentReference: ref,
        items: [...items],
        subtotal: rawSubtotal,
        discount,
        shipping: shippingFee,
        total: finalTotal,
        currency,
        orderDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
      setOrderComplete(generatedOrder);
      setIsSubmitting(false);
      onOrderCompleted();
    }, 600);
  };

  const getPaymentLabel = (m: PaymentMethod) => {
    switch (m) {
      case 'cod':
        return 'Cash on Delivery (Pay rider upon arrival)';
      case 'pay_at_studio':
        return 'Pay at Atelier / Studio Counter (Self Pickup)';
      case 'bank_transfer':
        return 'Direct Bank Transfer / Wire (Meezan / HBL)';
      case 'jazzcash':
        return 'JazzCash Mobile Account';
      case 'easypaisa':
        return 'Easypaisa Mobile Wallet';
      case 'nayapay_sadapay':
        return 'NayaPay / SadaPay Digital Transfer';
      case 'card':
        return 'Online Debit / Credit Card (Visa, MasterCard, PayPak)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-[#FAF9F5] w-full max-w-2xl border border-stone-200 shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white text-stone-600 hover:text-stone-950 rounded-full shadow-xs cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {orderComplete ? (
          /* Confirmation Receipt */
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-amber-900 font-semibold">
                Order Confirmed & Logged
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 font-normal mt-1">
                Thank You, {orderComplete.customerName}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Your unstitched package <strong className="font-mono text-stone-900">{orderComplete.orderId}</strong> has been assigned to our packaging atelier.
              </p>
            </div>

            {/* Receipt Details Box */}
            <div className="bg-white border border-stone-200 p-5 text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Order ID:</span>
                <span className="font-mono font-semibold text-stone-900">{orderComplete.orderId}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Delivery Address:</span>
                <span className="text-stone-900 text-right">{orderComplete.address}, {orderComplete.city}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">WhatsApp / Phone:</span>
                <span className="font-mono text-stone-900">{orderComplete.phone}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Payment Method:</span>
                <span className="font-medium text-stone-900">{getPaymentLabel(orderComplete.paymentMethod)}</span>
              </div>
              {orderComplete.paymentReference && (
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-500">Reference:</span>
                  <span className="font-mono text-stone-700">{orderComplete.paymentReference}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold text-stone-900 pt-1">
                <span>Total Amount:</span>
                <span className="font-mono tabular-nums text-base">
                  {orderComplete.currency === 'PKR'
                    ? `PKR ${orderComplete.total.toLocaleString()}`
                    : `$${orderComplete.total.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="p-3 bg-stone-100 border border-stone-200 text-xs text-stone-600 flex items-center justify-center gap-2">
              <Truck className="w-4 h-4 text-amber-900" />
              <span>
                {orderComplete.paymentMethod === 'pay_at_studio'
                  ? 'Your unstitched box will be ready for pickup at our Gulberg III Studio within 24 hours.'
                  : 'Courier dispatch via Leopard / TCS Express (Estimated 3-4 working days).'}
              </span>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-stone-300 bg-white text-stone-800 text-xs uppercase tracking-wider font-medium hover:border-stone-900 flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-stone-800 cursor-pointer"
              >
                Return to Store
              </button>
            </div>
          </div>
        ) : (
          /* Form Stage */
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-900 font-semibold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Omni-Payment Checkout</span>
            </div>

            <h2 className="text-2xl font-serif text-stone-900 font-normal">
              Finalize Your Unstitched Order
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              We support all online digital platforms as well as offline payment and studio pickups.
            </p>

            {formError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="mt-5 space-y-4 text-xs">
              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatima Tariq"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-stone-300 p-2 text-xs text-stone-900 focus:outline-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-stone-300 p-2 text-xs text-stone-900 focus:outline-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Email (for tracking dispatch)</label>
                <input
                  type="email"
                  placeholder="e.g. fatima@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2 text-xs text-stone-900 focus:outline-stone-800"
                />
              </div>

              {/* Delivery Address (Hidden if paying/pickup at studio) */}
              {paymentMethod !== 'pay_at_studio' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-medium mb-1">Delivery Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="House / Street / Sector / Area"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white border border-stone-300 p-2 text-xs text-stone-900 focus:outline-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">City *</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-stone-300 p-2 text-xs text-stone-900 focus:outline-stone-800"
                    >
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Sialkot">Sialkot</option>
                      <option value="Gujranwala">Gujranwala</option>
                      <option value="Other">Other City</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/70 border border-amber-200 text-stone-800 flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-900 shrink-0" />
                  <span>
                    Pickup Location: <strong>{paymentConfig?.pay_at_studio?.address || 'Zavraan Luxury Studio, Plot 14-C, Gulberg III, Lahore'}</strong>. You will pay at the reception counter.
                  </span>
                </div>
              )}

              {/* Multi-Platform Payment Selector */}
              <div>
                <label className="block text-stone-800 font-semibold mb-2 uppercase tracking-wider text-[11px]">
                  Select Payment Method (Online & Offline Platforms)
                </label>

                {/* Offline Options */}
                <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1">
                  Offline Options:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  {paymentConfig?.cod?.enabled !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 border text-left cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-stone-900 bg-white font-semibold shadow-xs'
                          : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                      }`}
                    >
                      <Banknote className="w-4 h-4 mb-1 text-emerald-700" />
                      <span className="block text-stone-900">{paymentConfig?.cod?.title || 'Cash on Delivery'}</span>
                      <span className="text-[10px] text-stone-500">{paymentConfig?.cod?.instructions || 'Pay cash upon delivery'}</span>
                    </button>
                  )}

                  {paymentConfig?.pay_at_studio?.enabled !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pay_at_studio')}
                      className={`p-2.5 border text-left cursor-pointer transition-all ${
                        paymentMethod === 'pay_at_studio'
                          ? 'border-stone-900 bg-white font-semibold shadow-xs'
                          : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                      }`}
                    >
                      <Store className="w-4 h-4 mb-1 text-amber-800" />
                      <span className="block text-stone-900">{paymentConfig?.pay_at_studio?.title || 'Pay at Studio'}</span>
                      <span className="text-[10px] text-stone-500">Inspect & pay on pickup</span>
                    </button>
                  )}

                  {paymentConfig?.bank_transfer?.enabled !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-2.5 border text-left cursor-pointer transition-all ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-stone-900 bg-white font-semibold shadow-xs'
                          : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                      }`}
                    >
                      <Building2 className="w-4 h-4 mb-1 text-stone-700" />
                      <span className="block text-stone-900">{paymentConfig?.bank_transfer?.title || 'Bank Transfer / Wire'}</span>
                      <span className="text-[10px] text-stone-500">Official bank transfer</span>
                    </button>
                  )}
                </div>

                {/* Online Platforms */}
                <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1">
                  Online Platforms & Wallets:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {paymentConfig?.jazzcash?.enabled !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('jazzcash')}
                      className={`p-2.5 border text-left cursor-pointer transition-all ${
                        paymentMethod === 'jazzcash'
                          ? 'border-stone-900 bg-white font-semibold shadow-xs'
                          : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 mb-1 text-red-600" />
                      <span className="block text-stone-900">{paymentConfig?.jazzcash?.title || 'JazzCash'}</span>
                      <span className="text-[10px] text-stone-500">Mobile Wallet</span>
                    </button>
                  )}

                  {paymentConfig?.easypaisa?.enabled !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('easypaisa')}
                      className={`p-2.5 border text-left cursor-pointer transition-all ${
                        paymentMethod === 'easypaisa'
                          ? 'border-stone-900 bg-white font-semibold shadow-xs'
                          : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 mb-1 text-green-600" />
                      <span className="block text-stone-900">{paymentConfig?.easypaisa?.title || 'Easypaisa'}</span>
                      <span className="text-[10px] text-stone-500">Mobile Wallet</span>
                    </button>
                  )}

                  {paymentConfig?.nayapay_sadapay?.enabled !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('nayapay_sadapay')}
                      className={`p-2.5 border text-left cursor-pointer transition-all ${
                        paymentMethod === 'nayapay_sadapay'
                          ? 'border-stone-900 bg-white font-semibold shadow-xs'
                          : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                      }`}
                    >
                      <QrCode className="w-4 h-4 mb-1 text-teal-700" />
                      <span className="block text-stone-900">{paymentConfig?.nayapay_sadapay?.title || 'NayaPay / SadaPay'}</span>
                      <span className="text-[10px] text-stone-500">Instant Wallet ID</span>
                    </button>
                  )}

                  {paymentConfig?.card?.enabled !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 border text-left cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-stone-900 bg-white font-semibold shadow-xs'
                          : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mb-1 text-indigo-700" />
                      <span className="block text-stone-900">{paymentConfig?.card?.title || 'Debit / Credit Card'}</span>
                      <span className="text-[10px] text-stone-500">{paymentConfig?.card?.note || 'Visa, MC, PayPak'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-panels for selected payment method */}
              {paymentMethod === 'bank_transfer' && (
                <div className="p-3 bg-stone-100 border border-stone-200 text-stone-700 space-y-1">
                  <p className="font-semibold text-stone-900">
                    {paymentConfig?.bank_transfer?.bankName || 'Meezan Bank Ltd (Official Atelier Account)'}
                  </p>
                  <p>Account Title: <strong>{paymentConfig?.bank_transfer?.accountTitle || 'Zavraan Luxury Textiles'}</strong></p>
                  <p className="font-mono text-[11px]">
                    IBAN: {paymentConfig?.bank_transfer?.iban || 'PK62MEZN0001040105829101'}
                  </p>
                  <div className="pt-2">
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Bank Transaction / Sender Reference (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Transaction ID or account holder name"
                      value={bankReference}
                      onChange={(e) => setBankReference(e.target.value)}
                      className="w-full bg-white border border-stone-300 p-1.5 text-xs"
                    />
                  </div>
                </div>
              )}

              {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
                <div className="p-3 bg-stone-100 border border-stone-200 text-stone-700 space-y-2">
                  <p className="font-semibold text-stone-900">
                    {paymentMethod === 'jazzcash'
                      ? (paymentConfig?.jazzcash?.title || 'JazzCash')
                      : (paymentConfig?.easypaisa?.title || 'Easypaisa')} Direct Transfer / Prompt
                  </p>
                  {(paymentMethod === 'jazzcash' ? paymentConfig?.jazzcash?.accountNumber : paymentConfig?.easypaisa?.accountNumber) && (
                    <div className="text-xs bg-white p-2 border border-stone-200">
                      <p>Atelier Account: <strong className="font-mono">{paymentMethod === 'jazzcash' ? paymentConfig?.jazzcash?.accountNumber : paymentConfig?.easypaisa?.accountNumber}</strong></p>
                      <p>Account Title: <strong>{paymentMethod === 'jazzcash' ? paymentConfig?.jazzcash?.accountTitle : paymentConfig?.easypaisa?.accountTitle}</strong></p>
                    </div>
                  )}
                  <label className="block text-[11px] font-medium text-stone-700">
                    Enter your registered mobile account number:
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0301-2345678"
                    value={mobileWalletNumber}
                    onChange={(e) => setMobileWalletNumber(e.target.value)}
                    className="w-full bg-white border border-stone-300 p-2 text-xs"
                  />
                  <p className="text-[11px] text-stone-500">
                    You will receive an approval push prompt or OTP to authenticate.
                  </p>
                </div>
              )}

              {paymentMethod === 'nayapay_sadapay' && (
                <div className="p-3 bg-stone-100 border border-stone-200 text-stone-700 space-y-1">
                  <p className="font-semibold text-stone-900">Transfer to Zavraan SadaPay/NayaPay Handle</p>
                  <p>SadaPay / NayaPay ID: <strong className="font-mono text-stone-900">{paymentConfig?.nayapay_sadapay?.handle || '@zavraan.official'}</strong></p>
                  <p className="text-[11px] text-stone-500">
                    Zero interbank transaction charges. Order is confirmed upon receipt.
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-3 bg-stone-100 border border-stone-200 space-y-2">
                  <div>
                    <label className="block text-[11px] text-stone-600 font-medium mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 •••• •••• ••••"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-stone-300 p-1.5 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-stone-600 font-medium mb-1">MM/YY</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border border-stone-300 p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-600 font-medium mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-white border border-stone-300 p-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Breakdown Box */}
              <div className="p-3 bg-white border border-stone-200 space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} unstitched sets):</span>
                  <span className="font-mono tabular-nums">
                    {currency === 'PKR' ? `PKR ${rawSubtotal.toLocaleString()}` : `$${rawSubtotal.toFixed(2)}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Voucher ({promoCode}):</span>
                    <span className="font-mono tabular-nums">
                      - {currency === 'PKR' ? `PKR ${discount.toLocaleString()}` : `$${discount.toFixed(2)}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>
                    {paymentMethod === 'pay_at_studio'
                      ? 'Self-Pickup (Free)'
                      : isFreeShipping
                      ? 'Free Express Shipping'
                      : currency === 'PKR'
                      ? 'PKR 350'
                      : '$8.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-stone-900 pt-1.5 border-t border-stone-200">
                  <span>Total Payable:</span>
                  <span className="font-mono text-base tabular-nums">
                    {currency === 'PKR' ? `PKR ${finalTotal.toLocaleString()}` : `$${finalTotal.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs text-stone-600 hover:text-stone-950 cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Bag</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 text-white py-3 px-6 text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Confirming Dispatch...' : `Confirm & Place Order`}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
