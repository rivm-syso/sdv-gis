/******************** Algemene werking ******************************************************************************
 In drupal zijn er 2 velden (fields) die alle benodigde informatie bevatten:
 - gis_ia_params    Bevat een reeks aan parameters (zie gis_ia_default_parameters voor beschrijving)
 - gis_ia_layers    Bevat voor elke laag een aantal setting (zie gis_ia_default_row voor beschrijving)
 Na het laden van de pagina wordt er javascript afgevuurd die deze velden verbergt. Vervolgens wordt er nieuwe HTML
 gegenereerd zodat een redacteur alle benodigde parameters en layers op kan geven.
 Aanpassingen als volgt doorvoeren:
 1. Toevoegen nieuwe parameter:
 - Neem nieuwe parameter op in gis_ia_default_parameters en programmeer in deze file de invoer (edit-modus) er van.
 - Programmeer in de file 'gis_ia.js' het effect van de parameter.
 2. Uitbreiding van een bestaande parameter met een nieuwe waarde:
 - Neem nieuwe waarde in gis_ia_default_parameters op en programmeer in deze file de invoer (edit-modus) er van.
 - Programmeer in de file 'gis_ia.js' het effect van de nieuwe waarde.
 3. Parameter verwijderen
 - Verwijder de parameter uit gis_ia_default_parameters en haal uit deze file ook het invoer stuk (edit-modus).
 - Haal uit de file 'gis_ia.js' het geprogrammeerde effect van de parameter.
 4. Waarde van een parameter verwijderen
 - Hoog de dataversie op
 - In de reeds opgeslagen kaarten kan de verwijderde waarde worden gebruikt. Programmeer daarom in de file 'gis_ia.js' wat er moet gebeuren
 met deze waarde. Zo kun je programmeren dat deze wordt geconverteerd, of dat er een melding wordt gegeven. Zoek in gis_ia.js op: Omgaan met verouderde data
 Voer wijzigingen ook door in CHANGELOG.md
 ********************************************************************************************************************/

/*
  zoek gis_ia_params en vervang door gis_ia_params
  zoek gis_ia_layers en vervang door gis_ia_layers
  zoek '.js-form-item-name-0-value.form-item-name-0-value' en vervang door '.js-form-item-name-0-value.form-item-name-0-value'

*/

/******************** Layer-definitie **************************************/
var gis_ia_default_row = [
  'URL',                    				// 0=type
  '',  								// 1=server
  '',                      				// 2=laag
  '',                      				// 3=laagnaam
  '1',                    					// 4=opacity
  '1',                    					// 5=toon features (0=Nee, 1=Als laag aan staat, 2= Altijd)
  '',                      				// 6=veld-definities
									// veld=Label^eenheid^align-right[,veld=^^^^...]
  '1'									// 7=initial visibility
];

/***************** Default parameters ******************************/
var gis_ia_default_parameters = {
  'dataversie': 0,   // dataversie (altijd integer) ophogen als deze niet meer
                     // compatible is met een vorige versie.
  // Formaat en uiterlijk
  'fl': 0,      // Floating, 0=geen, 1=links, 2=rechts
  // Basiskaarten
  'b': '10000',     // basiskaarten: Openbasiskaart, Openbasiskaart grijs,
                    // Openbasiskaart pastel, Luchtfoto, Topografisch
  'l': '1101101',    // positie 0: Toon layer (Nee, boven, onder)
  // positie 1: 1 of alle lagen selecteerbaar (radio /checkbox)
  // positie 2: Wel/geen opacity slider
  // positie 3: Download knop NL
  // positie 4: Download Bounding Box
  // positie 5: Wel/geen data.rivm.nl knop
  // positie 6: Wel/geen legenda
  'o': '000',     // Overlaykaarten: Voor elke overlay een positie met 0=Nee,
                  // 1=Ja
  // positie 0: NL schaduw
  // positie 1: Provinciegrenzen
  // Positie 2: Gemeentegrenzen
  // Knoppen en overige controls
  'p': 0,        // Links boven: Position search
  'pz': 10,      // Zoom after position search
  'z': 0,        // Rechts boven: Zoom-knoppen
  'e': 0,        // Rechts boven: Zoom-extend
  'f': 0,        // Rechts boven: Full-screen
  'l1': 0,      // Links onder: Legenda
  'sb': 0,      // Links onder: Scalebar
  'c': 0,        // Links onder: Coordinaten
  'ts': 0,      // Rechts onder: Timeslider
  'i': 2000,      // Rechts onder: Timeslider interval
  // Data weergave
  'm': '',      // Melding indien er geen data is gevonden
  'w1': 0,      // Toon data window, 0=Rechts boven klik binnen de kaart,
                // 1=Indien mogelijk onder de klik en 'over' de pagina
  'w2': 1,      // Data weergave (tonen van layers en feautures)
  'tl': 0,      // Toon laagnaam bij tonen features
  // Filtering
  'fs': '',      // Filter definities
  // Panel
  'pw': '14',      // positie 0: Sliding: 0=Binnen de kaart, 1=Links van de
                   // kaart
  // positie 1: breedte 0=180px ... 6=300px    Let op, dit wordt ook gebruikt in gis_ia.js!!!
  // layer data
  'ld': '',      // Deze parameter wordt in gis_ia.module achter de 'echte'
                 // parameters geplakt en bevat alle layer-data!!!
  // Overig
  'tmp': '0',      // Tijdelijk:
  // Positie 0: Lees layers van data.rivm.nl opnieuw
};

// Variabele die dialoog-boxen bevat om per type layer te kunnen zoeken naar
// een beschikbare laag.
var gis_ia_modals = [];

// Functie die de huidige waarde van een parameter geeft, of (in geval:
// parameter-positie) de waarde op een bepaalde positie Return:  waarde van de
// parameter, of waarde van de parameter op een bebaaplde positie, of een lege
// string als de waarde niet bestaat
function gis_ia_getParmValue(parm) {
  var parmsplit = parm.split('-'), r,
      body = jQuery('#edit-gis-ia-params-0-value'), regels = body.val(), t, pos,
      v;
  if (regels == '') {
    regels = [];
  }
  else {
    regels = regels.replace(/[\r\n]+/g, "\r");
    regels = regels.replace(/\n+/g, "\r");
    regels = regels.split("\r");
  }
  for (t = 0; t < regels.length; t++) {
    pos = regels[t].indexOf('=');
    if (regels[t].substr(0, pos) == parmsplit[0]) {
      v = regels[t].substr(pos + 1);
      if (parmsplit.length == 2) {
        r = v.substr(parseInt(parmsplit[1], 10), 1);
      }
      else {
        r = v;
      }
      return r;
    }
  }
  return '';
}

// Functies die informatie tonen/verbergen o.b.v. de waarde van een parameter
// Deze functies worden bij initialisatie aangeroepen en bij de onchange-event
// van een parameter; Zie de functie gis_ia_change()
function gis_ia_show_hide() {
  if (gis_ia_getParmValue('p') == 1) {
    jQuery('#gis_ia_pz_div').show();
  }
  else {
    jQuery('#gis_ia_pz_div').hide();
  }
  if (gis_ia_getParmValue('l-0') != 0) {
    jQuery('.gis_ia_l_1').show();
  }
  else {
    jQuery('.gis_ia_l_1').hide();
  }
  if (gis_ia_getParmValue('l-3') != 0) {
    jQuery('.gis_ia_l_4').show();
  }
  else {
    jQuery('.gis_ia_l_4').hide();
  }
  if (gis_ia_getParmValue('ts') >= 1) {
    jQuery('.gis_ia_ts_1').show();
  }
  else {
    jQuery('.gis_ia_ts_1').hide();
  }
}

// Deze functie zorgt er voor dat bij elke wijziging door de redacteur, het
// gis_ia_params-veld meteen een update krijgt. Elke aanpassing in de
// gegenereerde HTML wordt zo direct doorgevoerd in het verborgen veld, zodat
// als de redacteur op 'Opslaan' drukt, de juiste informatie wordt opgeslagen.
// De functie houdt rekening met gewone parameters en de parameter-positie
// variant. Deze staat in het attribuut 'gis_ia' van het element dat het
// onchange-event afvuurt (this).
function gis_ia_change() {
  var el = jQuery(this), parameter = el.attr('gis_ia'), v;
  if (el.prop('type') == 'checkbox') {
    v = (el.prop('checked') ? '1' : '0');
  }
  else {
    v = el.val();
  }
  gis_ia_change_regel(parameter, v);
}

function gis_ia_change_regel(parameter, v) {
  var parmsplit = parameter.split('-'),
      body = jQuery('#edit-gis-ia-params-0-value'), regels = body.val(), t,
      regel, pos, old_value, parm;
  if (regels == '') {
    regels = [];
  }
  else {
    regels = regels.replace(/[\r\n]+/g, "\r");
    regels = regels.replace(/\n+/g, "\r");
    regels = regels.split("\r");
  }
  for (t = 0, regel = regels.length; t < regels.length; t++) {
    pos = regels[t].indexOf('=');
    if (pos >= 1 && regels[t].substr(0, pos) == parmsplit[0]) {
      regel = t;
      parm = regels[t].substr(0, pos);
      t = regels.length;
    }
  }
  if (parmsplit.length == 2) { // samengestelde parameter
    var parmsplitno = parseInt(parmsplit[1], 10);
    if (regel >= regels.length || regels[regel] == '') {
      old_value = '';
    }
    else {
      old_value = regels[regel].substr(parm.length + 1);
    }
    while (old_value.length < parmsplitno) {
      old_value += ' ';
    }
    v += '0';
    v = v.substr(0, 1);
    regels[regel] = parmsplit[0] + '=' + old_value.substr(0, parmsplitno) + v + old_value.substr(parmsplitno + 1);
  }
  else {
    regels[regel] = parameter + '=' + v;
  }
  body.val(regels.join("\r"));
  gis_ia_show_hide();
}

// Functie die alle benodigde HTML genereert om layers te defini"eren
// (muteren/toevoegen/verwijderen/volgorde) De functie returnt een string.
function gis_ia_getLayerDefs() {
  var layer_defs = jQuery('#edit-gis-ia-layers-0-value'), t = layer_defs.val();
  t = t.replace(/[\r\n]+/g, "\r");
  t = t.replace(/\n+/g, "\r");
  t = t.split("\r");
  var tbl = '<div id="gis_ia_div"><table class="field-multiple-table responsive-enabled"><thead><tr><th>Pos.</th><th>Type</th><th>Layer</th><th>Layernaam (in Drupal)</th><th>Opacity</th><th>Data<sup>*</sup></th><th>Vis<sup>**</sup></th><th>Features</th><th></th><th></th></tr></thead><tbody>',
      t1;
  for (t1 = 0; t1 < t.length; t1++) {
    if (t[t1] != '') {
      tbl += gis_ia_row(t1, t[t1].split('|'), t.length + (t[t.length - 1] == '' ? -1 : 0));
    }
  }
  tbl += '</tbody></table><div style="margin-top:12px;"><sup>*</sup> Toon features ook als laag uit staat.</div><div><sup>**</sup> Initial visibility</div>';
  tbl += '<input onclick="gis_ia_add();" type="button" value="Layer-definitie toevoegen" class="button js-form-submit form-submit" style="margin: 12px 0 20px 0;">';
  tbl += '</div>';
  return tbl;
}

// Deze functie plaatst de juiste layer-HTML (opnieuw) in de pagina.
function gis_ia_redrawLayerDefsTable() {
  jQuery('#gis_ia_layer_defs').html(gis_ia_getLayerDefs());
}

// Functie die alle benodigde HTML genereert om filters te defini"eren
// (muteren/toevoegen/verwijderen/volgorde) De functie returnt een string.
var gis_ia_fieldsOnServer;

function gis_ia_setFieldsOnServer() {
  gis_ia_fieldsOnServer = [];
  var layer_defs = jQuery('#edit-gis-ia-layers-0-value'), t = layer_defs.val(),
      t1, t2 = 0;
  t = t.replace(/[\r\n]+/g, "\r");
  t = t.replace(/\n+/g, "\r");
  t = t.split("\r");
  for (t1 = 0; t1 < t.length; t1++) {
    if (t[t1] != '') {
      gis_ia_fieldsOnServer[t2] = false;
      gis_ia_veld(t1, true);
      t2++;
    }
  }
}

function gis_ia_setFieldsOnServer_(no, data) {
  var t = 0;
  data = data.features;
  gis_ia_fieldsOnServer[no] = [];
  for (var ft = 0; ft < data.length; ft++) {
    for (var key in data[ft].properties) {
      gis_ia_fieldsOnServer[no][t] = key;
      t++;
    }
  }
  for (var t = 0, t1 = 0; t < gis_ia_fieldsOnServer.length; t++) {
    if (gis_ia_fieldsOnServer[t] !== false) {
      t1++;
    }
  }
  if (t1 == gis_ia_fieldsOnServer.length) {
    // Op dit punt bevat gis_ia_fieldsOnServer voor elke layer de velden zoals
    // deze op de server bekend zijn als er een veld in de parameter fl niet
    // voorkomt in gis_ia_fieldsOnServer dan wordt deze hier verwijdert
    var fs = gis_ia_getFilterArray(), t2, t3, a, pos, msg = '';
    for (t2 = fs.length - 1; t2 >= 0; t2--) {
      if (fs[t2].t == 'g') { // groep
        for (t3 = fs[t2].e.length - 1; t3 >= 0; t3--) { // voor elk element
          if (typeof (fs[t2].e[t3].f) != 'undefined') { // f => dus veld (in groep)
            a = gis_ia_fieldsOnServer[fs[t2].e[t3].l];
            if (typeof (a) == 'undefined') {
              pos = -1;
            }
            else {
              pos = a.indexOf(fs[t2].e[t3].f);
            }
            if (pos == -1) {
              msg += String.fromCharCode(13) + '- ' + fs[t2].e[t3].f;
              fs[t2].e.splice(t3, 1);
              changed = true;
            }
          }
        }
      }
      else {
        if (typeof (fs[t2].f) != 'undefined') { // f => dus veld
          a = gis_ia_fieldsOnServer[fs[t2].l];
          if (typeof (a) == 'undefined') {
            pos = -1;
          }
          else {
            pos = a.indexOf(fs[t2].f);
          }
          if (pos == -1) {
            msg += String.fromCharCode(13) + '- ' + fs[t2].f;
            fs.splice(t2, 1);
            changed = true;
          }
        }
      }
    }
    gis_ia_setFilterArray(fs);
    gis_ia_redrawFilterDefsTable();
    if (msg != '') {
      alert('De volgende velden bestaan niet meer in de kaartlaag:' + msg);
    }
  }
}

function gis_ia_getFilterArray() {
  var fs = gis_ia_getParmValue('fs'), fa = [];
  if (fs != '') {
    fs = gis_ia_Base64.decode(fs);
    fa = eval(fs);
  }
  return fa;
}

function gis_ia_setFilterArray(fa) {
  if (typeof (fa) != 'object') {
    fa = [];
  }
  fs = JSON.stringify(fa);
  fs = gis_ia_Base64.encode(fs);
  gis_ia_change_regel('fs', fs);
}

// Deze functie plaatst de juiste filter-HTML (opnieuw) in de pagina.
function gis_ia_getFilterDefTableItem(f, i, opts) {
  var ia = ('' + i).split('.'),
      inspringen = 'padding-left:' + (54 * (ia.length - 1)) + 'px;';
  var t,
      s = '<tr><td style="white-space: nowrap; ' + inspringen + '">' + gis_ia_getSelect(opts, i, 'gis_ia_filter_volgorde(this,\'' + i + '\');') + '</td>';
  switch (f.t) {
    case 'a': // header
      s += '<td>Tekst</td><td><input value="' + f.v + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'v\');"></td><td></td><td><input type="button" onclick="gis_ia_toggle_filters(this);" value=" &uarr; &darr; "></td><td></td><td><div class="gis_ia_hideable">' + gis_ia_getSelect(['t=Tekst', 'h2=Header 2', 'h3=Header 3', 'h4=Header 4'], f.s, 'gis_ia_set_filterItem(this,\'' + i + '\',\'s\');') + '</div></td><td><input onclick="gis_ia_del_filter(\'' + i + '\');" type="button" value="Verwijder" class="button js-form-submit form-submit"></td></tr>';
      break;
    case 'g': // groep
      s += '<td>Groep</td><td><input value="' + f.w + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'w\');"></td><td></td><td><input type="button" onclick="gis_ia_toggle_filters(this);" value=" &uarr; &darr; "></td><td><div class="gis_ia_hideable">Soort:&nbsp;&nbsp;&nbsp;&nbsp;' + gis_ia_getSelect(['of=Or', 'en=And'], f.s, 'gis_ia_set_filterItem(this,\'' + i + '\',\'s\');') + '</div></td><td><div class="gis_ia_hideable">' + gis_ia_getSelect(['0=In place', '1=As submenu'], f.b, 'gis_ia_set_filterItem(this,\'' + i + '\',\'b\');', (('' + i).indexOf('.') >= 1 ? 'style="display: none;"' : '')) + '</div></td><td><input onclick="gis_ia_del_filter(\'' + i + '\');" type="button" value="Verwijder" class="button js-form-submit form-submit"></td></tr>';
      for (t = 0; t < f.e.length; t++) {
        s += gis_ia_getFilterDefTableItem(f.e[t], i + '.' + (t + 1), opts);
      }
      break;
    case 'c': // checkbox
      var a = [], t, t1;
      for (t = 0; t < gis_ia_fieldsOnServer.length; t++) {
        for (t1 = 0; t1 < gis_ia_fieldsOnServer[t].length; t1++) {
          a[a.length] = t + '.' + gis_ia_fieldsOnServer[t][t1] + '=' + (t + 1) + ' ' + gis_ia_fieldsOnServer[t][t1];
        }
      }
      s += '<td>Checkbox</td>';
      s += '<td><input value="' + f.v + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'v\');"></td><td><input type="button" onclick="gis_ia_toggle_filters(this);" value=" &uarr; &darr; "></td>';
      s += '<td><div class="gis_ia_hideable">';
      s += gis_ia_getSelect(a, f.l + '.' + f.f, 'gis_ia_set_filterItem(this,\'' + i + '\',\'f\');') + '&nbsp;';
      s += gis_ia_getSelect(['0==', '1=<', '2=<=', '3=>', '4=>=', '5=<>'], f.s, 'gis_ia_set_filterItem(this,\'' + i + '\',\'s\');') + '&nbsp;';
      s += '</div></td><td><div class="gis_ia_hideable">Waarde: <input value="' + f.w + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'w\');" size="6"></td><td style="white-space: nowrap;"><input type="checkbox" ' + (f.x0 == '1' ? 'checked="checked" ' : '') + 'onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'x0\');" id="gis_ia_f_' + i + 'x0"><label for="gis_ia_f_' + i + 'x0"> X-button bovenaan</label><br><input type="checkbox"' + (f.x1 == '1' ? 'checked="checked" ' : '') + 'onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'x1\');" id="gis_ia_f_' + i + 'x1"><label for="gis_ia_f_' + i + 'x1"> X-button in hoofdgroep</label><br><input type="checkbox"' + (f.x2 == '1' ? 'checked="checked" ' : '') + 'onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'x2\');" id="gis_ia_f_' + i + 'x2"><label for="gis_ia_f_' + i + 'x2"> X-button in place</label>';
      s += '</div></td><td><input onclick="gis_ia_del_filter(\'' + i + '\');" type="button" value="Verwijder" class="button js-form-submit form-submit"></td></tr>';
      break;
    case 'd': // list
      var a = [], t, t1;
      for (t = 0; t < gis_ia_fieldsOnServer.length; t++) {
        for (t1 = 0; t1 < gis_ia_fieldsOnServer[t].length; t1++) {
          a[a.length] = t + '.' + gis_ia_fieldsOnServer[t][t1] + '=' + (t + 1) + ' ' + gis_ia_fieldsOnServer[t][t1];
        }
      }
      s += '<td>List</td>';
      s += '<td><input value="' + f.l0 + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'l0\');"></td>';
      s += '<td>';
      s += gis_ia_getSelect(a, f.l + '.' + f.f, 'gis_ia_set_filterItem(this,\'' + i + '\',\'f\');') + '&nbsp;' + gis_ia_getSelect(['0==', '1=range'], f.o, 'gis_ia_set_filterItem(this,\'' + i + '\',\'o\');');
      s += '</td><td><input type="button" onclick="gis_ia_toggle_filters(this);" value=" &uarr; &darr; "></td><td><div class="gis_ia_hideable">';
      s += '<div style="display: inline-block;">Waarden<br><textarea rows="6" cols="20" placeholder="' + "'='\t\t1\n\t\t2\n\t\t3\n'range'\t<20\n\t\t>=20 <70\n\t\t>=70" + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'w\');">' + f.w + '</textarea></div>&nbsp;';
      s += '<div style="display: inline-block;">Labels<br><textarea rows="6" cols="20" placeholder="' + "'='\t\tWonen\n\t\tAgrarisch\n\t\tIndustrie\n'range'\tJong\n\t\tGemiddeld\n\t\tOud" + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'v\');">' + f.v + '</textarea></div></div></td>';
      s += '<td><div class="gis_ia_hideable">' + gis_ia_getSelect(['0=Selectbox', '1=Radio buttons', '3=Checkboxes'], f.s, 'if (jQuery(this).val()==\'0\') {jQuery(jQuery(jQuery(this).parent()).children()[1]).show();} else {jQuery(jQuery(jQuery(this).parent()).children()[1]).hide();} gis_ia_set_filterItem(this,\'' + i + '\',\'p\'); gis_ia_set_filterItem(this,\'' + i + '\',\'s\');');
      s += '<div style="margin-top: 12px;' + (f.s == '0' ? '' : 'display: none;') + '">Placeholder: <input size="10" value="' + f.p + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'p\');"></div>';
      s += '<div style="margin-top: 12px;"><input type="checkbox" ' + (f.x0 == '1' ? 'checked="checked" ' : '') + 'onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'x0\');" id="gis_ia_f_' + i + 'x0"><label for="gis_ia_f_' + i + 'x0"> X-button bovenaan</label><br><input type="checkbox"' + (f.x1 == '1' ? 'checked="checked" ' : '') + 'onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'x1\');" id="gis_ia_f_' + i + 'x1"><label for="gis_ia_f_' + i + 'x1"> X-button in hoofdgroep</label><br><input type="checkbox"' + (f.x2 == '1' ? 'checked="checked" ' : '') + 'onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'x2\');" id="gis_ia_f_' + i + 'x2"><label for="gis_ia_f_' + i + 'x2"> X-button in place</label></div>';
      s += '</div></td><td><input onclick="gis_ia_del_filter(\'' + i + '\');" type="button" value="Verwijder" class="button js-form-submit form-submit"></td></tr>';
      break;
    case 'vt': // van - tot
      var a = [], t, t1;
      for (t = 0; t < gis_ia_fieldsOnServer.length; t++) {
        for (t1 = 0; t1 < gis_ia_fieldsOnServer[t].length; t1++) {
          a[a.length] = t + '.' + gis_ia_fieldsOnServer[t][t1] + '=' + (t + 1) + ' ' + gis_ia_fieldsOnServer[t][t1];
        }
      }
      s += '<td>Numeriek</td>';
      s += '<td><input value="' + f.l0 + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'l0\');"></td>';
      s += '<td>';
      s += gis_ia_getSelect(a, f.l + '.' + f.f, 'gis_ia_set_filterItem(this,\'' + i + '\',\'f\');') + '&nbsp;' + gis_ia_getSelect(['0=van <= N < tot', '1=van < N <= tot', '2=van <= N <= tot', '3=van < N < tot'], f.w, 'gis_ia_set_filterItem(this,\'' + i + '\',\'w\');');
      s += '</td><td><input type="button" onclick="gis_ia_toggle_filters(this);" value=" &uarr; &darr; "></td><td><div class="gis_ia_hideable">';
      s += '<div><b>Van</b></div>';
      s += '<div style="display: inline-block;"><div style="display: inline-block; width: 40px;">Min:</div><input style="width: 50px;" value="' + f.mi1 + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'mi1\');"></div>';
      s += '<div style="display: inline-block;margin-left: 12px;"><div style="display: inline-block; width: 40px;">Max:</div><input style="width: 50px;" value="' + f.ma1 + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'ma1\');"></div>';
      s += '<div style="display: inline-block;margin-left: 12px;"><div style="display: inline-block; width: 40px;">Stap:</div><input style="width: 50px;" value="' + f.st1 + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'st1\');"></div>';
      s += '<div style="margin-top: 12px;"><div style="display: inline-block; width: 60px;">Of lijst:</div><textarea style="width: 160px;" rows="6" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'l1\');">' + f.l1 + '</textarea></div>';
      s += '<div><b>Tot</b></div>';
      s += '<div style="display: inline-block;"><div style="display: inline-block; width: 40px;">Min:</div><input style="width: 50px;" value="' + f.mi2 + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'mi2\');"></div>';
      s += '<div style="display: inline-block;margin-left: 12px;"><div style="display: inline-block; width: 40px;">Max:</div><input style="width: 50px;" value="' + f.ma2 + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'ma2\');"></div>';
      s += '<div style="display: inline-block;margin-left: 12px;"><div style="display: inline-block; width: 40px;">Stap:</div><input style="width: 50px;" value="' + f.st2 + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'st2\');"></div>';
      s += '<div style="margin-top: 12px;"><div style="display: inline-block; width: 60px;">Of lijst:</div><textarea style="width: 160px;" rows="6" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'l2\');">' + f.l2 + '</textarea></div>';
      s += '</div></td><td style="white-space: nowrap;"><div class="gis_ia_hideable">';
      s += '<div style="margin-bottom: 12px;">Placeholder van: <input size="10" value="' + f.v1 + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'v1\');"></div>';
      s += '<div style="margin-bottom: 12px;">Placeholder t/m: <input size="10" value="' + f.v2 + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'v2\');"></div>';
      s += '<input type="checkbox" ' + (f.x0 == '1' ? 'checked="checked" ' : '') + 'onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'x0\');" id="gis_ia_f_' + i + 'x0"><label for="gis_ia_f_' + i + 'x0"> X-button bovenaan</label><br><input type="checkbox"' + (f.x1 == '1' ? 'checked="checked" ' : '') + 'onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'x1\');" id="gis_ia_f_' + i + 'x1"><label for="gis_ia_f_' + i + 'x1"> X-button in hoofdgroep</label><br><input type="checkbox"' + (f.x2 == '1' ? 'checked="checked" ' : '') + 'onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'x2\');" id="gis_ia_f_' + i + 'x2"><label for="gis_ia_f_' + i + 'x2"> X-button in place</label>';
      s += '</div></td><td><input onclick="gis_ia_del_filter(\'' + i + '\');" type="button" value="Verwijder" class="button js-form-submit form-submit"></td></tr>';
      break;
    case 'i': // vrije tekst
      var a = [], t, t1;
      for (t = 0; t < gis_ia_fieldsOnServer.length; t++) {
        for (t1 = 0; t1 < gis_ia_fieldsOnServer[t].length; t1++) {
          a[a.length] = t + '.' + gis_ia_fieldsOnServer[t][t1] + '=' + (t + 1) + ' ' + gis_ia_fieldsOnServer[t][t1];
        }
      }
      s += '<td>Vrije tekst</td>';
      s += '<td><input value="' + f.v + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'v\');"></td>';
      s += '<td>';
      s += gis_ia_getSelect(a, f.l + '.' + f.f, 'gis_ia_set_filterItem(this,\'' + i + '\',\'f\');') + '&nbsp;';
      s += gis_ia_getSelect(['0==', '1=like'], f.s, 'gis_ia_set_filterItem(this,\'' + i + '\',\'s\');') + '&nbsp;';
      s += '</td><td><input type="button" onclick="gis_ia_toggle_filters(this);" value=" &uarr; &darr; "></td><td></td><td><div style="white-space: nowrap;" class="gis_ia_hideable">Placeholder: <input value="' + f.p + '" onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'p\');"><br><input type="checkbox" ' + (f.x0 == '1' ? 'checked="checked" ' : '') + 'onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'x0\');" id="gis_ia_f_' + i + 'x0"><label for="gis_ia_f_' + i + 'x0"> X-button bovenaan</label><br><input type="checkbox"' + (f.x1 == '1' ? 'checked="checked" ' : '') + 'onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'x1\');" id="gis_ia_f_' + i + 'x1"><label for="gis_ia_f_' + i + 'x1"> X-button in hoofdgroep</label><br><input type="checkbox"' + (f.x2 == '1' ? 'checked="checked" ' : '') + 'onchange="gis_ia_set_filterItem(this,\'' + i + '\',\'x2\');" id="gis_ia_f_' + i + 'x2"><label for="gis_ia_f_' + i + 'x2"> X-button in place</label></div>';
      s += '</td><td><input onclick="gis_ia_del_filter(\'' + i + '\');" type="button" value="Verwijder" class="button js-form-submit form-submit"></td></tr>';
      break;
    default: // foutje :-)
      s += '<td>Foutje :-)</td></tr>';
      break;
  }
  return s;
}

var gis_ia_toggle_filters_ = false;

function gis_ia_toggle_filters(el) {
  if (typeof (el) != 'undefined') {
    var els = jQuery(jQuery(jQuery(el).parent()).parent()).children(), t;
    for (t = 0; t < els.length; t++) {
      jQuery(els[t]).find('.gis_ia_hideable').toggle();
    }
  }
  else {
    if (gis_ia_toggle_filters_) {
      jQuery('.gis_ia_hideable').show();
      gis_ia_toggle_filters_ = false;
    }
    else {
      jQuery('.gis_ia_hideable').hide();
      gis_ia_toggle_filters_ = true;
    }
  }
}

function getFilterDefTableItemPos(f, prepos) {
  var t, r = ',' + prepos;
  if (f.t == 'g') {
    for (t = 0; t < f.e.length; t++) {
      r += getFilterDefTableItemPos(f.e[t], prepos + '.' + (t + 1));
    }
    r += ',' + prepos + '.' + (t + 1);
  }
  return r;
}

function gis_ia_redrawFilterDefsTable() {
  var hfd_options = '<option value="">Voeg filter toe</option><option value="a">Tekst</option><option value="c">Checkbox</option><option value="d">List</option><option value="vt">Numeriek</option><option value="i">Vrije tekst</option><option value="g">Groep</option>';
  var fs = gis_ia_getFilterArray(), t, t1, opts = '';
  for (t = 0, t1 = fs.length; t < t1; t++) {
    opts += getFilterDefTableItemPos(fs[t], t + 1);
  }
  opts = opts.substr(1).split(',');
  var tbl = '<table class="field-multiple-table responsive-enabled"><thead><tr><th>Pos.</th><th>Type</th><th>Label(s)</th><th>Veld / Operator</th><th><input type="button" onclick="gis_ia_toggle_filters();" value=" &uarr; &darr; "></th><th>Definitie</th><th>Weergave</th><th></th></tr></thead><tbody>';
  for (t = 0, t1 = fs.length; t < t1; t++) {
    tbl += gis_ia_getFilterDefTableItem(fs[t], t + 1, opts);
  }
  tbl += '</tbody></table>';
  tbl += '<select onchange="gis_ia_add_filter(this,-1);" class="button" style="margin-top: 32px;">' + hfd_options + '</select>';
//  tbl+='<div class="dropbutton-wrapper dropbutton-multiple"><div
// class="dropbutton-widget"><ul class="dropbutton"><li class="edit
// dropbutton-action"><a
// href="/drupal/node/3/edit?destination=/drupal/admin/content"
// hreflang="en">Edit</a></li><li class="dropbutton-toggle"><button
// type="button"><span class="dropbutton-arrow"><span
// class="visually-hidden">List additional
// actions</span></span></button></li><li class="delete dropbutton-action
// secondary-action"><a
// href="/drupal/node/3/delete?destination=/drupal/admin/content"
// hreflang="en">Delete</a></li></ul></div></div>';
  jQuery('#gis_ia_div2').html(tbl);
//  Drupal.behaviors.dropButton.attach(jQuery('#gis_ia_div2'),{});
}

function gis_ia_del_filter(i) {
  var fs = gis_ia_getFilterArray(), e, t;
  i = i.split('.');
  if (i.length == 1) { // verwijder hoofditem
    fs.splice(parseInt(i[0], 10) - 1, 1);
  }
  else { // verwijder subitem
    e = fs[parseInt(i[0], 10) - 1];
    for (t = 1; t < i.length - 2; t++) {
      e = e.e[parseInt(i[t], 10) - 1];
    }
    e.e.splice(parseInt(i[t], 10) - 1, 1);
  }
  gis_ia_setFilterArray(fs);
  gis_ia_redrawFilterDefsTable();
}

function gis_ia_filter_volgorde(e, from_no) {
  var fs = gis_ia_getFilterArray(), to_no = jQuery(e).val(), from_e, to_e, t,
      from_e_pos, to_e_pos;
  if (to_no != from_no) {
    from_no = from_no.split('.');
    if (from_no.length == 1) {
      from_e = fs;
      from_e_pos = parseInt(from_no[0], 10) - 1;
    }
    else {
      from_e = fs[parseInt(from_no[0], 10) - 1].e;
      for (t = 1; t < from_no.length - 1; t++) {
        from_e = from_e[parseInt(from_no[t], 10) - 1].e;
      }
      from_e_pos = parseInt(from_no[from_no.length - 1], 10) - 1;
    }
    to_no = to_no.split('.');
    if (to_no.length == 1) {
      to_e = fs;
      to_e_pos = parseInt(to_no[0], 10) - 1;
    }
    else {
      to_e = fs[parseInt(to_no[0], 10) - 1].e;
      for (t = 1; t < to_no.length - 1; t++) {
        to_e = to_e[parseInt(to_no[t], 10) - 1].e;
      }
      to_e_pos = parseInt(to_no[to_no.length - 1], 10) - 1;
    }
    // als je in dezelfde groep zit (of fs zelf) en de from_e_pos < to_e_pos
    // dan moet de to_e_pos met 1 worden verlaagt omdat er een splice vooraf
    // plaats vindt.
    var same_group = true;
    if (from_no.length == to_no.length) {
      for (t = 0; t < from_no.length - 1; t++) {
        if (from_no[t] != to_no[t]) {
          same_group = false;
        }
      }
    }
    else {
      same_group = false;
    }
    //if (same_group && from_e_pos < to_e_pos) {to_e_pos--;}
    e = from_e.splice(from_e_pos, 1)[0];
    to_e.splice(to_e_pos, 0, e);
    gis_ia_setFilterArray(fs);
    gis_ia_redrawFilterDefsTable();
  }
}

function gis_ia_add_filter(e, no) {
  var fs = gis_ia_getFilterArray(), elm, layer = 0;
  switch (jQuery(e).val()) {
    case 'g':
      elm = {'t': 'g', 's': 'of', 'w': '', 'e': [], 'b': '0'};
      break;
    case 'a':
      elm = {'t': 'a', 'v': '', 's': 'h2'};
      break;
    case 'c':
      elm = {
        't': 'c',
        'v': '',
        's': '0',
        'l': layer,
        'f': gis_ia_fieldsOnServer[layer][0],
        'w': '',
        'x0': '1',
        'x1': '0',
        'x2': '1'
      };
      break;
    case 'd':
      elm = {
        't': 'd',
        'v': '',
        's': '0',
        'l0': '',
        'p': '',
        'l': layer,
        'f': gis_ia_fieldsOnServer[layer][0],
        'w': '',
        'o': '0'
      };
      break;
    case 'vt':
      elm = {
        't': 'vt',
        'v1': '',
        'v2': '',
        'l0': '',
        'p': '',
        'l': layer,
        'f': gis_ia_fieldsOnServer[layer][0],
        'w': '',
        'mi1': '',
        'mi2': '',
        'ma1': '',
        'ma2': '',
        'st1': '',
        'st2': '',
        'l1': '',
        'l2': ''
      };
      break;
    case 'i':
      elm = {
        't': 'i',
        'v': '',
        's': '0',
        'p': '',
        'l': layer,
        'f': gis_ia_fieldsOnServer[layer][0],
        'w': '',
        'x0': '1',
        'x1': '0',
        'x2': '1'
      };
      break;
    default:
      alert('Pas op: filter type \'' + e + '\' niet gedefinieerd');
      break;
  }
  if (no == -1) { // add hoofditem
    fs[fs.length] = elm;
  }
  else { // add subitem
    fs[no].e[fs[no].e.length] = elm;
  }
  gis_ia_setFilterArray(fs);
  gis_ia_redrawFilterDefsTable();
}

function gis_ia_set_filterItem_(e, parm, v) {
  if (parm == 'f') {
    var pos = v.indexOf('.');
    if (pos >= 1) {
      e.f = v.substr(pos + 1);
      e.l = parseInt(v.substr(0, pos), 10);
    }
    else {
      e.f = v;
      alert('Fout in gis_ia_set_filterItem_');
    }
  }
  else {
    eval('e.' + parm + '=v');
  }
}

function gis_ia_set_filterItem(e, i, parm) {
  var v = jQuery(e).val(), fs = gis_ia_getFilterArray(), t;
  switch (jQuery(e).attr('type')) {
    case 'checkbox':
      if (jQuery(e).prop('checked')) {
        v = '1';
      }
      else {
        v = '0';
      }
      break;
  }
  i = i.split('.');
  e = fs[parseInt(i[0], 10) - 1];
  for (t = 1; t < i.length; t++) {
    e = e.e[parseInt(i[t], 10) - 1];
  }
  gis_ia_set_filterItem_(e, parm, v);
  gis_ia_setFilterArray(fs);
}

// Deze functie verbergt de textareas waarin de data is opgeslagen en toont in
// plaats daarvan een interactieve tabel en voert alle benodigde initialisatie
// uit.
function gis_ia_init() {

  // Maak dialog-box voor WMS
  var wms = drupalSettings.gis_ia.wms.split('|'), t1, s1;
  var wmsDom = '<div style="min-width: 600px;"><table style="width: initial;"><tr><td>Zoek:</td><td><input size="24" onkeyup="gis_ia_zoek(\'wms\');" id="gis_ia_zoek_wms"></td></tr><tr><td style="vertical-align: top;">Layer:</td><td><div style="max-height: 14em; overflow-y: scroll;"><table id="gis_ia_res_wms" style="min-width: 100%;">';
  for (t1 = 0; t1 < wms.length; t1++) {
    s1 = wms[t1].split('=');
    wmsDom += '<tr style="display: none; border: none;"><td style="padding: 0;"><input type="radio" name="gis_ia_res_wms" id="gis_ia_res_wms_' + t1 + '" value="' + wms[t1] + '" onchange="gis_ia_zoek(\'wms\');"></td><td style="padding: 0 0 0 20px;"> <label for="gis_ia_res_wms_' + t1 + '"> ' + s1[0] + '</label></td></tr>';
  }
  wmsDom += '</table></div></td></tr></table><div><input type="button" value="Ok" onclick="gis_ia_modals_close=true;gis_ia_modals[\'WMS\'].close();" class="button buton--primary js-form-submit form-submit" id="gis_ia_ok_wms"><input type="button" value="Cancel" onclick="gis_ia_modals[\'WMS\'].close();" class="button js-form-submit form-submit"></div></div>';
  wmsDom = jQuery(wmsDom);
  gis_ia_modals['WMS'] = Drupal.dialog(wmsDom, {
    //werkt niet: resizable: true,
    //werkt niet: draggable: true,
    closeOnEscape: true,
    title: 'Kies WMS layer',
    width: 'auto',
    beforeClose: function () {
      if (gis_ia_modals_close) {
        var layer = jQuery('[name=gis_ia_res_wms]:checked').val().split('='),
            title = layer[1];
        layer = layer[0];
        gis_ia_setOneValue(gis_ia_setLayerRow, 2, layer);
        jQuery('#gis_ia_layer_' + gis_ia_setLayerRow).val(layer);
        gis_ia_setOneValue(gis_ia_setLayerRow, 3, title);
        jQuery('#gis_ia_title_' + gis_ia_setLayerRow).removeAttr('disabled').val(title);
      }
    },
  });

  // Maak dialog box voor ...
  // gis_ia_modals['WMTS']= ...

  // Up to date maken van het veld gis_ia_params
  var body = jQuery('#edit-gis-ia-params-0-value');
  // de variabele gis_ia_default_parameters bevat de defaults voor de laatste
  // dataversie. Deze wordt als volgt gemerged met bestaande data: - Als een
  // parameter niet meer bestaat dan wordt deze uit 'body' gehaald - Als een
  // parameter wel een default heeft maar niet in 'body' bestaat, dan wordt
  // deze aan 'body' toegevoegd - Als een parameter samengesteld is (parmsplit)
  // en de waarde in 'body' is 'te kort', dan worden de nieuwe defaults
  // toegevoegd.
  if (body.val() == '') { // nieuwe node, set alle default parameters, behalve ld
    var key, v = '';
    for (key in gis_ia_default_parameters) {
      if (!gis_ia_default_parameters.hasOwnProperty(key)) {
        continue;
      }
      if (key != 'ld') {
        v += (v == '' ? '' : String.fromCharCode(13)) + key + '=' + gis_ia_default_parameters[key];
      }
    }
    body.val(v);
  }
  else {
    var regels = body.val(), t, regel, pos, parm, key;
    regels = regels.replace(/[\r\n]+/g, "\r");
    regels = regels.replace(/\n+/g, "\r");
    regels = regels.split("\r");
    // verwijder elke regel die niet meer in gis_ia_default_parameters bestaat, of de
    // ld parameter
    for (t = regels.length - 1; t >= 0; t--) {
      pos = regels[t].indexOf('=');
      parm = regels[t].substr(0, pos);
      if (parm == 'ld' || !gis_ia_default_parameters.hasOwnProperty(parm)) {
        regels.splice(t, 1);
      }
    }
    // voeg elke parameter uit gis_ia_default_parameters toe aan body als deze niet in
    // body bestaat, of verleng deze indien nodig
    for (key in gis_ia_default_parameters) {
      if (key == 'ld' || (key != 'tmp' && !gis_ia_default_parameters.hasOwnProperty(key))) {
        continue;
      }
      for (t = 0, regel = -1; t < regels.length; t++) {
        pos = regels[t].indexOf('=');
        parm = regels[t].substr(0, pos);
        if (key == parm) {
          regel = t;
          t = regels.length;
        }
      }
      if (regel == -1) { // hij bestaat niet
        regels[regels.length] = key + '=' + gis_ia_default_parameters[key];
      }
      else { // mogelijk verlenging nodig
        if (key == 'tmp') { // tmp key altijd vervangen
          regels[regel] = key + '=' + gis_ia_default_parameters[key];
        }
        else {
          if (typeof (gis_ia_default_parameters[key]) == 'string') {
            regels[regel] += gis_ia_default_parameters[key].substr(regels[regel].length);
          }
        }
      }
    }
    body.val(regels.join("\r"));
  }
  // body bevat nu alle ooit ingevoerde waarden, evt. uitgebreid met nieuwe
  // parameters

  // Maak de HTML waarmee de redacteur parameters en layers kan definiëren
  var start_el = jQuery('.js-form-item-name-0-value.form-item-name-0-value'),
      d = '', href = window.location.href;

  // de edit-URL ziet er zo uit:
  // http://geodata2-sscc-geoweb-co.apps.ssc-campus.nl/drupal/admin/structure/sdv_gis_entity/8/edit?destination=/drupal/admin/structure/sdv_gis_entity
  // Vertaal deze naar:
  // http://geodata2-sscc-geoweb-co.apps.ssc-campus.nl/drupal/admin/help/sdv_gis?etc...
  href = drupalSettings.gis_ia.help_text;
  start_el.prepend('<div class="button" style="float: right;margin: 12px 60px 12px 20px;" onclick="window.open(\'' + href + '#all\',\'gis_ia_help\');">Help</div>');

  d += '<div class="form-item"><b>Formaat en uiterlijk</b><div class="links" style="float: right;cursor: pointer;"><a onclick="window.open(\'' + href + '#form\',\'gis_ia_help\');" class="module-link module-link-help" title="Help">Help</a></div>';
  d += '<div class="form-item-start">';
  // Basiskaart
  d += '<div class="kolom_1"><div>Basiskaart</div>';
  d += '<div><input type="checkbox" id="gis_ia_bk1" class="form-checkbox" gis_ia="b-0"><label for="gis_ia_bk1" class="option"> Openbasiskaart</label></div>';
  d += '<div><input type="checkbox" id="gis_ia_bk2" class="form-checkbox" gis_ia="b-1"><label for="gis_ia_bk2" class="option"> Openbasiskaart grijs</label></div>';
  d += '<div><input type="checkbox" id="gis_ia_bk3" class="form-checkbox" gis_ia="b-2"><label for="gis_ia_bk3" class="option"> Openbasiskaart pastel</label></div>';
  d += '<div><input type="checkbox" id="gis_ia_bk4" class="form-checkbox" gis_ia="b-3"><label for="gis_ia_bk4" class="option"> Luchtfoto</label></div>';
  d += '<div><input type="checkbox" id="gis_ia_bk5" class="form-checkbox" gis_ia="b-4"><label for="gis_ia_bk5" class="option"> Topografisch</label></div>';
  d += '</div>';
  // Overlaykaart
  d += '<div class="kolom_1"><div>Overlaykaart</div>';
  d += '<div><input type="checkbox" id="gis_ia_ok1" class="form-checkbox" gis_ia="o-0"><label for="gis_ia_ok1" class="option"> NL schaduw</label></div>';
  d += '<div><input type="checkbox" id="gis_ia_ok2" class="form-checkbox" gis_ia="o-1"><label for="gis_ia_ok2" class="option"> Provinciegrenzen</label></div>';
  d += '<div><input type="checkbox" id="gis_ia_ok3" class="form-checkbox" gis_ia="o-2"><label for="gis_ia_ok3" class="option"> Gemeentegrenzen</label></div>';
  d += '</div>';
  // Overig
  d += '<div class="kolom_1"><div>Overig</div>';
  d += '</div>';
  // einde
  d += '</div></div>';

  // panel
  d += '<div class="form-item"><b>Panel</b><div class="links" style="float: right;cursor: pointer;"><a onclick="window.open(\'' + href + '#panel\',\'gis_ia_help\');" class="module-link module-link-help" title="Help">Help</a></div>';
  d += '<div class="form-item-start">';
  // panel opties
  d += '<div class="kolom_1"><div>Panel opties</div>';
  d += '<div><input type="checkbox" id="gis_ia_pw-0" gis_ia="pw-0"><label for="gis_ia_pw-0" class="option"> Slide links van kaart</label></div>';
  // Let op, de breedtes worden ook gebruikt in gis_ia.js!!!
  d += '<div><span style="width: 100px;display: inline-block;">Breedte:</span><select gis_ia="pw-1"><option value="0">180px</option><option value="1">200px</option><option value="2">220px</option><option value="3">240px</option><option value="4">260px</option><option value="5">280px</option><option value="6">300px</option></select></div>';
  d += '</div>';
  // Toon lagen in panel
  d += '<div class="kolom_1"><div>Lagen in panel</div>';
  d += gis_ia_getRadio('show_layer', 'l-0', ['0=Niet tonen', '1=Toon boven filters', '2=Toon onder filters'], false, 'style="display: inline-block;"');
  d += '<div class="gis_ia_l_1" style="margin-top: 8px;"><input type="checkbox" id="gis_ia_l-1" gis_ia="l-1"><label for="gis_ia_l-1" class="option"> Slechts 1 laag selecteerbaar</label></div>';
  d += '</div>';
  // opties per laag
  d += '<div class="kolom_1 gis_ia_l_1"><div>Opties per laag</div>';
  d += '<div><input type="checkbox" id="gis_ia_l-2" gis_ia="l-2"><label for="gis_ia_l-2" class="option"> Transparantie knoppen</label></div>';
  d += '<div><input type="checkbox" id="gis_ia_l-3" gis_ia="l-3"><label for="gis_ia_l-3" class="option"> Download (heel NL)</label></div>';
  d += '<div class="gis_ia_l_4" style="padding-left: 32px;"><input type="checkbox" id="gis_ia_l-4" gis_ia="l-4"><label for="gis_ia_l-4" class="option"> en Bounding Box</label></div>';
  d += '<div><input type="checkbox" id="gis_ia_l-5" gis_ia="l-5"><label for="gis_ia_l-5" class="option"> Zoek op data.rivm.nl knop</label></div>';
  d += '<div><input type="checkbox" id="gis_ia_l-6" gis_ia="l-6"><label for="gis_ia_l-6" class="option"> Legenda</label></div>';
  d += '</div>';
  // einde
  d += '</div></div>';

  d += '<div class="form-item"><b>Controls op de kaart</b><div class="links" style="float: right;cursor: pointer;"><a onclick="window.open(\'' + href + '#controls\',\'gis_ia_help\');" class="module-link module-link-help" title="Help">Help</a></div>';
  d += '<div class="form-item-start">';
  // links boven
  d += '<div class="kolom_1"><div>Links boven</div>';
  d += '<div><input type="checkbox" id="gis_ia_p" gis_ia="p"><label for="gis_ia_p" class="option"> Locatie zoeker</label></div>';
  d += '<div id="gis_ia_pz_div" style="margin-top: 8px;">Zoom level:<input type="number" min="2" max="13" step="1" id="gis_ia_pz" gis_ia="pz" style="margin-left: 20px;"></div>';
  d += '</div>';
  // rechts boven
  d += '<div class="kolom_1"><div>Rechts boven</div>';
  d += '<div><input type="checkbox" id="gis_ia_z" gis_ia="z"><label for="gis_ia_z" class="option"> In- en uitzoomen</label></div>';
  d += '<div><input type="checkbox" id="gis_ia_e" gis_ia="e"><label for="gis_ia_e" class="option"> Zoom extend</label></div>';
  d+='<div><input type="checkbox" id="gis_ia_f" gis_ia="f"><label for="gis_ia_f" class="option"> Full screen</label></div>';
  d += '</div>';
  // Links onder
  d += '<div class="kolom_1"><div>Links onder</div>';
  d += '<div><input type="checkbox" id="gis_ia_sb" gis_ia="sb"><label for="gis_ia_sb" class="option"> Scalebar</label></div>';
  d += '<div><input type="checkbox" id="gis_ia_c" gis_ia="c"><label for="gis_ia_c" class="option"> Co&ouml;rdinaten</label></div>';
  d += '<div><input type="checkbox" id="gis_ia_l1" gis_ia="l1"><label for="gis_ia_l1" class="option"> Legenda</label></div>';
  d += '</div>';
  // rechts onder
  d += '<div class="kolom_1"><div>Rechts onder</div>';
  d += '<div><span style="width: 100px;display: inline-block;">Layer slider:</span><select gis_ia="ts"><option value="0">Nee</option><option value="1">Ja</option><option value="2">Ja, incl. play-knop</option></select></div>';
  d += '<div class="gis_ia_ts_1" style="margin-top: 8px;"><span style="width: 100px;display: inline-block;">Interval:</span><input type="number" min="500" max="5000" step="500" class="form-number" gis_ia="i"></div>';
  d += '</div>';
  // einde
  d += '</div></div>';

  d += '<div class="form-item"><b>Bij klik op de kaart</b><div class="links" style="float: right;cursor: pointer;"><a onclick="window.open(\'' + href + '#klik\',\'gis_ia_help\');" class="module-link module-link-help" title="Help">Help</a></div>';
  d += '<div class="form-item-start">';
  // Data window
  d += '<div class="kolom_1"><div>Info window</div>';
  d += '<div>Plaatsing van het window:' + gis_ia_getRadio('gis_ia_w1', 'w1', ['0=Rechts boven muisklik, binnen de kaart', '1=Indien mogelijk onder de muisklik en over de pagina'], false) + '</div>';
  d += '<div style="margin-top: 8px;">Melding bij \'geen data\':</div>';
  d += '<div><input gis_ia="m" style="width: 100%;"></div>';
  d += '</div>';
  // Tabel met data
  d += '<div class="kolom_1" style="width: 450px;"><div>Tabel met data</div>';
  d += '<div>Ordening bij meerdere lagen/features:' + gis_ia_getRadio('gis_ia_w2', 'w2', ['0=Lagen en features vertikaal', '1=Lagen horizontaal, features vertikaal', '2=Lagen vertikaal, features horizontaal', '3=Kruistabel Lagen horizontaal, properties vertikaal', '4=Kruistabel Lagen vertikaal, properties horizontaal'], false) + '</div>';
  d += '<div style="margin-top: 8px;"><input type="checkbox" id="gis_ia_tl" gis_ia="tl"><label for="gis_ia_tl" class="option"> Toon laagnaam bij features</label></div>';
  d += '</div>';
  // einde
  d += '</div></div>';


  // Laag- en velddefinities
  d += '<div class="form-item"><b>Laag- en velddefinities</b><div class="links" style="float: right;cursor: pointer;"><a onclick="window.open(\'' + href + '#layer\',\'gis_ia_help\');" class="module-link module-link-help" title="Help">Help</a></div></div>';
  d += '<div><input type="checkbox" id="gis_ia_tmp-0" gis_ia="tmp-0"><label for="gis_ia_tmp-0" class="option"> Cache met laag-informatie legen.</label></div>';
  d += '<div id="gis_ia_layer_defs">' + gis_ia_getLayerDefs() + '</div>';

  d += '<div class="form-item"><b>Filter definities</b><div class="links" style="float: right;cursor: pointer;"><a onclick="window.open(\'' + href + '#filter\',\'gis_ia_help\');" class="module-link module-link-help" title="Help">Help</a></div></div>';
  d += '<div id="gis_ia_filter_defs"><div id="gis_ia_div2"></div></div>';

  d += '</div>';

  // Plaats de HTML in de pagina
  start_el.append(d);

  // Voor elk element met het attribuut gis_ia de juiste waarde 'invullen' het
  // onchange-event 'setten', zodat elke wijziging van een redacteur wordt
  // doorgevoerd in het veld gis_ia_params.
  var els = jQuery('[gis_ia]').each(function (t, el) {
    el = jQuery(el);
    // set de waarde, of de default
    var v = gis_ia_getParmValue(el.attr('gis_ia'));
    if (el.prop('type') == 'checkbox') {
      el.prop('checked', v == '1');
    }
    else {
      el.val(v);
    }
    // set de onchange, zodat alle parameters in gis_ia_params worden opgeslagen
    el.on('change', gis_ia_change);
  });

  gis_ia_setFieldsOnServer();

}

//  Deze functie wordt door de dialoogboxen in gis_ia_modals aangeroepen, om te
// zorgen dat laagnamen die een bepaalde text bevatten worde getoond.
// Parameters:    typ: String die het laagtype bevat.
function gis_ia_zoek(typ) {
  var z = jQuery('#gis_ia_zoek_' + typ).val(),
      opts = jQuery('#gis_ia_res_' + typ), t, hasSel = false, tr, chk, lbl;
  if (opts.length == 1) {
    opts = opts[0].rows;
  }
  else {
    opts = '';
  }
  if (typeof (z) == 'undefined') {
    z = '';
  }
  else {
    z = z.toLowerCase();
  }
  if (opts) {
    for (t = 0; t < opts.length; t++) {
      tr = jQuery(opts[t]).children();
      chk = jQuery(jQuery(tr[0]).children()[0]);
      lbl = jQuery(jQuery(tr[1]).children()[0]);
      if (z != '' && lbl.html().toLowerCase().indexOf(z) >= 0) {
        jQuery(opts[t]).show();
        if (chk.prop('checked')) {
          hasSel = true;
        }
      }
      else {
        jQuery(opts[t]).hide();
      }
    }
  }
  if (hasSel) {
    jQuery('#gis_ia_ok_' + typ).removeAttr('disabled');
  }
  else {
    jQuery('#gis_ia_ok_' + typ).attr('disabled', 'disabled');
  }
}

// Deze functie creeert een HTML SELECT element.
// Parameters:    values:    Array van strings met het formaat [id=]Waarde.
//          value:    String/Number met initiele waarde.
//          onchange:  String met aan te roepen functie.
function gis_ia_getSelect(values, value, onchange, atts) {
  var s = '<select onchange="' + onchange + '"' + (typeof (atts) != 'undefined' ? ' ' + atts : '') + '>',
      t, s1, pos;
  for (t = 0; t < values.length; t++) {
    pos = values[t].indexOf('=');
    if (pos >= 0) {
      s1 = [values[t].substr(0, pos), values[t].substr(pos + 1)];
    }
    else {
      s1 = [values[t], values[t]];
    }
    s += '<option value="' + s1[0] + '"' + (s1[0] == '' + value ? ' selected="selected"' : '') + '>' + s1[1] + '</option>';
  }
  return s + '</select>';
}

// Deze functie creeert een DIV element met (vertikaal uitgelijnde) radio's.
// Parameters:    labels:    Array van strings met het formaat [id=]Waarde.
//          value:    String/Number met initiele waarde.
//          onchange:  String met aan te roepen functie.
function gis_ia_getRadio(name, parameter, labels, horizontal, atts) {
  if (typeof (horizontal) == 'undefined') {
    horizontal = true;
  }
  var s = '<div' + (typeof (atts) != 'undefined' ? ' ' + atts : '') + '>', t,
      s1, pos, value = gis_ia_getParmValue(parameter);
  for (t = 0; t < labels.length; t++) {
    pos = labels[t].indexOf('=');
    if (pos >= 0) {
      s1 = [labels[t].substr(0, pos), labels[t].substr(pos + 1)];
    }
    else {
      s1 = [labels[t], labels[t]];
    }
    s += '<div' + (horizontal ? ' style="display: inline-block;' + (t == 0 ? '' : 'margin-left: 12px;') + '"' : '') + '><input type="radio" id="' + name + '_' + t + '" style="vertical-align: top;" name="' + name + '" value="' + s1[0] + '"' + (s1[0] == '' + value ? ' checked="checked"' : '') + ' onchange="gis_ia_setRadioParm(this,\'' + parameter + '\');"><label for="' + name + '_' + t + '" style="display: inline-block;font-weight: normal; margin-left: 12px; max-width: calc(100% - 30px);">' + s1[1] + '</label></div>';
  }
  return s + '</div>';
}

function gis_ia_setRadioParm(el, parm) {
  el = jQuery(el);
  if (el.prop('checked')) {
    gis_ia_change_regel(parm, el.attr('value'));
  }
}

// Deze functie wijzigt de positie van een bepaalde layer en update de
// layer-HTML Parameters:    no:        Integer; Te wijzigen laag nummer
// aant_rows:    Integer; Aantal lagen to_no:      Integer; Nieuwe positie van
// de laag
function gis_ia_changePos(no, aant_rows, to_no) {
  to_no = parseInt(to_no, 10);
  if (no != to_no) {
    var el = jQuery('#edit-gis-ia-layers-0-value'), t = el.val(), s;
    t = t.replace(/[\r\n]+/g, "\r");
    t = t.replace(/\n+/g, "\r");
    t = t.split("\r");
    s = t[no];
    t.splice(no, 1);
    t.splice(to_no, 0, s);
    el.val(t.join("\r"));
    gis_ia_redrawLayerDefsTable();
    var fs = gis_ia_getFilterArray(), t1;
    for (t = 0; t < fs.length; t++) {
      if (fs[t].t == 'g') {
        for (t1 = 0; t1 < fs[t].e.length; t1++) {
          if (typeof (fs[t].e[t1].l) != 'undefined') {
            if (fs[t].e[t1].l == no) {
              fs[t].e[t1].l = to_no;
            }
            else {
              if (fs[t].e[t1].l == to_no) {
                fs[t].e[t1].l = no;
              }
            }
          }
        }
      }
      else {
        if (typeof (fs[t].l) != 'undefined') {
          if (fs[t].l == no) {
            fs[t].l = to_no;
          }
          else {
            if (fs[t].l == to_no) {
              fs[t].l = no;
            }
          }
        }
      }
    }
    gis_ia_setFilterArray(fs);
    gis_ia_redrawFilterDefsTable();
  }
}

// Deze functie bouwt de HTML op van 1 layer met inputvelden, tbv de
// layer-tabel. Parameters:    no:        Integer; layer-index values:
// Array met layer-definities (zie gis_ia_default_row) aant_rows:    Integer;
// Aantal lagen Return:   HTML row
function gis_ia_row(no, values, aant_rows) {
  var a = [], t;
  for (t = 1; t <= aant_rows; t++) {
    a[t - 1] = (t - 1) + '=' + t;
  }
  for (t = 0; t < gis_ia_default_row.length; t++) {
    if (typeof (values[t]) == 'undefined') {
      values[t] = '';
    }
  }
  var row = '<tr>', dis;
  row += '<td>' + gis_ia_getSelect(a, no, 'gis_ia_changePos(' + no + ',' + aant_rows + ',this.value)') + '</td>';
  row += '<td><select onchange="gis_ia_setOneValue(' + no + ',0,this.value);">';
  row += '<option' + (values[0] == 'WMS' ? ' selected="selected"' : '') + ' value="WMS">WMS</option>';
  row += '<option' + (values[0] == 'URL' ? ' selected="selected"' : '') + ' value="URL">URL</option>';
  row += '</select></td>';
  if (values[0] == 'URL') {
	var datarivmnl=gis_ia_datarivmnl(values[1]);
	dis='';
	if (datarivmnl) {
		dis=datarivmnl['href'];
	}
	row += '<td><span style="width: 50px; display: inline-block;">URL:</span><input url="url" onchange="gis_ia_setLayerURL('+no+')" size="48" value="' + values[1] + '" id="gis_ia_layer_' + no + '"><br><span style="width: 50px; display: inline-block;">Layer:</span><select onchange="gis_ia_setOneValue('+no+', 2, jQuery(this).val());" id="gis_ia_layer2_' + no + '"><option>'+values[2]+'</option></select><span class="gis_ia_url_error"></span><a id="gis_ia_layer2a_' + no + '" class="button" href="'+dis+'" target="gisportal" style="padding: 1px 12px; font-size: 13px; margin: 2px 0 0 40px;">Open in gisportal</a></td>';
  } else {
	row += '<td><input type="button" class="button" onclick="gis_ia_setLayer(' + no + ');" value="' + (values[2] == '' ? 'Kies layer ...' : values[2]) + '" id="gis_ia_layer_' + no + '"></td>';
  }
  row += '<td><input onchange="gis_ia_setOneValue(' + no + ',3,this.value);" size="24" value="' + values[3] + '" id="gis_ia_title_' + no + '"' + (values[2] == '' ? ' disabled="disabled"' : '') + '></td>';
  row += '<td><input onchange="gis_ia_setOneValue(' + no + ',4,this.value);" size="3" value="' + values[4] + '" type="number" step="0.1" min="0" max="1"></td>';
  row += '<td><select onchange="gis_ia_setOneValue('+no+',5,this.value);" ><option value="0"'+(values[5]=='0'?' selected="selected"':'')+'>Nee</option><option value="1"'+(values[5]=='1'?' selected="selected"':'')+'>Toon als laag aan staat</option><option value="2"'+(values[5]=='2'?' selected="selected"':'')+'>Altijd tonen</option></select></td>';
  row += '<td><input onchange="gis_ia_setOneValue(' + no + ',7,jQuery(this).prop(\'checked\')?1:0);" ' + (values[7] == 1 ? 'checked="checked"' : '') + ' type="checkbox"></td>';
  row += '<td><input onclick="gis_ia_veld(' + no + ',false);" class="button" type="button" value="Velden"></td>';
  row += '<td><input onclick="gis_ia_delete(' + no + ');" class="button" type="button" value="Verwijder"></td>';
  row += '</tr>';
  return row;
}

// deze functie checkt of een url wijst naar ons eigen (acceptatie) portaal of niet.
// return is null of bevat:
// [0] de gehele url
// [1] https://, http:// of niks
// [2] acceptatie.data of data
// [3] onderwerp
// [4] kaartnaam
// ['href'] href naar geo-package op portaal
function gis_ia_datarivmnl(v) {
	var r=v.match(/^(https:[\/\\][\/\\]|http:[\/\\][\/\\]|){1}(acceptatie\.data|data){1}\.rivm.nl[\/\\]geo[\/\\](.+)[\/\\](.+)$/);
	if (r) {
		if (r.length>=5) {
			r['href']='https://'+r[2]+'.rivm.nl/geo/portal/index.php?thema='+r[3]+'&kaart='+r[4];
		}
	}
	return r;
}

// globale variabele om de URL te bewaren tbv een AJAX call
var gis_ia_veld_url;

// Deze functie opent een dialoog-box zodat de redacteur de velden van een laag
// kan definieren Parameters:    no;    Integer; Velden van layer-index
var gis_ia_veld_pressed = false; // variable zodat je niet 2x op de knop kunt
                                 // drukken
function gis_ia_veld(no, forFilter) {
  if (!gis_ia_veld_pressed) {
    gis_ia_veld_pressed = true;
    // Haal velddefinities op
    var el = jQuery('#edit-gis-ia-layers-0-value'), t = el.val(), s;
    t = t.replace(/[\r\n]+/g, "\r");
    t = t.replace(/\n+/g, "\r");
    t = t.split("\r");
    s = t[no].split('|');

    //if (s[2]=='') {return;}

    // Creeer een layer met Source (openlayers type) en een View (openlayers
    // type) met Projection en Resolution (openlayers type)
    var layer;
    switch (s[0]) {
      case 'WMS':
	  case 'URL':
        layer = new ol.layer.Image({
          title: 'title',
          extent: [-285401.92, 22598.08, 595401.9199999999, 903401.9199999999],
          source: new ol.source.ImageWMS({
            url: s[1],
            params: {
              layers: s[2],
              srs: 'EPSG:28992',
              format: 'image/png',
            },
          }),
        });
        break;
      case 'WMTS':
        break;
    }
    var pixpermeter = 300000 / 600; // pixels per meter
    var view = new ol.View({
      projection: new ol.proj.Projection({code: 'EPSG:28992', units: 'm'}),
      center: ol.extent.getCenter([0, 300000, 300000, 650000]),
      resolution: pixpermeter,
      maxResolution: pixpermeter,
    });
    var viewResolution = view.getResolution();
    var viewProjection = view.getProjection();
    var wmsSource = layer.getSource();

    // Opvragen velden werkt als volgt:
    // - De feature-count staat op 1 zodat ie maar 1 antwoord geeft (dat is
    // genoeg). - De buffer staat op 1000 zodat ie vanuit het midden van de
    // kaart ([150000,475000]) in een cirkel met een straal van 1000 pixels
    // zoekt. Op een rasterkaart zou de buffer niet nodig zijn omdat elk punt
    // in het raster een property terug geeft, maar op een vector-kaart moet ie
    // in die cirkel zoeken.
    gis_ia_veld_url = wmsSource.getGetFeatureInfoUrl([150000, 475000], viewResolution, viewProjection, {
      'FEATURE_COUNT': 1,
      'INFO_FORMAT': 'application/json',
      'QUERY_LAYERS': s[2],
      'BUFFER': 10000
    });

    // Haal veld-definities op van een server. Als dat lukt; Roep dan de
    // functie gis_ia_veld_ aan.
    jQuery.ajax({
      type: 'GET',
      url: gis_ia_veld_url,
      data: [],
      dataType: 'json',
    }).done(function (data) {
      if (data.features.length == 0) {
        var url = gis_ia_veld_url, pos1 = url.indexOf('&BBOX='),
            pos2 = url.indexOf('&', pos1 + 1);
        if (pos2 < pos1) {
          pos2 = url.length;
        }
        url = url.substr(0, pos1) + '&BBOX=0%2C0%2C300000%2C650000' + url.substr(pos2);
        jQuery.ajax({
          type: 'GET',
          url: url,
          data: [],
          dataType: 'json',
        }).done(function (data) {
          if (data.features.length == 0) {
            alert('Kan de velddefinities niet ophalen.');
          }
          else {
            if (forFilter) {
              gis_ia_setFieldsOnServer_(no, data);
            }
            else {
              gis_ia_veld_(no, s, data);
            }
          }
        }).fail(function (xhr, textStatus, errorThrown) {
          alert('Kan de velddefinities van laag \'' + s[0] + ' ' + s[2] + '\' niet ophalen. Fout: ' + xhr.statusText + ' ' + xhr.responseText + ' Op acceptatie kan dit een CORS of CORB error zijn.');
        });
      }
      else {
        if (forFilter) {
          gis_ia_setFieldsOnServer_(no, data);
        }
        else {
          gis_ia_veld_(no, s, data);
        }
      }
      gis_ia_veld_pressed = false;
    }).fail(function (xhr, textStatus, errorThrown) {
      alert('Kan de velddefinities van laag \'' + s[0] + ' ' + s[2] + '\' niet ophalen. Fout: ' + xhr.statusText + ' ' + xhr.responseText + ' Op acceptatie kan dit een CORS of CORB error zijn.');
      gis_ia_veld_pressed = false;
    });
  }
}

// globale variabelen die de dialoog-box bevat (gis_ia_velden_modal) en het
// drukken op Ok/Cancel door de redacteur (gis_ia_velden_modal_close)
var gis_ia_velden_modal, gis_ia_velden_modal_close;

// Deze functie wordt aangeroepen als de veld-definities van de server zijn
// opgehaald en toont een dialoog-box zodat de redacteur wijzigingen kan doen
// Parameters:    no;    Integer; Velden van layer-index s;    Array met
// layer-definities data;  XML-object met veld-definities van de server
function gis_ia_veld_(no, s, data) {
  var velden = [];
  data = data.features;
  var t, veld_s = s[6], veld_s2 = [], v, k, s2;

  // Opbouwen HTML voor dialoog-box
  var html = '<h3>' + s[2] + '</h3><table><thead><tr><th>Veldnaam</th><th>Label<sup>*</sup></th><th>Eenheid</th><th>Align</th></tr></thead><tbody>';
  veld_s = veld_s.split(',');
  for (t = 0; t < veld_s.length; t++) {
    k = veld_s[t].indexOf('=');
    v = veld_s[t].substr(k + 1);
    k = veld_s[t].substr(0, k);
    veld_s2[k] = v;
  }
  t = 0;
  for (var ft = 0; ft < data.length; ft++) {
    for (var key in data[ft].properties) {
      s2 = (typeof (veld_s2[key]) != 'undefined' ? veld_s2[key] : '^^').split('^');
      html += '<tr><td>' + key + '</td><td><input size="12" id="gis_ia_veld_prop_' + no + '_' + t + '" value="' + s2[0] + '"></td><td><input size="6" id="gis_ia_veld_prop2_' + no + '_' + t + '" value="' + s2[1] + '"></td><td><input type="checkbox" id="gis_ia_veld_prop3_' + no + '_' + t + '"' + (s2[2] == '1' ? ' checked="checked"' : '') + '><label for="gis_ia_veld_prop3_' + no + '_' + t + '" style="display: initial;"> rechts</label></td></tr>';
      velden[velden.length] = key;
      t++;
    }
  }
  html += '</tbody></table><sup>*</sup> Of leeg laten om het veld niet te tonen als de gebruiker op de kaart klikt.<br><br><input class="button" type="button" value="Ok" onclick="gis_ia_velden_modal_close=true; gis_ia_velden_modal.close();"><input class="button" type="button" value="Cancel" onclick=" gis_ia_velden_modal.close();">';
  html = jQuery('<div>' + html + '</div>');

  gis_ia_velden_modal_close = false;
  gis_ia_velden_modal = Drupal.dialog(html, {
    //werkt niet: resizable: true,
    //werkt niet: draggable: true,
    closeOnEscape: true,
    title: 'Veld definities',
    width: 'auto',
    beforeClose: function () {
      if (gis_ia_velden_modal_close) { // Als de redacteur op 'Ok' heeft gedrukt
        var t, s = '', v1, v2, v3, v4, v5, v6;
        // Bouw string met veld-definities op
        for (t = 0; t < velden.length; t++) {
          v1 = jQuery('#gis_ia_veld_prop_' + no + '_' + t).val();
          v1 = jQuery.trim(v1);
          v1 = v1.replace(/\|/g, '');
          v1 = v1.replace(/\^/g, '');
          v1 = v1.replace(/,/g, '');
          v2 = jQuery('#gis_ia_veld_prop2_' + no + '_' + t).val();
          v2 = jQuery.trim(v2);
          v2 = v2.replace(/\|/g, '');
          v2 = v2.replace(/\^/g, '');
          v2 = v2.replace(/,/g, '');
          v3 = jQuery('#gis_ia_veld_prop3_' + no + '_' + t).prop('checked') ? 1 : 0;
          s += (s == '' ? '' : ',') + velden[t] + '=' + v1 + '^' + v2 + '^' + v3;
        }
        // Sla de veld-definities op als 6e element in de layer-definities.
        gis_ia_setOneValue(no, 6, s);
      }
    },
  });
  gis_ia_velden_modal.showModal();
}

// Deze functie wijzigt 1 layer-definitie in de textarea met definities
// Parameters:    row;  Integer; layer-index
//          col;  Integer; index van de definitie
//          v;    waarde
function gis_ia_setOneValue(row, col, v) {
  var el = jQuery('#edit-gis-ia-layers-0-value'), t = el.val(), s;
  t = t.replace(/[\r\n]+/g, "\r");
  t = t.replace(/\n+/g, "\r");
  t = t.split("\r");
  if (t[row] != '') {
    s = t[row].split('|');
  }
  else {
    s = gis_ia_default_row;
  }
  s[col] = v;
  if (col == 0) { // set juiste servernaam bij keuze col=0
    switch (s[0]) {
      case 'WMS':
        s[1] = 'https://geodata.rivm.nl/geoserver/wms';
        break;
      case 'URL':
        s[1] = '';
        break;
    }
  }
  t[row] = s.join('|');
  t = t.join("\r");
  el.val(t);
  switch (col) {
    case 0: // Wijziging van de servertype
      gis_ia_redrawLayerDefsTable();
      break;
    case 2: // wijziging van de layernaam (en dus ook de velden)
      gis_ia_setFieldsOnServer();
      break;
  }
}

// globale variabelen om te onthouden welke layer wordt gemuteerd
// (gis_ia_setLayerRow), of de redacteur op OK klikt (gis_ia_modals_close) en
// een variabele waarin de gemuteerde laag-informatie staat
// (gis_ia_modals_value).
var gis_ia_setLayerRow, gis_ia_modals_close, gis_ia_modals_value;

// Deze functie wordt aangeroepen als de redacteur op een layer-naam klikt en
// toont de modal-box die hoort bij het type layer Parameters:    row;
// Integer; layer-index
function gis_ia_setLayer(row) {
  gis_ia_setLayerRow = row;
  var el = jQuery('#edit-gis-ia-layers-0-value'), t = el.val(), s;
  t = t.replace(/[\r\n]+/g, "\r");
  t = t.replace(/\n+/g, "\r");
  t = t.split("\r");
  s = t[row].split('|');
  gis_ia_modals_close = false;
  gis_ia_modals_value = t[row];
  gis_ia_zoek(s[0].toLowerCase());
  gis_ia_modals[s[0]].showModal();
}
// Deze functie wordt aangeroepen als de redacteur de url wijzigt
function gis_ia_setLayerURL(row) {
	var url=jQuery('#gis_ia_layer_'+row),url2=jQuery('#gis_ia_layer2_'+row),title=jQuery('#gis_ia_title_' + row), old_layer=url2.val(), urlerror=jQuery(jQuery(url2.parent()).find('.gis_ia_url_error'));
	var datarivmnl=gis_ia_datarivmnl(url.val());
	// datarivmnl is null of bevat:
	// [0] de gehele url
	// [1] https://, http:// of niks
	// [2] acceptatie.data of data
	// [3] onderwerp
	// [4] kaartnaam
    gis_ia_setOneValue(row, 1, url.val());
    gis_ia_setOneValue(row, 2, url2.val());
	jQuery('#gis_ia_layer2a_' + row).hide();
	url2.show();
	urlerror.html('').removeClass('gis_ia_url_error2');
	if (datarivmnl) {
		jQuery('#gis_ia_layer2a_' + row).attr('href',datarivmnl['href']).show();
	}
	if (url.val()!='') {
		jQuery.ajax({
			url: url.val()+'?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities',
			type: "GET",
			success: function(data) {
				var t, t1, childs1, t2, childs2, t3, childs3, opts=[], html='';
				for (t=0;t<data.children.length;t++) if (data.children[t].localName=='WMS_Capabilities') {
					childs1=data.children[t].children;
					for (t1=0;t1<childs1.length;t1++) if (childs1[t1].localName=='Capability') {
						childs2=childs1[t1].children;
						for (t2=0;t2<childs2.length;t2++) if (childs2[t2].localName=='Layer') {
							childs3=childs2[t2].children;
							for (t3=0;t3<childs3.length;t3++) if (childs3[t3].localName=='Layer') {
								childs4=childs3[t3].children;
								for (t4=0;t4<childs4.length;t4++) if (childs4[t4].localName=='Title') {
									opts[opts.length]=childs4[t4].textContent;
								}
							}
							t2=childs2.length;
						}
						t1=childs1.length;
					}
					t=data.children.length;
				}
				if (opts.length>=1) {
					for (t=0;t<opts.length;t++) {
						html+='<option'+(opts[t]==old_layer?' selected="selected">':'>')+opts[t]+'</option>';
					}
					url2.html(html);
				} else {
					url2.html('<option></option>');
					url2.hide();
					urlerror.html('URL lijkt geen kaart.').addClass('gis_ia_url_error2');
					jQuery('#gis_ia_layer2a_' + row).hide();
				}
				gis_ia_setOneValue(row, 2, url2.val());
			},
			error: function(e) {
				url2.html('<option></option>');
				url2.hide();
				urlerror.html('URL lijkt geen kaart.').addClass('gis_ia_url_error2');
				jQuery('#gis_ia_layer2a_' + row).hide();
				gis_ia_setOneValue(row, 2, url2.val());
			}
		});
		title.prop('disabled',false);
	} else {
		title.prop('disabled',true);
	}
}

// Deze functie wordt aangeroepen als de redacteur op 'Nieuwe laag' klikt en
// voegt een nieuwe layer toe met de defaults uit gis_ia_default_row. Daarna
// wordt de layer-tabel opnieuw opgebouwd.
function gis_ia_add() {
  var el = jQuery('#edit-gis-ia-layers-0-value'), t = el.val();
  t = t.replace(/[\r\n]+/g, "\r");
  t = t.replace(/\n+/g, "\r");
  t = t.split("\r");
  if (t[t.length - 1] == '') {
    t[t.length - 1] = gis_ia_default_row.join('|');
  }
  else {
    t[t.length] = gis_ia_default_row.join('|');
  }
  t = t.join("\r");
  el.val(t);
  gis_ia_redrawLayerDefsTable();
}

// Deze functie wordt aangeroepen als de redacteur op 'Laag verwijderen'.
// Daarna wordt de layer-tabel opnieuw opgebouwd. Parameters:    row;  Integer;
// layer-index
function gis_ia_delete(row) {
  var el = jQuery('#edit-gis-ia-layers-0-value'), t = el.val();
  t = t.replace(/[\r\n]+/g, "\r");
  t = t.replace(/\n+/g, "\r");
  t = t.split("\r");
  t.splice(row, 1);
  t = t.join("\r");
  el.val(t);
  gis_ia_redrawLayerDefsTable();
  var fs = gis_ia_getFilterArray(), t, t1;
  for (t = fs.length; t >= 0; t--) {
    if (fs[t].t == 'g') {
      for (t1 = fs[t].e.length; t1 >= 0; t1--) {
        if (typeof (fs[t].e[t1].l != 'undefined')) {
          if (fs[t].e[t1].l > row) {
            fs[t].e[t1].l--;
          }
          if (fs[t].e[t1].l == row) {
            fs.e.splice(t1, 1);
          }
        }
      }
    }
    else {
      if (typeof (fs[t].l != 'undefined')) {
        if (fs[t].l > row) {
          fs[t].l--;
        }
        if (fs[t].l == row) {
          fs.splice(t, 1);
        }
      }
    }
  }
  gis_ia_setFilterArray(fs);
  gis_ia_redrawFilterDefsTable();
}

// Start javascript na laden van de pagina
(function ($) {
  gis_ia_init();
  gis_ia_redrawFilterDefsTable();
  gis_ia_show_hide();
  jQuery('[url=url]').each(function(t,el) {
	  el=jQuery(el);
	  var id=el.prop('id'), no=id.substr(13);
	  gis_ia_setLayerURL(parseInt(no,10));
  });
})(jQuery);
