/**
 * Use Case interface (Port in Hexagonal Architecture)
 * Follows Interface Segregation Principle (SOLID)
 */

export interface IUseCase<IRequest, IResponse> {
  execute(request?: IRequest): Promise<IResponse> | IResponse;
}
