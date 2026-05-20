import "@testing-library/jest-dom";

// jsdom doesn't implement URL.createObjectURL — stub it for components
// that preview File inputs.
if (typeof URL.createObjectURL === "undefined") {
  (URL as any).createObjectURL = () => "blob:mock";
}
if (typeof URL.revokeObjectURL === "undefined") {
  (URL as any).revokeObjectURL = () => {};
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
