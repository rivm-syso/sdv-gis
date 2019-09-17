<?php

namespace Drupal\sdv_gis\Entity;

use Drupal\views\EntityViewsData;

/**
 * Provides Views data for Sdv gis entity entities.
 */
class SdvGisEntityViewsData extends EntityViewsData {

  /**
   * {@inheritdoc}
   */
  public function getViewsData() {
    $data = parent::getViewsData();

    // Additional information for Views integration, such as table joins, can be
    // put here.
    return $data;
  }

}
