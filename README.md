# Kronos

Kronos es una aplicación web de gestión de tiempo y proyectos, diseñada para proporcionar una interfaz clara y eficiente para el seguimiento de horas por proyecto.

## Tecnologías

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Firebase](https://firebase.google.com/)

## Desarrollo

Para ejecutar el proyecto en tu entorno local:

1. Clona el repositorio:
   ```bash
   git clone git@github-personal:Ignacio-CI/kronos.git
   cd kronos
   ```

2. Instala las dependencias (se recomienda usar [Bun](https://bun.sh/) ya que el proyecto incluye un `bun.lock`):
   ```bash
   bun install
   ```
   *Alternativamente puedes usar `npm install` o `yarn`.*

3. Inicia el servidor de desarrollo:
   ```bash
   bun run dev
   ```

## Scripts Disponibles

- `dev`: Inicia el servidor de desarrollo con Vite.
- `build`: Ejecuta el chequeo de tipos y compila la aplicación para producción.
- `preview`: Previsualiza localmente la versión de producción compilada.
- `typecheck`: Revisa los tipos de TypeScript sin generar archivos.
