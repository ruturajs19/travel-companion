import { Injectable } from '@nestjs/common';
import type { AIProvider } from './ai.provider.js';
import type {
  GeneratedDay,
  GeneratedItinerary,
  GroundedAnswer,
  GroundedQARequest,
  ItineraryRequest,
  RefineRequest,
} from '@travel-companion/contracts';

export function generateRichMockItinerary(
  input: ItineraryRequest,
): GeneratedItinerary {
  const destination = input.destination.trim();
  const lower = destination.toLowerCase();
  const budget = input.budgetLevel ?? 'MEDIUM';

  const isItaly = lower.includes('italy') || lower.includes('rome') || lower.includes('roma');
  const isJapan = lower.includes('japan') || lower.includes('tokyo') || lower.includes('kyoto');
  const isFrance = lower.includes('france') || lower.includes('paris');

  const hotelTiers: Record<string, string> = {
    LOW: `Cozy central guesthouse/hostel in ${destination}`,
    MEDIUM: `Boutique hotel with breakfast in downtown ${destination}`,
    HIGH: `Luxury 5-star hotel & spa in ${destination}`,
  };
  const selectedHotel = hotelTiers[budget] ?? hotelTiers.MEDIUM;

  const italyPlans = [
    {
      summary: `Day 1: Ancient Rome & Heart of the City. Lodging: ${selectedHotel} in Monti or Centro Storico.`,
      activities: [
        {
          timeSlot: 'MORNING' as const,
          title: 'Explore the Colosseum and Roman Forum',
          locationName: 'Colosseum & Roman Forum, Rome',
          notes: 'Pre-book skip-the-line tickets online. Walk through the monumental arena and explore the ancient ruins of the Roman Forum and Palatine Hill.',
          estimatedCost: budget === 'HIGH' ? 65 : budget === 'LOW' ? 20 : 35,
        },
        {
          timeSlot: 'AFTERNOON' as const,
          title: 'Authentic Roman Pasta Lunch & Pantheon Visit',
          locationName: 'Roscioli Salumeria con Cucina',
          notes: 'Try world-class Carbonara or Cacio e Pepe. Afterwards, walk off lunch by marveling at the dome of the Pantheon and Piazza Navona.',
          estimatedCost: budget === 'HIGH' ? 80 : budget === 'LOW' ? 18 : 38,
        },
        {
          timeSlot: 'EVENING' as const,
          title: 'Trevi Fountain Coin Toss & Artisan Gelato',
          locationName: 'Trevi Fountain & Giolitti Gelateria',
          notes: 'Toss a coin over your shoulder into the illuminated fountain, then grab pistachio and zabaglione gelato at historic Giolitti.',
          estimatedCost: 10,
        },
      ],
    },
    {
      summary: `Day 2: Vatican City & Vibrant Trastevere. Lodging: ${selectedHotel} near Prati or Trastevere.`,
      activities: [
        {
          timeSlot: 'MORNING' as const,
          title: 'Vatican Museums and the Sistine Chapel',
          locationName: 'Vatican Museums, Vatican City',
          notes: 'Reserve early morning access. Admire Michelangelo’s frescoes in the Sistine Chapel and Raphael’s Rooms. Dress modestly (shoulders/knees covered).',
          estimatedCost: budget === 'HIGH' ? 75 : budget === 'LOW' ? 25 : 40,
        },
        {
          timeSlot: 'AFTERNOON' as const,
          title: "St. Peter's Basilica & Dome Climb",
          locationName: "St. Peter's Basilica, Vatican City",
          notes: 'Climb the dome stairs or elevator for breathtaking 360-degree vistas across Rome and St. Peter’s Square.',
          estimatedCost: 15,
        },
        {
          timeSlot: 'EVENING' as const,
          title: 'Dinner & Wine Tasting in Trastevere',
          locationName: 'Trattoria Da Enzo al 29, Trastevere',
          notes: 'Famous for fried artichokes alla giudia and tiramisu. Enjoy an evening stroll along the cobbled, lantern-lit streets.',
          estimatedCost: budget === 'HIGH' ? 95 : budget === 'LOW' ? 25 : 48,
        },
      ],
    },
    {
      summary: `Day 3: Renaissance Masterpieces & Spanish Steps. Lodging: ${selectedHotel}.`,
      activities: [
        {
          timeSlot: 'MORNING' as const,
          title: 'Galleria Borghese Sculptures & Villa Borghese Gardens',
          locationName: 'Galleria Borghese, Rome',
          notes: 'Mandatory timed reservation. View masterpieces by Bernini and Caravaggio, then stroll through the scenic park.',
          estimatedCost: budget === 'HIGH' ? 50 : budget === 'LOW' ? 18 : 28,
        },
        {
          timeSlot: 'AFTERNOON' as const,
          title: 'Spanish Steps & Via dei Condotti Stroll',
          locationName: 'Spanish Steps & Antico Caffè Greco',
          notes: 'Enjoy an espresso at Rome’s oldest cafe (founded in 1760) and browse boutique shopping corridors.',
          estimatedCost: 20,
        },
        {
          timeSlot: 'EVENING' as const,
          title: 'Farewell Italian Dinner near the Pantheon',
          locationName: 'Armando al Pantheon',
          notes: 'Family-run culinary landmark celebrated for saltimbocca alla romana and roast lamb. Reservations required.',
          estimatedCost: budget === 'HIGH' ? 110 : budget === 'LOW' ? 30 : 60,
        },
      ],
    },
  ];

  const defaultTemplates = [
    {
      titleSuffix: 'Historic Center & Iconic Landmark',
      loc: `${destination} Heritage Center & Landmark`,
      notes: `Recommended stay: ${selectedHotel}. Start the trip with the most famous historic sights and landmarks.`,
      cost: budget === 'HIGH' ? 45 : budget === 'LOW' ? 10 : 25,
      lunchTitle: 'Authentic lunch & old town stroll',
      lunchLoc: 'Local Historic Bistro & Market',
      lunchNotes: 'Savor regional specialties, seasonal produce, and fresh local pastries.',
      lunchCost: budget === 'HIGH' ? 60 : budget === 'LOW' ? 15 : 30,
      dinnerTitle: 'Dinner at acclaimed local restaurant & sunset view',
      dinnerLoc: `${destination} Promenade & Dining Quarter`,
      dinnerNotes: 'Enjoy signature entrees and evening ambiance overlooking the city lights.',
      dinnerCost: budget === 'HIGH' ? 100 : budget === 'LOW' ? 25 : 55,
    },
    {
      titleSuffix: 'Cultural Masterpieces & Famous Sights',
      loc: `${destination} National Museum & Sights`,
      notes: 'Explore top-tier art, architecture, and cultural collections. Book ahead to beat lines.',
      cost: budget === 'HIGH' ? 50 : budget === 'LOW' ? 12 : 28,
      lunchTitle: 'Artisan Cafe & Garden Walk',
      lunchLoc: 'Botanical Gardens & Terrace Cafe',
      lunchNotes: 'Light lunch with panoramic greenery and artisan coffee.',
      lunchCost: budget === 'HIGH' ? 45 : budget === 'LOW' ? 12 : 22,
      dinnerTitle: 'Neighborhood Trattoria & Live Music',
      dinnerLoc: `${destination} Arts & Entertainment District`,
      dinnerNotes: 'Experience lively nightlife, craft beverages, and local chef specials.',
      dinnerCost: budget === 'HIGH' ? 90 : budget === 'LOW' ? 22 : 45,
    },
    {
      titleSuffix: 'Panoramic Views, Shopping & Hidden Gems',
      loc: `${destination} Scenic Overlook & Waterfront`,
      notes: 'Enjoy breathtaking skyline views, photo spots, and charming side streets.',
      cost: budget === 'HIGH' ? 35 : budget === 'LOW' ? 10 : 20,
      lunchTitle: 'Specialty Food Hall & Local Tasting',
      lunchLoc: `${destination} Central Food Market`,
      lunchNotes: 'Sample multiple stalls featuring handmade regional delicacies.',
      lunchCost: budget === 'HIGH' ? 50 : budget === 'LOW' ? 14 : 26,
      dinnerTitle: 'Farewell Fine Dining & Evening Walk',
      dinnerLoc: 'Top-Rated Rooftop Restaurant',
      dinnerNotes: 'Celebrate the journey with a memorable multi-course dinner.',
      dinnerCost: budget === 'HIGH' ? 120 : budget === 'LOW' ? 30 : 65,
    },
  ];

  const days: GeneratedDay[] = Array.from(
    { length: input.durationDays },
    (_, i) => {
      const dayNumber = i + 1;
      if (isItaly && i < italyPlans.length) {
        return {
          dayNumber,
          summary: italyPlans[i]!.summary,
          activities: italyPlans[i]!.activities,
        };
      }

      const t = defaultTemplates[i % defaultTemplates.length]!;
      return {
        dayNumber,
        summary: `Day ${dayNumber}: Highlights of ${destination} - ${t.titleSuffix}. Lodging: ${selectedHotel}.`,
        activities: [
          {
            timeSlot: 'MORNING' as const,
            title: `Visit ${t.titleSuffix}`,
            locationName: t.loc,
            notes: t.notes,
            estimatedCost: t.cost,
          },
          {
            timeSlot: 'AFTERNOON' as const,
            title: t.lunchTitle,
            locationName: t.lunchLoc,
            notes: t.lunchNotes,
            estimatedCost: t.lunchCost,
          },
          {
            timeSlot: 'EVENING' as const,
            title: t.dinnerTitle,
            locationName: t.dinnerLoc,
            notes: t.dinnerNotes,
            estimatedCost: t.dinnerCost,
          },
        ],
      };
    },
  );

  return {
    title: `${input.durationDays}-Day Trip to ${destination}`,
    destination,
    days,
  };
}

@Injectable()
export class MockProvider implements AIProvider {
  generateItinerary(input: ItineraryRequest): Promise<GeneratedItinerary> {
    return Promise.resolve(generateRichMockItinerary(input));
  }

  refineItineraryPart(input: RefineRequest): Promise<GeneratedDay> {
    return Promise.resolve({
      dayNumber: input.dayNumber,
      summary: `Refined day ${input.dayNumber}: ${input.instruction}`,
      activities: [
        {
          timeSlot: 'MORNING',
          title: `Custom morning activity: ${input.instruction}`,
          locationName: `${input.destination} City Center`,
          notes: `Updated based on traveler request: "${input.instruction}"`,
          estimatedCost: 20,
        },
        {
          timeSlot: 'AFTERNOON',
          title: `Curated lunch at popular local restaurant`,
          locationName: `${input.destination} Dining District`,
          notes: `Local specialties and seasonal menu items.`,
          estimatedCost: 35,
        },
        {
          timeSlot: 'EVENING',
          title: `Evening exploration & leisure dinner`,
          locationName: `${input.destination} Waterfront`,
          notes: `Relaxing evening experience.`,
          estimatedCost: 45,
        },
      ],
    });
  }

  answer(input: GroundedQARequest): Promise<GroundedAnswer> {
    return Promise.resolve({
      answer: `This is a mock answer to: ${input.question}`,
      grounded: false,
      sources: [],
    });
  }

  generateAnswer(question: string, contextChunks: string[]): Promise<string> {
    if (contextChunks.length > 0) {
      return Promise.resolve(
        `Based on ${contextChunks.length} traveller story chunk(s), here is a mock grounded answer to: "${question}".`,
      );
    }
    return Promise.resolve(`Mock general-knowledge answer to: "${question}".`);
  }

  embed(texts: string[]): Promise<number[][]> {
    const dims = 768;
    return Promise.resolve(
      texts.map((text) => {
        const vec = new Array<number>(dims).fill(0);
        for (let i = 0; i < text.length; i++) {
          vec[i % dims] += text.charCodeAt(i) / 255;
        }
        return vec;
      }),
    );
  }
}
