// Check the value of a field and return true if it has a value
function hasValue(quickViewControl, fieldName) {
  const fieldControl = quickViewControl.getControl(fieldName);
  return fieldControl && fieldControl.getAttribute()?.getValue() !== null;
}

// Show or hide a field based on its visibility
function toggleFieldVisibility(quickViewControl, fieldName, isVisible) {
  const fieldControl = quickViewControl.getControl(fieldName);
  if (fieldControl) {
    fieldControl.setVisible(isVisible);
  }
}

this.updateQuickViewVisibility = function (executionContext) {
  const formContext = executionContext.getFormContext();
  const quickViewControl = formContext.ui.quickForms.get(
    "primaryContactQuickView"
  );

  // Store the visibility of each field depending on whether it has a value
  const fieldVisibility = {
    emailaddress1: hasValue(quickViewControl, "emailaddress1"),
    mobilephone: hasValue(quickViewControl, "mobilephone"),
    telephone1: hasValue(quickViewControl, "telephone1"),
  };

  // Set visibility based on priority
  toggleFieldVisibility(
    quickViewControl,
    "emailaddress1",
    fieldVisibility.emailaddress1
  );

  toggleFieldVisibility(
    quickViewControl,
    "mobilephone",
    fieldVisibility.mobilephone
  );

  // Only when mobilephone is not visible, show telephone1 (but only if it has a value)
  toggleFieldVisibility(
    quickViewControl,
    "telephone1",
    !fieldVisibility.mobilephone && fieldVisibility.telephone1
  );
};
