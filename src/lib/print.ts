/**
 * Print a single element reliably by rendering it into an isolated, hidden
 * iframe that carries the app's stylesheets. This avoids all app-layout,
 * stacking-context and @media-print visibility pitfalls (the approach used by
 * libraries such as react-to-print).
 */
export function printNode(node: HTMLElement) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
    visibility: "hidden",
  });
  document.body.appendChild(iframe);

  const cw = iframe.contentWindow;
  if (!cw) {
    iframe.remove();
    // Fallback: print the whole page
    window.print();
    return;
  }
  const doc = cw.document;

  // Copy the app's <style> and <link rel=stylesheet> so the document looks identical.
  const headStyles = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]'),
  )
    .map((el) => el.outerHTML)
    .join("\n");

  doc.open();
  doc.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<base href="${document.baseURI}" />
${headStyles}
<style>
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; background: #ffffff; }
  /* Force browsers to print background colors/images (navy header, green total
     bar, etc.) instead of stripping them for ink-saving. */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .doc-page { box-shadow: none !important; margin: 0 !important; }
  /* Neutralize the app's copied @media print rules: the document lives directly
     in this iframe's body (no #print-root wrapper), so force it fully visible. */
  @media print {
    body, body * { visibility: visible !important; }
    .print-source { position: static !important; left: auto !important; }
  }
</style>
</head>
<body>${node.innerHTML}</body>
</html>`);
  doc.close();

  const doPrint = () => {
    try {
      cw.focus();
      cw.print();
    } finally {
      setTimeout(() => iframe.remove(), 1500);
    }
  };

  const whenReady = () => {
    // Wait for fonts if the browser exposes the API, else use a small delay
    const fonts = (doc as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) {
      fonts.ready.then(() => setTimeout(doPrint, 120)).catch(() => doPrint());
    } else {
      setTimeout(doPrint, 400);
    }
  };

  if (doc.readyState === "complete") {
    setTimeout(whenReady, 60);
  } else {
    iframe.onload = whenReady;
  }
}
