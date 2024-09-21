export type ClientType = {
  id: string;
  nombre?: string | null;
  username?: string | null;
  rol: string;
  carnetIdentidad?: string; // Asegúrate de que esta línea esté presente
  telefono?: string;
}
