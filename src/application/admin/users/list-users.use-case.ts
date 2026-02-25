import { IUserRepository } from '@domain/user/user.repository.interface';

interface ListUsersRequest {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export class ListUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: ListUsersRequest) {
    const { page = 1, limit = 10, search, isActive } = request;
    const offset = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userRepository.findAll({
        skip: offset,
        take: limit,
        search,
        isActive,
      }),
      this.userRepository.count({ search, isActive }),
    ]);

    return {
      data: users.map((user) => user.toJSON()),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
