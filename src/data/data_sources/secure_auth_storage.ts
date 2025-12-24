import * as Keychain from 'react-native-keychain';

const SERVICE = 'stationscout-mobile-auth';

export const SecureAuthStorage = {
  async saveCredentials(
    email: string,
    password: string,
    enableBiometrics: boolean,
  ) {
    await Keychain.setGenericPassword(email, password, {
      service: SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      accessControl: enableBiometrics
        ? Keychain.ACCESS_CONTROL.BIOMETRY_ANY
        : undefined,
    });
  },

  async getCredentials(options?: Keychain.Options) {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE,
      ...options,
    });
    return credentials;
  },

  async getCredentialsWithBiometrics(promptMessage = 'Authenticate') {
    return SecureAuthStorage.getCredentials({
      authenticationPrompt: {
        title: promptMessage,
      },
    });
  },

  async clear() {
    await Keychain.resetGenericPassword({ service: SERVICE });
  },

  async hasCredentials() {
    const credentials = await SecureAuthStorage.getCredentials();
    return Boolean(credentials);
  },
};
