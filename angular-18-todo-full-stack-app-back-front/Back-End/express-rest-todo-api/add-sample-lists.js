const { MongoClient, ObjectId } = require('mongodb');

async function addSampleLists() {
  // Use the same connection string as the backend
  const uri = process.env.MONGODB_URI || 'mongodb://admin:todopassword123@localhost:27017/tododb?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');

    const db = client.db('todoapp');
    const usersCollection = db.collection('users');
    const listsCollection = db.collection('lists');

    // Get the first user from the database
    let user = await usersCollection.findOne({});

    if (!user) {
      console.log('👤 No users found. Creating a test user...');

      // Create a test user
      const bcrypt = require('bcrypt');
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('password123', saltRounds);

      const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        isActive: true,
        isEmailVerified: false,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const userResult = await usersCollection.insertOne(testUser);
      user = { ...testUser, _id: userResult.insertedId };
      console.log('✅ Test user created:', user.email);
    }

    console.log('👤 Found user:', user.email);

    // Sample lists to add
    const sampleLists = [
      {
        name: 'Work Projects',
        description: 'Tasks related to work and professional development',
        color: '#2196F3',
        isPublic: false,
        userId: user._id,
        todoCount: 0,
        completedTodoCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Personal Tasks',
        description: 'Daily personal activities and errands',
        color: '#4CAF50',
        isPublic: false,
        userId: user._id,
        todoCount: 0,
        completedTodoCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Shopping List',
        description: 'Grocery and shopping items',
        color: '#FF9800',
        isPublic: false,
        userId: user._id,
        todoCount: 0,
        completedTodoCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Learning Goals',
        description: 'Educational objectives and study plans',
        color: '#9C27B0',
        isPublic: false,
        userId: user._id,
        todoCount: 0,
        completedTodoCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Health & Fitness',
        description: 'Exercise routines and health-related tasks',
        color: '#F44336',
        isPublic: false,
        userId: user._id,
        todoCount: 0,
        completedTodoCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Check if lists already exist to avoid duplicates
    const existingListsCount = await listsCollection.countDocuments({ userId: user._id });

    if (existingListsCount > 0) {
      console.log(`📋 User already has ${existingListsCount} lists. Clearing existing lists first...`);
      await listsCollection.deleteMany({ userId: user._id });
    }

    // Insert sample lists
    const result = await listsCollection.insertMany(sampleLists);
    console.log(`✅ Successfully added ${result.insertedCount} sample lists!`);

    // Display the added lists
    console.log('\n📋 Added Lists:');
    sampleLists.forEach((list, index) => {
      console.log(`  ${index + 1}. ${list.name} (${list.color})`);
      console.log(`     Description: ${list.description}`);
    });

    console.log('\n🎉 Sample data setup complete!');
    console.log('🌐 Now login to your Angular app at http://localhost:4200 to see the lists!');

  } catch (error) {
    console.error('❌ Error adding sample lists:', error);
  } finally {
    await client.close();
    console.log('🔗 Disconnected from MongoDB');
  }
}

// Run the script
addSampleLists().catch(console.error);