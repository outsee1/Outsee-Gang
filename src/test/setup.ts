import "@testing-library/jest-dom";

// jsdom doesn't implement URL.createObjectURL — stub it for components
// that preview File inputs.
if (typeof URL.createObjectURL === "undefined") {
  // @ts-expect-error stub for tests
  URL.createObjectURL = () => "blob:mock";
}
if (typeof URL.revokeObjectURL === "undefined") {
  // @ts-expect-error stub for tests
  URL.revokeObjectURL = () => {};
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
