<?php

namespace Drupal\sdv_gis;

use Drupal\Core\Entity\Sql\SqlContentEntityStorage;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\sdv_gis\Entity\SdvGisEntityInterface;

/**
 * Defines the storage handler class for Sdv gis entity entities.
 *
 * This extends the base storage class, adding required special handling for
 * Sdv gis entity entities.
 *
 * @ingroup sdv_gis
 */
class SdvGisEntityStorage extends SqlContentEntityStorage implements SdvGisEntityStorageInterface {

  /**
   * {@inheritdoc}
   */
  public function revisionIds(SdvGisEntityInterface $entity) {
    return $this->database->query(
      'SELECT vid FROM {sdv_gis_entity_revision} WHERE id=:id ORDER BY vid',
      [':id' => $entity->id()]
    )->fetchCol();
  }

  /**
   * {@inheritdoc}
   */
  public function userRevisionIds(AccountInterface $account) {
    return $this->database->query(
      'SELECT vid FROM {sdv_gis_entity_field_revision} WHERE uid = :uid ORDER BY vid',
      [':uid' => $account->id()]
    )->fetchCol();
  }

  /**
   * {@inheritdoc}
   */
  public function countDefaultLanguageRevisions(SdvGisEntityInterface $entity) {
    return $this->database->query('SELECT COUNT(*) FROM {sdv_gis_entity_field_revision} WHERE id = :id AND default_langcode = 1', [':id' => $entity->id()])
      ->fetchField();
  }

  /**
   * {@inheritdoc}
   */
  public function clearRevisionsLanguage(LanguageInterface $language) {
    return $this->database->update('sdv_gis_entity_revision')
      ->fields(['langcode' => LanguageInterface::LANGCODE_NOT_SPECIFIED])
      ->condition('langcode', $language->getId())
      ->execute();
  }

}
