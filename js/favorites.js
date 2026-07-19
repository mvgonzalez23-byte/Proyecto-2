/* ============================================================
   favorites.js — "Mis álbumes": colección privada persistida
   en localStorage, con filtrado dinámico por calificación.
   Funciona igual con o sin conexión, ya que lee 100% del
   almacenamiento local.
   ============================================================ */

const FavoritesView = {
  root: null,

  mount(root){
    this.root = root;
    this.render();
  },

  render(){
    const favs = Object.values(Store.getFavorites());

    this.root.innerHTML = `
      <div class="fav-toolbar">
        <span class="fav-count">${favs.length} álbum(es) guardado(s)</span>
        <select id="rating-filter">
          <option value="0">Todas las calificaciones</option>
          <option value="5">★★★★★ (5)</option>
          <option value="4">★★★★☆ y más (4+)</option>
          <option value="3">★★★☆☆ y más (3+)</option>
          <option value="2">★★☆☆☆ y más (2+)</option>
          <option value="1">★☆☆☆☆ y más (1+)</option>
        </select>
      </div>
      <div id="fav-grid"></div>
    `;

    const select = document.getElementById('rating-filter');
    select.addEventListener('change', ()=> this.renderGrid(favs, parseInt(select.value,10)));
    this.renderGrid(favs, 0);
  },

  renderGrid(favs, minRating){
    const grid = document.getElementById('fav-grid');
    const filtered = favs.filter(f => (Store.getRating(f.id) || 0) >= minRating);

    if(favs.length === 0){
      grid.innerHTML = `
        <div class="state-panel">
          <span class="glyph">💾</span>
          <h3>Aún no tienes álbumes guardados</h3>
          <p>Busca un artista, abre un álbum y toca el corazón para guardarlo aquí.</p>
        </div>`;
      return;
    }

    if(filtered.length === 0){
      grid.innerHTML = `
        <div class="state-panel">
          <span class="glyph">🎚️</span>
          <h3>Nada con ese filtro</h3>
          <p>Prueba bajando el mínimo de estrellas.</p>
        </div>`;
      return;
    }

    grid.innerHTML = `<div class="fav-grid">${filtered.map(f=>this.card(f)).join('')}</div>`;

    grid.querySelectorAll('[data-remove]').forEach(link=>{
      link.addEventListener('click', (e)=>{
        e.preventDefault();
        Store.removeFavorite(link.dataset.remove);
        this.render();
      });
    });
  },

  card(fav){
    const rating = Store.getRating(fav.id);
    let stars = '';
    for(let i=1;i<=5;i++){ stars += `<span class="star ${i<=rating?'filled':''}">★</span>`; }
    return `
      <div class="fav-card">
        <img src="${fav.cover}" alt="${this.escape(fav.title)}">
        <div class="title">${this.escape(fav.title)}</div>
        <div class="artist-name">${this.escape(fav.artist)}</div>
        <div class="stars">${stars}</div>
        <div class="row-between">
          <a href="#" class="remove-link" data-remove="${fav.id}">Quitar</a>
        </div>
      </div>
    `;
  },

  escape(str){
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }
};
