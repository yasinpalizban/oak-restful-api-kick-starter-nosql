import { faker } from "https://deno.land/x/deno_faker@v1.0.3/mod.ts";
import {Seeder} from "../../shared/libraries/seeder.ts";
import {SettingEntity} from "../entities/setting.entity.ts";
import {SettingModel} from "../models/setting.model.ts";



/*
 *  in order to seeder work perfectly out he box
 * you need import exact path  avoid using aliases path  for import file
 *
 *  cmd :  deno run --allow-read --allow-net --allow-write --allow-env  --unstable
 src\core\utils\call.seeder.ts -seed=../../modules/home/seeders/test.seeder.ts

 *  */

export default class SettingSeeder extends Seeder {

  public model = SettingModel;

  async run(): Promise<void> {
    const dataSeeder = new SettingEntity({
      key: faker.internet.userName(),
      value: faker.internet.accountName(),
      description: faker.internet.address(),
      createdAt: faker.date.recent(),
    });
    await this.model.insertOne(dataSeeder);
  }
}
