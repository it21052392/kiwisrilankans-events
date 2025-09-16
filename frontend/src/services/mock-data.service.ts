// Mock data service for development when backend is not available
export const mockEvents = [
  {
    _id: '1',
    title: 'Sri Lankan New Year Celebration',
    description: 'Join us for a vibrant celebration of Sri Lankan New Year with traditional food, music, and cultural performances.',
    category: {
      _id: 'cat1',
      name: 'Cultural',
      color: '#ef4444'
    },
    startDate: '2024-04-14T10:00:00Z',
    endDate: '2024-04-14T18:00:00Z',
    location: {
      name: 'Auckland Town Hall',
      address: '303 Queen St, Auckland CBD',
      city: 'Auckland'
    },
    capacity: 200,
    price: 25,
    currency: 'NZD',
    status: 'published',
    tags: ['New Year', 'Cultural', 'Family'],
    requirements: ['Bring traditional attire if possible', 'RSVP required'],
    contactInfo: {
      name: 'Priya Fernando',
      email: 'priya@example.com',
      phone: '+64 21 123 4567'
    },
    createdBy: {
      name: 'Priya Fernando',
      role: 'organizer'
    },
    createdAt: '2024-01-15T10:00:00Z',
    slug: 'sri-lankan-new-year-celebration'
  },
  {
    _id: '2',
    title: 'Cricket Match - Sri Lanka vs Rest of World',
    description: 'A friendly cricket match between Sri Lankan community members and friends from other communities.',
    category: {
      _id: 'cat2',
      name: 'Sports',
      color: '#22c55e'
    },
    startDate: '2024-03-30T09:00:00Z',
    endDate: '2024-03-30T17:00:00Z',
    location: {
      name: 'Eden Park',
      address: 'Reimers Ave, Mount Eden',
      city: 'Auckland'
    },
    capacity: 50,
    price: 0,
    currency: 'NZD',
    status: 'published',
    tags: ['Cricket', 'Sports', 'Community'],
    requirements: ['Bring your own cricket gear', 'Registration required'],
    contactInfo: {
      name: 'Ravi Perera',
      email: 'ravi@example.com',
      phone: '+64 21 234 5678'
    },
    createdBy: {
      name: 'Ravi Perera',
      role: 'organizer'
    },
    createdAt: '2024-01-20T10:00:00Z',
    slug: 'cricket-match-sri-lanka-vs-rest-of-world'
  },
  {
    _id: '3',
    title: 'Traditional Sri Lankan Cooking Class',
    description: 'Learn to cook authentic Sri Lankan dishes with our experienced chef. All ingredients provided.',
    category: {
      _id: 'cat3',
      name: 'Food',
      color: '#f59e0b'
    },
    startDate: '2024-04-07T14:00:00Z',
    endDate: '2024-04-07T18:00:00Z',
    location: {
      name: 'Community Kitchen',
      address: '123 Main St, Manukau',
      city: 'Auckland'
    },
    capacity: 15,
    price: 45,
    currency: 'NZD',
    status: 'published',
    tags: ['Cooking', 'Food', 'Learning'],
    requirements: ['Bring apron and containers for leftovers', 'Vegetarian options available'],
    contactInfo: {
      name: 'Kamala Silva',
      email: 'kamala@example.com',
      phone: '+64 21 345 6789'
    },
    createdBy: {
      name: 'Kamala Silva',
      role: 'organizer'
    },
    createdAt: '2024-01-25T10:00:00Z',
    slug: 'traditional-sri-lankan-cooking-class'
  }
];

export const mockCategories = [
  {
    _id: 'cat1',
    name: 'Cultural',
    description: 'Traditional Sri Lankan cultural events and celebrations',
    color: '#ef4444',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: 'cat2',
    name: 'Sports',
    description: 'Sports events and recreational activities',
    color: '#22c55e',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: 'cat3',
    name: 'Food',
    description: 'Cooking classes, food festivals, and culinary events',
    color: '#f59e0b',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: 'cat4',
    name: 'Networking',
    description: 'Professional networking and business events',
    color: '#3b82f6',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: 'cat5',
    name: 'Education',
    description: 'Educational workshops, seminars, and learning events',
    color: '#8b5cf6',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Mock API responses
export const createMockResponse = <T>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error'
});

export const createMockEventsResponse = (events = mockEvents) => ({
  success: true,
  data: {
    events,
    pagination: {
      page: 1,
      limit: 10,
      total: events.length,
      pages: Math.ceil(events.length / 10)
    }
  }
});

export const createMockEventResponse = (event: any) => ({
  success: true,
  data: {
    event
  }
});

export const createMockCategoriesResponse = (categories = mockCategories) => ({
  success: true,
  data: {
    categories
  }
});

export const createMockCalendarResponse = (events = mockEvents) => {
  const eventsByDate: Record<string, any[]> = {};
  
  events.forEach(event => {
    const date = new Date(event.startDate).toISOString().split('T')[0];
    if (!eventsByDate[date]) {
      eventsByDate[date] = [];
    }
    eventsByDate[date].push(event);
  });

  return {
    success: true,
    data: {
      events,
      eventsByDate,
      total: events.length
    }
  };
};
