const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const _ = require('lodash');
const UserFactory = require('./userFactory');

const getUser = (call, callback) => {
  const { userId } = call.request;
  console.log('request userId', userId);

  const user = userFactory.getUserById(userId);
  console.log('found user', user);

  if (!user) {
    callback(new Error(`user id ${userId} not found`), null);
  } else {
    callback(null, user);
  }
};

const createUser = (call, callback) => {
  const { firstname, age, lastname, job } = call.request;
  const userCreated = userFactory.createUser({ firstname, age, lastname, job });
  console.log('user created', userCreated);
  callback(null, userCreated);
};

const getAllUsers = (call) => {
  const allUsers = userFactory.getAllUsers();
  _.each(allUsers, (user) => {
    call.write(user);
  });
  call.end();
};

const patchUser = (call, callback) => {
  const { userId, firstname, age, lastname, job } = call.request;
  try {
    const updatedUser = userFactory.patchUser({ userId, firstname, age, lastname, job });
    callback(null, updatedUser);
  } catch (err) {
    callback(err, null);
  }
};

const deleteUser = (call, callback) => {
  const { userId } = call.request;
  try {
    const updatedUser = userFactory.deleteUser(userId);
    callback(null, null);
  } catch (err) {
    callback(err, null);
  }
};

const run = async () => {
  // load package
  const protoPath = path.resolve(__dirname, '../protos/user.proto');
  const userpackageDefinition = await protoLoader.load(protoPath);
  const userProto = grpc.loadPackageDefinition(userpackageDefinition).user;

  // init user Factory
  userFactory.createUser({ firstname: 'Vivien', job: 1 });
  userFactory.createUser({ firstname: 'jfp', job: 0 });

  // define server
  const grpcServer = new grpc.Server();
  grpcServer.addService(userProto.User.service, {
    getUser,
    createUser,
    getAllUsers,
    patchUser,
    deleteUser
  });
  // start grpc server
  grpcServer.bindAsync('localhost:50052', grpc.ServerCredentials.createInsecure(), () => {
    grpcServer.start();
  })
};

const userFactory = UserFactory();
run();