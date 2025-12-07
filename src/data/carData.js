export const liveAuctions = [
  // THE CAR CURRENTLY ON STAGE (Index 0)
  {
    id: "1",
    name: "Ford Mustang 1969",
    model: "Mach 1 Fastback",
    price: "PKR 18,00,000",
    image:
      "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80",
    status: "Live",
    currentBid: "18,00,000",
  },
  // THE CARS IN QUEUE (Up Next)
  {
    id: "2",
    name: "Toyota Supra MK4",
    model: "Twin Turbo",
    price: "PKR 45,00,000",
    image:
      "https://images.unsplash.com/photo-1605515298946-d0bfdfdbdd6d?auto=format&fit=crop&w=800&q=80",
    status: "Queue",
    estPrice: "45-50 Lacs",
  },
  {
    id: "3",
    name: "Honda Civic RS",
    model: "Turbo 1.5",
    price: "PKR 65,00,000",
    image:
      "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80",
    status: "Queue",
    estPrice: "65 Lacs",
  },
  {
    id: "4",
    name: "Audi A5 Sportback",
    model: "S-Line",
    price: "PKR 1.2 Crore",
    image:
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80",
    status: "Queue",
    estPrice: "1.2 Crore",
  },
];

export const scheduledAuctions = [
  {
    id: "101",
    title: "Weekly Grand Auction", // Group of cars
    date: "June 20, 3:00 PM",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
    carCount: 12,
  },
  {
    id: "102",
    title: "Supercar Sunday",
    date: "June 25, 6:00 PM",
    image:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    carCount: 5,
  },
];

export const forSaleCars = [
  {
    id: "101",
    name: "Tesla Model 3",
    model: "Standard Range Plus",
    brand: "Tesla",
    condition: "New",
    location: "Lahore",
    price: "PKR 1,15,00,000",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1562911791-c7a97b729ec5?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.5,
    description:
      "Sleek design, advanced Autopilot, premium interior & smooth electric performance. 95% battery health, fully functional features & regular updates.",
    verified: true,
    isFeatured: true,
  },
  {
    id: "102",
    name: "Audi e-tron",
    model: "Premium 55",
    brand: "Audi",
    condition: "Used",
    location: "Karachi",
    price: "PKR 2,30,00,000",
    image:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    description:
      "Imported Audi e-tron with panoramic sunroof and digital mirrors.",
    verified: true,
    isFeatured: true,
  },
  {
    id: "103",
    name: "Suzuki Swift",
    model: "GLX CVT",
    brand: "Suzuki",
    condition: "New",
    location: "Islamabad",
    price: "PKR 42,00,000",
    image:
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502877338550-b32dd4339927?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.2,
    description: "Economical city car with sporty looks and CVT transmission.",
    verified: false,
    isFeatured: false,
  },
  {
    id: "104",
    name: "Honda City",
    model: "1.5L Aspire",
    brand: "Honda",
    condition: "Used",
    location: "Lahore",
    price: "PKR 55,00,000",
    image:
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.0,
    description: "Family sedan, well maintained, first owner.",
    verified: true,
    isFeatured: false,
  },
  {
    id: "105",
    name: "Toyota Yaris",
    model: "ATIV X",
    brand: "Toyota",
    condition: "New",
    location: "Karachi",
    price: "PKR 48,00,000",
    image:
      "https://images.unsplash.com/photo-1623962470690-48a3d205a2a1?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1623962470690-48a3d205a2a1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1594023646647-136f3006310c?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.3,
    description: "Compact sedan with high fuel efficiency.",
    verified: false,
    isFeatured: false,
  },
];
