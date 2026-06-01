# FintechLauraLua - Documentación Técnica
# Mini Portal Administrativo de Órdenes y Pagos

# 1. Descripción del Proyecto
Portal administrativo interno para que los operadores visualisen, filtren y monitoreen órdenes y pagos. Los operadores pueden revisar las órdenes y pagos, filtrar por status, buscar clientes y detectar pagos fallidos ráídamente.

Se tiene visión de mejorar el portar para administradores internos para que puedan realizar funciones CRUD.

# 2. Stack Tecnológico
Frontend: Next.js + TailwindCSS
Backend: Laravel 11.54.0
Base de Datos: PostgreSQL 18.4
Autenticación: Laravel Sanctum (incluido con Laravel 11)
Deploy Backend + BD: Railway
Deploy Frontend: Vercel

* Entornos de Desarrollo: Largon, VS Code, DataGrip
* Herramientas adicionales: Figma para diseño de interfaces, Postman para testeo de peticiones HTTP

# 3. Funcionalidades
  - Login con autenticación por token (Laravel Sanctum)
  - Dashboard con 4 tarjetas de estadísticas: Ingresos Totales, Total Órdenes, Órdenes Pendientes, Pagos Fallidos
    - Búsqueda por ID, nombr o email
    - Filtros por status y método de pago
    - Ordenamiento de datos por ID, fecha y monto
    - Paginación de 15 registro por página

  - Detalle de Orden y Pago con timeline del proceso
  - Diseño responsivo (desktop, tablet y nmóvil)

# 4. Base de Datos
Se utilizó PostgreSQL como gestor de base de datos alojado en Railway

* Decisiones de diseño:
- Los IDs se generan con SERIAL (auto increment) para simplicidad y legibilidad
- Las tablas de catálogo `status` y `metodos_pagos` se normalizaron por separado para facilitar mantenimiento futuro
- La tabla `clientes` se separó de `detalle_ordenes_pagos` para evitar redundancia cuando un cliente realiza múltiples pagos
- La tabla `usuarios` se separó de `detalle_usuarios` para normalizar datos personales y credenciales de acceso

# 5. Diagrama de tablas
usuarios                   detalle_usuarios
----------                 ------------------
id (PK)                    id (PK)
nombre                     id_usuario (FK)
ap                         email
am                         password
created_at                 rol (admin | operador)
updated_at                 created_at
                           updated_ate

clientes                   status
----------                 ---------- 
id (PK)                    id (PK)
nombre                     nombre
ap
am                         metodos_pagos
created_at                 ----------------
updated_at                 id (PK)
                           nombre

detalle_ordenes_pagos
-----------------------
id (PK)
id_clientes     (FK)
id_status       (FK)
id_metodo_pago  (FK)
email
monto
created_at
updated_at

# 6. Instalación Local
* Requisitos
   - PHP 8.2+
   - Composer
   - Node.js 22+
   - Laragon
   - Extensiones PHP: `pdo_pgsql`, `pgsql`

* Backend (Laravel)
   cd FintechLauraLua
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve

* Variables de entorno Laravel (.env)
   # Coneción a la base de datos de PostgreSQL
   APP_NAME=FintechLauraLua
   DB_CONNECTION=pgsql
   DB_HOST=junction.proxy.rlwy.net
   DB_PORT=17563
   DB_DATABASE=railway
   DB_USERNAME=postgres
   DB_PASSWORD=JMgwIpEelUKcdwiaqbtMpnemuMBPqOwj
   SESSION_DRIVER=file
   QUEUE_CONNECTION=sync
   CACHE_STORE=file

* Frontend(Next.js)
   cd fintech-laura-lua-front
   npm install
   npm run dev

# 7. Infraestructura de Deploy
* Railway (Backend + Base de datos):
   - PostgreSQL provisionado en Railway
   - Laravel deployado conectando el repositorio de GitHub
   - Variables de entorno configuradas desde el panel de Railway

* Conexión pública (desarrollo local):
   Host: junction.proxy.rlwy.net
   Port: 17563

* Conexión privada (producción dentro de Railway)
   Host: postgres.railway.internal
   Port: 5432

* Vercel (Frontend)
   - Next.js se deploya conectando el repositorio de GitHub a Vercel
   - Variable de entorno `NEXT_PUBLIC_API_URL` apuntará a la URL pública de Laravel en Railway

    Configuración de achivo '.env.local': NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

# 8. Funcionalidades del Portal
* Login
   - Formulario con email y password
   - Validación de credenciales contra la API
   - Guarda el token en cookie al autenticarse
   - Redirige al dashboard si el login es exitoso
   - Muestra error si las credenciales son incorrectas

* Dashboard
   - Sidebar oscuro con navegación y cerrar sesión
   - 4 cards: Ingresos Totales, Total Órdenes, Órdenes Pendientes,    Pagos Fallidos
   - Búsqueda por ID, nombre o email
   - Filtro por Status (paid, pending, failed, refunded)
   - Filtro por Método de Pago (Tarjeta, PayPal, SPEI)
   - Ordenamiento por ID, fecha y monto
   - Tabla con paginación de 15 registros por página
   - Clic en fila navega al detalle de la orden
   - Responsivo: desktop, tablet y mobile

* Detalle de Orden
   - Sidebar oscuro con "Detalle Órden y Pago" activo
   - Card con: número de orden, status, monto, cliente, email,    método de pago
   - Timeline de 3 pasos: Orden creada -> Procesando pago -> Status final
   - Ícono del timeline cambia según el status
   - Responsivo: desktop, tablet y mobile

# 9. Credeciales de Prueba
Email: admin@test.com
Passw: 123456

# 10. Repositorio
Backend: https://github.com/LauLua37/FintechLauraLua
Frontend: https://github.com/LauLua37/fintech-laura-lua-front

URL DeployFrontend: https://fintech-laura-lua-front.vercel.app
URL API/Backend: https://fintechlauralua-production.up.railway.app/api
