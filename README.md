# PuppyMobile

Aplicación de cuidado de mascotas desarrollada con React Native, Expo SDK 57 y TypeScript. Utiliza Expo Router para la navegación y React Native Paper para los componentes de interfaz.

## Fases implementadas

### Fase 1 · Inicio e identidad visual

Pantalla principal con la identidad de Puppy, rutinas diarias, perfil de Milo y agenda de recordatorios.


https://github.com/user-attachments/assets/885743a0-34aa-4ad8-95c8-a1478b69a19c



### Fase 2 · Registro de contactos

Formulario con validación de datos y selector de fecha de nacimiento. Permite revisar, editar y confirmar el contacto, y consultarlo desde el menú.



https://github.com/user-attachments/assets/3de47b17-7ff8-40f5-9bea-2d819f852f05



### Fase 3 · Mascotas y huesitos

Catálogo de diez mascotas con fotografías, un huesito por mascota, opción de retirarlo, confeti al añadirlo y acceso a favoritos desde la estrella.



https://github.com/user-attachments/assets/d93b729d-c07b-4e3a-a20f-0c72ef8a36c4



### Fase 4 · Navegación, contacto y galería

Navegación por pestañas y deslizamiento, menús Contacto y Acerca de, formulario de comentarios mediante el correo del dispositivo y galería de Milo con visor y miniaturas.



https://github.com/user-attachments/assets/46947d1f-8595-4ee9-a019-097e8e79f1e6



### Fase 5 · Favoritos persistentes

Guardado local con SQLite de los cinco favoritos más recientes. Conserva sus datos y votos al cerrar y abrir la aplicación; al añadir un sexto favorito, reemplaza al más antiguo.



https://github.com/user-attachments/assets/f8d307fa-7ee9-4592-a6e2-91a51f310962



## Requisitos

- Node.js 22.13 o superior y npm.
- Un dispositivo con Expo Go compatible con SDK 57 o un entorno de desarrollo de Expo configurado.

## Instalación

Desde la carpeta del proyecto:

```powershell
npm ci
```

## Ejecución

```powershell
npm start
```

Abre el proyecto en el dispositivo desde el código QR de Expo. También están disponibles los siguientes comandos:

```powershell
npm run android
npm run ios
npm run web
```

Para abrir directamente el registro de contactos, detén el servidor y ejecuta:

```powershell
npm run start:registration
```

## Funcionalidades

- Panel diario con rutinas que se pueden marcar y desmarcar.
- Perfil de Milo con fotografía circular y galería de seis fotos con contadores de huesitos. Al tocar una foto se abre un visor con imagen completa, deslizamiento y miniaturas inferiores.
- Agenda con creación, validación, finalización y reapertura de recordatorios.
- Navegación entre Mi día, Mascotas, Milo y Agenda mediante pestañas y deslizamiento horizontal.
- Registro de contactos con nombre completo, nacimiento, teléfono, email y descripción.
- Selector de fecha de nacimiento y validación de campos.
- Revisión, confirmación y edición de los datos del contacto.
- Acceso al contacto confirmado desde el menú Ver contacto.
- Catálogo de diez mascotas con fotografías, accesible desde la pestaña Mascotas, Conocer mascotas o el menú Explorar mascotas.
- Un huesito por mascota, con confeti al guardar el voto y opción de retirarlo.
- Hasta cinco favoritos accesibles desde la estrella, ordenados por el huesito más reciente y recuperados al volver a abrir la aplicación.
- Guardado local con SQLite en la tabla `mascota`, incluyendo los datos completos de cada favorito y su contador de huesitos.
- Menús Contacto y Acerca de, disponibles en las cabeceras de Puppy.
- Formulario de comentarios que prepara el correo para revisarlo y enviarlo desde el cliente del dispositivo, con opción de copiar el mensaje si no se puede abrir.

Los cinco favoritos más recientes y sus votos se conservan entre aperturas de la aplicación. Al añadir una sexta mascota, la más antigua sale de Favoritos. Retirar el huesito elimina esa mascota de la lista. Las rutinas, los recordatorios y el contacto se conservan durante la sesión.

El destinatario de comentarios se puede configurar mediante la variable de entorno `EXPO_PUBLIC_SUPPORT_EMAIL` antes de iniciar Expo.
