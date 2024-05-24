import { io } from "socket.io-client";

const isLocalhost = window.location.href.includes("localhost");

export const baseURL = isLocalhost ? "http://localhost:3000/" : "";

export const socket = io("http://localhost:3000");

