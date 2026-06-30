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

export interface Feedback {
  id: string;
  specialistId: string;
  clientName: string;
  serviceId: string;
  date: string;
  rating: number;
  comment: string;
}

export interface Tip {
  id: string;
  specialistId: string;
  clientName: string;
  serviceId: string;
  date: string;
  amount: number;
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
  
  const offset = Math.floor(((i * 7) % 21) - 14);
  const bDate = new Date(today);
  bDate.setDate(bDate.getDate() + offset);
  
  const h = 9 + (i % 8);
  const m = i % 2 === 0 ? '00' : '30';
  const time = `${h.toString().padStart(2, '0')}:${m}`;
  
  let status: Booking['status'] = 'completed';
  if (offset > 0) status = 'upcoming';
  else if (i % 7 === 0) status = 'cancelled';
  
  return {
    id: `b-${i + 1}`,
    clientName: `${mockNames[i % mockNames.length]} ${mockNames[(i + 3) % mockNames.length]}`,
    serviceId: service.id,
    specialistId: specialist.id,
    date: bDate.toISOString().split('T')[0],
    time,
    status,
    price: service.price,
  };
});

export const feedbacks: Feedback[] = [
  // Amara Wanjiku — Facial Specialist
  { id: 'f-1', specialistId: '1', clientName: 'Nyambura Chebet', serviceId: '1', date: '2026-06-25', rating: 5, comment: 'Amara is absolutely magical with facials. My skin has never felt this good — I had that glow for a full two weeks!' },
  { id: 'f-2', specialistId: '1', clientName: 'Wangari Nduta', serviceId: '6', date: '2026-06-22', rating: 5, comment: 'Even just the express facial left me looking refreshed. So gentle and thorough. I will not go anywhere else.' },
  { id: 'f-3', specialistId: '1', clientName: 'Akinyi Wairimu', serviceId: '1', date: '2026-06-18', rating: 5, comment: 'She took time to understand my skin concerns before starting. The best facial experience I have had in Nairobi.' },
  { id: 'f-4', specialistId: '1', clientName: 'Muthoni Ochieng', serviceId: '6', date: '2026-06-14', rating: 4, comment: 'Very professional and calming atmosphere. The products she used smelled wonderful. Slight redness after but it faded quickly.' },
  { id: 'f-5', specialistId: '1', clientName: 'Nafula Kemboi', serviceId: '1', date: '2026-06-10', rating: 5, comment: 'I came in with dry, tired skin after a long week. I left looking like I had slept for ten hours. Incredible work.' },
  { id: 'f-6', specialistId: '1', clientName: 'Chebet Njoroge', serviceId: '6', date: '2026-06-05', rating: 5, comment: 'Amara noticed my skin was dehydrated before I even mentioned it. Her attention to detail is exceptional.' },

  // Grace Odhiambo — Massage Therapist
  { id: 'f-7', specialistId: '2', clientName: 'Kariuki Wamalwa', serviceId: '2', date: '2026-06-26', rating: 5, comment: 'Grace found every knot in my back I did not even know was there. I walked in stiff and floated out completely relaxed.' },
  { id: 'f-8', specialistId: '2', clientName: 'Mutuku Omondi', serviceId: '5', date: '2026-06-23', rating: 5, comment: 'The hot stone massage was an experience I will never forget. The warmth and pressure were perfectly balanced.' },
  { id: 'f-9', specialistId: '2', clientName: 'Njoroge Akinyi', serviceId: '2', date: '2026-06-19', rating: 4, comment: 'Very skilled therapist. The deep tissue work was intense but exactly what I needed after months of back pain.' },
  { id: 'f-10', specialistId: '2', clientName: 'Wamalwa Kariuki', serviceId: '8', date: '2026-06-16', rating: 5, comment: 'The hydrating body wrap left my skin feeling like silk. Grace explained every step and made me feel completely at ease.' },
  { id: 'f-11', specialistId: '2', clientName: 'Ochieng Nduta', serviceId: '5', date: '2026-06-11', rating: 5, comment: 'I booked the hot stone massage on a whim and now I am hooked. Will be making this a monthly ritual.' },
  { id: 'f-12', specialistId: '2', clientName: 'Nanjala Mutuku', serviceId: '2', date: '2026-06-07', rating: 5, comment: 'Grace is simply the best massage therapist I have encountered. Strong hands, warm heart, perfect technique.' },

  // Fatima Hassan — Nail Artist
  { id: 'f-13', specialistId: '3', clientName: 'Nyambura Nafula', serviceId: '3', date: '2026-06-27', rating: 5, comment: 'My gel mani-pedi lasted three full weeks without a single chip. Fatima takes such pride in her work.' },
  { id: 'f-14', specialistId: '3', clientName: 'Chebet Wairimu', serviceId: '7', date: '2026-06-24', rating: 5, comment: 'She created the most beautiful nail art I have seen. People at the office kept stopping to ask where I got my nails done.' },
  { id: 'f-15', specialistId: '3', clientName: 'Muthoni Njoroge', serviceId: '3', date: '2026-06-20', rating: 4, comment: 'Very precise and clean work. The mani-pedi combo was great value. I did want slightly more massage time for the feet.' },
  { id: 'f-16', specialistId: '3', clientName: 'Wangari Kariuki', serviceId: '7', date: '2026-06-15', rating: 5, comment: 'Fatima is an artist. She suggested a colour combination I never would have picked myself and it looked stunning.' },
  { id: 'f-17', specialistId: '3', clientName: 'Akinyi Omondi', serviceId: '3', date: '2026-06-09', rating: 5, comment: 'Best nail salon experience in Nairobi by far. Clean, professional, and the result is always perfect.' },

  // Zoe Kimani — Hair Stylist
  { id: 'f-18', specialistId: '4', clientName: 'Nduta Wamalwa', serviceId: '4', date: '2026-06-28', rating: 5, comment: 'The keratin treatment Zoe did has completely transformed my hair. It is smooth, shiny, and manages itself.' },
  { id: 'f-19', specialistId: '4', clientName: 'Kemboi Muthoni', serviceId: '4', date: '2026-06-24', rating: 5, comment: 'Zoe truly understands hair texture and what each client needs. I stopped going to my old salon after just one visit here.' },
  { id: 'f-20', specialistId: '4', clientName: 'Omondi Chebet', serviceId: '4', date: '2026-06-21', rating: 5, comment: 'I was nervous about the treatment but Zoe walked me through every step. My hair has never been healthier.' },
  { id: 'f-21', specialistId: '4', clientName: 'Nafula Wangari', serviceId: '4', date: '2026-06-17', rating: 4, comment: 'Great results overall. The treatment took slightly longer than quoted but the final look was absolutely worth the wait.' },
  { id: 'f-22', specialistId: '4', clientName: 'Wairimu Nanjala', serviceId: '4', date: '2026-06-12', rating: 5, comment: 'Zoe is incredibly skilled. She salvaged hair that I had almost given up on and made it look brand new.' },

  // Aisha Mwangi — Beauty Therapist
  { id: 'f-23', specialistId: '5', clientName: 'Njoroge Nyambura', serviceId: '1', date: '2026-06-26', rating: 5, comment: 'Aisha made me look like royalty for my sister\'s wedding. She is so warm and genuinely listens to what you want.' },
  { id: 'f-24', specialistId: '5', clientName: 'Kariuki Ochieng', serviceId: '8', date: '2026-06-22', rating: 5, comment: 'The hydrating body wrap with Aisha was deeply relaxing. She has a calming presence that makes the whole experience special.' },
  { id: 'f-25', specialistId: '5', clientName: 'Mutuku Akinyi', serviceId: '6', date: '2026-06-19', rating: 4, comment: 'The express facial was great for a lunch break treatment. Aisha works efficiently without making you feel rushed at all.' },
  { id: 'f-26', specialistId: '5', clientName: 'Wamalwa Chebet', serviceId: '8', date: '2026-06-15', rating: 5, comment: 'I come back every month specifically for Aisha\'s body wrap. It is the best investment I make in myself.' },
  { id: 'f-27', specialistId: '5', clientName: 'Ochieng Kemboi', serviceId: '1', date: '2026-06-11', rating: 5, comment: 'She noticed the stress in my face before I said a word. By the end of the session I felt completely renewed.' },
];

export const tips: Tip[] = [
  // Amara Wanjiku
  { id: 't-1', specialistId: '1', clientName: 'Nyambura Chebet', serviceId: '1', date: '2026-06-25', amount: 500 },
  { id: 't-2', specialistId: '1', clientName: 'Wangari Nduta', serviceId: '6', date: '2026-06-22', amount: 300 },
  { id: 't-3', specialistId: '1', clientName: 'Akinyi Wairimu', serviceId: '1', date: '2026-06-18', amount: 400 },
  { id: 't-4', specialistId: '1', clientName: 'Muthoni Ochieng', serviceId: '6', date: '2026-06-14', amount: 200 },
  { id: 't-5', specialistId: '1', clientName: 'Nafula Kemboi', serviceId: '1', date: '2026-06-10', amount: 500 },
  // Grace Odhiambo
  { id: 't-6', specialistId: '2', clientName: 'Kariuki Wamalwa', serviceId: '2', date: '2026-06-26', amount: 500 },
  { id: 't-7', specialistId: '2', clientName: 'Mutuku Omondi', serviceId: '5', date: '2026-06-23', amount: 350 },
  { id: 't-8', specialistId: '2', clientName: 'Njoroge Akinyi', serviceId: '2', date: '2026-06-19', amount: 400 },
  { id: 't-9', specialistId: '2', clientName: 'Ochieng Nduta', serviceId: '5', date: '2026-06-11', amount: 300 },
  // Fatima Hassan
  { id: 't-10', specialistId: '3', clientName: 'Nyambura Nafula', serviceId: '3', date: '2026-06-27', amount: 300 },
  { id: 't-11', specialistId: '3', clientName: 'Chebet Wairimu', serviceId: '7', date: '2026-06-24', amount: 250 },
  { id: 't-12', specialistId: '3', clientName: 'Muthoni Njoroge', serviceId: '3', date: '2026-06-20', amount: 200 },
  { id: 't-13', specialistId: '3', clientName: 'Wangari Kariuki', serviceId: '7', date: '2026-06-15', amount: 300 },
  // Zoe Kimani
  { id: 't-14', specialistId: '4', clientName: 'Nduta Wamalwa', serviceId: '4', date: '2026-06-28', amount: 500 },
  { id: 't-15', specialistId: '4', clientName: 'Kemboi Muthoni', serviceId: '4', date: '2026-06-24', amount: 400 },
  { id: 't-16', specialistId: '4', clientName: 'Omondi Chebet', serviceId: '4', date: '2026-06-21', amount: 350 },
  // Aisha Mwangi
  { id: 't-17', specialistId: '5', clientName: 'Njoroge Nyambura', serviceId: '1', date: '2026-06-26', amount: 500 },
  { id: 't-18', specialistId: '5', clientName: 'Kariuki Ochieng', serviceId: '8', date: '2026-06-22', amount: 400 },
  { id: 't-19', specialistId: '5', clientName: 'Mutuku Akinyi', serviceId: '6', date: '2026-06-19', amount: 200 },
  { id: 't-20', specialistId: '5', clientName: 'Wamalwa Chebet', serviceId: '8', date: '2026-06-15', amount: 450 },
];
