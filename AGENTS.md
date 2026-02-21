# PROYECTO WEB APP CROSSFIT PARA PASANTIA AIBBYS
## CONVERSACIÓN CON CLIENTE
1.	Ver el progreso de todos los atletas
2.	Los clientes pueden registrar sus tiempos cada dia en cada wod
3.	Poder ver sus estadísticas de mejora o declive en su perfil
4.	Que arroje recomendaciones
5.	El entrenador es el que hace la gestión de nuevos usuarios clientes
6.	Que se pueda gestionar los pagos de la mensualidad notificaciones y restricción de sistema a los 3 dias de deuda
7.	Modulo de Wods y movimientos básicos donde se puedan registrar los pesos máximos. Que el entrenador pueda preparar los wods desde la app para cada bloque de clase y pueda modificar el peso que va a utilizar cada cliente personalizadamente en los ejercicios que tienen peso. Hay un porcentaje de peso en base al tiempo que dura el ejercicio, etc. 
8.	Se puede hacer que haya un historial de clases y en cada clase dada haya una sección de comentarios donde puedan dejar un rate y un comment
9.	Tambien una sección de rate a la app cada mensualidad por estrellitas, con una grafica que muestre que tan influyente ha sido la app para el gym
## STACK TECNOLÓGICO
**Frontend/Backend:** Next.js (App Router). Es el estándar.
**Base de Datos (SQL Online):** Supabase (PostgreSQL).
## REQUERIMIENTOS
## Requerimientos Funcionales (RF)
Son las funciones directas que el sistema debe ejecutar para satisfacer las necesidades del usuario y del gimnasio.
## Gestión de Usuarios y Perfiles
•	**RF-01:** El sistema debe permitir al entrenador realizar el alta, baja y modificación de usuarios (atletas).
•	**RF-02:** El sistema debe diferenciar roles de acceso: Entrenador (administrador) y Atleta (cliente).
•	**RF-03:** Cada atleta debe tener un perfil donde se visualicen sus estadísticas personales de mejora o declive.
## Módulo de Entrenamiento (WODs)
•	**RF-04:** El entrenador debe poder crear y gestionar los WODs (Workout of the Day) diarios por bloques de clase.
•	**RF-05:** El sistema debe permitir a los atletas registrar sus resultados (tiempos, rondas, repeticiones) cada día.
•	**RF-06:** El sistema debe permitir el registro de Pesos Máximos (PRs) en movimientos básicos.
•	**RF-07:** El entrenador debe poder modificar de forma personalizada el peso sugerido para cada cliente en los ejercicios de fuerza.
•	**RF-08:** El sistema debe calcular recomendaciones de peso basadas en porcentajes y el tiempo de duración del ejercicio.
## Gestión Administrativa y Pagos
•	**RF-09:** El sistema debe gestionar el estatus de las mensualidades de los atletas.
•	**RF-10:** El sistema debe enviar notificaciones de cobro a los usuarios.
•	**RF-11:** El sistema debe restringir automáticamente el acceso a los atletas que presenten una deuda mayor a 3 días.
## Feedback e Historial
•	**RF-12:** El sistema debe mantener un historial de clases dadas.
•	**RF-13:** Los atletas deben poder dejar un comentario y una calificación (rate) al finalizar cada clase.
•	**RF-14:** El sistema debe solicitar una calificación mensual de la app mediante un sistema de estrellas.
•	**RF-15:** El sistema debe generar una gráfica que muestre la influencia de la app en el gimnasio (basado en el feedback).
## Requerimientos No Funcionales (RNF)
Son las características de calidad, rendimiento y restricciones que aseguran que el sistema funcione correctamente.
•	**RNF-01 (Usabilidad):** La interfaz debe ser Mobile-First, optimizada para que los atletas puedan registrar datos rápidamente entre ejercicios.
•	**RNF-02 (Rendimiento):** El sistema debe soportar una carga mediana de usuarios (concurrencia en horas pico de clase) sin degradar el tiempo de respuesta.
•	**RNF-03 (Disponibilidad):** La aplicación y la base de datos SQL deben estar disponibles en línea el 99.9% del tiempo.
•	**RNF-04 (Seguridad):** El acceso a los datos debe estar protegido mediante autenticación. Un atleta no debe poder ver ni editar los registros privados de otro.
•	**RNF-05 (Escalabilidad):** La arquitectura debe permitir el crecimiento del número de atletas y registros de historial sin necesidad de reescribir el código base.
•	**RNF-06 (Mantenibilidad):** El código debe seguir las mejores prácticas de Next.js y estar documentado para facilitar futuras actualizaciones.
## ROADMAP
Este roadmap está diseñado para tener una versión usable lo antes posible.
•	**Fase 1: El Núcleo (Semanas 1-2)**
o	Configurar Next.js + Supabase.
o	Crear tablas SQL: users, wods, movements, results.
o	RF-01: Login y Registro (solo por Admin).
o	RF-02: CRUD de WODs (El entrenador puede crear la clase de mañana).
•	**Fase 2: La Pizarra Digital (Semanas 3-4)**
o	RF-03: Vista del atleta para "Loguear score".
o	RF-04: Vista del entrenador "Leaderboard" del día.
o	RF-07: Lógica básica de pesos (guardar PRs de movimientos básicos).
•	**Fase 3: El Negocio (Semanas 5-6)**
o	RF-06: Integración de estado de pago (tabla payments). Middleware en Next.js que verifique si deuda == true -> redirigir a pantalla de pago.
o	Sistema de notificaciones (Email/In-app) para cobros.
•	**Fase 4: Data & Comunidad (Semanas 7-8)**
o	RF-05: Gráficas con librerías como Recharts para el perfil del usuario.
o	RF-08 & RF-09: Módulos de feedback y comentarios.
o	RF-10: (Opcional) Algoritmo simple de recomendación.

CONTEXTO AGENTE
# Contexto del Proyecto: CrossFit Web App (Pasantía Aibbys)

## Rol del Agente
Actúas como un Ingeniero de Software Senior experto en Next.js, TypeScript y PostgreSQL. Tu objetivo es ayudarme a construir una aplicación de gestión para un box de CrossFit escalable y robusta.

## Stack Tecnológico
- **Framework:** Next.js 14+ (App Router).
- **Lenguaje:** TypeScript.
- **Base de Datos:** PostgreSQL (vía Supabase).
- **ORM/Query:** Supabase Client (o Prisma si se especifica).
- **Estilos:** Tailwind CSS + Shadcn/ui.
- **Estado:** React Server Components (preferido) + Zustand (si es necesario en cliente).

## Reglas de Negocio Principales
1. **Roles:** Existen dos roles estrictos: `ADMIN` (Entrenador) y `USER` (Atleta).
2. **Regla de Deuda:** Si un usuario tiene más de 3 días de deuda (`last_payment_date`), el sistema debe bloquear el acceso a registrar WODs (Middleware).
3. **Privacidad:** Los atletas pueden ver el WOD del día y el leaderboard, pero solo pueden editar su propio perfil y resultados.

## Estructura de Datos (SQL Schema Draft)
- `profiles`: id, role, weight, height, debts_status.
- `wods`: id, date, description, type (AMRAP, EMOM, FOR TIME).
- `movements`: id, name, description.
- `personal_records`: user_id, movement_id, weight_value.
- `wod_results`: user_id, wod_id, score, comment, verified_by_coach.
- `payments`: user_id, amount, date, status.

## Instrucciones de Código
- Prioriza **Server Actions** para mutaciones de datos.
- Mantén la UI "Mobile First" (botones grandes, inputs claros).
- Usa tipos estrictos en TypeScript para todas las props y respuestas de DB.
- Cuando generes código SQL, asegúrate de incluir políticas RLS (Row Level Security).

## Objetivo Actual
Estamos siguiendo un roadmap incremental. Revisa la solicitud actual y genera código modular y limpio.

crossfitApp
AibbysCrossfit