const NATIVE_ACTIONS = [
  { action: "Strikethrough", label: "Precrtano", title: "Precrtaj izabrani tekst" },
  { action: "BulletList", label: "Lista", title: "Nenumerisana lista" },
  { action: "NumberList", label: "Brojevi", title: "Numerisana lista" },
  { action: "Link", label: "Link", title: "Dodaj bezbedan link" },
  { action: "Image", label: "Slika", title: "Izaberi sliku iz Media Library" },
  { action: "Quote", label: "Citat", title: "Citirani blok" },
];

const SAFE_VIDEO_FILE_PATTERN = /\.(?:mp4|webm|ogg)(?:[?#].*)?$/i;

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeVideoUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed || /["'<>\s]/.test(trimmed)) return null;

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;

    const host = parsed.hostname.toLowerCase();
    let youtubeId = "";
    if (host === "youtu.be") youtubeId = parsed.pathname.split("/").filter(Boolean)[0] || "";
    if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "www.youtube-nocookie.com") {
      youtubeId = parsed.searchParams.get("v") || parsed.pathname.match(/^\/(?:embed|shorts)\/([A-Za-z0-9_-]+)/)?.[1] || "";
    }
    if (/^[A-Za-z0-9_-]{6,}$/.test(youtubeId)) {
      return { kind: "iframe", url: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=0&controls=1&rel=0` };
    }

    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
      const vimeoId = parsed.pathname.split("/").filter(Boolean).find((part) => /^\d+$/.test(part));
      if (vimeoId) return { kind: "iframe", url: `https://player.vimeo.com/video/${vimeoId}?autoplay=0` };
    }

    const isMediaLibraryHost =
      host === window.location.hostname
      || host === "cms.avangarda.media"
      || host === "localhost"
      || host === "127.0.0.1"
      || host === "res.cloudinary.com";
    if (isMediaLibraryHost && SAFE_VIDEO_FILE_PATTERN.test(parsed.pathname)) {
      return { kind: "file", url: parsed.href };
    }
  } catch {
    return null;
  }

  return null;
}

function renderVideoPreview(url, title) {
  const video = normalizeVideoUrl(url);
  if (!video) {
    return '<p class="avangarda-editor-preview__warning">Video adresa nije dozvoljena. Koristite Media Library, YouTube ili Vimeo.</p>';
  }

  const safeUrl = escapeHtml(video.url);
  const safeTitle = escapeHtml(title || "Video u članku");
  if (video.kind === "file") {
    return `<figure class="avangarda-editor-preview__video"><video src="${safeUrl}" controls preload="metadata" playsinline aria-label="${safeTitle}"></video><figcaption>${safeTitle}</figcaption></figure>`;
  }

  return `<figure class="avangarda-editor-preview__video"><iframe src="${safeUrl}" title="${safeTitle}" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe><figcaption>${safeTitle}</figcaption></figure>`;
}

function renderInline(value) {
  const fragments = [];
  const keep = (html) => `AVANGARDAFRAGMENT${fragments.push(html) - 1}TOKEN`;
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, (_match, code) => keep(`<code>${code}</code>`))
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_match, alt, url, caption) => {
      if (!/^(?:https?:\/\/|\/)/i.test(url) || /&(?:quot|#39);/i.test(url)) {
        return '<span class="avangarda-editor-preview__warning">Nevažeća adresa slike</span>';
      }
      const safeAlt = alt || caption || "Slika u tekstu";
      return keep(`<span class="avangarda-editor-preview__image"><img src="${url}" alt="${safeAlt}" loading="lazy" /><span>${caption || alt || "Slika u tekstu"}</span></span>`);
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="avangarda-editor-preview__link">$1</span>')
    .replace(/&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/g, "<u>$1</u>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
    .replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>")
    .replace(/AVANGARDAFRAGMENT(\d+)TOKEN/g, (match, index) => fragments[Number(index)] || match);
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

    const video = line.trim().match(/^@\[video\]\((\S+?)(?:\s+"([^"]*)")?\)$/i);
    if (video) {
      output.push(renderVideoPreview(video[1], video[2]));
      index += 1;
      continue;
    }

    if (/^\s*(?:---|\*\*\*|___)\s*$/.test(line)) {
      output.push("<hr />");
      index += 1;
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
    while (index < lines.length && lines[index].trim() && !/^(?:#{2,4}\s|>|```|@\[video\]|\s*(?:---|\*\*\*|___)\s*$|\s*[-*+]\s+|\s*\d+[.)]\s+)/.test(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    output.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return output.join("") || '<p class="avangarda-editor-preview__empty">Formatirani pregled će se pojaviti ovde.</p>';
}

function findMoreButton(toolbar) {
  // Strapi 4's IconButton may use aria-labelledby instead of aria-label.
  // Its accessible text remains "More" in the configured English admin UI.
  return Array.from(toolbar.querySelectorAll("button")).find((button) => (
    button.getAttribute("aria-label") === "More" || button.textContent?.trim() === "More"
  ));
}

function findToolbar(button) {
  let current = button.parentElement;
  while (current && current !== document.body) {
    if (current.querySelector('button[name="Bold"]') && current.querySelector('button[name="Italic"]')
      && findMoreButton(current)) return current;
    current = current.parentElement;
  }
  return null;
}

function findEditorWrapper(toolbar) {
  let current = toolbar.parentElement;
  while (current && current !== document.body) {
    if (current.querySelector(".CodeMirror")) return current;
    current = current.parentElement;
  }
  return null;
}

function getEditor(editorWrapper) {
  return editorWrapper?.querySelector(".CodeMirror")?.CodeMirror || null;
}

function triggerNativeAction(toolbar, actionName) {
  const directAction = toolbar.querySelector(`button[name="${actionName}"]`);
  if (directAction && directAction.offsetParent !== null) {
    directAction.click();
    return;
  }

  const moreButton = findMoreButton(toolbar);
  if (!moreButton) return;

  moreButton.click();
  window.requestAnimationFrame(() => {
    const actions = Array.from(document.body.querySelectorAll(`button[name="${actionName}"]`));
    const action = actions.find((button) => button.offsetParent !== null)
      || Array.from(document.body.querySelectorAll("button")).find((button) => (
        button.textContent?.trim() === actionName && button.offsetParent !== null
      ));
    action?.click();
  });
}

function formatSelectedLines(editor, prefix) {
  if (!editor) return;
  const from = editor.getCursor("from");
  const to = editor.getCursor("to");
  editor.operation(() => {
    for (let lineNumber = from.line; lineNumber <= to.line; lineNumber += 1) {
      const line = editor.getLine(lineNumber);
      const content = line.replace(/^\s{0,3}#{1,6}\s+/, "");
      editor.replaceRange(`${prefix}${content}`, { line: lineNumber, ch: 0 }, { line: lineNumber, ch: line.length });
    }
  });
  editor.focus();
}

function wrapSelection(editor, before, after, placeholder) {
  if (!editor) return;
  const selection = editor.getSelection() || placeholder;
  editor.replaceSelection(`${before}${selection}${after}`, "around");
  editor.focus();
}

function insertBlock(editor, value) {
  if (!editor) return;
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);
  const prefix = line.trim() ? "\n\n" : "";
  editor.replaceSelection(`${prefix}${value}\n\n`, "around");
  editor.focus();
}

function removeLink(editor) {
  if (!editor) return;
  const selected = editor.getSelection();
  if (selected) {
    editor.replaceSelection(selected.replace(/(^|[^!])\[([^\]]+)\]\([^)]+\)/g, "$1$2"), "around");
  } else {
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    editor.replaceRange(line.replace(/(^|[^!])\[([^\]]+)\]\([^)]+\)/g, "$1$2"), { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
  }
  editor.focus();
}

function insertVideo(editor) {
  if (document.querySelector("[data-avangarda-video-dialog]")) return;
  const dialog = document.createElement("dialog");
  dialog.setAttribute("data-avangarda-video-dialog", "true");
  dialog.setAttribute("aria-label", "Dodaj video");
  dialog.innerHTML = '<form><h2>Dodaj video</h2><p>Unesite URL postojećeg Media Library fajla ili YouTube/Vimeo adresu.</p><label>Video URL<input name="videoUrl" type="text" inputmode="url" required autocomplete="off" /></label><label>Naslov ili pristupačan opis<input name="videoTitle" type="text" value="Video u članku" required maxlength="200" /></label><p role="alert" hidden></p><div><button type="button" data-cancel>Otkaži</button><button type="submit">Umetni video</button></div></form>';
  const form = dialog.querySelector("form");
  const error = dialog.querySelector('[role="alert"]');
  dialog.querySelector("[data-cancel]").addEventListener("click", () => dialog.close());
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const url = form.elements.videoUrl.value.trim();
    if (!normalizeVideoUrl(url)) {
      error.hidden = false;
      error.textContent = "Dozvoljeni su video fajlovi iz Media Library, YouTube i Vimeo adrese.";
      return;
    }
    const title = form.elements.videoTitle.value.trim() || "Video u članku";
    insertBlock(editor, `@[video](${url} "${title.replace(/["\r\n]/g, "'")}")`);
    dialog.close();
  });
  dialog.addEventListener("close", () => { dialog.remove(); editor.focus(); });
  document.body.append(dialog);
  dialog.showModal();
}

function runHistoryCommand(editor, command) {
  // Strapi 4 calls setValue(value) on blur, which clears the redo stack.
  // Focus first so its controlled-value effect leaves CodeMirror history intact.
  editor.focus();
  editor.execCommand(command);
}

function createActionButton({ label, title, onClick }) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.title = title;
  button.setAttribute("aria-label", title);
  button.addEventListener("click", onClick);
  return button;
}

function enhanceToolbar(toolbar) {
  const nativeBold = toolbar.querySelector('button[name="Bold"]');
  const disabled = nativeBold?.disabled || nativeBold?.getAttribute("aria-disabled") === "true";
  if (toolbar.hasAttribute("data-avangarda-richtext-enhanced")) {
    toolbar.querySelectorAll('[data-avangarda-richtext-actions] button').forEach((button) => { button.disabled = Boolean(disabled); });
    return;
  }
  if (disabled) return;

  const editorWrapper = findEditorWrapper(toolbar);
  const code = editorWrapper?.querySelector('.CodeMirror-code[contenteditable="true"]');
  const editor = getEditor(editorWrapper);
  if (!editorWrapper || !code || !editor) return;
  toolbar.setAttribute("data-avangarda-richtext-enhanced", "true");
  toolbar.parentElement?.setAttribute("data-avangarda-richtext-nav", "true");

  const quickActions = document.createElement("div");
  quickActions.setAttribute("data-avangarda-richtext-actions", "true");
  quickActions.setAttribute("role", "toolbar");
  quickActions.setAttribute("aria-label", "Formatiranje glavnog sadržaja");

  [
    ["Pasus", "Običan paragraf", () => formatSelectedLines(editor, "")],
    ["H2", "Naslov nivoa 2", () => formatSelectedLines(editor, "## ")],
    ["H3", "Naslov nivoa 3", () => formatSelectedLines(editor, "### ")],
    ["H4", "Naslov nivoa 4", () => formatSelectedLines(editor, "#### ")],
  ].forEach(([label, title, onClick]) => quickActions.append(createActionButton({ label, title, onClick })));

  NATIVE_ACTIONS.forEach(({ action, label, title }) => {
    quickActions.append(createActionButton({ label, title, onClick: () => triggerNativeAction(toolbar, action) }));
  });

  [
    ["Ukloni link", "Ukloni link, zadrži tekst", () => removeLink(editor)],
    ["Inline code", "Označi kao inline code", () => wrapSelection(editor, "`", "`", "kod")],
    ["Code block", "Dodaj blok koda", () => wrapSelection(editor, "```\n", "\n```", "kod")],
    ["Video", "Dodaj Media Library, YouTube ili Vimeo video bez autoplay-a", () => insertVideo(editor)],
    ["Linija", "Dodaj horizontalnu liniju", () => insertBlock(editor, "---")],
    ["Poništi", "Undo (Ctrl+Z)", () => runHistoryCommand(editor, "undo")],
    ["Ponovi", "Redo (Ctrl+Y)", () => runHistoryCommand(editor, "redo")],
  ].forEach(([label, title, onClick]) => quickActions.append(createActionButton({ label, title, onClick })));

  toolbar.append(quickActions);

  const preview = document.createElement("div");
  preview.setAttribute("data-avangarda-richtext-preview", "true");
  preview.setAttribute("aria-live", "polite");
  preview.innerHTML = '<div class="avangarda-editor-preview__heading"><span class="avangarda-editor-preview__label">Živi vizuelni pregled</span><button type="button" data-avangarda-preview-toggle aria-expanded="true">Sakrij pregled</button></div><p class="avangarda-editor-preview__hint">Za sliku ubačenu komandom „Slika” dopunite alt, caption i kredit u „Fotografije i potpisi”. Za zaseban blok sa položajem i širinom koristite „Fotografije u tekstu” bez ponovnog ubacivanja iste slike. Video: kopirajte URL postojećeg fajla iz Media Library ili unesite YouTube/Vimeo adresu.</p><div class="avangarda-editor-preview__content"></div>';
  editorWrapper.append(preview);

  const previewContent = preview.querySelector(".avangarda-editor-preview__content");
  const previewToggle = preview.querySelector("[data-avangarda-preview-toggle]");
  previewToggle.addEventListener("click", () => {
    const expanded = previewToggle.getAttribute("aria-expanded") === "true";
    previewToggle.setAttribute("aria-expanded", expanded ? "false" : "true");
    previewToggle.textContent = expanded ? "Prikaži pregled" : "Sakrij pregled";
    previewContent.hidden = expanded;
  });

  let timerId = 0;
  const update = () => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => {
      const template = document.createElement("template");
      template.innerHTML = renderPreview(editor.getValue());
      const current = Array.from(previewContent.children);
      const next = Array.from(template.content.children);
      next.forEach((child, index) => {
        // Keep unchanged media nodes mounted while text elsewhere is edited.
        if (current[index]?.outerHTML === child.outerHTML) return;
        if (current[index]) current[index].replaceWith(child);
        else previewContent.append(child);
      });
      current.slice(next.length).forEach((child) => child.remove());
    }, 150);
  };
  editor.on("change", update);
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
