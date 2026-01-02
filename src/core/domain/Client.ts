/**
 * Entidad de dominio que representa a un Cliente en el sistema.
 * Contiene la información de contacto y reglas de validación propias.
 */
export class Client {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string
  ) {}

  /**
   * Verifica si el correo electrónico asociado cumple con un formato básico.
   * @returns true si el email tiene formato válido (x@x.x), false si no.
   */
  isValidEmail(): boolean {
    return /\S+@\S+\.\S+/.test(this.email);
  }
}
