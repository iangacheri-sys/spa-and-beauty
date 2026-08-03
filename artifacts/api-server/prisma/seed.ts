/**
 * Comprehensive database seed for BeautyBooker
 *
 * Creates a realistic dataset matching all demo accounts in the admin Login page:
 *   - Platform Admin:     0700000000 / password
 *   - Kilifi Spa Owner:   0712121212 / password  (Bofa Beach Wellness)
 *   - Kilifi Therapist:   0713131313 / password  (Esther Omondi)
 *   - Demo Customer:      0744444444 / password
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding BeautyBooker database...\n');

  // ── Cleanup (idempotent) ─────────────────────────────────────────────────
  await prisma.chatMessage.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.therapist.deleteMany();
  await prisma.spaPolicy.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.product.deleteMany();
  await prisma.classEnrollment.deleteMany();
  await prisma.trainingClass.deleteMany();
  // Clean up models added for production auth
  await prisma.session.deleteMany();
  await prisma.otpCode.deleteMany();
  // Delete spa-related configs before spas
  if ((prisma as any).spaPaymentSettings) {
    await (prisma as any).spaPaymentSettings.deleteMany();
  }
  await prisma.spa.deleteMany();
  // Delete user-owned records before users
  await prisma.loyaltyAccount.deleteMany();
  await prisma.deviceToken.deleteMany();
  if ((prisma as any).beautyWallet) {
    await (prisma as any).beautyWallet.deleteMany();
  }
  await prisma.user.deleteMany();

  const HASH = await bcrypt.hash('password', 10);

  // ── Users ───────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: { name: 'Super Admin', phone: '0700000000', password: HASH, role: 'PLATFORM_ADMIN', email: 'admin@beautybooker.io', isDemo: true, accountStatus: 'ACTIVE', phoneVerified: true },
  });

  const owner = await prisma.user.create({
    data: { name: 'Amani Karanja', phone: '0712121212', password: HASH, role: 'SPA_OWNER', email: 'amani@bofawellness.co.ke', isDemo: true, accountStatus: 'ACTIVE', phoneVerified: true },
  });

  const therapistUser = await prisma.user.create({
    data: { name: 'Esther Omondi', phone: '0713131313', password: HASH, role: 'THERAPIST', email: 'esther@bofawellness.co.ke', isDemo: true, accountStatus: 'ACTIVE', phoneVerified: true },
  });

  const customer1 = await prisma.user.create({
    data: { name: 'Demo Client', phone: '0744444444', password: HASH, role: 'CUSTOMER', email: 'client@demo.com', isDemo: true, accountStatus: 'ACTIVE', phoneVerified: true },
  });

  const customer2 = await prisma.user.create({
    data: { name: 'Sarah Njeri', phone: '0799999999', password: HASH, role: 'CUSTOMER', isDemo: true, accountStatus: 'ACTIVE', phoneVerified: true },
  });

  const customer3 = await prisma.user.create({
    data: { name: 'Wanjiku Mwangi', phone: '0700000001', password: HASH, role: 'CUSTOMER', isDemo: true, accountStatus: 'ACTIVE', phoneVerified: true },
  });

  console.log('✓  Users created');

  // ── Spa ─────────────────────────────────────────────────────────────────
  const spa = await prisma.spa.create({
    data: {
      ownerId: owner.id,
      name: 'Bofa Beach Wellness',
      brandStory: 'A sanctuary of calm on the shores of Kilifi Creek. We combine ancient African healing traditions with modern luxury spa techniques.',
      address: 'Bofa Road, Kilifi',
      county: 'Kilifi',
      latitude: -3.6317,
      longitude: 39.8499,
      verified: true,
      rating: 4.8,
      phone: '+254 712 121 212',
      email: 'bookings@bofawellness.co.ke',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800',
      subscriptionTier: 'PROFESSIONAL',
      approvalStatus: 'APPROVED',
      isActive: true,
    },
  });

  console.log('✓  Spa created:', spa.name);

  // ── Staff ────────────────────────────────────────────────────────────────
  await prisma.staff.create({
    data: { userId: therapistUser.id, spaId: spa.id, role: 'THERAPIST', isActive: true },
  });

  // ── Therapist Profile ────────────────────────────────────────────────────
  const therapist = await prisma.therapist.create({
    data: {
      spaId: spa.id,
      userId: therapistUser.id,
      name: 'Esther Omondi',
      specialties: ['Swedish Massage', 'Hot Stone Therapy', 'Aromatherapy'],
      bio: 'Certified massage therapist with 8 years of experience in holistic wellness. Passionate about helping clients achieve deep relaxation and pain relief.',
      isActive: true,
    },
  });

  console.log('✓  Therapist profile created:', therapist.name);

  // ── SpaPolicy ───────────────────────────────────────────────────────────
  await prisma.spaPolicy.create({
    data: {
      spaId: spa.id,
      depositType: 'percentage',
      depositPercent: 30,
      depositFixed: 0,
      depositMinBookingValue: 2000,
      depositAppliesTo: 'all',
      depositPolicyText: 'A 30% deposit is required for all bookings over Ksh 2,000.',
      freeCancellationHours: 24,
      lateCancelRetainPercent: 50,
      refundPolicy: 'partial',
      rescheduleAllowed: true,
      rescheduleLimitHours: 12,
      cancellationPolicyText: 'Cancellations within 24 hours forfeit 50% of the deposit.',
      noShowRetainPercent: 100,
      noShowPolicyText: 'No-shows will be charged the full deposit amount.',
    },
  });

  console.log('✓  Spa policy created');

  // ── Services ─────────────────────────────────────────────────────────────
  const services = await prisma.service.createMany({
    data: [
      {
        spaId: spa.id,
        name: 'Swedish Full Body Massage',
        category: 'Massage',
        duration: 60,
        price: 3500,
        description: 'A classic full-body Swedish massage using long, flowing strokes to relax muscles and improve circulation.',
        image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=500',
        rating: 4.9,
        reviewCount: 87,
        isActive: true,
      },
      {
        spaId: spa.id,
        name: 'Deep Tissue Massage',
        category: 'Massage',
        duration: 90,
        price: 5500,
        description: 'Targets deep muscle layers to relieve chronic tension and pain. Ideal for athletes and those with muscle soreness.',
        image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=500',
        rating: 4.8,
        reviewCount: 53,
        isActive: true,
      },
      {
        spaId: spa.id,
        name: 'Luxury Facial',
        category: 'Facial',
        duration: 75,
        price: 4200,
        description: 'A premium facial using organic botanical serums and extracts to deeply cleanse, hydrate, and brighten your complexion.',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=500',
        rating: 4.9,
        reviewCount: 64,
        isActive: true,
      },
      {
        spaId: spa.id,
        name: 'Manicure & Pedicure Combo',
        category: 'Nails',
        duration: 90,
        price: 2800,
        description: 'Complete hand and foot care with nail shaping, cuticle care, scrub, and your choice of gel colour.',
        image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=500',
        rating: 4.7,
        reviewCount: 112,
        isActive: true,
      },
      {
        spaId: spa.id,
        name: 'Hot Stone Therapy',
        category: 'Body',
        duration: 75,
        price: 4800,
        description: 'Heated volcanic stones are used alongside massage to ease muscle stiffness and increase circulation.',
        image: 'https://images.unsplash.com/photo-1544161513-01f11a4331e8?auto=format&fit=crop&q=80&w=500',
        rating: 4.9,
        reviewCount: 38,
        isActive: true,
      },
      {
        spaId: spa.id,
        name: 'Aromatherapy Wrap',
        category: 'Body',
        duration: 60,
        price: 3800,
        description: 'A full-body wrap using aromatic essential oils to detoxify, nourish, and leave skin silky smooth.',
        image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=500',
        rating: 4.8,
        reviewCount: 29,
        isActive: true,
      },
    ],
  });


  const allServices = await prisma.service.findMany({ where: { spaId: spa.id } });
  console.log(`✓  ${allServices.length} services created`);

  // ── Products ─────────────────────────────────────────────────────────────
  const products = await prisma.product.createMany({
    data: [
      {
        spaId: spa.id,
        name: 'Organic Shea Butter Lotion',
        category: 'Skincare',
        price: 1200,
        rating: 4.8,
        reviews: 42,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=500',
      },
      {
        spaId: spa.id,
        name: 'Lavender Essential Oil',
        category: 'Aromatherapy',
        price: 850,
        rating: 4.9,
        reviews: 120,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1608248593875-c54641d40268?auto=format&fit=crop&q=80&w=500',
      },
      {
        spaId: spa.id,
        name: 'Vitamin C Brightening Serum',
        category: 'Skincare',
        price: 2500,
        rating: 4.7,
        reviews: 85,
        stock: 10,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=500',
      },
      {
        spaId: spa.id,
        name: 'Exfoliating Sea Salt Scrub',
        category: 'Body Care',
        price: 1500,
        rating: 4.6,
        reviews: 56,
        stock: 22,
        image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=500',
      }
    ],
  });
  console.log(`✓  4 products created`);

  // ── Training Classes ─────────────────────────────────────────────────────
  await prisma.trainingClass.create({
    data: {
      spaId: spa.id,
      title: 'Advanced Massage Techniques',
      instructor: 'Esther Omondi',
      description: 'A deep dive into advanced tissue manipulation for certified therapists.',
      date: '2026-08-15',
      startTime: '09:00',
      endTime: '16:00',
      capacity: 10,
      fee: 15000,
      location: 'Kilifi Studio',
      isPublished: true,
      enrolled: {
        create: [
          { userId: customer1.id, status: 'enrolled' }
        ]
      }
    }
  });
  console.log(`✓  1 training class created`);

  // ── Bookings ─────────────────────────────────────────────────────────────
  const s = (name: string) => allServices.find((sv) => sv.name === name)!;

  const bookingsData = [
    // Completed bookings (generate revenue)
    { userId: customer1.id, serviceId: s('Swedish Full Body Massage').id, date: '2026-07-01', timeSlot: '10:00', price: 3500, status: 'COMPLETED', paymentStatus: 'PAID', paymentMethod: 'MPESA_PAYBILL' },
    { userId: customer2.id, serviceId: s('Luxury Facial').id, date: '2026-07-05', timeSlot: '14:00', price: 4200, status: 'COMPLETED', paymentStatus: 'PAID', paymentMethod: 'MPESA_POCHI' },
    { userId: customer3.id, serviceId: s('Manicure & Pedicure Combo').id, date: '2026-07-08', timeSlot: '11:00', price: 2800, status: 'COMPLETED', paymentStatus: 'PAID', paymentMethod: 'CARD' },
    { userId: customer1.id, serviceId: s('Hot Stone Therapy').id, date: '2026-07-12', timeSlot: '09:00', price: 4800, status: 'COMPLETED', paymentStatus: 'PAID', paymentMethod: 'MPESA_PAYBILL' },
    { userId: customer2.id, serviceId: s('Deep Tissue Massage').id, date: '2026-07-15', timeSlot: '15:30', price: 5500, status: 'COMPLETED', paymentStatus: 'PAID', paymentMethod: 'MPESA_POCHI' },
    { userId: customer3.id, serviceId: s('Aromatherapy Wrap').id, date: '2026-07-18', timeSlot: '13:00', price: 3800, status: 'COMPLETED', paymentStatus: 'PAID', paymentMethod: 'CARD' },
    // Cancelled
    { userId: customer1.id, serviceId: s('Swedish Full Body Massage').id, date: '2026-07-20', timeSlot: '10:00', price: 3500, status: 'CANCELLED', paymentStatus: 'REFUNDED', paymentMethod: 'MPESA_PAYBILL' },
    // Upcoming
    { userId: customer2.id, serviceId: s('Luxury Facial').id, date: '2026-07-28', timeSlot: '11:00', price: 4200, status: 'UPCOMING', paymentStatus: 'PENDING', paymentMethod: 'MPESA_PAYBILL' },
    { userId: customer3.id, serviceId: s('Hot Stone Therapy').id, date: '2026-07-30', timeSlot: '14:00', price: 4800, status: 'UPCOMING', paymentStatus: 'PENDING', paymentMethod: 'CARD' },
    { userId: customer1.id, serviceId: s('Deep Tissue Massage').id, date: '2026-08-02', timeSlot: '09:30', price: 5500, status: 'UPCOMING', paymentStatus: 'PENDING', paymentMethod: 'MPESA_POCHI' },
  ];

  for (const b of bookingsData) {
    await prisma.booking.create({
      data: {
        spaId: spa.id,
        therapistId: therapist.id,
        policyAcknowledged: true,
        ...b,
      } as any,
    });
  }

  console.log(`✓  ${bookingsData.length} bookings created`);

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n🎉  Database seeded successfully!\n');
  console.log('─────────────────────────────────────────────────');
  console.log('  Demo Credentials (password: "password")');
  console.log('─────────────────────────────────────────────────');
  console.log(`  Platform Admin:  ${admin.phone}`);
  console.log(`  Spa Owner:       ${owner.phone}  (${spa.name})`);
  console.log(`  Therapist:       ${therapistUser.phone}  (${therapist.name})`);
  console.log(`  Customer:        ${customer1.phone}  (${customer1.name})`);
  console.log('─────────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
