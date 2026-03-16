export interface Destination {
  id: string
  name: string
  country: string
  coordinates: { lat: number; lng: number }
  tags: string[]
  priceRange: string
  estimatedBudget: string
  budgetBreakdown: { transport: string; accommodation: string; food: string; extras: string }
  priceContext: string
  description: string
  highlights: { beaches: string; nightlife: string; food: string; accessibility: string }
  flights: { airports: string[]; lowCost: string[]; priceEstimate: string; flightTime: string }
  bestFor: string
  tips: string
  imageUrl: string
}

export const destinations: Destination[] = [
  {
    id: 'liguria',
    name: 'Liguria',
    country: 'Italia',
    coordinates: { lat: 44.0564, lng: 8.2063 },
    tags: ['Vicino', 'Rilassante', 'Borghi'],
    priceRange: '€€',
    estimatedBudget: '€200-350/persona',
    budgetBreakdown: {
      transport: '€30-60 (auto/treno)',
      accommodation: '€80-150 (2-3 notti)',
      food: '€60-100',
      extras: '€30-40',
    },
    priceContext: 'Economico perché raggiungibile in auto. Niente voli!',
    description:
      'La Riviera di Ponente offre spiagge bellissime, borghi colorati come Alassio, Laigueglia, Finale Ligure e Varigotti. Perfetta per un weekend rilassante con ottimo cibo ligure, focaccia e pesto.',
    highlights: { beaches: 'Bellissime', nightlife: 'Tranquilla', food: 'Eccellente', accessibility: 'Facilissima' },
    flights: {
      airports: ['In auto da Milano: 2h', 'In auto da Torino: 1.5h'],
      lowCost: ['Treno regionale', 'Auto propria', 'BlaBlaCar'],
      priceEstimate: 'Auto/treno €30-60 A/R',
      flightTime: '2-3 ore dal Nord Italia',
    },
    bestFor: 'Weekend relax senza stress di voli, ottimo cibo',
    tips: 'Varigotti per la baia dei Saraceni. Finale Ligure per arrampicata. Alassio per la movida serale.',
    imageUrl:
      'https://static2-viaggi.corriereobjects.it/wp-content/uploads/2015/06/liguria-guide-getty.jpg?v=1437066406',
  },
  {
    id: 'elba',
    name: "Isola d'Elba",
    country: 'Italia',
    coordinates: { lat: 42.7633, lng: 10.2389 },
    tags: ['Isola', 'Natura', 'Snorkeling'],
    priceRange: '€€',
    estimatedBudget: '€250-400/persona',
    budgetBreakdown: {
      transport: '€80-130 (auto + traghetto)',
      accommodation: '€100-150 (2-3 notti)',
      food: '€50-80',
      extras: '€20-40 (scooter)',
    },
    priceContext: 'Traghetto obbligatorio (€25-40 A/R). Prezzi medi, atmosfera rilassata.',
    description:
      "Il paradiso isolano della Toscana con acque cristalline, sentieri escursionistici, e atmosfera rilassata. Spiagge per tutti i gusti.",
    highlights: { beaches: 'Eccellenti', nightlife: 'Calma', food: 'Ottimo', accessibility: 'Facile' },
    flights: {
      airports: ['Pisa (PSA) + traghetto da Piombino'],
      lowCost: ['Ryanair per Pisa', 'Treno + traghetto'],
      priceEstimate: '€50-100 (volo) + €30 traghetto',
      flightTime: '1 ora per Pisa + 1 ora traghetto',
    },
    bestFor: 'Amanti della natura, snorkeling, relax',
    tips: 'Prenotare traghetto in anticipo. Noleggiare scooter per esplorare.',
    imageUrl:
      'https://tourismmedia.italia.it/is/image/mitur/20210308131112-schermata-2021-03-08-alle-12-39-34?wid=800&hei=500&fit=constrain,1&fmt=webp',
  },
  {
    id: 'toscana',
    name: 'Toscana',
    country: 'Italia',
    coordinates: { lat: 42.7635, lng: 10.9089 },
    tags: ['Costa', 'Pinete', 'Elegante'],
    priceRange: '€€',
    estimatedBudget: '€220-380/persona',
    budgetBreakdown: {
      transport: '€40-80 (auto/treno)',
      accommodation: '€100-160 (2-3 notti)',
      food: '€50-90',
      extras: '€30-50',
    },
    priceContext: "Costa d'Argento e Maremma offrono ottimo rapporto qualità/prezzo.",
    description:
      'La costa toscana offre spiagge sabbiose, pinete profumate, borghi medievali e ottimo vino. Da Castiglione della Pescaia a Punta Ala.',
    highlights: { beaches: 'Sabbiose', nightlife: 'Moderata', food: 'Eccellente', accessibility: 'Facile' },
    flights: {
      airports: ['Pisa (PSA)', 'Roma (FCO)'],
      lowCost: ['Ryanair', 'easyJet'],
      priceEstimate: '€40-80 A/R',
      flightTime: '1-1.5 ore + auto',
    },
    bestFor: 'Chi vuole mare + cultura + buon cibo',
    tips: 'Castiglione della Pescaia top. Bolgheri per il vino. Argentario per lusso.',
    imageUrl: 'https://www.visittuscany.com/shared/make/immagini/dji_0069_U5i.jpg?__scale=w:1920,h:1000,t:2,q:85',
  },
  {
    id: 'conero',
    name: 'Riviera del Conero',
    country: 'Italia',
    coordinates: { lat: 43.5486, lng: 13.6175 },
    tags: ['Scogliere', 'Natura', 'Autentico'],
    priceRange: '€-€€',
    estimatedBudget: '€180-320/persona',
    budgetBreakdown: {
      transport: '€30-70 (auto/treno)',
      accommodation: '€70-130 (2-3 notti)',
      food: '€50-80',
      extras: '€30-40',
    },
    priceContext: 'Ottimo rapporto qualità/prezzo. Meno turistico, più autentico.',
    description:
      'Le Marche nascondono un tesoro: scogliere a picco sul mare, spiagge bianche, borghi come Sirolo e Numana. Mare cristallino!',
    highlights: { beaches: 'Spettacolari', nightlife: 'Tranquilla', food: 'Ottimo', accessibility: 'Facile' },
    flights: {
      airports: ['Ancona (AOI)', 'Bologna (BLQ)'],
      lowCost: ['Ryanair per Ancona'],
      priceEstimate: '€30-70 A/R',
      flightTime: '1 ora + 30 min auto',
    },
    bestFor: 'Amanti delle scogliere, natura incontaminata',
    tips: 'Spiaggia delle Due Sorelle da non perdere. Sirolo per aperitivi al tramonto.',
    imageUrl:
      'https://tourismmedia.italia.it/is/image/mitur/20210526162237-05-numana-parco-del-conero-marche-shutterstock-648599551?wid=800&hei=500&fit=constrain,1&fmt=webp',
  },
  {
    id: 'puglia',
    name: 'Puglia',
    country: 'Italia',
    coordinates: { lat: 40.1536, lng: 18.1365 },
    tags: ['Mare Caraibico', 'Cibo Top', 'Movida'],
    priceRange: '€-€€',
    estimatedBudget: '€200-350/persona',
    budgetBreakdown: {
      transport: '€30-80 (volo A/R)',
      accommodation: '€80-140 (2-3 notti)',
      food: '€50-80',
      extras: '€40-50 (auto)',
    },
    priceContext: "Una delle regioni con miglior rapporto qualità/prezzo. Cibo eccezionale ed economico.",
    description:
      "Il Salento offre mare caraibico, trulli, masserie e il miglior cibo d'Italia. Gallipoli per la movida, Otranto per la storia.",
    highlights: { beaches: 'Caraibiche', nightlife: 'Ottima', food: 'Straordinario', accessibility: 'Facile' },
    flights: {
      airports: ['Bari (BRI)', 'Brindisi (BDS)'],
      lowCost: ['Ryanair', 'easyJet', 'Vueling'],
      priceEstimate: '€30-80 A/R',
      flightTime: '1-1.5 ore da Milano',
    },
    bestFor: 'Amanti del cibo e del mare cristallino',
    tips: 'Gallipoli per movida, Polignano per foto. Auto necessaria per esplorare.',
    imageUrl: 'https://img.100r.systems/img/60d448f1e2ee2e3eb78e53cabbeab8bb.jpg',
  },
  {
    id: 'sicilia',
    name: 'Sicilia',
    country: 'Italia',
    coordinates: { lat: 38.0174, lng: 12.5362 },
    tags: ['Cultura', 'Street Food', 'Avventura'],
    priceRange: '€-€€',
    estimatedBudget: '€250-400/persona',
    budgetBreakdown: {
      transport: '€40-100 (volo A/R)',
      accommodation: '€100-160 (2-3 notti)',
      food: '€60-90',
      extras: '€50-50 (auto, escursioni)',
    },
    priceContext: 'Prezzi contenuti, street food economicissimo. Trapani economica, Taormina cara.',
    description:
      'La Sicilia unisce spiagge stupende, rovine antiche, Etna e street food leggendario. San Vito Lo Capo ha spiagge caraibiche!',
    highlights: { beaches: 'Eccellenti', nightlife: 'Moderata', food: 'Leggendario', accessibility: 'Media' },
    flights: {
      airports: ['Palermo (PMO)', 'Catania (CTA)', 'Trapani (TPS)'],
      lowCost: ['Ryanair', 'easyJet', 'Volotea'],
      priceEstimate: '€40-100 A/R',
      flightTime: '1.5-2 ore dal Nord Italia',
    },
    bestFor: 'Chi vuole tutto: mare + cultura + cibo',
    tips: 'San Vito Lo Capo per spiagge top. Arancini e granita obbligatori!',
    imageUrl: 'https://www.hotelquattrocuori.it/upload/immagini/pages/dintorni/spiagge/adobestock_74889934.jpg',
  },
  {
    id: 'favignana',
    name: 'Favignana',
    country: 'Italia',
    coordinates: { lat: 37.9311, lng: 12.3289 },
    tags: ['Isola', 'Bici', 'Calette'],
    priceRange: '€€',
    estimatedBudget: '€280-450/persona',
    budgetBreakdown: {
      transport: '€60-120 (volo) + €20-30 (traghetto)',
      accommodation: '€120-180 (2-3 notti)',
      food: '€60-90',
      extras: '€40-50 (bici, barche)',
    },
    priceContext: 'Isola esclusiva ma non carissima. Traghetto da Trapani (30 min). Bici = mezzo principale.',
    description:
      "L'isola delle Egadi più famosa: calette turchesi, si gira in bici, atmosfera magica. Cala Rossa è tra le spiagge più belle d'Italia!",
    highlights: { beaches: 'Paradisiache', nightlife: 'Calma', food: 'Ottimo', accessibility: 'Media' },
    flights: {
      airports: ['Trapani (TPS) + traghetto'],
      lowCost: ['Ryanair per Trapani'],
      priceEstimate: '€60-120 A/R + €20 traghetto',
      flightTime: '1.5 ore + 30 min traghetto',
    },
    bestFor: 'Chi cerca isola autentica e calette da sogno',
    tips: 'Noleggiare bici appena arrivi. Cala Rossa e Cala Azzurra imperdibili. Prenotare alloggio presto!',
    imageUrl: 'https://www.sicilia.info/wp-content/uploads/sites/91/favignana-hd.jpg',
  },
]
