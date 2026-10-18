/**
 * Place photo resolver and curated image catalog for destinations and landmarks.
 * Combines high-resolution curated photography with dynamic Wikipedia Commons summary lookup.
 */

interface PhotoResult {
  url: string;
  source: 'curated' | 'wikipedia' | 'category' | 'destination';
  caption?: string;
}

// Curated high-resolution Unsplash photographs for world-famous landmarks
const CURATED_LANDMARKS: Array<{
  keywords: string[];
  url: string;
  caption: string;
}> = [
  // Rome / Italy
  {
    keywords: ['colosseum', 'colosseo', 'flavian amphitheatre'],
    url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    caption: 'Colosseum, Rome',
  },
  {
    keywords: ['vatican', 'st. peter', 'saint peter', 'sistine', 'basilica di san pietro'],
    url: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=1200&q=80',
    caption: 'St. Peter\'s Basilica & Vatican, Rome',
  },
  {
    keywords: ['trevi', 'fontana di trevi'],
    url: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1200&q=80',
    caption: 'Trevi Fountain, Rome',
  },
  {
    keywords: ['pantheon', 'piazza della rotonda'],
    url: 'https://images.unsplash.com/photo-1542820229-081e0c12af0b?auto=format&fit=crop&w=1200&q=80',
    caption: 'The Pantheon, Rome',
  },
  {
    keywords: ['roman forum', 'foro romano', 'palatine hill'],
    url: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80',
    caption: 'Roman Forum, Rome',
  },
  {
    keywords: ['piazza navona', 'fountain of the four rivers', 'fontana dei quattro fiumi'],
    url: 'https://images.unsplash.com/photo-1529154036614-a60975f5c760?auto=format&fit=crop&w=1200&q=80',
    caption: 'Piazza Navona, Rome',
  },
  {
    keywords: ['trastevere', 'santa maria in trastevere'],
    url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
    caption: 'Trastevere Streets, Rome',
  },
  {
    keywords: ['spanish steps', 'scalinata di trinità dei monti', 'piazza di spagna'],
    url: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=1200&q=80',
    caption: 'Spanish Steps, Rome',
  },
  {
    keywords: ['borghese', 'villa borghese', 'galleria borghese'],
    url: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
    caption: 'Villa Borghese Gardens, Rome',
  },
  {
    keywords: ['castel sant\'angelo', 'castel sant angelo', 'hadrian mausoleum'],
    url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    caption: 'Castel Sant\'Angelo, Rome',
  },

  // Florence & Venice & Italy
  {
    keywords: ['florence', 'duomo', 'firenze', 'santa maria del fiore'],
    url: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=1200&q=80',
    caption: 'Florence Duomo, Italy',
  },
  {
    keywords: ['ponte vecchio', 'uffizi'],
    url: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1200&q=80',
    caption: 'Ponte Vecchio, Florence',
  },
  {
    keywords: ['venice', 'grand canal', 'rialto', 'san marco', 'st. mark', 'gondola'],
    url: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80',
    caption: 'Grand Canal, Venice',
  },
  {
    keywords: ['amalfi', 'positano', 'ravello', 'capri'],
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    caption: 'Amalfi Coast, Italy',
  },
  {
    keywords: ['milan', 'milano', 'duomo di milano', 'galleria vittorio'],
    url: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=1200&q=80',
    caption: 'Duomo di Milano, Italy',
  },

  // Japan
  {
    keywords: ['fushimi inari', 'torii gates', 'thousand torii'],
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    caption: 'Fushimi Inari Shrine, Kyoto',
  },
  {
    keywords: ['kiyomizu', 'kiyomizu-dera'],
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    caption: 'Kiyomizu-dera Temple, Kyoto',
  },
  {
    keywords: ['arashiyama', 'bamboo grove'],
    url: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=1200&q=80',
    caption: 'Arashiyama Bamboo Forest, Kyoto',
  },
  {
    keywords: ['kinkaku', 'golden pavilion'],
    url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
    caption: 'Kinkaku-ji (Golden Pavilion), Kyoto',
  },
  {
    keywords: ['shibuya', 'shibuya crossing', 'tokyo tower', 'shinjuku'],
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    caption: 'Tokyo, Japan',
  },
  {
    keywords: ['mount fuji', 'mt fuji', 'lake kawaguchiko'],
    url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1200&q=80',
    caption: 'Mount Fuji, Japan',
  },

  // France
  {
    keywords: ['eiffel', 'tour eiffel', 'champ de mars'],
    url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
    caption: 'Eiffel Tower, Paris',
  },
  {
    keywords: ['louvre', 'musee du louvre'],
    url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
    caption: 'Louvre Museum, Paris',
  },
  {
    keywords: ['notre dame', 'notre-dame', 'sainte-chapelle'],
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    caption: 'Paris, France',
  },

  // UK & USA & Spain & Other
  {
    keywords: ['big ben', 'westminster', 'london eye', 'tower bridge'],
    url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
    caption: 'London, United Kingdom',
  },
  {
    keywords: ['sagrada', 'sagrada familia', 'park guell', 'casa batllo'],
    url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
    caption: 'Sagrada Familia, Barcelona',
  },
  {
    keywords: ['central park', 'times square', 'manhattan', 'brooklyn bridge'],
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    caption: 'New York City, USA',
  },
  {
    keywords: ['taj mahal', 'agra fort'],
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    caption: 'Taj Mahal, India',
  },
  {
    keywords: ['santorini', 'oia', 'mykonos'],
    url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    caption: 'Santorini, Greece',
  },
];

// Curated travel categories for generic activities
const CATEGORY_PHOTOS: Array<{
  keywords: string[];
  url: string;
  caption: string;
}> = [
  {
    keywords: ['hotel', 'check-in', 'check in', 'resort', 'inn', 'stay', 'lodging', 'hostel', 'villa'],
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    caption: 'Hotel & Stay',
  },
  {
    keywords: ['dinner', 'lunch', 'restaurant', 'trattoria', 'osteria', 'food', 'pasta', 'pizza', 'dining', 'cuisine', 'tasting', 'ristorante'],
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    caption: 'Dining & Gastronomy',
  },
  {
    keywords: ['cafe', 'coffee', 'breakfast', 'gelato', 'bakery', 'pastry', 'croissant', 'espresso', 'tea'],
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    caption: 'Café & Refreshments',
  },
  {
    keywords: ['museum', 'gallery', 'art', 'exhibition', 'sculpture', 'artifacts'],
    url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80',
    caption: 'Museum & Culture',
  },
  {
    keywords: ['park', 'garden', 'nature', 'walk', 'hike', 'trail', 'viewpoint', 'sunset', 'panoramic', 'mirador'],
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    caption: 'Scenic Viewpoint & Park',
  },
  {
    keywords: ['market', 'shopping', 'bazaar', 'store', 'boutique', 'souvenir'],
    url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80',
    caption: 'Local Market & Shopping',
  },
  {
    keywords: ['beach', 'coast', 'sea', 'ocean', 'boat', 'cruise', 'island', 'ferry', 'harbor', 'port'],
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    caption: 'Coast & Harbor',
  },
];

// Curated destinations hero images
const DESTINATION_HEROES: Record<string, { url: string; caption: string }> = {
  rome: {
    url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80',
    caption: 'Rome, Italy',
  },
  italy: {
    url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=80',
    caption: 'Italy',
  },
  kyoto: {
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
    caption: 'Kyoto, Japan',
  },
  japan: {
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80',
    caption: 'Japan',
  },
  tokyo: {
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80',
    caption: 'Tokyo, Japan',
  },
  paris: {
    url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1600&q=80',
    caption: 'Paris, France',
  },
  france: {
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80',
    caption: 'France',
  },
  london: {
    url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=80',
    caption: 'London, UK',
  },
  barcelona: {
    url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1600&q=80',
    caption: 'Barcelona, Spain',
  },
  'new york': {
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=80',
    caption: 'New York, USA',
  },
};

const DEFAULT_TRAVEL_HERO = {
  url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80',
  caption: 'Travel Destination',
};

// In-memory cache for Wikipedia thumbnail lookups
const wikiCache = new Map<string, PhotoResult | null>();

/**
 * Normalizes text for keyword matching
 */
function clean(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Returns a curated landmark photo if text matches known landmarks.
 */
export function getCuratedLandmarkPhoto(
  title: string,
  locationName?: string | null,
): PhotoResult | null {
  const combined = clean(`${title} ${locationName ?? ''}`);

  for (const item of CURATED_LANDMARKS) {
    for (const keyword of item.keywords) {
      if (combined.includes(keyword)) {
        return {
          url: item.url,
          source: 'curated',
          caption: item.caption,
        };
      }
    }
  }

  return null;
}

/**
 * Returns a category-based photo based on the activity title/notes.
 */
export function getCategoryPhoto(
  title: string,
  notes?: string | null,
): PhotoResult | null {
  const combined = clean(`${title} ${notes ?? ''}`);

  for (const item of CATEGORY_PHOTOS) {
    for (const keyword of item.keywords) {
      if (combined.includes(keyword)) {
        return {
          url: item.url,
          source: 'category',
          caption: item.caption,
        };
      }
    }
  }

  return null;
}

/**
 * Returns a hero banner image for a given destination.
 */
export function getDestinationHero(destination?: string | null): PhotoResult {
  if (!destination) {
    return { ...DEFAULT_TRAVEL_HERO, source: 'destination' };
  }

  const normalized = clean(destination);
  for (const [key, hero] of Object.entries(DESTINATION_HEROES)) {
    if (normalized.includes(key)) {
      return {
        url: hero.url,
        caption: hero.caption,
        source: 'destination',
      };
    }
  }

  return { ...DEFAULT_TRAVEL_HERO, source: 'destination', caption: destination };
}

/**
 * Fetches Wikipedia summary thumbnail for any place / landmark.
 * Runs client-side or server-side with CORS support.
 */
export async function fetchWikipediaPlacePhoto(
  placeName: string,
): Promise<PhotoResult | null> {
  const query = placeName.trim();
  if (!query) return null;

  const cacheKey = clean(query);
  if (wikiCache.has(cacheKey)) {
    return wikiCache.get(cacheKey) ?? null;
  }

  try {
    // Sanitize title for Wikipedia page URL
    const pageTitle = query.replace(/\s+/g, '_');
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!res.ok) {
      wikiCache.set(cacheKey, null);
      return null;
    }

    const data = (await res.json()) as {
      thumbnail?: { source?: string };
      description?: string;
      title?: string;
    };

    const sourceUrl = data.thumbnail?.source;
    if (sourceUrl && !sourceUrl.endsWith('.svg')) {
      const result: PhotoResult = {
        url: sourceUrl,
        source: 'wikipedia',
        caption: data.title || query,
      };
      wikiCache.set(cacheKey, result);
      return result;
    }

    wikiCache.set(cacheKey, null);
    return null;
  } catch {
    wikiCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Resolves a photo for a blog post using its cover image, tags, or title.
 */
export function resolvePostCover(post: {
  title: string;
  coverImage?: string | null;
  tags?: string[];
}): PhotoResult {
  if (post.coverImage) {
    return {
      url: post.coverImage,
      source: 'curated',
      caption: post.title,
    };
  }

  const tagString = (post.tags || []).join(' ');
  const curated =
    getCuratedLandmarkPhoto(post.title, tagString) ||
    getDestinationHero(tagString) ||
    getCategoryPhoto(post.title) ||
    getDestinationHero(post.title);

  return curated;
}

/**
 * Resolves a photo for a trip card using destination and title.
 */
export function resolveTripPhoto(
  destination: string,
  title?: string,
): PhotoResult {
  return (
    getCuratedLandmarkPhoto(title || '', destination) ||
    getDestinationHero(destination) ||
    getDestinationHero(title)
  );
}
