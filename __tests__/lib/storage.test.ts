import { describe, it, expect, beforeEach } from "vitest";
import { storage } from "@/lib/storage";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips a string value", () => {
    storage.set("test-key", "hello");
    expect(storage.get("test-key")).toBe("hello");
  });

  it("round-trips an object", () => {
    const obj = { a: 1, b: "two", c: [3, 4] };
    storage.set("test-obj", obj);
    expect(storage.get("test-obj")).toEqual(obj);
  });

  it("returns null for missing keys", () => {
    expect(storage.get("nonexistent")).toBeNull();
  });

  it("removes a key", () => {
    storage.set("to-remove", "value");
    storage.remove("to-remove");
    expect(storage.get("to-remove")).toBeNull();
  });

  it("handles malformed JSON gracefully", () => {
    localStorage.setItem("bad-json", "{not valid json");
    expect(storage.get("bad-json")).toBeNull();
  });

  it("overwrites existing values", () => {
    storage.set("key", "first");
    storage.set("key", "second");
    expect(storage.get("key")).toBe("second");
  });
});
