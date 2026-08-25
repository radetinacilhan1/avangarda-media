const QUICK_ACTIONS = [
  ["Strikethrough", "Precrtano"],
  ["BulletList", "Lista"],
  ["NumberList", "Brojevi"],
  ["Link", "Link"],
  ["Image", "Slika"],
  ["Quote", "Citat"],
  ["Code", "Code"],
];

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(value) {
  return escapeHtml(value)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_match, alt, _url, caption) => {
      const label = caption || alt || "Slika u tekstu";
      return `<span class="avangarda-editor-preview__image">Slika: ${label}</span>`;
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="avangarda-editor-preview__link">$1</span>')
    .replace(/&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/g, "<u>$1</u>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
    .replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function renderPreview(source) {
  const lines = source.replace(/\u200b/g, "").split(/\r?\n/);
  const output = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^```/.test(line.trim())) {
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      output.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      output.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      output.push(`<blockquote>${renderInline(quote.join(" "))}</blockquote>`);
      continue;
    }

    const unordered = /^\s*[-*+]\s+/.test(line);
    const ordered = /^\s*\d+[.)]\s+/.test(line);
    if (unordered || ordered) {
      const listTag = ordered ? "ol" : "ul";
      const itemPattern = ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*+]\s+/;
      const items = [];
      while (index < lines.length && itemPattern.test(lines[index])) {
        items.push(`<li>${renderInline(lines[index].replace(itemPattern, ""))}</li>`);
        index += 1;
      }
      output.push(`<${listTag}>${items.join("")}</${listTag}>`);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(?:#{2,4}\s|>|```|\s*[-*+]\s+|\s*\d+[.)]\s+)/.test(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    output.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return output.join("") || '<p class="avangarda-editor-preview__empty">Formatirani pregled će se pojaviti ovde.</p>';
}

function findToolbar(button) {
  let current = button.parentElement;
  while (current && current !== document.body) {
    if (
      current.querySelector('button[name="Bold"]')
      && current.querySelector('button[name="Italic"]')
      && Array.from(current.querySelectorAll("button")).some((entry) => entry.textContent?.trim() === "More")
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

function findEditorWrapper(toolbar) {
  let current = toolbar.parentElement;
  while (current && current !== document.body) {
    if (current.querySelector(":scope > .CodeMirror") || current.querySelector(".CodeMirror")) return current;
    current = current.parentElement;
  }
  return null;
}

function triggerNativeAction(toolbar, actionName) {
  const moreButton = Array.from(toolbar.querySelectorAll("button"))
    .find((button) => button.textContent?.trim() === "More");
  if (!moreButton) return;

  moreButton.click();
  window.requestAnimationFrame(() => {
    const action = Array.from(document.body.querySelectorAll("button"))
      .find((button) => button.textContent?.trim() === actionName && button.offsetParent !== null);
    action?.click();
  });
}

function enhanceToolbar(toolbar) {
  if (toolbar.hasAttribute("data-avangarda-richtext-enhanced")) return;
  toolbar.setAttribute("data-avangarda-richtext-enhanced", "true");

  const quickActions = document.createElement("div");
  quickActions.setAttribute("data-avangarda-richtext-actions", "true");
  quickActions.setAttribute("aria-label", "Često korišćeno formatiranje");

  QUICK_ACTIONS.forEach(([actionName, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.title = actionName;
    button.addEventListener("click", () => triggerNativeAction(toolbar, actionName));
    quickActions.append(button);
  });
  toolbar.append(quickActions);

  const editorWrapper = findEditorWrapper(toolbar);
  const code = editorWrapper?.querySelector('.CodeMirror-code[contenteditable="true"]');
  if (!editorWrapper || !code || editorWrapper.querySelector("[data-avangarda-richtext-preview]")) return;

  const preview = document.createElement("div");
  preview.setAttribute("data-avangarda-richtext-preview", "true");
  preview.setAttribute("aria-live", "polite");
  preview.innerHTML = `<span class="avangarda-editor-preview__label">Živi pregled formatiranja</span><div class="avangarda-editor-preview__content"></div>`;
  editorWrapper.append(preview);

  const previewContent = preview.querySelector(".avangarda-editor-preview__content");
  let frameId = 0;
  const update = () => {
    window.cancelAnimationFrame(frameId);
    frameId = window.requestAnimationFrame(() => {
      previewContent.innerHTML = renderPreview(code.textContent || "");
    });
  };
  code.addEventListener("input", update);
  code.addEventListener("keyup", update);
  new MutationObserver(update).observe(code, { childList: true, characterData: true, subtree: true });
  update();
}

export function installRichTextEditorEnhancements() {
  if (typeof document === "undefined" || window.__avangardaRichTextEnhancementsInstalled) return;
  window.__avangardaRichTextEnhancementsInstalled = true;

  const scan = () => {
    document.querySelectorAll('button[name="Bold"]').forEach((button) => {
      const toolbar = findToolbar(button);
      if (toolbar) enhanceToolbar(toolbar);
    });
  };

  let frameId = 0;
  const observer = new MutationObserver(() => {
    window.cancelAnimationFrame(frameId);
    frameId = window.requestAnimationFrame(scan);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  scan();
}
