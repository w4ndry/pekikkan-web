// Google Analytics and performance tracking utilities

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

interface PerformanceMetrics {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

class Analytics {
  private isInitialized = false;
  private measurementId = 'G-LYC8GQ1NZK';

  init(measurementId?: string) {
    if (typeof window === 'undefined' || this.isInitialized) return;

    const gaId = measurementId || this.measurementId;

    // Load Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.gtag = window.gtag || function() {
      (window.gtag.q = window.gtag.q || []).push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId, {
      page_title: document.title,
      page_location: window.location.href,
      custom_map: {
        'custom_parameter_1': 'quote_author',
        'custom_parameter_2': 'quote_category'
      }
    });

    // Set up enhanced ecommerce for quote interactions
    window.gtag('config', gaId, {
      send_page_view: false,
      anonymize_ip: true,
      allow_google_signals: true,
      allow_ad_personalization_signals: false
    });

    this.isInitialized = true;
    console.log(`Google Analytics initialized with ID: ${gaId}`);
  }

  // Track page views with enhanced data
  trackPageView(path: string, title?: string) {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('config', this.measurementId, {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    });

    // Send page view event
    window.gtag('event', 'page_view', {
      page_title: title || document.title,
      page_location: window.location.href,
      page_path: path,
    });
  }

  // Track custom events with enhanced parameters
  trackEvent({ action, category, label, value }: AnalyticsEvent) {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      custom_parameter_1: label, // For quote author tracking
      send_to: this.measurementId
    });
  }

  // Track quote interactions with detailed analytics
  trackQuoteInteraction(action: 'like' | 'save' | 'share' | 'report', quoteId: string, author: string) {
    this.trackEvent({
      action: `quote_${action}`,
      category: 'Quote Interaction',
      label: `${author} - ${quoteId}`,
    });

    // Enhanced ecommerce tracking for quote engagement
    window.gtag('event', 'select_content', {
      content_type: 'quote',
      content_id: quoteId,
      custom_parameter_1: author,
      custom_parameter_2: action,
    });

    // Track author popularity
    window.gtag('event', 'author_interaction', {
      event_category: 'Author Engagement',
      event_label: author,
      custom_parameter_1: author,
      value: action === 'like' ? 2 : action === 'save' ? 3 : 1
    });
  }

  // Track search queries with enhanced data
  trackSearch(query: string, resultsCount: number) {
    this.trackEvent({
      action: 'search',
      category: 'Search',
      label: query,
      value: resultsCount,
    });

    // Enhanced search tracking
    window.gtag('event', 'search', {
      search_term: query,
      search_results: resultsCount,
      content_type: 'quotes'
    });
  }

  // Track user engagement with conversion tracking
  trackEngagement(action: 'signup' | 'login' | 'post_quote' | 'profile_view') {
    this.trackEvent({
      action,
      category: 'User Engagement',
    });

    // Track as conversions for important actions
    if (action === 'signup') {
      window.gtag('event', 'sign_up', {
        method: 'email',
        event_category: 'User Engagement'
      });
    } else if (action === 'post_quote') {
      window.gtag('event', 'share', {
        method: 'quote_post',
        content_type: 'quote',
        event_category: 'Content Creation'
      });
    }
  }

  // Track category interactions
  trackCategoryView(categoryName: string, quotesCount: number) {
    this.trackEvent({
      action: 'view_category',
      category: 'Content Discovery',
      label: categoryName,
      value: quotesCount
    });

    window.gtag('event', 'view_item_list', {
      item_list_name: categoryName,
      item_list_id: categoryName.toLowerCase().replace(/\s+/g, '_'),
      items: [{
        item_id: categoryName,
        item_name: `${categoryName} Quotes`,
        item_category: 'Quote Category',
        quantity: quotesCount
      }]
    });
  }

  // Track author page views
  trackAuthorView(authorName: string, quotesCount: number) {
    this.trackEvent({
      action: 'view_author',
      category: 'Author Discovery',
      label: authorName,
      value: quotesCount
    });

    window.gtag('event', 'view_item_list', {
      item_list_name: `${authorName} Quotes`,
      item_list_id: authorName.toLowerCase().replace(/\s+/g, '_'),
      items: [{
        item_id: authorName,
        item_name: authorName,
        item_category: 'Author',
        quantity: quotesCount
      }]
    });
  }

  // Track performance metrics
  trackPerformance() {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    // Core Web Vitals
    this.measureCLS();
    this.measureFID();
    this.measureLCP();
    this.measureFCP();
    this.measureTTFB();
  }

  private measureCLS() {
    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        this.reportMetric({
          name: 'CLS',
          value: clsValue,
          rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private measureFID() {
    // First Input Delay
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = (entry as any).processingStart - entry.startTime;
          this.reportMetric({
            name: 'FID',
            value: fid,
            rating: fid < 100 ? 'good' : fid < 300 ? 'needs-improvement' : 'poor'
          });
        }
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  private measureLCP() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.startTime;
        
        this.reportMetric({
          name: 'LCP',
          value: lcp,
          rating: lcp < 2500 ? 'good' : lcp < 4000 ? 'needs-improvement' : 'poor'
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  private measureFCP() {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.reportMetric({
              name: 'FCP',
              value: entry.startTime,
              rating: entry.startTime < 1800 ? 'good' : entry.startTime < 3000 ? 'needs-improvement' : 'poor'
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
    }
  }

  private measureTTFB() {
    // Time to First Byte
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            const ttfb = navEntry.responseStart - navEntry.requestStart;
            
            this.reportMetric({
              name: 'TTFB',
              value: ttfb,
              rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor'
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
    }
  }

  private reportMetric(metric: PerformanceMetrics) {
    // Send to analytics
    this.trackEvent({
      action: 'performance_metric',
      category: 'Performance',
      label: `${metric.name}_${metric.rating}`,
      value: Math.round(metric.value),
    });

    // Send as custom event for detailed analysis
    window.gtag('event', 'web_vitals', {
      metric_name: metric.name,
      metric_value: Math.round(metric.value),
      metric_rating: metric.rating,
      event_category: 'Performance'
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`${metric.name}: ${metric.value} (${metric.rating})`);
    }
  }

  // Track user journey and session data
  trackUserJourney(step: string, data?: Record<string, any>) {
    window.gtag('event', 'user_journey', {
      journey_step: step,
      event_category: 'User Journey',
      ...data
    });
  }

  // Track quote sharing
  trackQuoteShare(quoteId: string, author: string, method: string) {
    this.trackEvent({
      action: 'share_quote',
      category: 'Social Sharing',
      label: `${author} - ${method}`,
    });

    window.gtag('event', 'share', {
      method: method,
      content_type: 'quote',
      content_id: quoteId,
      custom_parameter_1: author
    });
  }
}

// Global analytics instance
export const analytics = new Analytics();

// Declare global gtag function
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}