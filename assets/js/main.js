/* NordR Vask – meny, scroll-effekter og innsending av kontaktskjema. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* Topplinje og mobilmeny */
  var topbar = document.getElementById('topp');
  var meny = document.getElementById('menyknapp');
  var onScroll = function () { topbar.classList.toggle('scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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

  /* Mild inntoning av seksjoner som ligger under folden */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      else io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* Kontaktskjema */
  var form = document.getElementById('kontaktskjema');
  var takk = document.getElementById('takk');
  var feil = document.getElementById('skjema-feil');
  var send = document.getElementById('send');
  var sendTekst = send.querySelector('span');
  if (!form) return;

  var KEY = form.dataset.key || '';
  var MOTTAKER = 's-ruw@hotmail.no';
  form.elements.access_key.value = KEY;
  if (!KEY) {
    document.getElementById('send-hint').textContent = 'E-postprogrammet ditt åpnes med meldingen ferdig utfylt.';
  }

  function visFeil(tekst, felt) {
    feil.textContent = tekst;
    feil.hidden = false;
    if (felt) { felt.classList.add('ugyldig'); felt.focus(); }
  }
  function nullstillFeil() {
    feil.hidden = true;
    feil.textContent = '';
    form.querySelectorAll('.ugyldig').forEach(function (el) { el.classList.remove('ugyldig'); });
  }
  form.querySelectorAll('input, select, textarea').forEach(function (el) {
    el.addEventListener('input', function () { el.classList.remove('ugyldig'); });
  });

  function valider() {
    var navn = form.elements.name, epost = form.elements.email, kategori = form.elements.Gjelder, melding = form.elements.message;
    if (!navn.value.trim()) return visFeil('Skriv inn navnet ditt, så vet vi hvem vi svarer.', navn);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost.value.trim())) return visFeil('E-postadressen ser ikke riktig ut. Sjekk at den inneholder @ og et domene.', epost);
    if (!kategori.value) return visFeil('Velg hva henvendelsen gjelder.', kategori);
    if (melding.value.trim().length < 10) return visFeil('Fortell litt mer om hva du ønsker – gjerne adresse, størrelse og dato.', melding);
    return true;
  }

  function visTakk(data) {
    document.getElementById('takk-navn').textContent = data.navn ? data.navn.split(' ')[0] : 'vi har mottatt henvendelsen';
    document.getElementById('takk-tekst').textContent = 'Vi har mottatt henvendelsen din om ' + (data.kategori || 'vask').toLowerCase() + ' og svarer som regel samme dag.';
    document.getElementById('takk-epost').textContent = data.epost || '';
    form.hidden = true;
    takk.hidden = false;
    takk.focus();
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    nullstillFeil();
    if (valider() !== true) return;
    if (form.elements.botcheck.checked) return;

    var data = {
      navn: form.elements.name.value.trim(),
      epost: form.elements.email.value.trim(),
      telefon: form.elements.Telefon.value.trim(),
      kategori: form.elements.Gjelder.value,
      melding: form.elements.message.value.trim(),
      ring: form.elements['Ring meg'].checked
    };

    // Demo-modus (forhåndsvisning): vis takk-skjermen direkte
    if (form.dataset.demo === '1') { visTakk(data); return; }

    // Uten Web3Forms-nøkkel: åpne e-postprogrammet med meldingen ferdig utfylt
    if (!KEY) {
      var body = [
        'Navn: ' + data.navn,
        'E-post: ' + data.epost,
        'Telefon: ' + (data.telefon || '–'),
        'Gjelder: ' + data.kategori,
        'Ring meg: ' + (data.ring ? 'Ja' : 'Nei'),
        '',
        data.melding
      ].join('\n');
      location.href = 'mailto:' + MOTTAKER + '?subject=' + encodeURIComponent('Henvendelse: ' + data.kategori) + '&body=' + encodeURIComponent(body);
      visTakk(data);
      return;
    }

    send.disabled = true;
    sendTekst.textContent = 'Sender …';

    var fd = new FormData(form);
    fd.set('subject', 'Henvendelse: ' + data.kategori + ' – ' + data.navn);
    fd.delete('redirect');

    fetch(form.action, {
      method: 'POST',
      body: fd,
      headers: { 'Accept': 'application/json' }
    }).then(function (r) {
      return r.json().then(function (j) { return { ok: r.ok && j.success, j: j }; });
    }).then(function (res) {
      if (res.ok) {
        form.reset();
        form.elements.access_key.value = KEY;
        visTakk(data);
      } else {
        visFeil('Noe gikk galt ved sending. Prøv igjen, eller send oss en e-post direkte på ' + MOTTAKER + '.');
      }
    }).catch(function () {
      visFeil('Vi fikk ikke kontakt med serveren. Prøv igjen om et øyeblikk, eller send oss en e-post direkte på ' + MOTTAKER + '.');
    }).finally(function () {
      send.disabled = false;
      sendTekst.textContent = 'Send henvendelse';
    });
  });

  document.getElementById('ny-henvendelse').addEventListener('click', function () {
    takk.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });

})();
