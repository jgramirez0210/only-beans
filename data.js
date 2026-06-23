const PX = id => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`;

const BEANS = [
  {
    id: '61f0686e-9b71-4f03-8917-425b722aa1e8',
    name: 'Black Bean',
    type: 'edible',
    image: PX(7772002),
    fact: 'Black beans are 70% protein by weight when dried — a superfood hiding in your burrito.',
    emoji: '🫘',
    bg: '#2d2926'
  },
  {
    id: '0bdf84f6-9766-4a9c-a8eb-2e2358502434',
    name: 'Chickpea',
    type: 'edible',
    image: PX(7656561),
    fact: 'Chickpeas have been cultivated for over 7,500 years — they\'re basically ancient beans.',
    emoji: '🫘',
    bg: '#d4a84b'
  },
  {
    id: 'a7e69287-d61a-4b57-9789-e17909ac0a76',
    name: 'Kidney Bean',
    type: 'edible',
    image: PX(6316671),
    fact: 'Kidney beans got their name because they look like... kidneys. Creativity was scarce that day.',
    emoji: '🫘',
    bg: '#7d2b2b'
  },
  {
    id: '9198aadc-6279-4e2e-9bc3-ec8153aea325',
    name: 'Pinto Bean',
    type: 'edible',
    image: PX(6316673),
    fact: '"Pinto" means painted in Spanish — these beans have beautiful speckled patterns.',
    emoji: '🫘',
    bg: '#c4956a'
  },
  {
    id: 'b66d9d46-490b-4893-a77d-d4d80bee89b2',
    name: 'Lentil',
    type: 'edible',
    image: PX(15107600),
    fact: 'Lentils are one of the oldest cultivated foods — they\'ve been found in Egyptian tombs.',
    emoji: '🫘',
    bg: '#8b7355'
  },
  {
    id: '5967dbf8-0d57-4ad2-b775-7aa55113012f',
    name: 'Edamame',
    type: 'edible',
    image: PX(28460867),
    fact: 'Edamame are just immature soybeans. They\'re beans in their awkward teenage phase.',
    emoji: '🫛',
    bg: '#6a8f4e'
  },
  {
    id: '84c676d3-0a47-4a18-b77b-f8c0e8f27264',
    name: 'Navy Bean',
    type: 'edible',
    image: PX(273838),
    fact: 'Navy beans were a staple food for the US Navy in the 1800s — hence the name.',
    emoji: '🫘',
    bg: '#9da8b7'
  },
  {
    id: 'dd2f63e2-086f-45bd-893f-5ab03167a374',
    name: 'Lima Bean',
    type: 'edible',
    image: PX(8108120),
    fact: 'Lima beans contain trace cyanide when raw. Always cook your beans, people.',
    emoji: '🫘',
    bg: '#b8c49a'
  },
  {
    id: '78983d4d-a232-4a68-b21d-5a04864b4039',
    name: 'Cannellini Bean',
    type: 'edible',
    image: PX(4110251),
    fact: 'Cannellini beans are the cornerstone of Tuscan ribollita soup. Very sophisticated beans.',
    emoji: '🫘',
    bg: '#e8d8c0'
  },
  {
    id: '037e69b9-57d6-43bb-997a-eac706e46dec',
    name: 'Pink Toe Beans',
    type: 'cat',
    image: PX(34557584),
    fact: 'Cat toe beans (paw pads) contain sweat glands — cats only sweat through their paws!',
    emoji: '🐾',
    bg: '#f9c6c9'
  },
  {
    id: '86275b5d-788c-4894-a816-9855597a3111',
    name: 'Tabby Toe Beans',
    type: 'cat',
    image: PX(2123429),
    fact: 'A tabby\'s paw pad color usually matches their fur. Orange cats = peachy pink beans!',
    emoji: '🐾',
    bg: '#e8a87c'
  },
  {
    id: 'e86f02a6-da72-4415-a3d0-e175dedfdeb4',
    name: 'Spotted Toe Beans',
    type: 'cat',
    image: PX(16860556),
    fact: 'Multi-colored cats often have multi-colored beans. Genetics can be delicious.',
    emoji: '🐾',
    bg: '#c9a8e0'
  },
  {
    id: 'aa4ef5de-0d3c-4464-8c15-36e4119a1582',
    name: 'Kitten Beans',
    type: 'cat',
    image: PX(2600397),
    fact: 'Kitten toe beans are extra soft and extra squishy. Science confirms this is unbearably cute.',
    emoji: '🐾',
    bg: '#f7d6e0'
  },
  {
    id: '3e48fb5b-574c-46d5-a776-28c25acdd0ce',
    name: 'Black Cat Beans',
    type: 'cat',
    image: PX(16191816),
    fact: 'Black cats have dark grey or black toe beans that are basically tiny espresso beans.',
    emoji: '🐾',
    bg: '#3d3d3d'
  },
  {
    id: 'a64078ee-0886-4145-81a1-259a44345f6d',
    name: 'Loaf Cat Beans',
    type: 'cat',
    image: PX(15141570),
    fact: 'When a cat sits in loaf position, their beans are tucked safely underneath. Protected beans.',
    emoji: '🐾',
    bg: '#d4b896'
  },
  {
    id: '87221e1b-5277-4678-96d0-bbbbcf10645c',
    name: 'Orange Tabby Beans',
    type: 'cat',
    image: PX(6399498),
    fact: '80% of orange tabby cats are male — and 100% of their beans are precious.',
    emoji: '🐾',
    bg: '#f4a03a'
  }
];
