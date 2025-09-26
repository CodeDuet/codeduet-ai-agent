// Direct SQLite script to add missing model for CLI provider
const Database = require('better-sqlite3');
const path = require('path');

// Path to the SQLite database file
const dbPath = path.join(__dirname, 'userData', 'sqlite.db');

try {
  const db = new Database(dbPath);
  
  console.log('🔍 Checking CLI providers...');
  
  // Find CLI providers
  const cliProviders = db.prepare(`
    SELECT * FROM language_model_providers 
    WHERE cli_type IS NOT NULL
  `).all();
  
  console.log('Found CLI providers:', cliProviders);
  
  if (cliProviders.length > 0) {
    for (const provider of cliProviders) {
      // Check if this provider has any models
      const existingModels = db.prepare(`
        SELECT * FROM language_models 
        WHERE customProviderId = ?
      `).all(provider.id);
      
      if (existingModels.length === 0) {
        console.log(`➕ Adding default model for: ${provider.name}`);
        
        // Insert default model
        db.prepare(`
          INSERT INTO language_models 
          (displayName, apiName, customProviderId, description, max_output_tokens, context_window, created_at, updated_at)
          VALUES (?, ?, ?, ?, NULL, NULL, ?, ?)
        `).run(
          `${provider.name} Default`,
          `${provider.cli_type}-default`,
          provider.id,
          `Default model for ${provider.name} CLI provider`,
          Math.floor(Date.now() / 1000), // created_at
          Math.floor(Date.now() / 1000)  // updated_at
        );
        
        console.log(`✅ Added default model for ${provider.name}`);
      } else {
        console.log(`ℹ️  Provider ${provider.name} already has ${existingModels.length} model(s)`);
      }
    }
  } else {
    console.log('No CLI providers found in database');
  }
  
  db.close();
  console.log('✅ Script completed successfully');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\nTry restarting the app first, then run this script again.');
}