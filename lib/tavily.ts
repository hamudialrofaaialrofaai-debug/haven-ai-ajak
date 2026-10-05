export interface TavilyDoc {
  pageContent: string;
  metadata: {
    title: string;
    source: string;
    score?: number;
  };
}

export class TavilySearchAPIRetriever {
  apiKey: string;
  k: number;

  constructor(options?: { apiKey?: string; k?: number }) {
    this.apiKey = options?.apiKey || process.env.TAVILY_API_KEY || '';
    this.k = options?.k || 5;
  }

  async getRelevantDocuments(query: string): Promise<TavilyDoc[]> {
    if (!this.apiKey || !query.trim()) {
      return [];
    }

    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          search_depth: 'advanced',
          include_answer: true,
          max_results: this.k,
        }),
      });

      if (!res.ok) {
        console.warn(`Tavily search API responded with status ${res.status}`);
        return [];
      }

      const data = await res.json();
      if (Array.isArray(data.results)) {
        return data.results.map((r: any) => ({
          pageContent: r.content || '',
          metadata: {
            title: r.title || 'Web Result',
            source: r.url || '',
            score: r.score,
          },
        }));
      }
      return [];
    } catch (err) {
      console.warn('Tavily retriever error:', err);
      return [];
    }
  }
}
