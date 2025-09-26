// Quick script to add a default model for existing CLI provider
const path = require('path');

// Set up the environment
process.env.NODE_ENV = 'development';

// We need to load the database setup
const dbPath = path.join(__dirname, 'dist', 'main', 'db', 'index.js');
const schemaPath = path.join(__dirname, 'dist', 'main', 'db', 'schema.js');

// Check if build exists
const fs = require('fs');
if (!fs.existsSync(dbPath)) {
  console.log('Build not found. Please run the app first to build the database files.');
  process.exit(1);
}

const { db } = require(dbPath);
const { language_model_providers, language_models } = require(schemaPath);
const { eq } = require('drizzle-orm');

async function addDefaultModelToExistingCliProvider() {
  try {
    // Find CLI providers without models
    const cliProviders = await db
      .select()
      .from(language_model_providers)
      .where(eq(language_model_providers.cli_type, 'claude-code'));
    
    console.log('Found CLI providers:', cliProviders);
    
    for (const provider of cliProviders) {
      // Check if this provider already has models
      const existingModels = await db
        .select()
        .from(language_models)
        .where(eq(language_models.customProviderId, provider.id));
      
      if (existingModels.length === 0) {
        console.log(`Adding default model for provider: ${provider.name}`);
        
        await db.insert(language_models).values({
          displayName: `${provider.name} Default`,
          apiName: `${provider.cli_type}-default`,
          customProviderId: provider.id,
          description: `Default model for ${provider.name} CLI provider`,
          max_output_tokens: null,
          context_window: null,
        });
        
        console.log(`✅ Added default model for ${provider.name}`);
      } else {
        console.log(`Provider ${provider.name} already has ${existingModels.length} model(s)`);
      }
    }
    
    console.log('✅ Finished adding default models for CLI providers');
    
  } catch (error) {
    console.error('❌ Error adding default model:', error);
  }
}

addDefaultModelToExistingCliProvider();