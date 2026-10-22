export const getBasename = () => {
    const pathname =  new URL(document.baseURI).pathname;
    return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  }