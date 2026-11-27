const gallery = document.querySelector('.media-gallery');
const photoLinks = Array.from(document.querySelectorAll('.media-photos a'));

if (typeof gallery.showModal === 'function') {
  const photo = gallery.querySelector('.media-gallery-image');
  const caption = gallery.querySelector('.media-gallery-caption');
  let opener;
  let currentIndex = 0;

  function showPhoto(index) {
    currentIndex = (index + photoLinks.length) % photoLinks.length;
    const link = photoLinks[currentIndex];
    photo.src = link.href;
    caption.textContent = `${link.querySelector('img').alt} · ${currentIndex + 1} of ${photoLinks.length}`;
  }

  photoLinks.forEach((link, index) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      opener = link;
      showPhoto(index);
      gallery.showModal();
    });
  });

  gallery.querySelector('.media-gallery-prev').addEventListener('click', () => showPhoto(currentIndex - 1));
  gallery.querySelector('.media-gallery-next').addEventListener('click', () => showPhoto(currentIndex + 1));
  gallery.querySelector('.media-gallery-close').addEventListener('click', () => gallery.close());
  gallery.addEventListener('click', event => {
    if (event.target === gallery) gallery.close();
  });
  gallery.addEventListener('close', () => opener?.focus());
  gallery.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPhoto(currentIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(currentIndex + 1);
    }
  });
}
