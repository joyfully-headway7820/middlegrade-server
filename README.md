# middlegrade-server

Прокси между фронтендом MiddleGrade и API Journal (`msapi.top-academy.ru/api/v2`).

Прокси обязателен по двум причинам:

1. Journal требует заголовок `Referer: https://journal.top-academy.ru`, который браузер
   подделать не может.
2. Логин и пароль не должны попадать в браузерное хранилище — сессия живёт в
   зашифрованной httpOnly-cookie, которую JavaScript прочитать не может.

## Запуск

```bash
npm install
cp .env.example .env      # заполнить SESSION_SECRET
npm run dev               # http://localhost:3000
```

| Переменная        | Обязательна    | Назначение                                            |
| ----------------- | -------------- | ----------------------------------------------------- |
| `SESSION_SECRET`  | в production   | Ключ шифрования cookie. `openssl rand -hex 32`         |
| `ALLOWED_ORIGINS` | нет            | Origin'ы фронта через запятую. Пусто — разрешены все   |
| `APPLICATION_KEY` | нет            | Ключ приложения Journal, есть значение по умолчанию    |
| `PORT`            | нет            | По умолчанию 3000                                      |

## Сессия

`src/session.ts` шифрует `{username, password, token, tokenExpiresAt}` алгоритмом
AES-256-GCM (ключ выводится из `SESSION_SECRET` через scrypt) и кладёт в cookie
`mg_session` с флагами `httpOnly`, `secure` (в production), `sameSite=lax`.

Токен Journal живёт ~50 минут. `journalRequest` перевыпускает его прозрачно: по
истечении срока, а также однократно при ответе 401/403 от Journal.

Пароль хранится внутри cookie, чтобы перелогин был незаметным. Cookie
зашифрована и недоступна из JavaScript, но это компромисс: без него пользователю
пришлось бы вводить пароль каждый час.

## Cookie и домены

Cookie ставится как first-party на домен фронтенда. Это работает, только если
фронт обращается к прокси через свой же origin. У фронтенда для этого есть
rewrite `/api/*` в `vercel.json`. Если развернуть прокси на отдельном домене и
ходить к нему напрямую, cookie станет third-party — Safari её заблокирует.

## Маршруты

| Метод | Путь                          | Journal                                        |
| ----- | ----------------------------- | ---------------------------------------------- |
| POST  | `/auth/login`                 | `auth/login` + `settings/user-info`            |
| POST  | `/auth/logout`                | —                                              |
| GET   | `/auth/me`                    | `settings/user-info`                           |
| GET   | `/progress/marks`             | `progress/operations/student-visits`           |
| GET   | `/progress/exams`             | `progress/operations/student-exams`            |
| GET   | `/progress/quarterly`         | `progress/operations/school-quarterly-grades`  |
| GET   | `/dashboard/performance`      | `dashboard/progress/academic-performance`      |
| GET   | `/dashboard/attendance`       | `dashboard/progress/attendance-statistic`      |
| GET   | `/dashboard/activity`         | `dashboard/progress/activity`                  |
| GET   | `/dashboard/charts/:kind`     | `dashboard/chart/{average-progress,attendance,progress}` |
| GET   | `/dashboard/leaders/:scope`   | `dashboard/progress/leader-{group,stream}` + `-points` |
| GET   | `/schedule/month`             | `schedule/operations/get-month`                |
| GET   | `/schedule/day`               | `schedule/operations/get-by-date`              |
| GET   | `/schedule/range`             | `schedule/operations/get-by-date-range`        |
| GET   | `/schedule/events`            | `schedule/operations/month-events`             |
| GET   | `/homework`                   | `homework/operations/list`                     |
| GET   | `/homework/groups`            | `homework/settings/group-history`              |
| GET   | `/homework/counts`            | `count/homework`                               |
| GET   | `/payment`                    | `payment/operations/index`                     |
| GET   | `/payment/history`            | `payment/operations/history`                   |
| GET   | `/payment/schedule`           | `payment/operations/schedule`                  |
| GET   | `/reviews`                    | `reviews/index/list`                           |
| GET   | `/market`                     | `market/operations/{list,products,index}` + purchases |
| POST  | `/market/buy`                 | `market/operations/{buy,purchase}`             |

Записывающие операции Journal (создание обращений, отправка ДЗ) намеренно не проксируются,
кроме покупки в маркете (`POST /market/buy`) — она идёт через ту же сессионную cookie.
