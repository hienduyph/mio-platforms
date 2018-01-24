/**
 * The token management for mioc
 */
export class InjectToken {
  private _desc: symbol;

  constructor(description: string) {
    this._desc = Symbol(description);
  }

  /**
   * Get the token
   */
  public uuid() {
    return this._desc;
  }

  /**
   * Get the description information
   */
  public toString() {
    return this._desc.toString();
  }
}
