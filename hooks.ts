import {ChangeEvent, ChangeEventHandler, useState} from 'react';

export type UseForm<F extends Record<string, unknown>> = {
  formData: F;
  setValue: <K extends keyof F>(name: K, value: F[K]) => void;
  field: <K extends keyof F>(
    name: K,
    opts?: FieldOpts<F, K>,
  ) => {
    value: F[K];
    onChange: ChangeEventHandler<HTMLInputElement>;
  };
  errors: Partial<Record<keyof F, string>>;
  isValid: boolean;
};

interface FormData<V extends unknown> extends Record<string, V> {}

export type FieldOpts<F extends FormData<unknown>, K extends keyof F> = {
  validate?: {validator?: (value: F[K]) => boolean; message?: string};
  map?: (event: ChangeEvent<HTMLInputElement>) => F[K];
};

export const useForm = <F extends FormData<unknown>>(initialValues: F): UseForm<F> => {
  const [formData, setFormData] = useState<F>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof F, string>>>({});

  const setValue = <K extends keyof F>(name: K, value: F[K]): void => {
    setFormData({...formData, [name]: value});
  };

  const field = <K extends keyof F>(name: K, opts: FieldOpts<F, K> = {}) => ({
    name,
    value: formData[name],
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const value = opts.map === void 0 ? (event.currentTarget.value as F[K]) : opts.map(event);
      const validationResult = opts.validate?.validator?.(value);
      setValue(name, value);
      setErrors({
        ...errors,
        [name]:
          validationResult === false ? opts.validate?.message ?? `${name} invalid` : undefined,
      });
    },
    error: errors[name] !== void 0,
    helperText: errors[name],
  });

  return {
    formData,
    setValue,
    field,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
