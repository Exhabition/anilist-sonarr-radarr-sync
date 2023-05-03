import { EventEmitter } from "events";

export class SchedulerService extends EventEmitter {
    action: () => void;
    handle?: NodeJS.Timer;
    interval: number;

    constructor(action: () => void, ms: number) {
        super();

        this.action = action;
        this.handle = undefined;
        this.interval = ms;
        this.addListener("timeout", this.action);
    }

    start(instantly = false) {
        if (!this.handle) {
            if (instantly) this.emit("timeout");
            this.handle = setInterval(() => this.emit("timeout"), this.interval);
        }

        return this;
    }

    stop() {
        if (this.handle) {
            clearInterval(this.handle);
            this.handle = undefined;
        }
    }
};