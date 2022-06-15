import { faker } from "https://deno.land/x/deno_faker@v1.0.3/mod.ts";
import {Seeder} from "../../shared/libraries/seeder.ts";
import {GroupEntity} from "../entities/group.entity.ts";
import {GroupModel} from "../models/group.model.ts";


/*
 *  in order to seeder work perfectly out he box
 * you need import exact path  avoid using aliases path  for import file
 *
 *  cmd : npm run seeder --seed=../../auth/seeders/group.seeder.ts
 *  */

export default class GroupSeeder extends Seeder {
  public model =  GroupModel;

  async run(): Promise<void> {
    const dataSeeder = [
      new GroupEntity({  name: 'admin', description: 'admins' }),
      new GroupEntity({  name: 'coworker', description: 'co workers' }),
      new GroupEntity({  name: 'blogger', description: 'bloggers' }),
      new GroupEntity({  name: 'member', description: 'members' }),
    ];

    await this.model.insertMany(dataSeeder);
  }
}
