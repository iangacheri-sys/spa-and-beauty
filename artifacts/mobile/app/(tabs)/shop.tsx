import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { useColors } from '@/hooks/useColors';
import { useCart } from '@/context/CartContext';
import { apiFetch } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  stock: number;
}

const SHOP_PRODUCTS: Product[] = []; // Fallback empty array, we will fetch
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228720-da6f0e79e3ce?auto=format&fit=crop&q=80&w=500';

function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={toastStyles.container}>
      <Feather name="check-circle" size={16} color="#fff" />
      <Text style={toastStyles.text}>{message}</Text>
    </View>
  );
}

const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: { color: '#fff', fontSize: 14, fontFamily: 'Inter_500Medium', flex: 1 },
});

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { items, itemCount, subtotal, addItem, removeItem, clearCart, updateQuantity } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [search, setSearch] = useState('');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const spaId = 'bofa-beach-wellness'; 
  const { data: products = SHOP_PRODUCTS, isLoading } = useQuery({
    queryKey: ['products', spaId],
    queryFn: async () => {
      const data = await apiFetch<Product[]>(`/products?spaId=${spaId}`);
      return data;
    }
  });

  const filtered = products.filter(
    (p: Product) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(`Added ${product.name} to cart`);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity
      }));
      
      const res = await apiFetch(`/orders/checkout`, {
        method: 'POST',
        body: JSON.stringify({ spaId, items: orderItems }),
      }) as Response;
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to complete checkout');
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearCart();
      setCartOpen(false);
      Alert.alert('Order Confirmed', 'Your order has been placed successfully.');
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Checkout Failed', err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topInset + 16, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: colors.background },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.foreground },
    cartBtn: { position: 'relative', padding: 6 },
    cartBadge: { position: 'absolute', top: 0, right: 0, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
    cartBadgeText: { color: '#fff', fontSize: 9, fontFamily: 'Inter_700Bold' },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, marginTop: 14, gap: 8 },
    searchInput: { flex: 1, height: 44, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15 },
    card: { flex: 1, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', margin: 6 },
    image: { width: '100%', height: 140, backgroundColor: colors.secondary },
    info: { padding: 12 },
    name: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground, marginBottom: 2 },
    category: { fontSize: 11, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginBottom: 8 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { fontSize: 15, fontFamily: 'Inter_700Bold', color: colors.primary },
    addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
    ratingText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: colors.mutedForeground },
    emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
    emptyText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 15 },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.title}>Beauty Shop</Text>
          <Pressable style={s.cartBtn} onPress={() => setCartOpen(true)} accessibilityLabel={`Cart, ${itemCount} items`}>
            <Feather name="shopping-cart" size={24} color={colors.foreground} />
            {itemCount > 0 && (
              <View style={s.cartBadge}>
                <Text style={s.cartBadgeText}>{itemCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
        <View style={s.searchBox}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={s.searchInput}
            placeholder="Search products..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}><Feather name="x" size={16} color={colors.mutedForeground} /></Pressable>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={s.emptyBox}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 10, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <Feather name="package" size={40} color={colors.border} />
              <Text style={s.emptyText}>No products found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <Image
                source={{ uri: imageErrors.has(item.id) ? FALLBACK_IMAGE : item.image }}
                style={s.image}
                contentFit="cover"
                transition={200}
                onError={() => setImageErrors((prev) => new Set([...prev, item.id]))}
              />
              <View style={s.info}>
                <Text style={s.name} numberOfLines={1}>{item.name}</Text>
                <Text style={s.category}>{item.category}</Text>
                <View style={s.ratingRow}>
                  <Feather name="star" size={11} color="#F59E0B" />
                  <Text style={s.ratingText}>{item.rating} ({item.reviews})</Text>
                </View>
                <View style={s.priceRow}>
                  <Text style={s.price}>Ksh {item.price.toLocaleString()}</Text>
                  <Pressable style={s.addBtn} onPress={() => handleAddToCart(item)} accessibilityLabel={`Add ${item.name} to cart`}>
                    <Feather name="plus" size={16} color="#fff" />
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <Toast message={toastMsg} visible={toastVisible} />
      
      <Modal visible={cartOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setCartOpen(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 22, fontFamily: 'Inter_700Bold', color: colors.foreground }}>Your Cart</Text>
            <Pressable onPress={() => setCartOpen(false)} hitSlop={10}><Feather name="x" size={24} color={colors.foreground} /></Pressable>
          </View>

          {items.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Feather name="shopping-cart" size={48} color={colors.border} />
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 15 }}>Your cart is empty</Text>
            </View>
          ) : (
            <>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 16 }}>
                {items.map((item) => (
                  <View key={item.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border }}>
                    <Image source={{ uri: item.image }} style={{ width: 60, height: 60, borderRadius: 8 }} transition={200} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.foreground, fontSize: 14 }} numberOfLines={1}>{item.name}</Text>
                      <Text style={{ fontFamily: 'Inter_700Bold', color: colors.primary, fontSize: 15, marginTop: 2 }}>Ksh {(item.price * item.quantity).toLocaleString()}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
                        <Pressable onPress={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}>
                          <Feather name="minus" size={14} color={colors.foreground} />
                        </Pressable>
                        <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.foreground, minWidth: 20, textAlign: 'center' }}>{item.quantity}</Text>
                        <Pressable onPress={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                          <Feather name="plus" size={14} color="#fff" />
                        </Pressable>
                      </View>
                    </View>
                    <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
                      <Feather name="trash-2" size={18} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>

              <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: colors.border, gap: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', color: colors.mutedForeground, fontSize: 16 }}>Subtotal</Text>
                  <Text style={{ fontFamily: 'Inter_700Bold', color: colors.foreground, fontSize: 18 }}>Ksh {subtotal.toLocaleString()}</Text>
                </View>
                <Pressable
                  style={{
                    backgroundColor: colors.primary,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                  onPress={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Feather name="credit-card" size={20} color="#fff" />
                      <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#fff', fontSize: 16 }}>
                        Checkout (Ksh {subtotal.toLocaleString()})
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}
