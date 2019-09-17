<?php

namespace Drupal\sdv_gis\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\RevisionLogInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\Core\Entity\EntityPublishedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Sdv gis entity entities.
 *
 * @ingroup sdv_gis
 */
interface SdvGisEntityInterface extends ContentEntityInterface, RevisionLogInterface, EntityChangedInterface, EntityPublishedInterface, EntityOwnerInterface {

  /**
   * Add get/set methods for your configuration properties here.
   */

  /**
   * Gets the Sdv gis entity name.
   *
   * @return string
   *   Name of the Sdv gis entity.
   */
  public function getName();

  /**
   * Sets the Sdv gis entity name.
   *
   * @param string $name
   *   The Sdv gis entity name.
   *
   * @return \Drupal\sdv_gis\Entity\SdvGisEntityInterface
   *   The called Sdv gis entity entity.
   */
  public function setName($name);

  /**
   * Gets the Sdv gis entity creation timestamp.
   *
   * @return int
   *   Creation timestamp of the Sdv gis entity.
   */
  public function getCreatedTime();

  /**
   * Sets the Sdv gis entity creation timestamp.
   *
   * @param int $timestamp
   *   The Sdv gis entity creation timestamp.
   *
   * @return \Drupal\sdv_gis\Entity\SdvGisEntityInterface
   *   The called Sdv gis entity entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Gets the Sdv gis entity revision creation timestamp.
   *
   * @return int
   *   The UNIX timestamp of when this revision was created.
   */
  public function getRevisionCreationTime();

  /**
   * Sets the Sdv gis entity revision creation timestamp.
   *
   * @param int $timestamp
   *   The UNIX timestamp of when this revision was created.
   *
   * @return \Drupal\sdv_gis\Entity\SdvGisEntityInterface
   *   The called Sdv gis entity entity.
   */
  public function setRevisionCreationTime($timestamp);

  /**
   * Gets the Sdv gis entity revision author.
   *
   * @return \Drupal\user\UserInterface
   *   The user entity for the revision author.
   */
  public function getRevisionUser();

  /**
   * Sets the Sdv gis entity revision author.
   *
   * @param int $uid
   *   The user ID of the revision author.
   *
   * @return \Drupal\sdv_gis\Entity\SdvGisEntityInterface
   *   The called Sdv gis entity entity.
   */
  public function setRevisionUserId($uid);

}
