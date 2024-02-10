const isLocalhost = window.location.href.includes("localhost");

export const baseURL = isLocalhost ? "http://localhost:3000/" : "";
