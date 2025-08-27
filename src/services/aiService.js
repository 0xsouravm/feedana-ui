// services/aiService.js  
const AI_ENABLED = true; // Using Hugging Face API for real AI sentiment analysis

class AIService {
  constructor() {
    this.sentimentPipeline = null;
    this.summarizationPipeline = null;
    this.enabled = AI_ENABLED;
    this.pipeline = null;
  }

  async loadPipeline() {
    if (!this.pipeline && this.enabled) {
      try {
        const { pipeline } = await import('@xenova/transformers');
        this.pipeline = pipeline;
        return this.pipeline;
      } catch (error) {
        console.error('Failed to load Xenova transformers:', error);
        this.enabled = false;
        return null;
      }
    }
    return this.pipeline;
  }

  async initSentiment() {
    if (!this.enabled) return null;
    
    if (!this.sentimentPipeline) {
      try {
        console.log('Initializing sentiment analysis pipeline...');
        const pipeline = await this.loadPipeline();
        if (!pipeline) {
          throw new Error('Pipeline not available');
        }
        this.sentimentPipeline = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
        console.log('Sentiment pipeline initialized successfully');
      } catch (error) {
        console.error('Failed to initialize sentiment pipeline:', error);
        this.enabled = false;
        return null;
      }
    }
    return this.sentimentPipeline;
  }

  async analyzeSentiment(text) {
    // Input validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.warn('Invalid input for sentiment analysis:', text);
      return 'neutral';
    }

    console.log('🤖 Analyzing sentiment with Hugging Face API...');
    
    try {
      // Try Hugging Face API first (free tier)
      const result = await this.huggingFaceSentiment(text);
      if (result) {
        console.log(`✅ AI sentiment analysis: ${result}`);
        return result;
      }
    } catch (error) {
      console.warn('Hugging Face API failed:', error);
    }

    // Fallback to rule-based if API fails
    console.log('🔄 Falling back to rule-based sentiment analysis...');
    return this.ruleBasedSentimentAnalysis(text);
  }

  async huggingFaceSentiment(text) {
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Using public demo endpoint (no API key needed for basic usage)
        },
        body: JSON.stringify({
          inputs: text.substring(0, 500) // Limit text length
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
        const sentiments = result[0];
        // Find highest scoring sentiment
        const topSentiment = sentiments.reduce((max, current) => 
          current.score > max.score ? current : max
        );

        // Map Hugging Face labels to our format
        const label = topSentiment.label.toLowerCase();
        if (label.includes('positive') || label === 'label_2') return 'positive';
        if (label.includes('negative') || label === 'label_0') return 'negative';
        return 'neutral';
      }

      throw new Error('Invalid API response format');
    } catch (error) {
      console.error('Hugging Face sentiment API error:', error);
      return null;
    }
  }

  ruleBasedSentimentAnalysis(text) {
    const cleanText = text.toLowerCase().trim();
    
    // Positive words and phrases
    const positiveWords = [
      'love', 'excellent', 'amazing', 'great', 'fantastic', 'wonderful', 'awesome', 'good', 'best',
      'perfect', 'brilliant', 'outstanding', 'superb', 'magnificent', 'impressive', 'incredible',
      'helpful', 'useful', 'thank', 'thanks', 'grateful', 'appreciate', 'nice', 'beautiful',
      'excited', 'happy', 'pleased', 'satisfied', 'delighted', 'thrilled', 'enjoyable',
      'recommend', 'love it', 'well done', 'keep up', 'congratulations', 'success', 'win',
      'improve', 'better', 'upgrade', 'enhance', 'positive', 'benefit', 'advantage'
    ];

    // Negative words and phrases
    const negativeWords = [
      'hate', 'terrible', 'awful', 'bad', 'worst', 'horrible', 'disgusting', 'pathetic',
      'useless', 'worthless', 'disappointing', 'frustrated', 'annoying', 'irritating',
      'broken', 'fail', 'failed', 'failure', 'problem', 'issue', 'bug', 'error',
      'slow', 'laggy', 'crashes', 'freeze', 'stuck', 'confusing', 'difficult', 'hard',
      'waste', 'boring', 'stupid', 'dumb', 'ridiculous', 'pointless', 'meaningless',
      'angry', 'mad', 'upset', 'sad', 'depressed', 'worried', 'concerned', 'unhappy',
      'regret', 'sorry', 'apologize', 'mistake', 'wrong', 'incorrect', 'missing',
      // Adding more colloquial and modern negative expressions
      'nah', 'naah', 'nope', 'meh', 'ugh', 'eww', 'yuck', 'gross', 'nasty',
      'sucks', 'trash', 'garbage', 'crap', 'shit', 'damn', 'hell', 'fuck',
      'chunky', 'bulky', 'clunky', 'messy', 'ugly', 'hideous', 'awkward',
      'weird', 'strange', 'odd', 'uncomfortable', 'unpleasant', 'harsh',
      'don\'t get it', 'don\'t understand', 'makes no sense', 'confusing',
      'not good', 'not great', 'not working', 'doesn\'t work', 'won\'t work'
    ];

    // Neutral indicators
    const neutralWords = [
      'okay', 'ok', 'fine', 'average', 'normal', 'standard', 'typical', 'regular',
      'maybe', 'perhaps', 'possibly', 'might', 'could', 'would', 'should',
      'think', 'believe', 'opinion', 'suggest', 'recommend', 'consider'
    ];

    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    // Count positive words
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = cleanText.match(regex);
      if (matches) {
        positiveScore += matches.length;
      }
    });

    // Count negative words
    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = cleanText.match(regex);
      if (matches) {
        negativeScore += matches.length;
      }
    });

    // Count neutral words
    neutralWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = cleanText.match(regex);
      if (matches) {
        neutralScore += matches.length;
      }
    });

    // Check for punctuation patterns
    const exclamationCount = (cleanText.match(/!/g) || []).length;
    const questionCount = (cleanText.match(/\?/g) || []).length;
    
    // Exclamation marks often indicate strong emotion
    if (exclamationCount > 0) {
      if (positiveScore > negativeScore) {
        positiveScore += exclamationCount * 0.5;
      } else if (negativeScore > positiveScore) {
        negativeScore += exclamationCount * 0.5;
      }
    }

    // Questions are often neutral or slightly negative (concerns)
    if (questionCount > 0) {
      neutralScore += questionCount * 0.3;
    }

    // Check for negative patterns and phrases
    const negativePatterns = [
      /don't get it/gi,
      /doesn't make sense/gi,
      /not worth/gi,
      /waste of/gi,
      /too big/gi,
      /too small/gi,
      /too slow/gi,
      /too fast/gi,
      /too expensive/gi,
      /too cheap/gi,
      /not recommend/gi,
      /wouldn't recommend/gi,
      /avoid this/gi,
      /stay away/gi,
      /honestly.*not/gi,
      /really.*bad/gi,
      /pretty.*bad/gi,
      /kinda.*bad/gi
    ];

    // Check for positive patterns
    const positivePatterns = [
      /love it/gi,
      /really good/gi,
      /pretty good/gi,
      /works great/gi,
      /highly recommend/gi,
      /would recommend/gi,
      /best.*ever/gi,
      /amazing.*experience/gi
    ];

    // Apply pattern bonuses
    negativePatterns.forEach(pattern => {
      if (pattern.test(cleanText)) {
        negativeScore += 2; // Strong negative pattern bonus
      }
    });

    positivePatterns.forEach(pattern => {
      if (pattern.test(cleanText)) {
        positiveScore += 2; // Strong positive pattern bonus
      }
    });

    // Check for negation patterns that might flip sentiment
    const negationPatterns = /\b(not|don't|doesn't|won't|can't|isn't|aren't|wasn't|weren't)\s+\w+/gi;
    const negationMatches = cleanText.match(negationPatterns);
    if (negationMatches) {
      // If we find negation, lean toward negative
      negativeScore += negationMatches.length * 0.5;
    }

    console.log(`Sentiment scores - Positive: ${positiveScore}, Negative: ${negativeScore}, Neutral: ${neutralScore}`);

    // Determine sentiment based on scores with improved logic
    const totalScore = positiveScore + negativeScore + neutralScore;
    
    if (totalScore === 0) {
      return 'neutral'; // No sentiment indicators found
    }

    // More decisive scoring - even small differences matter
    if (negativeScore > positiveScore) {
      return 'negative';
    } else if (positiveScore > negativeScore) {
      return 'positive';
    } else {
      return 'neutral';
    }
  }

  async initSummarization() {
    if (!this.enabled) return null;
    
    if (!this.summarizationPipeline) {
      try {
        const pipeline = await this.loadPipeline();
        if (!pipeline) {
          throw new Error('Pipeline not available');
        }
        this.summarizationPipeline = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
      } catch (error) {
        console.error('Failed to initialize summarization pipeline:', error);
        this.enabled = false;
        return null;
      }
    }
    return this.summarizationPipeline;
  }

  async summarizeFeedbacks(feedbacks) {
    if (!this.enabled) {
      return "Summarization not available";
    }
    
    if (!feedbacks.length) return "No feedback to summarize";
    
    const text = feedbacks.map(f => f.content).join('\n\n');
    
    // Chunk text if too long (model limits)
    if (text.length > 1000) {
      const chunks = this.chunkText(text, 800);
      const summaries = await Promise.all(
        chunks.map(chunk => this.summarizeChunk(chunk))
      );
      return summaries.join(' ');
    }
    
    return await this.summarizeChunk(text);
  }

  async summarizeChunk(text) {
    if (!this.enabled) {
      return "Summarization not available";
    }
    
    try {
      const summarizer = await this.initSummarization();
      if (!summarizer) {
        return "Summarization not available";
      }
      
      const result = await summarizer(text, {
        max_length: 150,
        min_length: 50,
      });
      return result[0].summary_text;
    } catch (error) {
      console.error('Error in summarization:', error);
      return "Summarization failed";
    }
  }

  chunkText(text, maxLength) {
    const sentences = text.split('. ');
    const chunks = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxLength) {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
      }
    }
    if (currentChunk) chunks.push(currentChunk);
    
    return chunks;
  }
}

export const aiService = new AIService();