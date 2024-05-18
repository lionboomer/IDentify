// Get User Agent
export const getUserAgent = () => navigator.userAgent;

// Get IP address
export const getIpAddress = async () => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    if (response.ok) {
      const data = await response.json();
      return data.ip;
    }
    throw new Error("Failed to fetch IP address");
  } catch (err) {
    throw new Error("Failed to fetch IP address" + err.message);
  }
};

// Get Screen Resolution
export const getScreenResolution = () => {
  return `${window.screen.width} x ${window.screen.height}`;
};

// Get Color Depth.
export const getColorDepth = () => screen.colorDepth;

// Get Available Screen Resolution
export const getAvailableScreenResolution = () => {
  return `${screen.availWidth}x${screen.availHeight}`;
};

// Get Pixel Ratio
export const getPixelRatio = () => window.devicePixelRatio;

// Get time zone offset.
export const getTimezoneOffset = () => new Date().getTimezoneOffset();

// Check if Session Storage is supported
export const getSessionStorage = () => {
  try {
    return !!window.sessionStorage;
  } catch (e) {
    return true;
  }
};

// Check if Local Storage is supported
export const getLocalStorage = () => {
  try {
    return !!window.localStorage;
  } catch (e) {
    return true;
  }
};

// Check if IndexedDB is supported
export const getIndexedDB = () => {
  try {
    return !!window.indexedDB;
  } catch (e) {
    return true;
  }
};

// Check if cookies are supported
export const getCookiesEnabled = () => navigator.cookieEnabled;

//Check if touch is supported
export const getTouchSupport = () => {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
};

// Get supported languages
export const getLanguages = () => navigator.languages;

//Check if Tracking Prevention is enabled
export const getDoNotTrack = () => {
  if (navigator.doNotTrack) {
    return navigator.doNotTrack;
  } else if (navigator.msDoNotTrack) {
    return navigator.msDoNotTrack;
  } else if (window.doNotTrack) {
    return window.doNotTrack;
  } else {
    return "unknown";
  }
};

// Get the number of cores.
export const getHardwareConcurrency = () => navigator.hardwareConcurrency;

// Get browser platform
export const getPlatform = () => navigator.platform;

// Get plugins
export const getPlugins = () => {
  return Array.from(navigator.plugins).map((plugin) => plugin.name);
};

// check if pdfViewer is enabled.
export const getPdfViewerEnabled = () => navigator.pdfViewerEnabled;

// check if there are forced colors
export const getForcedColors = () => {
  return window.matchMedia("(forced-colors)").matches;
};
