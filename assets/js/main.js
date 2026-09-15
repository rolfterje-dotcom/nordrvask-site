/* NordR Vask – meny, språkvelger og kontaktskjema (mailto). */
(function () {
  'use strict';

  var MOTTAKER = 'kontakt@nordrvask.no';

  /* Mobilmeny */
  var topbar = document.getElementById('topp');
  var meny = document.getElementById('menyknapp');
  meny.addEventListener('click', function () {
    var open = topbar.classList.toggle('open');
    meny.setAttribute('aria-expanded', String(open));
    meny.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
  });
  topbar.querySelectorAll('nav a').forEach(function (a) {
    a.addEventListener('click', function () {
      topbar.classList.remove('open');
      meny.setAttribute('aria-expanded', 'false');
    });
  });

  /* Språkvelger – bare norsk foreløpig */
  var spraakKnapp = document.getElementById('spraakknapp');
  var spraakMeny = document.getElementById('spraakmeny');
  spraakKnapp.addEventListener('click', function (ev) {
    ev.stopPropagation();
    var open = spraakMeny.hidden;
    spraakMeny.hidden = !open;
    spraakKnapp.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function () {
    spraakMeny.hidden = true;
    spraakKnapp.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { spraakMeny.hidden = true; spraakKnapp.setAttribute('aria-expanded', 'false'); }
  });

  /* Kontaktskjema: «Send e-post» åpner e-postprogrammet med kategori og melding utfylt */
  var form = document.getElementById('kontaktskjema');
  var feil = document.getElementById('skjema-feil');
  var etter = document.getElementById('send-hint');
  var kategori = document.getElementById('kategori');
  var melding = document.getElementById('melding');

  function visFeil(tekst, felt) {
    feil.textContent = tekst;
    feil.hidden = false;
    felt.classList.add('ugyldig');
    felt.focus();
    felt.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  [kategori, melding].forEach(function (el) {
    el.addEventListener('input', function () { el.classList.remove('ugyldig'); feil.hidden = true; });
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    feil.hidden = true;
    if (!kategori.value) return visFeil('Velg hva henvendelsen gjelder.', kategori);
    if (melding.value.trim().length < 5) return visFeil('Skriv en kort melding – gjerne adresse, størrelse og ønsket dato.', melding);

    var body = melding.value.trim() + '\n\n– sendt fra nordrvask.no';
    window.location.href = 'mailto:' + MOTTAKER +
      '?subject=' + encodeURIComponent('Henvendelse: ' + kategori.value) +
      '&body=' + encodeURIComponent(body);
    etter.hidden = false;
  });
})();
