<?php

namespace Drupal\sdv_gis;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;

/**
 * Defines a class to build a listing of Sdv gis entity entities.
 *
 * @ingroup sdv_gis
 */
class SdvGisEntityListBuilder extends EntityListBuilder {

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['id'] = $this->t('Sdv gis entity ID');
    $header['name'] = $this->t('Name');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var \Drupal\sdv_gis\Entity\SdvGisEntity $entity */
    $row['id'] = $entity->id();
    $row['name'] = Link::createFromRoute(
      $entity->label(),
      'entity.sdv_gis_entity.edit_form',
      ['sdv_gis_entity' => $entity->id()]
    );
    return $row + parent::buildRow($entity);
  }

}
