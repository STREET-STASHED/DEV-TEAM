import { enhancedPersonalizationSystem } from '../personalization/enhancedUserProfile'

// AI Stylist Personality System
export interface StylistPersonality {
  id: string
  name: string
  personality: 'sassy' | 'sophisticated' | 'energetic' | 'chill' | 'bold' | 'minimalist'
  style: 'streetwear' | 'luxury' | 'vintage' | 'minimalist' | 'bohemian' | 'athletic'
  expertise: string[]
  catchphrases: string[]
  emoji: string
  voice: 'casual' | 'professional' | 'friendly' | 'sassy'
  humor: 'witty' | 'sarcastic' | 'playful' | 'dry'
}

export class AIStylistPersonalitySystem {
  private static instance: AIStylistPersonalitySystem
  private personalities: Map<string, StylistPersonality> = new Map()

  static getInstance(): AIStylistPersonalitySystem {
    if (!AIStylistPersonalitySystem.instance) {
      AIStylistPersonalitySystem.instance = new AIStylistPersonalitySystem()
      AIStylistPersonalitySystem.instance.initializePersonalities()
    }
    return AIStylistPersonalitySystem.instance
  }

  private initializePersonalities() {
    const personalities: StylistPersonality[] = [
      {
        id: 'sassy-sarah',
        name: 'Sarah',
        personality: 'sassy',
        style: 'streetwear',
        expertise: ['streetwear', 'sneakers', 'urban fashion'],
        catchphrases: [
          "Honey, that outfit is giving... nothing. Let me fix you up! 💅",
          "Oh no, we're not doing that. Here's what's actually hot right now 🔥",
          "Listen, I know what I'm talking about. Trust the process! ✨",
          "This is giving main character energy. Period! 💁‍♀️"
        ],
        emoji: '💅',
        voice: 'sassy',
        humor: 'sarcastic'
      },
      {
        id: 'sophisticated-sophia',
        name: 'Sophia',
        personality: 'sophisticated',
        style: 'luxury',
        expertise: ['luxury', 'tailoring', 'investment pieces'],
        catchphrases: [
          "Darling, quality over quantity. Let's build your wardrobe properly ✨",
          "This piece will serve you for years to come. Timeless elegance never fades 🎩",
          "Consider this an investment in your personal brand 💎",
          "Sophistication is an art. Let me guide you through it 🥂"
        ],
        emoji: '💎',
        voice: 'professional',
        humor: 'dry'
      },
      {
        id: 'energetic-emma',
        name: 'Emma',
        personality: 'energetic',
        style: 'athletic',
        expertise: ['athleisure', 'sports', 'active lifestyle'],
        catchphrases: [
          "YASSS! This is giving major energy! Let's get it! 💪",
          "You're about to look SO GOOD while crushing your goals! 🏃‍♀️",
          "This outfit is literally everything! I'm obsessed! 😍",
          "Get ready to turn heads and break necks! Period! 🔥"
        ],
        emoji: '💪',
        voice: 'friendly',
        humor: 'playful'
      },
      {
        id: 'chill-charlie',
        name: 'Charlie',
        personality: 'chill',
        style: 'minimalist',
        expertise: ['minimalist', 'sustainable', 'comfort'],
        catchphrases: [
          "Hey, let's keep it simple but make it count ✌️",
          "Less is more, but make sure it's the right less 😌",
          "This is giving major chill vibes. Love it! 🌿",
          "Sometimes the best style is just feeling good in your skin 🫶"
        ],
        emoji: '😌',
        voice: 'casual',
        humor: 'witty'
      },
      {
        id: 'bold-bella',
        name: 'Bella',
        personality: 'bold',
        style: 'bohemian',
        expertise: ['bohemian', 'artistic', 'statement pieces'],
        catchphrases: [
          "Honey, if you're not turning heads, you're doing it wrong! 👑",
          "This is giving main character energy. Own it! ✨",
          "Bold choices make bold statements. Let's make some noise! 🎭",
          "You're not just wearing clothes, you're making art! 🎨"
        ],
        emoji: '👑',
        voice: 'sassy',
        humor: 'witty'
      },
      {
        id: 'minimalist-mike',
        name: 'Mike',
        personality: 'minimalist',
        style: 'minimalist',
        expertise: ['minimalist', 'tailoring', 'quality basics'],
        catchphrases: [
          "Clean lines, quality materials, timeless appeal 🎯",
          "Simplicity is the ultimate sophistication 🧘‍♂️",
          "Every piece should have a purpose. No fluff needed ✂️",
          "Less clutter, more style. That's the philosophy 🎨"
        ],
        emoji: '🎯',
        voice: 'professional',
        humor: 'dry'
      }
    ]

    personalities.forEach(personality => {
      this.personalities.set(personality.id, personality)
    })
  }

  // Assign personality based on user preferences
  async assignPersonality(userId: string): Promise<StylistPersonality> {
    const userProfile = await enhancedPersonalizationSystem.getUserProfile(userId)
    
    if (!userProfile) {
      return this.getRandomPersonality()
    }

    // Analyze user style preferences
    const stylePreferences = userProfile.stylePreferences
    const aesthetic = stylePreferences.aesthetic[0] || 'casual'
    const colorPalette = stylePreferences.colorPalette[0] || 'neutral'
    const priceRange = stylePreferences.priceRange.preferred

    // Match personality to user preferences
    let bestMatch = this.personalities.get('chill-charlie')!
    let bestScore = 0

    for (const personality of this.personalities.values()) {
      let score = 0

      // Style match
      if (personality.style === aesthetic) score += 3
      if (personality.expertise.includes(aesthetic)) score += 2

      // Price range match
      if (priceRange < 100 && personality.style === 'minimalist') score += 2
      if (priceRange > 500 && personality.style === 'luxury') score += 2

      // Color palette match
      if (colorPalette === 'bold' && personality.personality === 'bold') score += 1
      if (colorPalette === 'neutral' && personality.personality === 'minimalist') score += 1

      if (score > bestScore) {
        bestScore = score
        bestMatch = personality
      }
    }

    return bestMatch
  }

  // Generate personalized message from stylist
  generateMessage(
    personality: StylistPersonality,
    context: 'greeting' | 'recommendation' | 'encouragement' | 'feedback'): string {
    const catchphrase = personality.catchphrases[
      Math.floor(Math.random() * personality.catchphrases.length)
    ]

    switch (context) {
      case 'greeting':
        return `${personality.emoji} Hey there! I'm ${personality.name}, your personal AI stylist! ${catchphrase}`
      
      case 'recommendation':
        return `${personality.emoji} ${personality.name} here! I found something perfect for you. ${catchphrase}`
      
      case 'encouragement':
        return `${personality.emoji} ${personality.name} believes in you! ${catchphrase}`
      
      case 'feedback':
        return `${personality.emoji} ${personality.name} says: ${catchphrase}`
      
      default:
        return `${personality.emoji} ${personality.name} here! ${catchphrase}`
    }
  }

  // Get personality by ID
  getPersonality(id: string): StylistPersonality | undefined {
    return this.personalities.get(id)
  }

  // Get random personality
  getRandomPersonality(): StylistPersonality {
    const ids = Array.from(this.personalities.keys())
    const randomId = ids[Math.floor(Math.random() * ids.length)]
    return this.personalities.get(randomId)!
  }

  // Get all personalities
  getAllPersonalities(): StylistPersonality[] {
    return Array.from(this.personalities.values())
  }

  // Update personality based on user interaction
  async evolvePersonality(
    personalityId: string,
    _userId: string,
    interaction: 'positive' | 'negative' | 'neutral'
  ): Promise<void> {
    const personality = this.personalities.get(personalityId)
    if (!personality) return

    // Personality evolution based on user interactions
    if (interaction === 'positive') {
      // Strengthen personality traits
      personality.expertise.push('user-favorite')
    } else if (interaction === 'negative') {
      // Adapt personality to user preferences
      personality.expertise = personality.expertise.filter(e => e !== 'user-favorite')
    }

    // Update personality in storage
    this.personalities.set(personalityId, personality)
  }
}

export const aiStylistSystem = AIStylistPersonalitySystem.getInstance()
