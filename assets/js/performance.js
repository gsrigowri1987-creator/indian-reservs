class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.marks = new Map();
    
    if (window.performance) {
      window.addEventListener('load', () => {
        // Run after load event finishes
        setTimeout(() => {
          this.measurePageLoad();
          this.measureWebVitals();
        }, 100);
      });
    }
  }

  mark(name) {
    this.marks.set(name, performance.now());
  }

  measure(name, markStart, markEnd) {
    const start = this.marks.get(markStart) || 0;
    const end = this.marks.get(markEnd) || performance.now();
    const duration = end - start;
    this.metrics[name] = duration;
    return duration;
  }

  measurePageLoad() {
    const perf = performance.getEntriesByType('navigation')[0];
    if (perf) {
      this.metrics['dns'] = perf.domainLookupEnd - perf.domainLookupStart;
      this.metrics['tcp'] = perf.connectEnd - perf.connectStart;
      this.metrics['request'] = perf.responseStart - perf.requestStart;
      this.metrics['response'] = perf.responseEnd - perf.responseStart;
      this.metrics['dom'] = perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart;
      this.metrics['load'] = perf.loadEventEnd - perf.loadEventStart;
      this.metrics['total'] = perf.loadEventEnd - perf.fetchStart;
    }
  }

  measureWebVitals() {
    // First Contentful Paint
    const fcp = performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint');
    if (fcp) this.metrics['fcp'] = fcp.startTime;

    // Largest Contentful Paint
    const lcp = performance.getEntriesByType('largest-contentful-paint').pop();
    if (lcp) this.metrics['lcp'] = lcp.startTime;

    // First Input Delay
    try {
      const fid = performance.getEntriesByType('first-input').pop();
      if (fid) this.metrics['fid'] = fid.processingStart - fid.startTime;
    } catch (e) {}
  }

  getReport() {
    return { ...this.metrics };
  }

  logReport() {
    console.table(this.metrics);
  }
}

const performanceMonitor = new PerformanceMonitor();
