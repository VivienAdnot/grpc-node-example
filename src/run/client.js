const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const run = async () => {
  // load package
  const protoPath = path.resolve(__dirname, '../protos/user.proto');
  const userpackageDefinition = await protoLoader.load(protoPath);
  const userProto = grpc.loadPackageDefinition(userpackageDefinition).user;

  // create grpc client
  const serverUrl = 'localhost:50052';
  const grpcClient = new userProto.User(serverUrl, grpc.credentials.createInsecure());
  
  const getUser = (userId) => {
    return new Promise((resolve, reject) => {
      grpcClient.getUser({ userId }, (err, response) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  };

  const createUser = ({ firstname, age, lastname, job }) => {
    return new Promise((resolve, reject) => {
      grpcClient.createUser({ firstname, age, lastname, job }, (err, response) => {
        if (err) reject(err);
        else resolve(response);
      })
    });
  };

  const getAllUsers = () => {
    return new Promise((resolve) => {
      const users = [];
      const stream = grpcClient.getAllUsers();
      stream.on('data', (user) => {
        users.push(user);
      })
      stream.on('end', () => {
        resolve(users);
      });
    });
  };

  const patchUser = (user) => {
    return new Promise((resolve, reject) => {
      console.log('going to patch user', user);

      grpcClient.patchUser(user, (err, response) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  };

  const deleteUser = (userId) => {
    return new Promise((resolve, reject) => {
      grpcClient.deleteUser({ userId }, (err) => {
        if (err) reject(err);
        else resolve();
      })
    });
  };

  // get user 0 should succeed
  const user0 = await getUser(0);
  console.log(user0);
  
  try {
    // get user 10 should fail
    await getUser(10);
  } catch (err) {
    const { code, details } = err;
    console.log({ code, details });
  }

  const userCreated = await createUser({ firstname: 'Thomas', job: 1 });
  console.log({ userCreated });

  const user2 = await getUser(2);
  console.log(user2);

  const updatedUser0 = await patchUser({ userId: 0, job: 2 });
  console.log({ updatedUser0 });

  try {
    await patchUser(10);
  } catch (err) {
    const { code, details } = err;
    console.log({ code, details });
  }

  try {
    await deleteUser(10);
  } catch (err) {
    const { code, details } = err;
    console.log({ code, details });
  }
  
  // delete jfp
  await deleteUser(1);
  const users = await getAllUsers();
  console.log(users);
};

run();