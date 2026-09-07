/**
 * Real official-language data (ISO 639-1 codes) for every country in
 * ALL_196_COUNTRIES_DATA -- used to pick a sensible default UI language
 * when a country/jurisdiction is selected. See getDefaultLanguageCode()
 * in this same file for how this maps onto the app's actually-supported
 * LANGUAGES_DATA (UserSettingsModal.tsx), which only covers a handful
 * of languages today -- most countries below list a real official
 * language the UI doesn't have translations for yet; the resolver
 * falls back sensibly rather than pretending otherwise.
 */

export const COUNTRY_OFFICIAL_LANGUAGES: Record<string, string[]> = {
  // Africa
  DZ: ['ar', 'fr'], AO: ['pt'], BJ: ['fr'], BW: ['en', 'tn'], BF: ['fr'],
  BI: ['rn', 'fr', 'en'], CV: ['pt'], CM: ['fr', 'en'], CF: ['fr', 'sg'], TD: ['fr', 'ar'],
  KM: ['ar', 'fr'], CG: ['fr'], CD: ['fr'], CI: ['fr'], DJ: ['fr', 'ar'],
  EG: ['ar'], GQ: ['es', 'fr', 'pt'], ER: ['ti', 'ar', 'en'], SZ: ['en', 'ss'], ET: ['am'],
  GA: ['fr'], GM: ['en'], GH: ['en'], GN: ['fr'], GW: ['pt'],
  KE: ['en', 'sw'], LS: ['en', 'st'], LR: ['en'], LY: ['ar'], MG: ['mg', 'fr'],
  MW: ['en', 'ny'], ML: ['fr'], MR: ['ar'], MU: ['en', 'fr'], MA: ['ar', 'fr'],
  MZ: ['pt'], NA: ['en'], NE: ['fr'], NG: ['en'], RW: ['rw', 'en', 'fr'],
  ST: ['pt'], SN: ['fr'], SC: ['en', 'fr'], SL: ['en'], SO: ['so', 'ar'],
  ZA: ['en', 'af', 'zu', 'xh', 'st'], SS: ['en'], SD: ['ar', 'en'], TZ: ['sw', 'en'], TG: ['fr'],
  TN: ['ar'], UG: ['en', 'sw'], ZM: ['en'], ZW: ['en', 'sn', 'nd'],

  // Americas
  AG: ['en'], AR: ['es'], BS: ['en'], BB: ['en'], BZ: ['en'],
  BO: ['es'], BR: ['pt'], CA: ['en', 'fr'], CL: ['es'], CO: ['es'],
  CR: ['es'], CU: ['es'], DM: ['en'], DO: ['es'], EC: ['es'],
  SV: ['es'], GD: ['en'], GT: ['es'], GY: ['en'], HT: ['fr', 'ht'],
  HN: ['es'], JM: ['en'], MX: ['es'], NI: ['es'], PA: ['es'],
  PY: ['es', 'gn'], PE: ['es'], KN: ['en'], LC: ['en'], VC: ['en'],
  SR: ['nl'], TT: ['en'], US: ['en'], UY: ['es'], VE: ['es'],

  // Asia
  AF: ['fa', 'ps'], AM: ['hy'], AZ: ['az'], BH: ['ar'], BD: ['bn'],
  BT: ['dz'], BN: ['ms'], KH: ['km'], CN: ['zh'], CY: ['el', 'tr'],
  GE: ['ka'], IN: ['hi', 'en'], ID: ['id'], IR: ['fa'], IQ: ['ar', 'ku'],
  IL: ['he', 'ar'], JP: ['ja'], JO: ['ar'], KZ: ['kk', 'ru'], KW: ['ar'],
  KG: ['ky', 'ru'], LA: ['lo'], LB: ['ar'], MY: ['ms'], MV: ['dv'],
  MN: ['mn'], MM: ['my'], NP: ['ne'], KP: ['ko'], OM: ['ar'],
  PK: ['ur', 'en'], PS: ['ar'], PH: ['en', 'tl'], QA: ['ar'], SA: ['ar'],
  SG: ['en', 'ms', 'zh', 'ta'], KR: ['ko'], LK: ['si', 'ta'], SY: ['ar'], TW: ['zh'],
  TJ: ['tg'], TH: ['th'], TL: ['pt', 'tet'], TR: ['tr'], TM: ['tk'],
  AE: ['ar'], UZ: ['uz'], VN: ['vi'], YE: ['ar'],

  // Europe
  AL: ['sq'], AD: ['ca'], AT: ['de'], BY: ['be', 'ru'], BE: ['nl', 'fr', 'de'],
  BA: ['bs', 'hr', 'sr'], BG: ['bg'], HR: ['hr'], CZ: ['cs'], DK: ['da'],
  EE: ['et'], FI: ['fi', 'sv'], FR: ['fr'], DE: ['de'], GR: ['el'],
  HU: ['hu'], IS: ['is'], IE: ['en', 'ga'], IT: ['it'], XK: ['sq', 'sr'],
  LV: ['lv'], LI: ['de'], LT: ['lt'], LU: ['lb', 'fr', 'de'], MT: ['mt', 'en'],
  MD: ['ro'], MC: ['fr'], ME: ['sr'], NL: ['nl'], MK: ['mk'],
  NO: ['no'], PL: ['pl'], PT: ['pt'], RO: ['ro'], RU: ['ru'],
  SM: ['it'], RS: ['sr'], SK: ['sk'], SI: ['sl'], ES: ['es'],
  SE: ['sv'], CH: ['de', 'fr', 'it'], UA: ['uk'], GB: ['en'], VA: ['it', 'la'],

  // Oceania
  AU: ['en'], FJ: ['en', 'fj'], KI: ['en'], MH: ['en'], FM: ['en'],
  NR: ['en', 'na'], NZ: ['en', 'mi'], PW: ['en'], PG: ['en', 'tpi'], WS: ['sm', 'en'],
  SB: ['en'], TO: ['to', 'en'], TV: ['en'], VU: ['en', 'fr', 'bi'],
};

/**
 * Resolves which of the app's actually-supported UI languages
 * (LANGUAGES_DATA in UserSettingsModal.tsx) should become the default
 * when `countryId` is selected -- or null if the country's real
 * official language(s) don't match anything we have a UI language
 * for yet, in which case the caller should leave the current
 * selection alone rather than force a change to something arbitrary.
 *
 * Rule (per the country/language requirement -- see chat): if English
 * is one of the country's official languages, English wins as the
 * default, using the country's own English variant when we have one
 * (en-ZA/en-GB/en-US/en-AU) and a generic English fallback otherwise.
 * If English isn't official there, the first of the country's other
 * official languages that matches a supported UI language wins.
 */
export function getDefaultLanguageCodeForCountry(countryId: string): string | null {
  const officialLanguages = COUNTRY_OFFICIAL_LANGUAGES[countryId];
  if (!officialLanguages || officialLanguages.length === 0) return null;

  const ENGLISH_VARIANT_BY_COUNTRY: Record<string, string> = {
    ZA: 'en-ZA',
    GB: 'en-GB',
    US: 'en-US',
    AU: 'en-AU',
  };
  const SUPPORTED_BASE_LANGUAGE_TO_CODE: Record<string, string> = {
    en: 'en-ZA', // generic English fallback when the country has no own en-XX variant above
    af: 'af-ZA',
    xh: 'xh-ZA',
    zu: 'zu-ZA',
    st: 'st-ZA',
    ar: 'ar-AE',
    de: 'de-DE',
    fr: 'fr-FR',
  };

  if (officialLanguages.includes('en')) {
    return ENGLISH_VARIANT_BY_COUNTRY[countryId] || SUPPORTED_BASE_LANGUAGE_TO_CODE.en;
  }

  for (const lang of officialLanguages) {
    if (SUPPORTED_BASE_LANGUAGE_TO_CODE[lang]) {
      return SUPPORTED_BASE_LANGUAGE_TO_CODE[lang];
    }
  }

  return null;
}
