<?php

namespace Drupal\sdv_gis\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class SdvGisEntitySettingsForm.
 *
 * @ingroup sdv_gis
 */
class SdvGisEntitySettingsForm extends FormBase {

  /**
   * Returns a unique string identifying the form.
   *
   * @return string
   *   The unique string identifying the form.
   */
  public function getFormId() {
    return 'sdvgisentity_settings';
  }

  /**
   * Form submission handler.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('sdv_gis.ents')->set('urls', $form_state->getValue('urls'))->save();
}

  /**
   * Defines the settings form for Sdv gis entity entities.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   *
   * @return array
   *   Form definition array.
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
	$config = $this->config('sdv_gis.ents');
    $form['sdvgisentity_settings']['#markup'] = 'Settings form for Sdv gis entity entities. Manage field settings here.';
    $form['description'] = [
      '#type' => 'item',
      '#markup' => $this->t('Please enter the title and accept the terms of use of the site.'),
    ];
	$form['urls'] = [
      '#type' => 'textfield',
      '#title' => $this->t('URL'),
      '#description' => $this->t('Enter the URL(s) of the map-server(s).'),
      '#required' => TRUE,
      '#size' => 64,
      '#default_value' => $config->get('urls'),    ];

    // Group submit handlers in an actions element with a key of "actions" so
    // that it gets styled correctly, and so that other modules may add actions
    // to the form. This is not required, but is convention.
    $form['actions'] = [
      '#type' => 'actions',
    ];

    // Add a submit button that handles the submission of the form.
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Submit'),
    ];
    return $form;
  }

}
