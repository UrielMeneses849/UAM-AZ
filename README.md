# Portal Académico de Simulación

Aplicación full-stack privada con dos roles, persistencia SQLite y una interfaz deliberadamente legacy. No pertenece a ninguna institución educativa y no usa logos, nombres, dominios ni textos oficiales.

## Credenciales demo

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| ADMIN | `admin` | `admin123` |
| STUDENT | `alumno01` | `alumno123` |

Las contraseñas se almacenan con PBKDF2-HMAC-SHA256, salt aleatorio y 310,000 iteraciones; nunca se guardan en texto plano.

## Estructura

```text
PortalAcademicoSimulacion/
├── frontend/               React + Vite + React Router
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       └── styles/
├── backend/                FastAPI + SQLAlchemy + SQLite
│   ├── app/
│   │   ├── auth/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   └── tests/
├── VISUAL_PATTERNS.md
└── design-qa.md
```

## Arquitectura recomendada

Para este uso pequeño, la opción más simple es servir el frontend como sitio estático y hablar directo con Supabase:

```text
GitHub Pages / Vite / React
        ↓
Supabase Auth + Postgres + RLS
```

El backend FastAPI queda como alternativa local/legacy, pero no es necesario para producción si se usa Supabase directo.

## Configuración Supabase directo

1. En Supabase → Authentication → Users, cree estos usuarios:

| Usuario visual | Email Supabase | Contraseña sugerida |
| --- | --- | --- |
| `admin` | `admin@simulacion.local` | `admin123` |
| `alumno01` | `alumno01@simulacion.local` | `alumno123` |

2. En Supabase → SQL Editor, ejecute [supabase_frontend_only_setup.sql](./supabase_frontend_only_setup.sql). Esto crea perfiles, datos semilla y políticas RLS para que admin pueda escribir y alumno solo pueda leer su expediente.

3. En el frontend, copie `frontend/.env.example` a `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

4. Complete:

```env
VITE_SUPABASE_URL=https://thqsbmvujbanzhqxwmjy.supabase.co
VITE_SUPABASE_ANON_KEY=su-anon-public-key
```

La anon key puede estar en el frontend. No use `DATABASE_URL`, password de Postgres ni `service_role` en React.

## Ejecución local

Requisitos: Python 3.9 o superior y Node.js 20 o superior.

### 1. Frontend con Supabase directo

```bash
cd ~/Desktop/PortalAcademicoSimulacion/frontend
npm install
npm run dev -- --port 5175
```

Abra `http://localhost:5175/login`.

### 2. Backend opcional

Desde una terminal:

```bash
cd ~/Desktop/PortalAcademicoSimulacion/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

La primera ejecución crea `portal_academico.db` y carga los usuarios, trimestres, seis materias, seis registros académicos y dos avisos. La documentación interactiva queda en `http://127.0.0.1:8000/docs`.

Para producción, copie `.env.example` a `.env`, defina una `SECRET_KEY` segura y exporte las variables antes de iniciar el servidor.

Si quiere usar Supabase/Postgres como base persistente:

```bash
export DATABASE_URL='postgresql://postgres.PROJECT_REF:DB_PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require'
export DATABASE_POOL_MODE='null'
export SECRET_KEY='una-cadena-larga-y-aleatoria'
export CORS_ORIGINS='https://tu-frontend.com'
```

El backend crea las tablas al arrancar y deja activos los datos semilla de la simulación. Para un despliegue serio, use el pooler de Supabase, mantenga `SECRET_KEY` fuera del repositorio y configure respaldos desde el proveedor.

### 3. Frontend con backend opcional

En otra terminal:

```bash
cd ~/Desktop/PortalAcademicoSimulacion/frontend
npm install
npm run dev
```

Vite muestra la dirección local disponible. El frontend usa `/api` y lo envía al backend de `127.0.0.1:8000` durante desarrollo.

Si el frontend vive en un dominio distinto al backend, por ejemplo GitHub Pages + backend en Render/Railway, configure:

```bash
export VITE_API_URL='https://tu-backend.com'
npm run build
```

En local puede dejar `VITE_API_URL` vacío para usar el proxy de Vite, o copiar `frontend/.env.example` a `frontend/.env`.

## Flujo principal

1. Entre como `admin`.
2. Abra `Alumnos`.
3. Seleccione `Abrir alumno / expediente`.
4. Pulse `Agregar registro`.
5. Elija Materia, Trimestre, Tipo de evaluación y Calificación; capture Acta y Créditos.
6. Guarde y cierre sesión.
7. Entre como `alumno01`.
8. Abra `Kardex`, use `Todo Kardex` o seleccione un trimestre y pulse `Consultar`.

El registro se lee de SQLite mediante la API, por lo que persiste después de recargar o cambiar de sesión.

## API principal

- `POST /api/auth/login`
- `GET /api/me`
- `POST /api/me/password`
- `GET /api/notices`
- `GET /api/terms`
- `GET /api/student/me`
- `GET /api/student/me/records`
- `GET /api/student/me/records?term=26O`
- `GET/POST /api/admin/students`
- `GET/PUT /api/admin/students/{id}`
- `GET/POST /api/admin/students/{id}/records`
- `PUT/DELETE /api/admin/records/{id}`
- `GET/POST /api/admin/subjects`
- `GET/POST /api/admin/terms`
- `GET/POST /api/admin/notices`
- `PUT /api/admin/notices/{id}`

Todos los endpoints administrativos verifican el rol `ADMIN` en backend. Ocultar botones en React no es la medida de seguridad.

## Pruebas

Backend y aceptación de roles:

```bash
cd ~/Desktop/PortalAcademicoSimulacion/backend
source .venv/bin/activate
pytest -q
```

Compilación del frontend:

```bash
cd ~/Desktop/PortalAcademicoSimulacion/frontend
npm run build
```

La prueba automatizada cubre login de ambos roles, consulta y filtro de Kardex, rechazo de escritura para STUDENT, alta/edición/eliminación de registros por ADMIN, persistencia visible para el alumno y rechazo sin sesión.

## Seguridad incluida

- Hash de contraseña PBKDF2 con salt por usuario.
- Token firmado HMAC-SHA256 con vencimiento.
- Validación de rol en cada endpoint administrativo.
- Validación Pydantic para longitudes, tipos, calificaciones y créditos.
- Consultas SQLAlchemy parametrizadas.
- Sesión del navegador guardada en `sessionStorage` y eliminada al cerrar sesión.
