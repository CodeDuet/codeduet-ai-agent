import { describe, it, expect, beforeEach, vi } from "vitest";
import type { CreateCustomLanguageModelProviderParams } from "@/ipc/ipc_types";
import { registerLanguageModelHandlers } from "@/ipc/handlers/language_model_handlers";
import { db } from "@/db";
import { language_model_providers as languageModelProvidersSchema } from "@/db/schema";
import { eq } from "drizzle-orm";

// Mock the database
vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

// Mock electron-log
vi.mock("electron-log", () => ({
  default: {
    scope: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    })),
  },
}));

// Mock safe_handle
vi.mock("@/ipc/handlers/safe_handle", () => ({
  createLoggedHandler: vi.fn((logger) => (name: string, handler: Function) => {
    // Store handlers for testing
    (global as any).testHandlers = (global as any).testHandlers || {};
    (global as any).testHandlers[name] = handler;
  }),
}));

// Mock language model helpers
vi.mock("@/ipc/shared/language_model_helpers", () => ({
  CUSTOM_PROVIDER_PREFIX: "custom::",
  getLanguageModelProviders: vi.fn(),
  getLanguageModels: vi.fn(),
  getLanguageModelsByProviders: vi.fn(),
}));

describe("Language Model Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).testHandlers = {};
    
    // Reset db mocks
    const mockDb = db as any;
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          get: vi.fn().mockReturnValue(null), // No existing provider by default
        }),
      }),
    });
    
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });
    
    // Register handlers
    registerLanguageModelHandlers();
  });

  describe("create-custom-language-model-provider", () => {
    it("should create a CLI provider without apiBaseUrl", async () => {
      const params: CreateCustomLanguageModelProviderParams = {
        id: "test-cli",
        name: "Test CLI Provider",
        type: "cli",
        cliType: "claude-code",
        cliCommand: "claude code",
        apiBaseUrl: "", // Empty for CLI providers
        envVarName: undefined,
      };

      const handler = (global as any).testHandlers["create-custom-language-model-provider"];
      expect(handler).toBeDefined();

      const result = await handler({}, params);

      expect(result).toEqual({
        id: "test-cli",
        name: "Test CLI Provider",
        apiBaseUrl: "",
        envVarName: undefined,
        type: "custom",
      });

      // Verify database insert was called correctly
      expect(db.insert).toHaveBeenCalledWith(languageModelProvidersSchema);
      expect((db.insert as any)().values).toHaveBeenCalledWith({
        id: "custom::test-cli",
        name: "Test CLI Provider",
        api_base_url: null, // Should be null for CLI providers
        env_var_name: null,
      });
    });

    it("should create a custom provider with apiBaseUrl", async () => {
      const params: CreateCustomLanguageModelProviderParams = {
        id: "test-custom",
        name: "Test Custom Provider",
        type: "custom",
        apiBaseUrl: "https://api.example.com",
        envVarName: "TEST_API_KEY",
      };

      const handler = (global as any).testHandlers["create-custom-language-model-provider"];
      const result = await handler({}, params);

      expect(result).toEqual({
        id: "test-custom",
        name: "Test Custom Provider",
        apiBaseUrl: "https://api.example.com",
        envVarName: "TEST_API_KEY",
        type: "custom",
      });

      // Verify database insert was called correctly
      expect((db.insert as any)().values).toHaveBeenCalledWith({
        id: "custom::test-custom",
        name: "Test Custom Provider",
        api_base_url: "https://api.example.com",
        env_var_name: "TEST_API_KEY",
      });
    });

    it("should throw error for missing provider ID", async () => {
      const params: CreateCustomLanguageModelProviderParams = {
        id: "",
        name: "Test Provider",
        type: "custom",
        apiBaseUrl: "https://api.example.com",
      };

      const handler = (global as any).testHandlers["create-custom-language-model-provider"];
      
      await expect(handler({}, params)).rejects.toThrow("Provider ID is required");
    });

    it("should throw error for missing provider name", async () => {
      const params: CreateCustomLanguageModelProviderParams = {
        id: "test-provider",
        name: "",
        type: "custom",
        apiBaseUrl: "https://api.example.com",
      };

      const handler = (global as any).testHandlers["create-custom-language-model-provider"];
      
      await expect(handler({}, params)).rejects.toThrow("Provider name is required");
    });

    it("should throw error for custom provider without apiBaseUrl", async () => {
      const params: CreateCustomLanguageModelProviderParams = {
        id: "test-custom",
        name: "Test Custom Provider",
        type: "custom",
        apiBaseUrl: "",
      };

      const handler = (global as any).testHandlers["create-custom-language-model-provider"];
      
      await expect(handler({}, params)).rejects.toThrow("API base URL is required");
    });

    it("should not throw error for CLI provider without apiBaseUrl", async () => {
      const params: CreateCustomLanguageModelProviderParams = {
        id: "test-cli",
        name: "Test CLI Provider",
        type: "cli",
        cliType: "claude-code",
        cliCommand: "claude code",
        apiBaseUrl: undefined,
      };

      const handler = (global as any).testHandlers["create-custom-language-model-provider"];
      
      // Should not throw
      const result = await handler({}, params);
      expect(result).toBeDefined();
    });

    it("should throw error if provider already exists", async () => {
      // Mock existing provider
      const mockDb = db as any;
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            get: vi.fn().mockReturnValue({ id: "custom::existing-provider" }),
          }),
        }),
      });

      const params: CreateCustomLanguageModelProviderParams = {
        id: "existing-provider",
        name: "Existing Provider",
        type: "custom",
        apiBaseUrl: "https://api.example.com",
      };

      const handler = (global as any).testHandlers["create-custom-language-model-provider"];
      
      await expect(handler({}, params)).rejects.toThrow('A provider with ID "existing-provider" already exists');
    });
  });
});