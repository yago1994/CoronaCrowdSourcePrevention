var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * @module ol/Observable
 */
import { listen, unlistenByKey, listenOnce } from './events.js';
import EventTarget from './events/Target.js';
import EventType from './events/EventType.js';
/**
 * @classdesc
 * Abstract base class; normally only used for creating subclasses and not
 * instantiated in apps.
 * An event target providing convenient methods for listener registration
 * and unregistration. A generic `change` event is always available through
 * {@link module:ol/Observable~Observable#changed}.
 *
 * @fires import("./events/Event.js").default
 * @api
 */
var Observable = /** @class */ (function (_super) {
    __extends(Observable, _super);
    function Observable() {
        var _this = _super.call(this) || this;
        /**
         * @private
         * @type {number}
         */
        _this.revision_ = 0;
        return _this;
    }
    /**
     * Increases the revision counter and dispatches a 'change' event.
     * @api
     */
    Observable.prototype.changed = function () {
        ++this.revision_;
        this.dispatchEvent(EventType.CHANGE);
    };
    /**
     * Get the version number for this object.  Each time the object is modified,
     * its version number will be incremented.
     * @return {number} Revision.
     * @api
     */
    Observable.prototype.getRevision = function () {
        return this.revision_;
    };
    /**
     * Listen for a certain type of event.
     * @param {string|Array<string>} type The event type or array of event types.
     * @param {function(?): ?} listener The listener function.
     * @return {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} Unique key for the listener. If
     *     called with an array of event types as the first argument, the return
     *     will be an array of keys.
     * @api
     */
    Observable.prototype.on = function (type, listener) {
        if (Array.isArray(type)) {
            var len = type.length;
            var keys = new Array(len);
            for (var i = 0; i < len; ++i) {
                keys[i] = listen(this, type[i], listener);
            }
            return keys;
        }
        else {
            return listen(this, /** @type {string} */ (type), listener);
        }
    };
    /**
     * Listen once for a certain type of event.
     * @param {string|Array<string>} type The event type or array of event types.
     * @param {function(?): ?} listener The listener function.
     * @return {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} Unique key for the listener. If
     *     called with an array of event types as the first argument, the return
     *     will be an array of keys.
     * @api
     */
    Observable.prototype.once = function (type, listener) {
        if (Array.isArray(type)) {
            var len = type.length;
            var keys = new Array(len);
            for (var i = 0; i < len; ++i) {
                keys[i] = listenOnce(this, type[i], listener);
            }
            return keys;
        }
        else {
            return listenOnce(this, /** @type {string} */ (type), listener);
        }
    };
    /**
     * Unlisten for a certain type of event.
     * @param {string|Array<string>} type The event type or array of event types.
     * @param {function(?): ?} listener The listener function.
     * @api
     */
    Observable.prototype.un = function (type, listener) {
        if (Array.isArray(type)) {
            for (var i = 0, ii = type.length; i < ii; ++i) {
                this.removeEventListener(type[i], listener);
            }
        }
        else {
            this.removeEventListener(type, listener);
        }
    };
    return Observable;
}(EventTarget));
/**
 * Removes an event listener using the key returned by `on()` or `once()`.
 * @param {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} key The key returned by `on()`
 *     or `once()` (or an array of keys).
 * @api
 */
export function unByKey(key) {
    if (Array.isArray(key)) {
        for (var i = 0, ii = key.length; i < ii; ++i) {
            unlistenByKey(key[i]);
        }
    }
    else {
        unlistenByKey(/** @type {import("./events.js").EventsKey} */ (key));
    }
}
export default Observable;
//# sourceMappingURL=Observable.js.map