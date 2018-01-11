"use strict";
// import { } from 'redux'
Object.defineProperty(exports, "__esModule", { value: true });
class Line {
}
exports.Line = Line;
exports.members = {}; //singleton
class Blackboard {
    get members() {
        return exports.members;
    }
    set(kd, data) {
        if (Array.isArray(kd)) {
            data = kd;
            kd = ('random');
        }
        else if (kd.data) {
            data = kd.data;
            kd = kd.key;
        }
        this.members[kd] = {
            key: kd,
            data: data
        };
        return kd;
    }
    remove(key) {
        this.members[key] = undefined;
        delete this.members[key];
        // delete this.members
    }
    clear() {
        for (let key in this.members) {
            this.remove(key);
        }
    }
    add(kd, data) {
        if (kd.key) {
            data = kd.data;
            kd = kd.key;
        }
        (this.members[kd]).data.concat(data);
    }
}
exports.Blackboard = Blackboard;
//# sourceMappingURL=watch.js.map