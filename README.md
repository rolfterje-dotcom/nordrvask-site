# nordrvask.no

Statisk nettside for NordR Vask, publisert med GitHub Pages på nordrvask.no.

- `index.html` – hele nettstedet
- `takk.html` – takk-side (brukes av skjemaet uten JavaScript)
- `assets/` – stil, skript, bilder
- `CNAME` – domenet Pages skal svare på

## Kontaktskjema

Skjemaet sendes via [Web3Forms](https://web3forms.com) når `data-key` på `<form id="kontaktskjema">` i
`index.html` inneholder en tilgangsnøkkel. Uten nøkkel åpnes besøkendes e-postprogram (mailto) med
meldingen ferdig utfylt. Mottakeradressen for mailto står som `MOTTAKER` i `assets/js/main.js`.

## Publisering

Alt på `main` publiseres automatisk av GitHub Pages i løpet av et minutt.
