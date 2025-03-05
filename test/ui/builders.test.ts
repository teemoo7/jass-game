import { describe, it, expect } from "vitest";
import {
  ButtonBuilder,
  DivBuilder, ImgBuilder,
  InputBuilder,
  LabelBuilder,
  OptionBuilder,
  SelectBuilder, SpanBuilder
} from "../../src/ui/builders.ts";

describe("Builders", () => {
  describe("ElementBuilder", () => {
    it("should build an element with id and class list", () => {
      // given
      const builder = new DivBuilder()
        .withId("div-id")
        .withClassList(["class1", "class2"])
        .withTextContent("Hello, World!");

      // when
      const div = builder.build();

      // then
      expect(div.tagName).toBe("DIV");
      expect(div.id).toBe("div-id");
      expect(div.classList.contains("class1")).toBe(true);
      expect(div.classList.contains("class2")).toBe(true);
      expect(div.textContent).toBe("Hello, World!");
    });
  });

  describe("DivBuilder", () => {
    it("should build a div element", () => {
      // given
      const builder = new DivBuilder()
        .withId("div-id")
        .withClassList(["class1", "class2"])
        .withTextContent("Hello, World!");

      // when
      const div = builder.build();

      // then
      expect(div.tagName).toBe("DIV");
      expect(div.id).toBe("div-id");
      expect(div.classList.contains("class1")).toBe(true);
      expect(div.classList.contains("class2")).toBe(true);
      expect(div.textContent).toBe("Hello, World!");
    });
  });

  describe("LabelBuilder", () => {
    it("should build a label element", () => {
      // given
      const builder = new LabelBuilder()
        .withId("label-id")
        .withClassList(["class1", "class2"])
        .withTextContent("Hello, World!");

      // when
      const label = builder.build();

      // then
      expect(label.tagName).toBe("LABEL");
      expect(label.id).toBe("label-id");
      expect(label.classList.contains("class1")).toBe(true);
      expect(label.classList.contains("class2")).toBe(true);
      expect(label.textContent).toBe("Hello, World!");
    });
  });

  describe("SelectBuilder", () => {
    it("should build a select element", () => {
      // given
      const builder = new SelectBuilder()
        .withId("select-id")
        .withClassList(["class1", "class2"]);

      // when
      const select = builder.build();

      // then
      expect(select.tagName).toBe("SELECT");
      expect(select.id).toBe("select-id");
      expect(select.classList.contains("class1")).toBe(true);
      expect(select.classList.contains("class2")).toBe(true);
    });
  });

  describe("OptionBuilder", () => {
    it("should build an option element", () => {
      // given
      const builder = new OptionBuilder()
        .withId("option-id")
        .withClassList(["class1", "class2"])
        .withTextContent("Hello, World!")
        .withValue("hello-world")
        .withSelected(true);

      // when
      const option = builder.build();

      // then
      expect(option.tagName).toBe("OPTION");
      expect(option.id).toBe("option-id");
      expect(option.classList.contains("class1")).toBe(true);
      expect(option.classList.contains("class2")).toBe(true);
      expect(option.textContent).toBe("Hello, World!");
      expect(option.value).toBe("hello-world");
      expect(option.selected).toBe(true);
    });
  });

  describe("InputBuilder", () => {
    it("should build an input element", () => {
      // given
      const builder = new InputBuilder()
        .withId("input-id")
        .withClassList(["class1", "class2"])
        .withValue("Hello, World!")
        .withType("text");

      // when
      const input = builder.build();

      // then
      expect(input.tagName).toBe("INPUT");
      expect(input.id).toBe("input-id");
      expect(input.classList.contains("class1")).toBe(true);
      expect(input.classList.contains("class2")).toBe(true);
      expect(input.value).toBe("Hello, World!");
      expect(input.type).toBe("text");
    });
  });

  describe("ButtonBuilder", () => {
    it("should build a button element", () => {
      // given
      const builder = new ButtonBuilder()
        .withId("button-id")
        .withClassList(["class1", "class2"])
        .withTextContent("Hello, World!");

      // when
      const button = builder.build();

      // then
      expect(button.tagName).toBe("BUTTON");
      expect(button.id).toBe("button-id");
      expect(button.classList.contains("class1")).toBe(true);
      expect(button.classList.contains("class2")).toBe(true);
      expect(button.textContent).toBe("Hello, World!");
    });
  });

  describe("ImgBuilder", () => {
    it("should build an img element", () => {
      // given
      const builder = new ImgBuilder()
        .withId("img-id")
        .withClassList(["class1", "class2"])
        .withSrc("https://example.com/image.jpg");

      // when
      const img = builder.build();

      // then
      expect(img.tagName).toBe("IMG");
      expect(img.id).toBe("img-id");
      expect(img.classList.contains("class1")).toBe(true);
      expect(img.classList.contains("class2")).toBe(true);
      expect(img.src).toBe("https://example.com/image.jpg");
    });
  });

  describe("SpanBuilder", () => {
    it("should build a span element", () => {
      // given
      const builder = new SpanBuilder()
        .withId("span-id")
        .withClassList(["class1", "class2"])
        .withTextContent("Hello, World!");

      // when
      const span = builder.build();

      // then
      expect(span.tagName).toBe("SPAN");
      expect(span.id).toBe("span-id");
      expect(span.classList.contains("class1")).toBe(true);
      expect(span.classList.contains("class2")).toBe(true);
      expect(span.textContent).toBe("Hello, World!");
    });
  });
});
