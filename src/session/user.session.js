import User from '../classes/models/user.class.js';
import { userSessions } from './sessions.js';

export const addUser = (socket, uuid) => {
  // const user = { socket, id: uuid, sequence: 0 };
  const user = new User(uuid, socket);
  userSessions.push(user);
  return user;
};

export const removeUser = (socket) => {
  const index = userSessions.findIndex((user) => user.socket === socket);
  if (index !== -1) {
    return userSessions.splice(index, 1)[0];
  }
};

export const getNextSequence = (id) => {
  const user = getUserById(id);
  if (user) {
    // return ++user.sequence;
    return user.getNextSequence();
  }
  return null;
};

export const getUserById = (id) => {
  return userSessions.find((user) => user.id === id);
};
