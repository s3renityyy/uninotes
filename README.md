# Шаги для запуска

Нужно заменить RECAPTCHA_SECRET_KEY на RECAPTCHA_SECRET_KEY_LOCAL
Нужно заменить VITE_RECAPTCHA_SITE_KEY на VITE_RECAPTCHA_SITE_KEY_LOCAL

Создаем в корневой директории файл .env и заполняем в точности так:

MONGODB_URI=mongodb+srv://Uninotes:dowahjdiuwahdiuh821y3e8qhwsidha@uninotes.f0rahbp.mongodb.net/
PORT=9000
JWT_SECRET=dasdasd!@!@!FAD12124asdasdadwad9182d8912jd91j2!9d8j192dj91jd291dj81298dj1892d
JWT_SECRET_ADMIN=PUIHSDpiunPINFDPAUIndPNDAPiwundPwudnaw81378JWQC9JD\*j
ADMIN_KEY=dao312IJ412ODSoaij31@J9JDJ!jdJ!DJASDAjAODP
NODE_ENV=local
RECAPTCHA_SECRET_KEY_LOCAL=6LeJmyErAAAAAO8VeUAX0bxg8vLIp1P-WFKT2d0R
FRONTEND_URL=http://localhost:5173

В frontend также создаем .env с таким содержимым:
VITE_BACKEND_URL=http://localhost:9000
VITE_RECAPTCHA_SITE_KEY_LOCAL=6LeJmyErAAAAAGSTwh3LkMW8om7xh4WQ_1hoBeRI

### В корневой директории пишем

- npm i
- npm run start

### Открываем новый терминал и пишем

- cd frontend
- npm i
- npm run dev

Сервер будет запущен на localhost:5173
