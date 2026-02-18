import {
  Constants,
  DATE_FORMATS,
  ERROR_FORM_VALIDATION,
  NUMBERS,
  REGEX,
} from "../constants/constants";
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";
import {
  format,
  parseISO,
  isDate,
  isAfter,
  isBefore,
  isValid,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ResponseMeta } from "../models/response";

export function markAllAsTouched(form: FormGroup): void {
  for (const inner in form.controls) {
    const control = form.get(inner);
    if (control) {
      control.markAsTouched();
      control.updateValueAndValidity();
      control.markAsDirty();
    }
  }
}

export function convertDateStringsToDatesImmutable<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) =>
      convertDateStringsToDatesImmutable(item),
    ) as unknown as T;
  }

  if (input && typeof input === "object") {
    const result: any = {};
    for (const key of Object.keys(input)) {
      const value = (input as any)[key];

      if (typeof value === "string" && REGEX.DATE_FORMAT.test(value)) {
        const parsed = parseISO(value);
        result[key] = isValid(parsed) ? parsed : value;
      } else {
        result[key] = convertDateStringsToDatesImmutable(value);
      }
    }
    return result;
  }

  return input;
}

export function convertDatesToStringsImmutable<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) =>
      convertDatesToStringsImmutable(item),
    ) as unknown as T;
  }

  if (input && typeof input === "object") {
    const result: any = {};
    for (const key of Object.keys(input)) {
      const value = (input as any)[key];

      if (isDate(value)) {
        result[key] = format(value, DATE_FORMATS.date_format_api);
      } else {
        result[key] = convertDatesToStringsImmutable(value);
      }
    }
    return result;
  }

  return input;
}

export function replaceNestedObjectsWithId(
  obj: any,
  excludeKeys: string[] = [],
): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceNestedObjectsWithId(item, excludeKeys));
  }

  if (obj !== null && typeof obj === "object") {
    const newObj: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (excludeKeys.includes(key)) {
        newObj[key] = value;
      } else if (
        value &&
        typeof value === "object" &&
        "id" in value &&
        Object.keys(value).length > 0
      ) {
        newObj[key] = value.id;
      } else {
        newObj[key] = replaceNestedObjectsWithId(value, excludeKeys);
      }
    }
    return newObj;
  }
  return obj;
}

export function extractFilesToFormData(
  obj: any,
  formData: FormData = new FormData(),
  path: string[] = [],
): FormData {
  if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      const currentPath = [...path, key];

      if (value instanceof File) {
        // Une el path con puntos para simular claves anidadas (o puedes usar otro formato como brackets)
        formData.append(currentPath.join("."), value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          extractFilesToFormData(item, formData, [
            ...currentPath,
            index.toString(),
          ]);
        });
      } else if (typeof value === "object") {
        extractFilesToFormData(value, formData, currentPath);
      }
    }
  }

  return formData;
}

export function lowerFirstLetter(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export enum ComparisonOperator {
  Greater = "greater",
  Less = "less",
}

function compareDates(
  dateA: string,
  dateB: string,
  operation: ComparisonOperator,
): boolean {
  const parsedA = parseISO(dateA);
  const parsedB = parseISO(dateB);

  switch (operation) {
    case ComparisonOperator.Greater:
      return isAfter(parsedA, parsedB);
    case ComparisonOperator.Less:
      return isBefore(parsedA, parsedB);
    default:
      throw new Error("Invalid comparison operation");
  }
}

export const dateComparisonValidator = (
  startField: string,
  endField: string,
  operation: ComparisonOperator,
  translateField: string,
): ValidatorFn => {
  return (form: AbstractControl): ValidationErrors | null => {
    const startControl = form.get(startField);
    const endControl = form.get(endField);
    const startDate = startControl?.value;
    const endDate = endControl?.value;

    if (startDate && endDate && !compareDates(startDate, endDate, operation)) {
      startControl?.setErrors({
        [ERROR_FORM_VALIDATION[operation]]: translateField,
      });
    } else {
      if (startControl?.hasError(ERROR_FORM_VALIDATION[operation])) {
        startControl.setErrors(null);
      }
    }

    return null;
  };
};

export const concatString = (strings: string[], separador = ", "): string => {
  if (strings.length === 0) return Constants.emptyString;
  return strings.filter((e: string) => e).join(separador);
};

export const GENERATE_NUMBERS_SCALE = (length: number) => {
  return Array.from({ length }, (_, i) => i + 1);
};

export const windowToTop = (): void => {
  window.scrollTo({
    top: NUMBERS.ZERO,
    behavior: "smooth",
  });
};

export const getUserInitials = (name: string): string => {
  if (!name) return Constants.emptyString;

  if (name.includes(" ")) {
    const names = name.split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    const initials = names.map((n) => n.charAt(0).toUpperCase()).join("");
    return initials;
  } else {
    const initials = name.match(/[A-Z]/g);
    return initials ? initials[0] + initials[1] : name.charAt(0).toUpperCase();
  }
};

export function defaultPaginator(array: any[]): ResponseMeta {
  return {
    from: array.length ? NUMBERS.ONE : NUMBERS.ZERO,
    to: array.length,
    total: array.length,
    current_page: 1,
    last_page: 1,
  };
}

export function flattenErrors(
  errors: Record<string, string | string[]>,
): string[] | null {
  const result: string[] = [];
  if (!errors || typeof errors !== "object") {
    return null;
  }
  for (const value of Object.values(errors)) {
    if (Array.isArray(value)) {
      result.push(...value);
    } else if (typeof value === "string") {
      result.push(value);
    }
  }

  return result.length > NUMBERS.ZERO ? result : null;
}

export function isFlatObject(obj: Record<string, any>): boolean {
  return Object.values(obj).every(
    (value) =>
      typeof value !== "object" || value === null || Array.isArray(value),
  );
}

export function convertString(
  str: string,
  properties: { lower?: boolean; upper?: boolean; camel?: boolean } = {},
): string {
  if (properties.lower) str = str.toLowerCase();
  if (properties.upper) str = str.toUpperCase(); // cuidado: upper debe ir antes de camel si se usa
  if (properties.camel) {
    str = str
      .toLowerCase()
      .replace(/[-_\s]+(.)?/g, (_, group1) =>
        group1 ? group1.toUpperCase() : "",
      );
  }
  return str;
}

export function fixNumber(
  value: number | string,
  decimals: number = NUMBERS.TWO,
): string {
  return Number(value).toFixed(decimals);
}

export function getLastMonthsNames(
  defaultLength: number = NUMBERS.SIX,
): string[] {
  const today = new Date();
  return Array.from({ length: defaultLength }, (_, i) => {
    const month = format(
      subMonths(today, defaultLength - NUMBERS.ONE - i),
      "MMMM",
      { locale: es },
    );
    return month.charAt(NUMBERS.ZERO).toUpperCase() + month.slice(NUMBERS.ONE);
  });
}

export const getCssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();
