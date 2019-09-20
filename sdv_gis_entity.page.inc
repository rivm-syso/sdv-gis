<?php

/**
 * @file
 * Contains sdv_gis_entity.page.inc.
 *
 * Page callback for Sdv gis entity entities.
 */

use Drupal\Core\Render\Element;

/**
 * Prepares variables for Sdv gis entity templates.
 *
 * Default template: sdv_gis_entity.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - elements: An associative array containing the user information and any
 *   - attributes: HTML attributes for the containing element.
 */
function template_preprocess_sdv_gis_entity(array &$variables) {
if (file_exists('/var/www/html/drupal/published/rob')) {$deb=file_get_contents('/var/www/html/drupal/published/rob');} else {$deb='';}
file_put_contents('/var/www/html/drupal/published/rob','template_preprocess_sdv_gis_entity',chr(13).$deb);	
  // Fetch SdvGisEntity Entity Object.
  $sdv_gis_entity = $variables['elements']['#sdv_gis_entity'];

  // Helpful $content variable for templates.
  foreach (Element::children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }
}