import { ImageSourcePropType } from 'react-native';

export type Category = 'All' | 'Facial' | 'Massage' | 'Nails' | 'Hair' | 'Body';

export interface Service {
  id: string;
  name: string;
  category: Exclude<Category, 'All'>;
  duration: number;
  price: number;
  description: string;
  rating: number;
  reviews: number;
  therapistIds: string[];
  image: ImageSourcePropType;
}

export interface Staff {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  rating: number;
  experience: string;
  serviceIds: string[];
  avatarColor: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  therapistId: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'no-show';
  createdAt: string;
}

export const CATEGORIES: Category[] = ['All', 'Facial', 'Massage', 'Nails', 'Hair', 'Body'];

export const STAFF: Staff[] = [
  {
    id: '1',
    name: 'Amara Wanjiku',
    initials: 'AW',
    specialty: 'Facial Specialist',
    rating: 4.9,
    experience: '8 yrs',
    serviceIds: ['1', '6'],
    avatarColor: '#D4A5A5',
  },
  {
    id: '2',
    name: 'Grace Odhiambo',
    initials: 'GO',
    specialty: 'Massage Therapist',
    rating: 4.8,
    experience: '6 yrs',
    serviceIds: ['2', '5', '8'],
    avatarColor: '#A5B4C4',
  },
  {
    id: '3',
    name: 'Fatima Hassan',
    initials: 'FH',
    specialty: 'Nail Artist',
    rating: 4.9,
    experience: '5 yrs',
    serviceIds: ['3', '7'],
    avatarColor: '#C4A5D4',
  },
  {
    id: '4',
    name: 'Zoe Kimani',
    initials: 'ZK',
    specialty: 'Hair Stylist',
    rating: 4.7,
    experience: '7 yrs',
    serviceIds: ['4'],
    avatarColor: '#D4C4A5',
  },
  {
    id: '5',
    name: 'Aisha Mwangi',
    initials: 'AM',
    specialty: 'Beauty Therapist',
    rating: 4.8,
    experience: '4 yrs',
    serviceIds: ['1', '6', '8'],
    avatarColor: '#A5C4B4',
  },
];

export const SERVICES: Service[] = [
  {
    id: '1',
    name: 'Signature Facial',
    category: 'Facial',
    duration: 60,
    price: 2500,
    description:
      'Our signature facial deeply cleanses, exfoliates, and nourishes your skin using premium botanical ingredients. This personalized treatment targets your unique skin concerns for a radiant, youthful glow.',
    rating: 4.9,
    reviews: 128,
    therapistIds: ['1', '5'],
    image: require('../assets/images/facial.png'),
  },
  {
    id: '2',
    name: 'Deep Tissue Massage',
    category: 'Massage',
    duration: 90,
    price: 3500,
    description:
      'This therapeutic massage targets the deeper layers of muscle tissue, relieving chronic tension and stress. Perfect for those with persistent muscle soreness or postural problems.',
    rating: 4.8,
    reviews: 96,
    therapistIds: ['2'],
    image: require('../assets/images/massage.png'),
  },
  {
    id: '3',
    name: 'Luxury Mani-Pedi',
    category: 'Nails',
    duration: 75,
    price: 1800,
    description:
      'Indulge in our luxurious manicure and pedicure combo. Includes exfoliation, cuticle care, nail shaping, massage, and your choice of premium nail color.',
    rating: 4.7,
    reviews: 84,
    therapistIds: ['3'],
    image: require('../assets/images/nails.png'),
  },
  {
    id: '4',
    name: 'Keratin Hair Treatment',
    category: 'Hair',
    duration: 120,
    price: 4500,
    description:
      'Transform frizzy, unruly hair into silky smooth perfection. Our keratin treatment seals the hair shaft for lasting smoothness and manageability lasting up to 3 months.',
    rating: 4.9,
    reviews: 72,
    therapistIds: ['4'],
    image: require('../assets/images/hair.png'),
  },
  {
    id: '5',
    name: 'Hot Stone Massage',
    category: 'Massage',
    duration: 60,
    price: 3000,
    description:
      'Smooth, heated basalt stones are placed on key points of the body to warm and relax muscles. Combined with our signature massage techniques for deep relaxation.',
    rating: 4.8,
    reviews: 61,
    therapistIds: ['2'],
    image: require('../assets/images/massage.png'),
  },
  {
    id: '6',
    name: 'Express Facial',
    category: 'Facial',
    duration: 30,
    price: 1500,
    description:
      'Short on time? Our express facial delivers rapid results — cleanse, tone, treat, and moisturize in just 30 minutes. Ideal for a quick refresh before a special event.',
    rating: 4.6,
    reviews: 113,
    therapistIds: ['1', '5'],
    image: require('../assets/images/facial.png'),
  },
  {
    id: '7',
    name: 'Gel Manicure',
    category: 'Nails',
    duration: 45,
    price: 1200,
    description:
      'Long-lasting, chip-resistant gel nail color that stays perfect for up to 3 weeks. Includes nail prep, gel application, and UV curing.',
    rating: 4.7,
    reviews: 97,
    therapistIds: ['3'],
    image: require('../assets/images/nails.png'),
  },
  {
    id: '8',
    name: 'Hydrating Body Wrap',
    category: 'Body',
    duration: 90,
    price: 3800,
    description:
      'Our luxurious body wrap uses rich hydrating agents to deeply nourish dry, dull skin. Includes a full body scrub, wrap, and moisturizing treatment for visibly soft, glowing skin.',
    rating: 4.9,
    reviews: 45,
    therapistIds: ['2', '8'],
    image: require('../assets/images/body.png'),
  },
];

export const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM',
];

export function getAvailableDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  const startOffset = today.getHours() >= 17 ? 1 : 0;
  for (let i = startOffset; i < startOffset + 21; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) {
      dates.push(d);
    }
    if (dates.length >= 14) break;
  }
  return dates;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-KE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatPrice(price: number): string {
  return `Ksh ${price.toLocaleString()}`;
}

