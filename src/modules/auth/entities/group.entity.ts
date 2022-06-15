import {Entity} from "../../shared/libraries/entity.ts";

export class GroupEntity extends Entity {
  _id: string | undefined ;
  name: string  | undefined ;
  description: string  | undefined ;


  constructor(init?: Partial<GroupEntity>) {
    super();
    Object.assign(this, init);

  }


}
