export interface Specialist {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  rating: number;
  experience: string;
  serviceIds: string[];
  avatarColor: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  rating: number;
  reviews: number;
}

export interface Booking {
  id: string;
  clientName: string;
  serviceId: string;
  specialistId: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  price: number;
}

export const specialists: Specialist[] = [
  { id: '1', name: 'Amara Wanjiku', initials: 'AW', specialty: 'Facial Specialist', rating: 4.9, experience: '8 yrs', serviceIds: ['1','6'], avatarColor: '#D4A5A5' },
  { id: '2', name: 'Grace Odhiambo', initials: 'GO', specialty: 'Massage Therapist', rating: 4.8, experience: '6 yrs', serviceIds: ['2','5','8'], avatarColor: '#A5B4C4' },
  { id: '3', name: 'Fatima Hassan', initials: 'FH', specialty: 'Nail Artist', rating: 4.9, experience: '5 yrs', serviceIds: ['3','7'], avatarColor: '#C4A5D4' },
  { id: '4', name: 'Zoe Kimani', initials: 'ZK', specialty: 'Hair Stylist', rating: 4.7, experience: '7 yrs', serviceIds: ['4'], avatarColor: '#D4C4A5' },
  { id: '5', name: 'Aisha Mwangi', initials: 'AM', specialty: 'Beauty Therapist', rating: 4.8, experience: '4 yrs', serviceIds: ['1','6','8'], avatarColor: '#A5C4B4' },
];

export const services: Service[] = [
  { id: '1', name: 'Signature Facial', category: 'Facial', duration: 60, price: 2500, rating: 4.9, reviews: 128 },
  { id: '2', name: 'Deep Tissue Massage', category: 'Massage', duration: 90, price: 3500, rating: 4.8, reviews: 96 },
  { id: '3', name: 'Luxury Mani-Pedi', category: 'Nails', duration: 75, price: 1800, rating: 4.7, reviews: 84 },
  { id: '4', name: 'Keratin Hair Treatment', category: 'Hair', duration: 120, price: 4500, rating: 4.9, reviews: 72 },
  { id: '5', name: 'Hot Stone Massage', category: 'Massage', duration: 60, price: 3000, rating: 4.8, reviews: 61 },
  { id: '6', name: 'Express Facial', category: 'Facial', duration: 30, price: 1500, rating: 4.6, reviews: 113 },
  { id: '7', name: 'Gel Manicure', category: 'Nails', duration: 45, price: 1200, rating: 4.7, reviews: 97 },
  { id: '8', name: 'Hydrating Body Wrap', category: 'Body', duration: 90, price: 3800, rating: 4.9, reviews: 45 },
];

const mockNames = ['Kariuki', 'Njoroge', 'Wamalwa', 'Mutuku', 'Ochieng', 'Akinyi', 'Kemboi', 'Nafula', 'Nyambura', 'Nduta', 'Omondi', 'Chebet', 'Wairimu', 'Muthoni', 'Wangari', 'Nanjala'];

const today = new Date();

export const bookings: Booking[] = Array.from({ length: 30 }).map((_, i) => {
  const service = services[i % services.length];
  const specialistList = specialists.filter(s => s.serviceIds.includes(service.id));
  const specialist = specialistList[i % specialistList.length] || specialists[0];
  
  // Random day between -14 and +7
  const offset = Math.floor(Math.random() * 21) - 14;
  const bDate = new Date(today);
  bDate.setDate(bDate.getDate() + offset);
  
  const h = 9 + Math.floor(Math.random() * 8);
  const m = Math.random() > 0.5 ? '00' : '30';
  const time = `${h.toString().padStart(2, '0')}:${m}`;
  
  let status: Booking['status'] = 'completed';
  if (offset > 0) status = 'upcoming';
  else if (Math.random() < 0.15) status = 'cancelled';
  
  return {
    id: `b-${i+1}`,
    clientName: `${mockNames[i % mockNames.length]} ${mockNames[(i+3) % mockNames.length]}`,
    serviceId: service.id,
    specialistId: specialist.id,
    date: bDate.toISOString().split('T')[0],
    time,
    status,
    price: service.price,
  };
});
