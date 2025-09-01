import { normalizeProfanityText, detectProfanity } from "@/lib/profanity-detector";

describe("Profanity Detector", () => {
  test("normalize leetspeak and accents", () => {
    expect(normalizeProfanityText("pút@ madre")).toContain("puta madre");
    expect(normalizeProfanityText("c0ñ0")).toContain("cono");
    expect(normalizeProfanityText("mier#da total")).toContain("mierda total");
  });

  test("detects blacklist words", async () => {
    const result = await detectProfanity("fuck this");
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches[0].severity).toBe(3);
  });

  test("respects whitelist words", async () => {
    const result = await detectProfanity("Dickinson");
    expect(result.matches.length).toBe(0);
  });
});
