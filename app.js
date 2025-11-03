
/* Estado en memoria (del lado cliente) */
const state = {
  personas: {},           // { nombre: [{desc, cuota, valor:int}] }
  personaActual: null     // nombre actual
};

const $ = (q) => document.querySelector(q);

function formatMiles(n){
  // reemplaza coma por punto como separador de miles
  return Number(n).toLocaleString('es-CL');
}

function ensurePersonaActual(){
  const nombre = $('#persona').value.trim();
  if(!nombre){
    alert('Primero escribe el nombre de la persona.');
    return false;
  }
  state.personaActual = nombre;
  if(!state.personas[state.personaActual]){
    state.personas[state.personaActual] = [];
  }
  return true;
}

function addItem(){
  if(!ensurePersonaActual()) return;

  const desc  = $('#desc').value.trim();
  const cuota = $('#cuota').value.trim();
  const val   = $('#valor').value.trim();

  if(!desc){ alert('La descripción no puede estar vacía.'); return; }
  if(!cuota){ alert('El número de cuota no puede estar vacío.'); return; }

  if(val.toUpperCase() === 'X'){
    finishPersona(true);
    return;
  }

  const n = Number(val);
  if(!Number.isInteger(n)){
    alert('Valor inválido: escribe un entero o "X" para terminar esta persona.');
    return;
  }

  state.personas[state.personaActual].push({ desc, cuota, valor: n });
  $('#desc').value = '';
  $('#cuota').value = '';
  $('#valor').value = '';
  $('#desc').focus();
  renderPersonaActual();
}

function finishPersona(fromX=false){
  if(!ensurePersonaActual()) return;

  if(fromX === false){
    // Si se presiona el botón "Terminar persona" sin 'X'
    // simplemente se cierra a esta persona y pregunta por otra.
  }

  const quiereOtra = confirm('¿Desea calcular para otra persona?');
  if(quiereOtra){
    // limpiar inputs y preparar nueva persona
    $('#persona').value = '';
    $('#desc').value = '';
    $('#cuota').value = '';
    $('#valor').value = '';
    state.personaActual = null;
    $('#persona').focus();
    renderPersonaActual();
  }else{
    renderResumenFinal();
    document.getElementById('resumenFinal').style.display = 'block';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
}

function nuevaPersona(){
  $('#persona').value = '';
  $('#desc').value = '';
  $('#cuota').value = '';
  $('#valor').value = '';
  state.personaActual = null;
  $('#persona').focus();
  renderPersonaActual();
}

function renderPersonaActual(){
  const titulo = $('#tituloPersonaActual');
  const cont   = $('#tablaActual');

  if(!state.personaActual){
    titulo.textContent = 'Sin persona seleccionada';
    cont.innerHTML = '<p class="empty">Aún no seleccionas una persona ni agregas ítems.</p>';
    return;
  }
  titulo.innerHTML = `Capturando datos para: <span class="badge">${state.personaActual}</span>`;

  const items = state.personas[state.personaActual] || [];
  if(items.length === 0){
    cont.innerHTML = '<p class="empty">Sin ítems aún para esta persona.</p>';
    return;
  }

  const total = items.reduce((acc, x) => acc + x.valor, 0);

  let rows = items.map(x => `
    <tr>
      <td>${x.desc}</td>
      <td>${x.cuota}</td>
      <td class="right">${formatMiles(x.valor)}</td>
    </tr>
  `).join('');

  cont.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Descripción</th>
          <th>Cuota</th>
          <th class="right">Valor</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="summary">
      <strong>Total persona</strong>
      <strong>${formatMiles(total)}</strong>
    </div>
  `;
}

function renderResumenFinal(){
  const cont = $('#resumenContenido');
  const personas = state.personas;
  const nombres = Object.keys(personas);

  if(nombres.length === 0 || nombres.every(n => (personas[n]||[]).length === 0)){
    cont.innerHTML = '<p class="empty">No se ingresaron datos.</p>';
    return;
  }

  let totalGeneral = 0;
  let html = '';

  for(const nombre of nombres){
    const items = personas[nombre] || [];
    html += `<h3>Suma para "${nombre}"</h3>`;
    if(items.length === 0){
      html += `<p class="empty">(sin ítems)</p>`;
      continue;
    }

    const totalPersona = items.reduce((acc, x) => acc + x.valor, 0);
    totalGeneral += totalPersona;

    const rows = items.map(x => `
      <tr>
        <td>${x.desc}</td>
        <td>${x.cuota}</td>
        <td class="right">${formatMiles(x.valor)}</td>
      </tr>
    `).join('');

    html += `
      <table class="table">
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Cuota</th>
            <th class="right">Valor</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="summary">
        <strong>Total persona</strong>
        <strong>${formatMiles(totalPersona)}</strong>
      </div>
    `;
  }

  html += `
    <div class="summary" style="border-top:2px solid var(--border); margin-top:16px">
      <strong>Total general</strong>
      <strong>${formatMiles(totalGeneral)}</strong>
    </div>
  `;

  cont.innerHTML = html;
}

function verResumen(){
  renderResumenFinal();
  document.getElementById('resumenFinal').style.display = 'block';
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

/* Listeners */
window.addEventListener('DOMContentLoaded', () => {
  $('#btnAdd').addEventListener('click', addItem);
  $('#btnFinish').addEventListener('click', () => finishPersona(false));
  $('#btnNew').addEventListener('click', nuevaPersona);
  $('#btnResumen').addEventListener('click', verResumen);

  // Enter para agregar desde el input valor
  $('#valor').addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){ addItem(); }
  });
});
