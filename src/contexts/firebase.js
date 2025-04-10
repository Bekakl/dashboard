import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    // Твои ключи конфигурации Firebase
    apiKey: "AIzaSyA5PBqbeDY49WJsZuL5iJZy9NLdq0GWYsA", // Лучше скрыть в реальном проекте (например, через .env файлы)
    authDomain: "lab5-efba9.firebaseapp.com",
    projectId: "lab5-efba9",
    storageBucket: "lab5-efba9.firebasestorage.app",
    messagingSenderId: "218013766481",
    appId: "1:218013766481:web:1b0cc942dc981740f13970",
    measurementId: "G-982ZF3EZVH" // Опционально, для Google Analytics
};

// Инициализация Firebase приложения
const app = initializeApp(firebaseConfig);

// Инициализация сервисов Firebase (Auth и Firestore)
const auth = getAuth(app);
const db = getFirestore(app);

// Логирование для проверки (полезно при разработке)
// console.log('Firebase app initialized:', app ? 'OK' : 'Failed');
// console.log('Firebase Auth instance:', auth ? 'OK' : 'Failed');
// console.log('Firestore instance:', db ? 'OK' : 'Failed');

// Экспортируем инициализированные экземпляры для использования в других частях приложения
export { app, auth, db };
