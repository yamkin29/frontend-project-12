import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  ru: {
    translation: {
      appName: 'Hexlet Chat',
      auth: {
        login: 'Войти',
        logout: 'Выйти',
        signup: 'Регистрация',
        signupTitle: 'Регистрация',
        signupButton: 'Зарегистрироваться',
        hasAccount: 'Есть аккаунт?',
        noAccount: 'Нет аккаунта?',
        username: 'Имя пользователя',
        usernamePlaceholder: 'От 3 до 20 символов',
        nicknamePlaceholder: 'Ваш ник',
        password: 'Пароль',
        passwordPlaceholder: 'Не менее 6 символов',
        confirmPassword: 'Подтвердите пароль',
        confirmPasswordPlaceholder: 'Пароли должны совпадать',
        loginError: 'Неверные имя пользователя или пароль',
        signupConflict: 'Такой пользователь уже существует',
        signupError: 'Не удалось зарегистрироваться',
      },
      channels: {
        title: 'Каналы',
        add: 'Добавить канал',
        remove: 'Удалить',
        rename: 'Переименовать',
        manage: 'Управление каналом',
        removeTitle: 'Удалить канал',
        renameTitle: 'Переименовать канал',
        confirmRemove: 'Уверены?',
        cancel: 'Отменить',
        send: 'Отправить',
        submit: 'Отправить',
        addTitle: 'Добавить канал',
        addError: 'Не удалось создать канал',
        renameError: 'Не удалось переименовать канал',
        removeError: 'Не удалось удалить канал',
        nameLabel: 'Имя канала',
      },
      chat: {
        messagesCount: '{{count}} сообщений',
        newMessage: 'Новое сообщение',
        messagePlaceholder: 'Введите сообщение...',
        sendError: 'Не удалось отправить сообщение. Проверьте соединение.',
      },
      common: {
        loading: 'Loading...',
      },
      validation: {
        required: 'Обязательное поле',
        nameLength: 'От 3 до 20 символов',
        passwordLength: 'Не менее 6 символов',
        passwordMatch: 'Пароли должны совпадать',
        uniqueChannel: 'Имя канала должно быть уникальным',
      },
      notFound: {
        title: '404',
        text: 'Page not found.',
        toLogin: 'Go to login',
      },
    },
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
