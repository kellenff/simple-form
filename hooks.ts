/*
 * TODO: simplify custom onChange value generic logic
 */
import {ChangeEvent, useState} from 'react';

export type UseForm<F extends Record<string, unknown>> = {
  formData: F;
  setValue: <K extends keyof F>(name: K, value: F[K]) => void;
  setValues: (data: Partial<F>) => void;
  field: <K extends keyof F, V = ChangeEvent<HTMLInputElement>>(
    name: K,
    opts?: FieldOpts<F, K, V>,
  ) => {
    value: F[K];
    onChange: (value: V) => void;
  };
  errors: Partial<Record<keyof F, string>>;
  isValid: boolean;
  reset: (data?: F) => void;
};

interface FormData<V extends unknown> extends Record<string, V> {}

const isEvent = (v: unknown): v is ChangeEvent => {
  if (
    !(
      v !== null &&
      typeof v === 'object' &&
      Object.prototype.hasOwnProperty.call(v, 'currentTarget')
    )
  ) {
    return false;
  }

  const {currentTarget} = v as {currentTarget: unknown};

  return (
    currentTarget !== null &&
    typeof currentTarget === 'object' &&
    Object.prototype.hasOwnProperty.call(currentTarget, 'value') &&
    typeof (currentTarget as {value: unknown}).value === 'string'
  );
};

export type FieldValidator<F> = {
  validate: (value: unknown, formData?: F) => boolean;
  message?: string;
};

export type FormOpts<F extends FormData<unknown>> = {
  validators?: Partial<Record<keyof F, FieldValidator<F>[]>>;
};

export type FieldOpts<
  F extends FormData<unknown>,
  K extends keyof F,
  V = ChangeEvent<HTMLInputElement>,
> = {
  map?: (event: V) => F[K];
  muiHelpers?: ['error', 'helperText'];
};

export const useForm = <F extends FormData<unknown>>(
  initialValues: F,
  options?: FormOpts<F>,
): UseForm<F> => {
  const [formData, setFormData] = useState<F>(initialValues);
  const errors: Partial<Record<keyof F, string | undefined>> = Object.entries(
    options?.validators ?? {},
  ).reduce((acc, [name, validators]) => {
    const messages = validators?.flatMap(({validate, message}) =>
      validate(formData[name], formData) ? [] : [message ?? `${name} is invalid`],
    );

    return {...acc, [name]: messages?.[0]};
  }, {});

  const setValue = <K extends keyof F>(name: K, value: F[K]): void => {
    setFormData({...formData, [name]: value});
  };

  const setValues = (data: Partial<F>) => {
    setFormData((f) => ({...f, ...data}));
  };

  const field = <K extends keyof F, V = ChangeEvent<HTMLInputElement>>(
    name: K,
    opts: FieldOpts<F, K, V> = {},
  ) => ({
    name,
    value: formData[name],
    onChange: (fieldValue: V) => {
      if (!isEvent(fieldValue) && opts.map === void 0) {
        throw new TypeError(
          'Non-event field handlers require a mapping from onChange value to form value',
        );
      }
      const value =
        opts.map === void 0
          ? ((fieldValue as unknown as ChangeEvent<HTMLInputElement>).currentTarget.value as F[K])
          : opts.map(fieldValue);
      setValue(name, value);
    },
    error: opts.muiHelpers?.includes('error') === true ? errors[name] !== void 0 : undefined,
    helperText: opts.muiHelpers?.includes('helperText') === true ? errors[name] : undefined,
  });
  const reset = (v?: F) => {
    setFormData(v ?? initialValues);
  };

  return {
    formData,
    setValue,
    field,
    errors,
    isValid: !Object.values(errors).some((v) => v !== void 0),
    reset,
    setValues,
  };
};
