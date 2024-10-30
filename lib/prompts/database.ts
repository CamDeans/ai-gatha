export interface PromptTemplate {
  id: string;
  category: string;
  template: string;
  tags: string[];
  style: string;
}

export const promptTemplates: PromptTemplate[] = [
  // Art & Design
  {
    id: 'art-1',
    category: 'Art',
    template: 'A {subject} in the style of {artist}, {medium}, {lighting}',
    tags: ['art', 'painting', 'creative'],
    style: 'artistic'
  },
  {
    id: 'design-1',
    category: 'Design',
    template: 'Modern {object} design, minimalist, {color} scheme, {material}',
    tags: ['design', 'product', 'minimal'],
    style: 'modern'
  },

  // Business & Marketing
  {
    id: 'business-1',
    category: 'Business',
    template: 'Professional {business type} branding, corporate style, {color} palette',
    tags: ['business', 'corporate', 'professional'],
    style: 'corporate'
  },
  {
    id: 'marketing-1',
    category: 'Marketing',
    template: 'Eye-catching {product} advertisement, {style} aesthetic, {mood}',
    tags: ['marketing', 'advertising', 'commercial'],
    style: 'commercial'
  },

  // Technology
  {
    id: 'tech-1',
    category: 'Technology',
    template: 'Futuristic {device/concept}, sci-fi aesthetic, {color} accents, high-tech',
    tags: ['technology', 'futuristic', 'sci-fi'],
    style: 'futuristic'
  },
  {
    id: 'software-1',
    category: 'Software',
    template: 'UI design for {application type}, {style} interface, {color} theme',
    tags: ['software', 'ui', 'interface'],
    style: 'digital'
  },

  // Healthcare
  {
    id: 'medical-1',
    category: 'Healthcare',
    template: 'Medical {concept/procedure}, professional visualization, {style}',
    tags: ['medical', 'healthcare', 'professional'],
    style: 'clinical'
  },
  {
    id: 'wellness-1',
    category: 'Wellness',
    template: 'Wellness and spa {scene/concept}, calming atmosphere, {mood}',
    tags: ['wellness', 'spa', 'health'],
    style: 'serene'
  },

  // Education
  {
    id: 'education-1',
    category: 'Education',
    template: 'Educational {subject} illustration, engaging style, {age group}',
    tags: ['education', 'learning', 'academic'],
    style: 'educational'
  },

  // Real Estate
  {
    id: 'realestate-1',
    category: 'Real Estate',
    template: 'Architectural visualization of {property type}, {style} design, {time of day}',
    tags: ['real estate', 'architecture', 'property'],
    style: 'architectural'
  },

  // Fashion
  {
    id: 'fashion-1',
    category: 'Fashion',
    template: '{style} fashion design, {season} collection, {color} palette',
    tags: ['fashion', 'clothing', 'design'],
    style: 'fashionable'
  },

  // Food & Beverage
  {
    id: 'food-1',
    category: 'Food',
    template: 'Appetizing {dish/beverage}, food photography style, {lighting}',
    tags: ['food', 'culinary', 'photography'],
    style: 'culinary'
  }
] 