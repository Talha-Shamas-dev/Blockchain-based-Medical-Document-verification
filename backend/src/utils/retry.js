export const withRetry = async (fn, { attempts = 3, baseMs = 500, label = '', shouldRetry = () => true } = {}) => {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); }
    catch (err) {
      lastError = err;
      if (!shouldRetry(err)) throw err;
      if (i === attempts - 1) throw err;
      const delay = baseMs * Math.pow(2, i) + Math.random() * 100;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
};

export class CircuitBreaker {
  constructor({ threshold = 5, resetMs = 30000 } = {}) {
    this.threshold = threshold;
    this.resetMs = resetMs;
    this.failures = 0;
    this.state = 'CLOSED';
    this.lastFailure = 0;
  }
  async call(fn) {
    if (this.state === 'OPEN' && (Date.now() - this.lastFailure < this.resetMs)) {
      throw new Error('Circuit breaker OPEN');
    }
    try {
      const result = await fn();
      this.failures = 0;
      this.state = 'CLOSED';
      return result;
    } catch (err) {
      this.failures++;
      this.lastFailure = Date.now();
      if (this.failures >= this.threshold) this.state = 'OPEN';
      throw err;
    }
  }
}
