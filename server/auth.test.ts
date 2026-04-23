import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword, verifyAdminCredentials, verifyRecoveryCode, generateSessionToken } from "./auth";

describe("auth - hashPassword", () => {
  it("should hash a password using SHA-256", () => {
    const password = "testpassword123";
    const hash = hashPassword(password);
    
    // SHA-256 produces a 64-character hex string
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should produce the same hash for the same password", () => {
    const password = "TestPass@123";
    const hash1 = hashPassword(password);
    const hash2 = hashPassword(password);
    
    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different passwords", () => {
    const hash1 = hashPassword("password1");
    const hash2 = hashPassword("password2");
    
    expect(hash1).not.toBe(hash2);
  });
});

describe("auth - verifyPassword", () => {
  it("should return true for correct password and hash", () => {
    const password = "MySecretPassword";
    const hash = hashPassword(password);
    
    expect(verifyPassword(password, hash)).toBe(true);
  });

  it("should return false for incorrect password", () => {
    const password = "MySecretPassword";
    const hash = hashPassword(password);
    
    expect(verifyPassword("WrongPassword", hash)).toBe(false);
  });

  it("should return false for empty password when hash is not empty", () => {
    const hash = hashPassword("somepassword");
    
    expect(verifyPassword("", hash)).toBe(false);
  });
});

describe("auth - verifyAdminCredentials", () => {
  it("should return true for correct admin password", () => {
    expect(verifyAdminCredentials("#AllOfThem-3301")).toBe(true);
  });

  it("should return false for incorrect admin password", () => {
    expect(verifyAdminCredentials("wrongpassword")).toBe(false);
  });

  it("should return false for empty password", () => {
    expect(verifyAdminCredentials("")).toBe(false);
  });

  it("should return false for password with extra spaces", () => {
    expect(verifyAdminCredentials("#AllOfThem-3301 ")).toBe(false);
  });
});

describe("auth - verifyRecoveryCode", () => {
  it("should return true for correct recovery code", () => {
    expect(verifyRecoveryCode("Merleoskyn")).toBe(true);
  });

  it("should return false for incorrect recovery code", () => {
    expect(verifyRecoveryCode("wrongcode")).toBe(false);
  });

  it("should return false for empty recovery code", () => {
    expect(verifyRecoveryCode("")).toBe(false);
  });

  it("should be case-sensitive", () => {
    expect(verifyRecoveryCode("merleoskyn")).toBe(false);
    expect(verifyRecoveryCode("MERLEOSKYN")).toBe(false);
  });
});

describe("auth - generateSessionToken", () => {
  it("should generate a 64-character hex string", () => {
    const token = generateSessionToken();
    
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should generate unique tokens on each call", () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();
    const token3 = generateSessionToken();
    
    expect(token1).not.toBe(token2);
    expect(token2).not.toBe(token3);
    expect(token1).not.toBe(token3);
  });

  it("should generate cryptographically random tokens", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(generateSessionToken());
    }
    // All 100 tokens should be unique
    expect(tokens.size).toBe(100);
  });
});
