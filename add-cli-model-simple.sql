-- Check existing CLI providers
SELECT * FROM language_model_providers WHERE cli_type IS NOT NULL;

-- Check existing models for CLI providers  
SELECT lm.* FROM language_models lm 
JOIN language_model_providers lmp ON lm.customProviderId = lmp.id 
WHERE lmp.cli_type IS NOT NULL;

-- Insert a default model for CLI providers that don't have any models
INSERT INTO language_models (displayName, apiName, customProviderId, description, max_output_tokens, context_window, created_at, updated_at)
SELECT 
    printf('%s Default', lmp.name) as displayName,
    printf('%s-default', lmp.cli_type) as apiName, 
    lmp.id as customProviderId,
    printf('Default model for %s CLI provider', lmp.name) as description,
    NULL as max_output_tokens,
    NULL as context_window,
    unixepoch() as created_at,
    unixepoch() as updated_at
FROM language_model_providers lmp 
WHERE lmp.cli_type IS NOT NULL 
AND NOT EXISTS (
    SELECT 1 FROM language_models lm WHERE lm.customProviderId = lmp.id
);