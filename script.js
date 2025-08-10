document.addEventListener('DOMContentLoaded', () => {
    // הסתרת הבאנר בעת גלילה
    const banner = document.querySelector('.banner');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            banner.style.transform = 'translateY(-100%)';
        } else {
            banner.style.transform = 'translateY(0)';
        }
        lastScrollY = currentScrollY;
    });

    // אפקטי טעינה הדרגתית על אלמנטים
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('section');
    sections.forEach(section => observer.observe(section));

    // פונקציונליות לשאלות נפוצות (FAQ)
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.querySelector('.answer');
            const arrow = item.querySelector('.arrow');
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            } else {
                answer.style.display = 'block';
                arrow.style.transform = 'rotate(180deg)';
            }
        });
    });
});