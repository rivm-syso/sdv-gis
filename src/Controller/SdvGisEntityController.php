<?php

namespace Drupal\sdv_gis\Controller;

use Drupal\Component\Utility\Xss;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Datetime\DateFormatter;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Render\Renderer;
use Drupal\Core\Url;
use Drupal\sdv_gis\Entity\SdvGisEntityInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class SdvGisEntityController.
 *
 *  Returns responses for Sdv gis entity routes.
 */
class SdvGisEntityController extends ControllerBase implements ContainerInjectionInterface {


  /**
   * The date formatter.
   *
   * @var \Drupal\Core\Datetime\DateFormatter
   */
  protected $dateFormatter;

  /**
   * The renderer.
   *
   * @var \Drupal\Core\Render\Renderer
   */
  protected $renderer;

  /**
   * Constructs a new SdvGisEntityController.
   *
   * @param \Drupal\Core\Datetime\DateFormatter $date_formatter
   *   The date formatter.
   * @param \Drupal\Core\Render\Renderer $renderer
   *   The renderer.
   */
  public function __construct(DateFormatter $date_formatter, Renderer $renderer) {
    $this->dateFormatter = $date_formatter;
    $this->renderer = $renderer;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('date.formatter'),
      $container->get('renderer')
    );
  }

  /**
   * Displays a Sdv gis entity revision.
   *
   * @param int $sdv_gis_entity_revision
   *   The Sdv gis entity revision ID.
   *
   * @return array
   *   An array suitable for drupal_render().
   */
  public function revisionShow($sdv_gis_entity_revision) {
    $sdv_gis_entity = $this->entityTypeManager()->getStorage('sdv_gis_entity')
      ->loadRevision($sdv_gis_entity_revision);
    $view_builder = $this->entityTypeManager()->getViewBuilder('sdv_gis_entity');

    return $view_builder->view($sdv_gis_entity);
  }

  /**
   * Page title callback for a Sdv gis entity revision.
   *
   * @param int $sdv_gis_entity_revision
   *   The Sdv gis entity revision ID.
   *
   * @return string
   *   The page title.
   */
  public function revisionPageTitle($sdv_gis_entity_revision) {
    $sdv_gis_entity = $this->entityTypeManager()->getStorage('sdv_gis_entity')
      ->loadRevision($sdv_gis_entity_revision);
    return $this->t('Revision of %title from %date', [
      '%title' => $sdv_gis_entity->label(),
      '%date' => $this->dateFormatter->format($sdv_gis_entity->getRevisionCreationTime()),
    ]);
  }

  /**
   * Generates an overview table of older revisions of a Sdv gis entity.
   *
   * @param \Drupal\sdv_gis\Entity\SdvGisEntityInterface $sdv_gis_entity
   *   A Sdv gis entity object.
   *
   * @return array
   *   An array as expected by drupal_render().
   */
  public function revisionOverview(SdvGisEntityInterface $sdv_gis_entity) {
    $account = $this->currentUser();
    $sdv_gis_entity_storage = $this->entityTypeManager()->getStorage('sdv_gis_entity');

    $langcode = $sdv_gis_entity->language()->getId();
    $langname = $sdv_gis_entity->language()->getName();
    $languages = $sdv_gis_entity->getTranslationLanguages();
    $has_translations = (count($languages) > 1);
    $build['#title'] = $has_translations ? $this->t('@langname revisions for %title', ['@langname' => $langname, '%title' => $sdv_gis_entity->label()]) : $this->t('Revisions for %title', ['%title' => $sdv_gis_entity->label()]);

    $header = [$this->t('Revision'), $this->t('Operations')];
    $revert_permission = (($account->hasPermission("revert all sdv gis entity revisions") || $account->hasPermission('administer sdv gis entity entities')));
    $delete_permission = (($account->hasPermission("delete all sdv gis entity revisions") || $account->hasPermission('administer sdv gis entity entities')));

    $rows = [];

    $vids = $sdv_gis_entity_storage->revisionIds($sdv_gis_entity);

    $latest_revision = TRUE;

    foreach (array_reverse($vids) as $vid) {
      /** @var \Drupal\sdv_gis\SdvGisEntityInterface $revision */
      $revision = $sdv_gis_entity_storage->loadRevision($vid);
      // Only show revisions that are affected by the language that is being
      // displayed.
      if ($revision->hasTranslation($langcode) && $revision->getTranslation($langcode)->isRevisionTranslationAffected()) {
        $username = [
          '#theme' => 'username',
          '#account' => $revision->getRevisionUser(),
        ];

        // Use revision link to link to revisions that are not active.
        $date = $this->dateFormatter->format($revision->getRevisionCreationTime(), 'short');
        if ($vid != $sdv_gis_entity->getRevisionId()) {
          $link = $this->l($date, new Url('entity.sdv_gis_entity.revision', [
            'sdv_gis_entity' => $sdv_gis_entity->id(),
            'sdv_gis_entity_revision' => $vid,
          ]));
        }
        else {
          $link = $sdv_gis_entity->link($date);
        }

        $row = [];
        $column = [
          'data' => [
            '#type' => 'inline_template',
            '#template' => '{% trans %}{{ date }} by {{ username }}{% endtrans %}{% if message %}<p class="revision-log">{{ message }}</p>{% endif %}',
            '#context' => [
              'date' => $link,
              'username' => $this->renderer->renderPlain($username),
              'message' => [
                '#markup' => $revision->getRevisionLogMessage(),
                '#allowed_tags' => Xss::getHtmlTagList(),
              ],
            ],
          ],
        ];
        $row[] = $column;

        if ($latest_revision) {
          $row[] = [
            'data' => [
              '#prefix' => '<em>',
              '#markup' => $this->t('Current revision'),
              '#suffix' => '</em>',
            ],
          ];
          foreach ($row as &$current) {
            $current['class'] = ['revision-current'];
          }
          $latest_revision = FALSE;
        }
        else {
          $links = [];
          if ($revert_permission) {
            $links['revert'] = [
              'title' => $this->t('Revert'),
              'url' => $has_translations ?
              Url::fromRoute('entity.sdv_gis_entity.translation_revert', [
                'sdv_gis_entity' => $sdv_gis_entity->id(),
                'sdv_gis_entity_revision' => $vid,
                'langcode' => $langcode,
              ]) :
              Url::fromRoute('entity.sdv_gis_entity.revision_revert', [
                'sdv_gis_entity' => $sdv_gis_entity->id(),
                'sdv_gis_entity_revision' => $vid,
              ]),
            ];
          }

          if ($delete_permission) {
            $links['delete'] = [
              'title' => $this->t('Delete'),
              'url' => Url::fromRoute('entity.sdv_gis_entity.revision_delete', [
                'sdv_gis_entity' => $sdv_gis_entity->id(),
                'sdv_gis_entity_revision' => $vid,
              ]),
            ];
          }

          $row[] = [
            'data' => [
              '#type' => 'operations',
              '#links' => $links,
            ],
          ];
        }

        $rows[] = $row;
      }
    }

    $build['sdv_gis_entity_revisions_table'] = [
      '#theme' => 'table',
      '#rows' => $rows,
      '#header' => $header,
    ];

    return $build;
  }

}
