import { describe, it, expect } from "vitest";
import { encryptField, decryptField } from "../src/lib/crypto";

describe("AES-256-GCM Field-Level Encryption", () => {
  it("encrypts and decrypts sensitive health strings reliably", () => {
    const sensitiveData = "Fasting Insulin: 28.5 uIU/mL, elevated androgen markers";
    const encrypted = encryptField(sensitiveData);

    expect(encrypted).not.toEqual(sensitiveData);
    expect(encrypted.split(":").length).toBe(3); // iv:tag:cipher

    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe(sensitiveData);
  });

  it("produces distinct ciphertexts for identical inputs due to random IVs", () => {
    const input = "Clinical diagnosis: PCOS Phenotype A";
    const enc1 = encryptField(input);
    const enc2 = encryptField(input);

    expect(enc1).not.toBe(enc2);
    expect(decryptField(enc1)).toBe(input);
    expect(decryptField(enc2)).toBe(input);
  });

  it("handles empty or falsy strings gracefully without error", () => {
    expect(encryptField("")).toBe("");
    expect(decryptField("")).toBe("");
  });
});
