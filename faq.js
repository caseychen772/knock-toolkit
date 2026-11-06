(() => {
  const input = document.querySelector('#faq-search');
  const buttons = [...document.querySelectorAll('[data-category]')];
  const cards = [...document.querySelectorAll('.faq-card')];
  let category = 'all';
  function filter() {
    const query = input.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const card of cards) {
      const match = (category === 'all' || card.dataset.group === category) && card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !match;
      if (match) count++;
    }
    document.querySelector('#faq-count').textContent = `顯示 ${count} / ${cards.length} 個問題`;
    document.querySelector('#faq-empty').hidden = count > 0;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
  }
  input.addEventListener('input', filter);
  buttons.forEach(button => button.addEventListener('click', () => {category = button.dataset.category; filter();}));
  document.querySelector('#faq-reset').addEventListener('click', () => {category = 'all'; input.value = ''; filter();});
  document.querySelectorAll('.priority-grid a').forEach(link => link.addEventListener('click', () => {
    category = 'all'; input.value = ''; filter();
  }));
  filter();
})();
