# BJJ Tracker — Backend

API REST construida con **NestJS** para el seguimiento de entrenamiento de Brazilian Jiu-Jitsu: técnicas, sesiones de entrenamiento, objetivos y gameplans. Es el backend del proyecto [BJJ Tracker](#), pensado para conectarse con un frontend en React.

## Stack

- **Framework:** [NestJS](https://nestjs.com/) 11 (TypeScript)
- **Base de datos / Auth:** [Firebase](https://firebase.google.com/) — Firestore como base de datos y Firebase Auth para autenticación
- **Validación:** `class-validator` + `class-transformer` con `ValidationPipe` global
- **Testing:** Jest (unitario y e2e)

## Features principales

- **CRUD completo** de técnicas, entrenamientos, objetivos y gameplans, todo scoped por usuario autenticado.
- **Autenticación con Firebase**: un `FirebaseAuthGuard` verifica el token Bearer (Firebase ID Token) en cada request y expone el usuario decodificado a los controllers.
- **Patrón Repository con doble implementación**: cada módulo define una interfaz abstracta (`*.repository.ts`) con dos implementaciones —una en memoria y otra sobre Firestore— lo que permite testear la lógica de negocio sin depender de Firebase.
- **Filtros de búsqueda**: los endpoints de técnicas y entrenamientos soportan query params para filtrar resultados (ej. por modalidad gi/no-gi).
- **Validación estricta de entrada**: `ValidationPipe` global con `whitelist` y `forbidNonWhitelisted`, rechazando cualquier campo no declarado en los DTOs.

## Módulos y entidades

| Módulo | Entidad | Descripción |
|---|---|---|
| `tecnicas` | `Tecnica` | Técnica de BJJ: nombre, nota, modalidad (gi/no-gi/ambos), tags, video, técnicas conectadas |
| `entrenamientos` | `Entrenamiento` | Sesión de entrenamiento: fecha, objetivo, técnica trabajada, repeticiones efectivas, posición atrapado |
| `objetivos` | `Objetivo` | Meta de entrenamiento: título, tipo, estado (completado) |
| `gameplans` | `GamePlan` | Secuencia de técnicas encadenadas para una posición o situación |

## Endpoints

Todos los endpoints requieren header `Authorization: Bearer <firebase_id_token>`.

```
GET    /tecnicas          Lista técnicas del usuario (soporta filtros por query)
POST   /tecnicas          Crea una técnica
GET    /tecnicas/:id      Obtiene una técnica
PATCH  /tecnicas/:id      Actualiza una técnica
DELETE /tecnicas/:id      Elimina una técnica

GET    /entrenamientos          Lista entrenamientos del usuario (soporta filtros)
POST   /entrenamientos          Registra un entrenamiento
GET    /entrenamientos/:id      Obtiene un entrenamiento
PATCH  /entrenamientos/:id      Actualiza un entrenamiento
DELETE /entrenamientos/:id      Elimina un entrenamiento

GET    /objetivos          Lista objetivos del usuario
POST   /objetivos          Crea un objetivo
GET    /objetivos/:id      Obtiene un objetivo
PATCH  /objetivos/:id      Actualiza un objetivo
DELETE /objetivos/:id      Elimina un objetivo

GET    /gameplans          Lista gameplans del usuario
POST   /gameplans          Crea un gameplan
GET    /gameplans/:id      Obtiene un gameplan
PATCH  /gameplans/:id      Actualiza un gameplan
DELETE /gameplans/:id      Elimina un gameplan
```

## Instalación

```bash
$ npm install
```

## Variables de entorno

El backend soporta dos formas de autenticar con Firebase (Admin SDK):

```bash
# Opción A: credenciales como variables de entorno (recomendado en producción)
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_PRIVATE_KEY="tu-private-key"
FIREBASE_CLIENT_EMAIL=tu-client-email

# Opción B: ruta a un archivo de credenciales JSON (uso local)
FIREBASE_CREDENTIAL_PATH=./ruta/a/credenciales.json

# Puerto (opcional, por defecto 3000; inyectado automáticamente en Render/Railway)
PORT=3000
```

## Correr el proyecto

```bash
# desarrollo
$ npm run start

# modo watch
$ npm run start:dev

# producción
$ npm run start:prod
```

## Tests

```bash
# unitarios
$ npm run test

# e2e
$ npm run test:e2e

# cobertura
$ npm run test:cov
```

## Estructura del proyecto

```
src/
├── auth/            # Guard de autenticación con Firebase + decorator @User()
├── firebase/         # Inicialización del Admin SDK y conexión a Firestore
├── tecnicas/          # Módulo de técnicas (controller, service, repository, dto, entity)
├── entrenamientos/    # Módulo de sesiones de entrenamiento
├── objetivos/          # Módulo de objetivos/metas
├── gameplans/          # Módulo de gameplans
├── app.module.ts
└── main.ts
```

## Proyecto relacionado

Este backend forma parte de **BJJ Tracker**, una app de seguimiento de entrenamiento de BJJ que incluye un frontend en React con heatmap de entrenamiento estilo GitHub y calculador de rachas.
