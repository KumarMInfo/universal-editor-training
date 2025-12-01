
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function renderStars(rating = 0) {
  const wrapper = document.createElement('span');
  wrapper.className = 'review-rating';
  wrapper.setAttribute('aria-hidden', 'true');
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  for (let i = 1; i <= 5; i += 1) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'star');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 .587l3.668 7.431L23.6 9.75l-5.8 5.656L19.335 24 12 19.897 4.665 24l1.535-8.594L.4 9.75l7.932-1.732z');
    path.setAttribute('fill', i <= full ? '#f59e0b' : '#e5e7eb');
    svg.appendChild(path);
    wrapper.appendChild(svg);
  }
  return wrapper;
}

function shortTextToggle(p, limit = 220) {
  const text = p.textContent.trim();
  if (text.length <= limit) return;
  const short = text.slice(0, limit).trim() + '…';
  const span = document.createElement('div');
  const body = document.createElement('div');
  body.className = 'review-body';
  body.textContent = short;
  const more = document.createElement('button');
  more.className = 'read-more';
  more.type = 'button';
  more.textContent = 'Read more';
  more.addEventListener('click', () => {
    if (body.classList.contains('expanded')) {
      body.classList.remove('expanded');
      body.textContent = short;
      more.textContent = 'Read more';
    } else {
      body.classList.add('expanded');
      body.textContent = text;
      more.textContent = 'Show less';
    }
  });
  span.appendChild(body);
  span.appendChild(more);
  p.replaceWith(span);
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    // Move all inner nodes into li preserving structure
    while (row.firstElementChild) li.append(row.firstElementChild);

    // Assign classes based on content
    const picture = li.querySelector('picture');
    if (picture) {
      const avatarWrap = document.createElement('div');
      avatarWrap.className = 'review-avatar';
      // replace picture with optimized picture
      const img = picture.querySelector('img');
      if (img) {
        const optimized = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '120' }]);
        moveInstrumentation(img, optimized.querySelector('img'));
        avatarWrap.appendChild(optimized);
        picture.replaceWith(avatarWrap);
      }
    }

    // Build header (name / title / rating / date)
    const header = document.createElement('div');
    header.className = 'review-header';

    const avatarEl = li.querySelector('.review-avatar');
    if (avatarEl) header.appendChild(avatarEl);

    const meta = document.createElement('div');
    meta.className = 'review-meta';

    // Name: prefer h3/h2 or first strong/text
    const nameEl = li.querySelector('h1, h2, h3, h4') || li.querySelector('strong') || li.querySelector('p');
    if (nameEl) {
      const name = document.createElement('div');
      name.className = 'review-name';
      name.textContent = nameEl.textContent.trim();
      meta.appendChild(name);
      // remove original name node if it was moved
      if (nameEl.parentElement === li) nameEl.remove();
    }

    // Title / role (small)
    const titleEl = li.querySelector('small, .title');
    if (titleEl) {
      const title = document.createElement('div');
      title.className = 'review-title';
      title.textContent = titleEl.textContent.trim();
      meta.appendChild(title);
      if (titleEl.parentElement === li) titleEl.remove();
    }

    header.appendChild(meta);

    // Rating: look for data-rating on row or an element with class 'rating'
    let rating = null;
    if (row.dataset && row.dataset.rating) rating = Number(row.dataset.rating);
    const ratingNode = li.querySelector('.rating');
    if (ratingNode) {
      const v = Number(ratingNode.textContent.trim());
      if (!Number.isNaN(v)) rating = v;
      ratingNode.remove();
    }

    if (rating !== null) {
      const stars = renderStars(rating);
      header.appendChild(stars);
      // add visually-hidden label for a11y
      const sr = document.createElement('span');
      sr.className = 'review-date';
      sr.textContent = `${rating} out of 5`;
      sr.setAttribute('aria-hidden', 'false');
      stars.setAttribute('aria-label', `${rating} out of 5 stars`);
    }

    // Date: look for time or date string
    const dateEl = li.querySelector('time');
    if (dateEl) {
      const d = document.createElement('div');
      d.className = 'review-date';
      d.textContent = dateEl.textContent.trim();
      header.appendChild(d);
      dateEl.remove();
    }

    // Prepend header to li
    li.prepend(header);

    // Body: find first paragraph remaining
    const p = li.querySelector('p');
    if (p) shortTextToggle(p);

    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
