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

  init(measurementId: string) {
    if (typeof window === 'undefined' || this.isInitialized) return;

    // Load Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.gtag = window.gtag || function() {
      (window.gtag.q = window.gtag.q || []).push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    this.isInitialized = true;
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
      page_title: title || document.title,
    });
  }

  // Track custom events
  trackEvent({ action, category, label, value }: AnalyticsEvent) {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // Track quote interactions
  trackQuoteInteraction(action: 'like' | 'save' | 'share' | 'report', quoteId: string, author: string) {
    this.trackEvent({
      action,
      category: 'Quote Interaction',
      label: `${author} - ${quoteId}`,
    });
  }

  // Track search queries
  trackSearch(query: string, resultsCount: number) {
    this.trackEvent({
      action: 'search',
      category: 'Search',
      label: query,
      value: resultsCount,
    });
  }

  // Track user engagement
  trackEngagement(action: 'signup' | 'login' | 'post_quote' | 'profile_view') {
    this.trackEvent({
      action,
      category: 'User Engagement',
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

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${metric.name}: ${metric.value} (${metric.rating})`);
    }
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