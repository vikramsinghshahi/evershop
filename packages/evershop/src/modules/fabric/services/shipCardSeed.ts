/** Seeded from zones.csv and rate.csv. Admin edits live in the database. */
export interface ShipCountrySeed { countryCode: string; countryName: string; zone: number }
export interface ShipRateSeed { band: 'slab' | 'per_kg'; weightKg: number; zone: number; amountInr: number }
export const SHIP_COUNTRIES: ShipCountrySeed[] = [
  {
    "countryCode": "AD",
    "countryName": "Andorra",
    "zone": 8
  },
  {
    "countryCode": "AE",
    "countryName": "United Arab Emirates",
    "zone": 1
  },
  {
    "countryCode": "AF",
    "countryName": "Afghanistan",
    "zone": 11
  },
  {
    "countryCode": "AG",
    "countryName": "Antigua and Barbuda",
    "zone": 10
  },
  {
    "countryCode": "AI",
    "countryName": "Anguilla",
    "zone": 10
  },
  {
    "countryCode": "AL",
    "countryName": "Albania",
    "zone": 11
  },
  {
    "countryCode": "AM",
    "countryName": "Armenia",
    "zone": 11
  },
  {
    "countryCode": "AN",
    "countryName": "Netherlands Antilles",
    "zone": 10
  },
  {
    "countryCode": "AO",
    "countryName": "Angola",
    "zone": 11
  },
  {
    "countryCode": "AR",
    "countryName": "Argentina",
    "zone": 10
  },
  {
    "countryCode": "AS",
    "countryName": "American Samoa",
    "zone": 9
  },
  {
    "countryCode": "AT",
    "countryName": "Austria",
    "zone": 7
  },
  {
    "countryCode": "AU",
    "countryName": "Australia",
    "zone": 6
  },
  {
    "countryCode": "AW",
    "countryName": "Aruba",
    "zone": 10
  },
  {
    "countryCode": "AZ",
    "countryName": "Azerbaijan",
    "zone": 11
  },
  {
    "countryCode": "BA",
    "countryName": "Bosnia and Herzegovina",
    "zone": 11
  },
  {
    "countryCode": "BB",
    "countryName": "Barbados",
    "zone": 10
  },
  {
    "countryCode": "BD",
    "countryName": "Bangladesh",
    "zone": 1
  },
  {
    "countryCode": "BE",
    "countryName": "Belgium",
    "zone": 7
  },
  {
    "countryCode": "BF",
    "countryName": "Burkina Faso",
    "zone": 11
  },
  {
    "countryCode": "BG",
    "countryName": "Bulgaria",
    "zone": 8
  },
  {
    "countryCode": "BH",
    "countryName": "Bahrain",
    "zone": 4
  },
  {
    "countryCode": "BI",
    "countryName": "Burundi",
    "zone": 11
  },
  {
    "countryCode": "BJ",
    "countryName": "Benin",
    "zone": 11
  },
  {
    "countryCode": "BL",
    "countryName": "Saint Barthélemy",
    "zone": 10
  },
  {
    "countryCode": "BM",
    "countryName": "Bermuda",
    "zone": 10
  },
  {
    "countryCode": "BN",
    "countryName": "Brunei",
    "zone": 11
  },
  {
    "countryCode": "BO",
    "countryName": "Bolivia",
    "zone": 10
  },
  {
    "countryCode": "BQ",
    "countryName": "Bonaire, Sint Eustatius and Saba",
    "zone": 10
  },
  {
    "countryCode": "BR",
    "countryName": "Brazil",
    "zone": 10
  },
  {
    "countryCode": "BS",
    "countryName": "Bahamas",
    "zone": 10
  },
  {
    "countryCode": "BT",
    "countryName": "Bhutan",
    "zone": 1
  },
  {
    "countryCode": "BW",
    "countryName": "Botswana",
    "zone": 11
  },
  {
    "countryCode": "BY",
    "countryName": "Belarus",
    "zone": 8
  },
  {
    "countryCode": "BZ",
    "countryName": "Belize",
    "zone": 10
  },
  {
    "countryCode": "CA",
    "countryName": "Canada",
    "zone": 12
  },
  {
    "countryCode": "CD",
    "countryName": "Congo - Kinshasa",
    "zone": 11
  },
  {
    "countryCode": "CF",
    "countryName": "Central African Republic",
    "zone": 11
  },
  {
    "countryCode": "CG",
    "countryName": "Congo - Brazzaville",
    "zone": 11
  },
  {
    "countryCode": "CH",
    "countryName": "Switzerland",
    "zone": 7
  },
  {
    "countryCode": "CI",
    "countryName": "Côte d’Ivoire",
    "zone": 11
  },
  {
    "countryCode": "CK",
    "countryName": "Cook Islands",
    "zone": 11
  },
  {
    "countryCode": "CL",
    "countryName": "Chile",
    "zone": 10
  },
  {
    "countryCode": "CM",
    "countryName": "Cameroon",
    "zone": 11
  },
  {
    "countryCode": "CN",
    "countryName": "China",
    "zone": 3
  },
  {
    "countryCode": "CO",
    "countryName": "Colombia",
    "zone": 10
  },
  {
    "countryCode": "CR",
    "countryName": "Costa Rica",
    "zone": 10
  },
  {
    "countryCode": "CU",
    "countryName": "Cuba",
    "zone": 10
  },
  {
    "countryCode": "CV",
    "countryName": "Cape Verde",
    "zone": 11
  },
  {
    "countryCode": "CW",
    "countryName": "Curaçao",
    "zone": 10
  },
  {
    "countryCode": "CY",
    "countryName": "Cyprus",
    "zone": 11
  },
  {
    "countryCode": "CZ",
    "countryName": "Czech Republic",
    "zone": 8
  },
  {
    "countryCode": "DE",
    "countryName": "Germany",
    "zone": 7
  },
  {
    "countryCode": "DJ",
    "countryName": "Djibouti",
    "zone": 11
  },
  {
    "countryCode": "DK",
    "countryName": "Denmark",
    "zone": 7
  },
  {
    "countryCode": "DM",
    "countryName": "Dominica",
    "zone": 10
  },
  {
    "countryCode": "DO",
    "countryName": "Dominican Republic",
    "zone": 10
  },
  {
    "countryCode": "DZ",
    "countryName": "Algeria",
    "zone": 11
  },
  {
    "countryCode": "EC",
    "countryName": "Ecuador",
    "zone": 10
  },
  {
    "countryCode": "EE",
    "countryName": "Estonia",
    "zone": 8
  },
  {
    "countryCode": "EG",
    "countryName": "Egypt",
    "zone": 13
  },
  {
    "countryCode": "ER",
    "countryName": "Eritrea",
    "zone": 11
  },
  {
    "countryCode": "ES",
    "countryName": "Spain",
    "zone": 7
  },
  {
    "countryCode": "ET",
    "countryName": "Ethiopia",
    "zone": 11
  },
  {
    "countryCode": "FI",
    "countryName": "Finland",
    "zone": 7
  },
  {
    "countryCode": "FJ",
    "countryName": "Fiji",
    "zone": 11
  },
  {
    "countryCode": "FK",
    "countryName": "Falkland Islands",
    "zone": 10
  },
  {
    "countryCode": "FM",
    "countryName": "Micronesia",
    "zone": 11
  },
  {
    "countryCode": "FO",
    "countryName": "Faroe Islands",
    "zone": 8
  },
  {
    "countryCode": "FR",
    "countryName": "France",
    "zone": 7
  },
  {
    "countryCode": "GA",
    "countryName": "Gabon",
    "zone": 11
  },
  {
    "countryCode": "GB",
    "countryName": "United Kingdom",
    "zone": 7
  },
  {
    "countryCode": "GD",
    "countryName": "Grenada",
    "zone": 10
  },
  {
    "countryCode": "GE",
    "countryName": "Georgia",
    "zone": 11
  },
  {
    "countryCode": "GF",
    "countryName": "French Guiana",
    "zone": 10
  },
  {
    "countryCode": "GG",
    "countryName": "Guernsey",
    "zone": 8
  },
  {
    "countryCode": "GH",
    "countryName": "Ghana",
    "zone": 13
  },
  {
    "countryCode": "GI",
    "countryName": "Gibraltar",
    "zone": 8
  },
  {
    "countryCode": "GL",
    "countryName": "Greenland",
    "zone": 8
  },
  {
    "countryCode": "GM",
    "countryName": "Gambia",
    "zone": 11
  },
  {
    "countryCode": "GN",
    "countryName": "Guinea",
    "zone": 11
  },
  {
    "countryCode": "GP",
    "countryName": "Guadeloupe",
    "zone": 10
  },
  {
    "countryCode": "GQ",
    "countryName": "Equatorial Guinea",
    "zone": 11
  },
  {
    "countryCode": "GR",
    "countryName": "Greece",
    "zone": 7
  },
  {
    "countryCode": "GT",
    "countryName": "Guatemala",
    "zone": 10
  },
  {
    "countryCode": "GU",
    "countryName": "Guam",
    "zone": 9
  },
  {
    "countryCode": "GW",
    "countryName": "Guinea-Bissau",
    "zone": 11
  },
  {
    "countryCode": "GY",
    "countryName": "Guyana",
    "zone": 10
  },
  {
    "countryCode": "HK",
    "countryName": "Hong Kong SAR China",
    "zone": 2
  },
  {
    "countryCode": "HN",
    "countryName": "Honduras",
    "zone": 10
  },
  {
    "countryCode": "HR",
    "countryName": "Croatia",
    "zone": 8
  },
  {
    "countryCode": "HT",
    "countryName": "Haiti",
    "zone": 10
  },
  {
    "countryCode": "HU",
    "countryName": "Hungary",
    "zone": 8
  },
  {
    "countryCode": "ID",
    "countryName": "Indonesia",
    "zone": 5
  },
  {
    "countryCode": "IE",
    "countryName": "Ireland",
    "zone": 7
  },
  {
    "countryCode": "IL",
    "countryName": "Israel",
    "zone": 8
  },
  {
    "countryCode": "IQ",
    "countryName": "Iraq",
    "zone": 11
  },
  {
    "countryCode": "IR",
    "countryName": "Iran",
    "zone": 11
  },
  {
    "countryCode": "IS",
    "countryName": "Iceland",
    "zone": 8
  },
  {
    "countryCode": "IT",
    "countryName": "Italy",
    "zone": 7
  },
  {
    "countryCode": "JE",
    "countryName": "Jersey",
    "zone": 8
  },
  {
    "countryCode": "JM",
    "countryName": "Jamaica",
    "zone": 10
  },
  {
    "countryCode": "JO",
    "countryName": "Jordan",
    "zone": 4
  },
  {
    "countryCode": "JP",
    "countryName": "Japan",
    "zone": 13
  },
  {
    "countryCode": "KE",
    "countryName": "Kenya",
    "zone": 13
  },
  {
    "countryCode": "KG",
    "countryName": "Kyrgyzstan",
    "zone": 11
  },
  {
    "countryCode": "KH",
    "countryName": "Cambodia",
    "zone": 11
  },
  {
    "countryCode": "KI",
    "countryName": "Kiribati",
    "zone": 11
  },
  {
    "countryCode": "KM",
    "countryName": "Comoros",
    "zone": 11
  },
  {
    "countryCode": "KN",
    "countryName": "Saint Kitts and Nevis",
    "zone": 10
  },
  {
    "countryCode": "KP",
    "countryName": "North Korea",
    "zone": 11
  },
  {
    "countryCode": "KR",
    "countryName": "South Korea",
    "zone": 11
  },
  {
    "countryCode": "KW",
    "countryName": "Kuwait",
    "zone": 4
  },
  {
    "countryCode": "KY",
    "countryName": "Cayman Islands",
    "zone": 10
  },
  {
    "countryCode": "KZ",
    "countryName": "Kazakhstan",
    "zone": 11
  },
  {
    "countryCode": "LA",
    "countryName": "Laos",
    "zone": 11
  },
  {
    "countryCode": "LB",
    "countryName": "Lebanon",
    "zone": 11
  },
  {
    "countryCode": "LC",
    "countryName": "Saint Lucia",
    "zone": 10
  },
  {
    "countryCode": "LI",
    "countryName": "Liechtenstein",
    "zone": 7
  },
  {
    "countryCode": "LK",
    "countryName": "Sri Lanka",
    "zone": 1
  },
  {
    "countryCode": "LR",
    "countryName": "Liberia",
    "zone": 11
  },
  {
    "countryCode": "LS",
    "countryName": "Lesotho",
    "zone": 11
  },
  {
    "countryCode": "LT",
    "countryName": "Lithuania",
    "zone": 8
  },
  {
    "countryCode": "LU",
    "countryName": "Luxembourg",
    "zone": 7
  },
  {
    "countryCode": "LV",
    "countryName": "Latvia",
    "zone": 8
  },
  {
    "countryCode": "LY",
    "countryName": "Libya",
    "zone": 11
  },
  {
    "countryCode": "MA",
    "countryName": "Morocco",
    "zone": 11
  },
  {
    "countryCode": "MC",
    "countryName": "Monaco",
    "zone": 7
  },
  {
    "countryCode": "MD",
    "countryName": "Moldova",
    "zone": 11
  },
  {
    "countryCode": "ME",
    "countryName": "Montenegro",
    "zone": 11
  },
  {
    "countryCode": "MG",
    "countryName": "Madagascar",
    "zone": 11
  },
  {
    "countryCode": "MH",
    "countryName": "Marshall Islands",
    "zone": 9
  },
  {
    "countryCode": "MK",
    "countryName": "Macedonia",
    "zone": 11
  },
  {
    "countryCode": "ML",
    "countryName": "Mali",
    "zone": 11
  },
  {
    "countryCode": "MM",
    "countryName": "Myanmar [Burma]",
    "zone": 11
  },
  {
    "countryCode": "MN",
    "countryName": "Mongolia",
    "zone": 11
  },
  {
    "countryCode": "MO",
    "countryName": "Macau SAR China",
    "zone": 5
  },
  {
    "countryCode": "MP",
    "countryName": "Northern Mariana Islands",
    "zone": 9
  },
  {
    "countryCode": "MQ",
    "countryName": "Martinique",
    "zone": 10
  },
  {
    "countryCode": "MR",
    "countryName": "Mauritania",
    "zone": 11
  },
  {
    "countryCode": "MS",
    "countryName": "Montserrat",
    "zone": 10
  },
  {
    "countryCode": "MT",
    "countryName": "Malta",
    "zone": 8
  },
  {
    "countryCode": "MU",
    "countryName": "Mauritius",
    "zone": 13
  },
  {
    "countryCode": "MV",
    "countryName": "Maldives",
    "zone": 11
  },
  {
    "countryCode": "MW",
    "countryName": "Malawi",
    "zone": 11
  },
  {
    "countryCode": "MX",
    "countryName": "Mexico",
    "zone": 12
  },
  {
    "countryCode": "MY",
    "countryName": "Malaysia",
    "zone": 2
  },
  {
    "countryCode": "MZ",
    "countryName": "Mozambique",
    "zone": 11
  },
  {
    "countryCode": "NA",
    "countryName": "Namibia",
    "zone": 11
  },
  {
    "countryCode": "NC",
    "countryName": "New Caledonia",
    "zone": 11
  },
  {
    "countryCode": "NE",
    "countryName": "Niger",
    "zone": 11
  },
  {
    "countryCode": "NG",
    "countryName": "Nigeria",
    "zone": 11
  },
  {
    "countryCode": "NI",
    "countryName": "Nicaragua",
    "zone": 10
  },
  {
    "countryCode": "NL",
    "countryName": "Netherlands",
    "zone": 7
  },
  {
    "countryCode": "NO",
    "countryName": "Norway",
    "zone": 7
  },
  {
    "countryCode": "NP",
    "countryName": "Nepal",
    "zone": 3
  },
  {
    "countryCode": "NR",
    "countryName": "Nauru",
    "zone": 11
  },
  {
    "countryCode": "NU",
    "countryName": "Niue",
    "zone": 11
  },
  {
    "countryCode": "NZ",
    "countryName": "New Zealand",
    "zone": 11
  },
  {
    "countryCode": "OM",
    "countryName": "Oman",
    "zone": 4
  },
  {
    "countryCode": "PA",
    "countryName": "Panama",
    "zone": 10
  },
  {
    "countryCode": "PE",
    "countryName": "Peru",
    "zone": 10
  },
  {
    "countryCode": "PF",
    "countryName": "French Polynesia",
    "zone": 11
  },
  {
    "countryCode": "PG",
    "countryName": "Papua New Guinea",
    "zone": 11
  },
  {
    "countryCode": "PH",
    "countryName": "Philippines",
    "zone": 5
  },
  {
    "countryCode": "PK",
    "countryName": "Pakistan",
    "zone": 11
  },
  {
    "countryCode": "PL",
    "countryName": "Poland",
    "zone": 8
  },
  {
    "countryCode": "PR",
    "countryName": "Puerto Rico",
    "zone": 12
  },
  {
    "countryCode": "PT",
    "countryName": "Portugal",
    "zone": 7
  },
  {
    "countryCode": "PW",
    "countryName": "Palau",
    "zone": 11
  },
  {
    "countryCode": "PY",
    "countryName": "Paraguay",
    "zone": 10
  },
  {
    "countryCode": "QA",
    "countryName": "Qatar",
    "zone": 4
  },
  {
    "countryCode": "RE",
    "countryName": "Réunion",
    "zone": 11
  },
  {
    "countryCode": "RO",
    "countryName": "Romania",
    "zone": 8
  },
  {
    "countryCode": "RS",
    "countryName": "Serbia",
    "zone": 11
  },
  {
    "countryCode": "RU",
    "countryName": "Russia",
    "zone": 8
  },
  {
    "countryCode": "RW",
    "countryName": "Rwanda",
    "zone": 11
  },
  {
    "countryCode": "SA",
    "countryName": "Saudi Arabia",
    "zone": 4
  },
  {
    "countryCode": "SB",
    "countryName": "Solomon Islands",
    "zone": 11
  },
  {
    "countryCode": "SC",
    "countryName": "Seychelles",
    "zone": 11
  },
  {
    "countryCode": "SD",
    "countryName": "Sudan",
    "zone": 11
  },
  {
    "countryCode": "SE",
    "countryName": "Sweden",
    "zone": 7
  },
  {
    "countryCode": "SG",
    "countryName": "Singapore",
    "zone": 2
  },
  {
    "countryCode": "SH",
    "countryName": "Saint Helena",
    "zone": 11
  },
  {
    "countryCode": "SI",
    "countryName": "Slovenia",
    "zone": 8
  },
  {
    "countryCode": "SK",
    "countryName": "Slovakia",
    "zone": 8
  },
  {
    "countryCode": "SL",
    "countryName": "Sierra Leone",
    "zone": 11
  },
  {
    "countryCode": "SM",
    "countryName": "San Marino",
    "zone": 11
  },
  {
    "countryCode": "SN",
    "countryName": "Senegal",
    "zone": 11
  },
  {
    "countryCode": "SO",
    "countryName": "Somalia",
    "zone": 11
  },
  {
    "countryCode": "SR",
    "countryName": "Suriname",
    "zone": 10
  },
  {
    "countryCode": "SS",
    "countryName": "South Sudan",
    "zone": 11
  },
  {
    "countryCode": "ST",
    "countryName": "São Tomé and Príncipe",
    "zone": 11
  },
  {
    "countryCode": "SV",
    "countryName": "El Salvador",
    "zone": 10
  },
  {
    "countryCode": "SX",
    "countryName": "Sint Maarten",
    "zone": 10
  },
  {
    "countryCode": "SY",
    "countryName": "Syria",
    "zone": 11
  },
  {
    "countryCode": "SZ",
    "countryName": "Swaziland",
    "zone": 11
  },
  {
    "countryCode": "TC",
    "countryName": "Turks and Caicos Islands",
    "zone": 10
  },
  {
    "countryCode": "TD",
    "countryName": "Chad",
    "zone": 11
  },
  {
    "countryCode": "TG",
    "countryName": "Togo",
    "zone": 11
  },
  {
    "countryCode": "TH",
    "countryName": "Thailand",
    "zone": 5
  },
  {
    "countryCode": "TJ",
    "countryName": "Tajikistan",
    "zone": 11
  },
  {
    "countryCode": "TL",
    "countryName": "Timor-Leste",
    "zone": 11
  },
  {
    "countryCode": "TM",
    "countryName": "Turkmenistan",
    "zone": 11
  },
  {
    "countryCode": "TN",
    "countryName": "Tunisia",
    "zone": 11
  },
  {
    "countryCode": "TO",
    "countryName": "Tonga",
    "zone": 11
  },
  {
    "countryCode": "TR",
    "countryName": "Turkey",
    "zone": 7
  },
  {
    "countryCode": "TT",
    "countryName": "Trinidad and Tobago",
    "zone": 10
  },
  {
    "countryCode": "TV",
    "countryName": "Tuvalu",
    "zone": 11
  },
  {
    "countryCode": "TW",
    "countryName": "Taiwan",
    "zone": 5
  },
  {
    "countryCode": "TZ",
    "countryName": "Tanzania",
    "zone": 13
  },
  {
    "countryCode": "UA",
    "countryName": "Ukraine",
    "zone": 11
  },
  {
    "countryCode": "UG",
    "countryName": "Uganda",
    "zone": 13
  },
  {
    "countryCode": "US",
    "countryName": "United States",
    "zone": 12
  },
  {
    "countryCode": "UY",
    "countryName": "Uruguay",
    "zone": 10
  },
  {
    "countryCode": "UZ",
    "countryName": "Uzbekistan",
    "zone": 11
  },
  {
    "countryCode": "VA",
    "countryName": "Vatican City",
    "zone": 7
  },
  {
    "countryCode": "VC",
    "countryName": "Saint Vincent and the Grenadines",
    "zone": 10
  },
  {
    "countryCode": "VE",
    "countryName": "Venezuela",
    "zone": 10
  },
  {
    "countryCode": "VG",
    "countryName": "British Virgin Islands",
    "zone": 10
  },
  {
    "countryCode": "VI",
    "countryName": "U.S. Virgin Islands",
    "zone": 9
  },
  {
    "countryCode": "VN",
    "countryName": "Vietnam",
    "zone": 5
  },
  {
    "countryCode": "VU",
    "countryName": "Vanuatu",
    "zone": 11
  },
  {
    "countryCode": "WS",
    "countryName": "Samoa",
    "zone": 11
  },
  {
    "countryCode": "XK",
    "countryName": "Kosovo",
    "zone": 11
  },
  {
    "countryCode": "YE",
    "countryName": "Yemen",
    "zone": 11
  },
  {
    "countryCode": "YT",
    "countryName": "Mayotte",
    "zone": 11
  },
  {
    "countryCode": "ZA",
    "countryName": "South Africa",
    "zone": 13
  },
  {
    "countryCode": "ZM",
    "countryName": "Zambia",
    "zone": 11
  },
  {
    "countryCode": "ZW",
    "countryName": "Zimbabwe",
    "zone": 11
  }
];
export const SHIP_RATES: ShipRateSeed[] = [{"band":"slab","weightKg":0.5,"zone":1,"amountInr":521},{"band":"slab","weightKg":0.5,"zone":2,"amountInr":688},{"band":"slab","weightKg":0.5,"zone":3,"amountInr":724},{"band":"slab","weightKg":0.5,"zone":4,"amountInr":754},{"band":"slab","weightKg":0.5,"zone":5,"amountInr":1134},{"band":"slab","weightKg":0.5,"zone":6,"amountInr":847},{"band":"slab","weightKg":0.5,"zone":7,"amountInr":988},{"band":"slab","weightKg":0.5,"zone":8,"amountInr":2706},{"band":"slab","weightKg":0.5,"zone":9,"amountInr":2793},{"band":"slab","weightKg":0.5,"zone":10,"amountInr":2484},{"band":"slab","weightKg":0.5,"zone":11,"amountInr":2732},{"band":"slab","weightKg":0.5,"zone":12,"amountInr":1270},{"band":"slab","weightKg":0.5,"zone":13,"amountInr":1716},{"band":"slab","weightKg":1,"zone":1,"amountInr":678},{"band":"slab","weightKg":1,"zone":2,"amountInr":850},{"band":"slab","weightKg":1,"zone":3,"amountInr":904},{"band":"slab","weightKg":1,"zone":4,"amountInr":930},{"band":"slab","weightKg":1,"zone":5,"amountInr":1419},{"band":"slab","weightKg":1,"zone":6,"amountInr":1033},{"band":"slab","weightKg":1,"zone":7,"amountInr":1141},{"band":"slab","weightKg":1,"zone":8,"amountInr":3312},{"band":"slab","weightKg":1,"zone":9,"amountInr":3228},{"band":"slab","weightKg":1,"zone":10,"amountInr":3278},{"band":"slab","weightKg":1,"zone":11,"amountInr":3389},{"band":"slab","weightKg":1,"zone":12,"amountInr":1467},{"band":"slab","weightKg":1,"zone":13,"amountInr":2090},{"band":"slab","weightKg":1.5,"zone":1,"amountInr":780},{"band":"slab","weightKg":1.5,"zone":2,"amountInr":981},{"band":"slab","weightKg":1.5,"zone":3,"amountInr":1391},{"band":"slab","weightKg":1.5,"zone":4,"amountInr":1071},{"band":"slab","weightKg":1.5,"zone":5,"amountInr":1631},{"band":"slab","weightKg":1.5,"zone":6,"amountInr":1220},{"band":"slab","weightKg":1.5,"zone":7,"amountInr":1424},{"band":"slab","weightKg":1.5,"zone":8,"amountInr":3769},{"band":"slab","weightKg":1.5,"zone":9,"amountInr":3664},{"band":"slab","weightKg":1.5,"zone":10,"amountInr":3720},{"band":"slab","weightKg":1.5,"zone":11,"amountInr":3915},{"band":"slab","weightKg":1.5,"zone":12,"amountInr":1865},{"band":"slab","weightKg":1.5,"zone":13,"amountInr":2452},{"band":"slab","weightKg":2,"zone":1,"amountInr":882},{"band":"slab","weightKg":2,"zone":2,"amountInr":1111},{"band":"slab","weightKg":2,"zone":3,"amountInr":1577},{"band":"slab","weightKg":2,"zone":4,"amountInr":1213},{"band":"slab","weightKg":2,"zone":5,"amountInr":1843},{"band":"slab","weightKg":2,"zone":6,"amountInr":1407},{"band":"slab","weightKg":2,"zone":7,"amountInr":1593},{"band":"slab","weightKg":2,"zone":8,"amountInr":4225},{"band":"slab","weightKg":2,"zone":9,"amountInr":4100},{"band":"slab","weightKg":2,"zone":10,"amountInr":4162},{"band":"slab","weightKg":2,"zone":11,"amountInr":4440},{"band":"slab","weightKg":2,"zone":12,"amountInr":2087},{"band":"slab","weightKg":2,"zone":13,"amountInr":2819},{"band":"slab","weightKg":2.5,"zone":1,"amountInr":1181},{"band":"slab","weightKg":2.5,"zone":2,"amountInr":1241},{"band":"slab","weightKg":2.5,"zone":3,"amountInr":1764},{"band":"slab","weightKg":2.5,"zone":4,"amountInr":1355},{"band":"slab","weightKg":2.5,"zone":5,"amountInr":2056},{"band":"slab","weightKg":2.5,"zone":6,"amountInr":1594},{"band":"slab","weightKg":2.5,"zone":7,"amountInr":1762},{"band":"slab","weightKg":2.5,"zone":8,"amountInr":4675},{"band":"slab","weightKg":2.5,"zone":9,"amountInr":4536},{"band":"slab","weightKg":2.5,"zone":10,"amountInr":4605},{"band":"slab","weightKg":2.5,"zone":11,"amountInr":4966},{"band":"slab","weightKg":2.5,"zone":12,"amountInr":2309},{"band":"slab","weightKg":2.5,"zone":13,"amountInr":3194},{"band":"slab","weightKg":3,"zone":1,"amountInr":1275},{"band":"slab","weightKg":3,"zone":2,"amountInr":1786},{"band":"slab","weightKg":3,"zone":3,"amountInr":2397},{"band":"slab","weightKg":3,"zone":4,"amountInr":1960},{"band":"slab","weightKg":3,"zone":5,"amountInr":2230},{"band":"slab","weightKg":3,"zone":6,"amountInr":2351},{"band":"slab","weightKg":3,"zone":7,"amountInr":2180},{"band":"slab","weightKg":3,"zone":8,"amountInr":5131},{"band":"slab","weightKg":3,"zone":9,"amountInr":4943},{"band":"slab","weightKg":3,"zone":10,"amountInr":5009},{"band":"slab","weightKg":3,"zone":11,"amountInr":5460},{"band":"slab","weightKg":3,"zone":12,"amountInr":3055},{"band":"slab","weightKg":3,"zone":13,"amountInr":3500},{"band":"slab","weightKg":3.5,"zone":1,"amountInr":1369},{"band":"slab","weightKg":3.5,"zone":2,"amountInr":1917},{"band":"slab","weightKg":3.5,"zone":3,"amountInr":2589},{"band":"slab","weightKg":3.5,"zone":4,"amountInr":2114},{"band":"slab","weightKg":3.5,"zone":5,"amountInr":2404},{"band":"slab","weightKg":3.5,"zone":6,"amountInr":2488},{"band":"slab","weightKg":3.5,"zone":7,"amountInr":2357},{"band":"slab","weightKg":3.5,"zone":8,"amountInr":5587},{"band":"slab","weightKg":3.5,"zone":9,"amountInr":5350},{"band":"slab","weightKg":3.5,"zone":10,"amountInr":5413},{"band":"slab","weightKg":3.5,"zone":11,"amountInr":5953},{"band":"slab","weightKg":3.5,"zone":12,"amountInr":3307},{"band":"slab","weightKg":3.5,"zone":13,"amountInr":3804},{"band":"slab","weightKg":4,"zone":1,"amountInr":1464},{"band":"slab","weightKg":4,"zone":2,"amountInr":2049},{"band":"slab","weightKg":4,"zone":3,"amountInr":2781},{"band":"slab","weightKg":4,"zone":4,"amountInr":2267},{"band":"slab","weightKg":4,"zone":5,"amountInr":2578},{"band":"slab","weightKg":4,"zone":6,"amountInr":2626},{"band":"slab","weightKg":4,"zone":7,"amountInr":2534},{"band":"slab","weightKg":4,"zone":8,"amountInr":6043},{"band":"slab","weightKg":4,"zone":9,"amountInr":5757},{"band":"slab","weightKg":4,"zone":10,"amountInr":5817},{"band":"slab","weightKg":4,"zone":11,"amountInr":6447},{"band":"slab","weightKg":4,"zone":12,"amountInr":3559},{"band":"slab","weightKg":4,"zone":13,"amountInr":4090},{"band":"slab","weightKg":4.5,"zone":1,"amountInr":1558},{"band":"slab","weightKg":4.5,"zone":2,"amountInr":2180},{"band":"slab","weightKg":4.5,"zone":3,"amountInr":2973},{"band":"slab","weightKg":4.5,"zone":4,"amountInr":2421},{"band":"slab","weightKg":4.5,"zone":5,"amountInr":2752},{"band":"slab","weightKg":4.5,"zone":6,"amountInr":2763},{"band":"slab","weightKg":4.5,"zone":7,"amountInr":2712},{"band":"slab","weightKg":4.5,"zone":8,"amountInr":6499},{"band":"slab","weightKg":4.5,"zone":9,"amountInr":6164},{"band":"slab","weightKg":4.5,"zone":10,"amountInr":6222},{"band":"slab","weightKg":4.5,"zone":11,"amountInr":6940},{"band":"slab","weightKg":4.5,"zone":12,"amountInr":3810},{"band":"slab","weightKg":4.5,"zone":13,"amountInr":4387},{"band":"slab","weightKg":5,"zone":1,"amountInr":1652},{"band":"slab","weightKg":5,"zone":2,"amountInr":2311},{"band":"slab","weightKg":5,"zone":3,"amountInr":3165},{"band":"slab","weightKg":5,"zone":4,"amountInr":2575},{"band":"slab","weightKg":5,"zone":5,"amountInr":2926},{"band":"slab","weightKg":5,"zone":6,"amountInr":2901},{"band":"slab","weightKg":5,"zone":7,"amountInr":2889},{"band":"slab","weightKg":5,"zone":8,"amountInr":6955},{"band":"slab","weightKg":5,"zone":9,"amountInr":6570},{"band":"slab","weightKg":5,"zone":10,"amountInr":6626},{"band":"slab","weightKg":5,"zone":11,"amountInr":7434},{"band":"slab","weightKg":5,"zone":12,"amountInr":4062},{"band":"slab","weightKg":5,"zone":13,"amountInr":4678},{"band":"slab","weightKg":5.5,"zone":1,"amountInr":2183},{"band":"slab","weightKg":5.5,"zone":2,"amountInr":2983},{"band":"slab","weightKg":5.5,"zone":3,"amountInr":3961},{"band":"slab","weightKg":5.5,"zone":4,"amountInr":3357},{"band":"slab","weightKg":5.5,"zone":5,"amountInr":4579},{"band":"slab","weightKg":5.5,"zone":6,"amountInr":3637},{"band":"slab","weightKg":5.5,"zone":7,"amountInr":3396},{"band":"slab","weightKg":5.5,"zone":8,"amountInr":7379},{"band":"slab","weightKg":5.5,"zone":9,"amountInr":6911},{"band":"slab","weightKg":5.5,"zone":10,"amountInr":6973},{"band":"slab","weightKg":5.5,"zone":11,"amountInr":7849},{"band":"slab","weightKg":5.5,"zone":12,"amountInr":4272},{"band":"slab","weightKg":5.5,"zone":13,"amountInr":5611},{"band":"slab","weightKg":6,"zone":1,"amountInr":2255},{"band":"slab","weightKg":6,"zone":2,"amountInr":3078},{"band":"slab","weightKg":6,"zone":3,"amountInr":4124},{"band":"slab","weightKg":6,"zone":4,"amountInr":3496},{"band":"slab","weightKg":6,"zone":5,"amountInr":4768},{"band":"slab","weightKg":6,"zone":6,"amountInr":3794},{"band":"slab","weightKg":6,"zone":7,"amountInr":3557},{"band":"slab","weightKg":6,"zone":8,"amountInr":7804},{"band":"slab","weightKg":6,"zone":9,"amountInr":7252},{"band":"slab","weightKg":6,"zone":10,"amountInr":7321},{"band":"slab","weightKg":6,"zone":11,"amountInr":8264},{"band":"slab","weightKg":6,"zone":12,"amountInr":4483},{"band":"slab","weightKg":6,"zone":13,"amountInr":5935},{"band":"slab","weightKg":6.5,"zone":1,"amountInr":2328},{"band":"slab","weightKg":6.5,"zone":2,"amountInr":3172},{"band":"slab","weightKg":6.5,"zone":3,"amountInr":4287},{"band":"slab","weightKg":6.5,"zone":4,"amountInr":3634},{"band":"slab","weightKg":6.5,"zone":5,"amountInr":4957},{"band":"slab","weightKg":6.5,"zone":6,"amountInr":3950},{"band":"slab","weightKg":6.5,"zone":7,"amountInr":3717},{"band":"slab","weightKg":6.5,"zone":8,"amountInr":8228},{"band":"slab","weightKg":6.5,"zone":9,"amountInr":7593},{"band":"slab","weightKg":6.5,"zone":10,"amountInr":7668},{"band":"slab","weightKg":6.5,"zone":11,"amountInr":8680},{"band":"slab","weightKg":6.5,"zone":12,"amountInr":4694},{"band":"slab","weightKg":6.5,"zone":13,"amountInr":6276},{"band":"slab","weightKg":7,"zone":1,"amountInr":2400},{"band":"slab","weightKg":7,"zone":2,"amountInr":3266},{"band":"slab","weightKg":7,"zone":3,"amountInr":4450},{"band":"slab","weightKg":7,"zone":4,"amountInr":3773},{"band":"slab","weightKg":7,"zone":5,"amountInr":5147},{"band":"slab","weightKg":7,"zone":6,"amountInr":4107},{"band":"slab","weightKg":7,"zone":7,"amountInr":3878},{"band":"slab","weightKg":7,"zone":8,"amountInr":8652},{"band":"slab","weightKg":7,"zone":9,"amountInr":7934},{"band":"slab","weightKg":7,"zone":10,"amountInr":8015},{"band":"slab","weightKg":7,"zone":11,"amountInr":9095},{"band":"slab","weightKg":7,"zone":12,"amountInr":4904},{"band":"slab","weightKg":7,"zone":13,"amountInr":6598},{"band":"slab","weightKg":7.5,"zone":1,"amountInr":2472},{"band":"slab","weightKg":7.5,"zone":2,"amountInr":3361},{"band":"slab","weightKg":7.5,"zone":3,"amountInr":4612},{"band":"slab","weightKg":7.5,"zone":4,"amountInr":3912},{"band":"slab","weightKg":7.5,"zone":5,"amountInr":5336},{"band":"slab","weightKg":7.5,"zone":6,"amountInr":4263},{"band":"slab","weightKg":7.5,"zone":7,"amountInr":4039},{"band":"slab","weightKg":7.5,"zone":8,"amountInr":9076},{"band":"slab","weightKg":7.5,"zone":9,"amountInr":8274},{"band":"slab","weightKg":7.5,"zone":10,"amountInr":8363},{"band":"slab","weightKg":7.5,"zone":11,"amountInr":9511},{"band":"slab","weightKg":7.5,"zone":12,"amountInr":5416},{"band":"slab","weightKg":7.5,"zone":13,"amountInr":6939},{"band":"slab","weightKg":8,"zone":1,"amountInr":2544},{"band":"slab","weightKg":8,"zone":2,"amountInr":3455},{"band":"slab","weightKg":8,"zone":3,"amountInr":4775},{"band":"slab","weightKg":8,"zone":4,"amountInr":4050},{"band":"slab","weightKg":8,"zone":5,"amountInr":5525},{"band":"slab","weightKg":8,"zone":6,"amountInr":4420},{"band":"slab","weightKg":8,"zone":7,"amountInr":4199},{"band":"slab","weightKg":8,"zone":8,"amountInr":9501},{"band":"slab","weightKg":8,"zone":9,"amountInr":8615},{"band":"slab","weightKg":8,"zone":10,"amountInr":8710},{"band":"slab","weightKg":8,"zone":11,"amountInr":9926},{"band":"slab","weightKg":8,"zone":12,"amountInr":5639},{"band":"slab","weightKg":8,"zone":13,"amountInr":7263},{"band":"slab","weightKg":8.5,"zone":1,"amountInr":2616},{"band":"slab","weightKg":8.5,"zone":2,"amountInr":3549},{"band":"slab","weightKg":8.5,"zone":3,"amountInr":4938},{"band":"slab","weightKg":8.5,"zone":4,"amountInr":4189},{"band":"slab","weightKg":8.5,"zone":5,"amountInr":5715},{"band":"slab","weightKg":8.5,"zone":6,"amountInr":4576},{"band":"slab","weightKg":8.5,"zone":7,"amountInr":4360},{"band":"slab","weightKg":8.5,"zone":8,"amountInr":9925},{"band":"slab","weightKg":8.5,"zone":9,"amountInr":8956},{"band":"slab","weightKg":8.5,"zone":10,"amountInr":9058},{"band":"slab","weightKg":8.5,"zone":11,"amountInr":10341},{"band":"slab","weightKg":8.5,"zone":12,"amountInr":5862},{"band":"slab","weightKg":8.5,"zone":13,"amountInr":7603},{"band":"slab","weightKg":9,"zone":1,"amountInr":2689},{"band":"slab","weightKg":9,"zone":2,"amountInr":3644},{"band":"slab","weightKg":9,"zone":3,"amountInr":5101},{"band":"slab","weightKg":9,"zone":4,"amountInr":4328},{"band":"slab","weightKg":9,"zone":5,"amountInr":5904},{"band":"slab","weightKg":9,"zone":6,"amountInr":4732},{"band":"slab","weightKg":9,"zone":7,"amountInr":4520},{"band":"slab","weightKg":9,"zone":8,"amountInr":10349},{"band":"slab","weightKg":9,"zone":9,"amountInr":9297},{"band":"slab","weightKg":9,"zone":10,"amountInr":9405},{"band":"slab","weightKg":9,"zone":11,"amountInr":10757},{"band":"slab","weightKg":9,"zone":12,"amountInr":6085},{"band":"slab","weightKg":9,"zone":13,"amountInr":7925},{"band":"slab","weightKg":9.5,"zone":1,"amountInr":2761},{"band":"slab","weightKg":9.5,"zone":2,"amountInr":3738},{"band":"slab","weightKg":9.5,"zone":3,"amountInr":5263},{"band":"slab","weightKg":9.5,"zone":4,"amountInr":4466},{"band":"slab","weightKg":9.5,"zone":5,"amountInr":6093},{"band":"slab","weightKg":9.5,"zone":6,"amountInr":4889},{"band":"slab","weightKg":9.5,"zone":7,"amountInr":4681},{"band":"slab","weightKg":9.5,"zone":8,"amountInr":10774},{"band":"slab","weightKg":9.5,"zone":9,"amountInr":9637},{"band":"slab","weightKg":9.5,"zone":10,"amountInr":9752},{"band":"slab","weightKg":9.5,"zone":11,"amountInr":11172},{"band":"slab","weightKg":9.5,"zone":12,"amountInr":6308},{"band":"slab","weightKg":9.5,"zone":13,"amountInr":8256},{"band":"slab","weightKg":10,"zone":1,"amountInr":2833},{"band":"slab","weightKg":10,"zone":2,"amountInr":3832},{"band":"slab","weightKg":10,"zone":3,"amountInr":5426},{"band":"slab","weightKg":10,"zone":4,"amountInr":4605},{"band":"slab","weightKg":10,"zone":5,"amountInr":6282},{"band":"slab","weightKg":10,"zone":6,"amountInr":5046},{"band":"slab","weightKg":10,"zone":7,"amountInr":4842},{"band":"slab","weightKg":10,"zone":8,"amountInr":11198},{"band":"slab","weightKg":10,"zone":9,"amountInr":9978},{"band":"slab","weightKg":10,"zone":10,"amountInr":10100},{"band":"slab","weightKg":10,"zone":11,"amountInr":11587},{"band":"slab","weightKg":10,"zone":12,"amountInr":6531},{"band":"slab","weightKg":10,"zone":13,"amountInr":8568},{"band":"slab","weightKg":10.5,"zone":1,"amountInr":3804},{"band":"slab","weightKg":10.5,"zone":2,"amountInr":4677},{"band":"slab","weightKg":10.5,"zone":3,"amountInr":6479},{"band":"slab","weightKg":10.5,"zone":4,"amountInr":5651},{"band":"slab","weightKg":10.5,"zone":5,"amountInr":6811},{"band":"slab","weightKg":10.5,"zone":6,"amountInr":5702},{"band":"slab","weightKg":10.5,"zone":7,"amountInr":5309},{"band":"slab","weightKg":10.5,"zone":8,"amountInr":11493},{"band":"slab","weightKg":10.5,"zone":9,"amountInr":11201},{"band":"slab","weightKg":10.5,"zone":10,"amountInr":11689},{"band":"slab","weightKg":10.5,"zone":11,"amountInr":11884},{"band":"slab","weightKg":10.5,"zone":12,"amountInr":7281},{"band":"slab","weightKg":10.5,"zone":13,"amountInr":8877},{"band":"slab","weightKg":11,"zone":1,"amountInr":3913},{"band":"slab","weightKg":11,"zone":2,"amountInr":4756},{"band":"slab","weightKg":11,"zone":3,"amountInr":6628},{"band":"slab","weightKg":11,"zone":4,"amountInr":5776},{"band":"slab","weightKg":11,"zone":5,"amountInr":6960},{"band":"slab","weightKg":11,"zone":6,"amountInr":5974},{"band":"slab","weightKg":11,"zone":7,"amountInr":5431},{"band":"slab","weightKg":11,"zone":8,"amountInr":11787},{"band":"slab","weightKg":11,"zone":9,"amountInr":11517},{"band":"slab","weightKg":11,"zone":10,"amountInr":12016},{"band":"slab","weightKg":11,"zone":11,"amountInr":12182},{"band":"slab","weightKg":11,"zone":12,"amountInr":7294},{"band":"slab","weightKg":11,"zone":13,"amountInr":9168},{"band":"slab","weightKg":11.5,"zone":1,"amountInr":4023},{"band":"slab","weightKg":11.5,"zone":2,"amountInr":4834},{"band":"slab","weightKg":11.5,"zone":3,"amountInr":6776},{"band":"slab","weightKg":11.5,"zone":4,"amountInr":5901},{"band":"slab","weightKg":11.5,"zone":5,"amountInr":7108},{"band":"slab","weightKg":11.5,"zone":6,"amountInr":6245},{"band":"slab","weightKg":11.5,"zone":7,"amountInr":5553},{"band":"slab","weightKg":11.5,"zone":8,"amountInr":12082},{"band":"slab","weightKg":11.5,"zone":9,"amountInr":11832},{"band":"slab","weightKg":11.5,"zone":10,"amountInr":12343},{"band":"slab","weightKg":11.5,"zone":11,"amountInr":12479},{"band":"slab","weightKg":11.5,"zone":12,"amountInr":7494},{"band":"slab","weightKg":11.5,"zone":13,"amountInr":9473},{"band":"slab","weightKg":12,"zone":1,"amountInr":4132},{"band":"slab","weightKg":12,"zone":2,"amountInr":4912},{"band":"slab","weightKg":12,"zone":3,"amountInr":6925},{"band":"slab","weightKg":12,"zone":4,"amountInr":6026},{"band":"slab","weightKg":12,"zone":5,"amountInr":7256},{"band":"slab","weightKg":12,"zone":6,"amountInr":6517},{"band":"slab","weightKg":12,"zone":7,"amountInr":5674},{"band":"slab","weightKg":12,"zone":8,"amountInr":12376},{"band":"slab","weightKg":12,"zone":9,"amountInr":12148},{"band":"slab","weightKg":12,"zone":10,"amountInr":12670},{"band":"slab","weightKg":12,"zone":11,"amountInr":12776},{"band":"slab","weightKg":12,"zone":12,"amountInr":7694},{"band":"slab","weightKg":12,"zone":13,"amountInr":9765},{"band":"slab","weightKg":12.5,"zone":1,"amountInr":4241},{"band":"slab","weightKg":12.5,"zone":2,"amountInr":4991},{"band":"slab","weightKg":12.5,"zone":3,"amountInr":7074},{"band":"slab","weightKg":12.5,"zone":4,"amountInr":6151},{"band":"slab","weightKg":12.5,"zone":5,"amountInr":7404},{"band":"slab","weightKg":12.5,"zone":6,"amountInr":6788},{"band":"slab","weightKg":12.5,"zone":7,"amountInr":5796},{"band":"slab","weightKg":12.5,"zone":8,"amountInr":12671},{"band":"slab","weightKg":12.5,"zone":9,"amountInr":12464},{"band":"slab","weightKg":12.5,"zone":10,"amountInr":12997},{"band":"slab","weightKg":12.5,"zone":11,"amountInr":13073},{"band":"slab","weightKg":12.5,"zone":12,"amountInr":7894},{"band":"slab","weightKg":12.5,"zone":13,"amountInr":10071},{"band":"slab","weightKg":13,"zone":1,"amountInr":4350},{"band":"slab","weightKg":13,"zone":2,"amountInr":5069},{"band":"slab","weightKg":13,"zone":3,"amountInr":7222},{"band":"slab","weightKg":13,"zone":4,"amountInr":6276},{"band":"slab","weightKg":13,"zone":5,"amountInr":7552},{"band":"slab","weightKg":13,"zone":6,"amountInr":7060},{"band":"slab","weightKg":13,"zone":7,"amountInr":5918},{"band":"slab","weightKg":13,"zone":8,"amountInr":12966},{"band":"slab","weightKg":13,"zone":9,"amountInr":12780},{"band":"slab","weightKg":13,"zone":10,"amountInr":13324},{"band":"slab","weightKg":13,"zone":11,"amountInr":13370},{"band":"slab","weightKg":13,"zone":12,"amountInr":8094},{"band":"slab","weightKg":13,"zone":13,"amountInr":10354},{"band":"slab","weightKg":13.5,"zone":1,"amountInr":4459},{"band":"slab","weightKg":13.5,"zone":2,"amountInr":5147},{"band":"slab","weightKg":13.5,"zone":3,"amountInr":7371},{"band":"slab","weightKg":13.5,"zone":4,"amountInr":6401},{"band":"slab","weightKg":13.5,"zone":5,"amountInr":7701},{"band":"slab","weightKg":13.5,"zone":6,"amountInr":7331},{"band":"slab","weightKg":13.5,"zone":7,"amountInr":6040},{"band":"slab","weightKg":13.5,"zone":8,"amountInr":13260},{"band":"slab","weightKg":13.5,"zone":9,"amountInr":13095},{"band":"slab","weightKg":13.5,"zone":10,"amountInr":13651},{"band":"slab","weightKg":13.5,"zone":11,"amountInr":13667},{"band":"slab","weightKg":13.5,"zone":12,"amountInr":8294},{"band":"slab","weightKg":13.5,"zone":13,"amountInr":10650},{"band":"slab","weightKg":14,"zone":1,"amountInr":4568},{"band":"slab","weightKg":14,"zone":2,"amountInr":5225},{"band":"slab","weightKg":14,"zone":3,"amountInr":7520},{"band":"slab","weightKg":14,"zone":4,"amountInr":6526},{"band":"slab","weightKg":14,"zone":5,"amountInr":7849},{"band":"slab","weightKg":14,"zone":6,"amountInr":7603},{"band":"slab","weightKg":14,"zone":7,"amountInr":6161},{"band":"slab","weightKg":14,"zone":8,"amountInr":13555},{"band":"slab","weightKg":14,"zone":9,"amountInr":13411},{"band":"slab","weightKg":14,"zone":10,"amountInr":13977},{"band":"slab","weightKg":14,"zone":11,"amountInr":13964},{"band":"slab","weightKg":14,"zone":12,"amountInr":8494},{"band":"slab","weightKg":14,"zone":13,"amountInr":10940},{"band":"slab","weightKg":14.5,"zone":1,"amountInr":4678},{"band":"slab","weightKg":14.5,"zone":2,"amountInr":5304},{"band":"slab","weightKg":14.5,"zone":3,"amountInr":7668},{"band":"slab","weightKg":14.5,"zone":4,"amountInr":6651},{"band":"slab","weightKg":14.5,"zone":5,"amountInr":7997},{"band":"slab","weightKg":14.5,"zone":6,"amountInr":7874},{"band":"slab","weightKg":14.5,"zone":7,"amountInr":6283},{"band":"slab","weightKg":14.5,"zone":8,"amountInr":13850},{"band":"slab","weightKg":14.5,"zone":9,"amountInr":13727},{"band":"slab","weightKg":14.5,"zone":10,"amountInr":14304},{"band":"slab","weightKg":14.5,"zone":11,"amountInr":14261},{"band":"slab","weightKg":14.5,"zone":12,"amountInr":8694},{"band":"slab","weightKg":14.5,"zone":13,"amountInr":11240},{"band":"slab","weightKg":15,"zone":1,"amountInr":4787},{"band":"slab","weightKg":15,"zone":2,"amountInr":5382},{"band":"slab","weightKg":15,"zone":3,"amountInr":7817},{"band":"slab","weightKg":15,"zone":4,"amountInr":6776},{"band":"slab","weightKg":15,"zone":5,"amountInr":8145},{"band":"slab","weightKg":15,"zone":6,"amountInr":8146},{"band":"slab","weightKg":15,"zone":7,"amountInr":6405},{"band":"slab","weightKg":15,"zone":8,"amountInr":14144},{"band":"slab","weightKg":15,"zone":9,"amountInr":14043},{"band":"slab","weightKg":15,"zone":10,"amountInr":14631},{"band":"slab","weightKg":15,"zone":11,"amountInr":14559},{"band":"slab","weightKg":15,"zone":12,"amountInr":8894},{"band":"slab","weightKg":15,"zone":13,"amountInr":11519},{"band":"slab","weightKg":15.5,"zone":1,"amountInr":5712},{"band":"slab","weightKg":15.5,"zone":2,"amountInr":6371},{"band":"slab","weightKg":15.5,"zone":3,"amountInr":9104},{"band":"slab","weightKg":15.5,"zone":4,"amountInr":8051},{"band":"slab","weightKg":15.5,"zone":5,"amountInr":10663},{"band":"slab","weightKg":15.5,"zone":6,"amountInr":9259},{"band":"slab","weightKg":15.5,"zone":7,"amountInr":6527},{"band":"slab","weightKg":15.5,"zone":8,"amountInr":14439},{"band":"slab","weightKg":15.5,"zone":9,"amountInr":14358},{"band":"slab","weightKg":15.5,"zone":10,"amountInr":14958},{"band":"slab","weightKg":15.5,"zone":11,"amountInr":14856},{"band":"slab","weightKg":15.5,"zone":12,"amountInr":9094},{"band":"slab","weightKg":15.5,"zone":13,"amountInr":11827},{"band":"slab","weightKg":16,"zone":1,"amountInr":5839},{"band":"slab","weightKg":16,"zone":2,"amountInr":6462},{"band":"slab","weightKg":16,"zone":3,"amountInr":9274},{"band":"slab","weightKg":16,"zone":4,"amountInr":8197},{"band":"slab","weightKg":16,"zone":5,"amountInr":10853},{"band":"slab","weightKg":16,"zone":6,"amountInr":9558},{"band":"slab","weightKg":16,"zone":7,"amountInr":6648},{"band":"slab","weightKg":16,"zone":8,"amountInr":14734},{"band":"slab","weightKg":16,"zone":9,"amountInr":14674},{"band":"slab","weightKg":16,"zone":10,"amountInr":15285},{"band":"slab","weightKg":16,"zone":11,"amountInr":15153},{"band":"slab","weightKg":16,"zone":12,"amountInr":9294},{"band":"slab","weightKg":16,"zone":13,"amountInr":12116},{"band":"slab","weightKg":16.5,"zone":1,"amountInr":5967},{"band":"slab","weightKg":16.5,"zone":2,"amountInr":6553},{"band":"slab","weightKg":16.5,"zone":3,"amountInr":9443},{"band":"slab","weightKg":16.5,"zone":4,"amountInr":8343},{"band":"slab","weightKg":16.5,"zone":5,"amountInr":11044},{"band":"slab","weightKg":16.5,"zone":6,"amountInr":9857},{"band":"slab","weightKg":16.5,"zone":7,"amountInr":6770},{"band":"slab","weightKg":16.5,"zone":8,"amountInr":15028},{"band":"slab","weightKg":16.5,"zone":9,"amountInr":14990},{"band":"slab","weightKg":16.5,"zone":10,"amountInr":15612},{"band":"slab","weightKg":16.5,"zone":11,"amountInr":15450},{"band":"slab","weightKg":16.5,"zone":12,"amountInr":9494},{"band":"slab","weightKg":16.5,"zone":13,"amountInr":12415},{"band":"slab","weightKg":17,"zone":1,"amountInr":6094},{"band":"slab","weightKg":17,"zone":2,"amountInr":6645},{"band":"slab","weightKg":17,"zone":3,"amountInr":9613},{"band":"slab","weightKg":17,"zone":4,"amountInr":8488},{"band":"slab","weightKg":17,"zone":5,"amountInr":11234},{"band":"slab","weightKg":17,"zone":6,"amountInr":10155},{"band":"slab","weightKg":17,"zone":7,"amountInr":6892},{"band":"slab","weightKg":17,"zone":8,"amountInr":15323},{"band":"slab","weightKg":17,"zone":9,"amountInr":15306},{"band":"slab","weightKg":17,"zone":10,"amountInr":15939},{"band":"slab","weightKg":17,"zone":11,"amountInr":15747},{"band":"slab","weightKg":17,"zone":12,"amountInr":9694},{"band":"slab","weightKg":17,"zone":13,"amountInr":12705},{"band":"slab","weightKg":17.5,"zone":1,"amountInr":6221},{"band":"slab","weightKg":17.5,"zone":2,"amountInr":6736},{"band":"slab","weightKg":17.5,"zone":3,"amountInr":9783},{"band":"slab","weightKg":17.5,"zone":4,"amountInr":8634},{"band":"slab","weightKg":17.5,"zone":5,"amountInr":11425},{"band":"slab","weightKg":17.5,"zone":6,"amountInr":10454},{"band":"slab","weightKg":17.5,"zone":7,"amountInr":7014},{"band":"slab","weightKg":17.5,"zone":8,"amountInr":15617},{"band":"slab","weightKg":17.5,"zone":9,"amountInr":15621},{"band":"slab","weightKg":17.5,"zone":10,"amountInr":16266},{"band":"slab","weightKg":17.5,"zone":11,"amountInr":16044},{"band":"slab","weightKg":17.5,"zone":12,"amountInr":9893},{"band":"slab","weightKg":17.5,"zone":13,"amountInr":13013},{"band":"slab","weightKg":18,"zone":1,"amountInr":6349},{"band":"slab","weightKg":18,"zone":2,"amountInr":6827},{"band":"slab","weightKg":18,"zone":3,"amountInr":9953},{"band":"slab","weightKg":18,"zone":4,"amountInr":8780},{"band":"slab","weightKg":18,"zone":5,"amountInr":11616},{"band":"slab","weightKg":18,"zone":6,"amountInr":10753},{"band":"slab","weightKg":18,"zone":7,"amountInr":7135},{"band":"slab","weightKg":18,"zone":8,"amountInr":15912},{"band":"slab","weightKg":18,"zone":9,"amountInr":15937},{"band":"slab","weightKg":18,"zone":10,"amountInr":16593},{"band":"slab","weightKg":18,"zone":11,"amountInr":16341},{"band":"slab","weightKg":18,"zone":12,"amountInr":10093},{"band":"slab","weightKg":18,"zone":13,"amountInr":13304},{"band":"slab","weightKg":18.5,"zone":1,"amountInr":6476},{"band":"slab","weightKg":18.5,"zone":2,"amountInr":6919},{"band":"slab","weightKg":18.5,"zone":3,"amountInr":10123},{"band":"slab","weightKg":18.5,"zone":4,"amountInr":8926},{"band":"slab","weightKg":18.5,"zone":5,"amountInr":11806},{"band":"slab","weightKg":18.5,"zone":6,"amountInr":11051},{"band":"slab","weightKg":18.5,"zone":7,"amountInr":7257},{"band":"slab","weightKg":18.5,"zone":8,"amountInr":16207},{"band":"slab","weightKg":18.5,"zone":9,"amountInr":16253},{"band":"slab","weightKg":18.5,"zone":10,"amountInr":16920},{"band":"slab","weightKg":18.5,"zone":11,"amountInr":16638},{"band":"slab","weightKg":18.5,"zone":12,"amountInr":10293},{"band":"slab","weightKg":18.5,"zone":13,"amountInr":13610},{"band":"slab","weightKg":19,"zone":1,"amountInr":6604},{"band":"slab","weightKg":19,"zone":2,"amountInr":7010},{"band":"slab","weightKg":19,"zone":3,"amountInr":10293},{"band":"slab","weightKg":19,"zone":4,"amountInr":9072},{"band":"slab","weightKg":19,"zone":5,"amountInr":11997},{"band":"slab","weightKg":19,"zone":6,"amountInr":11350},{"band":"slab","weightKg":19,"zone":7,"amountInr":7379},{"band":"slab","weightKg":19,"zone":8,"amountInr":16501},{"band":"slab","weightKg":19,"zone":9,"amountInr":16569},{"band":"slab","weightKg":19,"zone":10,"amountInr":17246},{"band":"slab","weightKg":19,"zone":11,"amountInr":16936},{"band":"slab","weightKg":19,"zone":12,"amountInr":10493},{"band":"slab","weightKg":19,"zone":13,"amountInr":13902},{"band":"slab","weightKg":19.5,"zone":1,"amountInr":6731},{"band":"slab","weightKg":19.5,"zone":2,"amountInr":7102},{"band":"slab","weightKg":19.5,"zone":3,"amountInr":10463},{"band":"slab","weightKg":19.5,"zone":4,"amountInr":9218},{"band":"slab","weightKg":19.5,"zone":5,"amountInr":12187},{"band":"slab","weightKg":19.5,"zone":6,"amountInr":11649},{"band":"slab","weightKg":19.5,"zone":7,"amountInr":7501},{"band":"slab","weightKg":19.5,"zone":8,"amountInr":16796},{"band":"slab","weightKg":19.5,"zone":9,"amountInr":16884},{"band":"slab","weightKg":19.5,"zone":10,"amountInr":17573},{"band":"slab","weightKg":19.5,"zone":11,"amountInr":17233},{"band":"slab","weightKg":19.5,"zone":12,"amountInr":10693},{"band":"slab","weightKg":19.5,"zone":13,"amountInr":14212},{"band":"slab","weightKg":20,"zone":1,"amountInr":6858},{"band":"slab","weightKg":20,"zone":2,"amountInr":7193},{"band":"slab","weightKg":20,"zone":3,"amountInr":10633},{"band":"slab","weightKg":20,"zone":4,"amountInr":9363},{"band":"slab","weightKg":20,"zone":5,"amountInr":12378},{"band":"slab","weightKg":20,"zone":6,"amountInr":11947},{"band":"slab","weightKg":20,"zone":7,"amountInr":7622},{"band":"slab","weightKg":20,"zone":8,"amountInr":17091},{"band":"slab","weightKg":20,"zone":9,"amountInr":17200},{"band":"slab","weightKg":20,"zone":10,"amountInr":17900},{"band":"slab","weightKg":20,"zone":11,"amountInr":17530},{"band":"slab","weightKg":20,"zone":12,"amountInr":10893},{"band":"slab","weightKg":20,"zone":13,"amountInr":14490},{"band":"per_kg","weightKg":21,"zone":1,"amountInr":502},{"band":"per_kg","weightKg":21,"zone":2,"amountInr":420},{"band":"per_kg","weightKg":21,"zone":3,"amountInr":604},{"band":"per_kg","weightKg":21,"zone":4,"amountInr":543},{"band":"per_kg","weightKg":21,"zone":5,"amountInr":646},{"band":"per_kg","weightKg":21,"zone":6,"amountInr":565},{"band":"per_kg","weightKg":21,"zone":7,"amountInr":392},{"band":"per_kg","weightKg":21,"zone":8,"amountInr":857},{"band":"per_kg","weightKg":21,"zone":9,"amountInr":935},{"band":"per_kg","weightKg":21,"zone":10,"amountInr":999},{"band":"per_kg","weightKg":21,"zone":11,"amountInr":957},{"band":"per_kg","weightKg":21,"zone":12,"amountInr":547},{"band":"per_kg","weightKg":21,"zone":13,"amountInr":724},{"band":"per_kg","weightKg":45,"zone":1,"amountInr":452},{"band":"per_kg","weightKg":45,"zone":2,"amountInr":383},{"band":"per_kg","weightKg":45,"zone":3,"amountInr":524},{"band":"per_kg","weightKg":45,"zone":4,"amountInr":467},{"band":"per_kg","weightKg":45,"zone":5,"amountInr":615},{"band":"per_kg","weightKg":45,"zone":6,"amountInr":524},{"band":"per_kg","weightKg":45,"zone":7,"amountInr":388},{"band":"per_kg","weightKg":45,"zone":8,"amountInr":907},{"band":"per_kg","weightKg":45,"zone":9,"amountInr":900},{"band":"per_kg","weightKg":45,"zone":10,"amountInr":848},{"band":"per_kg","weightKg":45,"zone":11,"amountInr":911},{"band":"per_kg","weightKg":45,"zone":12,"amountInr":526},{"band":"per_kg","weightKg":45,"zone":13,"amountInr":723},{"band":"per_kg","weightKg":71,"zone":1,"amountInr":418},{"band":"per_kg","weightKg":71,"zone":2,"amountInr":353},{"band":"per_kg","weightKg":71,"zone":3,"amountInr":480},{"band":"per_kg","weightKg":71,"zone":4,"amountInr":434},{"band":"per_kg","weightKg":71,"zone":5,"amountInr":566},{"band":"per_kg","weightKg":71,"zone":6,"amountInr":610},{"band":"per_kg","weightKg":71,"zone":7,"amountInr":368},{"band":"per_kg","weightKg":71,"zone":8,"amountInr":830},{"band":"per_kg","weightKg":71,"zone":9,"amountInr":876},{"band":"per_kg","weightKg":71,"zone":10,"amountInr":847},{"band":"per_kg","weightKg":71,"zone":11,"amountInr":856},{"band":"per_kg","weightKg":71,"zone":12,"amountInr":512},{"band":"per_kg","weightKg":71,"zone":13,"amountInr":715}];
