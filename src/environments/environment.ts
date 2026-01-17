export const environment = {
  urlDeseaseDB: 'http://127.0.0.1:8000/',

  //placeholders
  placeholderCountry: 'País',
  placeholderState: 'Estado',
  placeholderMunicipal: 'Municipio',
  placeholderMetropoli: 'Metropli',
  placeholderStateResolution: 'Estatal',
  placeholderMunResolution: 'Municipal',
  placeholderFirstClass: 'Selecciona una enfermedad',
  placeholderSecondClass: 'Sin grupo',
  placeholderThirdClass: 'Sin subgrupo',
  placeholderAge:'Todas las edades',
  placeholderGender: 'Todos los géneros',
  placeholderYear: 'Último año',
  unknownMunicipality: 'Municipio Desconocido',
  UnknownState: 'Estado Desconocido',
  selectedFirstClass: 'Enfermedad',
  selectedSecondClass: 'Grupo',
  selectedThirdClass: 'Subgrupo',
  selectedMetropoli: 'Todas',
  placeholderMan: 'Hombres',
  placeholderWoman: 'Mujeres',
  placeholderNoGender: 'No registrado',
  ageTotals: 'Casos por edad',
  genderTotals: 'Casos por género',
  headerTop10: 'Top 10 de la región',
  headerTotals: 'Totales',
  placeholderCategory:'Seleccione una categoría',

  modelsDictionaryTable: 'ENFERMEDADES',
  statesMunDictionaryTable: 'ESTADO_MUN',
  municipalityTable: 'CVE_METROPOLI',

  firstClassDescripColumn: 'Enfermedad',
  firstClassIdColumn: 'CVE_Enfermedad',
  ageGrupoColumn: 'Edad_gpo',
  genderColumn: 'Sexo',
  yearColumn: 'Anio',
  tablePopulationTotal: 'POPULATION_TOTAL',

  //legend in map
  placeholderDataRange: 'Rango de Datos',
  placeholderNoData: 'Datos no disponibles',

}

export const nameCategories = {
  "tx90p": "Índice de días cálidos (TX90p)",
  "tx10p": "Índice de días fríos (TX10p)",
  "tn90p": "Índice de noches cálidas (TN90p)",
  "tn10p": "Índice de noches frías (TN10p)",
  "txx": "Máximo de la temperatura máxima diaria (TXx)",
  "tnn": "Mínimo de la temperatura mínima diaria (TNn)",
  "dtr": "Rango diario de temperatura (Tmax-Tmin) (DTR)"
}

export const categoriesFilterList = {
    "tx90p": [],
    "tx10p": [],
    "tn90p": [],
    "tn10p": [],
    "txx": [],
    "tnn": [],
    "dtr": []
}

export const ageMap = {
  "0-04": '0 - 4 Años',
  "05-14": '5 - 14 Años',
  "15-24": '15 - 24 Años',
  "25-34": '25 - 34 Años',
  "35-44": '35 - 44 Años',
  "45-54": '45 - 54 Años',
  "55-64": '55 - 64 Años',
  "65+": 'Más de 65 Años',
  "null": 'Sin especificar',
}

export type AgeRange = keyof typeof ageMap;

export const gendersDict:{ [key: number]: string } = { 1: "Hombres", 2: "Mujeres", 9: "No registrado" }
