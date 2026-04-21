function getPageData() {
  const headings = [...document.querySelectorAll("h1, h2")]
    .map(el => el.innerText.trim())
    .filter(Boolean)
    .slice(0, 5);

  const buttons = [...document.querySelectorAll("button")]
    .map(el => el.innerText.trim())
    .filter(Boolean)
    .slice(0, 5);

  const links = [...document.querySelectorAll("a")]
    .map(el => el.innerText.trim())
    .filter(Boolean)
    .slice(0, 5);

  const images = [...document.querySelectorAll("img")]
    .map(img => img.alt || "afbeelding zonder beschrijving")
    .slice(0, 5);

  const paragraphs = [...document.querySelectorAll("p")]
    .map(p => p.innerText.trim())
    .filter(Boolean)
    .slice(0, 3);

  return {
    url: window.location.href,
    title: document.title,
    headings,
    buttons,
    links,
    images,
    paragraphs
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_PAGE_DATA") {
    sendResponse(getPageData());
  }
});