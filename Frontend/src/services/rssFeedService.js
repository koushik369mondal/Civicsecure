import axios from 'axios';

export class RSSFeedService {
  // RSS to JSON converter API (free service)
  static RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json';
  
  // Government RSS feeds
  static RSS_FEEDS = [
    'https://pib.gov.in/rss/latestnews.xml',
    'https://www.mygov.in/rss.xml',
    'https://www.india.gov.in/rss.xml',
    'https://vikaspedia.in/rss.xml'
  ];

  /**
   * Fetch government schemes from RSS feeds
   */
  static async fetchGovernmentSchemes() {
    try {
      console.log('🔄 Fetching government schemes from RSS feeds...');
      const allSchemes = [];
      
      // Fetch from multiple RSS sources
      for (const feedUrl of this.RSS_FEEDS) {
        try {
          const response = await axios.get(
            `${this.RSS_TO_JSON_API}?rss_url=${encodeURIComponent(feedUrl)}&count=20`,
            { timeout: 10000 }
          );
          
          if (response.data && response.data.items) {
            const items = response.data.items;
            
            // Filter items that are likely to be schemes
            const schemes = items
              .filter(item => this.isSchemeRelated(item.title, item.description))
              .map(item => this.transformRSSItem(item))
              .slice(0, 10); // Limit to 10 per feed
            
            allSchemes.push(...schemes);
            console.log(`✅ Fetched ${schemes.length} schemes from ${feedUrl}`);
          }
        } catch (feedError) {
          console.warn(`⚠️ Failed to fetch from ${feedUrl}:`, feedError.message);
        }
      }
      
      // Remove duplicates and sort by date
      const uniqueSchemes = this.removeDuplicates(allSchemes);
      const sortedSchemes = uniqueSchemes
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        .slice(0, 20); // Final limit of 20 schemes
      
      console.log(`✅ Final result: ${sortedSchemes.length} unique schemes`);
      return sortedSchemes;
      
    } catch (error) {
      console.error('❌ Error fetching RSS feeds:', error);
      throw new Error('Failed to fetch government schemes');
    }
  }

  /**
   * Check if RSS item is scheme-related
   */
  static isSchemeRelated(title, description = '') {
    const schemeKeywords = [
      'scheme', 'yojana', 'mission', 'program', 'initiative',
      'pradhan mantri', 'pm ', 'policy', 'benefit', 'subsidy',
      'awas', 'kisan', 'ayushman', 'digital india', 'swachh',
      'skill', 'startup', 'mudra', 'jan dhan', 'ujjwala',
      'atal', 'rashtriya', 'national', 'ministry', 'government'
    ];
    
    const text = `${title} ${description}`.toLowerCase();
    return schemeKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Transform RSS item to scheme object
   */
  static transformRSSItem(item) {
    return {
      id: this.generateId(item.title),
      title: this.cleanTitle(item.title),
      description: this.cleanDescription(item.description || item.content),
      category: this.categorizeScheme(item.title),
      eligibility: 'As per government guidelines',
      benefits: 'Various benefits as outlined in the scheme',
      applyLink: item.link || '#',
      image: this.getCategoryEmoji(this.categorizeScheme(item.title)),
      pubDate: item.pubDate,
      lastUpdated: new Date().toISOString(),
      source: 'Government RSS Feed'
    };
  }

  /**
   * Generate unique ID from title
   */
  static generateId(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20) + '_' + Date.now();
  }

  /**
   * Clean and format title
   */
  static cleanTitle(title) {
    return title
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, '') // Remove HTML entities
      .trim()
      .substring(0, 100); // Limit length
  }

  /**
   * Clean and format description
   */
  static cleanDescription(description) {
    if (!description) return 'Government initiative for citizen welfare.';
    
    return description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, '') // Remove HTML entities
      .trim()
      .substring(0, 200) + '...'; // Limit length
  }

  /**
   * Categorize scheme based on keywords
   */
  static categorizeScheme(title) {
    const categories = {
      'Housing': ['awas', 'housing', 'ghar', 'shelter'],
      'Healthcare': ['health', 'ayushman', 'medical', 'hospital', 'treatment'],
      'Agriculture': ['kisan', 'farmer', 'crop', 'agriculture', 'farming', 'rural'],
      'Technology': ['digital', 'internet', 'tech', 'online', 'cyber', 'it'],
      'Education': ['education', 'school', 'student', 'scholarship', 'learning', 'skill'],
      'Employment': ['employment', 'job', 'work', 'rozgar', 'startup', 'business'],
      'Finance': ['bank', 'loan', 'mudra', 'jan dhan', 'finance', 'money'],
      'Sanitation': ['swachh', 'clean', 'toilet', 'waste', 'sanitation'],
      'Transportation': ['transport', 'metro', 'railway', 'road', 'vehicle'],
      'Energy': ['solar', 'energy', 'power', 'electricity', 'ujjwala', 'gas']
    };

    const lowerTitle = title.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerTitle.includes(keyword))) {
        return category;
      }
    }
    
    return 'General';
  }

  /**
   * Get emoji for category
   */
  static getCategoryEmoji(category) {
    const emojiMap = {
      'Housing': '🏠',
      'Healthcare': '🏥',
      'Agriculture': '🌾',
      'Technology': '💻',
      'Education': '📚',
      'Employment': '💼',
      'Finance': '💰',
      'Sanitation': '🧹',
      'Transportation': '🚌',
      'Energy': '⚡',
      'General': '📋'
    };
    return emojiMap[category] || '📋';
  }

  /**
   * Remove duplicate schemes
   */
  static removeDuplicates(schemes) {
    const seen = new Set();
    return schemes.filter(scheme => {
      const key = scheme.title.toLowerCase().substring(0, 50);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Get fallback/cached schemes if API fails
   */
  static getFallbackSchemes() {
    return [
      {
        id: 'pm_awas_fallback',
        title: 'Pradhan Mantri Awas Yojana',
        description: 'Housing for All scheme providing financial assistance for house construction.',
        category: 'Housing',
        eligibility: 'Annual family income below ₹18 lakhs',
        benefits: 'Interest subsidy up to ₹2.67 lakhs',
        applyLink: 'https://pmaymis.gov.in/',
        image: '🏠',
        source: 'Cached Data'
      },
      {
        id: 'ayushman_fallback',
        title: 'Ayushman Bharat Scheme',
        description: 'National Health Protection Scheme providing health insurance coverage.',
        category: 'Healthcare',
        eligibility: 'SECC eligible families',
        benefits: 'Health cover up to ₹5 lakhs per family',
        applyLink: 'https://www.pmjay.gov.in/',
        image: '🏥',
        source: 'Cached Data'
      },
      {
        id: 'digital_india_fallback',
        title: 'Digital India Initiative',
        description: 'Transform India into digitally empowered society and knowledge economy.',
        category: 'Technology',
        eligibility: 'All citizens',
        benefits: 'Digital services, infrastructure, literacy',
        applyLink: 'https://digitalindia.gov.in/',
        image: '💻',
        source: 'Cached Data'
      },
      {
        id: 'skill_india_fallback',
        title: 'Skill India Mission',
        description: 'Enhancing employability through skill development programs.',
        category: 'Education',
        eligibility: 'Youth aged 15-45 years',
        benefits: 'Free skill training and certification',
        applyLink: 'https://www.skillindia.gov.in/',
        image: '📚',
        source: 'Cached Data'
      },
      {
        id: 'swachh_bharat_fallback',
        title: 'Swachh Bharat Mission',
        description: 'Clean India Mission focusing on sanitation and hygiene.',
        category: 'Sanitation',
        eligibility: 'All citizens and communities',
        benefits: 'Clean environment and health benefits',
        applyLink: 'https://swachhbharatmission.gov.in/',
        image: '🧹',
        source: 'Cached Data'
      },
      {
        id: 'ujjwala_fallback',
        title: 'Pradhan Mantri Ujjwala Yojana',
        description: 'Providing LPG connections to women from poor households.',
        category: 'Energy',
        eligibility: 'BPL families',
        benefits: 'Free LPG connection',
        applyLink: 'https://www.pmuy.gov.in/',
        image: '⚡',
        source: 'Cached Data'
      }
    ];
  }
}