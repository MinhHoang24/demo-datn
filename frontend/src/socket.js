import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_API_BASE_URL;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});