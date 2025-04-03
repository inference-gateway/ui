import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  test("combines class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  test("handles conditional classes", () => {
    const condition = true;
    expect(cn("base", condition && "conditional")).toBe("base conditional");
  });

  test("handles falsy values", () => {
    expect(cn("base", false && "not-included", null, undefined, 0)).toBe(
      "base"
    );
  });

  test("handles array inputs", () => {
    expect(cn(["class1", "class2"])).toBe("class1 class2");
  });

  test("handles object inputs", () => {
    expect(cn({ class1: true, class2: false, class3: true })).toBe(
      "class1 class3"
    );
  });

  test("merges tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  test("handles mixed input types", () => {
    const condition = true;
    expect(
      cn(
        "base",
        ["array-class1", "array-class2"],
        { "object-class1": true, "object-class2": false },
        condition && "conditional"
      )
    ).toBe("base array-class1 array-class2 object-class1 conditional");
  });
});
