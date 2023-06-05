declare global {
  interface Window {
    chrome: object;
  }
}

export function isChrome(): boolean {
    return !!window.chrome;
}

export function isWebkit(): boolean{
    return window.webkitURL != null && !isFirefox()
}

export function isFirefox(): boolean {
    return navigator.userAgent.search("Firefox") >= 0;
}
