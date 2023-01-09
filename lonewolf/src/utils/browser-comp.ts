declare global {
  interface Window {
    chrome: object;
  }
}

export function isChrome(): boolean {
    return !!window.chrome;
}

export function isFirefox(): boolean {
    return navigator.userAgent.search("Firefox") >= 0;
}
