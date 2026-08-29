import { CountryOption, ProvinceStateOption, CityTownOption } from './jurisdictionsData';

// Compact tuple: [id, name, flag, currCode, currSym, currName, dialCode, capital, regBody, landRegistry, titleFormat, suburbs]
export type CompactCountryEntry = [
  string, // 0: ID (ISO 2-letter)
  string, // 1: Country Name
  string, // 2: Flag Emoji
  string, // 3: Currency Code
  string, // 4: Currency Symbol
  string, // 5: Currency Name
  string, // 6: Phone Dial Code
  string, // 7: Capital / Major City
  string, // 8: Regulatory Authority
  string, // 9: Land Registry Authority
  string, // 10: Legal Title Identifier
  string[] // 11: Sample Suburbs / Districts
];

export const ALL_196_COUNTRIES_DATA: CompactCountryEntry[] = [
  // Africa
  ['DZ', 'Algeria', '🇩🇿', 'DZD', 'د.ج', 'Algerian Dinar', '+213', 'Algiers', 'FNAI Algérie', 'Agence Nationale du Cadastre', 'Livret Foncier', ['Hydra', 'El Biar', 'Sidi Yahia']],
  ['AO', 'Angola', '🇦🇴', 'AOA', 'Kz', 'Angolan Kwanza', '+244', 'Luanda', 'APIMA', 'Conservatória do Registo Predial', 'Certidão de Registo Predial', ['Miramar', 'Talatona', 'Alvalade']],
  ['BJ', 'Benin', '🇧🇯', 'XOF', 'CFA', 'West African CFA Franc', '+229', 'Cotonou', 'Chambre Immobilière du Bénin', 'ANDF (Agence du Domaine et Foncier)', 'Titre Foncier (TF)', ['Haie Vive', 'Ganhi', 'Cadjehoun']],
  ['BW', 'Botswana', '🇧🇼', 'BWP', 'P', 'Botswana Pula', '+267', 'Gaborone', 'Real Estate Advisory Council (REAC)', 'Department of Deeds Registry', 'Deed of Fixed State Grant', ['Phakalane', 'Gaborone Golf Estate', 'Block 6']],
  ['BF', 'Burkina Faso', '🇧🇫', 'XOF', 'CFA', 'West African CFA Franc', '+226', 'Ouagadougou', 'APIB', 'Direction Générale des Impôts - Domaines', 'Titre Foncier', ['Ouaga 2000', 'Koulouba', 'Zone du Bois']],
  ['BI', 'Burundi', '🇧🇮', 'BIF', 'FBu', 'Burundian Franc', '+257', 'Bujumbura', 'Chambre Immobilière', 'Direction des Titres Fonciers', 'Titre Foncier', ['Kiriri', 'Rohero', 'Kabondo']],
  ['CV', 'Cabo Verde', '🇨🇻', 'CVE', 'Esc', 'Cape Verdean Escudo', '+238', 'Praia', 'Associação Imobiliária CV', 'Conservatória dos Registos Prediais', 'Certidão Matricial', ['Palmarejo', 'Prainha', 'Santa Maria']],
  ['CM', 'Cameroon', '🇨🇲', 'XAF', 'FCFA', 'Central African CFA Franc', '+237', 'Yaoundé', 'ONPIC', 'Conservation Foncière (MINDCAF)', 'Titre Foncier', ['Douala Bonanjo', 'Bastos', 'Golf']],
  ['CF', 'Central African Republic', '🇨🇫', 'XAF', 'FCFA', 'Central African CFA Franc', '+236', 'Bangui', 'Chambre Immobilière', 'Direction des Domaines', 'Titre Foncier', ['SICA 1', 'Lakouanga', 'Bimbo']],
  ['TD', 'Chad', '🇹🇩', 'XAF', 'FCFA', 'Central African CFA Franc', '+235', "N'Djamena", 'Ordre des Agents Immobiliers', 'Direction des Affaires Foncières', 'Titre Foncier Définitif', ['Sabangali', 'Farcha', 'Kabalaye']],
  ['KM', 'Comoros', '🇰🇲', 'KMF', 'CF', 'Comorian Franc', '+269', 'Moroni', 'Chambre Immobilière', 'Direction des Affaires Foncières', 'Titre Foncier', ['Itsandra', 'Coulée', 'Badjanani']],
  ['CG', 'Congo (Republic)', '🇨🇬', 'XAF', 'FCFA', 'Central African CFA Franc', '+242', 'Brazzaville', 'Syndicat Immobilier du Congo', 'Conservation Foncière', 'Titre Foncier', ['Bacongo', 'Poto-Poto', 'Moungali']],
  ['CD', 'Congo (DRC)', '🇨🇩', 'CDF', 'FC', 'Congolese Franc', '+243', 'Kinshasa', 'CNAI-RDC', 'Conservation des Titres Immobiliers', 'Certificat d’Enregistrement', ['Gombe', 'Ngaliema', 'Kintambo']],
  ['CI', "Côte d'Ivoire", '🇨🇮', 'XOF', 'CFA', 'West African CFA Franc', '+225', 'Abidjan', 'CDAIM', 'Conservation Foncière', 'Arrêté de Concession Définitive (ACD)', ['Cocody Ambassades', 'Plateau', 'Deux Plateaux']],
  ['DJ', 'Djibouti', '🇩🇯', 'DJF', 'Fdj', 'Djiboutian Franc', '+253', 'Djibouti', 'Chambre Immobilière', 'Direction de la Conservation Foncière', 'Titre Foncier', ['Héron', 'Marabout', 'Gabode']],
  ['EG', 'Egypt', '🇪🇬', 'EGP', 'E£', 'Egyptian Pound', '+20', 'Cairo', 'Real Estate Development Chamber', 'Real Estate Publicity Dept (Shahr El-Aqqari)', 'Registered Title Deed (Hoga)', ['Zamalek', 'New Cairo (Tagamoa)', 'Maadi', 'Sheikh Zayed']],
  ['GQ', 'Equatorial Guinea', '🇬🇶', 'XAF', 'FCFA', 'Central African CFA Franc', '+240', 'Malabo', 'Dirección de la Propiedad Inmueble', 'Registro de la Propiedad', 'Título de Propiedad', ['Caracolas', 'Ela Nguema', 'Sampaka']],
  ['ER', 'Eritrea', '🇪🇷', 'ERN', 'Nfk', 'Eritrean Nakfa', '+291', 'Asmara', 'Cadastral Office of Eritrea', 'Department of Land and Cadastre', 'Title Registration Certificate', ['Tiravolo', 'Gejeret', 'Maekel']],
  ['SZ', 'Eswatini', '🇸🇿', 'SZL', 'E', 'Swazi Lilangeni', '+268', 'Mbabane', 'Eswatini Estate Agents Board', 'Deeds Registry Department', 'Title Deed (Crown Grant / Freehold)', ['Ezulwini Valley', 'Mbabane Hills', 'Manzini']],
  ['ET', 'Ethiopia', '🇪🇹', 'ETB', 'Br', 'Ethiopian Birr', '+251', 'Addis Ababa', 'Real Estate Developers Association', 'Urban Land Holding Rights Agency', 'Title Deed (Yebet Carta)', ['Bole', 'Kazanchis', 'Sarbet', 'Old Airport']],
  ['GA', 'Gabon', '🇬🇦', 'XAF', 'FCFA', 'Central African CFA Franc', '+241', 'Libreville', 'ANUTTC', 'Conservation Foncière du Gabon', 'Titre Foncier', ['Batterie IV', 'Sablière', 'Louis']],
  ['GM', 'Gambia', '🇬🇲', 'GMD', 'D', 'Gambian Dalasi', '+220', 'Banjul', 'Association of Real Estate Agents (AREA)', 'Department of Lands and Surveys', 'Title Deed / Leasehold Grant', ['Kololi', 'Fajara', 'Senegambia', 'Brusubi']],
  ['GH', 'Ghana', '🇬🇭', 'GHS', 'GH₵', 'Ghanaian Cedi', '+233', 'Accra', 'Ghana Real Estate Developers Association (GREDA)', 'Lands Commission (Land Registration Division)', 'Land Title Certificate / Indenture', ['Airport Residential', 'Cantonments', 'East Legon', 'Labone']],
  ['GN', 'Guinea', '🇬🇳', 'GNF', 'FG', 'Guinean Franc', '+224', 'Conakry', 'Chambre de l’Immobilier de Guinée', 'Direction Nationale des Domaines et du Cadastre', 'Titre Foncier', ['Kaloum', 'Dixinn', 'Kipé']],
  ['GW', 'Guinea-Bissau', '🇬🇼', 'XOF', 'CFA', 'West African CFA Franc', '+245', 'Bissau', 'Direcção-Geral de Geografia e Cadastro', 'Conservatória do Registo Predial', 'Título de Propriedade', ['Bissau Velho', 'Santa Luzia', 'Bôr']],
  ['KE', 'Kenya', '🇰🇪', 'KES', 'KSh', 'Kenyan Shilling', '+254', 'Nairobi', 'Estate Agents Registration Board (EARB)', 'Ministry of Lands (Ardhi House / ArdhiSasa)', 'Title Deed / Land Reference (LR Number)', ['Karen', 'Runda', 'Kilimani', 'Westlands', 'Kitisuru']],
  ['LS', 'Lesotho', '🇱🇸', 'LSL', 'L', 'Lesotho Loti', '+266', 'Maseru', 'Land Administration Authority (LAA)', 'Deeds Registry of Lesotho', 'Lease Certificate (LAA Title)', ['Hillsview', 'Maseru West', 'Europa']],
  ['LR', 'Liberia', '🇱🇷', 'LRD', '$', 'Liberian Dollar', '+231', 'Monrovia', 'Liberia Land Authority (LLA)', 'Center for National Documents and Records Agency', 'Public Land Sale Deed', ['Mamba Point', 'Sinkor', 'Congo Town']],
  ['LY', 'Libya', '🇱🇾', 'LYD', 'LD', 'Libyan Dinar', '+218', 'Tripoli', 'Real Estate Registration Authority', 'Libyan Land Registry and Cadastre', 'Title Deed (Sanad Mulkiya)', ['Hay Al-Andalus', 'Gargaresha', 'Ben Ashour']],
  ['MG', 'Madagascar', '🇲🇬', 'MGA', 'Ar', 'Malagasy Ariary', '+261', 'Antananarivo', 'Chambre Immobilière de Madagascar', 'Service des Domaines et de la Propriété Foncière', 'Titre Foncier', ['Ivandry', 'Ambatobe', 'Ankorondrano']],
  ['MW', 'Malawi', '🇲🇼', 'MWK', 'MK', 'Malawian Kwacha', '+265', 'Lilongwe', 'Board of Valuers and Estate Agents', 'Department of Lands (Deeds Registry)', 'Title Deed / Certificate of Title', ['Area 10', 'Area 43', 'Area 9', 'Blantyre Sunnyside']],
  ['ML', 'Mali', '🇲🇱', 'XOF', 'CFA', 'West African CFA Franc', '+223', 'Bamako', 'Chambre des Agents Immobiliers du Mali', 'Direction Nationale des Domaines et du Cadastre', 'Titre Foncier', ['ACI 2000', 'Badalabougou', 'Quinzambougou']],
  ['MR', 'Mauritania', '🇲🇷', 'MRU', 'UM', 'Mauritanian Ouguiya', '+222', 'Nouakchott', 'Direction Générale des Domaines et du Patrimoine', 'Conservation Foncière de Nouakchott', 'Titre Foncier', ['Tevragh-Zeina', 'Ksar', 'Teyarett']],
  ['MU', 'Mauritius', '🇲🇺', 'MUR', '₨', 'Mauritian Rupee', '+230', 'Port Louis', 'Real Estate Association of Mauritius (REAM)', 'Registrar-General’s Department (MMLS / MeRP)', 'Title Deed / Transcribed Deed (TV Number)', ['Grand Baie', 'Tamarin', 'Flic en Flac', 'Ebène']],
  ['MA', 'Morocco', '🇲🇦', 'MAD', 'DH', 'Moroccan Dirham', '+212', 'Rabat', 'Fédération Nationale de l’Immobilier (FNAIM Maroc)', 'ANCFCC (Cadastre & Conservation Foncière)', 'Titre Foncier (Numéro de Titre)', ['Casablanca Anfa', 'Marrakech Hivernage', 'Rabat Souissi']],
  ['MZ', 'Mozambique', '🇲🇿', 'MZN', 'MT', 'Mozambican Metical', '+258', 'Maputo', 'Associação dos Profissionais Imobiliários', 'Conservatória do Registo Predial (DUAT)', 'Certidão de Registo Predial / DUAT', ['Polana', 'Sommerschield', 'Costa do Sol']],
  ['NA', 'Namibia', '🇳🇦', 'NAD', 'N$', 'Namibian Dollar', '+264', 'Windhoek', 'Namibian Estate Agents Board (NEAB)', 'Deeds Registries Office (Windhoek & Rehoboth)', 'Title Deed Number / Erf Number', ['Ludwigsdorf', 'Klein Windhoek', 'Eros', 'Swakopmund']],
  ['NE', 'Niger', '🇳🇪', 'XOF', 'CFA', 'West African CFA Franc', '+227', 'Niamey', 'Ordre des Professionnels de l’Immobilier', 'Direction Générale des Domaines', 'Titre Foncier', ['Plateau', 'Yantala', 'Koubia']],
  ['NG', 'Nigeria', '🇳🇬', 'NGN', '₦', 'Nigerian Naira', '+234', 'Abuja', 'Estate Surveyors and Valuers Registration Board (ESVARBON)', 'Lands Registry (Lagos State Lands / AGIS Abuja)', 'Certificate of Occupancy (C of O) & Governor’s Consent', ['Ikoyi', 'Victoria Island', 'Banana Island', 'Maitama Abuja']],
  ['RW', 'Rwanda', '🇷🇼', 'RWF', 'FRw', 'Rwandan Franc', '+250', 'Kigali', 'Rwanda Institute of Real Estate Professionals', 'National Land Authority (NLA Registry)', 'Unique Parcel Identifier (UPI) Title', ['Nyarutarama', 'Kacyiru', 'Gacuriro', 'Kimihurura']],
  ['ST', 'São Tomé and Príncipe', '🇸🇹', 'STN', 'Db', 'São Tomé and Príncipe Dobra', '+239', 'São Tomé', 'Conservatória do Registo Predial', 'Direcção do Património e Cadastro', 'Certidão de Registo', ['Campo de Milho', 'Quilombo', 'Madalena']],
  ['SN', 'Senegal', '🇸🇳', 'XOF', 'CFA', 'West African CFA Franc', '+221', 'Dakar', 'Syndicat National des Agents Immobiliers', 'Direction de l’Enregistrement et des Domaines', 'Titre Foncier / Bail Emphytéotique', ['Almadies', 'Fann Résidence', 'Ngor', 'Plateau']],
  ['SC', 'Seychelles', '🇸🇨', 'SCR', 'SR', 'Seychellois Rupee', '+248', 'Victoria', 'Seychelles Licensing Authority (SLA)', 'Registrar General’s Land Registry Office', 'Title Registration Parcel & Number', ['Eden Island', 'Beau Vallon', 'Glacis', 'Anse Royale']],
  ['SL', 'Sierra Leone', '🇸🇱', 'SLE', 'Le', 'Sierra Leonean Leone', '+232', 'Freetown', 'Real Estate Developers Association SL', 'Office of the Administrator & Registrar General', 'Conveyance Deed & Cadastral Survey', ['Hill Station', 'Wilberforce', 'Lumley', 'Aberdeen']],
  ['SO', 'Somalia', '🇸🇴', 'SOS', 'S', 'Somali Shilling', '+252', 'Mogadishu', 'Directorate of Land and Property', 'Banadir Regional Cadastre', 'Title Deed (Kutub Guri)', ['Waberi', 'Hodan', 'Abdiaziz', 'Medina']],
  ['ZA', 'South Africa', '🇿🇦', 'ZAR', 'R', 'South African Rand', '+27', 'Cape Town', 'Property Practitioners Regulatory Authority (PPRA)', 'Chief Deeds Registry of South Africa', 'Erf / LPI Code / Title Deed (T-Number)', ['Three Anchor Bay', 'Camps Bay', 'Sandton', 'Umhlanga Rocks']],
  ['SS', 'South Sudan', '🇸🇸', 'SSP', 'SS£', 'South Sudanese Pound', '+211', 'Juba', 'Ministry of Housing and Lands', 'Juba Land Registry Directorate', 'Land Title Certificate', ['Hai Cinema', 'Tongping', 'Munuki']],
  ['SD', 'Sudan', '🇸🇩', 'SDG', 'SDG', 'Sudanese Pound', '+249', 'Khartoum', 'Sudanese Real Estate Federation', 'Land Registration Department', 'Title Deed (Sanad Tasjeel)', ['Riyadh', 'Manshiya', 'Kafouri']],
  ['TZ', 'Tanzania', '🇹🇿', 'TZS', 'TSh', 'Tanzanian Shilling', '+255', 'Dar es Salaam', 'National Council of Real Estate Valuers', 'Ministry of Lands (Ardhi Registry)', 'Certificate of Title / Right of Occupancy', ['Masaki', 'Oysterbay', 'Mikocheni', 'Zanzibar Stone Town']],
  ['TG', 'Togo', '🇹🇬', 'XOF', 'CFA', 'West African CFA Franc', '+228', 'Lomé', 'Chambre Nationale des Agents Immobiliers', 'Direction des Domaines et du Cadastre', 'Titre Foncier', ['Cité OUA', 'Baguida', 'Tokoin']],
  ['TN', 'Tunisia', '🇹🇳', 'TND', 'DT', 'Tunisian Dinar', '+216', 'Tunis', 'Chambre Syndicale Nationale des Agents Immobiliers', 'Office de la Topographie et du Cadastre (OTC)', 'Titre Foncier (Rasm Aqari)', ['La Marsa', 'Carthage', 'Gammarth', 'Les Berges du Lac']],
  ['UG', 'Uganda', '🇺🇬', 'UGX', 'USh', 'Ugandan Shilling', '+256', 'Kampala', 'Association of Real Estate Agents Uganda (AREA)', 'Ministry of Lands (National Land Information System)', 'Mailo / Freehold / Leasehold Title Deed', ['Kololo', 'Nakasero', 'Naguru', 'Muyenga']],
  ['ZM', 'Zambia', '🇿🇲', 'ZMW', 'ZK', 'Zambian Kwacha', '+260', 'Lusaka', 'Zambia Institute of Estate Agents (ZIEA)', 'Ministry of Lands (Lands and Deeds Registry)', 'Certificate of Title (Subdivided Plot ID)', ['Kabulonga', 'Woodlands', 'Sunningdale', 'Rhodes Park']],
  ['ZW', 'Zimbabwe', '🇿🇼', 'ZWG', 'ZiG', 'Zimbabwe Gold', '+263', 'Harare', 'Estate Agents Council of Zimbabwe (EACZ)', 'Deeds Registry of Zimbabwe (Harare & Bulawayo)', 'Deed of Transfer / Title Deed Number', ['Borrowdale Brooke', 'Highlands', 'Avondale', 'Glen Lorne']],

  // Americas
  ['AG', 'Antigua and Barbuda', '🇦🇬', 'XCD', '$', 'East Caribbean Dollar', '+1-268', "St. John's", 'Antigua Real Estate Association', 'Land Registry Division (High Court)', 'Land Certificate (Section & Block)', ['Jolly Harbour', 'Hodges Bay', 'English Harbour']],
  ['AR', 'Argentina', '🇦🇷', 'ARS', '$', 'Argentine Peso', '+54', 'Buenos Aires', 'CUCICBA', 'Registro de la Propiedad Inmueble (RPI)', 'Matrícula Folio Real', ['Palermo Soho', 'Recoleta', 'Puerto Madero', 'Belgrano']],
  ['BS', 'Bahamas', '🇧🇸', 'BSD', 'B$', 'Bahamian Dollar', '+1-242', 'Nassau', 'Bahamas Real Estate Association (BREA)', 'Registrar General’s Department', 'Conveyance Deed & Crown Grant', ['Paradise Island', 'Lyford Cay', 'Old Fort Bay', 'Cable Beach']],
  ['BB', 'Barbados', '🇧🇧', 'BBD', 'Bds$', 'Barbadian Dollar', '+1-246', 'Bridgetown', 'BEAVA', 'Land Registry Department', 'Land Title Certificate', ['Sandy Lane', 'Royal Westmoreland', 'Hastings']],
  ['BZ', 'Belize', '🇧🇿', 'BZD', 'BZ$', 'Belize Dollar', '+501', 'Belmopan', 'AREBB', 'Land Titles Registry', 'Land Certificate / TCT', ['Ambergris Caye', 'Placencia', 'Caye Caulker']],
  ['BO', 'Bolivia', '🇧🇴', 'BOB', 'Bs.', 'Bolivian Boliviano', '+591', 'La Paz', 'CABINCRUZ', 'Dirección General de Derechos Reales', 'Folio Real / Matrícula Computarizada', ['Equipetrol', 'Calacoto', 'San Miguel']],
  ['BR', 'Brazil', '🇧🇷', 'BRL', 'R$', 'Brazilian Real', '+55', 'São Paulo', 'COFECI / CRECI', 'Cartório de Registro de Imóveis (RGI)', 'Matrícula do Imóvel', ['Jardins', 'Ipanema', 'Leblon', 'Lago Sul']],
  ['CA', 'Canada', '🇨🇦', 'CAD', 'C$', 'Canadian Dollar', '+1', 'Toronto', 'CREA & Provincial Boards (RECO/BCFSA)', 'Land Title and Survey Authority / Teranet', 'PIN / Property Identifier (PID)', ['Rosedale', 'Yorkville', 'Vancouver West Side', 'Westmount']],
  ['CL', 'Chile', '🇨🇱', 'CLP', '$', 'Chilean Peso', '+56', 'Santiago', 'ACOP', 'Conservador de Bienes Raíces (CBR)', 'Fojas, Número y Año (Rol de Avalúo)', ['Las Condes', 'Vitacura', 'Lo Barnechea', 'Zapallar']],
  ['CO', 'Colombia', '🇨🇴', 'COP', '$', 'Colombian Peso', '+57', 'Bogotá', 'FEDELONJAS', 'Superintendencia de Notariado y Registro', 'Matrícula Inmobiliaria & Cédula Catastral', ['Chapinero Alto', 'Rosales', 'El Poblado', 'Bocagrande']],
  ['CR', 'Costa Rica', '🇨🇷', 'CRC', '₡', 'Costa Rican Colón', '+506', 'San José', 'CCBR', 'Registro Nacional de Costa Rica', 'Folio Real / Plano Catastrado', ['Escazú', 'Santa Ana', 'Papagayo Peninsula']],
  ['CU', 'Cuba', '🇨🇺', 'CUP', '$', 'Cuban Peso', '+53', 'Havana', 'Ministerio de Justicia', 'Registro de la Propiedad', 'Título de Propiedad Inmobiliaria', ['Miramar', 'Vedado', 'Siboney']],
  ['DM', 'Dominica', '🇩🇲', 'XCD', '$', 'East Caribbean Dollar', '+1-767', 'Roseau', 'Dominica Realtors Association', 'Land Registry of Dominica', 'Certificate of Title', ['Wall House', 'Castle Comfort', 'Cabrits']],
  ['DO', 'Dominican Republic', '🇩🇴', 'DOP', 'RD$', 'Dominican Peso', '+1-809', 'Santo Domingo', 'AEI', 'Registro de Títulos Inmobiliarios', 'Certificado de Título / Matrícula', ['Piantini', 'Punta Cana', 'Cap Cana', 'Casa de Campo']],
  ['EC', 'Ecuador', '🇪🇨', 'USD', '$', 'US Dollar', '+593', 'Quito', 'CBR', 'Registro de la Propiedad Municipal', 'Certificado de Gravamen y Matrícula', ['Cumbayá', 'Samborondón', 'González Suárez']],
  ['SV', 'El Salvador', '🇸🇻', 'USD', '$', 'US Dollar', '+503', 'San Salvador', 'Cámara Salvadoreña de Bienes Raíces', 'Centro Nacional de Registros (CNR)', 'Matrícula de Folio Real', ['San Benito', 'Santa Elena', 'Escalón']],
  ['GD', 'Grenada', '🇬🇩', 'XCD', '$', 'East Caribbean Dollar', '+1-473', "St. George's", 'Grenada Real Estate Association', 'Deeds and Land Registry', 'Deed of Conveyance & Plan', ['Grand Anse', 'Lance aux Epines', 'Prickly Bay']],
  ['GT', 'Guatemala', '🇬🇹', 'GTQ', 'Q', 'Guatemalan Quetzal', '+502', 'Guatemala City', 'CBR Guatemala', 'Registro General de la Propiedad', 'Finca, Folio y Libro', ['Zona 14', 'Zona 10', 'Cayalá', 'Antigua Guatemala']],
  ['GY', 'Guyana', '🇬🇾', 'GYD', 'G$', 'Guyanese Dollar', '+592', 'Georgetown', 'Guyana Real Estate Association', 'Deeds and Commercial Registries Authority', 'Transport / Certificate of Title', ['Prashad Nagar', 'Bel Air Springs', 'Queenstown']],
  ['HT', 'Haiti', '🇭🇹', 'HTG', 'G', 'Haitian Gourde', '+509', 'Port-au-Prince', 'Ordre des Notaires et Agents', 'Direction Générale des Impôts (DGI)', 'Acte Notarié de Vente', ['Pétion-Ville', 'Montagne Noire', 'Morne Calvaire']],
  ['HN', 'Honduras', '🇭🇳', 'HNL', 'L', 'Honduran Lempira', '+504', 'Tegucigalpa', 'CANABIRH', 'Instituto de la Propiedad (IP)', 'Matrícula Inmobiliaria', ['Lomas del Guijarro', 'San Ignacio', 'Roatán']],
  ['JM', 'Jamaica', '🇯🇲', 'JMD', 'J$', 'Jamaican Dollar', '+1-876', 'Kingston', 'Real Estate Board of Jamaica (REB)', 'National Land Agency (Titles Division)', 'Certificate of Title (Volume & Folio)', ['Norbrook', 'Cherry Gardens', 'Montego Bay Spring Farm']],
  ['MX', 'Mexico', '🇲🇽', 'MXN', '$', 'Mexican Peso', '+52', 'Mexico City', 'AMPI', 'Registro Público de la Propiedad (RPP)', 'Folio Real / Escritura Pública Notarial', ['Polanco', 'Lomas de Chapultepec', 'San Pedro Garza García', 'Cancún Hotel Zone']],
  ['NI', 'Nicaragua', '🇳🇮', 'NIO', 'C$', 'Nicaraguan Córdoba', '+505', 'Managua', 'CBRN', 'Registro Público de la Propiedad', 'Folio Real & Asiento Registral', ['Santo Domingo', 'Villa Fontana', 'San Juan del Sur']],
  ['PA', 'Panama', '🇵🇦', 'USD', '$', 'US Dollar / Balboa', '+507', 'Panama City', 'ACOBIR', 'Registro Público de Panamá', 'Finca, Tomo y Folio Registral', ['Punta Pacífica', 'Costa del Este', 'Casco Antiguo', 'Santa María']],
  ['PY', 'Paraguay', '🇵🇾', 'PYG', '₲', 'Paraguayan Guaraní', '+595', 'Asunción', 'CAPEI', 'Dirección General de los Registros Públicos', 'Finca / Matrícula y Padrón', ['Villa Morra', 'Ykuá Satí', 'Manora', 'Mburucuyá']],
  ['PE', 'Peru', '🇵🇪', 'PEN', 'S/', 'Peruvian Sol', '+51', 'Lima', 'ASPAI', 'Superintendencia Nacional de los Registros Públicos (SUNARP)', 'Partida Electrónica de Predios', ['Miraflores', 'San Isidro', 'Barranco', 'La Molina']],
  ['KN', 'Saint Kitts and Nevis', '🇰🇳', 'XCD', '$', 'East Caribbean Dollar', '+1-869', 'Basseterre', 'St. Kitts Realtors Association', 'Land Registry Department', 'Certificate of Title', ['Frigate Bay', 'Christophe Harbour', 'Four Seasons Nevis']],
  ['LC', 'Saint Lucia', '🇱🇨', 'XCD', '$', 'East Caribbean Dollar', '+1-758', 'Castries', 'Realtors Association of Saint Lucia', 'Land Registry Department', 'Land Register (Block & Parcel Number)', ['Cap Estate', 'Rodney Bay', 'Marigot Bay']],
  ['VC', 'Saint Vincent and the Grenadines', '🇻🇨', 'XCD', '$', 'East Caribbean Dollar', '+1-784', 'Kingstown', 'SVG Realtors Board', 'Land Registry Office', 'Deed of Conveyance (Schedule & Plan)', ['Bequia', 'Mustique', 'Villa', 'Indian Bay']],
  ['SR', 'Suriname', '🇸🇷', 'SRD', '$', 'Surinamese Dollar', '+597', 'Paramaribo', 'Suriname Real Estate Board', 'Management Information System Land Office (MI-GLIS)', 'GLIS-Nummer (Perceelkaart)', ['Rainville', 'Noord', 'Mon Plaisir']],
  ['TT', 'Trinidad and Tobago', '🇹🇹', 'TTD', 'TT$', 'Trinidad & Tobago Dollar', '+1-868', 'Port of Spain', 'AREA TT', 'Registrar General’s Department (RGD)', 'Certificate of Title / Real Property Ordinance (RPO)', ['Westmoorings', 'Maraval', 'Tobago Bacolet']],
  ['US', 'United States', '🇺🇸', 'USD', '$', 'US Dollar', '+1', 'Washington D.C.', 'National Association of REALTORS® (NAR)', 'County Recorder of Deeds / Municipal GIS', 'Assessor Parcel Number (APN)', ['Miami Beach', 'Beverly Hills', 'Manhattan Upper East Side', 'Austin Zilker']],
  ['UY', 'Uruguay', '🇺🇾', 'UYU', '$U', 'Uruguayan Peso', '+598', 'Montevideo', 'CIU', 'Dirección General de Registros (DGR)', 'Matrícula Inmobiliaria & Padrón', ['Carrasco', 'Pocitos', 'Punta del Este', 'La Barra']],
  ['VE', 'Venezuela', '🇻🇪', 'VES', 'Bs.', 'Venezuelan Bolívar', '+58', 'Caracas', 'Cámara Inmobiliaria de Venezuela (CIV)', 'Servicio Autónomo de Registros y Notarías (SAREN)', 'Asiento Registral Inmobiliario', ['Altamira', 'Las Mercedes', 'Country Club', 'Los Palos Grandes']],

  // Asia
  ['AF', 'Afghanistan', '🇦🇫', 'AFN', '؋', 'Afghan Afghani', '+93', 'Kabul', 'Real Estate Affairs Directorate', 'Ministry of Urban Development and Land', 'Qabala / Land Title Deed', ['Wazir Akbar Khan', 'Shahr-e Naw', 'Karte Seh']],
  ['AM', 'Armenia', '🇦🇲', 'AMD', '֏', 'Armenian Dram', '+374', 'Yerevan', 'Armenian Real Estate Association', 'Cadastre Committee of Armenia', 'Certificate of Ownership / Cadastral Code', ['Kentron', 'Arabkir', 'Davtashen']],
  ['AZ', 'Azerbaijan', '🇦🇿', 'AZN', '₼', 'Azerbaijani Manat', '+994', 'Baku', 'AREA Azerbaijan', 'State Service on Property Issues', 'Çıxarış (Kupça)', ['Sabayil', 'Nasimi', 'Baku White City']],
  ['BH', 'Bahrain', '🇧🇭', 'BHD', '.د.ب', 'Bahraini Dinar', '+973', 'Manama', 'Real Estate Regulatory Authority (RERA BH)', 'Survey and Land Registration Bureau (SLRB)', 'Title Deed Certificate', ['Amwaj Islands', 'Seef District', 'Reef Island']],
  ['BD', 'Bangladesh', '🇧🇩', 'BDT', '৳', 'Bangladeshi Taka', '+880', 'Dhaka', 'REHAB Bangladesh', 'Directorate of Registration', 'Khatian / Porcha & Sale Deed', ['Gulshan', 'Banani', 'Baridhara']],
  ['BT', 'Bhutan', '🇧🇹', 'BTN', 'Nu.', 'Bhutanese Ngultrum', '+975', 'Thimphu', 'National Land Commission (NLCS)', 'NLCS Land Registry Directorate', 'Lag Thram (Land Ownership Certificate)', ['Motithang', 'Changangkha', 'Babesa']],
  ['BN', 'Brunei', '🇧🇳', 'BND', 'B$', 'Brunei Dollar', '+673', 'Bandar Seri Begawan', 'BVEA Brunei', 'Land Department (Ministry of Development)', 'Land Title Grant / EDR Number', ['Kiulap', 'Gadong', 'Kota Batu']],
  ['KH', 'Cambodia', '🇰🇭', 'KHR', '៛', 'Cambodian Riel', '+855', 'Phnom Penh', 'CVEA Cambodia', 'Ministry of Land Management (MLMUPC)', 'Hard Title Certificate', ['BKK1', 'Tonle Bassac', 'Daun Penh']],
  ['CN', 'China', '🇨🇳', 'CNY', '¥', 'Chinese Yuan', '+86', 'Beijing', 'CIREA', 'Real Estate Registration Center (不动产登记中心)', 'Real Estate Ownership Certificate (不动产权证书)', ['Lujiazui Shanghai', 'Chaoyang Beijing', 'Nanshan Shenzhen']],
  ['CY', 'Cyprus', '🇨🇾', 'EUR', '€', 'Euro', '+357', 'Nicosia', 'CREA Cyprus', 'Department of Lands and Surveys', 'Title Deed (Sheet/Plan/Plot Number)', ['Limassol Marina', 'Agios Tychonas', 'Coral Bay Paphos']],
  ['GE', 'Georgia', '🇬🇪', 'GEL', '₾', 'Georgian Lari', '+995', 'Tbilisi', 'National Association of Real Estate Agents (NARE)', 'National Agency of Public Registry (NAPR)', 'Cadastral Code / Extract from Public Registry', ['Vake', 'Vera', 'Mtatsminda', 'Saburtalo']],
  ['IN', 'India', '🇮🇳', 'INR', '₹', 'Indian Rupee', '+91', 'New Delhi', 'Real Estate Regulatory Authority (RERA)', 'Sub-Registrar Office / State Land Records', 'Sale Deed / Registered Conveyance Deed & Khasra No.', ['South Delhi Golf Links', 'Bandra West Mumbai', 'Indiranagar Bengaluru']],
  ['ID', 'Indonesia', '🇮🇩', 'IDR', 'Rp', 'Indonesian Rupiah', '+62', 'Jakarta', 'AREBI', 'Badan Pertanahan Nasional (ATR/BPN)', 'Sertifikat Hak Milik (SHM) / HGB', ['Menteng', 'Kebayoran Baru', 'Seminyak Bali', 'Canggu Bali']],
  ['IR', 'Iran', '🇮🇷', 'IRR', '﷼', 'Iranian Rial', '+98', 'Tehran', 'Real Estate Advisers Syndicate', 'State Organization for Registration of Deeds', 'Sanad Tak-Barg (Single-Sheet Title)', ['Elahiyeh', 'Zaferanieh', 'Niavaran', 'Jordan']],
  ['IQ', 'Iraq', '🇮🇶', 'IQD', 'ع.د', 'Iraqi Dinar', '+964', 'Baghdad', 'Real Estate Registration Directorate', 'Ministry of Justice Land Registry (Tapu)', 'Tapu Sanad (Title Deed)', ['Mansour', 'Jadiriya', 'Karrada', 'Erbil Dream City']],
  ['IL', 'Israel', '🇮🇱', 'ILS', '₪', 'Israeli New Shekel', '+972', 'Jerusalem', 'Israel Real Estate Agents Registrar', 'Israel Land Authority (Tabu / ILA)', 'Tabu Extract (Nesach Tabu / Gush & Chelka)', ['Tel Aviv Rothschild', 'Neve Tzedek', 'Rehavia Jerusalem', 'Herzliya Pituach']],
  ['JP', 'Japan', '🇯🇵', 'JPY', '¥', 'Japanese Yen', '+81', 'Tokyo', 'Real Estate Companies Association of Japan', 'Legal Affairs Bureau (Houmukyoku)', 'Registry Certificate (Touki Jikou Shoumeisho)', ['Minato-ku Roppongi', 'Shibuya-ku Hiroo', 'Chiyoda-ku', 'Ginza']],
  ['JO', 'Jordan', '🇯🇴', 'JOD', 'JD', 'Jordanian Dinar', '+962', 'Amman', 'Jordan Real Estate Association', 'Department of Land and Survey (DLS)', 'Qoshan (Land Deed Certificate)', ['Abdoun', 'Dabouq', 'Sweifieh', 'Jabal Amman']],
  ['KZ', 'Kazakhstan', '🇰🇿', 'KZT', '₸', 'Kazakhstani Tenge', '+7', 'Astana', 'United Association of Realtors of Kazakhstan', 'State Corporation "Government for Citizens" (Cadastre)', 'Cadastral Passport & Registration Certificate', ['Astana Esil District', 'Almaty Medeu', 'Samal']],
  ['KW', 'Kuwait', '🇰🇼', 'KWD', 'KD', 'Kuwaiti Dinar', '+965', 'Kuwait City', 'Kuwait Real Estate Brokers Union', 'Ministry of Justice (Real Estate Registration Dept)', 'Title Deed Document (Wathiqa)', ['Shuwaikh Residential', 'Abdullah Al-Salem', 'Mishref']],
  ['KG', 'Kyrgyzstan', '🇰🇬', 'KGS', 'с', 'Kyrgyzstani Som', '+996', 'Bishkek', 'Association of Real Estate Specialists', 'State Agency for Land Resources (Gosregistr)', 'State Act on Land Ownership', ['Pervomaysky', 'Sverdlovsky', 'Oktyabrsky']],
  ['LA', 'Laos', '🇱🇦', 'LAK', '₭', 'Lao Kip', '+856', 'Vientiane', 'Lao Real Estate Association', 'Department of Lands (Ministry of Natural Resources)', 'Permanent Land Title Certificate', ['Sisattanak', 'Chanthabouly', 'Saysettha']],
  ['LB', 'Lebanon', '🇱🇧', 'LBP', 'L£', 'Lebanese Pound', '+961', 'Beirut', 'Real Estate Syndicate of Lebanon (REAL)', 'General Directorate of Land Registry and Cadastre', 'Title Deed (Ifadeh Ikariat / Green Sheet)', ['Achrafieh', 'Verdun', 'Downtown Beirut', 'Sursock']],
  ['MY', 'Malaysia', '🇲🇾', 'MYR', 'RM', 'Malaysian Ringgit', '+60', 'Kuala Lumpur', 'Board of Valuers, Appraisers and Estate Agents (BOVAEP)', 'Land and Mines Office (Pejabat Tanah dan Galian)', 'Individual / Strata Title & Grant (Geran)', ['Bangsar', 'Mont Kiara', 'Damansara Heights', 'KLCC']],
  ['MV', 'Maldives', '🇲🇻', 'MVR', 'Rf', 'Maldivian Rufiyaa', '+960', 'Malé', 'Ministry of Housing and Infrastructure', 'Land Registration Department', 'Registry of Land Ownership', ['Hulhumalé Phase 1', 'Hulhumalé Phase 2', 'Henveiru']],
  ['MN', 'Mongolia', '🇲🇳', 'MNT', '₮', 'Mongolian Tögrög', '+976', 'Ulaanbaatar', 'Mongolian Real Estate Academy', 'General Authority for State Registration (GASR)', 'State Registration Certificate of Property Rights', ['Zaisan', 'Sukhbaatar District', 'Khan-Uul']],
  ['MM', 'Myanmar', '🇲🇲', 'MMK', 'K', 'Myanmar Kyat', '+95', 'Yangon', 'Myanmar Real Estate Services Association (MRESA)', 'Settlement and Land Record Department (SLRD)', 'Grant Land Certificate / Form 105', ['Golden Valley (Bahan)', 'Dagon', 'Mayangone']],
  ['NP', 'Nepal', '🇳🇵', 'NPR', 'रू', 'Nepalese Rupee', '+977', 'Kathmandu', 'Nepal Real Estate Organization (NREO)', 'Department of Land Management and Archive', 'Lalpurja (Land Ownership Certificate)', ['Baluwatar', 'Jhamsikhel', 'Budhanilkantha']],
  ['KP', 'North Korea', '🇰🇵', 'KPW', '₩', 'North Korean Won', '+850', 'Pyongyang', 'State Housing and Land Administration', 'Municipal People’s Committee Housing Dept', 'Housing Usage Certificate', ['Ryomyong Street', 'Mirae Scientists Street', 'Central District']],
  ['OM', 'Oman', '🇴🇲', 'OMR', 'RO', 'Omani Rial', '+968', 'Muscat', 'Oman Real Estate Association (ORA)', 'Ministry of Housing and Urban Planning', 'Mulkiya (Title Deed Document)', ['Shatti Al Qurum', 'Madinat Al Sultan Qaboos', 'Al Mouj Muscat']],
  ['PK', 'Pakistan', '🇵🇰', 'PKR', '₨', 'Pakistani Rupee', '+92', 'Islamabad', 'Defence Housing Authority (DHA) / ABAD', 'Land Revenue Department / Sub-Registrar', 'Fard-e-Malkiat / Allotment Letter & Registry', ['Islamabad Sector F-6/F-7', 'DHA Lahore Phase 5', 'DHA Karachi Phase 8']],
  ['PS', 'Palestine', '🇵🇸', 'ILS', '₪', 'Israeli New Shekel', '+970', 'Ramallah', 'Palestinian Real Estate Union', 'Palestinian Land Authority (PLA)', 'Tabu Title Certificate', ['Al-Tireh', 'Al-Masyoun', 'Rihan']],
  ['PH', 'Philippines', '🇵🇭', 'PHP', '₱', 'Philippine Peso', '+63', 'Manila', 'Professional Regulation Commission (PRC - RES)', 'Land Registration Authority (LRA) / Registry of Deeds', 'Transfer Certificate of Title (TCT) / CCT', ['Bonifacio Global City (BGC)', 'Makati Forbes Park', 'Ayala Alabang']],
  ['QA', 'Qatar', '🇶🇦', 'QAR', 'QR', 'Qatari Riyal', '+974', 'Doha', 'Ministry of Justice Real Estate Brokerage Dept', 'Real Estate Registration Department', 'Title Deed (Sanad Milkiya)', ['The Pearl-Qatar', 'Lusail City Marina', 'West Bay Lagoon']],
  ['SA', 'Saudi Arabia', '🇸🇦', 'SAR', 'SR', 'Saudi Riyal', '+966', 'Riyadh', 'Real Estate General Authority (REGA)', 'Ministry of Justice (E-Sak Real Estate Registry)', 'Electronic Title Deed (E-Sak / Saq)', ['Al Olaya Riyadh', 'Al Malqa', 'Jeddah Corniche', 'Al Hada']],
  ['SG', 'Singapore', '🇸🇬', 'SGD', 'S$', 'Singapore Dollar', '+65', 'Singapore', 'Council for Estate Agencies (CEA)', 'Singapore Land Authority (SLA)', 'Land Title (Certificate of Title) & Lot ID', ['District 09 Orchard', 'District 10 Tanglin', 'Sentosa Cove']],
  ['KR', 'South Korea', '🇰🇷', 'KRW', '₩', 'South Korean Won', '+82', 'Seoul', 'Korea Association of Realtors (KAR)', 'Supreme Court Registry Office (Deunggi-so)', 'Certificate of Registered Matters (Deunggibu Deungbon)', ['Gangnam-gu Cheongdam', 'Yongsan-gu Hannam-dong', 'Seocho-gu Banpo']],
  ['LK', 'Sri Lanka', '🇱🇰', 'LKR', 'Rs', 'Sri Lankan Rupee', '+94', 'Colombo', 'Institute of Real Estate Professionals Sri Lanka', 'Registrar General’s Department (Land Registry)', 'Deed of Transfer / Title Certificate', ['Colombo 07 (Cinnamon Gardens)', 'Colombo 03 (Colpetty)', 'Mount Lavinia']],
  ['SY', 'Syria', '🇸🇾', 'SYP', '£S', 'Syrian Pound', '+963', 'Damascus', 'General Directorate of Real Estate Registration', 'Syrian Cadastral Directorate (Al-Tabu)', 'Tabu Green Deed (Sanad Akari)', ['Abu Rummaneh', 'Malki', 'Kafarsouseh']],
  ['TW', 'Taiwan', '🇹🇼', 'TWD', 'NT$', 'New Taiwan Dollar', '+886', 'Taipei', 'Real Estate Brokers Association of ROC', 'Land Office (Ministry of the Interior)', 'Ownership Certificate (土地/建物所有權狀)', ['Da’an District', 'Xinyi District', 'Zhongshan District']],
  ['TJ', 'Tajikistan', '🇹🇯', 'TJS', 'SM', 'Tajikistani Somoni', '+992', 'Dushanbe', 'State Committee on Land Management', 'State Enterprise "Registr Inmovable Property"', 'Technical Passport & Property Certificate', ['Ismoili Somoni', 'Shohmansur', 'Firdavsi']],
  ['TH', 'Thailand', '🇹🇭', 'THB', '฿', 'Thai Baht', '+66', 'Bangkok', 'Real Estate Sales and Marketing Association (RESAM)', 'Department of Lands (Krom Tee Din)', 'Chanote (Nor Sor 4 Jor) Title Deed', ['Sukhumvit Thonglor', 'Phrom Phong', 'Sathorn', 'Phuket Cherngtalay']],
  ['TL', 'Timor-Leste', '🇹🇱', 'USD', '$', 'US Dollar', '+670', 'Dili', 'National Directorate of Land and Property', 'Land and Property Registry', 'Certificate of Land Title', ['Farol', 'Fatuhada', 'Metiaut']],
  ['TR', 'Turkey', '🇹🇷', 'TRY', '₺', 'Turkish Lira', '+90', 'Ankara', 'Istanbul Real Estate Brokers Chamber (İTO)', 'General Directorate of Land Registry and Cadastre (TKGM)', 'Tapu Senedi (Title Deed)', ['Istanbul Bebek', 'Nisantasi', 'Bodrum Yalikavak', 'Antalya Lara']],
  ['TM', 'Turkmenistan', '🇹🇲', 'TMT', 'T', 'Turkmenistan Manat', '+993', 'Ashgabat', 'Ministry of Justice Registration Service', 'State Property Registry Department', 'Certificate of State Registration', ['Berkararlyk', 'Bagtyyarlyk', 'Buzmeyin']],
  ['AE', 'United Arab Emirates', '🇦🇪', 'AED', 'AED', 'UAE Dirham', '+971', 'Abu Dhabi', 'Real Estate Regulatory Agency (RERA / DLD)', 'Dubai Land Department (DLD) / ADREC', 'Title Deed & Makani Number', ['Palm Jumeirah', 'Downtown Dubai', 'Dubai Marina', 'Saadiyat Island']],
  ['UZ', 'Uzbekistan', '🇺🇿', 'UZS', 'soʻm', 'Uzbekistani Som', '+998', 'Tashkent', 'National Association of Real Estate Realtors', 'Cadastre Agency (State Committee for Real Estate)', 'Cadastral Passport of Property', ['Mirabad District', 'Yakkasaray', 'Shaykhontohur']],
  ['VN', 'Vietnam', '🇻🇳', 'VND', '₫', 'Vietnamese Dong', '+84', 'Hanoi', 'Vietnam National Real Estate Association (VNREA)', 'Ministry of Natural Resources and Environment (MONRE)', 'Pink Book (Giấy chứng nhận quyền sở hữu nhà ở)', ['Thao Dien (District 2 HCMC)', 'District 1 HCMC', 'Tay Ho Hanoi']],
  ['YE', 'Yemen', '🇾🇪', 'YER', '﷼', 'Yemeni Rial', '+967', 'Sanaa', 'General Authority for Land and Survey', 'Real Estate Registry Office', 'Title Deed (Basira)', ['Hadda', 'Al-Sabeen', 'Aden Crater']],

  // Europe
  ['AL', 'Albania', '🇦🇱', 'ALL', 'L', 'Albanian Lek', '+355', 'Tirana', 'NAREA Albania', 'State Cadastre Agency (ASHK)', 'Numri i Pasurisë / Cadastral ID', ['Blloku', 'Tirana e Re', 'Pazari i Ri']],
  ['AD', 'Andorra', '🇦🇩', 'EUR', '€', 'Euro', '+376', 'Andorra la Vella', 'AGIA Andorra', 'Cadastre Comunal i Notariat', 'Escriptura Pública de Propietat', ['Escaldes-Engordany', 'La Massana', 'Ordino']],
  ['AT', 'Austria', '🇦🇹', 'EUR', '€', 'Euro', '+43', 'Vienna', 'Fachverband der Immobilientreuhänder (WKO)', 'Grundbuch (Federal Land Register)', 'Einlagezahl (EZ) & Katastralgemeinde', ['Innere Stadt (1st)', 'Döbling (19th)', 'Hietzing (13th)']],
  ['BY', 'Belarus', '🇧🇾', 'BYN', 'Br', 'Belarusian Ruble', '+375', 'Minsk', 'Ministry of Justice Real Estate Division', 'National Cadastral Agency (NCA)', 'Certificate of State Registration', ['Tsentralny', 'Savetski', 'Pervomaysky']],
  ['BE', 'Belgium', '🇧🇪', 'EUR', '€', 'Euro', '+32', 'Brussels', 'Beroepsinstituut van Vastgoedmakelaars (BIV / IPI)', 'AAPD / Cadastre Patrimoniumdocumentatie', 'Notariële Akte / Kadastrale Legende', ['Ixelles / Elsene', 'Uccle / Ukkel', 'Knokke-Heist']],
  ['BA', 'Bosnia and Herzegovina', '🇧🇦', 'BAM', 'KM', 'Bosnia Convertible Mark', '+387', 'Sarajevo', 'Udruženje za Nekretnine', 'Zemljišnoknjižni Ured (Gruntovnica)', 'ZK Izvadak', ['Stari Grad', 'Centar', 'Ilidža']],
  ['BG', 'Bulgaria', '🇧🇬', 'BGN', 'лв', 'Bulgarian Lev', '+359', 'Sofia', 'National Real Estate Association (NREA)', 'Registry Agency (Imoten Registar)', 'Notarialen Akt & Cadastral Identifier', ['Lozenets', 'Boyana', 'Doctor’s Garden']],
  ['HR', 'Croatia', '🇭🇷', 'EUR', '€', 'Euro', '+385', 'Zagreb', 'HGK Real Estate Association', 'Zemljišnoknjižni Odjel (Katastar.hr)', 'Zemljišnoknjižni Izvadak (Broj ZK Uloška)', ['Donji Grad', 'Pantovčak', 'Dubrovnik Old Town', 'Split Meje']],
  ['CZ', 'Czech Republic', '🇨🇿', 'CZK', 'Kč', 'Czech Koruna', '+420', 'Prague', 'ARK ČR', 'Katastrální úřad (ČÚZK)', 'List Vlastnictví (LV) & Parcel Number', ['Vinohrady', 'Malá Strana', 'Dejvice', 'Karlín']],
  ['DK', 'Denmark', '🇩🇰', 'DKK', 'kr.', 'Danish Krone', '+45', 'Copenhagen', 'Dansk Ejendomsmæglerforening (DE)', 'Tinglysningsretten (Digital Tinglysning)', 'Matrikelnummer & Ejendomsnummer (BBR)', ['Frederiksberg', 'Østerbro', 'Hellerup']],
  ['EE', 'Estonia', '🇪🇪', 'EUR', '€', 'Euro', '+372', 'Tallinn', 'Estonian Chamber of Real Estate Agents (EKKL)', 'Land Register (Kinnistusraamat)', 'Kinnistu Number & Katastritunnus', ['Kadriorg', 'Kalamaja', 'Pirita', 'Kesklinn']],
  ['FI', 'Finland', '🇫🇮', 'EUR', '€', 'Euro', '+358', 'Helsinki', 'Central Federation of Finnish Real Estate Agencies (KVKL)', 'National Land Survey of Finland (Maanmittauslaitos)', 'Kiinteistötunnus (Property ID) & Huoneistotietojärjestelmä', ['Kaivopuisto', 'Töölö', 'Kallio', 'Espoo Tapiola']],
  ['FR', 'France', '🇫🇷', 'EUR', '€', 'Euro', '+33', 'Paris', 'FNAIM (Fédération Nationale de l’Immobilier)', 'Service de la Publicité Foncière / Cadastre.gouv.fr', 'Acte Authentique de Vente & Référence Cadastrale', ['Paris 8th Champs-Élysées', 'Paris 16th Passy', 'Cannes Croisette', 'Nice Promenade']],
  ['DE', 'Germany', '🇩🇪', 'EUR', '€', 'Euro', '+49', 'Berlin', 'Immobilienverband Deutschland (IVD)', 'Grundbuchamt (Amtsgericht)', 'Grundbuchblatt & Flurnummer / Flurstück', ['Berlin Mitte', 'Charlottenburg', 'Munich Bogenhausen', 'Frankfurt Westend']],
  ['GR', 'Greece', '🇬🇷', 'EUR', '€', 'Euro', '+30', 'Athens', 'Hellenic Association of Realtors (SEK)', 'Hellenic Cadastre (Ktimatologio / Κτηματολόγιο)', 'KAEK (National Cadastre Code Number)', ['Kolonaki', 'Glyfada', 'Kifisia', 'Mykonos Chora', 'Santorini Oia']],
  ['HU', 'Hungary', '🇭🇺', 'HUF', 'Ft', 'Hungarian Forint', '+36', 'Budapest', 'Hungarian Real Estate Association (MAIE)', 'Land Registry Office (Földhivatal)', 'Tulajdoni Lap (Property Sheet) & Helyrajzi Szám', ['District V Belváros', 'District II Rózsadomb', 'District XII Hegyvidék']],
  ['IS', 'Iceland', '🇮🇸', 'ISK', 'kr', 'Icelandic Króna', '+354', 'Reykjavík', 'Association of Icelandic Real Estate Agents (FF)', 'Registers Iceland (Þjóðskrá Íslands)', 'Fastanúmer (Property Number) & Landnúmer', ['Vesturbær', 'Miðbær', 'Austurbær', 'Garðabær']],
  ['IE', 'Ireland', '🇮🇪', 'EUR', '€', 'Euro', '+353', 'Dublin', 'Property Services Regulatory Authority (PSRA)', 'Tailte Éireann (Land Registry)', 'Folio Number & Eircode', ['Ballsbridge (Dublin 4)', 'Ranelagh (Dublin 6)', 'Dalkey', 'Howth']],
  ['IT', 'Italy', '🇮🇹', 'EUR', '€', 'Euro', '+39', 'Rome', 'Fédération FIAIP / FIMAA', 'Agenzia delle Entrate (Conservatoria dei Registri Immobiliari)', 'Visura Catastale (Foglio, Particella, Subalterno)', ['Rome Parioli', 'Centro Storico', 'Milan Brera', 'Portofino']],
  ['XK', 'Kosovo', '🇽🇰', 'EUR', '€', 'Euro', '+383', 'Pristina', 'Kosovo Real Estate Association', 'Kosovo Cadastral Agency (AKK)', 'Cadastral Unit Number & Certificate', ['Dragodan', 'Pejton', 'Sunny Hill (Bregu i Diellit)']],
  ['LV', 'Latvia', '🇱🇻', 'EUR', '€', 'Euro', '+371', 'Riga', 'Latvian Real Estate Association (LANĪDA)', 'State Land Service (Valsts Zemes Dienests)', 'Zemesgrāmatas Akts & Kadastra Numurs', ['Centrs', 'Jūrmala Dzintari', 'Teika', 'Mežaparks']],
  ['LI', 'Liechtenstein', '🇱🇮', 'CHF', 'CHF', 'Swiss Franc', '+423', 'Vaduz', 'Liechtenstein Real Estate Association', 'Grundbuch- und Vermessungsamt', 'Grundbuchblatt & Parzellennummer', ['Vaduz Centre', 'Schaan', 'Triesen', 'Balzers']],
  ['LT', 'Lithuania', '🇱🇹', 'EUR', '€', 'Euro', '+370', 'Vilnius', 'Lithuanian Association of Real Estate Agencies (LNTAA)', 'State Enterprise Centre of Registers (Registrų Centras)', 'Unikalus Daikto Numeris (Unique Property Number)', ['Senamiestis', 'Žvėrynas', 'Naujamiestis']],
  ['LU', 'Luxembourg', '🇱🇺', 'EUR', '€', 'Euro', '+352', 'Luxembourg City', 'Chambre Immobilière du Grand-Duché de Luxembourg', 'Administration du Cadastre et de la Topographie', 'Extrait Cadastral (Section & Numéro Parcellique)', ['Limpertsberg', 'Belair', 'Kirchberg', 'Cents']],
  ['MT', 'Malta', '🇲🇹', 'EUR', '€', 'Euro', '+356', 'Valletta', 'Malta Real Estate Association', 'Land Registry Agency (Malta Public Registry)', 'Title Reference / Land Register Plan', ['Sliema', 'St. Julian’s (Portomaso)', 'Valletta Waterfront', 'Madliena']],
  ['MD', 'Moldova', '🇲🇩', 'MDL', 'L', 'Moldovan Leu', '+373', 'Chișinău', 'Real Estate Specialists Union of Moldova', 'Public Services Agency (Departamentul Cadastru)', 'Număr Cadastral & Extras din Registrul Bunurilor', ['Centru', 'Rîșcani', 'Botanica', 'Buiucani']],
  ['MC', 'Monaco', '🇲🇨', 'EUR', '€', 'Euro', '+377', 'Monaco', 'Chambre Immobilière Monégasque', 'Direction des Services Fiscaux - Conservation des Hypothèques', 'Acte Notarié de Propriété', ['Monte-Carlo', 'Larvotto', 'Fontvieille', 'La Condamine']],
  ['ME', 'Montenegro', '🇲🇪', 'EUR', '€', 'Euro', '+382', 'Podgorica', 'Montenegro Real Estate Association', 'Administration for Cadastre and State Property (UZK)', 'List Nepokretnosti (LN Number)', ['Budva Old Town', 'Kotor Bay', 'Porto Montenegro (Tivat)', 'Podgorica Centre']],
  ['NL', 'Netherlands', '🇳🇱', 'EUR', '€', 'Euro', '+31', 'Amsterdam', 'Nederlandse Vereniging van Makelaars (NVM)', 'Kadaster (Basisregistratie Kadaster)', 'Kadastrale Aanduiding (Gemeente, Sectie, Nummer)', ['Amsterdam Oud-Zuid', 'Grachtengordel', 'The Hague Benoordenhout', 'Rotterdam Kralingen']],
  ['MK', 'North Macedonia', '🇲🇰', 'MKD', 'ден', 'Macedonian Denar', '+389', 'Skopje', 'National Real Estate Association', 'Agency for Real Estate Cadastre (AKN)', 'Imoten List (Имотен лист)', ['Centar', 'Karposh', 'Vodno', 'Debar Maalo']],
  ['NO', 'Norway', '🇳🇴', 'NOK', 'kr', 'Norwegian Krone', '+47', 'Oslo', 'Norges Eiendomsmeglerforbund (NEF)', 'Kartverket (Tinglysing)', 'Gårdsnummer (Gnr) & Bruksnummer (Bnr)', ['Frogner', 'Majorstuen', 'Grünerløkka', 'Holmenkollen']],
  ['PL', 'Poland', '🇵🇱', 'PLN', 'zł', 'Polish Zloty', '+48', 'Warsaw', 'Polish Real Estate Federation (FPRN / PFRN)', 'Sąd Rejonowy (Wydział Ksiąg Wieczystych)', 'Numer Księgi Wieczystej (KW Number)', ['Śródmieście', 'Mokotów', 'Wilanów', 'Kraków Stare Miasto']],
  ['PT', 'Portugal', '🇵🇹', 'EUR', '€', 'Euro', '+351', 'Lisbon', 'APEMIP (Associação dos Profissionais do Imobiliário)', 'Conservatória do Registo Predial & Caderneta Predial', 'Certidão Permanente de Registo Predial (Artigo Matricial)', ['Lisbon Chiado', 'Príncipe Real', 'Cascais', 'Porto Foz do Douro']],
  ['RO', 'Romania', '🇷🇴', 'RON', 'lei', 'Romanian Leu', '+40', 'Bucharest', 'Romanian Real Estate Association (ABI)', 'National Agency for Cadastre and Land Registration (ANCPI)', 'Număr Carte Funciară (CF) & Cadastral Number', ['Primăverii', 'Dorobanți', 'Floreasca', 'Herăstrău']],
  ['RU', 'Russia', '🇷🇺', 'RUB', '₽', 'Russian Ruble', '+7', 'Moscow', 'Russian Guild of Realtors (RGR)', 'Federal Service for State Registration (Rosreestr)', 'EGRN Extract & Cadastral Number (Кадастровый номер)', ['Moscow Arbat', 'Tverskoy', 'Khamovniki', 'Saint Petersburg Petrogradsky']],
  ['SM', 'San Marino', '🇸🇲', 'EUR', '€', 'Euro', '+378', 'San Marino', 'Ordine degli Ingegneri e Architetti San Marino', 'Ufficio del Catastro e dei Registri Immobiliari', 'Certificato di Iscrizione Catastale', ['Città di San Marino', 'Borgo Maggiore', 'Serravalle']],
  ['RS', 'Serbia', '🇷🇸', 'RSD', 'дин.', 'Serbian Dinar', '+381', 'Belgrade', 'National Association of Real Estate (Klaster Nekretnine)', 'Republic Geodetic Authority (RGZ / Katastar)', 'List Nepokretnosti (Broj Parcele i Lista)', ['Dedinje', 'Senjak', 'Vračar', 'Dorćol', 'Novi Beograd']],
  ['SK', 'Slovakia', '🇸🇰', 'EUR', '€', 'Euro', '+421', 'Bratislava', 'National Association of Real Estate Agencies (NARKS)', 'Geodetic and Cartographic Institute (Katasterportal)', 'List Vlastníctva (LV) & Parcelné Číslo', ['Staré Mesto', 'Koliba', 'Ružinov', 'Horský Park']],
  ['SI', 'Slovenia', '🇸🇮', 'EUR', '€', 'Euro', '+386', 'Ljubljana', 'Slovenian Real Estate Association (ZPN)', 'Surveying and Mapping Authority (GURS / Zemljiška Knjiga)', 'Zemljiškoknjižni Izpisek & Parcelna Številka', ['Center', 'Bežigrad', 'Rožna Dolina', 'Bled Lake Area']],
  ['ES', 'Spain', '🇪🇸', 'EUR', '€', 'Euro', '+34', 'Madrid', 'Colegio Oficial de Agentes de la Propiedad Inmobiliaria (API)', 'Registro de la Propiedad (Colegio de Registradores)', 'Nota Simple Informativa / Referencia Catastral', ['Madrid Salamanca', 'Chamberí', 'Barcelona Eixample', 'Marbella Golden Mile']],
  ['SE', 'Sweden', '🇸🇪', 'SEK', 'kr', 'Swedish Krona', '+46', 'Stockholm', 'Mäklarsamfundet (Swedish Real Estate Association)', 'Lantmäteriet (Land Cadastre)', 'Fastighetsbeteckning & Inskrivningsmyndighet', ['Östermalm', 'Södermalm', 'Vasastan', 'Danderyd']],
  ['CH', 'Switzerland', '🇨🇭', 'CHF', 'CHF', 'Swiss Franc', '+41', 'Bern', 'Swiss Real Estate Association (SVIT)', 'Grundbuchamt / Registre Foncier Cantonal', 'Grundstücksnummer / Numéro d’Immeuble', ['Zurich Enge', 'Geneva Champel', 'Cologny', 'St. Moritz']],
  ['UA', 'Ukraine', '🇺🇦', 'UAH', '₴', 'Ukrainian Hryvnia', '+380', 'Kyiv', 'Association of Real Estate Specialists of Ukraine (ASNU)', 'State Register of Property Rights to Real Estate', 'Vytiah z Derzhavnoho Reyestru (Cadastral Number)', ['Pechersk', 'Shevchenkivskyi', 'Podil', 'Obolon']],
  ['GB', 'United Kingdom', '🇬🇧', 'GBP', '£', 'British Pound Sterling', '+44', 'London', 'NAEA Propertymark & RICS', 'HM Land Registry / Registers of Scotland', 'Title Number & UPRN', ['Knightsbridge', 'Mayfair', 'Chelsea', 'Kensington', 'Edinburgh New Town']],
  ['VA', 'Vatican City', '🇻🇦', 'EUR', '€', 'Euro', '+39', 'Vatican City', 'Administration of the Patrimony of the Apostolic See (APSA)', 'APSA Real Estate Administration', 'APSA Land Cadastre Registry', ['Vatican City Proper', 'Borgo', 'Castel Gandolfo']],

  // Oceania
  ['AU', 'Australia', '🇦🇺', 'AUD', 'A$', 'Australian Dollar', '+61', 'Canberra', 'Fair Trading Property Services & REINSW/REIV', 'NSW Land Registry Services / Landgate', 'Lot / Deposited Plan (DP) / Title Folio', ['Sydney Point Piper', 'Double Bay', 'Melbourne Toorak', 'Brisbane Ascot']],
  ['FJ', 'Fiji', '🇫🇯', 'FJD', 'FJ$', 'Fijian Dollar', '+679', 'Suva', 'Real Estate Agents Licensing Board (REALB Fiji)', 'Registrar of Titles (Ministry of Lands)', 'Certificate of Title / Crown Lease Number', ['Domain Suva', 'Denarau Island', 'Tamavua', 'Pacific Harbour']],
  ['KI', 'Kiribati', '🇰🇮', 'AUD', 'A$', 'Australian Dollar', '+686', 'Tarawa', 'Ministry of Environment, Lands and Agricultural Dev.', 'Land Management Division', 'Land Registration Entry', ['Bairiki', 'Betio', 'Ambo', 'Bikenibeu']],
  ['MH', 'Marshall Islands', '🇲🇭', 'USD', '$', 'US Dollar', '+692', 'Majuro', 'Land Registration Authority (LRA)', 'Traditional Land Ownership Registry', 'Customary Land Title Agreement', ['Uliga', 'Delap', 'Darrit']],
  ['FM', 'Micronesia', '🇫🇲', 'USD', '$', 'US Dollar', '+691', 'Palikir', 'Pohnpei State Division of Land', 'Land Commission Registry', 'Certificate of Land Title', ['Kolonia', 'Palikir', 'Kitti']],
  ['NR', 'Nauru', '🇳🇷', 'AUD', 'A$', 'Australian Dollar', '+674', 'Yaren', 'Nauru Lands Committee', 'Lands and Survey Department', 'Nauru Land Record Book', ['Yaren', 'Boe', 'Aiwo', 'Meneng']],
  ['NZ', 'New Zealand', '🇳🇿', 'NZD', 'NZ$', 'New Zealand Dollar', '+64', 'Wellington', 'Real Estate Authority (REA / REINZ)', 'Land Information New Zealand (LINZ)', 'Record of Title (CFR) & Valuation Reference', ['Auckland Remuera', 'Ponsonby', 'Wellington Oriental Bay', 'Queenstown Lakefront']],
  ['PW', 'Palau', '🇵🇼', 'USD', '$', 'US Dollar', '+680', 'Ngerulmud', 'Palau Land Court', 'Land Claims Hearing Office', 'Certificate of Title', ['Koror', 'Meyuns', 'Airai']],
  ['PG', 'Papua New Guinea', '🇵🇬', 'PGK', 'K', 'Papua New Guinean Kina', '+675', 'Port Moresby', 'Real Estate Industry Association PNG', 'Department of Lands and Physical Planning', 'State Lease / Allotment & Section Number', ['Touaguba Hill', 'Old Parliament Area', 'Boroko']],
  ['WS', 'Samoa', '🇼🇸', 'WST', 'WS$', 'Samoan Tala', '+685', 'Apia', 'Ministry of Natural Resources and Environment (MNRE)', 'Land Titles Registration Office', 'Certificate of Title / Customary Lease', ['Vaiala', 'Moamoa', 'Vailima', 'Siusega']],
  ['SB', 'Solomon Islands', '🇸🇧', 'SBD', 'SI$', 'Solomon Islands Dollar', '+677', 'Honiara', 'Ministry of Lands, Housing and Survey', 'Registrar of Titles', 'Fixed Term Estate Title / Parcel ID', ['Titinge', 'Kola Ridge', 'Mbokonavera']],
  ['TO', 'Tonga', '🇹🇴', 'TOP', 'T$', 'Tongan Paʻanga', '+676', 'Nukuʻalofa', 'Ministry of Lands and Natural Resources', 'Land Registry Office', 'Deed of Lease / Royal Estate Grant', ['Kolomotuʻa', 'Kolofoʻou', 'Maʻufanga']],
  ['TV', 'Tuvalu', '🇹🇻', 'AUD', 'A$', 'Australian Dollar', '+688', 'Funafuti', 'Tuvalu Lands Department', 'Native Lands Commission', 'Land Register Record', ['Vaiaku', 'Alapi', 'Fakaifou']],
  ['VU', 'Vanuatu', '🇻🇺', 'VUV', 'VT', 'Vanuatu Vatu', '+678', 'Port Vila', 'Vanuatu Real Estate Agents Association', 'Department of Lands, Surveys and Records', 'Registered Lease Title (Title & Sector ID)', ['Nambatu', 'Tassiriki', 'Elluk Plateau', 'Havannah Harbour']]
];

// Specific regulatory & licensing detail overrides by country code
interface CountryRegulatoryOverride {
  regBody?: string;
  licenseName?: string;
  licensePlaceholder?: string;
  complianceAuth?: string;
  statutoryAct?: string;
  regulatoryRequirements?: string;
  licenseFormatDescription?: string;
  renewalCycle?: string;
  trustAccountObligation?: string;
  agentTypes?: string[];
  portals?: { name: string; url: string }[];
}

const SPECIFIC_COUNTRY_REGULATORY_MAP: Record<string, CountryRegulatoryOverride> = {
  ZA: {
    regBody: 'Property Practitioners Regulatory Authority (PPRA / EAAB)',
    licenseName: 'PPRA / EAAB Fidelity Fund Certificate (FFC)',
    licensePlaceholder: '20241098234 (Fidelity Fund Certificate)',
    complianceAuth: 'PPRA & Financial Intelligence Centre (FIC Act Compliance)',
    statutoryAct: 'Property Practitioners Act 22 of 2019 (PPA) Section 47',
    regulatoryRequirements: 'Every practicing property practitioner (Principal, Non-Principal, or Candidate) must hold a valid Fidelity Fund Certificate (FFC) issued annually by the PPRA. Practicing without a valid FFC is illegal under Section 48 and prohibits claiming commission. Practitioners must maintain compliant trust account audits and log annual CPD (Continuing Professional Development) points.',
    licenseFormatDescription: '11-Digit Numeric Certificate Number (e.g. 20241098234) issued following NQF 4/5 PDE examination.',
    renewalCycle: 'Annual renewal required before October 31st for the subsequent calendar year.',
    trustAccountObligation: 'Section 54 Audited Trust Account with designated banking institution and annual Independent Auditor Report submission.',
    agentTypes: [
      'Principal Property Practitioner (PPRA)',
      'Non-Principal Property Practitioner (PPRA)',
      'Candidate Property Practitioner (Intern FFC)',
      'Master Practitioner in Real Estate (MPRE)'
    ],
    portals: [
      { name: 'Property24', url: 'https://www.property24.com' },
      { name: 'Private Property', url: 'https://www.privateproperty.co.za' }
    ]
  },
  US: {
    regBody: 'State Real Estate Commission (DRE / FREC / TREC)',
    licenseName: 'DRE / State Real Estate Broker License #',
    licensePlaceholder: 'DRE# 02194821 / FREC-BK3489201',
    complianceAuth: 'FinCEN Real Estate Compliance & State Licensing Division',
    statutoryAct: 'State Real Estate Licensing Acts (e.g. CA Business & Professions Code § 10150, FL Statutes Ch. 475, TX Occupations Code Ch. 1101)',
    regulatoryRequirements: 'Real estate brokers and salespersons must hold an active license issued by their state regulatory commission (such as California DRE, Florida FREC, Texas TREC, or NY DOS). Requires accredited pre-licensing courses, passing state examinations, background fingerprint clearance, and active broker sponsorship.',
    licenseFormatDescription: '8-Digit DRE License Number (e.g. 02194821) or State Prefix + Alphanumeric ID (e.g. FREC-BK3489201, TREC-059281).',
    renewalCycle: '2 to 4-year renewal cycle with mandatory 18–45 hours of Continuing Education (CE).',
    trustAccountObligation: 'Designated Real Estate Broker Escrow / Trust Account subject to state unannounced audits.',
    agentTypes: [
      'Licensed Real Estate Broker (DRE / Commission)',
      'Licensed Real Estate Salesperson',
      'Realtor® / Associate Managing Broker',
      'Commercial Investment Specialist (CCIM)'
    ],
    portals: [
      { name: 'Zillow', url: 'https://www.zillow.com' },
      { name: 'Realtor.com', url: 'https://www.realtor.com' },
      { name: 'Redfin', url: 'https://www.redfin.com' }
    ]
  },
  GB: {
    regBody: 'NAEA Propertymark & RICS (Royal Institution of Chartered Surveyors)',
    licenseName: 'RICS Membership / NAEA Registration #',
    licensePlaceholder: 'RICS-884920 / MNAEA-49201',
    complianceAuth: 'NAEA Propertymark & Money Laundering Regs (MLR)',
    statutoryAct: 'Estate Agents Act 1979 & Consumer Protection from Unfair Trading Regulations (CPRs)',
    regulatoryRequirements: 'Estate agents operating in the UK must register with an approved redress scheme (The Property Ombudsman - TPO or Property Redress Scheme - PRS), maintain HMRC Anti-Money Laundering supervision, and hold mandatory Client Money Protection (CMP). Professional designations require certified RICS or NAEA Propertymark registration.',
    licenseFormatDescription: 'RICS-[6-digit Member #] (e.g. RICS-884920) or MNAEA-[5-digit #] / Redress Scheme ID.',
    renewalCycle: 'Annual professional membership renewal with mandatory 20+ hours of verifiable CPD.',
    trustAccountObligation: 'Mandatory ring-fenced Client Account protected by statutory Client Money Protection (CMP) insurance.',
    agentTypes: [
      'Chartered Surveyor (MRICS / FRICS)',
      'Licensed Estate Agent (MNAEA Propertymark)',
      'Senior Residential Valuer & Branch Director',
      'Commercial Property Consultant'
    ],
    portals: [
      { name: 'Rightmove UK', url: 'https://www.rightmove.co.uk' },
      { name: 'Zoopla', url: 'https://www.zoopla.co.uk' },
      { name: 'OnTheMarket', url: 'https://www.onthemarket.com' }
    ]
  },
  AU: {
    regBody: 'Fair Trading Property Services & Real Estate Institute of Australia (REIA)',
    licenseName: 'Real Estate Agent Licence (Fair Trading / REIA)',
    licensePlaceholder: 'LIC-20491823 (Class 1 Agent)',
    complianceAuth: 'Fair Trading Property Compliance & AUSTRAC AML Framework',
    statutoryAct: 'Property and Stock Agents Act 2002 (NSW) / Estate Agents Act 1980 (VIC) / Property Occupations Act 2014 (QLD)',
    regulatoryRequirements: 'Real estate agents must hold a valid Class 1 (Licensee-in-Charge) or Class 2 qualification issued by state fair trading authorities (e.g. NSW Fair Trading, Consumer Affairs Victoria). Requires Certificate IV/Diploma in Real Estate Practice, annual CPD completion, and strict AUSTRAC AML reporting.',
    licenseFormatDescription: 'LIC-[8-digit License #] (e.g. LIC-20491823) or State Registration ID.',
    renewalCycle: 'Annual or 3-year license renewal with mandatory annual CPD modules.',
    trustAccountObligation: 'Statutory trust account audited annually by an independent registered company auditor within 3 months of audit year-end.',
    agentTypes: [
      'Licensed Real Estate Agent (Class 1)',
      'Registered Assistant Agent (Class 2)',
      'Principal Licensee / Agency Director',
      'Accredited Property Valuer & Auctioneer'
    ],
    portals: [
      { name: 'Domain.com.au', url: 'https://www.domain.com.au' },
      { name: 'Realestate.com.au', url: 'https://www.realestate.com.au' }
    ]
  },
  AE: {
    regBody: 'Real Estate Regulatory Agency (RERA / Dubai Land Department)',
    licenseName: 'RERA Broker ID (BRN) / DLD License',
    licensePlaceholder: 'BRN-48920 / ORN-29182',
    complianceAuth: 'RERA & UAE Anti-Money Laundering (AML) Compliance',
    statutoryAct: 'Dubai Law No. 85 of 2006 (Regulating the Real Estate Brokers Register in the Emirate of Dubai)',
    regulatoryRequirements: 'All real estate brokers operating in Dubai and the UAE must hold an active Broker Registration Number (BRN) issued by RERA under the Dubai Land Department (DLD). Agents must pass the DREI certified exam, hold valid residency, operate under a licensed brokerage (ORN), and obtain electronic Trakheesi permits for listing advertisements.',
    licenseFormatDescription: 'BRN-[5-digit Broker ID] (e.g. BRN-48920) or ORN-[5-digit Office Registration Number] (e.g. ORN-29182).',
    renewalCycle: 'Annual renewal via DLD REST / Trakheesi portal subject to mandatory CPD modules and police clearance.',
    trustAccountObligation: 'Project Escrow Accounts supervised directly by the Dubai Land Department (DLD) Escrow Accounts Department.',
    agentTypes: [
      'RERA Certified Real Estate Broker (BRN)',
      'RERA Registered Property Consultant',
      'Commercial Real Estate Broker (DED)',
      'Managing Broker / Agency Director (ORN)'
    ],
    portals: [
      { name: 'Property Finder UAE', url: 'https://www.propertyfinder.ae' },
      { name: 'Bayut', url: 'https://www.bayut.com' }
    ]
  },
  CA: {
    regBody: 'Canadian Real Estate Association (CREA / RECO / BCFSA / OACIQ)',
    licenseName: 'Real Estate Broker / Agent Permit # (RECO/OACIQ)',
    licensePlaceholder: 'RECO-4920194 / OACIQ-E1234',
    complianceAuth: 'FINTRAC Real Estate Compliance & Provincial Council',
    statutoryAct: 'Trust in Real Estate Services Act (TRESA, Ontario) / Real Estate Services Act (RESA, BC) / Real Estate Brokerage Act (Quebec)',
    regulatoryRequirements: 'Agents must be registered with their provincial regulatory council (e.g., RECO in Ontario, BCFSA in BC, OACIQ in Quebec) and be a member of CREA for MLS access. Requires accredited real estate education, passing provincial licensing exams, mandatory errors & omissions insurance, and compliance with FINTRAC client identification guidelines.',
    licenseFormatDescription: 'Provincial Registration ID (e.g. RECO-4920194, BCFSA-189201, OACIQ-E1234).',
    renewalCycle: '2-year registration cycle with mandatory continuing education credits.',
    trustAccountObligation: 'Designated Real Estate Brokerage Trust Account regulated by provincial authority.',
    agentTypes: [
      'Licensed Real Estate Broker (CREA)',
      'Real Estate Sales Representative',
      'Managing Broker / Agency Director',
      'Accredited Commercial Real Estate Specialist'
    ],
    portals: [
      { name: 'Realtor.ca', url: 'https://www.realtor.ca' },
      { name: 'Centris.ca', url: 'https://www.centris.ca' }
    ]
  },
  FR: {
    regBody: 'Chambre de Commerce et d’Industrie (CCI) - Loi Hoguet',
    licenseName: "Carte Professionnelle Transaction 'T' (Loi Hoguet) #",
    licensePlaceholder: 'CPI 7501 2024 000 012 345',
    complianceAuth: 'TRACFIN & Conseil National des Transactions Immobilières (CNTGI)',
    statutoryAct: 'Loi N° 70-9 du 2 janvier 1970 (Loi Hoguet) & Décret N° 72-678 du 20 juillet 1972',
    regulatoryRequirements: 'Any individual or agency carrying out real estate transactions in France must hold a Carte Professionnelle "Transactions sur immeubles et fonds de commerce" (Carte T) issued by the local CCI. Requires verified professional aptitude (diploma or experience), civil liability insurance (RC Pro), financial guarantee (Garantie Financière) for holding funds, and clean bulletin N° 2 criminal record.',
    licenseFormatDescription: 'CPI [Department Code] [Year] [Serial 10 Digits] (e.g. CPI 7501 2024 000 012 345).',
    renewalCycle: 'Valid for 3 years, renewable subject to 42 hours of mandatory continuous training (Loi Alur).',
    trustAccountObligation: 'Compte Spécial Séquestre (Article 55 Décret 1972) backed by a certified financial guarantee bond.',
    agentTypes: [
      'Agent Immobilier Titulaire Carte T (Loi Hoguet)',
      'Négociateur Immobilier Salarié',
      'Agent Commercial Indépendant (RSAC)',
      'Expert Évaluateur Foncier et Immobilier (CEIF)'
    ],
    portals: [
      { name: 'SeLoger', url: 'https://www.seloger.com' },
      { name: 'Le Figaro Immobilier', url: 'https://immobilier.lefigaro.fr' },
      { name: 'Belles Demeures', url: 'https://www.bellesdemeures.com' }
    ]
  },
  DE: {
    regBody: 'Industrie- und Handelskammer (IHK) & Gewerbeamt (§34c GewO)',
    licenseName: 'Maklererlaubnis §34c GewO / IHK Registrierung #',
    licensePlaceholder: '§34c-GEW-2024-8849',
    complianceAuth: 'Geldwäschegesetz (GwG) & IHK Aufsichtsbehörde',
    statutoryAct: 'Gewerbeordnung § 34c (GewO) & Makler- und Bauträgerverordnung (MaBV)',
    regulatoryRequirements: 'Real estate brokers in Germany require an official license under Section 34c of the Industrial Code (Gewerbeordnung). Issued by the IHK or local Gewerbeamt upon verifying personal reliability (clean SCHUFA, criminal record certificate, tax clearance) and orderly financial circumstances. Mandatory 20 hours of continuing professional education within every 3-year period under § 15b MaBV.',
    licenseFormatDescription: 'Official §34c GewO Registration / Approval File Number (e.g. §34c-GEW-2024-8849).',
    renewalCycle: 'Indefinite validity upon approval, subject to mandatory 20 hours CPD every 3 years.',
    trustAccountObligation: 'Anderkonto (Trust Account) strictly segregated from business assets under § 6 MaBV.',
    agentTypes: [
      'Immobilienmakler mit §34c GewO Erlaubnis',
      'Geprüfter Immobilienfachwirt (IHK)',
      'Freier Sachverständiger für Immobilienbewertung',
      'Gewerbeimmobilien-Berater'
    ],
    portals: [
      { name: 'ImmobilienScout24', url: 'https://www.immobilienscout24.de' },
      { name: 'Immowelt', url: 'https://www.immowelt.de' }
    ]
  },
  ES: {
    regBody: 'Colegio Oficial de Agentes de la Propiedad Inmobiliaria (COAPI)',
    licenseName: 'Número de Colegiado API / Registro Homologado (RAICV/AICAT)',
    licensePlaceholder: 'API-20491 / AICAT-8920',
    complianceAuth: 'SEPBLAC Prevención Blanqueo & Consejo General COAPI',
    statutoryAct: 'Ley 10/2010 de Prevención del Blanqueo de Capitales & Decretos Autonómicos Inmobiliarios (AICAT/RAICV)',
    regulatoryRequirements: 'In regulated autonomous regions (Catalonia AICAT, Valencian Community RAICV, Balearics, Madrid), agents must be registered on the official Registry of Real Estate Agents. Requires accredited API qualification, mandatory civil liability insurance, surety bond/guarantee for advance deposits, and compliance with strict consumer protection rules.',
    licenseFormatDescription: 'API-[5-digit Colegiado #] or Regional Registry Number (e.g. AICAT-8920, RAICV-1204).',
    renewalCycle: 'Annual certificate of registry validity and insurance policy updates.',
    trustAccountObligation: 'Segregated client funds deposit account backed by minimum €60,000 surety bond.',
    agentTypes: [
      'Agente de la Propiedad Inmobiliaria (API Colegiado)',
      'Asesor Inmobiliario Registrado (AICAT/RAICV)',
      'Director de Agencia Inmobiliaria',
      'Consultor en Inversiones Inmobiliarias'
    ],
    portals: [
      { name: 'Idealista', url: 'https://www.idealista.com' },
      { name: 'Fotocasa', url: 'https://www.fotocasa.es' },
      { name: 'Habitaclia', url: 'https://www.habitaclia.com' }
    ]
  },
  IT: {
    regBody: 'Camera di Commercio (Ruolo Mediatori / Registro Imprese REA)',
    licenseName: 'Patentino Agente Immobiliare / N° REA Camera di Commercio',
    licensePlaceholder: 'REA MI-2049182 / Patentino',
    complianceAuth: 'UIF Banca d’Italia & Camera di Commercio (Mediazione)',
    statutoryAct: 'Legge 3 febbraio 1989 n. 39 & D.Lgs. 59/2010 (Disciplina della professione di mediatore)',
    regulatoryRequirements: 'Italian real estate brokers must hold the official Patentino di Agente di Affari in Mediazione and be registered in the REA (Repertorio Economico Amministrativo) at the local Chamber of Commerce. Requires passing a rigorous provincial written and oral examination, holding civil liability insurance policy, and maintaining professional independence.',
    licenseFormatDescription: 'REA [Province Code]-[7-Digit Number] (e.g. REA MI-2049182) or Patentino Number.',
    renewalCycle: '4-year mandatory periodic review (revisione dinamica dei requisiti) at the Camera di Commercio.',
    trustAccountObligation: 'Strict fiduciary management of deposit checks made directly to the seller/escrow notary.',
    agentTypes: [
      'Agente di Affari in Mediazione Immobiliare (Patentino)',
      'Mediatore Creditizio e Immobiliare Registrato',
      'Responsabile Tecnico di Agenzia',
      'Consulente Immobiliare Senior'
    ],
    portals: [
      { name: 'Immobiliare.it', url: 'https://www.immobiliare.it' },
      { name: 'Idealista IT', url: 'https://www.idealista.it' },
      { name: 'Casa.it', url: 'https://www.casa.it' }
    ]
  },
  IN: {
    regBody: 'Real Estate Regulatory Authority (RERA State Council)',
    licenseName: 'RERA Real Estate Agent Registration #',
    licensePlaceholder: 'MahaRERA/A51900028491 / HRERA-291',
    complianceAuth: 'RERA Authority & Financial Intelligence Unit (FIU-IND)',
    statutoryAct: 'Real Estate (Regulation and Development) Act 2016 (RERA Act)',
    regulatoryRequirements: 'All real estate agents facilitating sales of registered real estate projects in India must hold an active RERA registration certificate issued by the respective State RERA Authority (e.g., MahaRERA, HRERA, UP-RERA, Karnataka RERA). Mandates quoting the RERA registration number on all advertisements, maintaining books of accounts, and undergoing mandatory RERA CP certification training.',
    licenseFormatDescription: 'State Prefix + RERA Alphanumeric ID (e.g. MahaRERA/A51900028491 or HRERA-PKL-REA-291).',
    renewalCycle: 'Valid for 5 years, renewable upon application and compliance verification.',
    trustAccountObligation: 'Strict compliance with Section 4(2)(l)(D) 70% project escrow bank account regulations.',
    agentTypes: [
      'RERA Registered Real Estate Agent',
      'Principal Real Estate Broker',
      'Certified Commercial Real Estate Consultant',
      'Channel Partner / Strategic Marketing Director'
    ],
    portals: [
      { name: 'MagicBricks', url: 'https://www.magicbricks.com' },
      { name: '99acres', url: 'https://www.99acres.com' },
      { name: 'Housing.com', url: 'https://www.housing.com' }
    ]
  },
  SG: {
    regBody: 'Council for Estate Agencies (CEA)',
    licenseName: 'CEA Registration Number (Public Register)',
    licensePlaceholder: 'CEA Reg: R019283A / L3001234K',
    complianceAuth: 'Council for Estate Agencies (CEA) & STRO Compliance',
    statutoryAct: 'Estate Agents Act 2010 (Cap. 95A)',
    regulatoryRequirements: 'All real estate salespersons (RES) and estate agents in Singapore must be registered or licensed by the Council for Estate Agencies (CEA). Requires passing the Real Estate Salesperson (RES) exam, holding professional indemnity insurance, being registered under an authorized licensed estate agent agency (KEO), and completing 6 CPD credits annually.',
    licenseFormatDescription: 'R[6 digits][1 letter] for Salespersons (e.g. R019283A) and L[7 digits][1 letter] for Agencies.',
    renewalCycle: 'Annual renewal (by 31 October) via CEA public portal subject to mandatory CPD fulfillment.',
    trustAccountObligation: 'Client money accounts strictly forbidden for salespersons; funds managed by licensed banks/escrow.',
    agentTypes: [
      'CEA Registered Real Estate Salesperson (RES)',
      'Key Executive Officer (KEO)',
      'Licensed Estate Agent (Agency Principal)',
      'Senior Marketing Director'
    ],
    portals: [
      { name: 'PropertyGuru SG', url: 'https://www.propertyguru.com.sg' },
      { name: '99.co Singapore', url: 'https://www.99.co/singapore' },
      { name: 'EdgeProp SG', url: 'https://www.edgeprop.sg' }
    ]
  },
  MY: {
    regBody: 'Board of Valuers, Appraisers, Estate Agents and Property Managers (BOVAEP)',
    licenseName: 'BOVAEP Real Estate Agent (REA) License (E-Number)',
    licensePlaceholder: 'E-2918 / PEA-1928 / REN-49201',
    complianceAuth: 'BOVAEP & Bank Negara Malaysia Anti-Money Laundering (AMLA)',
    statutoryAct: 'Valuers, Appraisers, Estate Agents and Property Managers Act 1981 (Act 242)',
    regulatoryRequirements: 'Estate agency practice in Malaysia is governed by BOVAEP (Lembaga Penilai, Pentaksir, Ejen Harta Tanah dan Pengurus Harta). Registered Estate Agents (REA) hold an E-number following diploma examinations and a 2-year Test of Professional Competence (TPC). Real Estate Negotiators (REN) work under REA supervision with mandatory REN tag certification.',
    licenseFormatDescription: 'E-[4 digits] for REA (e.g. E-2918) or REN-[5 digits] for Negotiators (e.g. REN-49201).',
    renewalCycle: 'Annual renewal of practicing certificate (Form K) with mandatory CPD attendance.',
    trustAccountObligation: 'Mandatory Section 23 Clients Account governed by Rule 105 of the Board Rules.',
    agentTypes: [
      'Registered Estate Agent (REA - E Number)',
      'Probationary Estate Agent (PEA)',
      'Real Estate Negotiator (REN Tagged)',
      'Registered Property Valuer & Manager'
    ],
    portals: [
      { name: 'PropertyGuru Malaysia', url: 'https://www.propertyguru.com.my' },
      { name: 'iProperty Malaysia', url: 'https://www.iproperty.com.my' }
    ]
  },
  NZ: {
    regBody: 'Real Estate Authority (REA / REINZ)',
    licenseName: 'REA Licensed Real Estate Agent Licence #',
    licensePlaceholder: 'REA Lic # 20049182',
    complianceAuth: 'Real Estate Authority (REA) & DIA AML/CFT Regulatory Body',
    statutoryAct: 'Real Estate Agents Act 2008 & Professional Conduct and Client Care Rules',
    regulatoryRequirements: 'All individuals carrying out real estate agency work in New Zealand must hold a current licence issued by the Real Estate Authority (REA). Requires completion of the New Zealand Certificate in Real Estate, passing fit and proper person assessments, and completing 10 hours of verifiable and 10 hours of non-verifiable continuing education every year.',
    licenseFormatDescription: 'REA Lic # [8-digit Number] (e.g. REA Lic # 20049182).',
    renewalCycle: 'Annual license renewal on or before the anniversary date of issue.',
    trustAccountObligation: 'Section 122 Audited Trust Account required for holding deposits for 10 working days.',
    agentTypes: [
      'Licensed Real Estate Agent (Branch Manager / Director)',
      'Licensed Real Estate Salesperson (REA)',
      'Accredited Commercial & Rural Specialist',
      'Registered Property Valuer (ANZIV)'
    ],
    portals: [
      { name: 'Realestate.co.nz', url: 'https://www.realestate.co.nz' },
      { name: 'Trade Me Property', url: 'https://www.trademe.co.nz/property' },
      { name: 'OneRoof NZ', url: 'https://www.oneroof.co.nz' }
    ]
  },
  SA: {
    regBody: 'Real Estate General Authority (REGA / Fal)',
    licenseName: 'Fal Real Estate Brokerage License (رخصة فال العقارية)',
    licensePlaceholder: 'FAL-Lic: 1100294820',
    complianceAuth: 'Saudi Central Bank (AML) & REGA Fal Regulatory Platform',
    statutoryAct: 'Saudi Real Estate Brokerage Law (Cabinet Decision No. 671 / 1443H) & REGA Regulations',
    regulatoryRequirements: 'Brokers and marketers in Saudi Arabia must obtain an official Fal license (رخصة فال للوساطة والتسويق العقاري) issued by the Real Estate General Authority (REGA). Requires passing accredited National Real Estate Institute (MAPI) courses, completing Ejar rental platform integration, and issuing electronic brokerage contracts registered via the REGA electronic portal.',
    licenseFormatDescription: 'FAL-Lic: 10-Digit Alphanumeric Code (e.g. 1100294820 / 1200039281).',
    renewalCycle: '1, 2, or 3-year validity with digital renewal via the REGA electronic platform.',
    trustAccountObligation: 'Ejar electronic payment gateway for rental escrow and verified client bank accounts.',
    agentTypes: [
      'Licensed Real Estate Broker (Fal Brokerage License)',
      'Licensed Property Marketer (Fal Marketing)',
      'Certified Real Estate Valuer (Taqeem)',
      'Commercial Real Estate Advisor'
    ],
    portals: [
      { name: 'Aqar Saudi (عقار)', url: 'https://sa.aqar.fm' },
      { name: 'Bayut KSA', url: 'https://www.bayut.sa' },
      { name: 'Property Finder KSA', url: 'https://www.propertyfinder.sa' }
    ]
  },
  BR: {
    regBody: 'Conselho Federal de Corretores de Imóveis (COFECI / CRECI)',
    licenseName: 'Número de Registro CRECI (Pessoa Física / Jurídica)',
    licensePlaceholder: 'CRECI-SP 184920-F',
    complianceAuth: 'COAF & Conselho Regional de Corretores de Imóveis (CRECI)',
    statutoryAct: 'Lei Federal Nº 6.530 de 12 de maio de 1978 & Resoluções COFECI',
    regulatoryRequirements: 'Real estate brokers in Brazil must be registered with their Regional Council of Real Estate Brokers (CRECI). Requires a recognized Technical Degree in Real Estate Transactions (TTI) or Bachelor in Real Estate Sciences, completion of formal supervised internship, registration at COFECI, and compliance with the Professional Code of Ethics.',
    licenseFormatDescription: 'CRECI-[State Code] [6-Digit Number]-[F for Person / J for Legal Entity] (e.g. CRECI-SP 184920-F).',
    renewalCycle: 'Annual registration renewal with the regional CRECI council (Anuidade CRECI).',
    trustAccountObligation: 'Fiduciary escrow account in compliance with COFECI financial oversight rules.',
    agentTypes: [
      'Corretor de Imóveis Credenciado (CRECI)',
      'Perito Avaliador Imobiliário (CNAI)',
      'Diretor Responsável de Imobiliária (CRECI-J)',
      'Consultor Imobiliário de Alto Padrão'
    ],
    portals: [
      { name: 'Zap Imóveis', url: 'https://www.zapimoveis.com.br' },
      { name: 'Viva Real', url: 'https://www.vivareal.com.br' },
      { name: 'Imovelweb', url: 'https://www.imovelweb.com.br' }
    ]
  },
  MX: {
    regBody: 'Asociación Mexicana de Profesionales Inmobiliarios (AMPI)',
    licenseName: 'Matrícula Inmobiliaria AMPI / Licencia Estatal #',
    licensePlaceholder: 'AMPI-CDMX-849201',
    complianceAuth: 'UIF Secretaría de Hacienda & AMPI Inmobiliario',
    statutoryAct: 'Leyes Estatales de Prestación de Servicios Inmobiliarios & Ley Federal Antilavado (LFPIORPI)',
    regulatoryRequirements: 'In states with real estate legislation (CDMX, Quintana Roo, Jalisco, Baja California, etc.), brokers must obtain an official state real estate license and register with AMPI. Requires certified CONOCER real estate competency (EC0110.01 / EC0903), continuous training, civil liability coverage, and strict anti-money laundering reporting under LFPIORPI.',
    licenseFormatDescription: 'AMPI-[State Code]-[6-Digit Number] or State License Registry Number.',
    renewalCycle: 'Annual or biennial state license renewal with mandatory continuous education units.',
    trustAccountObligation: 'Segregated escrow account managed via registered Mexican financial institution or notary.',
    agentTypes: [
      'Profesional Inmobiliario Certificado (AMPI)',
      'Asesor Inmobiliario con Licencia Estatal',
      'Broker / Director de Franquicia Inmobiliaria',
      'Valuador Inmobiliario Certificado'
    ],
    portals: [
      { name: 'Inmuebles24', url: 'https://www.inmuebles24.com' },
      { name: 'Vivanuncios', url: 'https://www.vivanuncios.com.mx' },
      { name: 'Propiedades.com', url: 'https://propiedades.com' }
    ]
  },
  JP: {
    regBody: 'Ministry of Land, Infrastructure, Transport and Tourism (MLIT)',
    licenseName: 'Takken License # (宅地建物取引士 登録番号)',
    licensePlaceholder: '東京都知事(1)第89201号 / 宅建士',
    complianceAuth: 'MLIT & Japan Financial Intelligence Center (JAFIC) AML Framework',
    statutoryAct: 'Building Lots and Buildings Transaction Business Act (宅地建物取引業法)',
    regulatoryRequirements: 'Real estate transaction specialists in Japan must pass the national Takken (宅建試験) exam and be officially registered with the prefectural governor. Real estate offices must employ at least one full-time licensed Takken specialist for every five staff members to execute explanation of important matters (重要事項説明書).',
    licenseFormatDescription: 'Prefecture Name + Governor License No. (e.g. 東京都知事(1)第89201号).',
    renewalCycle: '5-year renewal cycle requiring mandatory statutory refresher lectures (法定講習).',
    trustAccountObligation: 'Mandatory Business Guarantee Deposit (営業保証金) deposited at the Legal Affairs Bureau or membership in a Guaranty Association.',
    agentTypes: [
      'Licensed Real Estate Transaction Specialist (宅地建物取引士)',
      'Certified Real Estate Appraiser (不動産鑑定士)',
      'Real Estate Agency Representative (代表取締役 / 宅建業者)',
      'Commercial Property Consultant'
    ],
    portals: [
      { name: 'SUUMO Japan', url: 'https://suumo.jp' },
      { name: 'HOME’S (LIFULL)', url: 'https://www.homes.co.jp' },
      { name: 'Athome Japan', url: 'https://www.athome.co.jp' }
    ]
  },
  IE: {
    regBody: 'Property Services Regulatory Authority (PSRA)',
    licenseName: 'PSRA Property Services Provider Licence #',
    licensePlaceholder: 'PSRA Lic No. 003921-008129',
    complianceAuth: 'PSRA & Criminal Justice (Money Laundering) Supervisory Authority',
    statutoryAct: 'Property Services (Regulation) Act 2011 & Client Services Regulations',
    regulatoryRequirements: 'All property service providers (estate agents, letting agents, management agents, and auctioneers) in Ireland must hold a valid PSRA licence. Requires certified property qualifications, tax clearance certificate, professional indemnity insurance, client money protection, and contribution to the Property Services Compensation Fund.',
    licenseFormatDescription: 'PSRA Lic No. [6-Digit Firm #]-[6-Digit Individual #] (e.g. 003921-008129).',
    renewalCycle: 'Annual licence renewal via the PSRA online licensing portal.',
    trustAccountObligation: 'Statutory Client Account maintained under Property Services (Regulation) Act 2011 (Client Funds) Regulations.',
    agentTypes: [
      'Licensed Property Services Provider (PSRA Class B/C/D)',
      'Chartered Valuation Surveyor (SCSI/RICS)',
      'Senior Estate Agent & Auctioneer',
      'Commercial Property Advisor'
    ],
    portals: [
      { name: 'Daft.ie', url: 'https://www.daft.ie' },
      { name: 'MyHome.ie', url: 'https://www.myhome.ie' }
    ]
  },
  CH: {
    regBody: 'Schweizerischer Verband der Immobilienwirtschaft (SVIT)',
    licenseName: 'SVIT Diplomierter Immobilientreuhänder Reg. #',
    licensePlaceholder: 'SVIT-CH-884920',
    complianceAuth: 'FINMA & SVIT Standesregeln zur Geldwäschereibekämpfung',
    statutoryAct: 'Schweizerisches Obligationenrecht (OR Art. 412 ff. Mäklervertrag) & Standesregeln SVIT',
    regulatoryRequirements: 'Real estate brokers and property fiduciaries in Switzerland operate under the Swiss Code of Obligations and professional canons of SVIT (Schweizerischer Verband der Immobilienwirtschaft). Certification as "Diplomierter Immobilientreuhänder" or "Immobilienvermarkter mit eidg. Fachausweis" requires federal professional examinations, strict adherence to due diligence in anti-money laundering (GwG), and client funds protection.',
    licenseFormatDescription: 'SVIT-CH-[6-Digit Register ID] or Cantonal Commercial Registry UID (e.g. CHE-123.456.789).',
    renewalCycle: 'Annual SVIT professional membership accreditation and audit review.',
    trustAccountObligation: 'Sperrkonto / Treuhandkonto (escrow client account) segregated under Swiss banking legislation.',
    agentTypes: [
      'Immobilientreuhänder mit eidg. Fachausweis',
      'Immobilienvermarkter mit eidg. Fachausweis',
      'Immobilienbewerter mit eidg. Fachausweis',
      'Senior Real Estate Consultant'
    ],
    portals: [
      { name: 'Homegate.ch', url: 'https://www.homegate.ch' },
      { name: 'ImmoScout24 CH', url: 'https://www.immoscout24.ch' }
    ]
  },
  NL: {
    regBody: 'Nederlandse Vereniging van Makelaars (NVM) & VastgoedCert',
    licenseName: 'NVM / VastgoedCert Registratienummer',
    licensePlaceholder: 'NVM-REG-84920 / KRMT-4921',
    complianceAuth: 'Wwft & Stichting VastgoedCert Toezicht Makelaardij',
    statutoryAct: 'Wet ter voorkoming van witwassen en financieren van terrorisme (Wwft) & NVM Erecode',
    regulatoryRequirements: 'Certified real estate agents in the Netherlands are registered with Stichting VastgoedCert or NRVT (Nederlands Register Vastgoed Taxateurs) and hold NVM or VBO membership. Requires accredited Real Estate diploma (SVMNIVO), adherence to the NVM Code of Ethics (Erecode), compliance with mandatory Wwft client due diligence, and annual permanent education (PE).',
    licenseFormatDescription: 'NVM-REG-[5 Digits] / VastgoedCert Registration (e.g. KRMT-4921, RMT-84920).',
    renewalCycle: 'Annual VastgoedCert re-certification subject to mandatory permanent education (PE) points.',
    trustAccountObligation: 'Stichting Derdengelden (Escrow Foundation Account) or direct notary escrow management.',
    agentTypes: [
      'Register Makelaar-Taxateur (RMT / NVM)',
      'Kandidaat Register Makelaar-Taxateur (KRMT)',
      'Vastgoedadviseur Commercieel Vastgoed',
      'Gecertificeerd Woningtaxateur (NWWI)'
    ],
    portals: [
      { name: 'Funda', url: 'https://www.funda.nl' },
      { name: 'Pararius', url: 'https://www.pararius.nl' }
    ]
  },
  BE: {
    regBody: 'Beroepsinstituut van Vastgoedmakelaars (BIV / IPI)',
    licenseName: 'BIV / IPI Erkenningsnummer (Titulaire)',
    licensePlaceholder: 'BIV 509.821 / IPI Titulaire',
    complianceAuth: 'CFI-CTIF & Beroepsinstituut van Vastgoedmakelaars (BIV)',
    statutoryAct: 'Koninklijk Besluit van 6 september 1993 tot bescherming van de beroepstitel en van de uitoefening van het beroep van vastgoedmakelaar',
    regulatoryRequirements: 'Every real estate broker operating in Belgium must be an approved member of the Professional Institute of Real Estate Agents (BIV / IPI). Requires a recognized bachelor degree, passing the BIV proficiency test, completing a 1-year supervised professional internship (stage), passing the practical competence assessment, and holding mandatory collective professional insurance and financial guarantee.',
    licenseFormatDescription: 'BIV / IPI [6-Digit Accreditation #] (e.g. BIV 509.821).',
    renewalCycle: 'Continuous registration subject to annual institute subscription and mandatory 10h/year continuous training.',
    trustAccountObligation: 'Derdenrekening / Compte Tiers (Third-party trust account) under Article 21 of the BIV Code of Ethics.',
    agentTypes: [
      'Erkend Vastgoedmakelaar-Bemiddelaar (BIV/IPI)',
      'Erkend Vastgoedmakelaar-Syndicus',
      'Stagiair Vastgoedmakelaar (BIV Stage)',
      'Vastgoedexpert & Beëdigd Schatter'
    ],
    portals: [
      { name: 'Immoweb', url: 'https://www.immoweb.be' },
      { name: 'Immovlan', url: 'https://www.immovlan.be' }
    ]
  },
  QA: {
    regBody: 'Ministry of Justice - Real Estate Brokerage Department',
    licenseName: 'MOJ Real Estate Broker Card (بطاقة وسيط عقاري)',
    licensePlaceholder: 'Q-MOJ-REB-8492',
    complianceAuth: 'Qatar Financial Information Unit (QFIU) & MOJ Brokerage Dept',
    statutoryAct: 'Law No. 22 of 2017 Regulating Real Estate Brokerage Activities in the State of Qatar',
    regulatoryRequirements: 'All real estate brokers operating in Qatar must obtain an official Broker Card issued by the Real Estate Brokerage Department at the Ministry of Justice. Requires passing specialized training programs at the Centre for Legal and Judicial Studies, criminal background clearance, a designated registered office in Qatar, and mandatory electronic registration on the Sak real estate portal.',
    licenseFormatDescription: 'Q-MOJ-REB-[4-Digit Number] (e.g. Q-MOJ-REB-8492).',
    renewalCycle: 'Renewable every 2 years through the Ministry of Justice Sak portal.',
    trustAccountObligation: 'Regulated escrow account designated under Law No. 22 of 2017 for property deposits.',
    agentTypes: [
      'Certified Real Estate Broker (MOJ Licensed)',
      'Real Estate Office Managing Partner',
      'Commercial Property Consultant',
      'Real Estate Valuer (MOJ Certified)'
    ],
    portals: [
      { name: 'Property Finder Qatar', url: 'https://www.propertyfinder.qa' },
      { name: 'Qatar Living Properties', url: 'https://www.qatarliving.com/properties' }
    ]
  },
  NG: {
    regBody: 'Estate Surveyors and Valuers Registration Board of Nigeria (ESVARBON / NIESV)',
    licenseName: 'ESVARBON Registration & Practicing Licence #',
    licensePlaceholder: 'ESVARBON Reg No. A-4920',
    complianceAuth: 'Special Control Unit Against Money Laundering (SCUML) & ESVARBON',
    statutoryAct: 'Estate Surveyors and Valuers (Registration, etc.) Act Cap. E13 LFN 2007',
    regulatoryRequirements: 'Real estate practice and valuation in Nigeria are regulated by ESVARBON and the Nigerian Institution of Estate Surveyors and Valuers (NIESV). Registered Estate Surveyors and Valuers (ANIVS/FNIVS) must hold an annual practicing license and SCUML certificate issued by the EFCC for anti-money laundering compliance.',
    licenseFormatDescription: 'ESVARBON Reg No. [Letter Prefix]-[4 Digits] (e.g. ESVARBON Reg No. A-4920).',
    renewalCycle: 'Annual renewal of practicing license with mandatory MCPD (Mandatory Continuing Professional Development).',
    trustAccountObligation: 'Designated Client Account in accordance with ESVARBON Rules and Regulations.',
    agentTypes: [
      'Registered Estate Surveyor & Valuer (ANIVS/FNIVS)',
      'Licensed Real Estate Practitioner',
      'Principal Partner / Agency Head',
      'Property Rating & Valuation Consultant'
    ],
    portals: [
      { name: 'PropertyPro Nigeria', url: 'https://www.propertypro.ng' },
      { name: 'Nigeria Property Centre', url: 'https://www.nigeriapropertycentre.com' }
    ]
  },
  KE: {
    regBody: 'Estate Agents Registration Board (EARB / ISK)',
    licenseName: 'EARB Full Practicing Certificate # (Chapter 533)',
    licensePlaceholder: 'EARB Reg No. A/1294',
    complianceAuth: 'Financial Reporting Centre (FRC) & EARB Kenya Licensing',
    statutoryAct: 'Estate Agents Act Chapter 533 of the Laws of Kenya',
    regulatoryRequirements: 'All individuals practicing estate agency in Kenya must be registered with the Estate Agents Registration Board (EARB) under Cap 533. Requires a degree in Land Economics/Real Estate or full membership with the Institution of Surveyors of Kenya (MISK), a valid annual practicing certificate, and registration with the Financial Reporting Centre (FRC).',
    licenseFormatDescription: 'EARB Reg No. [Category]/[4-Digit Number] (e.g. EARB Reg No. A/1294).',
    renewalCycle: 'Annual practicing certificate renewal required before the 31st of December.',
    trustAccountObligation: 'Section 18 Statutory Clients Account maintained with a commercial bank in Kenya.',
    agentTypes: [
      'Registered Real Estate Agent (EARB / ISK)',
      'Full Member Institution of Surveyors of Kenya (MISK)',
      'Licensed Valuer and Estate Manager',
      'Senior Commercial Property Negotiator'
    ],
    portals: [
      { name: 'BuyRentKenya', url: 'https://www.buyrentkenya.com' },
      { name: 'Hauzisha', url: 'https://hauzisha.co.ke' }
    ]
  },
  MU: {
    regBody: 'Real Estate Association of Mauritius (REAM) & Economic Development Board (EDB)',
    licenseName: 'REAM Real Estate Agent Registration / Licence #',
    licensePlaceholder: 'REAM-MU-49201',
    complianceAuth: 'Financial Intelligence Unit (FIU Mauritius) & REAM Regulatory Code',
    statutoryAct: 'Real Estate Agent Authority Act & FIAMLA (Financial Intelligence and Anti-Money Laundering Act)',
    regulatoryRequirements: 'Estate agents operating in Mauritius and dealing with foreign investment schemes (IRS, RES, PDS, Smart Cities) must be registered with the Economic Development Board (EDB) and the Financial Intelligence Unit (FIU). Agents must comply with FIAMLA KYC/AML due diligence guidelines and hold valid professional liability insurance.',
    licenseFormatDescription: 'REAM-MU-[5 Digits] or EDB Property Practitioner License ID.',
    renewalCycle: 'Annual registration renewal with FIU compliance validation.',
    trustAccountObligation: 'Escrow account supervised under Mauritius Notarial Practice Regulations for deed settlements.',
    agentTypes: [
      'Licensed Real Estate Agent (REAM/EDB)',
      'IRS / RES / PDS Scheme Property Specialist',
      'Chartered Property Surveyor',
      'Senior Luxury Property Consultant'
    ],
    portals: [
      { name: 'Lexpress Property Mauritius', url: 'https://www.lexpressproperty.com' },
      { name: 'PropertyCloud Mauritius', url: 'https://www.propertycloud.mu' }
    ]
  },
  PH: {
    regBody: 'Professional Regulation Commission (PRC - Professional Regulatory Board of Real Estate)',
    licenseName: 'PRC Real Estate Broker License # (REBL)',
    licensePlaceholder: 'PRC REBL No. 0029182',
    complianceAuth: 'Anti-Money Laundering Council (AMLC) & PRC Real Estate Service Board',
    statutoryAct: 'Republic Act No. 9646 (Real Estate Service Act of the Philippines - RESA Law)',
    regulatoryRequirements: 'Real estate brokers in the Philippines must hold a valid PRC Real Estate Broker License (REBL) and Professional Identification Card issued by the Professional Regulation Commission. Requires a Bachelor of Science in Real Estate Management (BS REM), passing the PRC licensure board exam, holding a surety bond (minimum ₱20,000), and accreditation with the Accredited and Integrated Professional Organization (AIPO/PHILRES).',
    licenseFormatDescription: 'PRC REBL No. [7-Digit Registration Number] (e.g. PRC REBL No. 0029182).',
    renewalCycle: '3-year renewal cycle coinciding with the licensee’s birth month, subject to 45 CPD units.',
    trustAccountObligation: 'Designated escrow deposit account in compliance with PRC RESA fiduciary standards.',
    agentTypes: [
      'Licensed Real Estate Broker (PRC REBL)',
      'Accredited Real Estate Salesperson',
      'Licensed Real Estate Appraiser (PRC REA)',
      'Licensed Real Estate Consultant (PRC REC)'
    ],
    portals: [
      { name: 'Lamudi Philippines', url: 'https://www.lamudi.com.ph' },
      { name: 'Dot Property Philippines', url: 'https://www.dotproperty.com.ph' }
    ]
  },
  TR: {
    regBody: 'Taşınmaz Ticareti Bilgi Sistemi (TTBS / Ticaret Bakanlığı)',
    licenseName: 'Taşınmaz Ticareti Yetki Belgesi (TTBS Numarası)',
    licensePlaceholder: 'TTBS-3400192-2024',
    complianceAuth: 'MASAK Mali Suçları Araştırma Kurulu & Taşınmaz Ticareti Yönetmeliği',
    statutoryAct: 'Taşınmaz Ticareti Hakkında Yönetmelik (Resmî Gazete Sayı: 30442)',
    regulatoryRequirements: 'All real estate agencies and consultants in Turkey must hold a Taşınmaz Ticareti Yetki Belgesi (Real Estate Trade Authorization Certificate) issued by the Ministry of Trade via TTBS. Requires holding a Level 5 (Seviye 5) Vocational Qualification Certificate (MYK), minimum 100 hours of certified real estate training, tax registry, and clean judicial record.',
    licenseFormatDescription: 'TTBS-[Provincial Plate Code][7-Digit Authorization #] (e.g. TTBS-3400192-2024).',
    renewalCycle: 'Valid for 5 years from issuance, renewable via the Ministry of Trade TTBS portal.',
    trustAccountObligation: 'Mandatory escrow mechanisms (Tapu Takas / Takasbank) for safe title deed money transfers.',
    agentTypes: [
      'Yetki Belgeli Emlak Danışmanı (Seviye 5)',
      'Sorumlu Emlak Danışmanı (Seviye 5)',
      'Emlak İşletmesi Sahibi / Broker',
      'Gayrimenkul Değerleme Uzmanı (SPK Lisanslı)'
    ],
    portals: [
      { name: 'Sahibinden', url: 'https://www.sahibinden.com' },
      { name: 'Hepsiemlak', url: 'https://www.hepsiemlak.com' },
      { name: 'Zingat', url: 'https://www.zingat.com' }
    ]
  }
};

// Helper to resolve localized agent types for any country
function resolveAgentTypesForCountry(countryName: string, regBody: string, overrideTypes?: string[]): string[] {
  if (overrideTypes && overrideTypes.length > 0) {
    return overrideTypes;
  }
  return [
    `Principal Real Estate Practitioner (${regBody})`,
    `Licensed Real Estate Broker & Valuer (${countryName})`,
    `Certified Residential & Luxury Property Specialist`,
    `Commercial Investment & Cadastral Advisor`
  ];
}

// Helper to resolve specific license name for any country
function resolveLicenseNameForCountry(countryName: string, regBody: string, overrideName?: string): string {
  if (overrideName) {
    return overrideName;
  }
  return `${regBody} Practicing Licence / Registration #`;
}

// Helper to resolve sample license placeholder for any country
function resolveLicensePlaceholderForCountry(isoCode: string, overridePlaceholder?: string): string {
  if (overridePlaceholder) {
    return overridePlaceholder;
  }
  return `${isoCode}-REB-2024-884920`;
}

// Helper to convert compact array into full CountryOption objects
export function generateAll196CountryOptions(): CountryOption[] {
  return ALL_196_COUNTRIES_DATA.map((item) => {
    const [
      id, name, flag, currCode, currSym, currName,
      phoneDial, capital, regBody, landRegistry, titleIdName, suburbs
    ] = item;

    const override = SPECIFIC_COUNTRY_REGULATORY_MAP[id] || {};

    const effectiveRegBody = override.regBody || regBody;
    const effectiveLicenseName = resolveLicenseNameForCountry(name, effectiveRegBody, override.licenseName);
    const effectiveLicensePlaceholder = resolveLicensePlaceholderForCountry(id, override.licensePlaceholder);
    const effectiveComplianceAuth = override.complianceAuth || `${effectiveRegBody} & National Anti-Money Laundering (AML/CFT) Framework`;
    const effectiveAgentTypes = resolveAgentTypesForCountry(name, effectiveRegBody, override.agentTypes);

    const effectiveStatutoryAct = override.statutoryAct || `${effectiveRegBody} Statutory Real Estate Regulations & National Property Code`;
    const effectiveRequirements = override.regulatoryRequirements || `Practitioners operating in ${name} must hold a valid practicing authorization issued by ${effectiveRegBody}. Real estate agents must maintain compliant fiduciary practices, adhere to the national property code, and satisfy mandatory identification verification and Anti-Money Laundering (AML/CFT) screening for all property transactions.`;
    const effectiveLicenseFormatDesc = override.licenseFormatDescription || `Official ${effectiveRegBody} Practitioner License / Registration Number (e.g. ${effectiveLicensePlaceholder}).`;
    const effectiveRenewalCycle = override.renewalCycle || `Periodic regulatory renewal subject to professional standing and license validation with ${effectiveRegBody}.`;
    const effectiveTrustObligation = override.trustAccountObligation || `Fiduciary client escrow or designated trust funds repository in compliance with national banking standards.`;

    const effectivePortals = override.portals || [
      { name: `${name} National Property Portal`, url: `https://www.google.com/search?q=${encodeURIComponent(name + ' real estate property portal listings')}` },
      { name: `${capital} Luxury Real Estate Directory`, url: `https://www.google.com/search?q=${encodeURIComponent(capital + ' ' + name + ' real estate properties for sale')}` }
    ];

    const cityOption: CityTownOption = {
      id: `${id}-CITY-1`,
      name: `${capital} & Metropolitan Districts`,
      suburbs: suburbs,
      deedsOffice: landRegistry.toUpperCase(),
      municipality: `Municipality of ${capital}`,
      coordinates: {
        lat: 0,
        lng: 0,
        zoom: 14
      },
      properties: []
    };

    const provinceOption: ProvinceStateOption = {
      id: `${id}-PROV-1`,
      name: `${capital} Region / State`,
      code: `${id}-1`,
      cities: [cityOption]
    };

    return {
      id,
      name,
      code: id,
      flag,
      currency: {
        code: currCode,
        symbol: currSym,
        name: currName
      },
      landRegistryAuthority: landRegistry,
      legalIdentifierName: titleIdName,
      provincesOrStatesLabel: 'Provinces / States / Counties',
      citiesLabel: 'Cities / Metropolitan Municipalities',
      phoneDialCode: phoneDial,
      phonePlaceholder: `${phoneDial} 123 456 789`,
      idNumberPlaceholder: `${name} National ID / Passport Number`,
      idFormatHint: `Enter valid Identification or Passport in ${name}`,
      regulatoryBody: effectiveRegBody,
      ffcLicenseName: effectiveLicenseName,
      ffcLicensePlaceholder: effectiveLicensePlaceholder,
      statutoryAct: effectiveStatutoryAct,
      regulatoryRequirements: effectiveRequirements,
      licenseFormatDescription: effectiveLicenseFormatDesc,
      renewalCycle: effectiveRenewalCycle,
      trustAccountObligation: effectiveTrustObligation,
      defaultDateFormat: id === 'US' ? 'MM/DD/YYYY' : id === 'ZA' ? 'YYYY/MM/DD' : 'DD/MM/YYYY',
      defaultUnit: id === 'US' ? 'Imperial (sq ft)' : 'Metric (m²)',
      complianceAuthorityName: effectiveComplianceAuth,
      agentTypeOptions: effectiveAgentTypes,
      majorPortals: effectivePortals,
      provinces: [provinceOption]
    };
  });
}
