import {test} from 'uvu';
import * as assert from 'uvu/assert';

import {applyValidators, FieldValidator, ValidationPair} from '../validators';

import type {FormData} from '../hooks';

interface TestForm extends FormData<unknown> {
  s: string;
  n: number;
  b: boolean;
}

test('applyValidators object on valid', () => {
  const formData: TestForm = {
    s: 'hello',
    n: 1,
    b: true,
  };
  const validators: Record<keyof TestForm, FieldValidator<TestForm>[]> = {
    s: [
      {
        validate: (str) => str === 'hello',
      },
    ],
    n: [
      {
        validate: (num) => num === 1,
      },
    ],
    b: [
      {
        validate: (bool) => bool === true,
      },
    ],
  };

  const errors = applyValidators(validators, formData);

  Object.entries(errors).forEach(([k, v]) => {
    assert.equal(v, void 0, `expected ${k} to be undefined, got ${v}`);
  });
});

test('applyValidators object on invalid', () => {
  const formData: TestForm = {
    s: 'hellos',
    n: 2,
    b: false,
  };
  const validators: Record<keyof TestForm, FieldValidator<TestForm>[]> = {
    s: [
      {
        validate: (str) => str === 'hello',
        message: 'invalid s',
      },
    ],
    n: [
      {
        validate: (num) => num === 1,
        message: 'invalid n',
      },
    ],
    b: [
      {
        validate: (bool) => bool === true,
        message: 'invalid b',
      },
    ],
  };

  const errors = applyValidators(validators, formData);

  Object.entries(errors).forEach(([k, v]) => {
    assert.equal(v, `invalid ${k}`, `expected ${k} to be the error message, got ${v}`);
  });
});

test('applyValidators array on valid', () => {
  const formData: TestForm = {
    s: 'hello',
    n: 1,
    b: true,
  };
  const validators = [
    ['s', {validate: (v) => v === 'hello', message: 'invalid s'}] as ValidationPair<TestForm>,
    ['n', {validate: (v) => v === 1, message: 'invalid n'}] as ValidationPair<TestForm>,
    ['b', {validate: (v) => v, message: 'invalid b'}] as ValidationPair<TestForm>,
  ];

  const errors = applyValidators<TestForm>(validators, formData);

  assert.equal(errors, {}, 'expected form to be valid');
});

test('applyValidators array on invalid', () => {
  const formData: TestForm = {
    s: 'hellos',
    n: 2,
    b: false,
  };
  const validators = [
    ['s', {validate: (v) => v === 'hello', message: 'invalid s'}] as ValidationPair<TestForm>,
    ['n', {validate: (v) => v === 1, message: 'invalid n'}] as ValidationPair<TestForm>,
    ['b', {validate: (v) => v, message: 'invalid b'}] as ValidationPair<TestForm>,
  ];

  const errors = applyValidators<TestForm>(validators, formData);

  assert.equal(
    errors,
    {s: 'invalid s', n: 'invalid n', b: 'invalid b'},
    'expected errors to be populated',
  );
});

test.run();
