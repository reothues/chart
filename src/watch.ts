// import { } from 'redux'


export class Line {
  key: string;
  data: Array<number>
}
export const members: {[key: string] : Line} = {}; //singleton

export class Blackboard {
  get members() : {[key: string] : Line} {
    return members;
  }

  set(data : Array<number>) : string;
  set(line : Line) : string;
  set(key: string, data : Array<number>) : string;
  set(kd: any, data?: Array<number>) {
    if (Array.isArray(kd)) {
      data = kd;
      kd = ('random');
    } else if (kd.data) {
      data = kd.data;
      kd = kd.key;
    }
    this.members[kd] = {
      key: kd,
      data: data
    } 
    return kd;
  }

  remove(key: string) : void {
    this.members[key] = undefined;
    delete this.members[key];
    // delete this.members
  }

  clear() : void {
    for (let key in this.members) {
      this.remove(key);
    }
  }

  add(line : Line): void;
  add(key: string, data : Array<number>): void;
  add(kd: any, data?: Array<number>): void{
    if (kd.key) {
      data = kd.data;
      kd = kd.key;
    }
    (this.members[kd]).data.concat(data);
  }
}
