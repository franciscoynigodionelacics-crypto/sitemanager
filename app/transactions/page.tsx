'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'next/navigation';
import { getBuyerAuthId, getOrCreateBuyerAuthId } from '../../lib/hopecard-session';

type Transaction = {
  id: string;
  title: string;
  amount: number;
  method: string;
  status: string;
  paymentReference: string;
  purchasedAt: string;
};

const formatAmount = (amount: number) => `₱${amount.toLocaleString()} php`;

const formatMethod = (method: string) => {
  if (method === 'gcash') {
    return 'Gcash';
  }

  if (method === 'maya') {
    return 'Paymaya';
  }

  if (method === 'card') {
    return 'Credit Card';
  }

  return method;
};

const formatStatus = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(date));

export default function TransactionsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const buyerAuthId = getBuyerAuthId() ?? getOrCreateBuyerAuthId();

    if (!buyerAuthId) {
      setErrorMessage('Unable to load your donor session.');
      setIsLoading(false);
      return;
    }

    const loadTransactions = async () => {
      try {
        const response = await fetch(`/api/hopecard-purchases?buyerAuthId=${buyerAuthId}`);
        const data = (await response.json()) as {
          error?: string;
          transactions?: Transaction[];
        };

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load transaction history.');
        }

        setTransactions(data.transactions ?? []);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load transaction history.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (activeTab === 'All') {
      return transactions;
    }

    return transactions.filter((transaction) => formatStatus(transaction.status) === activeTab);
  }, [activeTab, transactions]);

  const totalDonated = useMemo(
    () => transactions.reduce((sum, txn) => sum + txn.amount, 0).toLocaleString(),
    [transactions],
  );

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Transactions</Text>

        <View style={styles.impactCard}>
          <Text style={styles.impactLabel}>Total Impact</Text>
          <Text style={styles.impactValue}>{totalDonated} php</Text>
          <Text style={styles.impactSubtext}>Across {transactions.length} donations</Text>
        </View>

        <View style={styles.actionButtonsContainer}>
          <Pressable style={styles.actionButton} onPress={() => router.push('/home')}>
            <Text style={styles.actionIcon}>⌂</Text>
            <Text style={styles.actionText}>Dashboard</Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={() => router.push('/profile')}>
            <Text style={styles.actionIcon}>◌</Text>
            <Text style={styles.actionText}>Donor Profile</Text>
          </Pressable>

          <View style={styles.line} />

          <Pressable style={styles.actionButton} onPress={() => router.push('/login')}>
            <Text style={styles.actionIcon}>↦</Text>
            <Text style={styles.actionText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Donation History</Text>

          <View style={styles.tabsContainer}>
            {['All', 'Completed', 'Pending'].map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <ScrollView style={styles.listContainer} contentContainerStyle={{ paddingBottom: 50 }}>
          {isLoading && <Text style={styles.emptyText}>Loading purchases...</Text>}

          {!isLoading && !!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          {!isLoading && !errorMessage && filteredTransactions.length === 0 && (
            <Text style={styles.emptyText}>No purchases found for this donor session yet.</Text>
          )}

          {!isLoading &&
            !errorMessage &&
            filteredTransactions.map((txn) => (
              <View key={txn.id} style={styles.transactionCard}>
                <View style={styles.iconContainer}>
                  <Text style={styles.receiptIcon}>₱</Text>
                </View>

                <View style={styles.txnDetails}>
                  <Text style={styles.txnTitle}>{txn.title}</Text>
                  <View style={styles.txnMetaRow}>
                    <Text style={styles.txnMetaText}>{formatDate(txn.purchasedAt)}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.txnMetaText}>Ref: {txn.paymentReference}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.txnMetaText}>Paid via {formatMethod(txn.method)}</Text>
                  </View>
                </View>

                <View style={styles.txnRight}>
                  <Text style={styles.txnAmount}>{formatAmount(txn.amount)}</Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{formatStatus(txn.status)}</Text>
                  </View>
                </View>
              </View>
            ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#F5F6F8', height: '100vh' as any },
  sidebar: {
    width: 320,
    height: '100%',
    backgroundImage: 'linear-gradient(to bottom, #E8A8A8, #A33A3A)',
    padding: 40,
  } as any,
  sidebarTitle: { fontSize: 28, fontWeight: 'bold', color: '#6A1B1B', marginBottom: 40 },
  impactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 25,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  impactLabel: { fontSize: 14, color: '#6A1B1B', fontWeight: '600', marginBottom: 10 },
  impactValue: { fontSize: 32, fontWeight: 'bold', color: '#6A1B1B', marginBottom: 5 },
  impactSubtext: { fontSize: 12, color: '#6A1B1B', opacity: 0.8 },
  actionButtonsContainer: { flex: 1 },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 15, borderRadius: 12, marginBottom: 15, cursor: 'pointer' } as any,
  actionIcon: { fontSize: 20, marginRight: 15, color: '#6A1B1B' },
  actionText: { fontSize: 16, fontWeight: '600', color: '#6A1B1B' },
  line: { width: '100%', height: 1, backgroundColor: 'rgba(106, 27, 27, 0.2)', marginVertical: 20 },
  mainContent: { flex: 1, padding: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  sectionTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#EBEBEB', borderRadius: 20, padding: 5 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 15, cursor: 'pointer' } as any,
  activeTabButton: { backgroundColor: '#FFFFFF', boxShadow: '0px 2px 5px rgba(0,0,0,0.05)' } as any,
  tabText: { fontSize: 14, color: '#888', fontWeight: '600' },
  activeTabText: { color: '#6A1B1B' },
  listContainer: { flex: 1 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 40 },
  errorText: { fontSize: 15, color: '#B42318', textAlign: 'center', marginTop: 40, lineHeight: 22 },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 25,
    marginBottom: 15,
    boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    transition: 'transform 0.2s ease',
  } as any,
  iconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF4F4', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  receiptIcon: { fontSize: 20, color: '#8A1515', fontWeight: 'bold' },
  txnDetails: { flex: 1 },
  txnTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  txnMetaRow: { flexDirection: 'row', alignItems: 'center' },
  txnMetaText: { fontSize: 13, color: '#888' },
  dot: { marginHorizontal: 8, color: '#CCC', fontSize: 10 },
  txnRight: { alignItems: 'flex-end' },
  txnAmount: { fontSize: 18, fontWeight: 'bold', color: '#8A1515', marginBottom: 8 },
  statusPill: { backgroundColor: '#E8F5E9', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 10 },
  statusText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' },
});
