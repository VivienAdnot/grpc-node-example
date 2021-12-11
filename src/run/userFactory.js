const _ = require('lodash');

const UserFactory = () => {
  let userIdCounter = 0;

  const users = [];

  const createUser = ({ firstname, age, lastname, job }) => {
    const userCreated = {
      userId: userIdCounter,
      firstname, age, lastname, job
    };
    users.push(userCreated);
    userIdCounter++;
    return userCreated;
  };

  const getUserById = (userId) => {
    // console.log('all users', users)
    console.log('find user', userId);
    const user = users.find(user => user.userId === userId);
    // will return either user or null
    return user;
  };

  const getAllUsers = () => {
    return users;
  };

  const patchUser = ({ userId, firstname, age, lastname, job }) => {
    console.log('patch user, search index for user id', userId);
    const userIndex = users.findIndex(user => user.userId === userId);
    console.log({ userIndex });
    if (userIndex === -1) throw new Error(`User not found: ${userId}`);
    
    const originUser = users[userIndex];
    // console.log({ originUser });
    // console.log({ userId, firstname, age, lastname, job });
    const updatedUser = _.merge(originUser, { userId, firstname, age, lastname, job })
    // console.log({ updatedUser});
    users[userIndex] = updatedUser;
    return updatedUser;
  };

  const deleteUser = (userId) => {
    const userIndex = users.findIndex(user => user.userId === userId);
    if (userIndex === -1) throw new Error(`User not found: ${userId}`);
    users.splice(userIndex, 1);
  }

  return {
    createUser,
    getUserById,
    getAllUsers,
    patchUser,
    deleteUser
  };
};

module.exports = UserFactory;