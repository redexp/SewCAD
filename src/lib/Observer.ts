export default class Observer {
    eventHandlers: EventHandlers = {};

    on(eventName: string, handler: Handler) {
        var handlers = this.eventHandlers[eventName];

        if (!handlers) {
            handlers = [];
            this.eventHandlers[eventName] = handlers;
        }

        handlers.push(handler);
    }

    off(eventName?: string, handler?: Handler) {
        switch (arguments.length) {
        case 0:
            this.eventHandlers = {};
            break;

        case 1:
            if (this.eventHandlers[eventName!]) {
                delete this.eventHandlers[eventName!];
            }
            break;

        default:
            let handlers = this.eventHandlers[eventName!];

            if (!handlers) return;

            this.eventHandlers[eventName!] = handlers.filter(h => h !== handler);
        }
    }

    trigger(eventName: string, ...args) {
        var handlers = this.eventHandlers[eventName];

        if (!handlers) return;

        for (var i = 0, len = handlers.length; i < len; i++) {
            handlers[i].apply(this, args);
        }
    }

    listenTo(target: Observer, eventName: string, handler: Handler) {
        target.on(eventName, handler);
    }

    stopListening(target: Observer, ...args: []|[string]|[string, Handler]) {
        target.off.apply(target, args);
    }
}

interface EventHandlers {
    [eventName: string]: Handlers;
}

type Handlers = Array<Handler>;

type Handler = (...args: any[]) => void;