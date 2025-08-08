/*!
 * Performance Monitor - Real-time performance tracking
 * Monitors page performance and provides optimization insights
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.observers = [];
        this.isMonitoring = false;
        this.reportInterval = null;
        
        this.init();
    }

    init() {
        // Initialize performance tracking
        this.trackPageLoad();
        this.trackResourceLoading();
        this.trackUserInteractions();
        this.trackRenderingPerformance();
        
        // Enable monitoring in development
        this.enableMonitoring();
    }

    trackPageLoad() {
        // Track initial page load metrics
        window.addEventListener('load', () => {
            if (performance.getEntriesByType) {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    this.metrics.pageLoad = {
                        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                        loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                        totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
                        firstByte: Math.round(perfData.responseStart - perfData.requestStart),
                        domReady: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart)
                    };
                }
            }
            
            // Track First Contentful Paint and Largest Contentful Paint
            this.trackPaintMetrics();
        });
    }

    trackPaintMetrics() {
        if (window.PerformanceObserver) {
            // First Contentful Paint
            const fcpObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.firstContentfulPaint = Math.round(entry.startTime);
                    }
                }
            });
            
            try {
                fcpObserver.observe({ entryTypes: ['paint'] });
                this.observers.push(fcpObserver);
            } catch (e) {
                // Paint API not supported
            }
            
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.largestContentfulPaint = Math.round(lastEntry.startTime);
            });
            
            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                this.observers.push(lcpObserver);
            } catch (e) {
                // LCP API not supported
            }
            
            // Cumulative Layout Shift
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.metrics.cumulativeLayoutShift = clsValue;
            });
            
            try {
                clsObserver.observe({ entryTypes: ['layout-shift'] });
                this.observers.push(clsObserver);
            } catch (e) {
                // CLS API not supported
            }
        }
    }

    trackResourceLoading() {
        if (window.PerformanceObserver) {
            const resourceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    // Track slow resources
                    if (entry.duration > 1000) {
                        if (!this.metrics.slowResources) {
                            this.metrics.slowResources = [];
                        }
                        this.metrics.slowResources.push({
                            name: entry.name.split('/').pop(),
                            duration: Math.round(entry.duration),
                            size: entry.transferSize || 0,
                            type: entry.initiatorType
                        });
                    }
                    
                    // Track total resource metrics
                    if (!this.metrics.resources) {
                        this.metrics.resources = {
                            total: 0,
                            totalSize: 0,
                            totalDuration: 0
                        };
                    }
                    
                    this.metrics.resources.total++;
                    this.metrics.resources.totalSize += entry.transferSize || 0;
                    this.metrics.resources.totalDuration += entry.duration;
                }
            });
            
            try {
                resourceObserver.observe({ entryTypes: ['resource'] });
                this.observers.push(resourceObserver);
            } catch (e) {
                // Resource API not supported
            }
        }
    }

    trackUserInteractions() {
        // Track interaction delays
        let interactionStart = 0;
        
        ['click', 'keydown', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                interactionStart = performance.now();
            }, { passive: true });
        });
        
        // Track when UI updates complete
        const trackInteractionEnd = () => {
            if (interactionStart > 0) {
                const interactionTime = performance.now() - interactionStart;
                if (interactionTime > 100) { // Only track slow interactions
                    if (!this.metrics.slowInteractions) {
                        this.metrics.slowInteractions = [];
                    }
                    this.metrics.slowInteractions.push(Math.round(interactionTime));
                }
                interactionStart = 0;
            }
        };
        
        // Use requestAnimationFrame to detect when rendering is complete
        document.addEventListener('click', () => {
            requestAnimationFrame(trackInteractionEnd);
        }, { passive: true });
    }

    trackRenderingPerformance() {
        // Track long tasks that block the main thread
        if (window.PerformanceObserver) {
            const longTaskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!this.metrics.longTasks) {
                        this.metrics.longTasks = [];
                    }
                    this.metrics.longTasks.push({
                        duration: Math.round(entry.duration),
                        startTime: Math.round(entry.startTime)
                    });
                }
            });
            
            try {
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.push(longTaskObserver);
            } catch (e) {
                // Long task API not supported
            }
        }
        
        // Track memory usage if available
        if (performance.memory) {
            this.trackMemoryUsage();
        }
    }

    trackMemoryUsage() {
        const updateMemoryMetrics = () => {
            if (performance.memory) {
                this.metrics.memory = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) // MB
                };
            }
        };
        
        // Update memory metrics every 5 seconds
        setInterval(updateMemoryMetrics, 5000);
        updateMemoryMetrics(); // Initial measurement
    }

    enableMonitoring() {
        // Only enable in development or when explicitly requested
        const isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.search.includes('debug=true');
        
        if (isDev) {
            this.isMonitoring = true;
            this.createMonitoringUI();
            this.startReporting();
        }
    }

    createMonitoringUI() {
        const monitor = document.createElement('div');
        monitor.id = 'performance-monitor';
        monitor.className = 'performance-monitor';
        monitor.innerHTML = `
            <div class="monitor-header">
                <span>Performance Monitor</span>
                <button class="monitor-toggle" onclick="window.perfMonitor.toggleMonitor()">−</button>
            </div>
            <div class="monitor-content">
                <div class="metric-group">
                    <div class="metric">
                        <span class="metric-label">Page Load:</span>
                        <span class="metric-value" id="page-load-time">-</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">FCP:</span>
                        <span class="metric-value" id="fcp-time">-</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">LCP:</span>
                        <span class="metric-value" id="lcp-time">-</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">CLS:</span>
                        <span class="metric-value" id="cls-score">-</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Memory:</span>
                        <span class="metric-value" id="memory-usage">-</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Resources:</span>
                        <span class="metric-value" id="resource-count">-</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(monitor);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .performance-monitor {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 0;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                z-index: 10000;
                min-width: 200px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .monitor-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.1);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                font-weight: bold;
            }
            
            .monitor-toggle {
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
            }
            
            .monitor-content {
                padding: 12px;
            }
            
            .metric {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
            }
            
            .metric-label {
                opacity: 0.8;
            }
            
            .metric-value {
                font-weight: bold;
                color: #4ade80;
            }
            
            .metric-value.warning {
                color: #fbbf24;
            }
            
            .metric-value.error {
                color: #ef4444;
            }
        `;
        document.head.appendChild(style);
    }

    updateMonitoringUI() {
        if (!this.isMonitoring) return;
        
        const updateElement = (id, value, threshold = null) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                
                if (threshold) {
                    element.className = 'metric-value';
                    if (typeof threshold.warning === 'number' && parseFloat(value) > threshold.warning) {
                        element.className += ' warning';
                    }
                    if (typeof threshold.error === 'number' && parseFloat(value) > threshold.error) {
                        element.className += ' error';
                    }
                }
            }
        };
        
        // Update metrics
        if (this.metrics.pageLoad) {
            updateElement('page-load-time', `${this.metrics.pageLoad.totalTime}ms`, { warning: 3000, error: 5000 });
        }
        
        if (this.metrics.firstContentfulPaint) {
            updateElement('fcp-time', `${this.metrics.firstContentfulPaint}ms`, { warning: 1800, error: 3000 });
        }
        
        if (this.metrics.largestContentfulPaint) {
            updateElement('lcp-time', `${this.metrics.largestContentfulPaint}ms`, { warning: 2500, error: 4000 });
        }
        
        if (this.metrics.cumulativeLayoutShift !== undefined) {
            updateElement('cls-score', this.metrics.cumulativeLayoutShift.toFixed(3), { warning: 0.1, error: 0.25 });
        }
        
        if (this.metrics.memory) {
            updateElement('memory-usage', `${this.metrics.memory.used}MB`, { warning: 50, error: 100 });
        }
        
        if (this.metrics.resources) {
            updateElement('resource-count', `${this.metrics.resources.total}`, { warning: 50, error: 100 });
        }
    }

    startReporting() {
        if (!this.isMonitoring) return;
        
        // Update UI every 2 seconds
        this.reportInterval = setInterval(() => {
            this.updateMonitoringUI();
        }, 2000);
        
        // Initial update
        setTimeout(() => this.updateMonitoringUI(), 1000);
    }

    toggleMonitor() {
        const monitor = document.getElementById('performance-monitor');
        const content = monitor.querySelector('.monitor-content');
        const toggle = monitor.querySelector('.monitor-toggle');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggle.textContent = '−';
        } else {
            content.style.display = 'none';
            toggle.textContent = '+';
        }
    }

    getMetrics() {
        return { ...this.metrics };
    }

    getPerformanceScore() {
        let score = 100;
        
        // Deduct points for poor metrics
        if (this.metrics.firstContentfulPaint > 3000) score -= 20;
        if (this.metrics.largestContentfulPaint > 4000) score -= 20;
        if (this.metrics.cumulativeLayoutShift > 0.25) score -= 20;
        if (this.metrics.pageLoad && this.metrics.pageLoad.totalTime > 5000) score -= 20;
        if (this.metrics.longTasks && this.metrics.longTasks.length > 5) score -= 20;
        
        return Math.max(0, score);
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            metrics: this.getMetrics(),
            score: this.getPerformanceScore(),
            recommendations: this.getRecommendations()
        };
        
        console.table(report.metrics);
        console.log('Performance Score:', report.score);
        console.log('Recommendations:', report.recommendations);
        
        return report;
    }

    getRecommendations() {
        const recommendations = [];
        
        if (this.metrics.firstContentfulPaint > 3000) {
            recommendations.push('Optimize First Contentful Paint by reducing render-blocking resources');
        }
        
        if (this.metrics.largestContentfulPaint > 4000) {
            recommendations.push('Improve Largest Contentful Paint by optimizing largest images and text');
        }
        
        if (this.metrics.cumulativeLayoutShift > 0.25) {
            recommendations.push('Reduce Cumulative Layout Shift by setting image dimensions and avoiding dynamic content');
        }
        
        if (this.metrics.slowResources && this.metrics.slowResources.length > 0) {
            recommendations.push(`Optimize slow resources: ${this.metrics.slowResources.map(r => r.name).join(', ')}`);
        }
        
        if (this.metrics.longTasks && this.metrics.longTasks.length > 5) {
            recommendations.push('Break up long tasks to improve main thread responsiveness');
        }
        
        return recommendations;
    }

    destroy() {
        // Clean up observers
        this.observers.forEach(observer => observer.disconnect());
        
        // Clear intervals
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
        }
        
        // Remove monitoring UI
        const monitor = document.getElementById('performance-monitor');
        if (monitor) {
            monitor.remove();
        }
    }
}

// Initialize performance monitor
window.perfMonitor = new PerformanceMonitor();

// Make report function available globally
window.getPerformanceReport = () => window.perfMonitor.generateReport();

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.perfMonitor) {
        window.perfMonitor.destroy();
    }
});
