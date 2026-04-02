import { describe, it, expect } from "vitest";
import { buildRoadmap } from "@/lib/roadmap-generator";
import type { IntakeAnswers } from "@/lib/types";

// Helper to get step names from a result
const stepNames = (a: IntakeAnswers) => buildRoadmap(a).steps.map((s) => s.name);
const hasStep = (a: IntakeAnswers, name: string) =>
  stepNames(a).some((n) => n.toLowerCase().includes(name.toLowerCase()));

// Base answers for a simple restaurant
const restaurant: IntakeAnswers = {
  biz: "restaurant",
  loc: "signed",
  hood: "Mission",
  sqft: "small",
  alc: "no",
  music: "no",
  emp: "solo",
  entity: "none",
  seat: "n",
  chain: "1",
  when: "asap",
  email: "test@test.com",
};

describe("buildRoadmap", () => {
  describe("output shape", () => {
    it("returns steps, warns, and sum", () => {
      const result = buildRoadmap(restaurant);
      expect(result).toHaveProperty("steps");
      expect(result).toHaveProperty("warns");
      expect(result).toHaveProperty("sum");
      expect(Array.isArray(result.steps)).toBe(true);
      expect(Array.isArray(result.warns)).toBe(true);
    });

    it("sum has required fields", () => {
      const { sum } = buildRoadmap(restaurant);
      expect(sum).toHaveProperty("total");
      expect(sum).toHaveProperty("cost");
      expect(sum).toHaveProperty("time");
      expect(sum).toHaveProperty("bizLabel");
      expect(sum).toHaveProperty("autoFull");
      expect(typeof sum.total).toBe("number");
      expect(typeof sum.cost).toBe("string");
      expect(typeof sum.time).toBe("string");
    });

    it("steps are numbered sequentially starting at 1", () => {
      const { steps } = buildRoadmap(restaurant);
      steps.forEach((s, i) => {
        expect(s.order).toBe(i + 1);
      });
    });

    it("every step has required fields", () => {
      const { steps } = buildRoadmap(restaurant);
      steps.forEach((s) => {
        expect(s).toHaveProperty("name");
        expect(s).toHaveProperty("agency");
        expect(s).toHaveProperty("why");
        expect(s).toHaveProperty("cost");
        expect(s).toHaveProperty("time");
        expect(s).toHaveProperty("priority");
        expect(s).toHaveProperty("type");
        expect(["form", "walk", "check"]).toContain(s.type);
        expect(["urgent", "high", "med", "low", "info"]).toContain(s.priority);
      });
    });
  });

  describe("restaurant", () => {
    it("includes core steps", () => {
      expect(hasStep(restaurant, "entity")).toBe(true);
      expect(hasStep(restaurant, "EIN")).toBe(true);
      expect(hasStep(restaurant, "zoning")).toBe(true);
      expect(hasStep(restaurant, "Treasurer")).toBe(true);
      expect(hasStep(restaurant, "Seller")).toBe(true);
      expect(hasStep(restaurant, "Building permit")).toBe(true);
      expect(hasStep(restaurant, "Fire")).toBe(true);
      expect(hasStep(restaurant, "Health Permit")).toBe(true);
      expect(hasStep(restaurant, "Food Safety")).toBe(true);
      expect(hasStep(restaurant, "ADA")).toBe(true);
      expect(hasStep(restaurant, "Waste")).toBe(true);
      expect(hasStep(restaurant, "Signage")).toBe(true);
      expect(hasStep(restaurant, "insurance")).toBe(true);
      expect(hasStep(restaurant, "Tax")).toBe(true);
    });

    it("warns about signed lease + zoning", () => {
      const result = buildRoadmap(restaurant);
      expect(result.warns.some((w) => w.includes("zoning"))).toBe(true);
    });

    it("marks zoning as urgent when lease is signed", () => {
      const { steps } = buildRoadmap(restaurant);
      const zoning = steps.find((s) => s.name.includes("zoning"));
      expect(zoning?.priority).toBe("urgent");
    });

    it("labels sum correctly", () => {
      const { sum } = buildRoadmap(restaurant);
      expect(sum.bizLabel).toBe("Restaurant / Café");
    });
  });

  describe("bar", () => {
    const bar: IntakeAnswers = {
      biz: "bar",
      loc: "looking",
      hood: "SoMa",
      sqft: "small",
      alc: "full",
      music: "stream",
      emp: "1-9",
      entity: "llc",
      seat: "n",
      chain: "1",
      when: "3mo",
      email: "bar@test.com",
    };

    it("includes liquor license", () => {
      expect(hasStep(bar, "Liquor License")).toBe(true);
    });

    it("includes CUA for bar", () => {
      expect(hasStep(bar, "Conditional Use Authorization (Bar)")).toBe(true);
    });

    it("includes music licensing for streaming", () => {
      expect(hasStep(bar, "Music licensing")).toBe(true);
    });

    it("includes employer registration", () => {
      expect(hasStep(bar, "Employer")).toBe(true);
    });

    it("skips entity step when already LLC", () => {
      expect(hasStep(bar, "Form your business entity")).toBe(false);
    });

    it("uses full bar license type in name", () => {
      const { steps } = buildRoadmap(bar);
      const liquor = steps.find((s) => s.name.includes("Liquor"));
      expect(liquor?.name).toContain("Type 47/48");
    });
  });

  describe("food truck", () => {
    const truck: IntakeAnswers = {
      biz: "food_truck",
      loc: "no",
      emp: "solo",
      entity: "none",
      music: "no",
      when: "asap",
      email: "truck@test.com",
    };

    it("includes mobile health permit", () => {
      expect(hasStep(truck, "Mobile Food Facility")).toBe(true);
    });

    it("includes route approval", () => {
      expect(hasStep(truck, "Location / route")).toBe(true);
    });

    it("does NOT include building permit", () => {
      expect(hasStep(truck, "Building permit")).toBe(false);
    });

    it("does NOT include ADA", () => {
      expect(hasStep(truck, "ADA")).toBe(false);
    });

    it("does NOT include zoning (no location)", () => {
      expect(hasStep(truck, "zoning")).toBe(false);
    });

    it("includes seller's permit", () => {
      expect(hasStep(truck, "Seller")).toBe(true);
    });
  });

  describe("home-based", () => {
    const home: IntakeAnswers = {
      biz: "home",
      loc: "signed",
      hood: "Sunset",
      emp: "solo",
      entity: "sole",
      when: "asap",
      email: "home@test.com",
    };

    it("does NOT include zoning (home is not physical)", () => {
      expect(hasStep(home, "zoning")).toBe(false);
    });

    it("does NOT include ADA", () => {
      expect(hasStep(home, "ADA")).toBe(false);
    });

    it("does NOT include waste setup", () => {
      expect(hasStep(home, "Waste")).toBe(false);
    });

    it("does NOT include signage", () => {
      expect(hasStep(home, "Signage")).toBe(false);
    });

    it("includes Cottage Food when food=cook", () => {
      const homeFood = { ...home, food: "cook" };
      expect(hasStep(homeFood, "Cottage Food")).toBe(true);
    });

    it("includes entity step for sole proprietor (needs to form entity)", () => {
      expect(hasStep(home, "Form your business entity")).toBe(true);
    });
  });

  describe("retail", () => {
    const retail: IntakeAnswers = {
      biz: "retail",
      loc: "looking",
      hood: "Hayes Valley",
      sqft: "small",
      food: "no",
      alc: "no",
      music: "radio",
      emp: "1-9",
      entity: "none",
      chain: "1",
      when: "6mo",
      email: "retail@test.com",
    };

    it("includes seller's permit", () => {
      expect(hasStep(retail, "Seller")).toBe(true);
    });

    it("includes signage permit", () => {
      expect(hasStep(retail, "Signage")).toBe(true);
    });

    it("includes ADA", () => {
      expect(hasStep(retail, "ADA")).toBe(true);
    });

    it("triggers music exemption for radio + small", () => {
      expect(hasStep(retail, "likely exempt")).toBe(true);
    });
  });

  describe("salon", () => {
    const salon: IntakeAnswers = {
      biz: "salon",
      loc: "signed",
      hood: "Castro",
      sqft: "small",
      food: "no",
      alc: "no",
      music: "stream",
      emp: "1-9",
      entity: "llc",
      chain: "1",
      when: "3mo",
      email: "salon@test.com",
    };

    it("includes state licenses", () => {
      expect(hasStep(salon, "State licenses")).toBe(true);
    });

    it("includes signage", () => {
      expect(hasStep(salon, "Signage")).toBe(true);
    });
  });

  describe("office", () => {
    const office: IntakeAnswers = {
      biz: "office",
      loc: "signed",
      hood: "Financial District",
      emp: "1-9",
      entity: "corp",
      when: "asap",
      email: "office@test.com",
    };

    it("does NOT include waste setup (not physical)", () => {
      expect(hasStep(office, "Waste")).toBe(false);
    });

    it("does NOT include ADA (not physical)", () => {
      expect(hasStep(office, "ADA")).toBe(false);
    });

    it("skips entity step when corporation", () => {
      expect(hasStep(office, "Form your business entity")).toBe(false);
    });

    it("includes employer registration", () => {
      expect(hasStep(office, "Employer")).toBe(true);
    });
  });

  describe("popup", () => {
    const popup: IntakeAnswers = {
      biz: "popup",
      loc: "looking",
      hood: "Mission",
      sqft: "small",
      food: "cook",
      alc: "no",
      music: "no",
      emp: "solo",
      entity: "none",
      when: "asap",
      email: "popup@test.com",
    };

    it("includes seller's permit", () => {
      expect(hasStep(popup, "Seller")).toBe(true);
    });

    it("includes health permit for food", () => {
      expect(hasStep(popup, "Health Permit")).toBe(true);
    });

    it("includes building permit for food (non truck)", () => {
      expect(hasStep(popup, "Building permit")).toBe(true);
    });
  });

  describe("conditional logic", () => {
    it("formula retail triggers for chain 11+", () => {
      const chain = { ...restaurant, chain: "11+" };
      expect(hasStep(chain, "Formula Retail")).toBe(true);
      const result = buildRoadmap(chain);
      expect(result.warns.some((w) => w.includes("Formula retail"))).toBe(true);
    });

    it("beer & wine license uses Type 41", () => {
      const bw = { ...restaurant, alc: "bw" };
      const { steps } = buildRoadmap(bw);
      const liquor = steps.find((s) => s.name.includes("Liquor"));
      expect(liquor?.name).toContain("Type 41");
    });

    it("off-sale license uses Type 20/21", () => {
      const off = { ...restaurant, alc: "off" };
      const { steps } = buildRoadmap(off);
      const liquor = steps.find((s) => s.name.includes("Liquor"));
      expect(liquor?.name).toContain("Type 20/21");
    });

    it("live music triggers entertainment permit", () => {
      const liveMusic = { ...restaurant, music: "live" };
      expect(hasStep(liveMusic, "Place of Entertainment")).toBe(true);
    });

    it("occasional live triggers limited live permit", () => {
      const occ = { ...restaurant, music: "liveocc" };
      expect(hasStep(occ, "Limited Live Performance")).toBe(true);
    });

    it("20+ employees includes HCSO in checks", () => {
      const big = { ...restaurant, emp: "20+" };
      const { steps } = buildRoadmap(big);
      const employer = steps.find((s) => s.name.includes("Employer"));
      const hasHCSO = employer?.checks?.some((c) => c.text.includes("HCSO"));
      expect(hasHCSO).toBe(true);
    });

    it("outdoor seating triggers parklet permit", () => {
      const outdoor = { ...restaurant, seat: "y" };
      expect(hasStep(outdoor, "Shared Spaces")).toBe(true);
    });

    it("no outdoor seating skips parklet", () => {
      expect(hasStep(restaurant, "Shared Spaces")).toBe(false);
    });

    it("zoning is not urgent when just looking", () => {
      const looking = { ...restaurant, loc: "looking" };
      const { steps } = buildRoadmap(looking);
      const zoning = steps.find((s) => s.name.includes("zoning"));
      expect(zoning?.priority).toBe("high");
    });

    it("bar without chain 11+ includes CUA", () => {
      const bar: IntakeAnswers = {
        biz: "bar", loc: "looking", hood: "SoMa", sqft: "small",
        alc: "full", music: "no", emp: "solo", entity: "none",
        seat: "n", when: "asap", email: "t@t.com",
      };
      expect(hasStep(bar, "Conditional Use Authorization (Bar)")).toBe(true);
    });

    it("bar with chain 11+ skips bar CUA (formula retail CUA covers it)", () => {
      const bar: IntakeAnswers = {
        biz: "bar", loc: "looking", hood: "SoMa", sqft: "small",
        alc: "full", music: "no", emp: "solo", entity: "none",
        seat: "n", chain: "11+", when: "asap", email: "t@t.com",
      };
      expect(hasStep(bar, "Conditional Use Authorization (Bar)")).toBe(false);
    });
  });

  describe("step types", () => {
    it("entity step is form type", () => {
      const { steps } = buildRoadmap(restaurant);
      const entity = steps.find((s) => s.name.includes("entity"));
      expect(entity?.type).toBe("form");
      expect(entity?.fields?.length).toBeGreaterThan(0);
    });

    it("EIN step is walk type", () => {
      const { steps } = buildRoadmap(restaurant);
      const ein = steps.find((s) => s.name.includes("EIN"));
      expect(ein?.type).toBe("walk");
      expect(ein?.walk?.length).toBeGreaterThan(0);
    });

    it("zoning step is check type with done_options", () => {
      const { steps } = buildRoadmap(restaurant);
      const zoning = steps.find((s) => s.name.includes("zoning"));
      expect(zoning?.type).toBe("check");
      expect(zoning?.done_options?.length).toBeGreaterThan(0);
    });

    it("EIN step has done_field", () => {
      const { steps } = buildRoadmap(restaurant);
      const ein = steps.find((s) => s.name.includes("EIN"));
      expect(ein?.done_field).toBeDefined();
      expect(ein?.done_field?.label).toContain("EIN");
    });

    it("TTX step has done_field for BAN", () => {
      const { steps } = buildRoadmap(restaurant);
      const ttx = steps.find((s) => s.name.includes("Treasurer"));
      expect(ttx?.done_field).toBeDefined();
      expect(ttx?.done_field?.label).toContain("BAN");
    });

    it("TTX step has tip", () => {
      const { steps } = buildRoadmap(restaurant);
      const ttx = steps.find((s) => s.name.includes("Treasurer"));
      expect(ttx?.tip).toBeDefined();
    });
  });
});
