export const groups = [
  {
    id: 'demo-calculo',
    name: 'Calculo Diferencial III',
    id_subject: 'Matematicas',
    description: 'Grupo de estudio para el parcial y talleres.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-programacion',
    name: 'Programacion Avanzada',
    id_subject: 'Programacion',
    description: 'Practicas, dudas y sesiones de codigo.',
    created_at: new Date().toISOString(),
  },
];

export const projects = [
  {
    id_project: 1,
    title: 'App Movil - Sistema de Inventario',
    description: 'Desarrollo de una aplicacion movil para gestionar inventario.',
    owner_id: 1,
  },
];

export const tasks = [
  { id_task: 1, title: 'Disenar mockups de la interfaz', status: 'En Progreso' },
  { id_task: 2, title: 'Crear esquema de base de datos', status: 'Por Hacer' },
  { id_task: 3, title: 'Conectar API Gateway', status: 'Completada' },
];

export const resources = [
  { id: 'r1', title: 'Resumen parcial', type: 'PDF', size: '2.4 MB' },
  { id: 'r2', title: 'Notas de clase', type: 'DOC', size: '1.2 MB' },
  { id: 'r3', title: 'Diagrama ER', type: 'PNG', size: '850 KB' },
  { id: 'r4', title: 'Video tutorial', type: 'Link', size: 'YouTube' },
];

export const notifications = [
  {
    id: 'n1',
    message: 'Tienes una nueva invitacion a un grupo de estudio.',
    date: new Date().toISOString(),
    read: false,
  },
];
