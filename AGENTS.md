# IRON FIT — CrossFit Web App (Pasantía Aibbys)
> Documento de contexto para el agente de IA. Actualizado al 28-03-2026.

---

## ROL DEL AGENTE
Actúas como un Ingeniero de Software Senior experto en Next.js 15, TypeScript y PostgreSQL/Supabase.
Tu objetivo es mantener y extender una aplicación de gestión para un box de CrossFit venezolano.
Siempre genera código modular, limpio y tipado. Prioriza Server Actions sobre fetch manual.

---

## STACK TECNOLÓGICO (REAL, VERIFICADO)
| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript estricto |
| Base de datos | Supabase (PostgreSQL) |
| Estilos | Tailwind CSS v4 + Shadcn/ui |
| Gráficas | Recharts |
| Auth | Supabase Auth (SSR con `@supabase/ssr`) |
| Storage | Supabase Storage (bucket `avatars`) |
| Estado cliente | useState / useCallback (no Zustand actualmente) |

---

## ESTRUCTURA DEL PROYECTO
```
src/
├── actions/          # Server Actions (auth, athletes, coaches, wods, payments, prs, results, ratings, feedback, notifications, profile)
├── app/
│   ├── (auth)/       # login, update-password
│   ├── (dashboard)/  # layout con Sidebar
│   │   ├── page.tsx              # Dashboard principal (atleta e admin)
│   │   ├── profile/              # Perfil propio del usuario
│   │   ├── wods/                 # Feed de WODs del atleta + detalle [id]
│   │   ├── prs/                  # Gestión de PRs del atleta
│   │   ├── tracker/              # Workout tracker en vivo
│   │   ├── coaches/              # Vista pública del cuerpo técnico
│   │   ├── payment/              # Pantalla de bloqueo por mora
│   │   └── admin/
│   │       ├── wods/             # CRUD de WODs + builder avanzado (/builder)
│   │       ├── athletes/         # CRUD atletas + detalle [id]
│   │       ├── coaches/          # CRUD entrenadores (solo SUPERADMIN)
│   │       ├── movements/        # CRUD movimientos base
│   │       ├── payments/         # Gestión de pagos + filtros de fecha
│   │       └── ratings/          # Dashboard de satisfacción + filtros
│   ├── auth/callback/            # Callback de Supabase OAuth
│   └── payment/                  # Pantalla de suspensión por deuda
├── components/
│   ├── charts/       # pr-progress-chart, satisfaction-chart, wod-activity-chart
│   ├── ui/           # Shadcn primitivas
│   └── [28 componentes]  # Ver lista abajo
├── lib/
│   ├── supabase/     # server, client, admin, middleware
│   └── types/        # database.ts (tipos generados/manuales)
└── middleware.ts     # Auth + bloqueo de deuda
```

---

## SCHEMA DE BASE DE DATOS (REAL, VERIFICADO)
```sql
-- Tablas activas en Supabase:
profiles            -- id, role(SUPERADMIN|ADMIN|USER), full_name, avatar_url,
                    -- weight_kg, height_cm, coach_schedule, last_payment_date,
                    -- is_active, cedula, phone, birth_date, created_at, updated_at

wods                -- id, title, date, notes, created_by(→profiles), created_at
wod_sections        -- id, wod_id, section_type(AMRAP|EMOM|FOR_TIME|…), time_cap_seconds,
                    -- description, order_index
wod_section_movements -- id, section_id, movement_id, reps, weight_kg, notes, order_index

movements           -- id, name, description, video_url, image_url, category
personal_records    -- id, user_id, movement_id, weight_value, notes, created_at

wod_results         -- id, user_id, section_id, score_value, score_type(TIME|REPS|WEIGHT|ROUNDS),
                    -- notes, created_at

payments            -- id, user_id, amount, payment_date, due_date, status(PAID|PENDING|OVERDUE),
                    -- method, notes, created_by, created_at

notifications       -- id, user_id, title, message, type, is_read, created_at

class_feedback      -- id, user_id, wod_id, rating(1-5), comment, created_at
app_ratings         -- id, user_id, rating(1-5), comment, period(YYYY-MM), created_at
```

---

## ROLES Y REGLAS DE NEGOCIO
| Rol | Acceso |
|---|---|
| `SUPERADMIN` | Todo + gestión de coaches (`/admin/coaches`) |
| `ADMIN` | Gestión de atletas, WODs, pagos, movimientos, ratings |
| `USER` | Dashboard, feed de WODs, registrar scores, PRs, perfil, feedback |

**Regla de Deuda (middleware.ts):**
- Si `last_payment_date` tiene más de **3 días** → redirigir a `/payment`
- 1-3 días de mora → banner de aviso amarillo en dashboard (no bloquea)
- El campo `last_payment_date` se actualiza al registrar un pago con `status = PAID`

**Privacidad (RLS implícita en código):**
- Un USER solo puede editar su propio perfil y resultados
- Los scores de otros atletas son visibles en leaderboard (solo score, no datos personales)

---

## COMPONENTES CLAVE (src/components/)
| Componente | Función |
|---|---|
| `athlete-form.tsx` | Crear/editar atleta (cédula, teléfono, nacimiento, credenciales, físico) |
| `coach-form.tsx` | Crear/editar entrenador (mismos campos + horario) |
| `wod-form.tsx` | Formulario complejo de WOD con secciones y movimientos |
| `workout-tracker.tsx` | Tracker de WOD en tiempo real para el atleta |
| `score-form.tsx` | Registrar score de una sección del WOD |
| `pr-form.tsx` | Registrar un nuevo PR de movimiento |
| `payment-form.tsx` | Registrar/editar pago (admin) |
| `payment-actions.tsx` | Aprobar/rechazar pagos |
| `profile-edit-dialog.tsx` | Editar perfil propio (foto, físico, cédula, teléfono, nacimiento) |
| `notifications.tsx` | Bell de notificaciones in-app con badge |
| `app-rating-modal.tsx` | Modal mensual para calificar la app (⭐) |
| `class-feedback-form.tsx` | Comentario + rate al finalizar una clase |
| `weight-recommendation.tsx` | Muestra peso sugerido según % del PR |
| `sidebar.tsx` | Navegación lateral (roles) |
| `search-input.tsx` | Input de búsqueda con URL params |
| `date-filter.tsx` | Filtro de rango de fechas (URL params) |
| `charts/` | pr-progress-chart, satisfaction-chart, wod-activity-chart |

---

## ESTADO REAL DE REQUERIMIENTOS

### ✅ IMPLEMENTADO Y FUNCIONANDO
| RF | Descripción | Dónde |
|---|---|---|
| RF-01 | Alta/baja/modificación de atletas | `/admin/athletes` + `athlete-form` |
| RF-02 | Roles (SUPERADMIN / ADMIN / USER) | `middleware.ts` + sidebar |
| RF-03 | Perfil con stats, PRs, historial de WODs | `/profile`, `/admin/athletes/[id]` |
| RF-04 | CRUD WODs diarios por bloques | `/admin/wods` + `wod-form` + builder |
| RF-05 | Registro de scores del atleta | `score-form`, `workout-tracker` |
| RF-06 | PRs de movimientos básicos | `/prs`, `pr-form`, `pr-history-dialog` |
| RF-09 | Gestión de mensualidades | `/admin/payments`, `payment-form` |
| RF-10 | Notificaciones in-app | `notifications.tsx`, `actions/notifications.ts` |
| RF-11 | Bloqueo automático >3 días de mora | `middleware.ts` + `/payment` page |
| RF-12 | Historial de clases por atleta | `/profile` + `/admin/athletes/[id]` |
| RF-13 | Rate y comentario por clase (class_feedback) | `class-feedback-form.tsx` |
| RF-14 | Rating mensual de la app (app_ratings) | `app-rating-modal.tsx` |
| RF-15 | Gráfica de satisfacción | `satisfaction-chart` + `/admin/ratings` |

### ❌ PENDIENTE
| RF | Descripción | Prioridad |
|---|---|---|
| RF-07 | **Pesos personalizados por atleta** — El entrenador asigna un peso diferente a cada atleta en los movimientos de cada WOD. Requiere tabla `athlete_wod_weights` y UI en el builder. | 🔴 Alta |
| RF-08 | **Algoritmo de recomendación** — Calcular el % de peso sugerido a partir del PR del atleta y la duración del ejercicio. El componente `weight-recommendation.tsx` existe pero el cálculo es básico. | 🟡 Media |
| — | **Ruta `/auth/signout`** — La página `/payment` usa `<form action="/auth/signout">` pero esa ruta no existe. Usar `logout()` de `actions/auth.ts` | 🔴 Alta (bug) |
| — | **Email notifications** — Las notificaciones están en BD pero no hay envío por email. Supabase Edge Functions o Resend. | 🟢 Baja |

---

## INSTRUCCIONES DE CÓDIGO
1. **Server Actions primero** — Todas las mutaciones van en `src/actions/`.
2. **Tipos desde `src/lib/types/database.ts`** — No usar `any` si hay tipo disponible.
3. **URL Search Params para filtros** — Ver patrón en `search-input.tsx` y `date-filter.tsx`.
4. **Mobile-First** — Botones grandes, grids responsive, `hidden md:table-cell` para columnas opcionales.
5. **SQL nuevo** — Crear `supabase/schema-faseX.sql` y documentar allí, no editar schemas anteriores.
6. **RLS** — Toda tabla nueva debe definir políticas Row Level Security.
7. **Formularios con secciones** — Ver `athlete-form.tsx` como referencia de secciones con separadores.
8. **El sidebar** — No tocar las rutas del sidebar sin verificar que la ruta existe en `app/`.

---

## PRÓXIMOS PASOS RECOMENDADOS (por prioridad)
1. **Arreglar bug `/auth/signout`** → Convertir el form de la página `/payment` en un Server Action que llame a `logout()`.
2. **RF-07 Pesos por atleta** → Tabla `athlete_wod_weights(athlete_id, section_movement_id, weight_kg)` + UI en el detalle del WOD para que el coach asigne pesos individuales.
3. **RF-08 Recomendación** → En el builder de WOD, al asignar un movimiento con peso, mostrar automáticamente el % del PR de cada atleta.

---

## CONTEXTO DEL GYM
- **Nombre:** Iron Fit Box CrossFit
- **País:** Venezuela (UTC-4, moneda: USD/Bolívares, cédula de identidad venezolana)
- **Usuarios típicos:** 10-50 atletas, 1-3 entrenadores, 1 superadmin
- **Dispositivos:** Principalmente móvil (atletas en el gym entre ejercicios)

crossfitApp
AibbysCrossfit