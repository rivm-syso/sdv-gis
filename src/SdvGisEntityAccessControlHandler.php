<?php

namespace Drupal\sdv_gis;

use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;

/**
 * Access controller for the Sdv gis entity entity.
 *
 * @see \Drupal\sdv_gis\Entity\SdvGisEntity.
 */
class SdvGisEntityAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   */
  protected function checkAccess(EntityInterface $entity, $operation, AccountInterface $account) {
    /** @var \Drupal\sdv_gis\Entity\SdvGisEntityInterface $entity */
    switch ($operation) {
      case 'view':
        if (!$entity->isPublished()) {
          return AccessResult::allowedIfHasPermission($account, 'view unpublished sdv gis entity entities');
        }
        return AccessResult::allowedIfHasPermission($account, 'view published sdv gis entity entities');

      case 'update':
        return AccessResult::allowedIfHasPermission($account, 'edit sdv gis entity entities');

      case 'delete':
        return AccessResult::allowedIfHasPermission($account, 'delete sdv gis entity entities');
    }

    // Unknown operation, no opinion.
    return AccessResult::neutral();
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL) {
    return AccessResult::allowedIfHasPermission($account, 'add sdv gis entity entities');
  }

}
