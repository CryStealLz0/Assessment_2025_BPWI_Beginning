export function renderFooterDropUp() {
    const footer = document.getElementById('footer');
    if (!footer) return;

    // Tambahkan class dasar
    footer.classList.add('footer', 'footer--hidden');

    // Isi HTML footer
    footer.innerHTML = `
    <div class="footer__container">
      <p class="footer__text">© ${new Date().getFullYear()} StoryMapKita. All rights reserved.</p>
      <div class="footer__links">
        <a href="#/" class="footer__link">Beranda</a>
        <a href="#/about" class="footer__link">Tentang</a>
        <a href="#/tambah" class="footer__link">Tambah Cerita</a>
      </div>
    </div>
  `;

    // Buat tombol toggle
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'footerToggleBtn';
    toggleBtn.className = 'footer-toggle';
    toggleBtn.textContent = '↑ Footer';

    document.body.appendChild(toggleBtn);

    // Toggle event
    toggleBtn.addEventListener('click', () => {
        footer.classList.toggle('footer--visible');
        toggleBtn.textContent = footer.classList.contains('footer--visible')
            ? '↓ Tutup Footer'
            : '↑ Footer';
    });
}
