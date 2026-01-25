import * as yup from 'yup'

const createSignupSchema = t => yup.object({
  username: yup
    .string()
    .trim()
    .min(3, t('validation.nameLength'))
    .max(20, t('validation.nameLength'))
    .required(t('validation.required')),
  password: yup
    .string()
    .min(6, t('validation.passwordLength'))
    .required(t('validation.required')),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], t('validation.passwordMatch'))
    .required(t('validation.required')),
})

export default createSignupSchema
