import "@testing-library/jest-dom";

// jsdom doesn't implement IntersectionObserver; provide a no-op so components
// that set up observers don't throw on mount.
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
  constructor(_cb: IntersectionObserverCallback) {}
} as unknown as typeof IntersectionObserver;
