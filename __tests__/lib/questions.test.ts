import { describe, it, expect } from "vitest";
import { BIZ_TYPES, NEIGHBORHOODS, QUESTIONS } from "@/lib/questions";
import type { IntakeAnswers } from "@/lib/types";

describe("BIZ_TYPES", () => {
  it("has 8 business types", () => {
    expect(BIZ_TYPES).toHaveLength(8);
  });

  it("each type has id, label, icon, sub", () => {
    BIZ_TYPES.forEach((bt) => {
      expect(bt.id).toBeTruthy();
      expect(bt.label).toBeTruthy();
      expect(bt.icon).toBeTruthy();
      expect(bt.sub).toBeTruthy();
    });
  });

  it("has no duplicate IDs", () => {
    const ids = BIZ_TYPES.map((bt) => bt.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes expected types", () => {
    const ids = BIZ_TYPES.map((bt) => bt.id);
    expect(ids).toContain("restaurant");
    expect(ids).toContain("retail");
    expect(ids).toContain("food_truck");
    expect(ids).toContain("bar");
    expect(ids).toContain("salon");
    expect(ids).toContain("office");
    expect(ids).toContain("home");
    expect(ids).toContain("popup");
  });
});

describe("NEIGHBORHOODS", () => {
  it("has 24 neighborhoods", () => {
    expect(NEIGHBORHOODS).toHaveLength(24);
  });

  it("includes well-known neighborhoods", () => {
    expect(NEIGHBORHOODS).toContain("Mission");
    expect(NEIGHBORHOODS).toContain("Castro");
    expect(NEIGHBORHOODS).toContain("SoMa");
    expect(NEIGHBORHOODS).toContain("Chinatown");
  });

  it("includes 'Other' as last option", () => {
    expect(NEIGHBORHOODS[NEIGHBORHOODS.length - 1]).toBe("Other");
  });
});

describe("QUESTIONS", () => {
  it("has 13 questions", () => {
    expect(QUESTIONS).toHaveLength(13);
  });

  it("each question has id, q, and type", () => {
    QUESTIONS.forEach((q) => {
      expect(q.id).toBeTruthy();
      expect(q.q).toBeTruthy();
      expect(["cards", "opts", "select", "email"]).toContain(q.type);
    });
  });

  it("has no duplicate question IDs", () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("first question is business type (cards)", () => {
    expect(QUESTIONS[0].id).toBe("biz");
    expect(QUESTIONS[0].type).toBe("cards");
  });

  it("last question is email", () => {
    expect(QUESTIONS[QUESTIONS.length - 1].id).toBe("email");
    expect(QUESTIONS[QUESTIONS.length - 1].type).toBe("email");
  });

  it("opts questions have options arrays", () => {
    QUESTIONS.filter((q) => q.type === "opts").forEach((q) => {
      expect(q.opts).toBeDefined();
      expect(q.opts!.length).toBeGreaterThan(0);
      q.opts!.forEach((o) => {
        expect(o.id).toBeTruthy();
        expect(o.l).toBeTruthy();
      });
    });
  });

  describe("showIf conditionals", () => {
    it("hood shows when loc is not 'no'", () => {
      const hood = QUESTIONS.find((q) => q.id === "hood")!;
      expect(hood.showIf!({ loc: "signed" })).toBe(true);
      expect(hood.showIf!({ loc: "looking" })).toBe(true);
      expect(hood.showIf!({ loc: "no" })).toBe(false);
    });

    it("sqft hides for home, office, food_truck", () => {
      const sqft = QUESTIONS.find((q) => q.id === "sqft")!;
      expect(sqft.showIf!({ loc: "signed", biz: "home" })).toBe(false);
      expect(sqft.showIf!({ loc: "signed", biz: "office" })).toBe(false);
      expect(sqft.showIf!({ loc: "signed", biz: "food_truck" })).toBe(false);
      expect(sqft.showIf!({ loc: "signed", biz: "restaurant" })).toBe(true);
    });

    it("food hides for restaurant, food_truck, home", () => {
      const food = QUESTIONS.find((q) => q.id === "food")!;
      expect(food.showIf!({ biz: "restaurant" })).toBe(false);
      expect(food.showIf!({ biz: "food_truck" })).toBe(false);
      expect(food.showIf!({ biz: "home" })).toBe(false);
      expect(food.showIf!({ biz: "bar" })).toBe(true);
      expect(food.showIf!({ biz: "retail" })).toBe(true);
    });

    it("alc hides for home, food_truck, office", () => {
      const alc = QUESTIONS.find((q) => q.id === "alc")!;
      expect(alc.showIf!({ biz: "home" })).toBe(false);
      expect(alc.showIf!({ biz: "food_truck" })).toBe(false);
      expect(alc.showIf!({ biz: "office" })).toBe(false);
      expect(alc.showIf!({ biz: "restaurant" })).toBe(true);
    });

    it("music hides for home and office", () => {
      const music = QUESTIONS.find((q) => q.id === "music")!;
      expect(music.showIf!({ biz: "home" })).toBe(false);
      expect(music.showIf!({ biz: "office" })).toBe(false);
      expect(music.showIf!({ biz: "restaurant" })).toBe(true);
    });

    it("seat shows only for restaurant and bar", () => {
      const seat = QUESTIONS.find((q) => q.id === "seat")!;
      expect(seat.showIf!({ biz: "restaurant" })).toBe(true);
      expect(seat.showIf!({ biz: "bar" })).toBe(true);
      expect(seat.showIf!({ biz: "retail" })).toBe(false);
      expect(seat.showIf!({ biz: "home" })).toBe(false);
    });

    it("chain shows for restaurant, retail, salon", () => {
      const chain = QUESTIONS.find((q) => q.id === "chain")!;
      expect(chain.showIf!({ biz: "restaurant" })).toBe(true);
      expect(chain.showIf!({ biz: "retail" })).toBe(true);
      expect(chain.showIf!({ biz: "salon" })).toBe(true);
      expect(chain.showIf!({ biz: "bar" })).toBe(false);
      expect(chain.showIf!({ biz: "home" })).toBe(false);
    });

    it("questions without showIf always show", () => {
      const alwaysShow = QUESTIONS.filter((q) => !q.showIf);
      const ids = alwaysShow.map((q) => q.id);
      expect(ids).toContain("biz");
      expect(ids).toContain("emp");
      expect(ids).toContain("entity");
      expect(ids).toContain("when");
      expect(ids).toContain("email");
    });
  });
});
