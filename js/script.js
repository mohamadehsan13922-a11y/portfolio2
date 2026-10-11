(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const nav = $('#nav');
  const menuBtn = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');
  const backToTop = $('#backToTop');
  const toast = $('#toast');

  // Sticky navigation and back-to-top button
  const updateScrollUI = () => {
    const y = window.scrollY;
    nav?.classList.toggle('scrolled', y > 40);
    backToTop?.classList.toggle('show', y > 450);
  };
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  // Highlight the navigation item for the section currently in view
  const sections = $$('section[id]');
  const navLinks = $$('.nav-links a');
  const updateActiveLink = () => {
    let current = 'home';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 160) current = section.id;
    });
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // Mobile navigation
  const closeMobileMenu = () => {
    mobileMenu?.classList.remove('open');
    if (menuBtn) {
      menuBtn.textContent = '☰';
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  };

  menuBtn?.addEventListener('click', () => {
    const isOpen = mobileMenu?.classList.toggle('open') ?? false;
    menuBtn.textContent = isOpen ? '✕' : '☰';
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  $$('[data-close]', mobileMenu || document).forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMobileMenu();
  });

  // Reveal elements as they enter the viewport
  const revealElements = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach(element => observer.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('visible'));
  }

  // Live project search
  const projectSearch = $('#projectSearch');
  const projectCards = $$('.project-card');
  const projectCount = $('#projectCount');
  const filterProjects = () => {
    const query = (projectSearch?.value || '').trim().toLocaleLowerCase('fa');
    let shown = 0;
    projectCards.forEach(card => {
      const matches = card.textContent.toLocaleLowerCase('fa').includes(query);
      card.hidden = !matches;
      if (matches) shown++;
    });
    if (projectCount) {
      projectCount.textContent = query
        ? `${shown} از ${projectCards.length} پروژه`
        : `${projectCards.length} پروژه`;
    }
    let emptyMessage = $('#noProjectsMessage');
    if (shown === 0 && projectCards.length) {
      if (!emptyMessage) {
        emptyMessage = document.createElement('p');
        emptyMessage.id = 'noProjectsMessage';
        emptyMessage.className = 'section-desc';
        emptyMessage.textContent = 'پروژه‌ای با این عبارت پیدا نشد.';
        projectSearch?.closest('.project-search-wrap')?.insertAdjacentElement('afterend', emptyMessage);
      }
    } else {
      emptyMessage?.remove();
    }
  };
  projectSearch?.addEventListener('input', filterProjects);

  // Back to top
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Demo contact form: this shows a message but does not send email to a server.
  const contactForm = $('#contactForm');
  let toastTimer;
  const showToast = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3000);
  };

  // Placeholder links: the user can add real GitHub/demo URLs later.
  $$('[data-placeholder-link]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      showToast('لینک این بخش هنوز اضافه نشده؛ بعداً آدرسش را وارد کن.');
    });
  });

  contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }
    showToast('پیام در نسخه دمو ثبت شد؛ برای ارسال واقعی باید فرم به سرور وصل شود.');
    contactForm.reset();
  });

  // Keep in-page links from leaving the mobile menu open
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu?.classList.contains('open')) closeMobileMenu();
    });
  });
})();
