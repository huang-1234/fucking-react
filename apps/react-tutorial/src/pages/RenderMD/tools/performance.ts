class PerformanceMonitor {
  private timers: Record<string, number> = {};
  private measurements: Record<string, number[]> = {};
  private enabled: boolean = true;

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  public start(label: string): void {
    if (!this.enabled) return;
    this.timers[label] = performance.now();
  }

  public end(label: string): number {
    if (!this.enabled || !this.timers[label]) return 0;

    const duration = performance.now() - this.timers[label];
    if (!this.measurements[label]) {
      this.measurements[label] = [];
    }
    this.measurements[label].push(duration);
    delete this.timers[label];

    return duration;
  }

  public getAverage(label: string): number {
    if (!this.measurements[label] || this.measurements[label].length === 0) {
      return 0;
    }

    const sum = this.measurements[label].reduce((acc, val) => acc + val, 0);
    return sum / this.measurements[label].length;
  }

  public getMetrics(): Record<string, { average: number, count: number, total: number }> {
    const metrics: Record<string, { average: number, count: number, total: number }> = {};

    for (const [label, times] of Object.entries(this.measurements)) {
      const total = times.reduce((acc, val) => acc + val, 0);
      metrics[label] = {
        average: total / times.length,
        count: times.length,
        total
      };
    }

    return metrics;
  }

  public reset(): void {
    this.timers = {};
    this.measurements = {};
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }
}

export const performanceMonitor = new PerformanceMonitor();
