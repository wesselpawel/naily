/* eslint-disable no-unused-vars */
export interface IService {
  flatten_name: string;
  real_name: string;
  price: number;
  duration: number;
  description: string;
  isCustomService: boolean;
}
export interface Payment {
  amount: number;
  date: number;
  result: string;
}
export type PortfolioImage = {
  src: string;
  text: string;
};
export type PremiumConfig = {
  targetClients: number | null;
  autoBooking: boolean | null;
  highlighted: boolean | null;
  adBudgetPLN?: number;
  monthlyPricePLN: number;
  averageServicePricePLN?: number;
  estimatedMonthlyGainPLN?: number;
  lastUpdatedAt: number;
};
export type User = {
  uid: string;
  name: string;
  email: string;
  description: string;
  logo: string;
  bannerUrl?: string;
  dailyClients?: number;

  seek: boolean;
  emailVerified: boolean;
  configured: boolean;
  active: boolean;
  premiumActive?: boolean;
  profileComments: string[];
  password: string;

  portfolioImages: PortfolioImage[];
  portfolio?: Array<{ id?: string; url?: string; title?: string; description?: string; [key: string]: any }>; // Portfolio images stored in user document
  payments: Payment[];
  services: IService[];
  location: { lng: number; lat: number; address: string };
  phoneNumber: string;
  userSlugUrl?: string;
  premiumConfig?: PremiumConfig;
  subscriptionId?: string;
  customerId?: string;
  subscription?: {
    id: string;
    status: string;
    currentPeriodEnd?: number;
    cancelAtPeriodEnd?: boolean;
  };
  metadata?: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
  };
  settings?: {
    emailNotifications?: boolean;
    autoReminders?: boolean;
    pushNotifications?: boolean;
    darkMode?: boolean;
    twoFactorEnabled?: boolean;
    publicProfile?: boolean;
    fontFamily?: string;
  };
  allowedTabs?: string[]; // Array of allowed tab IDs (e.g., ["calendar", "portfolio", "services"])
  priorityLevel?: number; // Higher value = higher position in listings (default: 0)
  customVariables?: Record<string, any>; // Custom key-value pairs for additional data
  trainingType?: "manicure" | "pedicure" | "both" | "none"; // Type of training courses user offers
};

export interface ICity {
  id: string; // slug used in routes
  name: string; // display name (maps from Name)
  commune: string; // maps from Commune
  district: string; // maps from District
  province: string; // maps from Province
  latitude: number; // maps from Latitude
  longitude: number; // maps from Longitude
  type: "village" | "city"; // maps from Type
  sourceId: string; // maps from Id in polskie-miejscowosci
}

export type Post = {
  postId: string;
  title: string;
  sections: Section[];
  intro: string;
  outro: string;
  tags: string[];
  url: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  mainImage: string;
  images?: string[];
  faq: {
    question: string;
    answer: string;
  }[];
  blogType: string;
  creationTime: number;
};

export type Section = {
  title: string;
  content: string;
  id?: number;
};

export type ImageType = {
  src: string;
  alt: string;
};

// Additional types for blog admin components
export type BlogType = "art" | "tattoo" | "design" | "inspiration";

export type FaqItem = {
  question: string;
  answer: string;
};

export type TagInputProps = {
  tagInput: string;
  setTagInput: (value: string) => void;
  addTag: () => void;
  removeTag: (index: number) => void;
  input: Post;
};

export type FaqHandlerProps = {
  input: Post;
  setInput: (post: Post) => void;
};

export type PostImagesProps = {
  input: Post;
  setInput: (post: Post) => void;
};

export type SectionContentEditorProps = {
  addSection: (title: string, content: string) => void;
};

export type SectionsListProps = {
  input: Post;
  setSelectedSection: (section: Section) => void;
  setSectionEditorOpen: (open: boolean) => void;
  removeSection: (index: number) => void;
};

export type EditSectionProps = {
  selectedSection: Section;
  setSelectedSection: (section: Section) => void;
  selectedPost: Post;
  setSelectedPost: (post: Post) => void;
  setSectionEditorOpen: (open: boolean) => void;
  sectionEditorOpen: boolean;
};

// Training offer types
export type TrainingOffer = {
  id: string;
  title: string;
  description: string;
  city: string;
  cityId: string;
  instructor: string;
  instructorId?: string; // User ID if created by a user
  price: number;
  duration: number; // in hours
  maxParticipants?: number;
  image?: string;
  createdAt: number;
  updatedAt?: number;
  isActive: boolean;
  isAdminCreated: boolean; // true if created by admin as example
  contactEmail?: string;
  contactPhone?: string;
  requirements?: string[];
  whatYouWillLearn?: string[];
};

// Job offer types
/** Lead z formularza na stronach /manicure/[slug], /pedicure/[slug] lub modala rezerwacji — kolekcja `formLead` */
export type FormLead = {
  id: string;
  name: string;
  phone: string;
  /** Miasto (landing) lub slug profilu / uid przy rezerwacji z profilu */
  citySlug: string;
  cityName?: string | null;
  serviceType: "manicure" | "pedicure";
  source: "city-page" | "booking-modal" | string;
  createdAt: string;
  path: string;
  /** Tylko source booking-modal */
  specialistUid?: string;
  specialistName?: string;
  selectedServiceName?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  notes?: string | null;
};

export type JobOffer = {
  id: string;
  title: string;
  description: string;
  city: string;
  cityId: string;
  salonName: string;
  salonId: string; // User ID of the salon
  salary?: string;
  employmentType?: "full-time" | "part-time" | "contract" | "internship";
  requirements?: string[];
  benefits?: string[];
  createdAt: number;
  updatedAt?: number;
  isActive: boolean;
  isAdminCreated: boolean; // true if created by admin as example
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
};
