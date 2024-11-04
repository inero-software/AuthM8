export const TEXTS = {
  cancel: 'Cancel',
  ok: 'OK',

  home: {
    invalidQr: 'Invalid QR code!',
    empty: 'No authenticators yet. Add your first one by following the instructions from a website.',
  },
  scanner: {
    label: 'Scan QR for OTP setup',
    permissionsError: 'There was an error starting the scanner. Make sure you have granted the camera permission.',
  },
  form: {
    disclaimer: 'Provide parameters given by the website. If the website does not provide them, keep the default values.',
    issuer: 'Website name',
    account: 'Your username',
    secret: 'Secret key',
    digits: 'Digits',
    algorithm: 'Algorithm',
    period: 'Period',
    submit: 'Save',

    issuerError: 'Website is required',
    accountError: 'Username is required',
    secretError: 'Invalid key',
    digitsError: 'Digits must be in 3-16 range',
    periodError: 'Period is required',
  },
  list: {
    copied: 'Copied code to clipboard',
    deleteDialogTitle: 'Are you sure you want to delete this generator?',
    deleteDialogMessage: 'If you delete this generator, you will lose all the codes generated by it. You may be unable to log in to the corresponding website.',
    deleteDialogCheckbox: 'I understand the consequences',
    deleteDialogCancel: 'Cancel',
    deleteDialogDelete: 'Delete',
    noMatching: 'Nothing matches the filter',
    generatorDeleted: 'The generator has been removed',
    generatorUpdated: 'The generator has been updated',
  },
  storage: {
    exportError: 'Error exporting',
    exportSuccess: 'Exported successfully',
    importError: 'Invalid import file',
    importWrongPassword: 'Wrong password',
    cancel: 'Cancel',
    passwordExport: 'Enter a password to protect the exported file',
    passwordImport: 'Enter the password used for exporting',
  },
  auth: {
    authenticate: 'Authenticate',
    unsecuredDevice: 'Cannot authenticate. Make sure your device is secured with a PIN, pattern, password, or biometrics.',
    failure: "Couldn't authenticate. Try again?",
  },
};