<?php

namespace Drupal\sdv_gis;

use Drupal\Core\Entity\ContentEntityStorageInterface;
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
interface SdvGisEntityStorageInterface extends ContentEntityStorageInterface {

  /**
   * Gets a list of Sdv gis entity revision IDs for a specific Sdv gis entity.
   *
   * @param \Drupal\sdv_gis\Entity\SdvGisEntityInterface $entity
   *   The Sdv gis entity entity.
   *
   * @return int[]
   *   Sdv gis entity revision IDs (in ascending order).
   */
  public function revisionIds(SdvGisEntityInterface $entity);

  /**
   * Gets a list of revision IDs having a given user as Sdv gis entity author.
   *
   * @param \Drupal\Core\Session\AccountInterface $account
   *   The user entity.
   *
   * @return int[]
   *   Sdv gis entity revision IDs (in ascending order).
   */
  public function userRevisionIds(AccountInterface $account);

  /**
   * Counts the number of revisions in the default language.
   *
   * @param \Drupal\sdv_gis\Entity\SdvGisEntityInterface $entity
   *   The Sdv gis entity entity.
   *
   * @return int
   *   The number of revisions in the default language.
   */
  public function countDefaultLanguageRevisions(SdvGisEntityInterface $entity);

  /**
   * Unsets the language for all Sdv gis entity with the given language.
   *
   * @param \Drupal\Core\Language\LanguageInterface $language
   *   The language object.
   */
  public function clearRevisionsLanguage(LanguageInterface $language);

}
