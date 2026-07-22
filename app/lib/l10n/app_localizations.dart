import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_es.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('es'),
    Locale('en')
  ];

  /// No description provided for @appTitle.
  ///
  /// In es, this message translates to:
  /// **'BoliviaExperience'**
  String get appTitle;

  /// No description provided for @appSubtitle.
  ///
  /// In es, this message translates to:
  /// **'Toda Santa Cruz en la palma de tu mano'**
  String get appSubtitle;

  /// No description provided for @onboardingPage1Title.
  ///
  /// In es, this message translates to:
  /// **'Descubre lugares increíbles'**
  String get onboardingPage1Title;

  /// No description provided for @onboardingPage1Subtitle.
  ///
  /// In es, this message translates to:
  /// **'Explora lo mejor de Santa Cruz de la Sierra'**
  String get onboardingPage1Subtitle;

  /// No description provided for @onboardingPage2Title.
  ///
  /// In es, this message translates to:
  /// **'Guarda tus favoritos'**
  String get onboardingPage2Title;

  /// No description provided for @onboardingPage2Subtitle.
  ///
  /// In es, this message translates to:
  /// **'Crea tu lista personal de lugares que te encantan'**
  String get onboardingPage2Subtitle;

  /// No description provided for @onboardingPage3Title.
  ///
  /// In es, this message translates to:
  /// **'Comparte con amigos'**
  String get onboardingPage3Title;

  /// No description provided for @onboardingPage3Subtitle.
  ///
  /// In es, this message translates to:
  /// **'Recomienda lugares geniales a tus amigos'**
  String get onboardingPage3Subtitle;

  /// No description provided for @onboardingNext.
  ///
  /// In es, this message translates to:
  /// **'Siguiente'**
  String get onboardingNext;

  /// No description provided for @onboardingStart.
  ///
  /// In es, this message translates to:
  /// **'Empezar'**
  String get onboardingStart;

  /// No description provided for @onboardingSkip.
  ///
  /// In es, this message translates to:
  /// **'Omitir'**
  String get onboardingSkip;

  /// No description provided for @loginTitle.
  ///
  /// In es, this message translates to:
  /// **'Iniciar Sesión'**
  String get loginTitle;

  /// No description provided for @loginEmail.
  ///
  /// In es, this message translates to:
  /// **'Correo electrónico'**
  String get loginEmail;

  /// No description provided for @loginPassword.
  ///
  /// In es, this message translates to:
  /// **'Contraseña'**
  String get loginPassword;

  /// No description provided for @loginButton.
  ///
  /// In es, this message translates to:
  /// **'Iniciar Sesión'**
  String get loginButton;

  /// No description provided for @loginGoogle.
  ///
  /// In es, this message translates to:
  /// **'Continuar con Google'**
  String get loginGoogle;

  /// No description provided for @loginNoAccount.
  ///
  /// In es, this message translates to:
  /// **'¿No tienes cuenta?'**
  String get loginNoAccount;

  /// No description provided for @loginRegister.
  ///
  /// In es, this message translates to:
  /// **'Regístrate'**
  String get loginRegister;

  /// No description provided for @registerTitle.
  ///
  /// In es, this message translates to:
  /// **'Crear Cuenta'**
  String get registerTitle;

  /// No description provided for @registerName.
  ///
  /// In es, this message translates to:
  /// **'Nombre completo'**
  String get registerName;

  /// No description provided for @registerEmail.
  ///
  /// In es, this message translates to:
  /// **'Correo electrónico'**
  String get registerEmail;

  /// No description provided for @registerPassword.
  ///
  /// In es, this message translates to:
  /// **'Contraseña'**
  String get registerPassword;

  /// No description provided for @registerConfirmPassword.
  ///
  /// In es, this message translates to:
  /// **'Confirmar contraseña'**
  String get registerConfirmPassword;

  /// No description provided for @registerButton.
  ///
  /// In es, this message translates to:
  /// **'Crear Cuenta'**
  String get registerButton;

  /// No description provided for @registerHasAccount.
  ///
  /// In es, this message translates to:
  /// **'¿Ya tienes cuenta?'**
  String get registerHasAccount;

  /// No description provided for @registerLogin.
  ///
  /// In es, this message translates to:
  /// **'Inicia Sesión'**
  String get registerLogin;

  /// No description provided for @homeTitle.
  ///
  /// In es, this message translates to:
  /// **'BoliviaExperience'**
  String get homeTitle;

  /// No description provided for @homeSubtitle.
  ///
  /// In es, this message translates to:
  /// **'Santa Cruz de la Sierra'**
  String get homeSubtitle;

  /// No description provided for @homeSearch.
  ///
  /// In es, this message translates to:
  /// **'¿Qué estás buscando?'**
  String get homeSearch;

  /// No description provided for @homeFeatured.
  ///
  /// In es, this message translates to:
  /// **'Lugares Destacados'**
  String get homeFeatured;

  /// No description provided for @homeEvents.
  ///
  /// In es, this message translates to:
  /// **'Eventos de Hoy'**
  String get homeEvents;

  /// No description provided for @homePromotions.
  ///
  /// In es, this message translates to:
  /// **'Promociones'**
  String get homePromotions;

  /// No description provided for @homeSeeAll.
  ///
  /// In es, this message translates to:
  /// **'Ver todos'**
  String get homeSeeAll;

  /// No description provided for @exploreTitle.
  ///
  /// In es, this message translates to:
  /// **'Explorar'**
  String get exploreTitle;

  /// No description provided for @exploreCategories.
  ///
  /// In es, this message translates to:
  /// **'Categorías'**
  String get exploreCategories;

  /// No description provided for @searchTitle.
  ///
  /// In es, this message translates to:
  /// **'Buscar'**
  String get searchTitle;

  /// No description provided for @searchPlaceholder.
  ///
  /// In es, this message translates to:
  /// **'Buscar lugares...'**
  String get searchPlaceholder;

  /// No description provided for @searchHistory.
  ///
  /// In es, this message translates to:
  /// **'Búsquedas recientes'**
  String get searchHistory;

  /// No description provided for @searchClear.
  ///
  /// In es, this message translates to:
  /// **'Limpiar'**
  String get searchClear;

  /// No description provided for @favoritesTitle.
  ///
  /// In es, this message translates to:
  /// **'Favoritos'**
  String get favoritesTitle;

  /// No description provided for @favoritesEmpty.
  ///
  /// In es, this message translates to:
  /// **'No tienes favoritos aún'**
  String get favoritesEmpty;

  /// No description provided for @favoritesEmptySubtitle.
  ///
  /// In es, this message translates to:
  /// **'Guarda lugares que te gusten'**
  String get favoritesEmptySubtitle;

  /// No description provided for @profileTitle.
  ///
  /// In es, this message translates to:
  /// **'Mi Perfil'**
  String get profileTitle;

  /// No description provided for @profileEdit.
  ///
  /// In es, this message translates to:
  /// **'Editar Perfil'**
  String get profileEdit;

  /// No description provided for @profileSettings.
  ///
  /// In es, this message translates to:
  /// **'Configuración'**
  String get profileSettings;

  /// No description provided for @profileLogout.
  ///
  /// In es, this message translates to:
  /// **'Cerrar Sesión'**
  String get profileLogout;

  /// No description provided for @profileReviews.
  ///
  /// In es, this message translates to:
  /// **'Mis Reseñas'**
  String get profileReviews;

  /// No description provided for @profileFavorites.
  ///
  /// In es, this message translates to:
  /// **'Mis Favoritos'**
  String get profileFavorites;

  /// No description provided for @placeDetailReviews.
  ///
  /// In es, this message translates to:
  /// **'Reseñas'**
  String get placeDetailReviews;

  /// No description provided for @placeDetailPhotos.
  ///
  /// In es, this message translates to:
  /// **'Fotos'**
  String get placeDetailPhotos;

  /// No description provided for @placeDetailHours.
  ///
  /// In es, this message translates to:
  /// **'Horarios'**
  String get placeDetailHours;

  /// No description provided for @placeDetailDirection.
  ///
  /// In es, this message translates to:
  /// **'Cómo llegar'**
  String get placeDetailDirection;

  /// No description provided for @placeDetailCall.
  ///
  /// In es, this message translates to:
  /// **'Llamar'**
  String get placeDetailCall;

  /// No description provided for @placeDetailShare.
  ///
  /// In es, this message translates to:
  /// **'Compartir'**
  String get placeDetailShare;

  /// No description provided for @placeDetailFavorite.
  ///
  /// In es, this message translates to:
  /// **'Favorito'**
  String get placeDetailFavorite;

  /// No description provided for @placeDetailWriteReview.
  ///
  /// In es, this message translates to:
  /// **'Escribir reseña'**
  String get placeDetailWriteReview;

  /// No description provided for @reviewRating.
  ///
  /// In es, this message translates to:
  /// **'Calificación'**
  String get reviewRating;

  /// No description provided for @reviewComment.
  ///
  /// In es, this message translates to:
  /// **'Comentario (opcional)'**
  String get reviewComment;

  /// No description provided for @reviewSubmit.
  ///
  /// In es, this message translates to:
  /// **'Publicar'**
  String get reviewSubmit;

  /// No description provided for @reviewPlaceholder.
  ///
  /// In es, this message translates to:
  /// **'¿Qué te pareció este lugar?'**
  String get reviewPlaceholder;

  /// No description provided for @eventsTitle.
  ///
  /// In es, this message translates to:
  /// **'Eventos'**
  String get eventsTitle;

  /// No description provided for @eventsEmpty.
  ///
  /// In es, this message translates to:
  /// **'No hay eventos disponibles'**
  String get eventsEmpty;

  /// No description provided for @promotionsTitle.
  ///
  /// In es, this message translates to:
  /// **'Promociones'**
  String get promotionsTitle;

  /// No description provided for @promotionsEmpty.
  ///
  /// In es, this message translates to:
  /// **'No hay promociones disponibles'**
  String get promotionsEmpty;

  /// No description provided for @notificationsTitle.
  ///
  /// In es, this message translates to:
  /// **'Notificaciones'**
  String get notificationsTitle;

  /// No description provided for @notificationsEmpty.
  ///
  /// In es, this message translates to:
  /// **'No tienes notificaciones'**
  String get notificationsEmpty;

  /// No description provided for @settingsTitle.
  ///
  /// In es, this message translates to:
  /// **'Configuración'**
  String get settingsTitle;

  /// No description provided for @settingsDarkMode.
  ///
  /// In es, this message translates to:
  /// **'Modo Oscuro'**
  String get settingsDarkMode;

  /// No description provided for @settingsLanguage.
  ///
  /// In es, this message translates to:
  /// **'Idioma'**
  String get settingsLanguage;

  /// No description provided for @settingsAbout.
  ///
  /// In es, this message translates to:
  /// **'Acerca de'**
  String get settingsAbout;

  /// No description provided for @settingsPrivacy.
  ///
  /// In es, this message translates to:
  /// **'Política de Privacidad'**
  String get settingsPrivacy;

  /// No description provided for @settingsTerms.
  ///
  /// In es, this message translates to:
  /// **'Términos de Uso'**
  String get settingsTerms;

  /// No description provided for @errorGeneric.
  ///
  /// In es, this message translates to:
  /// **'Algo salió mal'**
  String get errorGeneric;

  /// No description provided for @errorNetwork.
  ///
  /// In es, this message translates to:
  /// **'Sin conexión a internet'**
  String get errorNetwork;

  /// No description provided for @errorNotFound.
  ///
  /// In es, this message translates to:
  /// **'No encontrado'**
  String get errorNotFound;

  /// No description provided for @errorUnauthorized.
  ///
  /// In es, this message translates to:
  /// **'Sesión expirada'**
  String get errorUnauthorized;

  /// No description provided for @errorServer.
  ///
  /// In es, this message translates to:
  /// **'Error del servidor'**
  String get errorServer;

  /// No description provided for @retry.
  ///
  /// In es, this message translates to:
  /// **'Reintentar'**
  String get retry;

  /// No description provided for @cancel.
  ///
  /// In es, this message translates to:
  /// **'Cancelar'**
  String get cancel;

  /// No description provided for @save.
  ///
  /// In es, this message translates to:
  /// **'Guardar'**
  String get save;

  /// No description provided for @delete.
  ///
  /// In es, this message translates to:
  /// **'Eliminar'**
  String get delete;

  /// No description provided for @confirm.
  ///
  /// In es, this message translates to:
  /// **'Confirmar'**
  String get confirm;

  /// No description provided for @loading.
  ///
  /// In es, this message translates to:
  /// **'Cargando...'**
  String get loading;

  /// No description provided for @emptyState.
  ///
  /// In es, this message translates to:
  /// **'No hay contenido disponible'**
  String get emptyState;

  /// No description provided for @emptyStateSubtitle.
  ///
  /// In es, this message translates to:
  /// **'Desliza hacia abajo para recargar'**
  String get emptyStateSubtitle;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'es'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'es':
      return AppLocalizationsEs();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
