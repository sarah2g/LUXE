// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function(){
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', ()=>{
    if(mainNav.style.display === 'block') mainNav.style.display = '';
    else mainNav.style.display = 'block';
  });

  // ScrollReveal init
  if(window.ScrollReveal){
    const sr = ScrollReveal({distance: '40px', duration: 700, easing: 'ease', mobile: true});
    // generic reveal
    sr.reveal('.reveal', {interval: 80, origin: 'bottom', opacity: 0});
    // hero
    sr.reveal('.hero-inner', {origin: 'top', duration: 900, delay: 100});
    // product cards
    sr.reveal('.product-card', {interval: 60, origin: 'bottom', distance: '30px'});
    // values / small icons
    sr.reveal('.value', {interval: 80, origin: 'bottom', distance: '20px'});
    // timeline items
    sr.reveal('.timeline-item', {interval: 120, origin: 'left', distance: '30px'});
    // contact and faq
    sr.reveal('.contact-card', {interval: 60, origin: 'bottom', distance: '20px'});
    sr.reveal('.contact-form-wrap, .contact-aside, .faq-item', {origin: 'bottom', distance: '20px', interval: 60});
  }
});


  // Admin: Add Product modal behaviour (if present)
  const addProductBtn = document.getElementById('addProductBtn');
  const addProductModal = document.getElementById('addProductModal');
  const cancelModal = document.getElementById('cancelModal');
  const productImageInput = document.getElementById('productImageInput');
  const imagePreview = document.getElementById('imagePreview');

  if(addProductBtn && addProductModal){
    const openModal = ()=>{
      addProductModal.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
      const first = addProductModal.querySelector('input,textarea,select,button');
      if(first) first.focus();
    };
    const closeModal = ()=>{
      addProductModal.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
      addProductBtn.focus();
    };

    addProductBtn.addEventListener('click', openModal);
    if(cancelModal) cancelModal.addEventListener('click', closeModal);
    // close when clicking overlay
    addProductModal.querySelectorAll('.modal-overlay').forEach(el=>el.addEventListener('click', closeModal));

    // Escape to close
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && addProductModal.getAttribute('aria-hidden')==='false') closeModal(); });

    // File preview
    if(productImageInput && imagePreview){
      productImageInput.addEventListener('change', (e)=>{
        const file = e.target.files && e.target.files[0];
        if(file && file.type.startsWith('image/')){
          const reader = new FileReader();
          reader.onload = ()=>{ imagePreview.style.backgroundImage = `url(${reader.result})`; imagePreview.setAttribute('aria-hidden','false'); };
          reader.readAsDataURL(file);
        } else {
          imagePreview.style.backgroundImage = '';
          imagePreview.setAttribute('aria-hidden','true');
        }
      });
    }
  }

  // Orders page: View modal, search/filter and export (only when orders table exists)
  (function(){
    const ordersTable = document.querySelector('.orders-table');
    if(!ordersTable) return;

    const tbody = ordersTable.querySelector('tbody');
    const viewOrderModal = document.getElementById('viewOrderModal');

    // open view modal and populate
    tbody.addEventListener('click', (e)=>{
      const btn = e.target.closest('button');
      if(!btn) return;
      const action = btn.title || btn.getAttribute('data-action');
      if(action !== 'View') return;
      const tr = btn.closest('tr');
      if(!tr) return;
      const cells = tr.children;
      const orderId = cells[0]?.textContent.trim() || '';
      const customer = cells[1]?.textContent.trim() || '';
      const email = cells[2]?.textContent.trim() || '';
      const product = cells[3]?.textContent.trim() || '';
      const qty = cells[4]?.textContent.trim() || '';
      const total = cells[5]?.textContent.trim() || '';

      if(viewOrderModal){
        viewOrderModal.setAttribute('aria-hidden','false');
        const setText = (id, text)=>{ const el = viewOrderModal.querySelector('#'+id); if(el) el.textContent = text; };
        setText('ordId', orderId);
        setText('ordCustomer', customer);
        setText('ordEmail', email);
        // populate items list (simple single line for now)
        const itemsEl = viewOrderModal.querySelector('#ordItems');
        if(itemsEl){ itemsEl.innerHTML = ''; const li = document.createElement('li'); li.textContent = `${product} ×${qty} — ${total}`; itemsEl.appendChild(li); }
        setText('ordTotal', total);
        // set update form action and status select if provided on the button
        try{
          const form = viewOrderModal.querySelector('#ordUpdateForm');
          if(form && btn.dataset.updateUrl){ form.action = btn.dataset.updateUrl; }
          const sel = viewOrderModal.querySelector('#ordStatus');
          const statusFromBtn = btn.dataset.status || btn.getAttribute('data-status');
          if(sel && statusFromBtn) sel.value = statusFromBtn;
          // prefer explicit data-email if present
          if(btn.dataset.email){ const emailEl = viewOrderModal.querySelector('#ordEmail'); if(emailEl) emailEl.textContent = btn.dataset.email; }
        }catch(err){ console.warn('Order modal wiring error', err); }
        // focus close
        const closeBtn = viewOrderModal.querySelector('[data-close], button');
        if(closeBtn) closeBtn.focus();
      }
    });

    // close view modal on overlay/cancel
    if(viewOrderModal){
      viewOrderModal.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click', ()=> viewOrderModal.setAttribute('aria-hidden','true')));
      document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && viewOrderModal.getAttribute('aria-hidden') === 'false') viewOrderModal.setAttribute('aria-hidden','true'); });
    }

    // search / filter within orders card
    const ordersCard = ordersTable.closest('.admin-card');
    if(ordersCard){
      const searchInput = ordersCard.querySelector('.admin-search-input');
      if(searchInput){
        searchInput.addEventListener('input', ()=>{
          const q = searchInput.value.trim().toLowerCase();
          Array.from(tbody.querySelectorAll('tr')).forEach(tr=>{
            const text = tr.textContent.toLowerCase();
            tr.style.display = text.includes(q) ? '' : 'none';
          });
        });
      }
    }

    // Export orders as CSV
    const exportBtn = document.querySelector('.admin-topbar .btn.btn-secondary');
    if(exportBtn){
      exportBtn.addEventListener('click', ()=>{
        const headers = Array.from(ordersTable.querySelectorAll('thead th')).map(th=>th.textContent.trim());
        const rows = Array.from(tbody.querySelectorAll('tr')).map(tr=>{
          return Array.from(tr.children).slice(0,8).map(td=> '"'+ td.textContent.trim().replace(/"/g,'""') +'"').join(',');
        });
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'orders-export.csv'; document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      });
    }

  })();

  // Products table actions: view, edit, delete
    const productsTable = document.querySelector('.products-table tbody');
    const viewModal = document.getElementById('viewProductModal');
    const editModal = document.getElementById('editProductModal');
    const deleteModal = document.getElementById('deleteConfirmModal');
    let rowToDelete = null;

    if(productsTable){
      // Intercept any delete form submissions inside the products table so we can show a confirm modal
      productsTable.querySelectorAll('form').forEach(formEl=>{
        formEl.addEventListener('submit', (ev)=>{
          // prevent immediate submit and open confirm modal instead
          ev.preventDefault();
          rowToDelete = formEl.closest('tr');
          if(deleteModal) deleteModal.setAttribute('aria-hidden','false');
        });
      });

      productsTable.addEventListener('click', (e)=>{
        const btn = e.target.closest('button');
        if(!btn) return;
        const action = btn.title || btn.getAttribute('data-action');
        const tr = btn.closest('tr');
        if(!tr) return;

        // prefer data-* attributes on the button for exact values, fallback to table cells
        const img = btn.dataset.imageUrl || tr.querySelector('img')?.src || '';
        const name = btn.dataset.name || tr.children[1]?.textContent.trim() || '';
        const category = btn.dataset.categoryName || tr.children[2]?.textContent.trim() || '';
        const price = btn.dataset.price || tr.children[3]?.textContent.trim() || '';
        const stock = btn.dataset.stock || tr.children[4]?.textContent.trim() || '';

        if(action === 'View'){
          if(viewModal){
            viewModal.setAttribute('aria-hidden','false');
            const imgEl = viewModal.querySelector('.product-image');
            if(imgEl) imgEl.style.backgroundImage = img? `url(${img})` : '';
            viewModal.querySelector('#viewName').textContent = name;
            viewModal.querySelector('#viewCategory').textContent = category;
            viewModal.querySelector('#viewPrice').textContent = price;
            viewModal.querySelector('#viewStock').textContent = `Stock: ${stock}`;
          }
        }

        if(action === 'Edit'){
          if(editModal){
            editModal.setAttribute('aria-hidden','false');
            const form = document.getElementById('editProductForm');
            // set form action to the edit URL provided on the button
            if(btn.dataset.editUrl) form.action = btn.dataset.editUrl;
            // populate fields
            const setVal = (id, val)=>{ const el = document.getElementById(id); if(el) el.value = val || ''; };
            setVal('edit_id', btn.dataset.id || '');
            setVal('edit_name', btn.dataset.name || '');
            setVal('edit_price', (btn.dataset.price || '').replace(/[^0-9.-]+/g, ''));
            setVal('edit_stock', btn.dataset.stock || '');
            setVal('edit_description', btn.dataset.description || '');
            setVal('edit_category', btn.dataset.category || '');

            const preview = document.getElementById('edit_image_preview');
            if(preview){
              if(btn.dataset.imageUrl){ preview.style.backgroundImage = `url(${btn.dataset.imageUrl})`; preview.setAttribute('aria-hidden','false'); }
              else { preview.style.backgroundImage = ''; preview.setAttribute('aria-hidden','true'); }
            }

            // focus first input
            const first = form.querySelector('input,textarea,select,button');
            if(first) first.focus();

            // wire local preview for the edit image input (one-time listener)
            const editImageInput = document.getElementById('edit_image');
            if(editImageInput && preview){
              editImageInput.addEventListener('change', function onChange(e){
                const file = e.target.files && e.target.files[0];
                if(file && file.type.startsWith('image/')){
                  const reader = new FileReader();
                  reader.onload = ()=>{ preview.style.backgroundImage = `url(${reader.result})`; preview.setAttribute('aria-hidden','false'); };
                  reader.readAsDataURL(file);
                } else { preview.style.backgroundImage = ''; preview.setAttribute('aria-hidden','true'); }
              }, {once:true});
            }
          }
        }

        if(action === 'Delete'){
          if(deleteModal){
            deleteModal.setAttribute('aria-hidden','false');
            rowToDelete = tr;
          }
        }
      });

      // close view/edit/delete modals on overlay or cancel
      [viewModal, editModal, deleteModal].forEach(mod=>{
        if(!mod) return;
        mod.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click', ()=> mod.setAttribute('aria-hidden','true')));
      });

      // NOTE: allow the edit form to submit normally (POST to server). We no longer preventDefault here.

      // handle delete confirm: submit the row's delete form if present, otherwise remove the row
      const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
      if(confirmDeleteBtn){
        confirmDeleteBtn.addEventListener('click', ()=>{
          if(rowToDelete){
            const delForm = rowToDelete.querySelector('form');
            if(delForm) delForm.submit();
            else rowToDelete.remove();
            rowToDelete = null;
          }
          deleteModal.setAttribute('aria-hidden','true');
        });
      }
    }


// Wishlist (favorites) AJAX handling: intercept wishlist add/remove forms
;(function(){
  // add to wishlist forms (on product cards)
  document.querySelectorAll('form.wishlist-form').forEach(formEl=>{
    formEl.addEventListener('submit', function(ev){
      ev.preventDefault();
      const btn = formEl.querySelector('button') || ev.target.closest('button');
      const url = formEl.action;
      const data = new FormData(formEl);
      fetch(url, {method: 'POST', body: data, headers: {'X-Requested-With':'XMLHttpRequest'}, credentials: 'same-origin'})
        .then(r=> r.json())
        .then(json=>{
          if(json && json.added){
            // mark heart as solid / pink
            const icon = btn.querySelector('i');
            if(icon){ icon.classList.remove('fa-regular'); icon.classList.add('fa-solid'); }
            btn.classList.add('favorited');
            // if on wishlist page, append card to favorites list if present
            const favList = document.getElementById('favoritesList');
            if(favList){
              // create a new product article similar to template structure
              const article = document.createElement('article'); article.className = 'card product-card reveal'; article.setAttribute('data-product-id', json.id);
              const media = document.createElement('div'); media.className = 'media'; media.style.backgroundImage = json.image_url? `url(${json.image_url})` : '';
              media.style.backgroundSize = 'cover'; media.style.backgroundPosition = 'center'; media.style.minHeight = '220px'; media.style.position = 'relative';
              // remove form
              const removeForm = document.createElement('form'); removeForm.method = 'post'; removeForm.action = '/wishlist/remove/' + json.id + '/'; removeForm.className = 'remove-wishlist-form'; removeForm.style.display = 'inline';
              // CSRF token: clone existing token input from page if present
              const tokenInput = document.querySelector('form.wishlist-form input[name="csrfmiddlewaretoken"]');
              if(tokenInput){ const t = tokenInput.cloneNode(); t.value = tokenInput.value; removeForm.appendChild(t); }
              const remBtn = document.createElement('button'); remBtn.className = 'wishlist icon-btn'; remBtn.setAttribute('aria-label','Remove from wishlist'); remBtn.setAttribute('title','Remove'); remBtn.setAttribute('data-product-id', json.id);
              remBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
              removeForm.appendChild(remBtn);
              media.appendChild(removeForm);
              // add-to-cart CTA
              const cta = document.createElement('div'); cta.className = 'card-cta';
              // simple CTA placeholder; server-side add-to-cart requires CSRF, so keep a basic button here
              cta.innerHTML = `<button class="btn btn-primary" disabled><i class="fas fa-shopping-cart"></i> Add to Cart</button>`;
              media.appendChild(cta);
              const body = document.createElement('div'); body.className = 'card-body';
              const small = document.createElement('small'); small.className = 'category'; small.textContent = json.category || '-';
              const h3 = document.createElement('h3'); h3.className = 'product-title'; h3.textContent = json.name;
              const p = document.createElement('p'); p.className = 'price'; p.textContent = '$' + json.price;
              body.appendChild(small); body.appendChild(h3); body.appendChild(p);
              article.appendChild(media); article.appendChild(body);
              favList.appendChild(article);
            }
          }
        }).catch(err=>{ console.error('Wishlist add error', err); });
    });
  });

  // remove from wishlist forms (on wishlist page)
  document.querySelectorAll('form.remove-wishlist-form').forEach(formEl=>{
    formEl.addEventListener('submit', function(ev){
      ev.preventDefault();
      const url = formEl.action;
      const article = formEl.closest('article');
      const data = new FormData(formEl);
      fetch(url, {method:'POST', body: data, headers: {'X-Requested-With':'XMLHttpRequest'}, credentials:'same-origin'})
        .then(r=> r.json())
        .then(json=>{
          if(json && json.removed){
            if(article) article.remove();
          }
        }).catch(err=>{ console.error('Wishlist remove error', err); });
    });
  });
})();

// Client-side product filtering by category on Shop page
(function(){
  const filters = document.getElementById('categoryFilters');
  if(!filters) return;
  const buttons = Array.from(filters.querySelectorAll('.filter-btn'));
  const products = Array.from(document.querySelectorAll('.products-grid .product-card'));

  const setActive = (btn)=>{
    buttons.forEach(b=>{ b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
    btn.classList.add('active'); btn.setAttribute('aria-pressed','true');
  };

  const filterBy = (slug)=>{
    products.forEach(card=>{
      const cat = card.getAttribute('data-category') || '';
      if(!slug || slug === ''){ card.style.display = ''; }
      else if(cat === slug){ card.style.display = ''; }
      else { card.style.display = 'none'; }
    });
  };

  filters.addEventListener('click', (e)=>{
    const btn = e.target.closest('.filter-btn');
    if(!btn) return;
    const slug = btn.dataset.category || '';
    setActive(btn);
    filterBy(slug);
  });
})();
