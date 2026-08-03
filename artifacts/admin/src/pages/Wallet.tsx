import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { apiFetch, useWallet, useGiftCards, useLoyaltyAccount } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';

const TIER_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32',
  SILVER: '#A8A9AD',
  GOLD: '#FFD700',
  PLATINUM: '#E5E4E2',
};

const TIER_BG: Record<string, string> = {
  BRONZE: 'rgba(205,127,50,0.12)',
  SILVER: 'rgba(168,169,173,0.12)',
  GOLD: 'rgba(255,215,0,0.12)',
  PLATINUM: 'rgba(229,228,226,0.12)',
};

export default function WalletPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: giftCards = [], isLoading: cardsLoading } = useGiftCards();
  const { data: loyalty, isLoading: loyaltyLoading } = useLoyaltyAccount();

  const [topupAmount, setTopupAmount] = useState('');
  const [giftValue, setGiftValue] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const showMsg = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleTopup = async () => {
    if (!topupAmount || isNaN(Number(topupAmount))) return;
    setBusy(true);
    try {
      await apiFetch('/api/wallet/topup', { method: 'POST', body: JSON.stringify({ amount: Number(topupAmount) }) });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      setTopupAmount('');
      showMsg('ok', `KES ${topupAmount} added to wallet!`);
    } catch (e: any) {
      showMsg('err', e.message);
    } finally { setBusy(false); }
  };

  const handleGenerateGiftCard = async () => {
    if (!giftValue || isNaN(Number(giftValue))) return;
    setBusy(true);
    try {
      await apiFetch('/api/wallet/gift-cards', {
        method: 'POST',
        body: JSON.stringify({ spaId: user?.spaId, value: Number(giftValue) }),
      });
      qc.invalidateQueries({ queryKey: ['giftCards'] });
      setGiftValue('');
      showMsg('ok', `Gift card for KES ${giftValue} generated!`);
    } catch (e: any) {
      showMsg('err', e.message);
    } finally { setBusy(false); }
  };

  const handleRedeemGiftCard = async () => {
    if (!redeemCode.trim()) return;
    setBusy(true);
    try {
      await apiFetch('/api/wallet/gift-cards/redeem', { method: 'POST', body: JSON.stringify({ code: redeemCode.trim() }) });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['giftCards'] });
      setRedeemCode('');
      showMsg('ok', 'Gift card redeemed! Balance added to wallet.');
    } catch (e: any) {
      showMsg('err', e.message);
    } finally { setBusy(false); }
  };

  const tier = loyalty?.tier ?? 'BRONZE';

  return (
    <div style={{ padding: '24px', maxWidth: 1100 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>💎 Wallet & Loyalty</h1>
      <p style={{ color: 'var(--muted-foreground)', marginBottom: 28 }}>
        Manage your Beauty Wallet balance, gift cards, and loyalty rewards.
      </p>

      {msg && (
        <div style={{
          marginBottom: 20, padding: '12px 20px', borderRadius: 10,
          background: msg.type === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          color: msg.type === 'ok' ? '#10B981' : '#EF4444', fontWeight: 600,
        }}>
          {msg.type === 'ok' ? '✓' : '✗'} {msg.text}
        </div>
      )}

      {/* Top Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
        {/* Wallet Balance Card */}
        <div style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
          borderRadius: 20, padding: 28, color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -10, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 8 }}>💳 Beauty Wallet</div>
          {walletLoading ? (
            <div style={{ fontSize: 32, fontWeight: 800 }}>…</div>
          ) : (
            <div style={{ fontSize: 36, fontWeight: 800 }}>
              KES {wallet?.balance?.toLocaleString() ?? '0'}
            </div>
          )}
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>{wallet?.currency ?? 'KES'} · Beauty Wallet</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <input
              type="number" placeholder="Amount" value={topupAmount}
              onChange={e => setTopupAmount(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', fontSize: 14, background: 'rgba(255,255,255,0.2)', color: '#fff' }}
            />
            <button
              onClick={handleTopup} disabled={busy}
              style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#fff', color: '#7C3AED', fontWeight: 700, cursor: 'pointer' }}
            >Top Up</button>
          </div>
        </div>

        {/* Loyalty Tier Card */}
        <div style={{
          background: `linear-gradient(135deg, ${TIER_BG[tier]} 0%, var(--card) 100%)`,
          border: `2px solid ${TIER_COLORS[tier]}40`,
          borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 8 }}>🏆 Loyalty Status</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: TIER_COLORS[tier] }}>
            {loyaltyLoading ? '…' : tier}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
            {loyalty?.points?.toLocaleString() ?? 0} pts
          </div>
          <div style={{ marginTop: 16 }}>
            {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map((t, i) => {
              const thresholds = [0, 500, 2000, 5000];
              const isActive = t === tier;
              const isPast = thresholds[i] <= (loyalty?.points ?? 0);
              return (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: isPast ? TIER_COLORS[t] : 'var(--border)' }} />
                  <span style={{ fontSize: 12, color: isActive ? TIER_COLORS[t] : 'var(--muted-foreground)', fontWeight: isActive ? 700 : 400 }}>
                    {t} ({thresholds[i].toLocaleString()} pts)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gift Card Actions */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 16 }}>🎁 Gift Cards</div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Generate New Gift Card</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <input
                type="number" placeholder="KES value" value={giftValue}
                onChange={e => setGiftValue(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: 14 }}
              />
              <button
                onClick={handleGenerateGiftCard} disabled={busy}
                style={{ padding: '8px 16px', borderRadius: 8, background: '#10B981', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >Create</button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Redeem Gift Card</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <input
                placeholder="Card code" value={redeemCode}
                onChange={e => setRedeemCode(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: 14 }}
              />
              <button
                onClick={handleRedeemGiftCard} disabled={busy}
                style={{ padding: '8px 16px', borderRadius: 8, background: '#F59E0B', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >Redeem</button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Wallet Transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Wallet Transactions</h2>
          {walletLoading ? <div style={{ color: 'var(--muted-foreground)' }}>Loading…</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(wallet?.transactions ?? []).slice(0, 10).map((tx) => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: 'var(--background)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{tx.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: tx.amount > 0 ? '#10B981' : '#EF4444' }}>
                    {tx.amount > 0 ? '+' : ''}KES {Math.abs(tx.amount).toLocaleString()}
                  </div>
                </div>
              ))}
              {(wallet?.transactions ?? []).length === 0 && (
                <div style={{ color: 'var(--muted-foreground)', fontSize: 14, textAlign: 'center', padding: 20 }}>No transactions yet</div>
              )}
            </div>
          )}
        </div>

        {/* Gift Cards Table */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Issued Gift Cards</h2>
          {cardsLoading ? <div style={{ color: 'var(--muted-foreground)' }}>Loading…</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {giftCards.slice(0, 10).map((card) => (
                <div key={card.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: 'var(--background)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{card.code}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                      {card.isActive ? '🟢 Active' : '🔴 Redeemed'} · Value: KES {card.value.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>KES {card.balance.toLocaleString()}</div>
                </div>
              ))}
              {giftCards.length === 0 && (
                <div style={{ color: 'var(--muted-foreground)', fontSize: 14, textAlign: 'center', padding: 20 }}>No gift cards yet</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loyalty Transactions */}
      {loyalty?.transactions && loyalty.transactions.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Loyalty Points History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loyalty.transactions.slice(0, 15).map((tx) => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: 'var(--background)' }}>
                <div style={{ fontSize: 13 }}>{tx.description}</div>
                <div style={{ fontWeight: 700, color: tx.type === 'EARN' ? '#F59E0B' : '#EF4444' }}>
                  {tx.type === 'EARN' ? '+' : ''}{tx.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
