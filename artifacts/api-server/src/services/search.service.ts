import { prisma } from '../database/prisma';

interface SearchParams {
  q?: string;
  category?: string;
  county?: string;
  minRating?: number;
  lat?: number;
  lon?: number;
  radius?: number; // km
  page?: number;
  limit?: number;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export class SearchService {
  async searchSpas(params: SearchParams) {
    const { q, category, county, minRating = 0, lat, lon, radius = 25, page = 1, limit = 20 } = params;

    const where: any = {
      approvalStatus: 'APPROVED',
      isActive: true,
      rating: { gte: minRating },
    };

    if (county) where.county = { contains: county, mode: 'insensitive' };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { brandStory: { contains: q, mode: 'insensitive' } },
      ];
    }

    let spas = await prisma.spa.findMany({
      where,
      include: {
        services: {
          where: category ? { category: { contains: category, mode: 'insensitive' } } : undefined,
          select: { id: true, name: true, category: true, price: true, duration: true },
          take: 5,
        },
        therapists: { where: { isActive: true }, select: { id: true, name: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Filter by service category (if a spa has no matching services, drop it)
    if (category) {
      spas = spas.filter((s) => s.services.length > 0);
    }

    // Geo-filter and annotate with distance
    let results = spas.map((spa) => {
      let distance: number | null = null;
      if (lat != null && lon != null && spa.latitude && spa.longitude) {
        distance = Math.round(haversineKm(lat, lon, spa.latitude, spa.longitude) * 10) / 10;
      }
      return { ...spa, distance };
    });

    // Filter by radius
    if (lat != null && lon != null) {
      results = results.filter((s) => s.distance == null || s.distance <= radius);
    }

    // Sort: nearest first, then highest rated
    results.sort((a, b) => {
      if (a.distance != null && b.distance != null) return a.distance - b.distance;
      return b.rating - a.rating;
    });

    const total = await prisma.spa.count({ where });

    return {
      results,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async searchServices(params: { q?: string; spaId?: string; category?: string; maxPrice?: number }) {
    const { q, spaId, category, maxPrice } = params;
    const where: any = { isActive: true };
    if (spaId) where.spaId = spaId;
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (maxPrice) where.price = { lte: maxPrice };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    return prisma.service.findMany({
      where,
      include: { spa: { select: { id: true, name: true, county: true, rating: true } } },
      orderBy: { rating: 'desc' },
      take: 50,
    });
  }
}

export const searchService = new SearchService();
