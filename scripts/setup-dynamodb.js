const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb')
require('dotenv').config({ path: '.env.local' })

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

async function createTables() {
  try {
    // Check existing tables
    const listCommand = new ListTablesCommand({})
    const existingTables = await client.send(listCommand)
    console.log('📋 Existing tables:', existingTables.TableNames)

    // Create daily plans table
    if (!existingTables.TableNames?.includes('aura-daily-plans')) {
      console.log('🏗️  Creating aura-daily-plans table...')
      const plansTable = new CreateTableCommand({
        TableName: 'aura-daily-plans',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'date', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'date', AttributeType: 'S' }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      })
      await client.send(plansTable)
      console.log('✅ Created aura-daily-plans table')
    } else {
      console.log('✅ aura-daily-plans table already exists')
    }

    // Create user sessions table
    if (!existingTables.TableNames?.includes('aura-user-sessions')) {
      console.log('🏗️  Creating aura-user-sessions table...')
      const sessionsTable = new CreateTableCommand({
        TableName: 'aura-user-sessions',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'userId', AttributeType: 'S' }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      })
      await client.send(sessionsTable)
      console.log('✅ Created aura-user-sessions table')
    } else {
      console.log('✅ aura-user-sessions table already exists')
    }

    console.log('🎉 DynamoDB setup complete!')
    
  } catch (error) {
    console.error('❌ Error setting up DynamoDB:', error)
    process.exit(1)
  }
}

createTables()