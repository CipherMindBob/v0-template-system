import { z } from "zod"

// Define schemas for component properties
const HeroSectionSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  backgroundPattern: z.string().optional(),
})

const HeaderSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  alignment: z.enum(["left", "center", "right"]).optional(),
  size: z.enum(["small", "medium", "large"]).optional(),
})

const FeatureSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  links: z
    .array(
      z.object({
        text: z.string(),
        href: z.string(),
      }),
    )
    .optional(),
  reversed: z.boolean().optional(),
  delay: z.number().optional(),
})

const TeamMemberSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  title: z.string().optional(),
  image: z.string().optional(),
  slug: z.string(),
  href: z.string().optional(),
  bio: z.string().optional(),
  biography: z.array(z.string()).optional(),
  socialLinks: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string(),
      }),
    )
    .optional(),
})

const TeamShowcaseSchema = z.object({
  title: z.string(),
  layout: z.enum(["grid", "list"]).optional(),
  columns: z.number().optional(),
  members: z.array(TeamMemberSchema),
})

const ServicesListSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaButtonText: z.string().optional(),
  ctaLink: z.string().optional(),
  layout: z.enum(["grid", "list"]).optional(),
  columns: z.number().optional(),
  services: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string().optional(),
      features: z.array(z.string()).optional(),
      buttonText: z.string().optional(),
      link: z.string().optional(),
      featured: z.boolean().optional(),
    }),
  ),
})

const ContentSchema = z.object({
  text: z.string(),
  image: z.string().optional(),
})

const SlideSchema = z.object({
  url: z.string(),
  alt: z.string(),
})

const SlideViewerSchema = z.object({
  title: z.string().optional(),
  backgroundColor: z.string().optional(),
  autoplay: z.boolean().optional(),
  navigation: z.boolean().optional(),
  pagination: z.boolean().optional(),
  slides: z.array(SlideSchema),
})

// New schemas for additional components
const VideoPlayerSchema = z.object({
  title: z.string().optional(),
  videoUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  autoplay: z.boolean().optional(),
  controls: z.boolean().optional(),
  loop: z.boolean().optional(),
  muted: z.boolean().optional(),
})

const CalendarSchema = z.object({
  title: z.string().optional(),
  events: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      date: z.string(),
      description: z.string().optional(),
      location: z.string().optional(),
      url: z.string().optional(),
    }),
  ),
  viewType: z.enum(["month", "week", "day"]).optional(),
})

const EmailFormSchema = z.object({
  title: z.string().optional(),
  recipientEmail: z.string().email(),
  subjectPrefix: z.string().optional(),
  submitButtonText: z.string().optional(),
  successMessage: z.string().optional(),
  fields: z.array(
    z.object({
      name: z.string(),
      label: z.string(),
      type: z.enum(["text", "email", "textarea", "select", "checkbox"]),
      required: z.boolean().optional(),
      options: z.array(z.string()).optional(),
    }),
  ),
})

const ChatInterfaceSchema = z.object({
  title: z.string().optional(),
  welcomeMessage: z.string(),
  agentName: z.string().optional(),
  agentAvatar: z.string().optional(),
  showTimestamp: z.boolean().optional(),
})

const CallToActionSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  primaryButtonText: z.string(),
  primaryButtonLink: z.string(),
  secondaryButtonText: z.string().optional(),
  secondaryButtonLink: z.string().optional(),
  backgroundColor: z.string().optional(),
})

const PricingTableSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  plans: z.array(
    z.object({
      name: z.string(),
      price: z.string(),
      period: z.string().optional(),
      description: z.string().optional(),
      features: z.array(z.string()),
      buttonText: z.string().optional(),
      buttonLink: z.string().optional(),
      highlighted: z.boolean().optional(),
    }),
  ),
})

// Component registry with schemas and display information
const componentRegistry = {
  "hero-section": {
    schema: HeroSectionSchema,
    displayName: "Hero Section",
    description: "A large banner with title, subtitle and call-to-action",
    icon: "Layout",
    defaultProperties: {
      title: "Welcome to Our Website",
      subtitle: "We're revolutionizing the future with innovative solutions",
      buttonText: "Learn More",
      buttonLink: "#about",
      backgroundPattern: "/subtle-pattern.svg",
    },
  },
  header: {
    schema: HeaderSchema,
    displayName: "Header",
    description: "Section header with title and subtitle",
    icon: "Type",
    defaultProperties: {
      title: "New Section Header",
      subtitle: "Add a subtitle here",
      alignment: "center",
      size: "medium",
    },
  },
  "feature-section": {
    schema: FeatureSectionSchema,
    displayName: "Feature Section",
    description: "Showcase a feature with image and text",
    icon: "Star",
    defaultProperties: {
      title: "Feature Title",
      description: "Feature description goes here. Explain the benefits and value proposition.",
      image: "/abstract-digital-pattern.png",
      imageAlt: "Feature image",
      buttonText: "Learn More",
      buttonLink: "#",
      reversed: false,
    },
  },
  "team-showcase": {
    schema: TeamShowcaseSchema,
    displayName: "Team Showcase",
    description: "Display team members with images and roles",
    icon: "Users",
    defaultProperties: {
      title: "Meet Our Visionary Team",
      layout: "grid",
      columns: 3,
      members: [
        {
          name: "John Doe",
          role: "CEO & Founder",
          image: "/professional-male-headshot.png",
          slug: "john-doe",
          bio: "John has over 15 years of experience in the industry.",
        },
        {
          name: "Jane Smith",
          role: "CTO",
          image: "/professional-headshot-female.png",
          slug: "jane-smith",
          bio: "Jane leads our technical team with expertise in AI and machine learning.",
        },
        {
          name: "Michael Johnson",
          role: "Design Director",
          image: "/diverse-male-headshot.png",
          slug: "michael-johnson",
          bio: "Michael brings creative vision to all our projects.",
        },
      ],
    },
  },
  servicesList: {
    schema: ServicesListSchema,
    displayName: "Services List",
    description: "List of services with descriptions",
    icon: "List",
    defaultProperties: {
      title: "Our Services",
      subtitle: "Discover how we can help transform your business",
      layout: "grid",
      columns: 3,
      services: [
        {
          title: "Service 1",
          description: "Description of service 1",
          icon: "Briefcase",
        },
        {
          title: "Service 2",
          description: "Description of service 2",
          icon: "Code",
        },
        {
          title: "Service 3",
          description: "Description of service 3",
          icon: "PenTool",
        },
      ],
    },
  },
  content: {
    schema: ContentSchema,
    displayName: "Content Block",
    description: "Text content with optional image",
    icon: "FileText",
    defaultProperties: {
      text: "Add your content here. This is a paragraph of text that can be edited.",
      image: "/abstract-digital-pattern.png",
    },
  },
  "slide-viewer": {
    schema: SlideViewerSchema,
    displayName: "Slide Viewer",
    description: "Interactive slide presentation viewer",
    icon: "Presentation",
    defaultProperties: {
      title: "Our Vision in Action",
      backgroundColor: "bg-muted",
      autoplay: false,
      navigation: true,
      pagination: true,
      slides: [
        { url: "/presentation-slide-1.png", alt: "Slide 1" },
        { url: "/presentation-slide-2.png", alt: "Slide 2" },
        { url: "/presentation-slide-3.png", alt: "Slide 3" },
      ],
    },
  },
  // New component registry entries
  "video-player": {
    schema: VideoPlayerSchema,
    displayName: "Video Player",
    description: "Embed and play video content",
    icon: "Video",
    defaultProperties: {
      title: "Video Player",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "/video-thumbnail.png",
      autoplay: false,
      controls: true,
      loop: false,
      muted: false,
    },
  },
  calendar: {
    schema: CalendarSchema,
    displayName: "Event Calendar",
    description: "Interactive calendar with events",
    icon: "Calendar",
    defaultProperties: {
      title: "Event Calendar",
      events: [
        {
          id: "1",
          title: "Team Meeting",
          date: new Date(Date.now() + 86400000).toISOString(),
          description: "Weekly team sync",
        },
        {
          id: "2",
          title: "Product Launch",
          date: new Date(Date.now() + 86400000 * 7).toISOString(),
          description: "New product release",
        },
      ],
      viewType: "month",
    },
  },
  "email-form": {
    schema: EmailFormSchema,
    displayName: "Email Form",
    description: "Contact form that sends emails directly",
    icon: "Mail",
    defaultProperties: {
      title: "Contact via Email",
      recipientEmail: "contact@example.com",
      subjectPrefix: "[Website Inquiry]",
      submitButtonText: "Send Email",
      successMessage: "Your email has been sent successfully!",
      fields: [
        { name: "name", label: "Your Name", type: "text", required: true },
        { name: "email", label: "Your Email", type: "email", required: true },
        { name: "message", label: "Message", type: "textarea", required: true },
      ],
    },
  },
  "chat-interface": {
    schema: ChatInterfaceSchema,
    displayName: "Chat Interface",
    description: "Live chat interface for customer support",
    icon: "MessageSquare",
    defaultProperties: {
      title: "Live Chat",
      welcomeMessage: "Hello! How can we help you today?",
      agentName: "Support Team",
      agentAvatar: "/support-avatar.png",
      showTimestamp: true,
    },
  },
  "call-to-action": {
    schema: CallToActionSchema,
    displayName: "Call to Action",
    description: "Prominent section to encourage user action",
    icon: "Zap",
    defaultProperties: {
      title: "Ready to Get Started?",
      description: "Join thousands of satisfied customers using our platform.",
      primaryButtonText: "Sign Up Now",
      primaryButtonLink: "/signup",
      secondaryButtonText: "Learn More",
      secondaryButtonLink: "/about",
      backgroundColor: "bg-primary",
    },
  },
  "pricing-table": {
    schema: PricingTableSchema,
    displayName: "Pricing Table",
    description: "Display pricing tiers and features",
    icon: "DollarSign",
    defaultProperties: {
      title: "Choose Your Plan",
      description: "Select the perfect plan for your needs",
      plans: [
        {
          name: "Basic",
          price: "$9.99",
          period: "monthly",
          description: "Perfect for individuals",
          features: ["Feature 1", "Feature 2", "Feature 3"],
          buttonText: "Get Started",
          buttonLink: "/signup?plan=basic",
          highlighted: false,
        },
        {
          name: "Pro",
          price: "$19.99",
          period: "monthly",
          description: "Ideal for small teams",
          features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
          buttonText: "Get Started",
          buttonLink: "/signup?plan=pro",
          highlighted: true,
        },
      ],
    },
  },
}

// Helper functions to access component registry
export function getComponentSchema(componentType: string) {
  return componentRegistry[componentType]?.schema || z.object({})
}

export function getComponentDisplayName(componentType: string): string {
  return componentRegistry[componentType]?.displayName || componentType
}

export function getComponentDescription(componentType: string): string {
  return componentRegistry[componentType]?.description || "Component for your website"
}

export function getComponentIcon(componentType: string): string {
  return componentRegistry[componentType]?.icon || "Square"
}

export function getDefaultProperties(componentType: string): Record<string, any> {
  return componentRegistry[componentType]?.defaultProperties || {}
}

export function createDefaultComponent(
  componentType: string,
  componentId: string,
): {
  id: string
  type: string
  properties: Record<string, any>
} | null {
  const defaultProperties = getDefaultProperties(componentType)
  if (!defaultProperties) return null

  return {
    id: componentId,
    type: componentType,
    properties: defaultProperties,
  }
}

export default componentRegistry
