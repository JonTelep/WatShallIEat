// Homepage questions carried from the live site. The data source line names OpenStreetMap.

export const FAQ = [
  [
    'What should I eat today?',
    'Tap Find me food and we pick one restaurant near you at random. Not feeling it? Tap again. If you would rather cook, try one of the meal ideas below.',
  ],
  [
    'Where should I eat?',
    'Set how far you are willing to go and whether you want takeout or delivery. We show one nearby place with directions, so you only have to say yes or roll again.',
  ],
  [
    'How does "what to eat near me" work here?',
    'Your browser shares your location only for the search. Each search asks OpenStreetMap for restaurants in your radius at that moment. Nothing is stored.',
  ],
  [
    'Do I need an account?',
    'No. Search works without signing up. Your filters are saved in this browser only.',
  ],
  [
    'Can I get it delivered?',
    'After a result shows, answer Want it delivered? to open DoorDash or Uber Eats searched for that restaurant. Check that it delivers to you before ordering.',
  ],
];

export function structuredData(description) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Wat Shall I Eat',
      url: 'https://watshallieat.com/',
      description,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires a web browser with location access',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(([name, text]) => ({
        '@type': 'Question',
        name,
        acceptedAnswer: { '@type': 'Answer', text },
      })),
    },
  ];
}
