import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addGroupByUserDto, AddUserDto } from 'src/dto/user.dto';
import { GroupModel } from 'src/models/group.model';
import { UserModel } from 'src/models/user.model';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel)
    private userRepository: Repository<UserModel>,
    @InjectRepository(GroupModel)
    private groupRepository: Repository<GroupModel>,
  ) {}

  async findOne(id: string) {
    const user = await this.userRepository.findOne(id);
    if (user == undefined) {
      const addUserDto = {
        id: id,
        name: '',
        iconUrl: '',
      };
      const newUser = this.userRepository.save(addUserDto);
      return newUser;
    }
    return user;
  }

  async save(user: AddUserDto) {
    return await this.userRepository.save(user);
  }

  async addGroupByUser(affiliation: addGroupByUserDto) {
    const user = await this.userRepository.findOne({
      relations: ['groups'],
      where: { id: affiliation.userId },
    });
    const group = await this.groupRepository.findOne(affiliation.groupId);
    user.groups.push(group);
    return await this.userRepository.save(user);
  }

  async deleteGroupByUser(userId: string, groupId: number) {
    const user = await this.userRepository.findOne({
      relations: ['groups'],
      where: { id: userId },
    });
    user.groups = user.groups.filter((group) => {
      return group.id !== groupId;
    });
    return await this.userRepository.save(user);
  }

  async findGroupByUser(id: string): Promise<GroupModel[] | null> {
    const user = await this.userRepository.findOne({
      relations: ['groups'],
      where: { id: id },
    });
    return user?.groups;
  }

  async findUserByGroup(id: number): Promise<UserModel[] | null> {
    const allUsers = await this.userRepository.find({
      relations: ['groups'],
    });
    const users = allUsers.filter((user) => {
      const u = user.groups.filter((group) => group.id == id);
      if (u.length > 0) return true;
    });
    return users;
  }
}
