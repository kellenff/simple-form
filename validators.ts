import {FormData} from './hooks';

export type FieldValidator<F, V = unknown> = {
  validate: (value: V, formData?: F) => boolean;
  message?: string;
};

// TODO: correctly infer narrowed K
export type ValidationPair<F extends FormData<unknown>, K extends keyof F = string> = [
  K,
  FieldValidator<F, F[K]>,
];

// eslint-disable-next-line no-confusing-arrow
export const applyValidators = <F extends FormData<unknown>>(
  validators: Partial<Record<keyof F, FieldValidator<F>[]>> | ReadonlyArray<ValidationPair<F>>,
  formData: F,
): Partial<Record<keyof F, string>> =>
  Array.isArray(validators)
    ? (validators as ReadonlyArray<ValidationPair<F, keyof F>>).reduce<
        Partial<Record<keyof F, string>>
      >((errors, [key, validator]) => {
        if ((validator as FieldValidator<F, F[typeof key]>).validate(formData[key])) {
          return errors;
        }

        return {
          ...errors,
          [key]: validator.message,
        };
      }, {})
    : Object.entries(validators).reduce(
        (acc, [name, fieldValidators]: [keyof F, FieldValidator<F>[]]) => {
          // eslint-disable-next-line no-confusing-arrow
          const messages = fieldValidators.flatMap(({validate, message}) =>
            validate(formData[name], formData) ? [] : [message ?? `${name} is invalid`],
          );
          return {...acc, [name]: messages[0]};
        },
        {},
      );
