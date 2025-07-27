const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const User = require('../models/User');


const mongoose = require('mongoose');
mongoose.set('bufferTimeoutMS', 30000); 

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, 
  socketTimeoutMS: 45000, 
});


async function generateFakeUsers(count = 10) {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const username = faker.internet.username({ firstName, lastName }).toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const password = await bcrypt.hash('password123', 10);
    
    users.push({
      fullName,
      username,
      email,
      password,
    });
  }
  
  return users;
}

async function seedDatabase() {
  try {
    const fakeUsers = await generateFakeUsers(1000); 
    await User.insertMany(fakeUsers);
    
    console.log(`Successfully seeded ${fakeUsers.length} users`);
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();