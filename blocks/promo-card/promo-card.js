export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    // copy structure from row (expected columns: content and image)
    const content = document.createElement('div');
    content.className = 'promo-content';
    const imgWrap = document.createElement('div');
    imgWrap.className = 'promo-image';

    // Find headline (h1-h4), description (p), image (img)
    const headline = row.querySelector('h1, h2, h3, h4');
    if (headline) {
      const h = document.createElement('div');
      h.className = 'headline';
      h.innerHTML = headline.innerHTML;
      content.appendChild(h);
    }
    const p = row.querySelector('p');
    if (p) {
      const d = document.createElement('div');
      d.className = 'description';
      d.innerHTML = p.innerHTML;
      content.appendChild(d);
    }
    const link = row.querySelector('a');
    if (link) {
      const a = document.createElement('a');
      a.className = 'cta';
      a.href = link.href || '#';
      a.textContent = link.textContent || 'Learn more';
      content.appendChild(a);
    }
    const img = row.querySelector('img');
    if (img) {
      const i = document.createElement('div');
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt || '';
      i.appendChild(newImg);
      imgWrap.appendChild(i);
    }

    li.appendChild(content);
    if (imgWrap.children.length) li.appendChild(imgWrap);
    ul.appendChild(li);
  });
  block.textContent = '';
  block.appendChild(ul);
}
