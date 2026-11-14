import type {
  CriterionEvaluation,
  CriterionMatchStatus,
  EducationLevel,
  ExperienceLevel,
  Opportunity,
  OpportunityMatchSummary,
  RequirementCriterion,
  SelfCheckProfile,
} from './types';

const EDUCATION_RANK: Record<Exclude<EducationLevel, ''>, number> = {
  primary: 1,
  secondary: 2,
  student_enrolled: 3,
  technical: 4,
  bachelor: 5,
  postgrad: 6,
};

const EXPERIENCE_RANK: Record<Exclude<ExperienceLevel, ''>, number> = {
  none: 0,
  under_1y: 1,
  '1_to_3y': 2,
  '3y_plus': 3,
};

export const emptySelfCheckProfile: SelfCheckProfile = {
  residenceCountry: '',
  workOrStudyAuthorizedInTarget: '',
  educationLevel: '',
  languages: [],
  preferredModality: '',
  experienceLevel: '',
};

export function hasAnyProfileInput(profile: SelfCheckProfile): boolean {
  return Boolean(
    profile.residenceCountry ||
      profile.workOrStudyAuthorizedInTarget ||
      profile.educationLevel ||
      profile.languages.length > 0 ||
      profile.preferredModality ||
      profile.experienceLevel,
  );
}

export function evaluateCriterion(
  criterion: RequirementCriterion,
  profile: SelfCheckProfile,
): CriterionEvaluation {
  switch (criterion.kind) {
    case 'country': {
      if (!criterion.allowedCountries || criterion.allowedCountries.length === 0) {
        return {
          criterionId: criterion.id,
          status: 'UNKNOWN',
          reason: {
            es: 'La fuente no precisa países elegibles de forma cerrada.',
            en: 'The official source does not list closed country rules.',
          },
        };
      }
      if (!profile.residenceCountry) {
        return {
          criterionId: criterion.id,
          status: 'UNKNOWN',
          reason: {
            es: 'Indica tu país de residencia en la autocomprobación para comparar.',
            en: 'Select your country of residence in the self-check to compare.',
          },
        };
      }
      if (criterion.allowedCountries.includes(profile.residenceCountry)) {
        if (
          criterion.requiresExternalVerification &&
          profile.workOrStudyAuthorizedInTarget !== 'yes'
        ) {
          return {
            criterionId: criterion.id,
            status: 'NEEDS_CONFIRMATION',
            reason: {
              es: 'País compatible en principio; debes confirmar ciudadanía, visa o permiso vigente en la convocatoria.',
              en: 'Country aligns in principle; confirm citizenship, visa, or valid permit in the official call.',
            },
          };
        }
        return {
          criterionId: criterion.id,
          status: 'MATCH',
          reason: {
            es: 'Tu país indicado figura dentro del alcance declarado por la fuente.',
            en: 'Your selected country is included in the scope stated by the source.',
          },
        };
      }

      if (profile.workOrStudyAuthorizedInTarget === 'yes') {
        return {
          criterionId: criterion.id,
          status: 'NEEDS_CONFIRMATION',
          reason: {
            es: 'Indicas autorización en el destino, pero la ficha restringe el país/sede: confirma tu documento exacto.',
            en: 'You noted authorization in the target country, but the listing has local rules: verify your exact status.',
          },
        };
      }

      return {
        criterionId: criterion.id,
        status: 'MISMATCH',
        reason: {
          es: 'Tu país indicado no coincide con la ubicación o elegibilidad geográfica publicada.',
          en: 'Your selected country does not match the published location or geographic eligibility.',
        },
      };
    }

    case 'modality': {
      if (!criterion.requiredModalities || criterion.requiredModalities.length === 0) {
        return {
          criterionId: criterion.id,
          status: 'UNKNOWN',
          reason: {
            es: 'La convocatoria no publicó modalidad detallada.',
            en: 'The official listing did not publish modality details.',
          },
        };
      }
      if (criterion.requiredModalities.includes('unknown')) {
        return {
          criterionId: criterion.id,
          status: 'UNKNOWN',
          reason: {
            es: 'Modalidad no publicada por la institución.',
            en: 'Modality was not published by the institution.',
          },
        };
      }
      if (!profile.preferredModality) {
        return {
          criterionId: criterion.id,
          status: 'UNKNOWN',
          reason: {
            es: 'Elige tu modalidad disponible en la autocomprobación para comparar.',
            en: 'Choose your available modality in the self-check to compare.',
          },
        };
      }
      if (criterion.requiredModalities.includes(profile.preferredModality)) {
        return {
          criterionId: criterion.id,
          status: 'MATCH',
          reason: {
            es: 'Coincide con tu preferencia de modalidad.',
            en: 'Matches your selected modality preference.',
          },
        };
      }
      if (
        profile.preferredModality === 'hybrid' &&
        (criterion.requiredModalities.includes('online') ||
          criterion.requiredModalities.includes('onsite'))
      ) {
        return {
          criterionId: criterion.id,
          status: 'NEEDS_CONFIRMATION',
          reason: {
            es: 'Indicaste disponibilidad híbrida; verifica si puedes cumplir el formato exacto publicado.',
            en: 'You selected hybrid availability; confirm if you can meet the exact published format.',
          },
        };
      }
      return {
        criterionId: criterion.id,
        status: 'MISMATCH',
        reason: {
          es: 'No coincide con la modalidad que marcaste como disponible.',
          en: 'Does not match the modality you marked as available.',
        },
      };
    }

    case 'education': {
      if (!criterion.minEducation) {
        return {
          criterionId: criterion.id,
          status: 'NEEDS_CONFIRMATION',
          reason: {
            es: 'Verifica directamente tu titulación específica frente a las bases oficiales.',
            en: 'Confirm your exact academic credential against the official rules.',
          },
        };
      }
      if (!profile.educationLevel) {
        return {
          criterionId: criterion.id,
          status: 'UNKNOWN',
          reason: {
            es: 'Selecciona tu nivel educativo actual para comparar este requisito.',
            en: 'Select your current education level to compare this requirement.',
          },
        };
      }
      if (criterion.minEducation === 'student_enrolled') {
        if (profile.educationLevel === 'student_enrolled') {
          return {
            criterionId: criterion.id,
            status: criterion.requiresExternalVerification ? 'NEEDS_CONFIRMATION' : 'MATCH',
            reason: criterion.requiresExternalVerification
              ? {
                  es: 'Matrícula compatible, pero debes confirmar carrera y fechas de graduación en la convocatoria.',
                  en: 'Enrolment matches, but confirm eligible degree and graduation window in the call.',
                }
              : {
                  es: 'Coincide con matrícula estudiantil activa.',
                  en: 'Matches active student enrolment.',
                },
          };
        }
        return {
          criterionId: criterion.id,
          status: 'MISMATCH',
          reason: {
            es: 'Esta oportunidad solicita matrícula estudiantil vigente.',
            en: 'This opportunity asks for current student enrolment.',
          },
        };
      }

      const userRank = EDUCATION_RANK[profile.educationLevel];
      const reqRank = EDUCATION_RANK[criterion.minEducation];
      if (userRank >= reqRank) {
        return {
          criterionId: criterion.id,
          status: criterion.requiresExternalVerification ? 'NEEDS_CONFIRMATION' : 'MATCH',
          reason: criterion.requiresExternalVerification
            ? {
                es: 'Nivel educativo compatible; confirma especialidad o promedio exigido en las bases.',
                en: 'Education level aligns; confirm specific major or GPA in the official rules.',
              }
            : {
                es: 'Tu nivel educativo alcanza el mínimo publicado.',
                en: 'Your education level meets the published minimum.',
              },
        };
      }
      return {
        criterionId: criterion.id,
        status: 'MISMATCH',
        reason: {
          es: 'El nivel educativo mínimo publicado es superior al indicado en tu perfil.',
          en: 'The published minimum education level is higher than selected in your profile.',
        },
      };
    }

    case 'language': {
      if (!criterion.requiredLanguage) {
        return {
          criterionId: criterion.id,
          status: 'NEEDS_CONFIRMATION',
          reason: {
            es: 'Confirma el idioma y nivel requerido en la fuente oficial.',
            en: 'Confirm the exact required language and level in the official source.',
          },
        };
      }
      if (profile.languages.length === 0) {
        return {
          criterionId: criterion.id,
          status: 'UNKNOWN',
          reason: {
            es: 'Marca tus idiomas disponibles en la autocomprobación.',
            en: 'Select your working languages in the self-check.',
          },
        };
      }
      if (profile.languages.includes(criterion.requiredLanguage)) {
        return {
          criterionId: criterion.id,
          status: criterion.requiresExternalVerification ? 'NEEDS_CONFIRMATION' : 'MATCH',
          reason: criterion.requiresExternalVerification
            ? {
                es: 'Idioma indicado; confirma si exigen certificado oficial o nivel B1/B2/C1.',
                en: 'Language selected; confirm if an official certificate or B1/B2/C1 level is required.',
              }
            : {
                es: 'Idioma incluido en tu autocomprobación.',
                en: 'Language included in your self-check.',
              },
        };
      }
      return {
        criterionId: criterion.id,
        status: 'MISMATCH',
        reason: {
          es: 'No marcaste el idioma requerido por esta oportunidad.',
          en: 'You did not select the language required by this opportunity.',
        },
      };
    }

    case 'experience': {
      if (!criterion.minExperience) {
        return {
          criterionId: criterion.id,
          status: 'NEEDS_CONFIRMATION',
          reason: {
            es: 'Confirma la experiencia práctica específica solicitada en la convocatoria.',
            en: 'Confirm the specific practical experience requested in the announcement.',
          },
        };
      }
      if (!profile.experienceLevel) {
        return {
          criterionId: criterion.id,
          status: 'UNKNOWN',
          reason: {
            es: 'Selecciona tu rango de experiencia para comparar este requisito.',
            en: 'Select your experience range to compare this requirement.',
          },
        };
      }
      const userRank = EXPERIENCE_RANK[profile.experienceLevel];
      const reqRank = EXPERIENCE_RANK[criterion.minExperience];
      if (userRank >= reqRank) {
        return {
          criterionId: criterion.id,
          status: criterion.requiresExternalVerification ? 'NEEDS_CONFIRMATION' : 'MATCH',
          reason: criterion.requiresExternalVerification
            ? {
                es: 'Años compatibles; verifica experiencia en la función o herramienta específica.',
                en: 'Duration aligns; verify experience in the exact role or tool.',
              }
            : {
                es: 'Rango de experiencia compatible con el mínimo publicado.',
                en: 'Experience range meets the published minimum.',
              },
        };
      }
      return {
        criterionId: criterion.id,
        status: 'MISMATCH',
        reason: {
          es: 'La experiencia mínima publicada supera el rango indicado.',
          en: 'Published minimum experience exceeds your selected range.',
        },
      };
    }

    case 'age':
    case 'legal':
    case 'document':
    default:
      return {
        criterionId: criterion.id,
        status: 'NEEDS_CONFIRMATION',
        reason: {
          es: 'UMBRAL no recopila edad, identidad ni documentos personales: confirma este punto directamente en la fuente oficial.',
          en: 'UMBRAL does not collect age, identity, or legal documents: verify this item directly on the official source.',
        },
      };
  }
}

export function evaluateOpportunityFit(
  opportunity: Opportunity,
  profile: SelfCheckProfile,
): OpportunityMatchSummary {
  const evaluations = opportunity.requirements.map((criterion) =>
    evaluateCriterion(criterion, profile),
  );
  const counts: Record<CriterionMatchStatus, number> = {
    MATCH: 0,
    MISMATCH: 0,
    NEEDS_CONFIRMATION: 0,
    UNKNOWN: 0,
  };
  for (const item of evaluations) {
    counts[item.status] += 1;
  }
  return { evaluations, counts };
}
