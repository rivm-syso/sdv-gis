/**************************************************************************************
 Nog doen:
 1. De huidige extent van de kaart is nu altijd de extent van brtachtergrondkaart. Elke kaart heeft zijn eigen extent.
 Als je dus niet de brtachtergrondkaart gebruikt, moet je de jusite extent nog hebben (mee krijgen)
 2. Op IOS (Ipad) werken de range-inputs niet. Dit is mogelijk te verhelpen met: https://github.com/Patrick64/jquerytools/blob/dev/src/rangeinput/rangeinput.js
 Opmerkingen:
 - Loading.gif is gemaakt mbv https://icons8.com/preloaders/en/free
 **************************************************************************************/

/* to do tbv kleuren-css:
1. Zoek naar gis_ia_info_button in deze file en haal deze weg. zoek hem ook in de css en vervang die door gis_ia_filters_info_button
2. Zoek in deze file en css naar gis_ia_filter_button en vervang deze door gis_ia_options_button (knop op de kaart)
3. kijk in kleur.css of er nog gis_is staat. Vervang door gis_ia_base
4. classes button-opa... vervangen en juiste plaatje geven
*/

/* Afhankelijkheden
  proj4.js  Bron: https://github.com/proj4js/proj4js
            Versie: 2.5.0
            License:
              Authors:
                Mike Adair madairATdmsolutions.ca
                Richard Greenwood richATgreenwoodmap.com
                Didier Richard didier.richardATign.fr
                Stephen Irons stephen.ironsATclear.net.nz
                Olivier Terral oterralATgmail.com
                Calvin Metcalf cmetcalfATappgeo.com
                Copyright (c) 2014, Mike Adair, Richard Greenwood, Didier Richard, Stephen Irons, Olivier Terral and Calvin Metcalf
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
              The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  ol.js en ol.css    Dit is openlayers versie 4.6.5
*/

// globale variabelen t.b.v. de autocomplete van position2 (ophalen o.b.v.
// postcode, adres, etc).
var position2_url_suggest = 'https://geodata.nationaalgeoregister.nl/locatieserver/v3/suggest?&rows=5&fq=*:*';
var position2_url_lookup = 'https://geodata.nationaalgeoregister.nl/locatieserver/v3/lookup?id=';
/**************************************************************************************/

// Deze functie opent een window waarin op data.rivm.nl een search wordt gedaan
// naar een bepaalde layer. Parameters:    map_id;    Integer; map ID lno;
// Integer; layer-index
function gis_ia_gotoDataRIVMNl(map_id, lno) {
  var l = GIS_ia_maps[map_id].layers_def[lno];
  window.open('https://data.rivm.nl/geonetwork/srv/dut/catalog.search#/search?resultType=details&fast=index&_content_type=json&from=1&to=4&sortBy=relevance&any_OR__title=' + l.layer);
}

// Deze functie wordt gebruikt om de legenda voor een bepaalde layer te laden
// en te tonen. Gedurende het laden wordt de image loading.gif getoond.
// Parameters:    map_id;    Integer; map ID lno;    Integer; layer-index
function gis_ia_showLegend(map_id, lno, where) {
  var t, t1,
      els = jQuery('.gis_ia_' + map_id + '_' + lno + '_legenda_leg' + where);
  for (t = 0, t1 = 0; t < els.length; t++) {
    if (jQuery(els[t]).hasClass('gis_ia_is_done')) {
      t1++;
    }
    jQuery(els[t]).addClass('gis_ia_is_done');
  }
  if (t1 != 0) {
    return;
  }
  var l = GIS_ia_maps[map_id].layers_def[lno], src = '', legendType;
  switch (l.type) {
    case 'WMS':
    case 'WMSinput':
      src = 'https://geodata.rivm.nl/geoserver/wms?VERSION=1.1.1&REQUEST=GetLegendGraphic&LAYER=' + GIS_ia_maps[map_id].layers_def[lno].layer + '&Format=image/png';
      legendType = 0;
      break;
    case 'datarivmnl':
      src = l.url + '?VERSION=1.1.1&REQUEST=GetLegendGraphic&LAYER=' + GIS_ia_maps[map_id].layers_def[lno].layer + '&Format=image/png';
      legendType = 0;
      break;
    case 'Vectortile':
      legendType = 1;
      break;
  }
  switch (legendType) {
    case 0:
      if (where == 2) {
        src += '&LEGEND_OPTIONS=bgColor:0x' + GIS_ia_maps[map_id].kleuren[2].substr(1) + ';fontColor:0x' + (GIS_ia_maps[map_id].kleuren[0].white ? 'FFFFFF' : '000000');
      }
      img = new Image();
      img.map_id2 = map_id;
      img.no2 = lno;
      img.src2 = src;
      img.onload = function () { // Als de image geladen is, toon deze dan
        var i = jQuery(this)[0], map_id = i.map_id2, lno = i.no2, src = i.src2,
            img = '<img class="gis_ia_layer_legend" src="' + src + '">', t;
        for (t = 0; t < els.length; t++) {
          jQuery(els[t]).removeClass('wait-cursor').html(img);
        }
      };
      img.src = src;
      break;
    case 1:
      var ll = l.lstyle, pos = ll.indexOf('styles'), openhaak = 0, tl, c,
          qt = '', lf = '', styles;
      if (pos !== false) {
        ll = ll.substr(pos);
        for (tl = 0; tl < ll.length; tl++) {
          c = ll.substr(tl, 1);
          switch (c) {
            case '\'':
            case '"':
              if (c == qt) {
                qt = '';
              }
              break;
            case '{':
              if (qt == '') {
                openhaak++;
              }
              break;
            case '}':
              if (qt == '') {
                openhaak--;
                if (openhaak == 0) {
                  lf = ll.substr(0, tl + 1);
                  tl = ll.length;
                }
              }
              break;
          }
        }
        if (lf != '') {
          eval(lf + ';');
          var s = '<div style="text-align: left; background-color: white; font-size: 0.9em; padding: 3px 30px 0 0;">',
              keys = Object.keys(styles), k, kt, fill, stroke;
          for (kt = 0; kt < keys.length; kt++) {
            k = styles[keys[kt]];
            fill = k.getFill();
            stroke = k.getStroke();
            s += '<div><div style="display:inline-block; width: 18px; height: 18px; margin: 3px 30px 0 0; background-color: ' + fill.getColor() + '; border: solid 1px ' + stroke.getColor() + ';"></div><div style="margin-top: 5px; display: inline-block; vertical-align: top;">' + keys[kt] + '</div></div>';
          }
          for (t = 0; t < els.length; t++) {
            jQuery(els[t]).html(s + '</div>');
          }
        }
        else {
          console.log('Interne fout');
        }
      }
      break;
  }
}


/**************************************************************************************
 Filtering:
 1. Er bestaan verschillende soorten filters en filter-groepen.
 2. Om deze te wijzigen of aan te vullen, zoek op:   ** filterdefinitie-
 3. Elk filter levert in principe een x-button helemaal bovenaan en een x-button in de hoogste groep waar de filter in zit (ook al
 zit de filter in een sub(-sub(-sub)-groep
 4. Groepen en subgroepen worden (dus) alleen gebruikt om te AND-en en OR-en
 **************************************************************************************/


// Deze functie creeert een filter-element. Dit kan een groep zijn (als de
// property e bestaat, of een bepaald type filter
function gis_ia_filter(filter, map_id, i, parent_filter) {
  for (var prop in filter) {
    if (filter.hasOwnProperty(prop)) {
      switch (prop) {
        case 'l':
          this[prop] = parseInt(filter[prop], 10);
          break;
        case 'e':
          this[prop] = [];
          for (var t = 0; t < filter.e.length; t++) {
            this[prop][this[prop].length] = new gis_ia_filter(filter.e[t], map_id, i + '.' + t, filter);
          }
          break;
        default:
          this[prop] = filter[prop];
          break;
      }
    }
  }
  this.map_id = map_id;
  this.i = ('' + i).replace(/\.+/g, '_');
  this.parent_filter = parent_filter;
}

// deze functie geeft per filter de benodigde id's (de base id van de checkbox,
// input e.d. maar ook bijbehorende id's.
gis_ia_filter.prototype.ID = function (postfix) {
  if (typeof (postfix) == 'undefined') {
    postfix = '';
  }
  return 'gis_ia_f_' + this.map_id + '_' + this.i + (postfix == '' ? '' : '_' + postfix);
};

// deze functie geeft per groep of filter de benodigde html **
// filterdefinitie-html
gis_ia_filter.prototype.html = function (depth) {
  var r = '', t;
  switch (this.t) {
    case 'g':
      if (this.b == '0' || depth != 0) {
        r += '<div>' + this.w + '</div><div id="' + this.ID('grp') + '">';
      }
      else {
        r += '<div class="gis_ia_f_g_t" onclick="gis_ia_filter_toggleTitle(' + this.map_id + ',' + this.i + ');">' + this.w + '</div><div id="' + this.ID('grp') + '" class="f2 gis_ia_f_g">';
      }
      for (t = 0; t < this.e.length; t++) {
        r += this.e[t].html(depth + 1);
      }
      r += '</div>';
      // toevoegen x_buttons als het een hoofdgroep is
      if (depth == 0) {
        r += '<div>';
        for (t = 0; t < this.e.length; t++) {
          r += this.e[t].x_button(1);
        }
        r += '</div>';
      }
      break;
    case 'a': // header
      switch (this.s) {
        case 'h2':
          r = '<h2>' + this.v + '</h2>';
          break;
        case 'h3':
          r = '<h3>' + this.v + '</h3>';
          break;
        default:
          r = '<div>' + this.v + '</div>';
          break;
      }
      break;
    case 'c': // checkbox
      r = this.x_button(2) + '<div id="' + this.ID() + '_parent"><input type="checkbox" id="' + this.ID() + '" onchange="gis_ia_filters.change(' + this.map_id + ',\'' + this.ID() + '\');" class="gis_ia_filters_checkbox"><label for="' + this.ID() + '" class="gis_ia_filters_checkbox">' + this.v + '</label></div>';
      break;
    case 'd': // list
      r = '<div>' + this.l0 + '</div>';
      var labels = this.v, tl;
      if (labels == '') {
        labels = [];
      }
      else {
        labels = labels.replace(/[\r\n]+/g, "\r");
        labels = labels.replace(/\n+/g, "\r");
        labels = labels.split("\r");
      }
      if (this.s == '0') {
        r += '<div id="' + this.ID() + '_parent"><div class="gis_ia_input gis_ia_input100">' + this.x_button(2) + '<div><span class="gis_ia_filters_arrow_down"></span><select id="' + this.ID() + '" name="' + this.ID() + '" onchange="gis_ia_filters.change(' + this.map_id + ',\'' + this.ID() + '\');" class="gis_ia_input"><option value="-1">' + this.p + '</option>';
        for (tl = 0; tl < labels.length; tl++) {
          r += '<option value="' + tl + '">' + labels[tl] + '</option>';
        }
        r += '</select></div></div>';
      }
      else {
        for (tl = 0; tl < labels.length; tl++) {
          r += this.x_button(2, tl);
          if (this.s == '1') {
            r += '<div id="' + this.ID() + '-' + tl + '_parent"><input type="radio" id="' + this.ID() + '-' + tl + '" name="' + this.ID() + '" onchange="gis_ia_filters.change(' + this.map_id + ',\'' + this.ID() + '\',' + tl + ');" class="gis_ia_filters_radio"><label for="' + this.ID() + '-' + tl + '" class="gis_ia_filters_radio">' + labels[tl] + '</label></div>';
          }
          else {
            r += '<div id="' + this.ID() + '-' + tl + '_parent"><input type="checkbox" id="' + this.ID() + '-' + tl + '" onchange="gis_ia_filters.change(' + this.map_id + ',\'' + this.ID() + '\',' + tl + ');" class="gis_ia_filters_checkbox"><label for="' + this.ID() + '-' + tl + '" class="gis_ia_filters_checkbox">' + labels[tl] + '</label></div>';
          }
        }
      }
      break;
    case 'i': // vrije tekst
      r = '<div>' + this.v + '</div><div id="' + this.ID() + '_parent"><input class="gis_ia_input" id="' + this.ID() + '" onchange="gis_ia_filters.change(' + this.map_id + ',\'' + this.ID() + '\');" placeholder="' + this.p + '">' + this.x_button(2) + '</div>';
      break;
    case 'vt': // van - tot
      r = '<div>' + this.l0 + '</div><div id="' + this.ID() + '_parent">';
      if (this.l1 == '') {
        r += '<div class="gis_ia_input gis_ia_input50"><div><input class="gis_ia_input" id="' + this.ID() + '-van" type="number" min="' + this.mi1 + '" max="' + this.ma1 + '" step="' + this.st1 + '" onchange="gis_ia_filters.change(' + this.map_id + ',\'' + this.ID() + '\',0);" placeholder="' + this.v1 + '"><span>' + this.x_button(2, 0) + '</span></div></div>';
      }
      else {
        var opts = '<option value="">' + this.v1 + '</option>', os = this.l1,
            ot;
        os = os.replace(/\r\n/g, String.fromCharCode(13));
        os = os.replace(/\n/g, String.fromCharCode(13));
        os = os.split(String.fromCharCode(13));
        for (ot = 0; ot < os.length; ot++) {
          opts += '<option>' + os[ot] + '</option>';
        }
        r += '<div class="gis_ia_input gis_ia_input50"><div><span class="gis_ia_filters_arrow_down"></span><select id="' + this.ID() + '-van" class="gis_ia_input" onchange="gis_ia_filters.change(' + this.map_id + ',\'' + this.ID() + '\',0);">' + opts + '</select><span>' + this.x_button(2, 0) + '</span></div></div>';
      }
      if (this.l2 == '') {
        r += '<div class="gis_ia_input gis_ia_input50"><div><input class="gis_ia_input" id="' + this.ID() + '-tot" type="number" min="' + this.mi2 + '" max="' + this.ma2 + '" step="' + this.st2 + '" onchange="gis_ia_filters.change(' + this.map_id + ',\'' + this.ID() + '\',1);" placeholder="' + this.v2 + '"><span>' + this.x_button(2, 1) + '</span></div></div>';
      }
      else {
        var opts = '<option value="">' + this.v2 + '</option>', os = this.l2,
            ot;
        os = os.replace(/\r\n/g, String.fromCharCode(13));
        os = os.replace(/\n/g, String.fromCharCode(13));
        os = os.split(String.fromCharCode(13));
        for (ot = 0; ot < os.length; ot++) {
          opts += '<option>' + os[ot] + '</option>';
        }
        r += '<div class="gis_ia_input gis_ia_input50"><div><span class="gis_ia_filters_arrow_down"></span><select id="' + this.ID() + '-tot" class="gis_ia_input" onchange="gis_ia_filters.change(' + this.map_id + ',\'' + this.ID() + '\',1);">' + opts + '</select><span>' + this.x_button(2, 1) + '</span></div></div>';
      }
      r += '</div>';
      break;
  }
  return r;
};

function gis_ia_filter_next_value(v, get_next, mi, ma, st, li) {
  if (v == '') {
    return '';
  }
  var t, vn = '';
  if (li == '') {
    st = (st > 0 ? st : 1);
    if (get_next) {
      vn = mi;
      while (vn <= v) {
        vn += st;
      }
    }
    else {
      vn = ma;
      while (vn >= v) {
        vn -= st;
      }
    }
    if (vn < mi || vn > ma) {
      vn = '';
    }
  }
  else {
    li = li.replace(/[\r\n]+/g, "\r");
    li = li.replace(/\n+/g, "\r");
    li = li.split("\r");
    if (get_next) {
      for (t = 0; t < li.length - 1; t++) {
        if (v == li[t]) {
          vn = li[t + 1];
          t = li.length;
        }
      }
    }
    else {
      for (t = li.length - 1; t > 0; t--) {
        if (v == li[t]) {
          vn = li[t - 1];
          t = 0;
        }
      }
    }
  }
  return vn;
}

// Deze functie handelt het wijzigen van een filter af, of geeft wijzigingen
// door aan element (als het een groep is) De functie draagt zorg voor het
// tonen/verbergen van bij dit filter behorende zaken zoals x_button's en
// panels De functie return de layer waar een wijziging plaats vindt, zodat de
// kaart data laat zien conform met de nieuwe filter ** filterdefinitie-change
gis_ia_filter.prototype.change = function (id, i) {
  if (this.t == 'g') { // groep
    var l;
    for (var t = 0; t < this.e.length; t++) {
      l = this.e[t].change(id, i);
      if (l >= 0) {
        return l;
      }
    }
  }
  else {
    if (this.ID() == id) {
      switch (this.t) {
        case 'c': // checkbox
          var el = jQuery('#' + id), x_buttons = jQuery('[fromid=' + id + ']'),
              t, inps = jQuery('#' + id + '_parent');
          if (el.prop('checked')) {
            x_buttons.show();
            if (this.x2 == '1') {
              inps.hide();
            }
            else {
              inps.show();
            }
          }
          else {
            x_buttons.hide();
            inps.show();
          }
          break;
        case 'd': // list
          var el, x_buttons, t, t1, labels = this.v, inps;
          if (labels == '') {
            labels = [];
          }
          else {
            labels = labels.replace(/[\r\n]+/g, "\r");
            labels = labels.replace(/\n+/g, "\r");
            labels = labels.split("\r");
          }
          if (this.s == '0') { // selectbox
            el = jQuery('#' + id);
            t1 = el.val();
            if (this.x2 == '1') {
              var arrow = jQuery(jQuery(el.parent()).children()[0]);
              if (t1 === '-1' || t1 === null) {
                el.removeClass('gis_ia_input_has_x');
                arrow.removeClass('gis_ia_arrow_down_has_x');
              }
              else {
                el.addClass('gis_ia_input_has_x');
                arrow.addClass('gis_ia_arrow_down_has_x');
              }
            }
            for (t = 0; t < labels.length; t++) {
              x_buttons = jQuery('[fromid=' + id + '-' + t + ']');
              if (t == t1) {
                x_buttons.show();
              }
              else {
                x_buttons.hide();
              }
            }
            x_buttons = jQuery('[fromid=' + id + ']');
            if (t1 !== '-1' && t1 !== null) {
              x_buttons.show();
            }
            else {
              x_buttons.hide();
            }
          }
          else { // checkboxes of radio
            for (t = 0; t < labels.length; t++) {
              el = jQuery('#' + id + '-' + t);
              x_buttons = jQuery('[fromid=' + id + '-' + t + ']');
              inps = jQuery('#' + id + '-' + t + '_parent');
              if (el.prop('checked')) {
                x_buttons.show();
                if (this.x2 == '1') {
                  inps.hide();
                }
                else {
                  inps.show();
                }
              }
              else {
                x_buttons.hide();
                inps.show();
              }
            }
          }
          break;
        case 'i': // vrije tekst
          var el = jQuery('#' + id), x_buttons = jQuery('[fromid=' + id + ']'),
              t, x_spans, vv = el.val();
          if (vv != '') {
            x_spans = x_buttons.find('.gis_ia_f_x_i');
            x_spans.html(this.v + ' ' + vv);
            x_buttons.show();
            el.addClass('gis_ia_input_has_x');
          }
          else {
            x_buttons.hide();
            el.removeClass('gis_ia_input_has_x');
          }
          break;
        case 'vt': // van - tot
          var el1 = jQuery('#' + id + '-van'), el2 = jQuery('#' + id + '-tot'),
              x_buttons = jQuery('[fromid=' + id + ']');
          var s1 = el1.val(), s2 = el2.val();
          if (this.x2 == '1') {
            if (s1 == '') {
              jQuery(jQuery(el1.removeClass('gis_ia_input_has_x').parent()).children()[0]).removeClass('gis_ia_arrow_down_has_x');
            }
            else {
              jQuery(jQuery(el1.addClass('gis_ia_input_has_x').parent()).children()[0]).addClass('gis_ia_arrow_down_has_x');
            }
            if (s2 == '') {
              jQuery(jQuery(el2.removeClass('gis_ia_input_has_x').parent()).children()[0]).removeClass('gis_ia_arrow_down_has_x');
            }
            else {
              jQuery(jQuery(el2.addClass('gis_ia_input_has_x').parent()).children()[0]).addClass('gis_ia_arrow_down_has_x');
            }
          }
          if (s1 != '' || s2 != '') {
            if (parseInt(s1, 10) >= parseInt(s2, 10)) {
              if (i == 0) { // de van waarde is veranderd; pas tot aan...
                s2 = gis_ia_filter_next_value(parseInt(s1, 10), true, parseInt(this.mi2, 10), parseInt(this.ma2, 10), parseInt(this.st2, 10), this.l2);
                el2.val(s2);
              }
              else { // de tot waarde is verandert, pas van aan...
                s1 = gis_ia_filter_next_value(parseInt(s2, 10), false, parseInt(this.mi1, 10), parseInt(this.ma1, 10), parseInt(this.st1, 10), this.l1);
                el1.val(s1);
              }
            }
            jQuery('.' + id + '_span').html((s1 == '' ? '&hellip;' : s1) + ' - ' + (s2 == '' ? '&hellip;' : s2));
            var t, el, id;
            for (t = 0; t < x_buttons.length; t++) {
              el = jQuery(x_buttons[t]);
              id = el.prop('id');
              if (id == this.ID() + '-xx-van') {
                if (i == 0) {
                  if (s1 != '') {
                    el.show();
                  }
                  else {
                    el.hide();
                  }
                }
              }
              else {
                if (id == this.ID() + '-xx-tot') {
                  if (i == 1) {
                    if (s2 != '') {
                      el.show();
                    }
                    else {
                      el.hide();
                    }
                  }
                }
                else {
                  el.show();
                }
              }
            }
          }
          else {
            x_buttons.hide();
          }
          break;
      }
      return this.l;
    }
    return -1;
  }
};

// Deze functie handelt een keydown van een filter af
// ** filterdefinitie-change
gis_ia_filter.prototype.keydown = function (id, i) {
  if (this.t == 'g') { // groep
    var l;
    for (var t = 0; t < this.e.length; t++) {
      l = this.e[t].keydown(id, i);
      if (l >= 0) {
        return l;
      }
    }
  }
  else {
    if (this.ID() == id) {
      switch (this.t) {
        case 'vt': // van - tot
          break;
      }
      return this.l;
    }
    return -1;
  }
};

// Deze functie geeft per filter een knop terug die kan worden gebruikt in de
// main-group of in de groep waarin de filter zit (of in beide) **
// filterdefinitie-x-button
gis_ia_filter.prototype.x_button = function (xno, i) {
  var r = '', t;
  switch (this.t) {
    case 'g': // groep
      for (t = 0; t < this.e.length; t++) {
        r += this.e[t].x_button(xno);
      }
      break;
    case 'c': // checkbox
      if ((this.x0 == '1' && xno == 0) || (this.x1 == '1' && xno == 1) || (this.x2 == '1' && xno == 2)) {
        r = '<div class="gis_ia_f_f_x" style="display: none;" fromid="' + this.ID() + '"><a class="gis_ia_f_f_xx" onclick="gis_ia_filters.x(' + this.map_id + ',\'' + this.ID() + '\');"><span>' + this.v + '</span></a></div>';
      }
      break;
    case 'd': // list
      var labels = this.v;
      if ((this.x0 == '1' && xno == 0) || (this.x1 == '1' && xno == 1) || (this.x2 == '1' && xno == 2)) {
        if (labels == '') {
          labels = [];
        }
        else {
          labels = labels.replace(/[\r\n]+/g, "\r");
          labels = labels.replace(/\n+/g, "\r");
          labels = labels.split("\r");
        }
        if (typeof (i) == 'undefined') {
          if (this.s == '0' && xno == 2) {
            r += '<div class="gis_ia_f_f_x gis_ia_f_f_x_simple" style="display: none;" fromid="' + this.ID() + '"><a class="gis_ia_f_f_xx" onclick="gis_ia_filters.x(' + this.map_id + ',\'' + this.ID() + '\');"><span>&nbsp;</span></a></div>';
          }
          else {
            for (t = 0; t < labels.length; t++) {
              r += '<div class="gis_ia_f_f_x" style="display: none;" fromid="' + this.ID() + '-' + t + '"><a class="gis_ia_f_f_xx" onclick="gis_ia_filters.x(' + this.map_id + ',\'' + this.ID() + '\',' + t + ');"><span>' + labels[t] + '</span></a></div>';
            }
          }
        }
        else {
          r += '<div class="gis_ia_f_f_x" style="display: none;" fromid="' + this.ID() + '-' + i + '"><a class="gis_ia_f_f_xx" onclick="gis_ia_filters.x(' + this.map_id + ',\'' + this.ID() + '\',' + i + ');"><span>' + labels[i] + '</span></a></div>';
        }
      }
      break;
    case 'i': // vrije tekst
      if ((this.x0 == '1' && xno == 0) || (this.x1 == '1' && xno == 1)) {
        r = '<div class="gis_ia_f_f_x" style="display: none;" fromid="' + this.ID() + '"><a class="gis_ia_f_f_xx" onclick="gis_ia_filters.x(' + this.map_id + ',\'' + this.ID() + '\');"><span class="gis_ia_f_x_i"></span></a></div>';
      }
      if (this.x2 == '1' && xno == 2) {
        r = '<div class="gis_ia_f_f_x gis_ia_f_f_x_simple" style="display: none;" fromid="' + this.ID() + '"><a class="gis_ia_f_f_xx" onclick="gis_ia_filters.x(' + this.map_id + ',\'' + this.ID() + '\');"><span>&nbsp;</span></a></div>';
      }
      break;
    case 'vt': // van - tot
      if ((this.x0 == '1' && xno == 0) || (this.x1 == '1' && xno == 1)) {
        r = '<div class="gis_ia_f_f_x" style="display: none;" fromid="' + this.ID() + '"><a class="gis_ia_f_f_xx" onclick="gis_ia_filters.x(' + this.map_id + ',\'' + this.ID() + '\',' + i + ');"></a><span class="' + this.ID() + '_span"></span></div>';
      }
      if (this.x2 == '1' && xno == 2) {
        r = '<div class="gis_ia_f_f_x" id="' + this.ID() + '-xx-' + (i == 0 ? 'van' : 'tot') + '" style="display: none; position: absolute; top: 0; right: -10px;" fromid="' + this.ID() + '"><a class="gis_ia_f_f_xx" onclick="gis_ia_filters.x(' + this.map_id + ',\'' + this.ID() + '\',' + i + ');"></a></div>';
      }
      break;
  }
  return r;
};

// Deze functie handelt het klikken op de X af
// ** filterdefinitie-x-button-afhandeling
gis_ia_filter.prototype.x = function (id, i) {
  if (this.t == 'g') {
    for (var t = 0; t < this.e.length; t++) {
      this.e[t].x(id, i);
    }
  }
  else {
    if (id == this.ID()) {
      switch (this.t) {
        case 'c': // checkbox
          jQuery('#' + id).prop('checked', false);
          break;
        case 'd': // list
          if (this.s == '0') {
            var el = jQuery('#' + id);
            el.val('');
            el.removeClass('gis_ia_input_has_x');
            jQuery(jQuery(el.parent().children()[0])).removeClass('gis_ia_arrow_down_has_x');
            el = jQuery(el.parent());
            jQuery(jQuery(el.parent().children()[0])).hide();
          }
          else {
            jQuery('#' + id + '-' + i).prop('checked', false);
          }
          break;
        case 'i': // vrije tekst
          jQuery('#' + id).val('');
          break;
        case 'vt': // van - tot
          if (typeof (i) == 'undefined') { // gehele filter uitzetten
            jQuery('#' + id + '-van').val('');
            jQuery('#' + id + '-tot').val('');
            //jQuery('[fromid='+id+']').hide();
          }
          else {
            if (i == 0) {
              jQuery('#' + id + '-van').val('');
            }
            if (i == 1) {
              jQuery('#' + id + '-tot').val('');
            }
          }
          break;
      }
    }
  }
};

// Deze functie leest de actuele waarde van de gewenste filter uit het
// HTML-element en returnt het cql-filter ** filterdefinitie-cql-filter
gis_ia_filter.prototype.cql_filter = function (changed_layer) {
  var r = '', t, t1, operator, el, r1;
  if (this.t == 'g') {
    for (t = 0, t1 = 0; t < this.e.length; t++) {
      r1 = this.e[t].cql_filter(changed_layer);
      if (r1 != '') {
        r += (r == '' ? '' : (this.s != 'of' ? ' AND ' : ' OR ')) + r1;
        t1++;
      }
    }
    if (t1 > 1) {
      r = '(' + r + ')';
    }
  }
  else {
    if (this.l == changed_layer) {
      switch (this.t) {
        case 'c': // checkbox
          el = jQuery('#' + this.ID());
          if (el.prop('checked')) {
            switch (this.s) {
              case '0':
                operator = '=';
                break;
              case '1':
                operator = '<';
                break;
              case '2':
                operator = '<=';
                break;
              case '3':
                operator = '>';
                break;
              case '4':
                operator = '>=';
                break;
              case '5':
                operator = '<>';
                break;
            }
            r = this.f + operator + '\'' + this.w + '\'';
          }
          break;
        case 'd': // list
          r = '', aant = 0;
          var els = false, t2, waardes = this.w, wt;
          if (this.s != '0') {
            els = jQuery('input[id^=' + this.ID() + '-]');
          }
          else {
            t3 = parseInt(jQuery('#' + this.ID()).val(), 10);
          }
          waardes = waardes.replace(/[\r\n]+/g, "\r");
          waardes = waardes.replace(/\n+/g, "\r");
          waardes = waardes.split("\r");
          // waardes[t2] is het element dat bepaalt waarop wordt gefilterd.
          // De syntax is: [ waarde0 ] [ operator ] waarde1
          // Als waarde0 niet is gespecificeerd, dan wordt waarde1 van
          // waardes[t2-1] gebruikt. Als operator niet is gespecificeerd, dan
          // wordt < gebruikt. Als t2 == 0 en waarde0 is niet gespecificeerd,
          // dan wordt de where clause: veld operand waarde1 Als t2 >= 1 en
          // waarde0 is gespecificeerd, dan wordt de where clause: (veld
          // operand waarde0 AND veld operand waarde1) Als t2 >= 1 en waarde0
          // is niet gespecificeerd, dan wordt de where clause: (veld operand
          // waarde1 van (t3-1) AND veld operand waarde1)
          for (t2 = 0; t2 < waardes.length; t2++) {
            if ((els && jQuery(els[t2]).prop('checked')) || (!els && t2 == t3)) {
              if (this.o == '0') { // veld = categorie
                r += (r == '' ? '' : (this.s == '1' ? ' AND ' : ' OR ')) + this.f + '=\'' + waardes[t2] + '\'';
                aant++;
              }
              else { // < waarde0 <waarde1: waarde0 < veld < waarde1
                var waardesplit = waardes[t2], c, op1 = '', w1 = '', op2 = '',
                    w2 = '';
                while (waardesplit.substr(0, 1) == ' ') {
                  waardesplit = waardesplit.substr(1);
                }
                switch (waardesplit.substr(0, 1)) {
                  case '<':
                    if (waardesplit.substr(1, 1) == '=') {
                      op1 = '<=';
                      waardesplit = waardesplit.substr(2);
                    }
                    else {
                      op1 = '<';
                      waardesplit = waardesplit.substr(1);
                    }
                    break;
                  case '>':
                    if (waardesplit.substr(1, 1) == '=') {
                      op1 = '>=';
                      waardesplit = waardesplit.substr(2);
                    }
                    else {
                      op1 = '>';
                      waardesplit = waardesplit.substr(1);
                    }
                    break;
                  case '=':
                    op1 = '=';
                    waardesplit = waardesplit.substr(1);
                    break;
                }
                while (waardesplit.substr(0, 1) == ' ') {
                  waardesplit = waardesplit.substr(1);
                }
                c = waardesplit.substr(0, 1);
                while (c != ' ' && c != '' && c != '<' && c != '>' && c != '=') {
                  w1 += c;
                  waardesplit = waardesplit.substr(1);
                  c = waardesplit.substr(0, 1);
                }
                while (waardesplit.substr(0, 1) == ' ') {
                  waardesplit = waardesplit.substr(1);
                }
                if (waardesplit != '') {
                  switch (waardesplit.substr(0, 1)) {
                    case '<':
                      if (waardesplit.substr(1, 1) == '=') {
                        op2 = '<=';
                        waardesplit = waardesplit.substr(2);
                      }
                      else {
                        op2 = '<';
                        waardesplit = waardesplit.substr(1);
                      }
                      break;
                    case '>':
                      if (waardesplit.substr(1, 1) == '=') {
                        op2 = '>=';
                        waardesplit = waardesplit.substr(2);
                      }
                      else {
                        op2 = '>';
                        waardesplit = waardesplit.substr(1);
                      }
                      break;
                    case '=':
                      op2 = '=';
                      waardesplit = waardesplit.substr(1);
                      break;
                  }
                  while (waardesplit.substr(0, 1) == ' ') {
                    waardesplit = waardesplit.substr(1);
                  }
                  c = waardesplit.substr(0, 1);
                  while (c != ' ' && c != '' && c != '<' && c != '>' && c != '=') {
                    w2 += c;
                    waardesplit = waardesplit.substr(1);
                    c = waardesplit.substr(0, 1);
                  }
                }
                if (op2 != '' && w2 != '') {
                  r += (r == '' ? '' : (this.s == '1' ? ' AND ' : ' OR ')) + (this.s == '2' ? '(' : '') + this.f + op1 + '\'' + w1 + '\' AND ' + this.f + op2 + '\'' + w2 + '\'' + (this.s == '2' ? ')' : '');
                }
                else {
                  r += (r == '' ? '' : (this.s == '1' ? ' AND ' : ' OR ')) + this.f + op1 + '\'' + w1 + '\'';
                }
                aant++;
              }
            }
          }
          if (aant > 1) {
            r = '(' + r + ')';
          }
          break;
        case 'i': // vrije tekst
          el = jQuery('#' + this.ID());
          if (el.val() != '') {
            switch (this.s) {
              case '0':
                r = this.f + '=\'' + el.val() + '\'';
                break;
              case '1':
                r = this.f + ' like \'%' + el.val() + '%\'';
                break;
            }
          }
          break;
        case 'vt': // van - tot
          var el1 = jQuery('#' + this.ID() + '-van'),
              el2 = jQuery('#' + this.ID() + '-tot'), v1 = el1.val(),
              v2 = el2.val();
          if (v1 == null) {
            v1 = '';
          }
          if (v2 == null) {
            v2 = '';
          }
          if (v1 != '' || v2 != '') {
            switch (this.w) {
              case '0':
                if (v1 != '') {
                  r = this.f + '>=' + v1;
                }
                if (v2 != '') {
                  r = (r == '' ? '' : '(' + r + ' AND ') + this.f + '<' + v2 + (r == '' ? '' : ')');
                }
                break;
              case '1':
                if (v1 != '') {
                  r = this.f + '>' + v1;
                }
                if (v2 != '') {
                  r = (r == '' ? '' : '(' + r + ' AND ') + this.f + '<=' + v2 + (r == '' ? '' : ')');
                }
                break;
              case '2':
                if (v1 != '') {
                  r = this.f + '>=' + v1;
                }
                if (v2 != '') {
                  r = (r == '' ? '' : '(' + r + ' AND ') + this.f + '<=' + v2 + (r == '' ? '' : ')');
                }
                break;
              case '3':
                if (v1 != '') {
                  r = this.f + '>' + v1;
                }
                if (v2 != '') {
                  r = (r == '' ? '' : '(' + r + ' AND ') + this.f + '<' + v2 + (r == '' ? '' : ')');
                }
                break;
            }
          }
          break;
      }
    }
  }
//  console.log(r);
  return r;
};

var gis_ia_filters = {
  // deze functie return de HTML voor alle filter elementen
  html: function (map_id) {
    var t, t1 = GIS_ia_maps[map_id].fs.length, r = '<div class="gis_ia_f_x">';
    if (t1 == 0) {
      return '';
    }
    for (t = 0; t < t1; t++) {
      r += GIS_ia_maps[map_id].fs[t].x_button(0);
    }
    r += '</div>';
    for (t = 0; t < t1; t++) {
      r += GIS_ia_maps[map_id].fs[t].html(0);
    }
    r = '<div><div class="gis_ia_f_def">Filters</div><div class="gis_ia_no_filters" id="gis_ia_no_filters_' + map_id + '">0 Filters</div><button class="gis_ia_filters_button" onclick="gis_ia_filters.reset(' + map_id + ');">Verwijder filters</button></div>' + r;
    return r;
  },
  // deze functie geeft change signaal aan het juiste element (zodat beeld kan
  // worden bijgewerkt) en handelt  het updaten van de juiste kaartlaag af.
  change: function (map_id, id, i) {
    document.getElementById('popup-closer' + map_id).onclick(); // verberg evt.
                                                                // popup
    var t, t1 = GIS_ia_maps[map_id].fs.length, t2, changed_layer,
        cql_filter = '', r1;
    for (var t = 0; t < t1; t++) {
      changed_layer = GIS_ia_maps[map_id].fs[t].change(id, i);
      if (changed_layer >= 0) {
        // zorg dat de kaart de juiste data laat zien
        for (t2 = 0; t2 < t1; t2++) {
          r1 = GIS_ia_maps[map_id].fs[t2].cql_filter(changed_layer, cql_filter);
          if (r1 != '') {
            cql_filter += (cql_filter == '' ? '' : ' AND ') + r1;
          }
        }
        console.log('cql_filter: ' + cql_filter);
        if (cql_filter != '') {
          GIS_ia_maps[map_id].layers[changed_layer].getSource().updateParams({cql_filter: cql_filter});
        }
        else {
          delete GIS_ia_maps[map_id].layers[changed_layer].getSource().getParams().cql_filter;
          GIS_ia_maps[map_id].layers[changed_layer].getSource().updateParams({});
        }
      }
    }
    this.gis_ia_setNumber(map_id);
  },
  // deze functie geeft change signaal aan het juiste element (zodat beeld kan
  // worden bijgewerkt)
  keydown: function (map_id, id, i) {
    document.getElementById('popup-closer' + map_id).onclick(); // verberg evt.
                                                                // popup
    var t, t1 = GIS_ia_maps[map_id].fs.length;
    for (var t = 0; t < t1; t++) {
      GIS_ia_maps[map_id].fs[t].keydown(id, i);
    }
  },

  // deze functie wordt aangeroepen als een 'schaduw' veld wordt aangeklikt om
  // een filter te verwijderen hier worden het 'hoofd' veld aangepast en evt.
  // visuele aspecten afgehandeld
  x: function (map_id, id, i) {
    gis_ia_filters_hideSubmenus();
    var t, t1 = GIS_ia_maps[map_id].fs.length, l;
    for (var t = 0; t < t1; t++) {
      GIS_ia_maps[map_id].fs[t].x(id, i);
    }
    this.change(map_id, id, i);
  },
  reset: function (map_id) {
    var t, t1, f, this_ = this;

    jQuery('[id^=gis_ia_f2_' + map_id + '_]').val('');
    jQuery('[id^=gis_ia_f_' + map_id + '_]').each(function (t, el) {
      el = jQuery(el);
      switch (el.prop('tagName')) {
        case 'INPUT':
          switch (el.attr('type')) {
            case 'checkbox':
            case 'radio':
              el.prop('checked', false);
              jQuery(el.parent()).show();
              break;
            default:
              el.val('');
              break;
          }
          break;
        case 'SELECT':
          el.val(-1);
          break;
      }
      this_.change(map_id, el.prop('id'));
    });
    jQuery('.gis_ia_f_f_x').hide();
    gis_ia_filters_hideSubmenus();
//    for (t=0;t<GIS_ia_maps[map_id].fs.length;t++) {
//      jQuery('#gis_ia_f_'+map_id+'_'+t+'_grp_x').find('gis_ia_filter_c_x').hide();
// }
    for (t = 0; t < GIS_ia_maps[map_id].layers_def.length; t++) {
      if (typeof (GIS_ia_maps[map_id].layers[t].getSource().getParams().cql_filter) != 'undefined') {
        delete GIS_ia_maps[map_id].layers[t].getSource().getParams().cql_filter;
        GIS_ia_maps[map_id].layers[t].getSource().updateParams();
      }
    }
    this.gis_ia_setNumber(map_id);
  },
  gis_ia_setNumber: function (map_id) {
    var id, html, aantal = 0, ids = [];
    jQuery('[id^=gis_ia_f_' + map_id + '_]').each(function (t, el) {
      el = jQuery(el);
      switch (el.prop('tagName')) {
        case 'INPUT':
          switch (el.attr('type')) {
            case 'checkbox':
              if (el.prop('checked')) {
                aantal++;
              }
              break;
            case 'radio':
              if (el.prop('checked')) {
                aantal++;
              }
              break;
            default:
              if (el.val() != '') {
                id = el.prop('id');
                if (id.substr(-4) == '-van') {
                  ids[ids.length] = id;
                }
                if (id.substr(-4) == '-tot') {
                  if (ids.indexOf(id.substr(0, id.length - 4) + '-van') == -1) {
                    aantal++;
                  }
                }
                else {
                  aantal++;
                }
              }
              break;
          }
          break;
        case 'SELECT':
          if (el.val() != '' && el.val() != -1 && el.val() !== null) {
            id = el.prop('id');
            if (id.substr(-4) == '-van') {
              ids[ids.length] = id;
            }
            if (id.substr(-4) == '-tot') {
              if (ids.indexOf(id.substr(0, id.length - 4) + '-van') == -1) {
                aantal++;
              }
            }
            else {
              aantal++;
            }
          }
          break;
      }
    });
    html = aantal + ' Filter' + (aantal == 1 ? '' : 's');
    jQuery('#gis_ia_no_filters_' + map_id).html(html);
    //jQuery('#gis_ia_options_button_'+map_id).html(html);
  }
};

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["openlayers"], factory);
  }
  else if (typeof module === "object" && module.exports) {
    module.exports = factory(require("openlayers"));
  }
  else {
    root.Filter = factory(root.ol);
  }
}(this, function (ol) {
  /**
   * OpenLayers v3/v4 Filter Control.
   * @constructor
   * @extends {ol.control.Control}
   * @param {Object} opt_options Control options, extends
   *     olx.control.ControlOptions adding:
   *                              **`tipLabel`** `String` - the button tooltip.
   */
  ol.control.Filter = function (opt_options) {

    var options = opt_options || {};

    var map_id = options.map_id ? options.map_id : -1;
    var tipLabel = options.tipLabel ? options.tipLabel : 'Stel filtering in';
    this.hiddenClassName = 'ol-unselectable ol-control' + (options.className ? ' ' + options.className : '');
    this.shownClassName = 'shown';

    var element = document.createElement('div');
    element.className = this.hiddenClassName;
    var button = document.createElement('button');
    button.setAttribute('title', 'Filtering');
    button.setAttribute('id', 'gis_ia_options_button_' + map_id);
    button.innerHTML = 'Opties'; // was ooit '0 Filters';
    button.className = 'gis_ia_options_button gis_ia_options_button';
    element.appendChild(button);
    button.onclick = function (e) {
      e = e || window.event;
      e.preventDefault();
      gis_ia_hidePanels(map_id);
      jQuery('#f1b-' + map_id).show();
      jQuery('#f3b-' + map_id).show();
      if (GIS_ia_maps[map_id].pw.substr(0, 1) === '1' && !GIS_ia_maps[map_id].isFullscreen) {
        var w_kaart = jQuery('#gis_ia_base_' + map_id).width(),
            w_links = jQuery('#gis_ia_base_' + map_id).offset().left,
            w_filters = parseInt(GIS_ia_maps[map_id].pw.substr(1, 1)) * 20 + 180;
        w_filters += 20; // padding left + padding right
        jQuery('#f2-' + map_id).hide();
        if ((w_filters + 20) <= w_links) { // er is niet genoeg ruimte om naar links schuiven
          jQuery('#gis_ia_filters_' + map_id).css({
            'right': w_kaart + 'px',
            'left': 'initial'
          });
          jQuery('#f2-' + map_id).toggle('slide', {'direction': 'right'});
        }
        else { // Je kunt gewoon naar links schuiven
          jQuery('#gis_ia_filters_' + map_id).css({
            'left': (-w_links + 20) + 'px',
            'right': 'initial'
          });
          if (w_filters - w_links < 100) { // er is flink wat ruimte
            jQuery('#f2-' + map_id).toggle('slide', {'direction': 'right'});
          }
          else { // er is nauwelijks ruimte
            jQuery('#f2-' + map_id).toggle('slide', {'direction': 'left'});
          }
        }
      }
      else {
        jQuery('#gis_ia_filters_' + map_id).css({
          'right': 'initial',
          'left': 'initial'
        });
        jQuery('#f2-' + map_id).toggle('slide');
      }
      jQuery('#gis_ia_options_button_' + map_id).hide();
    };
    ol.control.Control.call(this, {element: element, target: options.target});
  };
  ol.inherits(ol.control.Filter, ol.control.Control);
  var Filter = ol.control.Filter;
  return Filter;
}));


(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["openlayers"], factory);
  }
  else if (typeof module === "object" && module.exports) {
    module.exports = factory(require("openlayers"));
  }
  else {
    root.ScaleBar2 = factory(root.ol);
  }
}(this, function (ol) {
  /**
   * OpenLayers v3/v4 Scalebar Control.
   * @constructor
   * @extends {ol.control.Control}
   * @param {Object} opt_options Control options, extends
   *     olx.control.ControlOptions adding:
   *                              **`tipLabel`** `String` - the button tooltip.
   */
  ol.control.ScaleBar2 = function (opt_options) {

    var options = opt_options || {};

    var map_id = options.map_id ? options.map_id : -1;
    var tipLabel = options.tipLabel ? options.tipLabel : 'Schaal';

    var element = document.createElement('div');
    element.className = 'ol-unselectable ol-control' + (typeof (options['className']) == 'undefined' ? '' : ' ' + options['className']);
    element.setAttribute('id', 'ScaleBar2_' + map_id);

    jQuery(element).append('<table><tr><td colspan="6" id="scalebar2Title_' + map_id + '" class="scalebarTxt"></td></tr><tr><td></td><td class="lo"></td><td class="o"></td><td class="lo"></td><td class="o"></td><td class="l"></td></tr><tr><td></td><td class="l"></td><td class="l"></td><td class="l"></td><td class="l"></td><td class="l"></td></tr><tr><td colspan="2" id="scalebar2G0_' + map_id + '" class="scalebarTxt">0</td><td colspan="2" id="scalebar2G1_' + map_id + '" class="scalebarTxt"></td><td colspan="2" id="scalebar2G2_' + map_id + '" class="scalebarTxt"></td></tr></table>');
    ol.control.Control.call(this, {element: element, target: options.target});
  };
  ol.inherits(ol.control.ScaleBar2, ol.control.Control);
  var ScaleBar2 = ol.control.ScaleBar2;
  return ScaleBar2;
}));

// Deze functie update de Scalebar op een bepaalde kaart, als de schaal
// verandert. Parameters:    map_id;    Integer; map ID old_scale;  Float; Oude
// schaal
function ScaleBar2Set(map_id, old_scale) {
  var v = GIS_ia_maps[map_id].map.getView();
  var scale = v.getResolution();
  var wpixels = jQuery('#gis_ia_map_' + map_id).parent().width(); // breedte vd
                                                                  // kaart
  var meterperpix = (scale / v.getMaxResolution() * (GIS_ia_maps[map_id].extNL[2] - GIS_ia_maps[map_id].extNL[0])) / wpixels;

  var b = 30 * meterperpix, b2, sg, g1, g2, w, u = 'meter';
  b2 = '' + b;
  b2 = b2.replace('.', '') + '0000';
  while (b2.substr(0, 1) == '0') {
    b2 = b2.substr(1);
  }
  b2 = parseInt(b2.substr(0, 2), 10);
  if (b2 < 10) {
    sg = 1;
  }
  else if (b2 < 20) {
    sg = 2;
  }
  else if (b2 < 25) {
    sg = 2.5;
  }
  else if (b2 < 50) {
    sg = 5;
  }
  else {
    sg = 1;
  }
  g1 = sg;
  if (b < g1) {
    while (g1 / 10 > b) {
      g1 /= 10;
    }
  }
  else {
    while (g1 < b) {
      g1 *= 10;
    }
  }
  w = g1 / meterperpix;
  if (g1 >= 1000) {
    u = 'kilometer';
    g1 /= 1000;
  }
  g2 = 2 * g1;
  // teken schaalbar a[f]
  document.getElementById('scalebar2Title_' + map_id).innerHTML = u;
  document.getElementById('scalebar2G1_' + map_id).innerHTML = g1;
  document.getElementById('scalebar2G2_' + map_id).innerHTML = g2;
  jQuery('#ScaleBar2_' + map_id).css({
    'width': (3 * w) + 'px',
    'margin-left': (-w / 2 + 4) + 'px'
  });
}

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["openlayers"], factory);
  }
  else if (typeof module === "object" && module.exports) {
    module.exports = factory(require("openlayers"));
  }
  else {
    root.Legenda = factory(root.ol);
  }
}(this, function (ol) {
  ol.control.Legenda = function (opt_options) {
    var options = opt_options || {};
    var map_id = options.map_id ? options.map_id : -1;
    var tipLabel = options.tipLabel ? options.tipLabel : 'Toon legenda';
    this.hiddenClassName = 'ol-unselectable ol-control ' + options.className;
    this.shownClassName = 'shown';
    var element = document.createElement('div');
    element.className = this.hiddenClassName;
    var button = document.createElement('button');
    button.setAttribute('title', tipLabel);
    element.appendChild(button);
    this.panel = document.createElement('div');
    this.panel.className = 'panel';
    element.appendChild(this.panel);

    this.map_id = map_id;
    var t, d, layers = document.createElement('div'),
        legendas = document.createElement('div');
    layers.setAttribute('current', '-1');
    for (t = 0; t < GIS_ia_maps[map_id].layers.length; t++) {
      d = document.createElement('div');
      d.setAttribute('id', 'gis_ia_' + map_id + '_' + t + '_legenda_lay');
      d.setAttribute('style', 'display: none;');
      d.innerHTML = GIS_ia_maps[map_id].layers_def[t].title;
      layers.appendChild(d);
      d = document.createElement('div');
      d.setAttribute('id', 'gis_ia_' + map_id + '_' + t + '_legenda_leg');
      d.setAttribute('style', 'display: none;');
      d.className = 'wait-cursor gis_ia_' + map_id + '_' + t + '_legenda_leg2';
      legendas.appendChild(d);
    }
    this.panel.appendChild(layers);
    this.panel.appendChild(legendas);
    this.layers = jQuery(layers);

    var this_ = this;
    button.onclick = function (e) {
      e = e || window.event;
      if (jQuery(jQuery(this).parent()).find('.panel').css('display') == 'none') {
        this_.showPanel(map_id);
      }
      else {
        this_.hidePanel();
      }
      e.preventDefault();
    };
    ol.control.Control.call(this, {
      element: element,
      target: options.target
    });
  }
  ;
  ol.inherits(ol.control.Legenda, ol.control.Control);
  ol.control.Legenda.prototype.showPanel = function () {
    jQuery(this.panel).css('max-height', (jQuery('#gis_ia_map_' + this.map_id).height() - 68) + 'px');
    // Als alle lagen verborgen zijn, toon dan de eerst zichtbare
    var t, current, current_oud = parseInt(this.layers.attr('current'), 10);
    current = current_oud;
    if (current >= 0) {
      if (!GIS_ia_maps[this.map_id].layers[current].getVisible()) {
        current = -1;
      }
    }
    if (current == -1) {
      for (t = 0; t < GIS_ia_maps[this.map_id].layers.length; t++) {
        if (GIS_ia_maps[this.map_id].layers[t].getVisible()) {
          current = t;
          t = GIS_ia_maps[this.map_id].layers.length;
        }
      }
    }
    if (current == -1) {
      current = 0;
    }
    if (current != current_oud) {
      if (current_oud >= 0) {
        jQuery('#gis_ia_' + this.map_id + '_' + current_oud + '_legenda_leg').hide();
        jQuery('#gis_ia_' + this.map_id + '_' + current_oud + '_legenda_lay').hide();
      }
      jQuery('#gis_ia_' + this.map_id + '_' + current + '_legenda_leg').show();
      jQuery('#gis_ia_' + this.map_id + '_' + current + '_legenda_lay').show();
      this.layers.attr('current', current);
    }
    gis_ia_hidePanels(this.map_id);
    jQuery(this.panel).show();
    if (current >= 0) {
      gis_ia_showLegend(this.map_id, current, 2);
    }
  };
  ol.control.Legenda.prototype.hidePanel = function () {
    jQuery(this.panel).hide();
  };
  var Legenda = ol.control.Legenda;
  return Legenda;
}));

var gis_ia_filterwindowCheck_ = '';

function gis_ia_filterwindowCheckHide(map_id) {
  if (jQuery('.gis_ia_base').hasClass('gis_ia_as_block')) {
    jQuery('#f3a-' + map_id).hide();
    jQuery('#f1b-' + map_id).hide();
    jQuery('#f3b-' + map_id).hide();
    jQuery('#f2-' + map_id).show();
    jQuery('#gis_ia_options_button_' + map_id).hide();
  }
  else {
    jQuery('#f3a-' + map_id).show();
    jQuery('#f1b-' + map_id).show();
    jQuery('#f3b-' + map_id).show();
    jQuery('#f2-' + map_id).hide();
    jQuery('#gis_ia_options_button_' + map_id).show();
  }
  gis_ia_filters_hideSubmenus();
}

function gis_ia_filter_toggleTitle(map_id, i) {
  document.getElementById('popup-closer' + map_id).onclick(); // verberg evt.
                                                              // popup
  var el = jQuery('#gis_ia_f_' + map_id + '_' + i + '_grp');
  if (el.css('display') == 'none') {
    gis_ia_filters_hideSubmenus();
    el.show();
  }
  else {
    el.hide();
  }
}

function gis_ia_filters_hideSubmenus() {
  jQuery('.gis_ia_filters').find('.gis_ia_f_g').hide();
}

function gis_ia_filterwindowCheck(map_id) {
  var base = jQuery('#gis_ia_base_' + map_id), w = base.width();
//console.log('base width='+w);
  if (w != gis_ia_filterwindowCheck_) {
    gis_ia_filterwindowCheck_ = w;
    if ((GIS_ia_maps[map_id].hasFilter || GIS_ia_maps[map_id].l.substr(0, 1) !== '0') && (w >= 1000 || (GIS_ia_maps[map_id].isFullscreen && w > 600))) { // switch naar 'vast' filter-block
      jQuery('#gis_ia_options_button_' + map_id).hide();
      jQuery('#f3a-' + map_id).show();
      jQuery('#f1b-' + map_id).hide();
      jQuery('#f3b-' + map_id).hide();
      jQuery('#f2-' + map_id).show();
      base.addClass('gis_ia_as_block');
      // zet max-heigth van filterblok
      jQuery('#gis_ia_filters_' + map_id).css('max-height', jQuery('#gis_ia_map_' + map_id).css('max-height') + 'px');
      // zet height van de kaart
      if (GIS_ia_maps[map_id].isFullscreen) {
        var mapholder = jQuery('#gis_ia_map_' + map_id).parent();
        mapholder.css({'height': '100%'});
//console.log('Vast blok, height=100% (is fullscreen)');
      }
      else {
        var mapholder = jQuery('#gis_ia_map_' + map_id).parent(),
            wpixels = mapholder.width(); // breedte vd kaart
        mapholder.css({'height': (wpixels * 1.2) + 'px'});
//console.log('Vast blok, height='+(wpixels*1.2)+'px (is desktop)');
      }
    }
    else { // switch naar 'hidden/shown' filterblock
      gis_ia_filterwindowCheckHide(map_id);
      base.removeClass('gis_ia_as_block');
      // zet max-heigth van filterblok
      jQuery('#gis_ia_filters_' + map_id).css('max-height', jQuery('#gis_ia_map_' + map_id).css('max-height') + 'px');
      // zet height van de kaart
      if (GIS_ia_maps[map_id].isFullscreen) {
        var mapholder = jQuery('#gis_ia_map_' + map_id).parent();
        mapholder.css({'height': '100%'});
//console.log('Slide blok, height=100% (is fullscreen)');
      }
      else {
        var mapholder = jQuery('#gis_ia_map_' + map_id).parent(),
            wpixels = mapholder.width(); // breedte vd kaart
        mapholder.css({'height': (wpixels * 1.2) + 'px'});
//console.log('Slide blok, height='+(wpixels*1.2)+'px (is desktop)');
      }
    }
  }
}

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["openlayers"], factory);
  }
  else if (typeof module === "object" && module.exports) {
    module.exports = factory(require("openlayers"));
  }
  else {
    root.Legend = factory(root.ol);
  }
}(this, function (ol) {
  /**
   * OpenLayers v3/v4 Position Control.
   * @constructor
   * @extends {ol.control.Control}
   * @param {Object} opt_options Control options, extends
   *     olx.control.ControlOptions adding:
   *                              **`tipLabel`** `String` - the button tooltip.
   */
  ol.control.Position2 = function (opt_options) {

    var options = opt_options || {};

    var map_id = options.map_id ? options.map_id : -1;
    var tipLabel = options.tipLabel ? options.tipLabel : 'Zoom in op mijn locatie';
    this.hiddenClassName = 'ol-unselectable ol-control zoom-position' + (typeof (options['className']) == 'undefined' ? '' : ' ' + options['className']);
    this.shownClassName = 'shown';

    var element = document.createElement('div');
    element.className = this.hiddenClassName;
    var input = document.createElement('input');
    input.setAttribute('onfocus', 'gis_ia_hidePanels(' + map_id + ');');
    input.setAttribute('title', 'Zoek locatie');
    input.className = 'gis_ia_zoekveld';
    input.setAttribute('id', 'gis_ia_z_' + map_id);
    element.appendChild(input);
    var button = document.createElement('button');
    button.setAttribute('title', 'Start zoeken');
    button.className = 'gis_ia_zoekknop';
    element.appendChild(button);
    button.onclick = function (e) {
      e = e || window.event;
      e.preventDefault();
      gis_ia_hidePanels(map_id);
      jQuery.getJSON(position2_url_suggest + '&q=' + jQuery('#gis_ia_z_' + map_id).val(), function (data) {
        if (data.response && data.response.docs.length >= 1) {
          var id = data.response.docs[0].id;
          jQuery.getJSON(position2_url_lookup + id, function (data) {
            var l = data.response.docs[0].centroide_ll.split(' ');
            l[0] = parseFloat(l[0].substr(6));
            l[1] = parseFloat(l[1].substr(0, l[1].length - 1));
            gis_ia_position2map = map_id;
            jQuery('#gis_ia_z_' + map_id).val(data.response.docs[0].weergavenaam);
            gis_ia_gotoPosition2({coords: {longitude: l[0], latitude: l[1]}});
          });
        }
      });
    };
    var button2 = document.createElement('button');
    button2.setAttribute('title', tipLabel);
    button2.className = 'gis_ia_gotopos';
    element.appendChild(button2);
    button2.onclick = function (e) {
      e = e || window.event;
      e.preventDefault();
      gis_ia_hidePanels(map_id);
      if (navigator.geolocation) {
        gis_ia_position2map = map_id;
        navigator.geolocation.getCurrentPosition(gis_ia_gotoPosition2);
      }
      else {
        alert('Geolocation is not supported by this browser.');
      }
    };
    ol.control.Control.call(this, {element: element, target: options.target});
  };
  ol.inherits(ol.control.Position2, ol.control.Control);
  var Position2 = ol.control.Position2;
  return Position2;
}));

// globale variabele om te weten welke kaart moet inzoemen op een bep. positie
var gis_ia_position2map = 0;

// Deze functie zoomt in op een bepaalde positie (p) op een bepaalde kaart
// (gis_ia_position2map) Parameters:    p;  Coordinates object
function gis_ia_gotoPosition2(p) {
  var c = ol.proj.fromLonLat([p.coords.longitude, p.coords.latitude], 'EPSG:28992');
  GIS_ia_maps[gis_ia_position2map].map.getView().animate({
    zoom: GIS_ia_maps[gis_ia_position2map].pz,
    center: c
  });
  if (GIS_ia_maps[gis_ia_position2map].marker) {
    GIS_ia_maps[gis_ia_position2map].marker.getSource().getFeatures()[0].getGeometry().setCoordinates(c);
  }
}


// globale variabele (array) waarin per kaart de definities zijn opgeslagen.
// Zie de functie GIS_paragraaf_start voor meer info
var GIS_ia_maps = [];

// Deze functie creeert Layer van het type WMS
// Parameters:    map_id;    Integer; map ID
//          url;    String; URL naar WMS-service
//          layer;    String; layername (op de server)
//          title;    String; Titel binnen deze module
//          opacity;  Float; Doorschijnendheid
//          visible_;  Optional Boolean; Initially visible?
//          grp;    Optional String; Groupname
// Return:      ol.layer.Image
function gis_ia_getLayerWMS(map_id, url, layer, title, opacity, visible_, grp) {
  if (typeof (visible_) == 'undefined') {
    visible_ = false;
  }
  if (typeof (grp) == 'undefined') {
    grp = 'Overlay';
  }
  return new ol.layer.Image({
    title: title,
    extent: GIS_ia_maps[map_id].ext,
    source: new ol.source.ImageWMS({
      url: url,
      params: {
        layers: layer,
        srs: 'EPSG:28992',
        format: 'image/png',
      },
    }),
    type: grp,
    opacity: opacity,
    visible_: visible_,
  });
}

// globale variabelen t.b.v. Layer type WMTS
var gis_ia_resolutions, gis_ia_matrixIds;

// Deze functie creeert Layer van het type WMTS
// Parameters:    map_id;    Integer; map ID
//          url;    String; URL naar WMS-service
//          layer;    String; layername (op de server)
//          title;    String; Titel binnen deze module
//          opacity;  Float; Doorschijnendheid
//          visible_;  Optional Boolean; Initially visible?
//          grp;    Optional String; Groupname
// Return:      ol.layer.Tile
function gis_ia_getLayerWMTS(map_id, url, layer, addLayerToUrl, title, opacity, visible_, grp) {
  if (typeof (visible_) == 'undefined') {
    visible_ = false;
  }
  if (typeof (grp) == 'undefined') {
    grp = 'Overlay';
  }
  gis_ia_resolutions = [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42];
  gis_ia_matrixIds = new Array(14);
  for (var z = 0; z < 15; ++z) {
    // generate gis_ia_resolutions and gis_ia_matrixIds arrays for this WMTS
    gis_ia_matrixIds[z] = 'EPSG:28992:' + z;
  }
  var tile = {
    title: title,
    extent: GIS_ia_maps[map_id].ext,
    source: new ol.source.WMTS({
      url: url + (addLayerToUrl ? '/' + layer : ''),
      layer: layer,
      matrixSet: 'EPSG:28992',
      format: 'image/png',
      projection: GIS_ia_maps[map_id].projection,
      tileGrid: new ol.tilegrid.WMTS({
        extent: GIS_ia_maps[map_id].ext,
        resolutions: gis_ia_resolutions,
        matrixIds: gis_ia_matrixIds
      })
    }),
    type: grp,
    opacity: opacity,
    visible_: visible_,
  };
  if (grp == 'base') {
    tile.visible = visible_;
  }
  return new ol.layer.Tile(tile);
}

// Object tbv encoding/decoding gis_ia_Base64 strings
var gis_ia_Base64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  encode: function (e) {
    var t = "";
    var n, r, i, s, o, u, a;
    var f = 0;
    e = gis_ia_Base64._utf8_encode(e);
    while (f < e.length) {
      n = e.charCodeAt(f++);
      r = e.charCodeAt(f++);
      i = e.charCodeAt(f++);
      s = n >> 2;
      o = (n & 3) << 4 | r >> 4;
      u = (r & 15) << 2 | i >> 6;
      a = i & 63;
      if (isNaN(r)) {
        u = a = 64
      }
      else if (isNaN(i)) {
        a = 64
      }
      t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
    }
    return t
  },
  decode: function (e) {
    var t = "";
    var n, r, i;
    var s, o, u, a;
    var f = 0;
    e = e.replace(/[^A-Za-z0-9+/=]/g, "");
    while (f < e.length) {
      s = this._keyStr.indexOf(e.charAt(f++));
      o = this._keyStr.indexOf(e.charAt(f++));
      u = this._keyStr.indexOf(e.charAt(f++));
      a = this._keyStr.indexOf(e.charAt(f++));
      n = s << 2 | o >> 4;
      r = (o & 15) << 4 | u >> 2;
      i = (u & 3) << 6 | a;
      t = t + String.fromCharCode(n);
      if (u != 64) {
        t = t + String.fromCharCode(r)
      }
      if (a != 64) {
        t = t + String.fromCharCode(i)
      }
    }
    t = gis_ia_Base64._utf8_decode(t);
    return t
  },
  _utf8_encode: function (e) {
    e = e.replace(/rn/g, "n");
    var t = "";
    for (var n = 0; n < e.length; n++) {
      var r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r)
      }
      else if (r > 127 && r < 2048) {
        t += String.fromCharCode(r >> 6 | 192);
        t += String.fromCharCode(r & 63 | 128)
      }
      else {
        t += String.fromCharCode(r >> 12 | 224);
        t += String.fromCharCode(r >> 6 & 63 | 128);
        t += String.fromCharCode(r & 63 | 128)
      }
    }
    return t
  },
  _utf8_decode: function (e) {
    var t = "";
    var n = 0;
    var r = c1 = c2 = 0;
    while (n < e.length) {
      r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
        n++
      }
      else if (r > 191 && r < 224) {
        c2 = e.charCodeAt(n + 1);
        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
        n += 2
      }
      else {
        c2 = e.charCodeAt(n + 1);
        c3 = e.charCodeAt(n + 2);
        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        n += 3
      }
    }
    return t
  }
};

// Deze functie wordt aangeroepen als website bezoeker een melding kan doen
// Parameters:    map_id;    Integer; map ID
//          coordinate;  String; X,Y
function gis_ia_performMelding(map_id, layerNo, coordinate) {
  var els = [];

  jQuery('#gis_ia_data_error' + map_id).html('');
  jQuery('[id^=gis_ia_inp_v_]').each(function (t, el) {
    el = jQuery(el);
    els[els.length] = [el.prop('id'), el.val()]
  });
  // Moet nog worden ontwikkeld :-)
  var view = GIS_ia_maps[map_id].map.getView();
  var viewResolution = view.getResolution();
  var viewProjection = view.getProjection();
  var urlParms = {
    'kaartNo': layerNo,
    'FEATURE_COUNT': 100,
    'INFO_FORMAT': 'application/json',
    'QUERY_LAYERS': GIS_ia_maps[map_id].layers_def[layerNo].layer
  };
  var url = GIS_ia_maps[map_id].layers[layerNo].getSource().getGetFeatureInfoUrl(coordinate.split(','), viewResolution, viewProjection, urlParms);
  if (url) {
    jQuery.ajax({
      type: "GET",
      url: url,
      layer_t: layerNo,
      dataType: 'json'
    }).done(function (data) {
      var a = data;
      jQuery('#gis_ia_map_' + map_id + '_data').hide();
    }).fail(function (jqXHR, textStatus, errorThrown) {
      var msg = '';
      if (jqXHR.responseText) {
        msg = jqXHR.responseText;
      }
      if (msg == '' && errorThrown) {
        if (errorThrown.message) {
          msg = errorThrown.message;
        }
      }
      if (msg == '') {
        msg = '(possible error) Cross-Origin Read Blocking (CORB) blocked cross-origin response';
      }
      console.log('Systeemfout: ' + msg);
      jQuery('#gis_ia_data_error' + map_id).html('Systeemfout: ' + msg);
    });
  }
}

function gis_ia_filters_submenuClick(map_id, no) {
  var el;
  if (no >= 0) {
    el = jQuery('#gis_ia_l_i_' + map_id + '_' + no);
    if (el.css('display') == 'none') {
      jQuery('#f2-' + map_id).find('.gis_ia_filters_submenu').hide();
      setTimeout(function () { // om denderen van het event tegen te gaan
        el.show(); //toggle('slide',{'direction':'up'},500);
        gis_ia_showLegend(map_id, no, 1);
      }, 50);
    }
    else {
      el.hide();
    }
  }
  else {
    jQuery('#f2-' + map_id).find('.gis_ia_filters_submenu').hide();
  }
}

function gis_ia_filters_opa(map_id, no, d) {
  var el = jQuery('#gis_ia_filters_opa_' + map_id + '_' + no),
      v = parseInt(el.attr('opacity'), 10) + d;
  if (v >= 0 && v <= 100) {
    GIS_ia_maps[map_id].layers[no].setOpacity(v / 100);
    el.attr('opacity', v);
    el.html('Transparantie: ' + v + '%');
  }
}

function gis_ia_get_layer_div(map_id) {
  var t, t1, l, r, radio, extra_info;
  r = '';
  for (t = 0, t1 = 0; t < GIS_ia_maps[map_id].base_layers.length; t++) {
    if (GIS_ia_maps[map_id].base_layers[t].typ == 'base') {
      t1++;
    }
  }
  if (t1 >= 2) {
    r += '<div id="gis_ia_bl_' + map_id + '_def" class="gis_ia_bl_def">Basiskaarten</div>';
    for (t = 0; t < GIS_ia_maps[map_id].base_layers.length; t++) {
      if (GIS_ia_maps[map_id].base_layers[t].typ == 'base') {
        r += '<div id="gis_ia_bl_' + map_id + '_' + t + '_parent">';
        r += '<input type="radio" name="gis_ia_bl_' + map_id + '" id="gis_ia_bl_' + map_id + '_' + t + '" ' + (t == 0 ? 'checked="checked" ' : '') + 'onchange="gis_ia_layers_change(' + map_id + ',0,' + t + ');" class="gis_ia_filters_radio">';
        r += '<label for="gis_ia_bl_' + map_id + '_' + t + '" class="gis_ia_filters_radio">' + GIS_ia_maps[map_id].base_layers[t].get('title') + '</label>';
        r += '</div>';
      }
    }
  }
  radio = (GIS_ia_maps[map_id].l.substr(1, 1) == '1');
  extra_info = (GIS_ia_maps[map_id].l.substr(2, 5) !== '00000');
  r += '<div id="gis_ia_l_' + map_id + '_def" class="gis_ia_l_def">Kaartlagen</div>';
  for (t = 0; t < GIS_ia_maps[map_id].layers_def.length; t++) {
    l = GIS_ia_maps[map_id].layers_def[t];
    r += '<div id="gis_ia_l_' + map_id + '_' + t + '_parent"' + (extra_info ? ' class="gis_ia_filters_extra_info"' : '') + '>';
    if (extra_info) {
      r += '<div class="gis_ia_filters_submenu_parent"><div id="gis_ia_l_i_' + map_id + '_' + t + '" class="gis_ia_filters_submenu" style="display: none;">';
      if (GIS_ia_maps[map_id].l.substr(2, 1) === '1') {
        r += '<div><div>Transparantie</div><div class="button-opa" id="gis_ia_filters_opa_' + map_id + '_' + t + '" opacity="' + (100 * l.opacity) + '">Transparantie: ' + (l.opacity * 100) + '%</div><button title="Meer transparantie" class="gis_ia_filters_button button-opa-max" onclick="gis_ia_filters_opa(' + map_id + ',' + t + ',10);"></button><button title="Minder transparantie" class="gis_ia_filters_button button-opa-min" onclick="gis_ia_filters_opa(' + map_id + ',' + t + ',-10);"></button></div>';
      }
      if (GIS_ia_maps[map_id].l.substr(3, 1) !== '0') {
        r += '<div><div>Download</div>Download CSV data: <button class="gis_ia_filters_button" onclick="gis_ia_startDownload(' + map_id + ',' + t + ',false);">Download' + (GIS_ia_maps[map_id].l.substr(4, 1) === '1' ? ' NL' : '') + (GIS_ia_maps[map_id].l.substr(4, 1) === '1' ? ' <button class="gis_ia_filters_button" onclick="gis_ia_startDownload(' + map_id + ',' + t + ',true);">Download BB</button>' : '') + '</div>';
      }
      if (GIS_ia_maps[map_id].l.substr(5, 1) === '1') {
        r += '<div><div>Metadata</div>Zoek op data.rivm.nl naar metadata over deze kaartlaag: <button class="gis_ia_filters_button" onclick="gis_ia_gotoDataRIVMNl(' + map_id + ',' + t + ')">data.rivm.nl</button></div>';
      }
      if (GIS_ia_maps[map_id].l.substr(6, 1) === '1') {
        r += '<div><div>Legenda</div><div class="wait-cursor gis_ia_' + map_id + '_' + t + '_legenda_leg1"></div></div>';
      }
      r += '</div></div>';
    }
    r += '<input type="' + (radio ? 'radio' : 'checkbox') + '" ' + (radio ? 'name="gis_ia_l_' + map_id + '" ' : '') + 'id="gis_ia_l_' + map_id + '_' + t + '" ' + (l.visible_ ? 'checked="checked" ' : '') + 'onchange="gis_ia_layers_change(' + map_id + ',1,' + t + ');" class="gis_ia_filters_' + (radio ? 'radio' : 'checkbox') + '">';
    r += '<label for="gis_ia_l_' + map_id + '_' + t + '" style="width: 100%;" class="gis_ia_filters_' + (radio ? 'radio' : 'checkbox') + '">' + l.title + '</label>';
    if (extra_info) {
      r += '<span onclick="gis_ia_filters_submenuClick(' + map_id + ',' + t + ');" class="gis_ia_info_button gis_ia_filters_info_button"></span>';
    }
    r += '</div>';
  }
  r = (r == '' ? '' : '<div class="gis_ia_filters_def">' + r + '</div>');
  return r;
}

function gis_ia_layers_change(map_id, typ, i) {
  var checked, l, radio, t;
  switch (typ) {
    case 0:
      for (t = 0; t < GIS_ia_maps[map_id].base_layers.length; t++) {
        if (t != i && GIS_ia_maps[map_id].base_layers[t].typ == 'base') {
          GIS_ia_maps[map_id].base_layers[t].setVisible(false);
        }
      }
      l = GIS_ia_maps[map_id].base_layers[i];
      checked = jQuery('#gis_ia_bl_' + map_id + '_' + i).prop('checked');
      break;
    case 1:
      radio = (GIS_ia_maps[map_id].l.substr(1, 1) == '1');
      if (radio) {
        for (t = 0; t < GIS_ia_maps[map_id].layers.length; t++) {
          if (t != i) {
            GIS_ia_maps[map_id].layers[t].setVisible(false);
          }
        }
      }
      l = GIS_ia_maps[map_id].layers[i];
      checked = jQuery('#gis_ia_l_' + map_id + '_' + i).prop('checked');
      break;
  }
  l.setVisible(checked);
  var el = document.getElementById('gis_ia_layerSliderLayer' + map_id);
  if (el) {
    jQuery(el).hide();
  }
}


// Deze functie initialiseerd elke kaart op een webpagina
// Parameters:    map_id;    Integer; map ID
function GIS_paragraaf_start(map_id) {
  // default instellingen
  GIS_ia_maps[map_id] = {
    currentLayer: 0,
    layers_def: [],
    base_layers: [],
    layers: [],
    layerData: [],
    extNL: [0, 300000, 300000, 650000],                 // extent van de view
    ext: [-285401.92, 22598.08, 595401.9199999999, 903401.9199999999], // extent
                                                                       // van
                                                                       // de
                                                                       // kaart
    projection: null,
    controls: [],
    map: null,
    popupCenter: false,
  };

  // instellingen voor deze kaart overnemen
  var map = jQuery('#gis_ia_map_' + map_id),
      parms = map.attr('parms').split(','), t, t1, w, v;
  for (t = 0; t < parms.length; t++) {
    t1 = parms[t].indexOf('=');
    v = parms[t].substr(t1 + 1);
    w = parms[t].substr(0, t1);
    if (w != 'l' && w != 'o' && w != 'b' && w != 'pw' && v == parseInt(v, 10)) {
      v = parseInt(v, 10);
    }
    if (w == 'fs') {
      var par = 0;
      GIS_ia_maps[map_id].fs = [];
      if (v != '') {
        v = gis_ia_Base64.decode(v);
        v = eval(v);
        for (t1 = 0; t1 < v.length; t1++) {
          GIS_ia_maps[map_id].fs[t1] = new gis_ia_filter(v[t1], map_id, t1 + 1, false);
        }
      }
    }
    else {
      GIS_ia_maps[map_id][w] = v;
    }
  }
  GIS_ia_maps[map_id].m = gis_ia_Base64.decode(GIS_ia_maps[map_id].m);
  GIS_ia_maps[map_id].isFullscreen = false;

  /* Omgaan met verouderde data (zie de file gis_ia_edit.js) */
  /*
  if (GIS_ia_maps[map_id].dataversie<????) {
    if (een bepaalde waarde == iets) {
      converteer of alert
    }
  }
  */
  /* Einde omgaan met verouderde data */

  // zorg dat de kaart de juiste afmeting heeft; Maximale breedte op desktop en
  // evt. volledige breedte op mobiel
  var wpixels = jQuery('#gis_ia_map_' + map_id).parent().width(); // breedte vd
                                                                  // kaart
  jQuery(map.parent()).css({'height': (wpixels * 1.2) + 'px'});

  // Set de juiste projectie en 'set' proj4. Dit is nodig voor Position2
  GIS_ia_maps[map_id].projection = new ol.proj.Projection({
    code: 'EPSG:28992',
    units: 'm',
    extent: GIS_ia_maps[map_id].extNL
  });
  ol.proj.addProjection(GIS_ia_maps[map_id].projection); // Nodig om
                                                         // coordinaten
                                                         // (latlong) te
                                                         // vertalen naar
                                                         // zoom-center
  proj4.defs("EPSG:28992", "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs");

  // CSS keuze maken
  var kleuren = [
    ['bruin', true, '#94710a', '#dfd4b5', '#efeada'],
    ['donkerblauw', true, '#01689b', '#cce0f1', '#e5f0f9'],
    ['donkergeel', false, '#ffb612', '#ffe9b7', '#fff4dc'],
    ['donkergroen', true, '#275937', '#becdc3', '#dfe6e1'],
    ['donkerbruin', true, '#673327', '#d1c1be', '#e8e1df'],
    ['geel', false, '#f9e11e', '#fdf6bb', '#fefbdd'],
    ['groen', true, '#39870c', '#c3dbb6', '#e1eddb'],
    ['hemelblauw', true, '#007bc7', '#b2d7ee', '#d9ebf7'],
    ['lichtblauw', false, '#8fcae7', '#ddeff8', '#eef7fb'],
    ['mintgroen', false, '#76d2b6', '#d6f1e9', '#ebf8f4'],
    ['mosgroen', true, '#777c00', '#d6d7b2', '#ebebd9'],
    ['oranje', false, '#e17000', '#f6d4b2', '#fbead9'],
    ['paars', true, '#42145f', '#c6b8cf', '#e3dce7'],
    ['robijnrood', true, '#ca005d', '#efb2ce', '#f7d9e7'],
    ['rood', true, '#d52b1e', '#f2bfbb', '#f9dfdd'],
    ['roze', false, '#f092cd', '#fadef0', '#fdeff8'],
    ['violet', true, '#a90061', '#e5b2cf', '#f2d9e7'],
    ['wit', false, '#ffffff', '#ffffff', '#ffffff'],
  ];
  GIS_ia_maps[map_id].white = true;
  if (GIS_ia_maps[map_id].u !== 'automatisch') {
    for (var t = 0; t < kleuren.length; t++) {
      if (GIS_ia_maps[map_id].u == kleuren[t][0]) {
        GIS_ia_maps[map_id].white = kleuren[t][1];
        GIS_ia_maps[map_id].kleuren = [kleuren[t][2], kleuren[t][3], kleuren[t][4]];
        t = kleuren.length;
      }
    }
  }
  else {
    var intToHex = function (i) {
          i = parseInt(i, 10);
          var s = i.toString(16);
          if (s.length == 1) {
            s = '0' + s;
          }
          return s;
        }, t, t1, s, s1, regex,
        kleur = jQuery('nav.navbar-branded').css('background-color');
    if (typeof (kleur) != 'undefined') {
      var newRule = function (s, white) {
        var s1 = s.replace(/#275937/gi, kleurMat1);
        s1 = s1.replace(/rgb\(39, 89, 55\)/gi, kleurRGB1);
        s = s1.replace(/#becdc3/gi, kleurMat2);
        s1 = s1.replace(/rgb\(190, 205, 195\)/gi, kleurRGB2);
        s1 = s1.replace(/#dfe6e1/gi, kleurMat3);
        s1 = s1.replace(/rgb\(223, 230, 225\)/gi, kleurRGB3);
        if (!white) {
          s1 = s1.replace(/color\: white/gi, 'color: black');
          s1 = s1.replace(/\-white.png/gi, '.png');
        }
        return s1;
      };
      if (kleur.substr(0, 3) == 'rgb') {
        kleur = kleur.substr(kleur.indexOf('(') + 1);
        kleur = kleur.substr(0, kleur.length - 1).split(',');
        kleurMat1 = '#' + intToHex(kleur[0]) + intToHex(kleur[1]) + intToHex(kleur[2]);
        kleurRGB1 = 'rgb(' + kleur[0] + ', ' + kleur[1] + ', ' + kleur[2] + ')';
      }
      else {
        kleurMat1 = kleur;
        kleurRBG1 = 'rgb(' + parseInt(kleur.substr(1, 2), 16) + ', ' + parseInt(kleur.substr(3, 2), 16) + ', ' + parseInt(kleur.substr(5, 2), 16) + ')';
      }
      for (t = 0; t < kleuren.length; t++) {
        if (kleurMat1 == kleuren[t][2]) {
          var kleurMat1, kleurRGB1, kleurMat2, kleurRGB2, kleurMat3, kleurRGB3,
              sheet;
          GIS_ia_maps[map_id].white = kleuren[t][1];
          GIS_ia_maps[map_id].kleuren = [kleuren[t][2], kleuren[t][3], kleuren[t][4]];
          kleur = kleuren[t][2];
          kleurMat1 = kleur;
          kleurRGB1 = 'rgb(' + parseInt(kleur.substr(1, 2), 16) + ', ' + parseInt(kleur.substr(3, 2), 16) + ', ' + parseInt(kleur.substr(5, 2), 16) + ')';
          kleur = kleuren[t][3];
          kleurMat2 = kleur;
          kleurRGB2 = 'rgb(' + parseInt(kleur.substr(1, 2), 16) + ', ' + parseInt(kleur.substr(3, 2), 16) + ', ' + parseInt(kleur.substr(5, 2), 16) + ')';
          kleur = kleuren[t][4];
          kleurMat3 = kleur;
          kleurRGB3 = 'rgb(' + parseInt(kleur.substr(1, 2), 16) + ', ' + parseInt(kleur.substr(3, 2), 16) + ', ' + parseInt(kleur.substr(5, 2), 16) + ')';
          for (t = 0; t < document.styleSheets.length; t++) {
            sheet = document.styleSheets[t];
            if (typeof (sheet.href) != 'undefined') {
              if (sheet.href.indexOf('donkergroen') >= 1) {
                var rules = sheet.rules;
                for (t1 = 0; t1 < rules.length; t1++) {
                  s = rules[t1].cssText;
                  s1 = newRule(s, GIS_ia_maps[map_id].white);
                  if (s != s1) {
                    sheet.insertRule(s1, sheet.rules.length);
                  }
                }
                t = document.styleSheets.length;
              }
            }
            else {
              for (t1 = 0; t1 < sheet.cssRules.length; t1++) {
                if (sheet.cssRules[t1].href.indexOf('donkergroen') >= 1) {
                  sheet = sheet.cssRules[t1].styleSheet;
                  var rules = sheet.rules;
                  for (t1 = 0; t1 < rules.length; t1++) {
                    s = rules[t1].cssText;
                    s1 = newRule(s, GIS_ia_maps[map_id].white);
                    if (s != s1) {
                      sheet.insertRule(s1, sheet.rules.length);
                    }
                  }
                  t1 = sheet.cssRules.length;
                  t = document.styleSheets.length;
                }
              }
            }
          }
          t = kleuren.length;
        }
      }
    }
  }

  // knoppen links boven toevoegen
  var cls;
  if (GIS_ia_maps[map_id].z) {
    GIS_ia_maps[map_id].controls[GIS_ia_maps[map_id].controls.length] = new ol.control.Zoom({
      className: 'gis_ia_zoom',
      tipLabel: 'In- en uitzooomen'
    });
  }
  if (GIS_ia_maps[map_id].e) {
    cls = 'gis_ia_zoom_extent gis_ia_zoom_extent' + (GIS_ia_maps[map_id].z ? '1' : '0');
    GIS_ia_maps[map_id].controls[GIS_ia_maps[map_id].controls.length] = new ol.control.ZoomToExtent({
      extent: GIS_ia_maps[map_id].extNL,
      className: cls,
      label: '',
      tipLabel: 'Zoom uit naar kaart extentie'
    });
  }
  if (GIS_ia_maps[map_id].f) {
    cls = 'gis_ia_fullscreen gis_ia_fullscreen' + (GIS_ia_maps[map_id].z || GIS_ia_maps[map_id].e ? (GIS_ia_maps[map_id].z && GIS_ia_maps[map_id].e ? '2' : '1' + (GIS_ia_maps[map_id].z ? 'b' : 'a')) : '0');
    GIS_ia_maps[map_id].controls[GIS_ia_maps[map_id].controls.length] = new ol.control.FullScreen({
      label: '',
      className: cls,
      tipLabel: 'Toon kaart fullscreen',
      source: document.getElementById('gis_ia_base_' + map_id)
    });
  }
  if (GIS_ia_maps[map_id].p) {
    cls = 'gis_ia_position2';
    GIS_ia_maps[map_id].controls[GIS_ia_maps[map_id].controls.length] = new ol.control.Position2({
      'map_id': map_id,
      className: cls
    });
    GIS_ia_maps[map_id].marker = new ol.layer.Vector({
      /*style: new ol.style.Style({
        image: new ol.style.Circle({
        radius: 15,
        //fill: new ol.style.Fill({color: 'black'}),
        stroke: new ol.style.Stroke({
          color: [0,0,0], width: 2
        })
        })
      }),*/
      style: [
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 8,
            //fill: new ol.style.Fill({color: 'black'}),
            stroke: new ol.style.Stroke({
              color: [0, 0, 0], width: 1
            })
          })
        }),
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 4,
            //fill: new ol.style.Fill({color: 'black'}),
            stroke: new ol.style.Stroke({
              color: [0, 0, 0], width: 1
            })
          })
        }),
      ],
      source: new ol.source.Vector({
        matrixSet: 'EPSG:28992',
        projection: GIS_ia_maps[map_id].projection,
        features: [new ol.Feature({geometry: new ol.geom.Point(ol.proj.fromLonLat([0, 0], 'EPSG:28992'))})]
      })
    });
  }

  // Layer-data verwerken
  if (GIS_ia_maps[map_id].ld) {
    var lds = GIS_ia_maps[map_id].ld.split('|'), ld, ldt, dataVelden,
        inputVelden, dobj, dobj1, dobj_t, dobj_p, dobj_v, dobj_w, dobj_all,
        ldt1;
    // Voor elke layer-definitie
    for (ldt = 0; ldt < lds.length; ldt++) {
      ld = lds[ldt];
      if (ld != '') {
        ld = gis_ia_Base64.decode(ld).split('|');
        dobj = (typeof (ld[6]) == 'undefined' ? '' : jQuery.trim(ld[6]));
        // initialisatie van dataVelden (welke velden moeten worden weergegeven
        // als bezoeker op de kaart klikt?) initaialisatie van inputvelden (op
        // welke velden kan de bezoeker filteren, en met wat voor filter?)
        dataVelden = false; // false betekent dat alle velden moeten worden
                            // getoond
        inputVelden = []; // lege array; Er zijn in principe geen filtervelden
        if (dobj != '') { // Als er velddefinities zijn
          dobj = dobj.split(',');
          dobj_all = true; // Laat in principe alle velden zien
          for (dobj_t = 0; dobj_t < dobj.length; dobj_t++) {
            dobj1 = dobj[dobj_t].split('^');
            dobj_p = dobj1[0].indexOf('=');
            dobj_v = dobj1[0].substr(0, dobj_p);
            dobj_w = dobj1[0].substr(dobj_p + 1);
            if (dobj_w != '') { // Als redacteur een alias voor een veld heeft opgegeven
              dobj_all = false;
            }
          }
          if (!dobj_all) { // Als redacteur 1 of meer aliassen voor een veld heeft opgegeven dan
  // dataVelden vullen met de aliassen
            for (dobj_t = 0; dobj_t < dobj.length; dobj_t++) {
              dobj1 = dobj[dobj_t].split('^');
              dobj_p = dobj1[0].indexOf('=');
              dobj_v = dobj1[0].substr(0, dobj_p);
              dobj_w = dobj1[0].substr(dobj_p + 1);
              if (dobj_all || dobj_w != '') {
                if (dataVelden === false) {
                  dataVelden = [];
                }
                dataVelden[dataVelden.length] = {
                  'veld': dobj_v,
                  'label': dobj_w,
                  'ralign': dobj1[2] == '1',
                  'eenheid': dobj1[1] == '' ? '' : ' ' + dobj1[1]
                };
              }
            }
          }
        }
        // voeg de layer-definitie toe
        GIS_ia_maps[map_id].layers_def[GIS_ia_maps[map_id].layers_def.length] = {
          'type': jQuery.trim(ld[0]),
          'url': jQuery.trim(ld[1]),
          'layer': jQuery.trim(ld[2]),
          'title': jQuery.trim(ld[3]),
          'opacity': jQuery.trim(ld[4]),
          'visible_': ld[7] != 0,
          'data': jQuery.trim(ld[5]),
          'dataVelden': dataVelden
        };
      }
    }
  }

  // Maak van elke layer-definitie een ol.Layer en check of de website
  // bezoekler op de kaart kan klikken om data op dat punt op te vragen
  // (hasData)
  var l;
  for (t = 0; t < GIS_ia_maps[map_id].layers_def.length; t++) {
    l = GIS_ia_maps[map_id].layers_def[t];
    switch (l.type) {
      case 'WMS':
      case 'datarivmnl':
      case 'wmsacceptatie':
        GIS_ia_maps[map_id].layers[t] = gis_ia_getLayerWMS(map_id, l.url, l.layer, l.title, l.opacity, l.visible_);
        break;
    }
  }
  // Initialiseer de base-layer
  var b = GIS_ia_maps[map_id]['b'], bt = 0, vis = true;
  if (b.substr(0, 1) == 1) {
    GIS_ia_maps[map_id].base_layers[bt] = gis_ia_getLayerWMTS(map_id, 'https://geodata.nationaalgeoregister.nl/tiles/service/wmts', 'brtachtergrondkaart', true, 'Openbasiskaart', 1, vis, 'base');
    GIS_ia_maps[map_id].base_layers[bt].typ = 'base';
    vis = false;
    bt++;
  }
  if (b.substr(1, 1) == 1) {
    GIS_ia_maps[map_id].base_layers[bt] = gis_ia_getLayerWMTS(map_id, 'https://geodata.nationaalgeoregister.nl/tiles/service/wmts', 'brtachtergrondkaartgrijs', true, 'Openbasiskaart grijs', 1, vis, 'base');
    GIS_ia_maps[map_id].base_layers[bt].typ = 'base';
    vis = false;
    bt++;
  }
  if (b.substr(2, 1) == 1) {
    GIS_ia_maps[map_id].base_layers[bt] = gis_ia_getLayerWMTS(map_id, 'https://geodata.nationaalgeoregister.nl/tiles/service/wmts', 'brtachtergrondkaartpastel', true, 'Openbasiskaart pastel', 1, vis, 'base');
    GIS_ia_maps[map_id].base_layers[bt].typ = 'base';
    vis = false;
    bt++;
  }
  if (b.substr(3, 1) == 1) {
    GIS_ia_maps[map_id].base_layers[bt] = gis_ia_getLayerWMTS(map_id, 'https://geodata.nationaalgeoregister.nl/luchtfoto/rgb/wmts', 'Actueel_ortho25', false, 'Luchtfoto', 1, vis, 'base');
    GIS_ia_maps[map_id].base_layers[bt].typ = 'base';
    vis = false;
    bt++;
  }
  if (b.substr(4, 1) == 1) {
    GIS_ia_maps[map_id].base_layers[bt] = gis_ia_getLayerWMTS(map_id, 'https://geodata.nationaalgeoregister.nl/tiles/service/wmts', 'top25raster', true, 'Topografisch', 1, vis, 'base');
    GIS_ia_maps[map_id].base_layers[bt].typ = 'base';
    vis = false;
    bt++;
  }
  b = '' + GIS_ia_maps[map_id]['o'];
  if (b.substr(0, 1) == '1') {
    GIS_ia_maps[map_id].base_layers[bt] = gis_ia_getLayerWMS(map_id, 'https://geodata.rivm.nl/geoserver/wms', 'rivm:nl_landscontour_lw', '', 1, true, 'overlaykaart');
    GIS_ia_maps[map_id].base_layers[bt].typ = 'overlaykaart';
    bt++;
  }

  // Voorbereiden initialisatie van de kaart (ol.Map)
  var wmeter = GIS_ia_maps[map_id].extNL[2] - GIS_ia_maps[map_id].extNL[0]; // breedte
                                                                            // NL
                                                                            // volgens
                                                                            // rijksdriehoekmeting
  var pixpermeter = wmeter / wpixels; // pixels per meter
  var layer_d = [];
  if (GIS_ia_maps[map_id].base_layers.length >= 1) {
    layer_d = [
      new ol.layer.Group({
        'title': 'Basiskaart',
        'combine': false,
        layers: GIS_ia_maps[map_id].base_layers,
      }),
    ];
  }
  if (GIS_ia_maps[map_id].layers_def.length >= 1) {
    layer_d[layer_d.length] = new ol.layer.Group({
      'title': 'Kaartlagen',
      'combine': false,
      layers: GIS_ia_maps[map_id].layers,
    });
  }
  // Initialiseer de overlay-layers
  b = '' + GIS_ia_maps[map_id]['o'];
  bt = 0;
  o = [];
  if (b.substr(1, 1) == '1') {
    o[bt] = gis_ia_getLayerWMS(map_id, 'https://geodata.rivm.nl/geoserver/wms', 'rivm:nl_provincie_2019', '', 1, true, 'overlaykaart');
    bt++;
  }
  if (b.substr(2, 1) == '1') {
    o[bt] = gis_ia_getLayerWMS(map_id, 'https://geodata.rivm.nl/geoserver/wms', 'rivm:adm_nl_gemeente_2019', '', 1, true, 'overlaykaart');
    bt++;
  }
  if (bt >= 1) {
    layer_d[layer_d.length] = new ol.layer.Group({
      'title': 'Overlaykaart',
      'combine': false,
      layers: o,
    });
  }
  if (GIS_ia_maps[map_id].marker) {
    layer_d[layer_d.length] = GIS_ia_maps[map_id].marker;
  }
  // initialisatie van de kaart
  GIS_ia_maps[map_id].map = new ol.Map({
    layers: layer_d,
    numZoomLevels: 12, // deze 12 komt ook terug bij maxZoom bij vector tiles
    target: 'gis_ia_map_' + map_id,
    units: 'm',
    view: new ol.View({
      projection: GIS_ia_maps[map_id].projection,
      center: ol.extent.getCenter(GIS_ia_maps[map_id].extNL),
      resolution: pixpermeter,
      maxResolution: pixpermeter,
      enableRotation: false,
      extent: GIS_ia_maps[map_id].extNL, // deze extent bepaald het vlak waarin
                                         // wordt ge-pan-d
    }),
    controls: GIS_ia_maps[map_id].controls,
  });
  // onthoud map_id in het map object.
  GIS_ia_maps[map_id].map.map_id = map_id;

  // html opbouwen mbt de filtering
  var html;
  switch (GIS_ia_maps[map_id].l.substr(0, 1)) {
    case '0':
      html = gis_ia_filters.html(map_id);
      break;
    case '1':
      html = gis_ia_get_layer_div(map_id) + gis_ia_filters.html(map_id);
      break;
    case '2':
      html = gis_ia_filters.html(map_id) + gis_ia_get_layer_div(map_id);
      break;
  }
  if (html != '') {
    html = '<div id="f2-' + map_id + '" onclick="gis_ia_filters_submenuClick(' + map_id + ',-1);" class="f2"><div id="f1b-' + map_id + '" class=""><div class="gis_ia_filters_close"><button onclick="gis_ia_filterwindowCheckHide(' + map_id + ');" class="gis_ia_filters_button">X sluiten</button></div></div>' + html + '<div id="f3b-' + map_id + '"><div class="gis_ia_filters_toon"><button onclick="gis_ia_filterwindowCheckHide(' + map_id + ');" class="gis_ia_filters_button">Toon resultaten</button></div></div></div>';
    jQuery('#gis_ia_filters_' + map_id).html(html).css('width', (parseInt(GIS_ia_maps[map_id].pw.substr(1, 1)) * 20 + 180) + 'px');
    GIS_ia_maps[map_id].hasFilter = true;
    // jquery voor filter-panel
    var inputs = jQuery('#f2-' + map_id + ' :input').on('keyup', function (e) {
      if (e.keyCode == 13) {
        e.preventDefault();
        var nextInput = inputs.get(inputs.index(this) + 1);
        if (nextInput) {
          nextInput.focus();
        }
      }
    });
    jQuery('.gis_ia_filters_submenu').click(function (e) {
      e.preventDefault();
      return false;
    });
  }
  else {
    GIS_ia_maps[map_id].hasFilter = false;
  }

  // Filter
  if (GIS_ia_maps[map_id].hasFilter) {
    var filter = new ol.control.Filter({
      'map_id': map_id,
      className: 'gis_ia_filter' + (GIS_ia_maps[map_id].p == 0 ? '' : ' gis_ia_filter1')
    });
    GIS_ia_maps[map_id].map.addControl(filter);
  }

  /* knoppen linksonder */
  // Legenda
  if (GIS_ia_maps[map_id].l1 == 1) {
    var legenda = '';
    if (GIS_ia_maps[map_id].c == 1) {
      if (GIS_ia_maps[map_id].sb >= 1) { // muis en scalebar
        legenda = ' legenda2';
      }
      else { // muis
        legenda = ' legenda1a';
      }
    }
    else {
      if (GIS_ia_maps[map_id].sb >= 1) { // scalebar
        legenda = ' legenda1b';
      }
    }
    GIS_ia_maps[map_id].map.addControl(new ol.control.Legenda({
      'map_id': map_id,
      className: 'gis_ia_legenda' + legenda
    }));
  }
  // Muispositie
  if (GIS_ia_maps[map_id].c == 1) {
    var mousePositionControl = new ol.control.MousePosition({
      coordinateFormat: ol.coordinate.createStringXY(0),
      projection: GIS_ia_maps[map_id].projection,
      // comment the following two lines to have the mouse position
      // be placed within the map.
      className: 'ol-control custom-mouse-position',
      undefinedHTML: '&nbsp;'
    });
    GIS_ia_maps[map_id].map.addControl(mousePositionControl);
  }
  // Scale bar
  if (GIS_ia_maps[map_id].sb >= 1) {
    var scaleline = new ol.control.ScaleBar2({
      'map_id': map_id,
      className: 'scalebar2 scalebar2' + (GIS_ia_maps[map_id].c ? '1' : '0')
    });
    GIS_ia_maps[map_id].map.addControl(scaleline);
  }


  // knoppen rechtsonder
  if (GIS_ia_maps[map_id].ts) {
    window.app = {};
    var app = window.app;
    app.timeSlider = function (opt_options) {
      var options = opt_options || {};
      var handleTimeSlider = function () {
        gis_ia_hidePanels(map_id);
        gis_ia_togglePlay(map_id);
      };
      var button = '';

      if (GIS_ia_maps[map_id].ts == 2) {
        button = document.createElement('button');
        button.setAttribute('id', 'playpauze' + map_id);
        button.setAttribute('class', 'playpauze play');
        button.setAttribute('title', 'Play slider');
        button.innerHTML = '&nbsp;';
        button.addEventListener('click', handleTimeSlider, false);
        button.addEventListener('touchstart', handleTimeSlider, false);
      }

      var range = document.createElement('input');
      range.setAttribute("id", "timeslider" + map_id);
      range.setAttribute("type", "range");
      range.setAttribute("min", "0");
      range.setAttribute("max", GIS_ia_maps[map_id].layers.length - 1);
      range.setAttribute("type", "range");
      range.setAttribute("title", "Slider");
      if (GIS_ia_maps[map_id].ts == 2) {
        range.setAttribute('class', 'play-left');
      }
      range.setAttribute('onchange', 'if (!jQuery(\'#playpauze' + map_id + '\').hasClass(\'play\')) {gis_ia_togglePlay(' + map_id + ');} gis_ia_gotoLayer(' + map_id + ',parseInt(this.value,10));');
      range.setAttribute('oninput', 'gis_ia_gotoLayer(' + map_id + ',parseInt(this.value,10));');
      range.setAttribute('onfocus', 'gis_ia_hidePanels(' + map_id + ');');
      var t, t1 = false;
      for (t = 0; t < GIS_ia_maps[map_id].layers_def.length; t++) {
        if (GIS_ia_maps[map_id].layers_def[t].visible_) {
          range.setAttribute('value', t);
          t = GIS_ia_maps[map_id].layers_def.length;
          t1 = true;
        }
      }
      if (!t1) {
        range.setAttribute("value", "0");
      }

      var element = document.createElement('div');
      var element2 = document.createElement('div');
      element.className = 'ol-unselectable ol-control gis_ia_layerSlider';
      element2.className = 'panel gis_ia_layerSliderLayer';
      element2.id = 'gis_ia_layerSliderLayer' + map_id;
      element.appendChild(element2);
      if (button != '') {
        element.appendChild(button);
      }
      element.appendChild(range);

      ol.control.Control.call(this, {
        element: element,
        target: options.target
      });

    };
    ol.inherits(app.timeSlider, ol.control.Control);
    GIS_ia_maps[map_id].map.addControl(new app.timeSlider);
  }

  map.append('<div id="popup' + map_id + '" class="ol-popup" style="display: none;"><a href="#" id="popup-closer' + map_id + '" class="ol-popup-closer"></a><div id="popup-content' + map_id + '"></div></div>');
  // popup; Het window dat wordt getoond als de websitebezoeker op de kaart
  // klikt
  var container = document.getElementById('popup' + map_id);
  var content = document.getElementById('popup-content' + map_id);
  var closer = document.getElementById('popup-closer' + map_id);
  GIS_ia_maps[map_id].overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
    element: container,
    autoPan: true,
    autoPanAnimation: {duration: 250}
  }));
  closer.onclick = function () {
    if (jQuery(jQuery('#popup' + map_id).parent()).css('display') != 'none') {
      if (GIS_ia_maps[map_id].popupCenter) {
        GIS_ia_maps[map_id].map.getView().animate({
          center: GIS_ia_maps[map_id].popupCenter,
          duration: 250
        });
      }
      GIS_ia_maps[map_id].popupCenter = false;
      GIS_ia_maps[map_id].overlay.setPosition(undefined);
      closer.blur();
    }
    return false;
  };
  GIS_ia_maps[map_id].map.addOverlay(GIS_ia_maps[map_id].overlay);
  var setPopup = function (map_id, evt) {
    var txt, t, t1, t2, first, txt, vertaalVelden, parts, cols = 0,
        txtLayer = '', layerData, nodata = false;
    //controleer of elke laag die data moet krijgen ook echt data heeft gehad.
    // Zo nee, doe niks
    if (GIS_ia_maps[map_id].layerDataToDo > 0) {
      return;
    }
    jQuery('#gis_ia_map_' + map_id).css('cursor', 'default');
    jQuery('#wait' + map_id).hide();
    // ga data opbouwen
    var t_feature_no, t_properties = [], t_layer, t_property, t_feature_no_cls;
    for (t = 0, first = true; t < GIS_ia_maps[map_id].layers_def.length; t++) {
      if (GIS_ia_maps[map_id].layerData[t]) {
        // Hier kijken of er 1 of meer vertaal-waarden zijn...
        vertaalVelden = GIS_ia_maps[map_id].layers_def[t]['dataVelden'];
        layerData = GIS_ia_maps[map_id].layerData[t];
        t_feature_no = 0;
        for (var tt1 = 0; tt1 < layerData.length; tt1++) {
          for (var key in layerData[tt1].properties) {
            if (vertaalVelden) {
              for (t1 = 0; t1 < vertaalVelden.length; t1++) {
                if (key == vertaalVelden[t1].veld) {
                  t_properties[t_properties.length] = [t, t_feature_no, vertaalVelden[t1].label, layerData[tt1].properties[key], vertaalVelden[t1].eenheid != '' ? ' ' + vertaalVelden[t1].eenheid : '', vertaalVelden[t1].ralign];
                  t1 = vertaalVelden.length;
                }
              }
            }
            else {
              t_properties[t_properties.length] = [t, t_feature_no, key, layerData[tt1].properties[key], '', false];
            }
          }
          t_feature_no++;
        }
      }
    }
    if (t_properties.length >= 1) {
      txt = '<table class="ol-popup-table">';
      var tabelVorm = GIS_ia_maps[map_id].w2;
      switch (tabelVorm) {
        case 1: // Lagen horizontaal, features vertikaal
          txt += '<tr>';
          for (t = 0, t_layer = -1; t < t_properties.length; t++) {
            t_property = t_properties[t];
            if (t_layer != t_property[0]) { // begin nieuwe layer
              txt += (t == 0 ? '' : '</table></td>') + '<td><table>';
              if (GIS_ia_maps[map_id].tl == 1) {
                txt += '<tr><td colspan="2" class="gis_ia_layer_header">' + GIS_ia_maps[map_id].layers_def[t_property[0]].title + '</td></tr>';
              }
              t_feature_no = -1;
              t_layer = t_property[0];
            }
            if (t_feature_no != t_property[1]) {
              t_feature_no = t_property[1];
              t_feature_no_cls = (t_feature_no == 0 ? '' : ' class="gis_ia_feature_header2"');
            }
            else {
              t_feature_no_cls = '';
            }
            txt += '<tr' + t_feature_no_cls + '><td>' + t_property[2] + '</td><td' + (t_property[5] ? ' style="text-align: right;"' : '') + '>' + t_property[3] + t_property[4] + '</td></tr>';
          }
          txt += '</table></td></tr>';
          break;
        case 2: // Lagen vertikaal, features horizontaal
          for (t = 0, t_layer = -1; t < t_properties.length; t++) {
            t_property = t_properties[t];
            if (t_layer != t_property[0]) { // begin nieuwe layer
              if (t > 0) {
                txt += '</table></div></td></tr>';
              }
              if (GIS_ia_maps[map_id].tl == 1) {
                txt += '<tr' + (t == 0 ? '' : ' class="gis_ia_layer_header2"') + '><td class="gis_ia_layer_header">' + GIS_ia_maps[map_id].layers_def[t_property[0]].title + '</td></tr>';
              }
              txt += '<tr><td style="white-space: nowrap;">';
              t_feature_no = -1;
              t_layer = t_property[0];
            }
            if (t_feature_no != t_property[1]) {
              t_feature_no = t_property[1];
              txt += (t_feature_no == 0 ? '' : '</table></div>') + '<div class="gis_ia_table_lvfh"><table>';
            }
            txt += '<tr><td>' + t_property[2] + '</td><td' + (t_property[5] ? ' style="text-align: right;"' : '') + '>' + t_property[3] + t_property[4] + '</td></tr>';
          }
          txt += '</table></div></td></tr>';
          break;
        case 3: // Kruistabel Lagen horizontaal, properties vertikaal
        case 4: // Kruistabel Lagen vertikaal, properties horizontaal
          var tbl = [], t1 = 1, t2, f;
          tbl[0] = ['niks',];
          for (t = 0; t < GIS_ia_maps[map_id].layers_def.length; t++) {
            if (GIS_ia_maps[map_id].layerData[t]) {
              tbl[0][t1] = t;
              t1++;
            }
          }
          for (t = 0; t < t_properties.length; t++) {
            t_property = t_properties[t];
            for (t2 = 1; t2 < t1; t2++) {
              if (t_property[0] == tbl[0][t2]) {
                t_layer = t2;
                t2 = t1;
              }
            }
            // zoek t_property[2] (weergegeven key) in tbl
            for (t2 = 1, f = false; t2 < tbl.length; t2++) {
              if (tbl[t2][0] == t_property[2]) {
                if (tbl[t2][t_layer]) {
                  tbl[t2][t_layer][0] += tbl[t2][t_layer][1] + '<br>' + t_property[3] + t_property[4];
                  tbl[t2][t_layer][1] = '';
                }
                else {
                  tbl[t2][t_layer] = [t_property[3], t_property[4], t_property[5]];
                }
                f = true;
              }
            }
            if (!f) {
              t3 = tbl.length;
              tbl[t3] = [t_property[2]];
              for (t2 = 1; t2 < t1; t2++) {
                tbl[t3][t2] = false;
              }
              tbl[t3][t_layer] = [t_property[3], t_property[4], t_property[5]];
            }
          }
          if (tabelVorm == 3) { // Kruistabel Lagen horizontaal, properties vertikaal
            txt += '<tr><td></td>';
            for (t2 = 1; t2 < t1; t2++) {
              txt += '<td class="gis_ia_popup_h">' + GIS_ia_maps[map_id].layers_def[tbl[0][t2]].title + '</td>';
            }
            txt += '</tr>';
            for (t = 1; t < tbl.length; t++) {
              f = tbl[t];
              txt += '<tr><td class="gis_ia_popup_h">' + f[0] + '</td>';
              for (t2 = 1; t2 < t1; t2++) {
                if (f[t2]) {
                  txt += '<td' + (f[t2][2] ? ' style="text-align: right;"' : '') + '>' + f[t2][0] + f[t2][1] + '</td>';
                }
                else {
                  txt += '<td></td>';
                }
              }
              txt += '</tr>';
            }
          }
          else { // Kruistabel Lagen vertikaal, properties horizontaal
            txt += '<tr><td></td>';
            for (t = 1; t < tbl.length; t++) {
              f = tbl[t];
              txt += '<td class="gis_ia_popup_h">' + f[0] + '</td>';
            }
            txt += '</tr>';
            for (t2 = 1; t2 < t1; t2++) {
              txt += '<tr><td class="gis_ia_popup_h">' + GIS_ia_maps[map_id].layers_def[tbl[0][t2]].title + '</td>';
              for (t = 1; t < tbl.length; t++) {
                f = tbl[t];
                if (f[t2]) {
                  txt += '<td' + (f[t2][2] ? ' style="text-align: right;"' : '') + '>' + f[t2][0] + f[t2][1] + '</td>';
                }
                else {
                  txt += '<td></td>';
                }
              }
              txt += '</tr>';
            }
          }
          break;
        default:  // Lagen en features vertikaal
          for (t = 0, t_layer = -1; t < t_properties.length; t++) {
            t_property = t_properties[t];
            if (t_layer != t_property[0]) { // begin nieuwe layer
              if (GIS_ia_maps[map_id].tl == 1) {
                txt += '<tr' + (t == 0 ? '' : ' class="gis_ia_layer_header2"') + '><td colspan="2" class="gis_ia_layer_header">' + GIS_ia_maps[map_id].layers_def[t_property[0]].title + '</td></tr>';
              }
              t_feature_no = -1;
              t_layer = t_property[0];
            }
            if (t_feature_no != t_property[1]) {
              t_feature_no = t_property[1];
              t_feature_no_cls = (t_feature_no == 0 ? '' : ' class="gis_ia_feature_header2"');
            }
            else {
              t_feature_no_cls = '';
            }
            txt += '<tr' + t_feature_no_cls + '><td>' + t_property[2] + '</td><td' + (t_property[5] ? ' style="text-align: right;"' : '') + '>' + t_property[3] + t_property[4] + '</td></tr>';
          }
          break;
      }
      txt += '</table>';
    }
    else {
      nodata = true;
    }
    if (nodata) {
      if (GIS_ia_maps[map_id].m == '') {
        return;
      }
      txt = GIS_ia_maps[map_id].m;
    }
    var popupType = GIS_ia_maps[map_id].w1;
    if (jQuery('#gis_ia_map_' + map_id).find('.ol-control.ol-full-screen').find('button').hasClass('ol-full-screen-true')) {
      popupType = 0;
    }
    switch (popupType) {
      case 1:
        // afstemmen met drupal expert; Welk element bevat breedte scherm
        var el = jQuery('#main');
        // als niet main dan container
        if (el.length == 0) {
          el = jQuery('.container');
          if (el.length >= 1) {
            el = jQuery(el[0]);
          }
        }
        // voor entity view:
        if (el.length == 0) {
          el = jQuery('.page-content');
          if (el.length >= 1) {
            el = jQuery(el[0]);
          }
        }
        var x = jQuery('#gis_ia_map_' + map_id).offset().left + evt.pixel[0],
            w_screen = el.width(), x_screen = el.offset().left;
        var p = jQuery('#gis_ia_map_' + map_id + '_data');
        if (p.length == 0) {
          //p=jQuery('<div
          // id="gis_ia_map_'+map_id+'_data"></div>').insertAfter('#gis_ia_map_'+map_id);
          jQuery('#gis_ia_map_' + map_id).prepend('<div id="gis_ia_map_' + map_id + '_data" style="position: absolute;"></div>');
          p = jQuery('#gis_ia_map_' + map_id + '_data');
        }
        p.html('<div class="ol-popup-2" id="gis_ia_map_' + map_id + '_data_inner" style="margin: 0; max-width: ' + (w_screen - 16) + 'px;"><a class="ol-popup-closer" onclick="jQuery(\'#gis_ia_map_' + map_id + '_data\').hide();"></a><div style="overflow-y: auto;">' + txt + '</div></div>');
        p.show();
        var w_popup = jQuery('#gis_ia_map_' + map_id + '_data_inner').width() + 20,
            dx = 48;
        if (x - dx + w_popup >= x_screen + w_screen) {
          dx = x + w_popup - x_screen - w_screen + 1;
        }
        if (dx > w_popup - 48) {
          dx = w_popup - 48;
        }
        jQuery('#gis_ia_map_' + map_id + '_data_inner').css({
          top: (evt.pixel[1] + 10) + 'px',
          left: (evt.pixel[0] - dx - 1) + 'px',
        });
        // CSS aanpassen zodat pijltje boven de popup goed staat
        var s = document.getElementById('__style_map_' + map_id + '__');
        if (s) {
          s.innerHTML = '.ol-popup-2:before, .ol-popup-2:after {left: ' + dx + 'px !important;}';
        }
        else {
          s = document.createElement('style');
          s.setAttribute('id', '__style_map_' + map_id + '__');
          s.innerHTML = '.ol-popup-2:before, .ol-popup-2:after {left: ' + dx + 'px !important;}';
          document.body.appendChild(s);
        }
        p = jQuery('#gis_ia_map_' + map_id + '_data_inner');
        p = p.offset().top + p.outerHeight();
        x = jQuery(window);
        x = x.scrollTop() + x.height();
        if (p > x) {
          document.getElementById('gis_ia_map_' + map_id + '_data_inner').scrollIntoView(false);
        }
        break;
      default:
        //jQuery('#popup-content'+map_id).html('<div style="max-height:
        // '+(jQuery('#gis_ia_map_'+map_id).height()-120)+'px; overflow-y:
        // auto;">'+txt+'</div>');
        jQuery('#popup' + map_id).show();
        jQuery('#popup-content' + map_id).css({
          'max-height': (jQuery('#gis_ia_map_' + map_id).height() - 40) + 'px',
          'max-width': '100%',
          'overflow': 'auto'
        });
        jQuery('#popup-content' + map_id).html('<div>' + txt + '</div>');
        if (GIS_ia_maps[map_id].popupCenter === false) {
          GIS_ia_maps[map_id].popupCenter = GIS_ia_maps[map_id].map.getView().getCenter();
        }
        GIS_ia_maps[map_id].overlay.setPosition(evt.coordinate);
        // Dit geeft problemen in IE (werkt wel in chrome en FF):
        // document.getElementById('popup-content'+map_id).scrollIntoView(); In
        // Chrome is er een probleem als je bent ingelogd. Als je dan data
        // opvraagt, op Terschelling, dan wordt het data-window maar half
        // getoond. Als je de muis dan over de browser-werkbalk of - schuifbalk
        // beweegt, dan wordt het beeld bijgewerkt.
        break;
    }
  };

  // acties na het complete laden van de kaart en layers
  // NB: Op trage devices zijn de kaartlagen mogelijk nog niet helemaal geladen
  GIS_ia_maps[map_id].map.once('postrender', function () {
    // Verberg layers die initieel niet zichtbaar zijn (deze zijn als zichtbaar
    // aan openlayers opgegeven zodat ze op snellere devices al vast worden
    // geladen)
    for (var t = 0; t < GIS_ia_maps[map_id].layers.length; t++) {
      GIS_ia_maps[map_id].layers[t].setVisible(GIS_ia_maps[map_id].layers_def[t].visible_);
    }

    // zorg dat filterwindow zich aanpast
    gis_ia_filterwindowCheck(map_id);
    jQuery(window).resize(function () {
      gis_ia_filterwindowCheck(map_id);
    });

    // fullscreen
    if (GIS_ia_maps[map_id].f) {
      jQuery('#gis_ia_map_' + map_id).find('.gis_ia_fullscreen').each(function (t, el) {
        // bij schakelen van/naar fullscreen is het mooier om het zoom-level te
        // wijzigen. Dat past bij beleving bezoeker. daarom huidige size
        // opslaan en vertraagde functie gis_ia_fullscreenChange instellen
        var map = jQuery('#gis_ia_map_' + map_id);
        GIS_ia_maps[map_id].fullscreenPrevSize = [map.width(), map.height()];
        jQuery(el).on('click', function (e) {
          setTimeout('gis_ia_fullscreenChange(' + map_id + ');', 3000);
        });
      });
    }
    GIS_ia_maps[map_id].map.on('movestart', function (evt) {
      jQuery('#gis_ia_map_' + map_id + '_data').hide();
      gis_ia_filterwindowCheckHide(map_id);
    });

    // ScaleBar2
    if (GIS_ia_maps[map_id].sb >= 1) {
      ScaleBar2Set(map_id, GIS_ia_maps[map_id].map.getView().getResolution());
      GIS_ia_maps[map_id].map.getView().on('change:resolution', function (e) {
        ScaleBar2Set(map_id, e.oldValue);
      });
    }

    //GIS_ia_maps[map_id].currZoom =
    // GIS_ia_maps[map_id].map.getView().getZoom();
    GIS_ia_maps[map_id].map.on('moveend', function (evt) {
      if (jQuery(jQuery('#popup' + map_id).parent()).css('display') == 'none' && GIS_ia_maps[map_id].map.getView().getZoom() == 0) {
        GIS_ia_maps[map_id].map.getView().fit(GIS_ia_maps[map_id].extNL);
      }
    });
    /*GIS_ia_maps[map_id].nc_array = GIS_ia_maps[map_id].map.getView().calculateExtent(GIS_ia_maps[map_id].map.getSize());
    GIS_ia_maps[map_id].map.on('moveend', function(evt) {
      if (jQuery(jQuery('#popup'+map_id).parent()).css('display')=='none') { // als er geen popup is
        var map=GIS_ia_maps[map_id].map, view=map.getView();
        var extNL = GIS_ia_maps[map_id].extNL, extNL0=extNL[0], extNL1=extNL[1], extNL2=extNL[2], extNL3=extNL[3];
        var didit=false, d, ext=view.calculateExtent(map.getSize()), ext0=ext[0], ext1=ext[1], ext2=ext[2], ext3=ext[3];
        console.log([false,ext0,ext1,ext2,ext3]);
        if (ext0<extNL0) {didit=true; d=extNL0-ext0; ext0+=d; ext2+=d; console.log(['x1',d]);} // x1
        if (ext1<extNL1) {didit=true; d=extNL1-ext1; ext1+=d; ext3+=d; console.log(['y1',d]);} // y1
        if (ext2>extNL2) {didit=true; d=ext2-extNL2; ext0-=d; ext2-=d; console.log(['x2',d]);} // x2
        if (ext3>extNL3) {didit=true; d=ext3-extNL3; ext1-=d; ext3-=d; console.log(['y2',d]);} // y2
        if (didit) {
          view.fit([ext0,ext1,ext2,ext3]);
          console.log([true,ext0,ext1,ext2,ext3]);
        }
      }
    });*/
    GIS_ia_maps[map_id].map.on('singleclick', function (evt) {
      gis_ia_filters_submenuClick(map_id, -1);
      gis_ia_hidePanels(map_id);
      if (GIS_ia_maps[map_id].layerDataToDo >= 1) {
        return;
      }
      // hide popup type 1
      jQuery('#gis_ia_map_' + map_id + '_data').hide();

      map_id = evt.map.map_id;
      var t, d, s2, pos3;
      // vul de array layerData van deze map met true/false; Wel of geen data
      // verwacht
      GIS_ia_maps[map_id].layerDataToDo = 0;
      for (t = 0; t < GIS_ia_maps[map_id].layers_def.length; t++) {
        GIS_ia_maps[map_id].layerData[t] = true;
        GIS_ia_maps[map_id].layerDataToDo++;
      }
      for (var t = 0; t < GIS_ia_maps[map_id].layers_def.length; t++) {
        switch (GIS_ia_maps[map_id].layers_def[t].type) {
          case 'WMS':
          case 'datarivmnl':
          case 'wmsacceptatie':
            var view = evt.map.getView();
            var viewResolution = view.getResolution();
            var viewProjection = view.getProjection();
            var url = GIS_ia_maps[map_id].layers[t].getSource().getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection, {
              'kaartNo': t,
              'FEATURE_COUNT': 100,
              'INFO_FORMAT': 'application/json',
              'QUERY_LAYERS': GIS_ia_maps[map_id].layers_def[t].layer
            });
            if (url) {
              jQuery.ajax({
                type: "GET",
                url: url,
                layer_t: t,
                dataType: 'json'
              }).done(function (data) {
                if (data.features.length >= 1) {
                  GIS_ia_maps[map_id].layerData[this.layer_t] = data.features;
                }
                GIS_ia_maps[map_id].layerDataToDo--;
                setPopup(map_id, evt);
              }).fail(function (jqXHR, textStatus, errorThrown) {
                var msg = '';
                if (jqXHR.responseText) {
                  msg = jqXHR.responseText;
                }
                if (msg == '' && errorThrown) {
                  if (errorThrown.message) {
                    msg = errorThrown.message;
                  }
                }
                if (msg == '') {
                  msg = '(possible error) Cross-Origin Read Blocking (CORB) blocked cross-origin response';
                }
                console.log('Systeemfout: ' + msg);
                GIS_ia_maps[map_id].layerDataToDo--;
                setPopup(map_id, evt);
              });
            }
            break;
        }
      }
      // Op dit punt heeft de gebruiker een verzoek aan de server gestart
      jQuery('#gis_ia_map_' + map_id).css('cursor', 'none');
      var wait = jQuery('#wait' + map_id);
      if (wait.length == 0) {
        jQuery(jQuery('#gis_ia_map_' + map_id).find('.ol-overlaycontainer-stopevent')[0]).append('<div id="wait' + map_id + '" class="wait-cursor"></div>');
        wait = jQuery('#wait' + map_id);
      }
      wait.css({
        'position': 'absolute',
        'top': (evt.pixel[1] - 16) + 'px',
        'left': (evt.pixel[0] - 16) + 'px'
      }).show();
      //setPopup(map_id,evt,true);
    });
    // Position2: (igv zoekvelden)
    jQuery('.gis_ia_zoekveld').each(function (t, el) {
      el = jQuery(el);
      el.autocomplete({
		//containerClass wordt classes
        classes: 'autocomplete-suggestions panel',
		// appendTo blijft gelijk
        appendTo: jQuery(jQuery('#gis_ia_base_' + map_id).find('.gis_ia_position2')[0]),
		// width niet in API gevonden
        width: 'initial',
		//
        paramName: 'q',
		//
        serviceUrl: position2_url_suggest,
		// transformResult wordt source
        source: function (request, response) {
			jQuery.ajax({
				dataType: "json",
				type : 'Get',
				url: position2_url_suggest+'&q='+request.term,
				success: function(data) {
					var t,ans=[];
					for (t=0;t<data.response.docs.length;t++) {
						
					}
					response(['a','b','c']);
				},
				error: function(data) {
				}
			});
		},
		source__: function (response,bla) {
          var o = JSON.parse(response), t, t1 = o.response.docs.length;
          var a = {'suggestions': []};
          for (t = 0; t < t1; t++) {
            e = o.response.docs[t];
            a.suggestions[a.suggestions.length] = {
              value: e.weergavenaam,
              data: e.id
            };
          }
          return a;
        },
		// onSelect wordt search
        search__: function (suggestion) {
          jQuery.getJSON(position2_url_lookup + suggestion.data, function (data) {
            var l = data.response.docs[0].centroide_ll.split(' ');
            l[0] = parseFloat(l[0].substr(6));
            l[1] = parseFloat(l[1].substr(0, l[1].length - 1));
            gis_ia_position2map = map_id;
            gis_ia_gotoPosition2({coords: {longitude: l[0], latitude: l[1]}});
          });
        },
      }).on('keyup', function (e) {
        if (e.keyCode == 13) {
          var el = jQuery(jQuery(jQuery(this).parent()).find('.gis_ia_zoekknop')).click();
        }
      });
    });
    // 'Uit' zetten van openstaande panels
    jQuery('#gis_ia_map_' + map_id).find('button').mouseover(function (evt) {
      // zet alle panels uit
      jQuery('#gis_ia_map_' + map_id).find('.panel').each(function (t, el) {
        jQuery(jQuery(el).parent()).removeClass('shown');
      });
      // zet een evt popup uit
      closer.onclick();
      jQuery('#gis_ia_map_' + map_id + '_data').hide();
    });
    // als muis buiten kaart komt popup-2 uitzetten
    // Dit werkt niet omdat het bewegen van de muis in het data-window al een
    // mouseout van de kaart veroorzaakt;
    // jQuery('#gis_ia_map_'+map_id).on('mouseout',function()
    // {jQuery('#gis_ia_map_'+map_id+'_data').hide();});
  });
}

// Deze functie wordt aangeroepen na wijziging fullscreen
// Parameters:    map_id;    Integer; map ID
function gis_ia_fullscreenChange(map_id) {
  var map = jQuery('#gis_ia_map_' + map_id), to = [map.width(), map.height()];
  if (GIS_ia_maps[map_id].fullscreenPrevSize[0] != to[0] || GIS_ia_maps[map_id].fullscreenPrevSize[1] != to[1]) { // als het formaat wijzigt
    var fact,
        aspectratioFrom = GIS_ia_maps[map_id].fullscreenPrevSize[0] / GIS_ia_maps[map_id].fullscreenPrevSize[1],
        aspecRatioTo = to[0] / to[1];
    GIS_ia_maps[map_id].isFullscreen = false;
    if (GIS_ia_maps[map_id].fullscreenPrevSize[0] < to[0]) { // naar fullsize
      if (aspecRatioTo > aspectratioFrom) { // behoud hoogte
        fact = GIS_ia_maps[map_id].fullscreenPrevSize[1] / to[1];
//        console.log('Naar fullscreen: Behoud hoogte: '+fact);
      }
      else { // behoud breedte
        fact = GIS_ia_maps[map_id].fullscreenPrevSize[0] / to[0];
//        console.log('Naar fullscreen: Behoud breedte: '+fact);
      }
      GIS_ia_maps[map_id].isFullscreen = true;
    }
    else { // naar gewone weergave
      if (aspecRatioTo > aspectratioFrom) { // behoud hoogte
        fact = GIS_ia_maps[map_id].fullscreenPrevSize[0] / to[0];
//        console.log('Naar normalscreen: Behoud hoogte: '+fact);
      }
      else { // behoud breedte
        fact = GIS_ia_maps[map_id].fullscreenPrevSize[1] / to[1];
//        console.log('Naar normalscreen: Behoud breedte: '+fact);
      }
    }
    var v = GIS_ia_maps[map_id].map.getView();
    v.setResolution(fact * v.getResolution());
    GIS_ia_maps[map_id].fullscreenPrevSize = to;
    jQuery('#gis_ia_map_' + map_id + '_data').hide();
    gis_ia_filterwindowCheck(map_id);
  }
}

/*  Functies voor de timeslider:
  - gis_ia_laagControlText    toon de laagnaam boven de timeslider
  - gis_ia_gotoLayer(newLayer)   zet een nieuwe laag aan (en de oude uit)
  - gis_ia_togglePlay()       (start/stop) zet alle lagen uit en start met tonen van de eerste laag
  - gis_ia_playing        schakelt naar de volgende laag (en stopt bij de laatste laag)
  Gebruikte globale variabelen:
  - gis_ia_playAt        houdt bij hoe evr het afslepen is (laagnummer)
  - gis_ia_playN          variable met de timeout
  - gis_ia_playCT        variable met de timeout voor de laagnaam
*/
function gis_ia_laagControlText(map_id, lno) {
  var el = jQuery('#gis_ia_layerSliderLayer' + map_id);
  if (el.length == 1) {
    if (gis_ia_playCT > 0) {
      clearTimeout(gis_ia_playCT);
    }
    var t = GIS_ia_maps[map_id].layers_def[lno].title;
    el.html(t).show();
    gis_ia_playCT = setTimeout('jQuery(\'#gis_ia_layerSliderLayer' + map_id + '\').hide().html(\'\');', GIS_ia_maps[map_id].i);
  }
}

function gis_ia_gotoLayer(map_id, newLayer) {
  if (newLayer != GIS_ia_maps[map_id].currentLayer) {
    if (GIS_ia_maps[map_id].currentLayer >= 0) {
      GIS_ia_maps[map_id].layers[GIS_ia_maps[map_id].currentLayer].setVisible(false);
    }
    GIS_ia_maps[map_id].currentLayer = newLayer;
    if (GIS_ia_maps[map_id].currentLayer >= 0) {
      GIS_ia_maps[map_id].layers[GIS_ia_maps[map_id].currentLayer].setVisible(true);
    }
    gis_ia_laagControlText(map_id, newLayer);
  }
}

var gis_ia_playAt = -1, gis_ia_playN = 0, gis_ia_playCT = 0;

function gis_ia_togglePlay(map_id) {
  el = jQuery('#playpauze' + map_id);
  if (el.hasClass('play')) {
    for (var t = 1; t < GIS_ia_maps[map_id].layers.length; t++) {
      if (GIS_ia_maps[map_id].layers[t].getVisible()) {
        GIS_ia_maps[map_id].layers[t].setVisible(false);
      }
    }
    if (!GIS_ia_maps[map_id].layers[0].getVisible()) {
      GIS_ia_maps[map_id].layers[0].setVisible(true);
    }
    el.removeClass('play').addClass('pauze');
    gis_ia_playAt = 0;
    jQuery('#timeslider' + map_id).val(1);
    jQuery('#timeslider' + map_id).val(0);
    gis_ia_gotoLayer(map_id, 0);
    gis_ia_laagControlText(map_id, 0);
    gis_ia_playing(map_id);
  }
  else {
    if (GIS_ia_maps[map_id].currentLayer > 0) { // prevent clicking when just started
      el.removeClass('pauze').addClass('play');
      if (gis_ia_playN > 0) {
        clearTimeout(gis_ia_playN);
      }
    }
  }
}

function gis_ia_playing(map_id) {
  gis_ia_playN = setTimeout(function () {
    if (gis_ia_playAt < GIS_ia_maps[map_id].layers.length - 1) {
      gis_ia_playAt++;
      jQuery('#timeslider' + map_id).val(gis_ia_playAt);
      gis_ia_gotoLayer(map_id, gis_ia_playAt);
      gis_ia_playing(map_id);
    }
    else {
      el = jQuery('#playpauze' + map_id);
      el.removeClass('pauze').addClass('play');
    }
  }, GIS_ia_maps[map_id].i);
}

function gis_ia_hidePanels(map_id) {
  el = jQuery('#gis_ia_map_' + map_id).find('.filter');
  if (el.length >= 1) {
    if (el.hasClass('shown')) {
      el.removeClass('shown');
    }
  }
  el = jQuery('#gis_ia_map_' + map_id).find('.gis_ia_legenda');
  if (el.length >= 1) {
    el.find('.panel').hide();
  }
  gis_ia_filterwindowCheckHide(map_id);
}

/* tbv download */
window.downloadFile = function (sUrl) {
  if (/(iP)/g.test(navigator.userAgent)) {
    window.open(sUrl, '_blank');
    return false;
  }
  if (window.downloadFile.isChrome || window.downloadFile.isSafari) {
    var link = document.createElement('a');
    link.href = sUrl;
    link.setAttribute('target', '_blank');
    if (link.download !== undefined) {
      var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
      link.download = fileName;
    }
    if (document.createEvent) {
      var e = document.createEvent('MouseEvents');
      e.initEvent('click', true, true);
      link.dispatchEvent(e);
      return true;
    }
  }
  if (sUrl.indexOf('?') === -1) {
    sUrl += '?download';
  }
  window.open(sUrl, '_blank');
  return true;
};
window.downloadFile.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
window.downloadFile.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

function gis_ia_startDownload(map_id, lno, bb) {
  GIS_ia_maps[map_id].overlay.setPosition(undefined);
  if (GIS_ia_maps[map_id].popupCenter) {
    GIS_ia_maps[map_id].map.getView().animate({
      center: GIS_ia_maps[map_id].popupCenter,
      duration: 250
    });
  }
  if (lno >= 0 && lno < GIS_ia_maps[map_id].layers_def.length) {
    var layer = GIS_ia_maps[map_id].layers_def[lno], url = layer.url;
    layer = layer.layer;
    url = url.substr(0, url.length - 3) + '/wfs';
    url += '?service=WFS&version=2.0.0&request=GetFeature&typeNames=' + layer + '&srsName=EPSG:28992&outputFormat=CSV';
    if (bb) {
      var bbox = GIS_ia_maps[map_id].map.getView().calculateExtent();
      url += '&bbox=' + bbox.join(',');
    }
    downloadFile(url);
  }
}


if (typeof (Drupal) != 'undefined') {
  (function ($, Drupal, drupalSettings) {
    Drupal.behaviors.gis_ia_Behavior = {
      attach: function (context, settings) {
        if (context == document) {
          $('.ia_map').each(function (t, el) {
            el = $(el);
            var no = el.prop('id').substr(11);
            /***************
             Voor testdoeleinde: */
            if (Math.random() < 0.3) {
              $($($('#gis_ia_base_' + no).parent()).parent()).css({
                'float': 'right',
                'margin': '0 0 20px 40px',
                'width': '50%'
              });
            }
            else {
              if (Math.random() < 0.5) {
                $($($('#gis_ia_base_' + no).parent()).parent()).css({
                  'float': 'left',
                  'margin': '0 40px 20px 0',
                  'width': '50%'
                });
              }
            }
            /***************/
            GIS_paragraaf_start(parseInt(no, 10));
          });
        }
      }
    };
  })(jQuery, Drupal, drupalSettings);
}