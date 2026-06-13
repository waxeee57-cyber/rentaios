// Pickup locations for the storefront. Single source of truth so the fleet
// filter, car detail page, and inquiry drawer never drift apart.
export const PICKUP_LOCATIONS: string[] = [
  'Szeged – telephely (Makkosházi krt. 15.)',
  'Szeged, Mars tér',
  'Szeged vasútállomás',
]

export const DEFAULT_PICKUP: string = PICKUP_LOCATIONS[0]

// Vehicle category → Hungarian display label (used in cards, detail chip, filters).
export const CATEGORY_LABELS: Record<string, string> = {
  sedan: 'Személyautó',
  mpv: 'Egyterű',
  furgon: 'Furgon',
  suv: 'SUV',
  sport: 'Sport',
  convertible: 'Kabrió',
  luxury: 'Luxus',
}

export const categoryLabel = (c: string): string => CATEGORY_LABELS[c] ?? c
