# PuppyMobile

Aplicación de cuidado de mascotas desarrollada con React Native, Expo SDK 57 y TypeScript. Utiliza Expo Router para la navegación y React Native Paper para los componentes de interfaz.

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

## Funcionalidades

- Panel diario con rutinas que se pueden marcar y desmarcar.
- Perfil de mascota.
- Agenda con creación, validación, finalización y reapertura de recordatorios.
- Navegación entre Mi día, Mascota y Agenda.

Los cambios de rutinas y agenda se conservan durante la sesión de la aplicación.
