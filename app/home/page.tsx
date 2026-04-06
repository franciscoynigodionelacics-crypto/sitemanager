'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/alt-text */

import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'next/navigation';
import { getOrCreateBuyerAuthId } from '../../lib/hopecard-session';

const SearchIcon = ({ color = '#888', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const CartIcon = ({ color = '#FFF', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const MenuIcon = ({ color = '#333', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const UserIcon = ({ color = '#333', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const ReceiptIcon = ({ color = '#333', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const SettingsIcon = ({ color = '#333', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const CloseIcon = ({ color = '#A0A0A0', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const CreditCardIcon = ({ color = '#FFF', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

const CheckIcon = ({ color = '#FFF', size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const CopyIcon = ({ color = '#888', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const ChevronIcon = ({ color = '#888', size = 16, direction = 'down' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: direction === 'up' ? 'rotate(180deg)' : 'none' }}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

type DonationCard = {
  id: string;
  title: string;
  desc: string;
  amount: string;
  manager: string;
  img: string;
  amountOptions: number[];
};

type CartItem = {
  id: string;
  cardId: string;
  title: string;
  img: string;
  amount: number;
  quantity: number;
  manager: string;
};

const DONATION_CARDS: DonationCard[] = [
  { id: '1', title: 'Support Families in Need', desc: 'Help provide essential supplies and support to families facing hardship in our community.', amount: '500 php', manager: 'Maria Santos', img: '/img_6.png', amountOptions: [50, 100, 200, 400, 550, 600, 900, 1000] },
  { id: '2', title: 'Feed the Hungry', desc: 'Provide nutritious meals to those experiencing food insecurity in local communities.', amount: '1000 php', manager: 'Daniel Cruz', img: '/img_7.png', amountOptions: [50, 100, 200, 400, 550, 600, 900, 1000] },
  { id: '3', title: 'Education for all', desc: 'Support educational programs and provide learning materials for underprivileged children.', amount: '750 php', manager: 'Anna Reyes', img: '/img_8.png', amountOptions: [50, 100, 200, 400, 550, 600, 900, 1000] },
  { id: '4', title: 'Medical Assistance Fund', desc: 'Help provide medical care and treatment for those who cannot afford healthcare services.', amount: '2,400 php', manager: 'Carlo Mendoza', img: '/img_9.png', amountOptions: [50, 100, 200, 400, 550, 600, 900, 1000] },
  { id: '5', title: 'Disaster Relief Support', desc: 'Provide emergency assistance to communities affected by natural disasters and crises.', amount: '1,500 php', manager: 'Elaine Torres', img: '/img_10.png', amountOptions: [50, 100, 200, 400, 550, 600, 900, 1000] },
  { id: '6', title: 'Environmental Conservation', desc: 'Support efforts to protect and preserve our natural environment for future generations.', amount: '800 php', manager: 'Noel Garcia', img: '/img_11.png', amountOptions: [50, 100, 200, 400, 550, 600, 900, 1000] },
];

const PAYMENT_METHODS = ['Gcash', 'Paymaya', 'Credit Card'];
const ACCENT_PINK = '#D98686';

const formatPhp = (amount: number) => `₱${amount.toLocaleString()}`;

export default function HomeScreen() {
  const router = useRouter();

  const [isExiting, setIsExiting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<DonationCard | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'selection' | 'success'>('selection');
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [latestPaymentReference, setLatestPaymentReference] = useState('');

  const filteredCards = DONATION_CARDS.filter(
    (card) =>
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const payableTotal = useMemo(() => (selectedAmount ?? 0) * quantity, [selectedAmount, quantity]);
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.amount * item.quantity, 0),
    [cartItems]
  );
  const checkoutTotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.amount * item.quantity, 0),
    [checkoutItems]
  );

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    setIsExiting(true);
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  const openDetailsModal = (card: DonationCard) => {
    setSelectedCard(card);
    setSelectedAmount(card.amountOptions[0] ?? null);
    setQuantity(1);
    setPaymentMethod('');
    setPaymentError('');
    setIsDropdownOpen(false);
    setPaymentStep('selection');
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
  };

  const addCurrentSelectionToCart = () => {
    if (!selectedCard || !selectedAmount) {
      return;
    }

    const cartItem: CartItem = {
      id: `${selectedCard.id}-${selectedAmount}-${Date.now()}`,
      cardId: selectedCard.id,
      title: selectedCard.title,
      img: selectedCard.img,
      amount: selectedAmount,
      quantity,
      manager: selectedCard.manager,
    };

    setCartItems((current) => [...current, cartItem]);
    setIsDetailsModalOpen(false);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((current) => current.filter((item) => item.id !== itemId));
  };

  const changePaymentStep = (newStep: 'selection' | 'success') => {
    setIsStepTransitioning(true);
    setTimeout(() => {
      setPaymentStep(newStep);
      setIsStepTransitioning(false);
    }, 250);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setIsDropdownOpen(false);
    setTimeout(() => {
      setPaymentStep('selection');
      setPaymentMethod('');
      setPaymentError('');
      setLatestPaymentReference('');
      setCheckoutItems([]);
    }, 300);
  };

  const proceedToPayment = () => {
    if (!selectedCard || !selectedAmount) {
      return;
    }

    setPaymentError('');
    setCheckoutItems([
      {
        id: `${selectedCard.id}-${selectedAmount}-checkout`,
        cardId: selectedCard.id,
        title: selectedCard.title,
        img: selectedCard.img,
        amount: selectedAmount,
        quantity,
        manager: selectedCard.manager,
      },
    ]);
    setIsDetailsModalOpen(false);
    setTimeout(() => {
      setIsPaymentModalOpen(true);
    }, 180);
  };

  const proceedCartToPayment = () => {
    if (cartItems.length === 0) {
      return;
    }

    setPaymentError('');
    setCheckoutItems(cartItems);
    setIsCartOpen(false);
    setTimeout(() => {
      setIsPaymentModalOpen(true);
    }, 180);
  };

  const submitPayment = async () => {
    if (!paymentMethod || checkoutItems.length === 0) {
      return;
    }

    const buyerAuthId = getOrCreateBuyerAuthId();
    if (!buyerAuthId) {
      setPaymentError('Unable to create a donor session. Please refresh and try again.');
      return;
    }

    setIsSubmittingPayment(true);
    setPaymentError('');

    try {
      const response = await fetch('/api/hopecard-purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerAuthId,
          paymentMethod,
          checkoutItems: checkoutItems.map((item) => ({
            cardId: item.cardId,
            title: item.title,
            amount: item.amount,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        purchases?: Array<{ payment_reference: string }>;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Payment could not be saved to Supabase.');
      }

      setLatestPaymentReference(data.purchases?.[0]?.payment_reference ?? '');
      changePaymentStep('success');
      setCartItems((current) => current.filter((item) => !checkoutItems.some((checkoutItem) => checkoutItem.id === item.id)));
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Payment could not be saved to Supabase.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <View
      style={[
        styles.masterContainer,
        {
          opacity: isExiting ? 0 : 1,
          transform: [{ translateY: isExiting ? 15 : 0 }],
        },
      ]}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={{ uri: '/logo_h.png' }} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.logoText}>Hopecard</Text>
          </View>

          <View style={styles.headerRight}>
            {isMenuOpen && <Pressable style={styles.invisibleBackdrop} onPress={() => setIsMenuOpen(false)} />}

            <View style={styles.menuContainer}>
              <Pressable style={styles.menuButton} onPress={() => setIsMenuOpen(!isMenuOpen)}>
                <View style={{ marginRight: 8 }}>
                  <MenuIcon color="#333" size={24} />
                </View>
                <Text style={styles.menuText}>Menu</Text>
              </Pressable>

              {isMenuOpen && (
                <View style={styles.navDropdown}>
                  <Pressable
                    style={({ pressed }: { pressed: boolean }) => [styles.navDropdownItem, pressed && { backgroundColor: '#F5F5F5' }]}
                    onPress={() => handleNavigate('/profile')}
                  >
                    <View style={styles.navDropdownIconWrapper}>
                      <UserIcon color="#333" size={18} />
                    </View>
                    <Text style={styles.navDropdownText}>Donor Profile</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }: { pressed: boolean }) => [styles.navDropdownItem, pressed && { backgroundColor: '#F5F5F5' }]}
                    onPress={() => handleNavigate('/transactions')}
                  >
                    <View style={styles.navDropdownIconWrapper}>
                      <ReceiptIcon color="#333" size={18} />
                    </View>
                    <Text style={styles.navDropdownText}>Transactions</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }: { pressed: boolean }) => [styles.navDropdownItem, pressed && { backgroundColor: '#F5F5F5' }]}
                    onPress={() => {
                      setIsMenuOpen(false);
                      console.log('Going to Settings');
                    }}
                  >
                    <View style={styles.navDropdownIconWrapper}>
                      <SettingsIcon color="#333" size={18} />
                    </View>
                    <Text style={styles.navDropdownText}>Settings</Text>
                  </Pressable>
                </View>
              )}
            </View>

            <Pressable style={styles.cartButton} onPress={() => setIsCartOpen(true)}>
              <View style={{ marginRight: 8 }}>
                <CartIcon color="#FFF" size={18} />
              </View>
              <Text style={styles.cartText}>Cart {cartItems.length > 0 ? `(${cartItems.length})` : ''}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.pageTitle}>Browse Donation Cards</Text>
          <Text style={styles.pageSubtitle}>Support meaningful causes and make an impact in different communities</Text>

          <View style={styles.searchContainer}>
            <View style={{ marginRight: 15 }}>
              <SearchIcon color="#888" size={20} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for donation cards"
              placeholderTextColor="#A0A0A0"
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
          </View>

          <Text style={styles.resultsText}>
            <Text style={{ fontWeight: 'bold' }}>{filteredCards.length}</Text> Cards found
          </Text>

          <View style={styles.gridContainer}>
            {filteredCards.map((card) => (
              <Pressable
                key={card.id}
                style={({ pressed }: { pressed: boolean }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => openDetailsModal(card)}
              >
                <Image source={{ uri: card.img }} style={styles.cardImage} resizeMode="cover" />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardDesc}>{card.desc}</Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.viewDetailsButton}>
                      <Text style={styles.viewDetailsText}>View Details</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}

            {filteredCards.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No donation cards match &quot;{searchQuery}&quot;</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View pointerEvents={isCartOpen ? 'auto' : 'none'} style={styles.overlayContainer}>
        <Pressable style={[styles.backdrop, { opacity: isCartOpen ? 1 : 0 }]} onPress={() => setIsCartOpen(false)} />

        <View style={[styles.sidebar, { transform: [{ translateX: isCartOpen ? 0 : 450 }] }]}>
          <View style={styles.sidebarHeader}>
            <View style={styles.cartIconCircle}>
              <CartIcon color="#6A1B1B" size={22} />
            </View>
            <View>
              <Text style={styles.sidebarTitle}>Your Cart</Text>
              <Text style={styles.sidebarSubtitle}>{cartItems.length} item{cartItems.length !== 1 && 's'}</Text>
            </View>
          </View>

          <ScrollView style={styles.cartItemsList}>
            {cartItems.length === 0 ? (
              <Text style={styles.emptyCartText}>Your cart is empty.</Text>
            ) : (
              cartItems.map((item) => (
                <View key={item.id} style={styles.cartItemCard}>
                  <Image source={{ uri: item.img }} style={styles.cartItemImage} resizeMode="cover" />
                  <View style={styles.cartItemInfo}>
                    <View style={styles.cartItemTitleRow}>
                      <Text style={styles.cartItemTitle} numberOfLines={2}>{item.title}</Text>
                      <Pressable onPress={() => removeFromCart(item.id)} style={({ pressed }: { pressed: boolean }) => [styles.removeButton, pressed && { opacity: 0.5 }]}>
                        <CloseIcon color="#A0A0A0" size={16} />
                      </Pressable>
                    </View>
                    <Text style={styles.cartItemManager}>Campaign Manager: {item.manager}</Text>
                    <View style={styles.cartItemPriceRow}>
                      <Text style={styles.cartItemAmountLabel}>{formatPhp(item.amount)} x {item.quantity}</Text>
                      <Text style={styles.cartItemAmountValue}>{formatPhp(item.amount * item.quantity)}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.checkoutSection}>
            <View style={styles.totalsCard}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal</Text>
                <Text style={styles.totalsValue}>{formatPhp(cartTotal)}</Text>
              </View>
              <View style={styles.line} />
              <View style={styles.totalsRow}>
                <Text style={styles.totalBoldLabel}>Total</Text>
                <Text style={styles.totalBoldValue}>{formatPhp(cartTotal)}</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }: { pressed: boolean }) => [
                styles.checkoutButton,
                cartItems.length === 0 && { opacity: 0.5 },
                pressed && cartItems.length > 0 && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
              onPress={proceedCartToPayment}
            >
              <View style={styles.buttonInnerContent}>
                <View style={{ marginRight: 10 }}>
                  <CreditCardIcon color="#FFF" size={20} />
                </View>
                <Text style={styles.checkoutButtonText}>Proceed to Payment</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      <View pointerEvents={isDetailsModalOpen ? 'auto' : 'none'} style={styles.overlayContainer}>
        <Pressable style={[styles.backdrop, { opacity: isDetailsModalOpen ? 1 : 0 }]} onPress={closeDetailsModal} />

        <View
          style={[
            styles.detailsModalCard,
            {
              opacity: isDetailsModalOpen ? 1 : 0,
              transform: [{ scale: isDetailsModalOpen ? 1 : 0.96 }, { translateY: isDetailsModalOpen ? 0 : 20 }],
            },
          ]}
        >
          {selectedCard && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailsHeader}>
                <Text style={styles.detailsTitle}>Campaign Details</Text>
                <Pressable style={styles.closeButton} onPress={closeDetailsModal}>
                  <CloseIcon color="#333" size={20} />
                </Pressable>
              </View>

              <Image source={{ uri: selectedCard.img }} style={styles.detailsImage} resizeMode="cover" />

              <Text style={styles.detailsCampaignTitle}>{selectedCard.title}</Text>
              <Text style={styles.detailsManager}>Campaign Manager: {selectedCard.manager}</Text>
              <Text style={styles.detailsDescription}>{selectedCard.desc}</Text>

              <Text style={styles.sectionLabel}>Select Donation Card:</Text>
              <View style={styles.amountGrid}>
                {selectedCard.amountOptions.map((amount) => {
                  const isSelected = selectedAmount === amount;

                  return (
                    <Pressable
                      key={amount}
                      style={({ pressed }: { pressed: boolean }) => [
                        styles.amountOption,
                        isSelected && styles.amountOptionSelected,
                        pressed && styles.amountOptionPressed,
                      ]}
                      onPress={() => setSelectedAmount(amount)}
                    >
                      <Text style={[styles.amountOptionText, isSelected && styles.amountOptionTextSelected]}>{formatPhp(amount)}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Quantity</Text>
              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.addToCartButton,
                    !selectedAmount && styles.paymentButtonDisabled,
                    pressed && selectedAmount && styles.paymentButtonPressed,
                  ]}
                  onPress={addCurrentSelectionToCart}
                >
                  <View style={styles.buttonInnerContent}>
                    <View style={{ marginRight: 8 }}>
                      <CartIcon color="#A65A19" size={18} />
                    </View>
                    <Text style={styles.addToCartButtonText}>Add to cart</Text>
                  </View>
                </Pressable>

                <View style={styles.quantitySelector}>
                  <Pressable
                    style={({ pressed }: { pressed: boolean }) => [styles.quantityButton, pressed && styles.quantityButtonPressed]}
                    onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </Pressable>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <Pressable
                    style={({ pressed }: { pressed: boolean }) => [styles.quantityButton, pressed && styles.quantityButtonPressed]}
                    onPress={() => setQuantity((current) => current + 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.totalSummary}>
                <Text style={styles.totalSummaryLabel}>Total Donation</Text>
                <Text style={styles.totalSummaryValue}>{formatPhp(payableTotal)}</Text>
              </View>

              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  styles.paymentButton,
                  styles.paymentButtonFullWidth,
                  selectedAmount ? styles.paymentButtonActive : styles.paymentButtonDisabled,
                  pressed && selectedAmount && styles.paymentButtonPressed,
                ]}
                onPress={proceedToPayment}
              >
                <Text style={styles.paymentButtonText}>Payment</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>

      <View pointerEvents={isPaymentModalOpen ? 'auto' : 'none'} style={[styles.overlayContainer, { justifyContent: 'flex-end', zIndex: 1001 }]}>
        <Pressable style={[styles.backdrop, { opacity: isPaymentModalOpen ? 1 : 0 }]} onPress={closePaymentModal} />

        <View style={[styles.paymentModal, { transform: [{ translateX: isPaymentModalOpen ? 0 : 450 }] }]}>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {paymentStep === 'selection' && (
              <View style={[styles.modalStepContainer, { opacity: isStepTransitioning ? 0 : 1, transform: [{ scale: isStepTransitioning ? 0.95 : 1 }] }]}>
                <Text style={styles.paymentModalTitle}>Payment Details</Text>

                {selectedCard && (
                  <View style={styles.selectedCauseBox}>
                    <Text style={styles.selectedCauseLabel}>Selected Campaign</Text>
                    <Text style={styles.selectedCauseTitle}>
                      {checkoutItems.length === 1 ? selectedCard.title : `${checkoutItems.length} donation items`}
                    </Text>
                    <Text style={styles.selectedCauseMeta}>
                      {checkoutItems.length === 1
                        ? `${selectedAmount ? formatPhp(selectedAmount) : formatPhp(0)} x ${quantity}`
                        : `Cart total for ${checkoutItems.length} campaigns`}
                    </Text>
                  </View>
                )}

                <View style={styles.amountBox}>
                  <Text style={styles.aboutToPayText}>About to pay:</Text>
                  <Text style={styles.amountBoxValue}>{formatPhp(checkoutTotal)}</Text>
                </View>

                <Text style={styles.paymentMethodLabel}>Payment Method</Text>
                <View style={styles.dropdownContainer}>
                  <Pressable style={styles.dropdownButton} onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <Text style={[styles.dropdownButtonText, paymentMethod && { color: '#333' }]}>{paymentMethod || 'Choose Payment Method'}</Text>
                    <ChevronIcon color="#888" size={16} direction={isDropdownOpen ? 'up' : 'down'} />
                  </Pressable>

                  <View
                    pointerEvents={isDropdownOpen ? 'auto' : 'none'}
                    style={[styles.dropdownList, { opacity: isDropdownOpen ? 1 : 0, transform: [{ translateY: isDropdownOpen ? 0 : -10 }] }]}
                  >
                    {PAYMENT_METHODS.map((method, index) => (
                      <Pressable
                        key={method}
                        style={[styles.dropdownItem, index === PAYMENT_METHODS.length - 1 && { borderBottomWidth: 0 }]}
                        onPress={() => {
                          setPaymentMethod(method);
                          setPaymentError('');
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{method}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {!!paymentError && <Text style={styles.paymentErrorText}>{paymentError}</Text>}

                <Pressable
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.continueButton,
                    (!paymentMethod || isSubmittingPayment) && { opacity: 0.5 },
                    pressed && paymentMethod && !isSubmittingPayment && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={submitPayment}
                >
                  <View style={styles.buttonInnerContent}>
                    <View style={{ marginRight: 10 }}>
                      <CreditCardIcon color="#FFF" size={20} />
                    </View>
                    <Text style={styles.continueButtonText}>{isSubmittingPayment ? 'Saving...' : 'Continue'}</Text>
                  </View>
                </Pressable>
              </View>
            )}

            {paymentStep === 'success' && (
              <View style={[styles.modalStepContainer, { opacity: isStepTransitioning ? 0 : 1, transform: [{ scale: isStepTransitioning ? 0.95 : 1 }] }]}>
                <Text style={styles.paymentModalTitle}>Donation Confirmation</Text>

                <View style={styles.successIconContainer}>
                  <View style={[styles.greenCheckCircle, { transform: [{ scale: isStepTransitioning ? 0.5 : 1 }] }]}>
                    <CheckIcon color="#FFFFFF" size={44} />
                  </View>
                </View>

                <Text style={[styles.successTitle, { marginBottom: 10 }]}>Thank You!</Text>
                <Text style={[styles.successMessage, { fontSize: 14, color: '#666', fontWeight: 'normal', marginBottom: 20 }]}>
                  We have received your payment for {checkoutItems.length === 1 ? selectedCard?.title ?? 'this campaign' : `${checkoutItems.length} donation items`}.
                </Text>
                <Text style={[styles.successMessage, { fontSize: 15, color: '#8A1515', fontWeight: 'bold' }]}>{formatPhp(checkoutTotal)}</Text>

                <Text style={styles.shareLabel}>Your Sharable Donation Link:</Text>
                <View style={styles.shareBoxContainer}>
                  <TextInput style={styles.shareInput} value={latestPaymentReference || 'Payment reference will appear here'} editable={false} />
                  <Pressable onPress={() => alert('Link Copied!')}>
                    <CopyIcon color="#8A1515" size={18} />
                  </Pressable>
                </View>

                <Pressable
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.continueButton,
                    styles.secondaryButton,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={closePaymentModal}
                >
                  <Text style={styles.secondaryButtonText}>BACK TO HOMEPAGE</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: { flex: 1, position: 'relative', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)' } as any,
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 15, backgroundColor: ACCENT_PINK, zIndex: 1100 } as any,
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoImage: { width: 55, height: 55, marginRight: 15 },
  logoText: { fontSize: 30, fontWeight: 'bold', color: '#333' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  menuContainer: { position: 'relative', zIndex: 1200, paddingRight: 12 },
  menuButton: { flexDirection: 'row', alignItems: 'center', cursor: 'pointer' } as any,
  menuText: { fontSize: 16, fontWeight: '500', color: '#333' },
  cartButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8A1515', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, cursor: 'pointer' } as any,
  cartText: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  navDropdown: { position: 'absolute', top: 48, right: 0, width: 220, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 10, boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.15)' } as any,
  navDropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 25, cursor: 'pointer' } as any,
  navDropdownIconWrapper: { width: 24, alignItems: 'center', marginRight: 10 },
  navDropdownText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  invisibleBackdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050, cursor: 'default' } as any,
  mainContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 40, marginTop: 40, marginBottom: 40, maxWidth: 1400, alignSelf: 'center', width: '92%', boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.05)', zIndex: 10 } as any,
  pageTitle: { fontSize: 32, fontWeight: 'bold', color: '#6A1B1B', marginBottom: 10 },
  pageSubtitle: { fontSize: 18, color: '#888', marginBottom: 30 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 15, paddingHorizontal: 20, height: 60, marginBottom: 30, borderWidth: 1, borderColor: '#EFEFEF' },
  searchInput: { flex: 1, fontSize: 16, color: '#333', outlineStyle: 'none' } as any,
  resultsText: { fontSize: 16, color: '#666', marginBottom: 20 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 30 } as any,
  card: { width: '31%', minWidth: 300, backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.08)', marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F0', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' } as any,
  cardPressed: { transform: [{ scale: 0.985 }], boxShadow: '0px 10px 25px rgba(106, 27, 27, 0.15)' } as any,
  cardImage: { width: '100%', height: 200 },
  cardBody: { padding: 25 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  cardDesc: { fontSize: 14, color: '#777', lineHeight: 22, height: 70 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20 },
  amountLabel: { fontSize: 12, color: '#888', marginBottom: 3 },
  amountValue: { fontSize: 16, fontWeight: 'bold', color: '#6A1B1B' },
  viewDetailsButton: { backgroundColor: '#FCE8E8', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#F3C7C7' },
  viewDetailsText: { fontSize: 14, fontWeight: 'bold', color: '#8A1515' },
  emptyState: { width: '100%', padding: 40, alignItems: 'center' },
  emptyStateText: { fontSize: 18, color: '#888' },
  overlayContainer: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', zIndex: 1200 } as any,
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(6px)', transition: 'opacity 0.3s ease-in-out' } as any,
  sidebar: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 450, backgroundColor: '#FFFFFF', borderTopLeftRadius: 36, borderBottomLeftRadius: 36, overflow: 'hidden', boxShadow: '-10px 0px 30px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' } as any,
  sidebarHeader: { flexDirection: 'row', alignItems: 'center', padding: 30, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  cartIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFE6E6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  sidebarTitle: { fontSize: 20, fontWeight: 'bold', color: '#6A1B1B', marginBottom: 2 },
  sidebarSubtitle: { fontSize: 14, color: '#888' },
  cartItemsList: { flexShrink: 1, flexGrow: 0, padding: 30 },
  emptyCartText: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 40 },
  cartItemCard: { flexDirection: 'row', backgroundColor: '#F9F9F9', borderRadius: 15, padding: 15, marginBottom: 15, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)' } as any,
  cartItemImage: { width: 80, height: 60, borderRadius: 10, marginRight: 15 },
  cartItemInfo: { flex: 1, justifyContent: 'center' },
  cartItemTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cartItemTitle: { flex: 1, fontSize: 14, fontWeight: 'bold', color: '#333', marginRight: 10 },
  cartItemManager: { fontSize: 12, color: '#777', marginBottom: 10 },
  removeButton: { padding: 4, cursor: 'pointer', marginTop: -4, marginRight: -4 } as any,
  cartItemPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartItemAmountLabel: { fontSize: 12, color: '#888' },
  cartItemAmountValue: { fontSize: 12, fontWeight: 'bold', color: '#6A1B1B' },
  checkoutSection: { backgroundColor: '#F3F4F6', padding: 30, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  totalsCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 25, marginBottom: 25, boxShadow: '0px 10px 25px rgba(0,0,0,0.06)' } as any,
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  line: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 15 },
  totalsLabel: { fontSize: 13, fontWeight: '600', color: '#A0A0A0' },
  totalsValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  totalBoldLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalBoldValue: { fontSize: 16, fontWeight: 'bold', color: '#8A1515' },
  checkoutButton: { height: 55, width: '100%', borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundImage: 'linear-gradient(to right, #D9898C, #B75658)', boxShadow: '0px 8px 20px rgba(183, 86, 88, 0.3)', cursor: 'pointer', transition: 'all 0.2s ease' } as any,
  checkoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  detailsModalCard: { width: '100%', maxWidth: 440, maxHeight: '90%', backgroundColor: '#FFFFFF', borderRadius: 28, padding: 18, boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.18)', transition: 'all 0.25s ease', zIndex: 1202 } as any,
  detailsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  detailsTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  closeButton: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, borderColor: '#DADADA', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } as any,
  detailsImage: { width: '100%', height: 220, borderRadius: 18, marginBottom: 20 },
  detailsCampaignTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  detailsManager: { fontSize: 14, color: '#666', marginBottom: 8 },
  detailsDescription: { fontSize: 15, color: '#5F5F5F', lineHeight: 24, marginBottom: 22 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 14 },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 } as any,
  amountOption: { width: '22%', minWidth: 86, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E1E4EA', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' } as any,
  amountOptionSelected: { backgroundColor: '#8A1515', borderColor: '#8A1515' },
  amountOptionPressed: { opacity: 0.88 },
  amountOptionText: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  amountOptionTextSelected: { color: '#FFFFFF' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 18, marginBottom: 24 } as any,
  quantitySelector: { flex: 0.95, height: 58, borderRadius: 16, borderWidth: 1, borderColor: '#E1E4EA', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 },
  quantityButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F6F8', cursor: 'pointer' } as any,
  quantityButtonPressed: { opacity: 0.85 },
  quantityButtonText: { fontSize: 26, color: '#444', fontWeight: '500', marginTop: -2 },
  quantityValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  totalSummary: { backgroundColor: '#F8F3F3', borderRadius: 18, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#E8D7D7' },
  totalSummaryLabel: { fontSize: 13, color: '#777', marginBottom: 6 },
  totalSummaryValue: { fontSize: 28, fontWeight: 'bold', color: '#8A1515' },
  addToCartButton: { flex: 1.6, height: 72, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3E1E1', borderWidth: 1, borderColor: '#E3BFC0', cursor: 'pointer' } as any,
  addToCartButtonText: { color: '#A65A19', fontSize: 16, fontWeight: '600' },
  paymentButton: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#C9CED6', cursor: 'pointer' } as any,
  paymentButtonFullWidth: { width: '100%' },
  paymentButtonActive: { backgroundColor: ACCENT_PINK },
  paymentButtonDisabled: { opacity: 0.55 },
  paymentButtonPressed: { opacity: 0.9 },
  paymentButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  paymentModal: { position: 'absolute', right: 0, height: '100%', width: 450, backgroundColor: '#FFFFFF', padding: 40, paddingTop: 60, boxShadow: '-10px 0px 40px rgba(0, 0, 0, 0.1)', zIndex: 1201, transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' } as any,
  modalStepContainer: { transition: 'all 0.25s ease-in-out' } as any,
  paymentModalTitle: { fontSize: 26, fontWeight: 'bold', color: '#6A1B1B', textAlign: 'center', marginBottom: 30, marginTop: 10 },
  selectedCauseBox: { backgroundColor: '#FFF8F8', borderRadius: 16, borderWidth: 1, borderColor: '#F0D9D9', padding: 18, marginBottom: 20 },
  selectedCauseLabel: { fontSize: 12, color: '#888', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.6 },
  selectedCauseTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  selectedCauseMeta: { fontSize: 14, color: '#8A1515', fontWeight: '600' },
  amountBox: { backgroundColor: '#FFF4F4', borderRadius: 15, padding: 25, alignItems: 'center', marginBottom: 35, borderWidth: 1, borderColor: '#E6CACA', boxShadow: 'inset 0px 4px 10px rgba(0,0,0,0.02)' } as any,
  aboutToPayText: { fontSize: 14, fontWeight: 'bold', color: '#6A1B1B', alignSelf: 'flex-start', marginBottom: 15 },
  amountBoxValue: { fontSize: 36, fontWeight: 'bold', color: '#6A1B1B' },
  paymentMethodLabel: { fontSize: 14, fontWeight: 'bold', color: '#6A1B1B', marginBottom: 10 },
  dropdownContainer: { position: 'relative', marginBottom: 40, zIndex: 10 },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#D9D9D9', borderRadius: 12, padding: 18, cursor: 'pointer', boxShadow: '0px 2px 5px rgba(0,0,0,0.02)' } as any,
  dropdownButtonText: { fontSize: 15, color: '#A0A0A0', fontWeight: '500' },
  dropdownList: { position: 'absolute', top: 60, left: 0, right: 0, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#D9D9D9', boxShadow: '0px 5px 15px rgba(0,0,0,0.1)', overflow: 'hidden', transition: 'all 0.2s ease-in-out' } as any,
  dropdownItem: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', cursor: 'pointer' } as any,
  dropdownItemText: { fontSize: 15, color: '#333', fontWeight: '500' },
  paymentErrorText: { fontSize: 13, color: '#B42318', marginTop: -24, marginBottom: 24, lineHeight: 18 },
  continueButton: { height: 55, width: '100%', borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundImage: 'linear-gradient(to right, #D9898C, #B75658)', boxShadow: '0px 8px 20px rgba(183, 86, 88, 0.3)', cursor: 'pointer', transition: 'all 0.2s ease' } as any,
  buttonInnerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  continueButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  successTitle: { fontSize: 26, fontWeight: 'bold', color: '#8A1515', textAlign: 'center', marginBottom: 25 },
  successIconContainer: { alignItems: 'center', marginBottom: 25 },
  greenCheckCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#28A745', justifyContent: 'center', alignItems: 'center', boxShadow: '0px 8px 20px rgba(40, 167, 69, 0.3)', transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' } as any,
  successMessage: { fontSize: 14, fontWeight: 'normal', color: '#666', textAlign: 'center', marginBottom: 30 },
  shareLabel: { fontSize: 14, fontWeight: 'bold', color: '#8A1515', marginBottom: 12, marginLeft: 2, marginTop: 24 },
  shareBoxContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 15, height: 50 },
  shareInput: { flex: 1, fontSize: 13, color: '#666', outlineStyle: 'none' } as any,
  secondaryButton: { marginTop: 30, backgroundColor: '#F3F4F6', backgroundImage: 'none', borderWidth: 1, borderColor: '#E5E7EB', boxShadow: 'none' } as any,
  secondaryButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});
