abstract class ElementBuilder {
  id: string | undefined;
  classList: string[] | undefined;
  textContent: string | undefined;

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withClassList(classList: string[]): this {
    this.classList = classList;
    return this;
  }

  withTextContent(textContent: string): this {
    this.textContent = textContent;
    return this;
  }

  buildElement(element: HTMLElement): HTMLElement {
    if (this.id) {
      element.id = this.id;
    }
    if (this.classList) {
      element.classList.add(...this.classList);
    }
    if (this.textContent) {
      element.textContent = this.textContent;
    }
    return element;
  }

  abstract build(): HTMLElement;
}

export class DivBuilder extends ElementBuilder {
  build(): HTMLDivElement {
    const div = document.createElement("div");
    super.buildElement(div);
    return div;
  }
}

export class LabelBuilder extends ElementBuilder {
  build(): HTMLLabelElement {
    const label = document.createElement("label");
    super.buildElement(label);
    return label;
  }
}

export class SelectBuilder extends ElementBuilder {
  build(): HTMLSelectElement {
    const select = document.createElement("select");
    super.buildElement(select);
    return select;
  }
}

export class OptionBuilder extends ElementBuilder {
  value: string | undefined;
  selected: boolean | undefined;

  withValue(value: string): this {
    this.value = value;
    return this;
  }

  withSelected(selected: boolean): this {
    this.selected = selected;
    return this;
  }

  build(): HTMLOptionElement {
    const option = document.createElement("option");
    super.buildElement(option);
    if (this.value) {
      option.value = this.value;
    }
    if (this.selected) {
      option.selected = this.selected;
    }
    return option;
  }
}

export class InputBuilder extends ElementBuilder {
  type: string | undefined;
  value: string | undefined;

  withType(type: string): this {
    this.type = type;
    return this;
  }

  withValue(value: string): this {
    this.value = value;
    return this;
  }

  build(): HTMLInputElement {
    const input = document.createElement("input");
    super.buildElement(input);
    if (this.type) {
      input.type = this.type;
    }
    if (this.value) {
      input.value = this.value;
    }
    return input;
  }
}

export class ButtonBuilder extends ElementBuilder {
  build(): HTMLButtonElement {
    const button = document.createElement("button");
    super.buildElement(button);
    return button;
  }
}

export class ImgBuilder extends ElementBuilder {
  src: string | undefined;

  withSrc(src: string): this {
    this.src = src;
    return this;
  }

  build(): HTMLImageElement {
    const img = document.createElement("img");
    super.buildElement(img);
    if (this.src) {
      img.src = this.src;
    }
    return img;
  }
}

export class SpanBuilder extends ElementBuilder {
  build(): HTMLSpanElement {
    const span = document.createElement("span");
    super.buildElement(span);
    return span;
  }
}
