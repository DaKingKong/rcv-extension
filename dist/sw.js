(() => {
  // src/firebase/firebase-app.js
  var Deferred = class {
    constructor() {
      this.reject = () => {
      };
      this.resolve = () => {
      };
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
    /**
     * Our API internals are not promiseified and cannot because our callback APIs have subtle expectations around
     * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
     * and returns a node-style callback which will resolve or reject the Deferred's promise.
     */
    wrapCallback(callback) {
      return (error, value) => {
        if (error) {
          this.reject(error);
        } else {
          this.resolve(value);
        }
        if (typeof callback === "function") {
          this.promise.catch(() => {
          });
          if (callback.length === 1) {
            callback(error);
          } else {
            callback(error, value);
          }
        }
      };
    }
  };
  var ERROR_NAME = "FirebaseError";
  var FirebaseError = class extends Error {
    constructor(code, message, customData) {
      super(message);
      this.code = code;
      this.customData = customData;
      this.name = ERROR_NAME;
      Object.setPrototypeOf(this, FirebaseError.prototype);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ErrorFactory.prototype.create);
      }
    }
  };
  var ErrorFactory = class {
    constructor(service, serviceName, errors) {
      this.service = service;
      this.serviceName = serviceName;
      this.errors = errors;
    }
    create(code, ...data) {
      const customData = data[0] || {};
      const fullCode = `${this.service}/${code}`;
      const template = this.errors[code];
      const message = template ? replaceTemplate(template, customData) : "Error";
      const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
      const error = new FirebaseError(fullCode, fullMessage, customData);
      return error;
    }
  };
  function replaceTemplate(template, data) {
    return template.replace(PATTERN, (_, key) => {
      const value = data[key];
      return value != null ? String(value) : `<${key}?>`;
    });
  }
  var PATTERN = /\{\$([^}]+)}/g;
  function deepEqual(a, b) {
    if (a === b) {
      return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    for (const k of aKeys) {
      if (!bKeys.includes(k)) {
        return false;
      }
      const aProp = a[k];
      const bProp = b[k];
      if (isObject(aProp) && isObject(bProp)) {
        if (!deepEqual(aProp, bProp)) {
          return false;
        }
      } else if (aProp !== bProp) {
        return false;
      }
    }
    for (const k of bKeys) {
      if (!aKeys.includes(k)) {
        return false;
      }
    }
    return true;
  }
  function isObject(thing) {
    return thing !== null && typeof thing === "object";
  }
  var Component = class {
    /**
     *
     * @param name The public service name, e.g. app, auth, firestore, database
     * @param instanceFactory Service factory responsible for creating the public interface
     * @param type whether the service provided by the component is public or private
     */
    constructor(name3, instanceFactory, type) {
      this.name = name3;
      this.instanceFactory = instanceFactory;
      this.type = type;
      this.multipleInstances = false;
      this.serviceProps = {};
      this.instantiationMode = "LAZY";
      this.onInstanceCreated = null;
    }
    setInstantiationMode(mode) {
      this.instantiationMode = mode;
      return this;
    }
    setMultipleInstances(multipleInstances) {
      this.multipleInstances = multipleInstances;
      return this;
    }
    setServiceProps(props) {
      this.serviceProps = props;
      return this;
    }
    setInstanceCreatedCallback(callback) {
      this.onInstanceCreated = callback;
      return this;
    }
  };
  var DEFAULT_ENTRY_NAME$1 = "[DEFAULT]";
  var Provider = class {
    constructor(name3, container) {
      this.name = name3;
      this.container = container;
      this.component = null;
      this.instances = /* @__PURE__ */ new Map();
      this.instancesDeferred = /* @__PURE__ */ new Map();
      this.instancesOptions = /* @__PURE__ */ new Map();
      this.onInitCallbacks = /* @__PURE__ */ new Map();
    }
    /**
     * @param identifier A provider can provide mulitple instances of a service
     * if this.component.multipleInstances is true.
     */
    get(identifier) {
      const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
      if (!this.instancesDeferred.has(normalizedIdentifier)) {
        const deferred = new Deferred();
        this.instancesDeferred.set(normalizedIdentifier, deferred);
        if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
          try {
            const instance = this.getOrInitializeService({
              instanceIdentifier: normalizedIdentifier
            });
            if (instance) {
              deferred.resolve(instance);
            }
          } catch (e) {
          }
        }
      }
      return this.instancesDeferred.get(normalizedIdentifier).promise;
    }
    getImmediate(options) {
      var _a;
      const normalizedIdentifier = this.normalizeInstanceIdentifier(options === null || options === void 0 ? void 0 : options.identifier);
      const optional = (_a = options === null || options === void 0 ? void 0 : options.optional) !== null && _a !== void 0 ? _a : false;
      if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
        try {
          return this.getOrInitializeService({
            instanceIdentifier: normalizedIdentifier
          });
        } catch (e) {
          if (optional) {
            return null;
          } else {
            throw e;
          }
        }
      } else {
        if (optional) {
          return null;
        } else {
          throw Error(`Service ${this.name} is not available`);
        }
      }
    }
    getComponent() {
      return this.component;
    }
    setComponent(component) {
      if (component.name !== this.name) {
        throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
      }
      if (this.component) {
        throw Error(`Component for ${this.name} has already been provided`);
      }
      this.component = component;
      if (!this.shouldAutoInitialize()) {
        return;
      }
      if (isComponentEager(component)) {
        try {
          this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME$1 });
        } catch (e) {
        }
      }
      for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
        const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
        try {
          const instance = this.getOrInitializeService({
            instanceIdentifier: normalizedIdentifier
          });
          instanceDeferred.resolve(instance);
        } catch (e) {
        }
      }
    }
    clearInstance(identifier = DEFAULT_ENTRY_NAME$1) {
      this.instancesDeferred.delete(identifier);
      this.instancesOptions.delete(identifier);
      this.instances.delete(identifier);
    }
    // app.delete() will call this method on every provider to delete the services
    // TODO: should we mark the provider as deleted?
    async delete() {
      const services = Array.from(this.instances.values());
      await Promise.all([
        ...services.filter((service) => "INTERNAL" in service).map((service) => service.INTERNAL.delete()),
        ...services.filter((service) => "_delete" in service).map((service) => service._delete())
      ]);
    }
    isComponentSet() {
      return this.component != null;
    }
    isInitialized(identifier = DEFAULT_ENTRY_NAME$1) {
      return this.instances.has(identifier);
    }
    getOptions(identifier = DEFAULT_ENTRY_NAME$1) {
      return this.instancesOptions.get(identifier) || {};
    }
    initialize(opts = {}) {
      const { options = {} } = opts;
      const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
      if (this.isInitialized(normalizedIdentifier)) {
        throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
      }
      if (!this.isComponentSet()) {
        throw Error(`Component ${this.name} has not been registered yet`);
      }
      const instance = this.getOrInitializeService({
        instanceIdentifier: normalizedIdentifier,
        options
      });
      for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
        const normalizedDeferredIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
        if (normalizedIdentifier === normalizedDeferredIdentifier) {
          instanceDeferred.resolve(instance);
        }
      }
      return instance;
    }
    /**
     *
     * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
     * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
     *
     * @param identifier An optional instance identifier
     * @returns a function to unregister the callback
     */
    onInit(callback, identifier) {
      var _a;
      const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
      const existingCallbacks = (_a = this.onInitCallbacks.get(normalizedIdentifier)) !== null && _a !== void 0 ? _a : /* @__PURE__ */ new Set();
      existingCallbacks.add(callback);
      this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
      const existingInstance = this.instances.get(normalizedIdentifier);
      if (existingInstance) {
        callback(existingInstance, normalizedIdentifier);
      }
      return () => {
        existingCallbacks.delete(callback);
      };
    }
    /**
     * Invoke onInit callbacks synchronously
     * @param instance the service instance`
     */
    invokeOnInitCallbacks(instance, identifier) {
      const callbacks = this.onInitCallbacks.get(identifier);
      if (!callbacks) {
        return;
      }
      for (const callback of callbacks) {
        try {
          callback(instance, identifier);
        } catch (_a) {
        }
      }
    }
    getOrInitializeService({ instanceIdentifier, options = {} }) {
      let instance = this.instances.get(instanceIdentifier);
      if (!instance && this.component) {
        instance = this.component.instanceFactory(this.container, {
          instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
          options
        });
        this.instances.set(instanceIdentifier, instance);
        this.instancesOptions.set(instanceIdentifier, options);
        this.invokeOnInitCallbacks(instance, instanceIdentifier);
        if (this.component.onInstanceCreated) {
          try {
            this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
          } catch (_a) {
          }
        }
      }
      return instance || null;
    }
    normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME$1) {
      if (this.component) {
        return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME$1;
      } else {
        return identifier;
      }
    }
    shouldAutoInitialize() {
      return !!this.component && this.component.instantiationMode !== "EXPLICIT";
    }
  };
  function normalizeIdentifierForFactory(identifier) {
    return identifier === DEFAULT_ENTRY_NAME$1 ? void 0 : identifier;
  }
  function isComponentEager(component) {
    return component.instantiationMode === "EAGER";
  }
  var ComponentContainer = class {
    constructor(name3) {
      this.name = name3;
      this.providers = /* @__PURE__ */ new Map();
    }
    /**
     *
     * @param component Component being added
     * @param overwrite When a component with the same name has already been registered,
     * if overwrite is true: overwrite the existing component with the new component and create a new
     * provider with the new component. It can be useful in tests where you want to use different mocks
     * for different tests.
     * if overwrite is false: throw an exception
     */
    addComponent(component) {
      const provider = this.getProvider(component.name);
      if (provider.isComponentSet()) {
        throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
      }
      provider.setComponent(component);
    }
    addOrOverwriteComponent(component) {
      const provider = this.getProvider(component.name);
      if (provider.isComponentSet()) {
        this.providers.delete(component.name);
      }
      this.addComponent(component);
    }
    /**
     * getProvider provides a type safe interface where it can only be called with a field name
     * present in NameServiceMapping interface.
     *
     * Firebase SDKs providing services should extend NameServiceMapping interface to register
     * themselves.
     */
    getProvider(name3) {
      if (this.providers.has(name3)) {
        return this.providers.get(name3);
      }
      const provider = new Provider(name3, this);
      this.providers.set(name3, provider);
      return provider;
    }
    getProviders() {
      return Array.from(this.providers.values());
    }
  };
  var instances = [];
  var LogLevel;
  (function(LogLevel2) {
    LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
    LogLevel2[LogLevel2["VERBOSE"] = 1] = "VERBOSE";
    LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
    LogLevel2[LogLevel2["WARN"] = 3] = "WARN";
    LogLevel2[LogLevel2["ERROR"] = 4] = "ERROR";
    LogLevel2[LogLevel2["SILENT"] = 5] = "SILENT";
  })(LogLevel || (LogLevel = {}));
  var levelStringToEnum = {
    "debug": LogLevel.DEBUG,
    "verbose": LogLevel.VERBOSE,
    "info": LogLevel.INFO,
    "warn": LogLevel.WARN,
    "error": LogLevel.ERROR,
    "silent": LogLevel.SILENT
  };
  var defaultLogLevel = LogLevel.INFO;
  var ConsoleMethod = {
    [LogLevel.DEBUG]: "log",
    [LogLevel.VERBOSE]: "log",
    [LogLevel.INFO]: "info",
    [LogLevel.WARN]: "warn",
    [LogLevel.ERROR]: "error"
  };
  var defaultLogHandler = (instance, logType, ...args) => {
    if (logType < instance.logLevel) {
      return;
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const method = ConsoleMethod[logType];
    if (method) {
      console[method](`[${now}]  ${instance.name}:`, ...args);
    } else {
      throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
    }
  };
  var Logger = class {
    /**
     * Gives you an instance of a Logger to capture messages according to
     * Firebase's logging scheme.
     *
     * @param name The name that the logs will be associated with
     */
    constructor(name3) {
      this.name = name3;
      this._logLevel = defaultLogLevel;
      this._logHandler = defaultLogHandler;
      this._userLogHandler = null;
      instances.push(this);
    }
    get logLevel() {
      return this._logLevel;
    }
    set logLevel(val) {
      if (!(val in LogLevel)) {
        throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
      }
      this._logLevel = val;
    }
    // Workaround for setter/getter having to be the same type.
    setLogLevel(val) {
      this._logLevel = typeof val === "string" ? levelStringToEnum[val] : val;
    }
    get logHandler() {
      return this._logHandler;
    }
    set logHandler(val) {
      if (typeof val !== "function") {
        throw new TypeError("Value assigned to `logHandler` must be a function");
      }
      this._logHandler = val;
    }
    get userLogHandler() {
      return this._userLogHandler;
    }
    set userLogHandler(val) {
      this._userLogHandler = val;
    }
    /**
     * The functions below are all based on the `console` interface
     */
    debug(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
      this._logHandler(this, LogLevel.DEBUG, ...args);
    }
    log(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.VERBOSE, ...args);
      this._logHandler(this, LogLevel.VERBOSE, ...args);
    }
    info(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
      this._logHandler(this, LogLevel.INFO, ...args);
    }
    warn(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
      this._logHandler(this, LogLevel.WARN, ...args);
    }
    error(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
      this._logHandler(this, LogLevel.ERROR, ...args);
    }
  };
  var PlatformLoggerServiceImpl = class {
    constructor(container) {
      this.container = container;
    }
    // In initial implementation, this will be called by installations on
    // auth token refresh, and installations will send this string.
    getPlatformInfoString() {
      const providers = this.container.getProviders();
      return providers.map((provider) => {
        if (isVersionServiceProvider(provider)) {
          const service = provider.getImmediate();
          return `${service.library}/${service.version}`;
        } else {
          return null;
        }
      }).filter((logString) => logString).join(" ");
    }
  };
  function isVersionServiceProvider(provider) {
    const component = provider.getComponent();
    return (component === null || component === void 0 ? void 0 : component.type) === "VERSION";
  }
  var name$o = "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
  var version$1 = "0.7.17";
  var logger = new Logger("https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js");
  var name$n = "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js-compat";
  var name$m = "@firebase/analytics-compat";
  var name$l = "@firebase/analytics";
  var name$k = "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js-check-compat";
  var name$j = "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js-check";
  var name$i = "@firebase/auth";
  var name$h = "@firebase/auth-compat";
  var name$g = "@firebase/database";
  var name$f = "@firebase/database-compat";
  var name$e = "@firebase/functions";
  var name$d = "@firebase/functions-compat";
  var name$c = "@firebase/installations";
  var name$b = "@firebase/installations-compat";
  var name$a = "@firebase/messaging";
  var name$9 = "@firebase/messaging-compat";
  var name$8 = "@firebase/performance";
  var name$7 = "@firebase/performance-compat";
  var name$6 = "@firebase/remote-config";
  var name$5 = "@firebase/remote-config-compat";
  var name$4 = "@firebase/storage";
  var name$3 = "@firebase/storage-compat";
  var name$2 = "@firebase/firestore";
  var name$1 = "@firebase/firestore-compat";
  var name$p = "firebase";
  var DEFAULT_ENTRY_NAME = "[DEFAULT]";
  var PLATFORM_LOG_STRING = {
    [name$o]: "fire-core",
    [name$n]: "fire-core-compat",
    [name$l]: "fire-analytics",
    [name$m]: "fire-analytics-compat",
    [name$j]: "fire-app-check",
    [name$k]: "fire-app-check-compat",
    [name$i]: "fire-auth",
    [name$h]: "fire-auth-compat",
    [name$g]: "fire-rtdb",
    [name$f]: "fire-rtdb-compat",
    [name$e]: "fire-fn",
    [name$d]: "fire-fn-compat",
    [name$c]: "fire-iid",
    [name$b]: "fire-iid-compat",
    [name$a]: "fire-fcm",
    [name$9]: "fire-fcm-compat",
    [name$8]: "fire-perf",
    [name$7]: "fire-perf-compat",
    [name$6]: "fire-rc",
    [name$5]: "fire-rc-compat",
    [name$4]: "fire-gcs",
    [name$3]: "fire-gcs-compat",
    [name$2]: "fire-fst",
    [name$1]: "fire-fst-compat",
    "fire-js": "fire-js",
    [name$p]: "fire-js-all"
  };
  var _apps = /* @__PURE__ */ new Map();
  var _components = /* @__PURE__ */ new Map();
  function _addComponent(app, component) {
    try {
      app.container.addComponent(component);
    } catch (e) {
      logger.debug(`Component ${component.name} failed to register with FirebaseApp ${app.name}`, e);
    }
  }
  function _registerComponent(component) {
    const componentName = component.name;
    if (_components.has(componentName)) {
      logger.debug(`There were multiple attempts to register component ${componentName}.`);
      return false;
    }
    _components.set(componentName, component);
    for (const app of _apps.values()) {
      _addComponent(app, component);
    }
    return true;
  }
  function _getProvider(app, name3) {
    return app.container.getProvider(name3);
  }
  var ERRORS = {
    [
      "no-app"
      /* NO_APP */
    ]: "No Firebase App '{$appName}' has been created - call Firebase App.initializeApp()",
    [
      "bad-app-name"
      /* BAD_APP_NAME */
    ]: "Illegal App name: '{$appName}",
    [
      "duplicate-app"
      /* DUPLICATE_APP */
    ]: "Firebase App named '{$appName}' already exists with different options or config",
    [
      "app-deleted"
      /* APP_DELETED */
    ]: "Firebase App named '{$appName}' already deleted",
    [
      "invalid-app-argument"
      /* INVALID_APP_ARGUMENT */
    ]: "firebase.{$appName}() takes either no argument or a Firebase App instance.",
    [
      "invalid-log-argument"
      /* INVALID_LOG_ARGUMENT */
    ]: "First argument to `onLog` must be null or a function."
  };
  var ERROR_FACTORY = new ErrorFactory("app", "Firebase", ERRORS);
  var FirebaseAppImpl = class {
    constructor(options, config, container) {
      this._isDeleted = false;
      this._options = Object.assign({}, options);
      this._config = Object.assign({}, config);
      this._name = config.name;
      this._automaticDataCollectionEnabled = config.automaticDataCollectionEnabled;
      this._container = container;
      this.container.addComponent(new Component(
        "app",
        () => this,
        "PUBLIC"
        /* PUBLIC */
      ));
    }
    get automaticDataCollectionEnabled() {
      this.checkDestroyed();
      return this._automaticDataCollectionEnabled;
    }
    set automaticDataCollectionEnabled(val) {
      this.checkDestroyed();
      this._automaticDataCollectionEnabled = val;
    }
    get name() {
      this.checkDestroyed();
      return this._name;
    }
    get options() {
      this.checkDestroyed();
      return this._options;
    }
    get config() {
      this.checkDestroyed();
      return this._config;
    }
    get container() {
      return this._container;
    }
    get isDeleted() {
      return this._isDeleted;
    }
    set isDeleted(val) {
      this._isDeleted = val;
    }
    /**
     * This function will throw an Error if the App has already been deleted -
     * use before performing API actions on the App.
     */
    checkDestroyed() {
      if (this.isDeleted) {
        throw ERROR_FACTORY.create("app-deleted", { appName: this._name });
      }
    }
  };
  function initializeApp(options, rawConfig = {}) {
    if (typeof rawConfig !== "object") {
      const name4 = rawConfig;
      rawConfig = { name: name4 };
    }
    const config = Object.assign({ name: DEFAULT_ENTRY_NAME, automaticDataCollectionEnabled: false }, rawConfig);
    const name3 = config.name;
    if (typeof name3 !== "string" || !name3) {
      throw ERROR_FACTORY.create("bad-app-name", {
        appName: String(name3)
      });
    }
    const existingApp = _apps.get(name3);
    if (existingApp) {
      if (deepEqual(options, existingApp.options) && deepEqual(config, existingApp.config)) {
        return existingApp;
      } else {
        throw ERROR_FACTORY.create("duplicate-app", { appName: name3 });
      }
    }
    const container = new ComponentContainer(name3);
    for (const component of _components.values()) {
      container.addComponent(component);
    }
    const newApp = new FirebaseAppImpl(options, config, container);
    _apps.set(name3, newApp);
    return newApp;
  }
  function getApp(name3 = DEFAULT_ENTRY_NAME) {
    const app = _apps.get(name3);
    if (!app) {
      throw ERROR_FACTORY.create("no-app", { appName: name3 });
    }
    return app;
  }
  function registerVersion(libraryKeyOrName, version3, variant) {
    var _a;
    let library = (_a = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a !== void 0 ? _a : libraryKeyOrName;
    if (variant) {
      library += `-${variant}`;
    }
    const libraryMismatch = library.match(/\s|\//);
    const versionMismatch = version3.match(/\s|\//);
    if (libraryMismatch || versionMismatch) {
      const warning = [
        `Unable to register library "${library}" with version "${version3}":`
      ];
      if (libraryMismatch) {
        warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
      }
      if (libraryMismatch && versionMismatch) {
        warning.push("and");
      }
      if (versionMismatch) {
        warning.push(`version name "${version3}" contains illegal characters (whitespace or "/")`);
      }
      logger.warn(warning.join(" "));
      return;
    }
    _registerComponent(new Component(
      `${library}-version`,
      () => ({ library, version: version3 }),
      "VERSION"
      /* VERSION */
    ));
  }
  function registerCoreComponents(variant) {
    _registerComponent(new Component(
      "platform-logger",
      (container) => new PlatformLoggerServiceImpl(container),
      "PRIVATE"
      /* PRIVATE */
    ));
    registerVersion(name$o, version$1, variant);
    registerVersion(name$o, version$1, "esm2017");
    registerVersion("fire-js", "");
  }
  registerCoreComponents("");
  var name = "firebase";
  var version = "9.6.7";
  registerVersion(name, version, "cdn");

  // src/firebase/firebase-messaging-sw.js
  function isIndexedDBAvailable() {
    return typeof indexedDB === "object";
  }
  function validateIndexedDBOpenable() {
    return new Promise((resolve, reject) => {
      try {
        let preExist = true;
        const DB_CHECK_NAME = "validate-browser-context-for-indexeddb-analytics-module";
        const request = self.indexedDB.open(DB_CHECK_NAME);
        request.onsuccess = () => {
          request.result.close();
          if (!preExist) {
            self.indexedDB.deleteDatabase(DB_CHECK_NAME);
          }
          resolve(true);
        };
        request.onupgradeneeded = () => {
          preExist = false;
        };
        request.onerror = () => {
          var _a;
          reject(((_a = request.error) === null || _a === void 0 ? void 0 : _a.message) || "");
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  var ERROR_NAME2 = "FirebaseError";
  var FirebaseError2 = class extends Error {
    constructor(code, message, customData) {
      super(message);
      this.code = code;
      this.customData = customData;
      this.name = ERROR_NAME2;
      Object.setPrototypeOf(this, FirebaseError2.prototype);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ErrorFactory2.prototype.create);
      }
    }
  };
  var ErrorFactory2 = class {
    constructor(service, serviceName, errors) {
      this.service = service;
      this.serviceName = serviceName;
      this.errors = errors;
    }
    create(code, ...data) {
      const customData = data[0] || {};
      const fullCode = `${this.service}/${code}`;
      const template = this.errors[code];
      const message = template ? replaceTemplate2(template, customData) : "Error";
      const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
      const error = new FirebaseError2(fullCode, fullMessage, customData);
      return error;
    }
  };
  function replaceTemplate2(template, data) {
    return template.replace(PATTERN2, (_, key) => {
      const value = data[key];
      return value != null ? String(value) : `<${key}?>`;
    });
  }
  var PATTERN2 = /\{\$([^}]+)}/g;
  function getModularInstance(service) {
    if (service && service._delegate) {
      return service._delegate;
    } else {
      return service;
    }
  }
  var Component2 = class {
    /**
     *
     * @param name The public service name, e.g. app, auth, firestore, database
     * @param instanceFactory Service factory responsible for creating the public interface
     * @param type whether the service provided by the component is public or private
     */
    constructor(name3, instanceFactory, type) {
      this.name = name3;
      this.instanceFactory = instanceFactory;
      this.type = type;
      this.multipleInstances = false;
      this.serviceProps = {};
      this.instantiationMode = "LAZY";
      this.onInstanceCreated = null;
    }
    setInstantiationMode(mode) {
      this.instantiationMode = mode;
      return this;
    }
    setMultipleInstances(multipleInstances) {
      this.multipleInstances = multipleInstances;
      return this;
    }
    setServiceProps(props) {
      this.serviceProps = props;
      return this;
    }
    setInstanceCreatedCallback(callback) {
      this.onInstanceCreated = callback;
      return this;
    }
  };
  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }
  function promisifyRequest(request) {
    return new Promise(function(resolve, reject) {
      request.onsuccess = function() {
        resolve(request.result);
      };
      request.onerror = function() {
        reject(request.error);
      };
    });
  }
  function promisifyRequestCall(obj, method, args) {
    var request;
    var p = new Promise(function(resolve, reject) {
      request = obj[method].apply(obj, args);
      promisifyRequest(request).then(resolve, reject);
    });
    p.request = request;
    return p;
  }
  function promisifyCursorRequestCall(obj, method, args) {
    var p = promisifyRequestCall(obj, method, args);
    return p.then(function(value) {
      if (!value)
        return;
      return new Cursor(value, p.request);
    });
  }
  function proxyProperties(ProxyClass, targetProp, properties) {
    properties.forEach(function(prop) {
      Object.defineProperty(ProxyClass.prototype, prop, {
        get: function() {
          return this[targetProp][prop];
        },
        set: function(val) {
          this[targetProp][prop] = val;
        }
      });
    });
  }
  function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype))
        return;
      ProxyClass.prototype[prop] = function() {
        return promisifyRequestCall(this[targetProp], prop, arguments);
      };
    });
  }
  function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype))
        return;
      ProxyClass.prototype[prop] = function() {
        return this[targetProp][prop].apply(this[targetProp], arguments);
      };
    });
  }
  function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype))
        return;
      ProxyClass.prototype[prop] = function() {
        return promisifyCursorRequestCall(this[targetProp], prop, arguments);
      };
    });
  }
  function Index(index) {
    this._index = index;
  }
  proxyProperties(Index, "_index", [
    "name",
    "keyPath",
    "multiEntry",
    "unique"
  ]);
  proxyRequestMethods(Index, "_index", IDBIndex, [
    "get",
    "getKey",
    "getAll",
    "getAllKeys",
    "count"
  ]);
  proxyCursorRequestMethods(Index, "_index", IDBIndex, [
    "openCursor",
    "openKeyCursor"
  ]);
  function Cursor(cursor, request) {
    this._cursor = cursor;
    this._request = request;
  }
  proxyProperties(Cursor, "_cursor", [
    "direction",
    "key",
    "primaryKey",
    "value"
  ]);
  proxyRequestMethods(Cursor, "_cursor", IDBCursor, [
    "update",
    "delete"
  ]);
  ["advance", "continue", "continuePrimaryKey"].forEach(function(methodName) {
    if (!(methodName in IDBCursor.prototype))
      return;
    Cursor.prototype[methodName] = function() {
      var cursor = this;
      var args = arguments;
      return Promise.resolve().then(function() {
        cursor._cursor[methodName].apply(cursor._cursor, args);
        return promisifyRequest(cursor._request).then(function(value) {
          if (!value)
            return;
          return new Cursor(value, cursor._request);
        });
      });
    };
  });
  function ObjectStore(store) {
    this._store = store;
  }
  ObjectStore.prototype.createIndex = function() {
    return new Index(this._store.createIndex.apply(this._store, arguments));
  };
  ObjectStore.prototype.index = function() {
    return new Index(this._store.index.apply(this._store, arguments));
  };
  proxyProperties(ObjectStore, "_store", [
    "name",
    "keyPath",
    "indexNames",
    "autoIncrement"
  ]);
  proxyRequestMethods(ObjectStore, "_store", IDBObjectStore, [
    "put",
    "add",
    "delete",
    "clear",
    "get",
    "getAll",
    "getKey",
    "getAllKeys",
    "count"
  ]);
  proxyCursorRequestMethods(ObjectStore, "_store", IDBObjectStore, [
    "openCursor",
    "openKeyCursor"
  ]);
  proxyMethods(ObjectStore, "_store", IDBObjectStore, [
    "deleteIndex"
  ]);
  function Transaction(idbTransaction) {
    this._tx = idbTransaction;
    this.complete = new Promise(function(resolve, reject) {
      idbTransaction.oncomplete = function() {
        resolve();
      };
      idbTransaction.onerror = function() {
        reject(idbTransaction.error);
      };
      idbTransaction.onabort = function() {
        reject(idbTransaction.error);
      };
    });
  }
  Transaction.prototype.objectStore = function() {
    return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
  };
  proxyProperties(Transaction, "_tx", [
    "objectStoreNames",
    "mode"
  ]);
  proxyMethods(Transaction, "_tx", IDBTransaction, [
    "abort"
  ]);
  function UpgradeDB(db, oldVersion, transaction) {
    this._db = db;
    this.oldVersion = oldVersion;
    this.transaction = new Transaction(transaction);
  }
  UpgradeDB.prototype.createObjectStore = function() {
    return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
  };
  proxyProperties(UpgradeDB, "_db", [
    "name",
    "version",
    "objectStoreNames"
  ]);
  proxyMethods(UpgradeDB, "_db", IDBDatabase, [
    "deleteObjectStore",
    "close"
  ]);
  function DB(db) {
    this._db = db;
  }
  DB.prototype.transaction = function() {
    return new Transaction(this._db.transaction.apply(this._db, arguments));
  };
  proxyProperties(DB, "_db", [
    "name",
    "version",
    "objectStoreNames"
  ]);
  proxyMethods(DB, "_db", IDBDatabase, [
    "close"
  ]);
  ["openCursor", "openKeyCursor"].forEach(function(funcName) {
    [ObjectStore, Index].forEach(function(Constructor) {
      if (!(funcName in Constructor.prototype))
        return;
      Constructor.prototype[funcName.replace("open", "iterate")] = function() {
        var args = toArray(arguments);
        var callback = args[args.length - 1];
        var nativeObject = this._store || this._index;
        var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
        request.onsuccess = function() {
          callback(request.result);
        };
      };
    });
  });
  [Index, ObjectStore].forEach(function(Constructor) {
    if (Constructor.prototype.getAll)
      return;
    Constructor.prototype.getAll = function(query, count) {
      var instance = this;
      var items = [];
      return new Promise(function(resolve) {
        instance.iterateCursor(query, function(cursor) {
          if (!cursor) {
            resolve(items);
            return;
          }
          items.push(cursor.value);
          if (count !== void 0 && items.length == count) {
            resolve(items);
            return;
          }
          cursor.continue();
        });
      });
    };
  });
  function openDb(name3, version3, upgradeCallback) {
    var p = promisifyRequestCall(indexedDB, "open", [name3, version3]);
    var request = p.request;
    if (request) {
      request.onupgradeneeded = function(event) {
        if (upgradeCallback) {
          upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
        }
      };
    }
    return p.then(function(db) {
      return new DB(db);
    });
  }
  function deleteDb(name3) {
    return promisifyRequestCall(indexedDB, "deleteDatabase", [name3]);
  }
  var name2 = "@firebase/installations";
  var version2 = "0.5.5";
  var PENDING_TIMEOUT_MS = 1e4;
  var PACKAGE_VERSION = `w:${version2}`;
  var INTERNAL_AUTH_VERSION = "FIS_v2";
  var INSTALLATIONS_API_URL = "https://firebaseinstallations.googleapis.com/v1";
  var TOKEN_EXPIRATION_BUFFER = 60 * 60 * 1e3;
  var SERVICE = "installations";
  var SERVICE_NAME = "Installations";
  var ERROR_DESCRIPTION_MAP = {
    [
      "missing-app-config-values"
      /* MISSING_APP_CONFIG_VALUES */
    ]: 'Missing App configuration value: "{$valueName}"',
    [
      "not-registered"
      /* NOT_REGISTERED */
    ]: "Firebase Installation is not registered.",
    [
      "installation-not-found"
      /* INSTALLATION_NOT_FOUND */
    ]: "Firebase Installation not found.",
    [
      "request-failed"
      /* REQUEST_FAILED */
    ]: '{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',
    [
      "app-offline"
      /* APP_OFFLINE */
    ]: "Could not process request. Application offline.",
    [
      "delete-pending-registration"
      /* DELETE_PENDING_REGISTRATION */
    ]: "Can't delete installation while there is a pending registration request."
  };
  var ERROR_FACTORY$1 = new ErrorFactory2(SERVICE, SERVICE_NAME, ERROR_DESCRIPTION_MAP);
  function isServerError(error) {
    return error instanceof FirebaseError2 && error.code.includes(
      "request-failed"
      /* REQUEST_FAILED */
    );
  }
  function getInstallationsEndpoint({ projectId }) {
    return `${INSTALLATIONS_API_URL}/projects/${projectId}/installations`;
  }
  function extractAuthTokenInfoFromResponse(response) {
    return {
      token: response.token,
      requestStatus: 2,
      expiresIn: getExpiresInFromResponseExpiresIn(response.expiresIn),
      creationTime: Date.now()
    };
  }
  async function getErrorFromResponse(requestName, response) {
    const responseJson = await response.json();
    const errorData = responseJson.error;
    return ERROR_FACTORY$1.create("request-failed", {
      requestName,
      serverCode: errorData.code,
      serverMessage: errorData.message,
      serverStatus: errorData.status
    });
  }
  function getHeaders$1({ apiKey }) {
    return new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-goog-api-key": apiKey
    });
  }
  function getHeadersWithAuth(appConfig, { refreshToken }) {
    const headers = getHeaders$1(appConfig);
    headers.append("Authorization", getAuthorizationHeader(refreshToken));
    return headers;
  }
  async function retryIfServerError(fn) {
    const result = await fn();
    if (result.status >= 500 && result.status < 600) {
      return fn();
    }
    return result;
  }
  function getExpiresInFromResponseExpiresIn(responseExpiresIn) {
    return Number(responseExpiresIn.replace("s", "000"));
  }
  function getAuthorizationHeader(refreshToken) {
    return `${INTERNAL_AUTH_VERSION} ${refreshToken}`;
  }
  async function createInstallationRequest(appConfig, { fid }) {
    const endpoint = getInstallationsEndpoint(appConfig);
    const headers = getHeaders$1(appConfig);
    const body = {
      fid,
      authVersion: INTERNAL_AUTH_VERSION,
      appId: appConfig.appId,
      sdkVersion: PACKAGE_VERSION
    };
    const request = {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    };
    const response = await retryIfServerError(() => fetch(endpoint, request));
    if (response.ok) {
      const responseValue = await response.json();
      const registeredInstallationEntry = {
        fid: responseValue.fid || fid,
        registrationStatus: 2,
        refreshToken: responseValue.refreshToken,
        authToken: extractAuthTokenInfoFromResponse(responseValue.authToken)
      };
      return registeredInstallationEntry;
    } else {
      throw await getErrorFromResponse("Create Installation", response);
    }
  }
  function sleep$1(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  function bufferToBase64UrlSafe(array) {
    const b64 = btoa(String.fromCharCode(...array));
    return b64.replace(/\+/g, "-").replace(/\//g, "_");
  }
  var VALID_FID_PATTERN = /^[cdef][\w-]{21}$/;
  var INVALID_FID = "";
  function generateFid() {
    try {
      const fidByteArray = new Uint8Array(17);
      const crypto = self.crypto || self.msCrypto;
      crypto.getRandomValues(fidByteArray);
      fidByteArray[0] = 112 + fidByteArray[0] % 16;
      const fid = encode(fidByteArray);
      return VALID_FID_PATTERN.test(fid) ? fid : INVALID_FID;
    } catch (_a) {
      return INVALID_FID;
    }
  }
  function encode(fidByteArray) {
    const b64String = bufferToBase64UrlSafe(fidByteArray);
    return b64String.substr(0, 22);
  }
  function getKey$1(appConfig) {
    return `${appConfig.appName}!${appConfig.appId}`;
  }
  var fidChangeCallbacks = /* @__PURE__ */ new Map();
  function fidChanged(appConfig, fid) {
    const key = getKey$1(appConfig);
    callFidChangeCallbacks(key, fid);
    broadcastFidChange(key, fid);
  }
  function callFidChangeCallbacks(key, fid) {
    const callbacks = fidChangeCallbacks.get(key);
    if (!callbacks) {
      return;
    }
    for (const callback of callbacks) {
      callback(fid);
    }
  }
  function broadcastFidChange(key, fid) {
    const channel = getBroadcastChannel();
    if (channel) {
      channel.postMessage({ key, fid });
    }
    closeBroadcastChannel();
  }
  var broadcastChannel = null;
  function getBroadcastChannel() {
    if (!broadcastChannel && "BroadcastChannel" in self) {
      broadcastChannel = new BroadcastChannel("[Firebase] FID Change");
      broadcastChannel.onmessage = (e) => {
        callFidChangeCallbacks(e.data.key, e.data.fid);
      };
    }
    return broadcastChannel;
  }
  function closeBroadcastChannel() {
    if (fidChangeCallbacks.size === 0 && broadcastChannel) {
      broadcastChannel.close();
      broadcastChannel = null;
    }
  }
  var DATABASE_NAME$1 = "firebase-installations-database";
  var DATABASE_VERSION$1 = 1;
  var OBJECT_STORE_NAME$1 = "firebase-installations-store";
  var dbPromise$1 = null;
  function getDbPromise$1() {
    if (!dbPromise$1) {
      dbPromise$1 = openDb(DATABASE_NAME$1, DATABASE_VERSION$1, (upgradeDB) => {
        switch (upgradeDB.oldVersion) {
          case 0:
            upgradeDB.createObjectStore(OBJECT_STORE_NAME$1);
        }
      });
    }
    return dbPromise$1;
  }
  async function set(appConfig, value) {
    const key = getKey$1(appConfig);
    const db = await getDbPromise$1();
    const tx = db.transaction(OBJECT_STORE_NAME$1, "readwrite");
    const objectStore = tx.objectStore(OBJECT_STORE_NAME$1);
    const oldValue = await objectStore.get(key);
    await objectStore.put(value, key);
    await tx.complete;
    if (!oldValue || oldValue.fid !== value.fid) {
      fidChanged(appConfig, value.fid);
    }
    return value;
  }
  async function remove(appConfig) {
    const key = getKey$1(appConfig);
    const db = await getDbPromise$1();
    const tx = db.transaction(OBJECT_STORE_NAME$1, "readwrite");
    await tx.objectStore(OBJECT_STORE_NAME$1).delete(key);
    await tx.complete;
  }
  async function update(appConfig, updateFn) {
    const key = getKey$1(appConfig);
    const db = await getDbPromise$1();
    const tx = db.transaction(OBJECT_STORE_NAME$1, "readwrite");
    const store = tx.objectStore(OBJECT_STORE_NAME$1);
    const oldValue = await store.get(key);
    const newValue = updateFn(oldValue);
    if (newValue === void 0) {
      await store.delete(key);
    } else {
      await store.put(newValue, key);
    }
    await tx.complete;
    if (newValue && (!oldValue || oldValue.fid !== newValue.fid)) {
      fidChanged(appConfig, newValue.fid);
    }
    return newValue;
  }
  async function getInstallationEntry(appConfig) {
    let registrationPromise;
    const installationEntry = await update(appConfig, (oldEntry) => {
      const installationEntry2 = updateOrCreateInstallationEntry(oldEntry);
      const entryWithPromise = triggerRegistrationIfNecessary(appConfig, installationEntry2);
      registrationPromise = entryWithPromise.registrationPromise;
      return entryWithPromise.installationEntry;
    });
    if (installationEntry.fid === INVALID_FID) {
      return { installationEntry: await registrationPromise };
    }
    return {
      installationEntry,
      registrationPromise
    };
  }
  function updateOrCreateInstallationEntry(oldEntry) {
    const entry = oldEntry || {
      fid: generateFid(),
      registrationStatus: 0
      /* NOT_STARTED */
    };
    return clearTimedOutRequest(entry);
  }
  function triggerRegistrationIfNecessary(appConfig, installationEntry) {
    if (installationEntry.registrationStatus === 0) {
      if (!navigator.onLine) {
        const registrationPromiseWithError = Promise.reject(ERROR_FACTORY$1.create(
          "app-offline"
          /* APP_OFFLINE */
        ));
        return {
          installationEntry,
          registrationPromise: registrationPromiseWithError
        };
      }
      const inProgressEntry = {
        fid: installationEntry.fid,
        registrationStatus: 1,
        registrationTime: Date.now()
      };
      const registrationPromise = registerInstallation(appConfig, inProgressEntry);
      return { installationEntry: inProgressEntry, registrationPromise };
    } else if (installationEntry.registrationStatus === 1) {
      return {
        installationEntry,
        registrationPromise: waitUntilFidRegistration(appConfig)
      };
    } else {
      return { installationEntry };
    }
  }
  async function registerInstallation(appConfig, installationEntry) {
    try {
      const registeredInstallationEntry = await createInstallationRequest(appConfig, installationEntry);
      return set(appConfig, registeredInstallationEntry);
    } catch (e) {
      if (isServerError(e) && e.customData.serverCode === 409) {
        await remove(appConfig);
      } else {
        await set(appConfig, {
          fid: installationEntry.fid,
          registrationStatus: 0
          /* NOT_STARTED */
        });
      }
      throw e;
    }
  }
  async function waitUntilFidRegistration(appConfig) {
    let entry = await updateInstallationRequest(appConfig);
    while (entry.registrationStatus === 1) {
      await sleep$1(100);
      entry = await updateInstallationRequest(appConfig);
    }
    if (entry.registrationStatus === 0) {
      const { installationEntry, registrationPromise } = await getInstallationEntry(appConfig);
      if (registrationPromise) {
        return registrationPromise;
      } else {
        return installationEntry;
      }
    }
    return entry;
  }
  function updateInstallationRequest(appConfig) {
    return update(appConfig, (oldEntry) => {
      if (!oldEntry) {
        throw ERROR_FACTORY$1.create(
          "installation-not-found"
          /* INSTALLATION_NOT_FOUND */
        );
      }
      return clearTimedOutRequest(oldEntry);
    });
  }
  function clearTimedOutRequest(entry) {
    if (hasInstallationRequestTimedOut(entry)) {
      return {
        fid: entry.fid,
        registrationStatus: 0
        /* NOT_STARTED */
      };
    }
    return entry;
  }
  function hasInstallationRequestTimedOut(installationEntry) {
    return installationEntry.registrationStatus === 1 && installationEntry.registrationTime + PENDING_TIMEOUT_MS < Date.now();
  }
  async function generateAuthTokenRequest({ appConfig, platformLoggerProvider }, installationEntry) {
    const endpoint = getGenerateAuthTokenEndpoint(appConfig, installationEntry);
    const headers = getHeadersWithAuth(appConfig, installationEntry);
    const platformLogger = platformLoggerProvider.getImmediate({
      optional: true
    });
    if (platformLogger) {
      headers.append("x-firebase-client", platformLogger.getPlatformInfoString());
    }
    const body = {
      installation: {
        sdkVersion: PACKAGE_VERSION
      }
    };
    const request = {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    };
    const response = await retryIfServerError(() => fetch(endpoint, request));
    if (response.ok) {
      const responseValue = await response.json();
      const completedAuthToken = extractAuthTokenInfoFromResponse(responseValue);
      return completedAuthToken;
    } else {
      throw await getErrorFromResponse("Generate Auth Token", response);
    }
  }
  function getGenerateAuthTokenEndpoint(appConfig, { fid }) {
    return `${getInstallationsEndpoint(appConfig)}/${fid}/authTokens:generate`;
  }
  async function refreshAuthToken(installations, forceRefresh = false) {
    let tokenPromise;
    const entry = await update(installations.appConfig, (oldEntry) => {
      if (!isEntryRegistered(oldEntry)) {
        throw ERROR_FACTORY$1.create(
          "not-registered"
          /* NOT_REGISTERED */
        );
      }
      const oldAuthToken = oldEntry.authToken;
      if (!forceRefresh && isAuthTokenValid(oldAuthToken)) {
        return oldEntry;
      } else if (oldAuthToken.requestStatus === 1) {
        tokenPromise = waitUntilAuthTokenRequest(installations, forceRefresh);
        return oldEntry;
      } else {
        if (!navigator.onLine) {
          throw ERROR_FACTORY$1.create(
            "app-offline"
            /* APP_OFFLINE */
          );
        }
        const inProgressEntry = makeAuthTokenRequestInProgressEntry(oldEntry);
        tokenPromise = fetchAuthTokenFromServer(installations, inProgressEntry);
        return inProgressEntry;
      }
    });
    const authToken = tokenPromise ? await tokenPromise : entry.authToken;
    return authToken;
  }
  async function waitUntilAuthTokenRequest(installations, forceRefresh) {
    let entry = await updateAuthTokenRequest(installations.appConfig);
    while (entry.authToken.requestStatus === 1) {
      await sleep$1(100);
      entry = await updateAuthTokenRequest(installations.appConfig);
    }
    const authToken = entry.authToken;
    if (authToken.requestStatus === 0) {
      return refreshAuthToken(installations, forceRefresh);
    } else {
      return authToken;
    }
  }
  function updateAuthTokenRequest(appConfig) {
    return update(appConfig, (oldEntry) => {
      if (!isEntryRegistered(oldEntry)) {
        throw ERROR_FACTORY$1.create(
          "not-registered"
          /* NOT_REGISTERED */
        );
      }
      const oldAuthToken = oldEntry.authToken;
      if (hasAuthTokenRequestTimedOut(oldAuthToken)) {
        return Object.assign(Object.assign({}, oldEntry), { authToken: {
          requestStatus: 0
          /* NOT_STARTED */
        } });
      }
      return oldEntry;
    });
  }
  async function fetchAuthTokenFromServer(installations, installationEntry) {
    try {
      const authToken = await generateAuthTokenRequest(installations, installationEntry);
      const updatedInstallationEntry = Object.assign(Object.assign({}, installationEntry), { authToken });
      await set(installations.appConfig, updatedInstallationEntry);
      return authToken;
    } catch (e) {
      if (isServerError(e) && (e.customData.serverCode === 401 || e.customData.serverCode === 404)) {
        await remove(installations.appConfig);
      } else {
        const updatedInstallationEntry = Object.assign(Object.assign({}, installationEntry), { authToken: {
          requestStatus: 0
          /* NOT_STARTED */
        } });
        await set(installations.appConfig, updatedInstallationEntry);
      }
      throw e;
    }
  }
  function isEntryRegistered(installationEntry) {
    return installationEntry !== void 0 && installationEntry.registrationStatus === 2;
  }
  function isAuthTokenValid(authToken) {
    return authToken.requestStatus === 2 && !isAuthTokenExpired(authToken);
  }
  function isAuthTokenExpired(authToken) {
    const now = Date.now();
    return now < authToken.creationTime || authToken.creationTime + authToken.expiresIn < now + TOKEN_EXPIRATION_BUFFER;
  }
  function makeAuthTokenRequestInProgressEntry(oldEntry) {
    const inProgressAuthToken = {
      requestStatus: 1,
      requestTime: Date.now()
    };
    return Object.assign(Object.assign({}, oldEntry), { authToken: inProgressAuthToken });
  }
  function hasAuthTokenRequestTimedOut(authToken) {
    return authToken.requestStatus === 1 && authToken.requestTime + PENDING_TIMEOUT_MS < Date.now();
  }
  async function getId(installations) {
    const installationsImpl = installations;
    const { installationEntry, registrationPromise } = await getInstallationEntry(installationsImpl.appConfig);
    if (registrationPromise) {
      registrationPromise.catch(console.error);
    } else {
      refreshAuthToken(installationsImpl).catch(console.error);
    }
    return installationEntry.fid;
  }
  async function getToken(installations, forceRefresh = false) {
    const installationsImpl = installations;
    await completeInstallationRegistration(installationsImpl.appConfig);
    const authToken = await refreshAuthToken(installationsImpl, forceRefresh);
    console.log("authToken", authToken.token);
    return authToken.token;
  }
  async function completeInstallationRegistration(appConfig) {
    const { registrationPromise } = await getInstallationEntry(appConfig);
    if (registrationPromise) {
      await registrationPromise;
    }
  }
  function extractAppConfig$1(app) {
    if (!app || !app.options) {
      throw getMissingValueError$1("App Configuration");
    }
    if (!app.name) {
      throw getMissingValueError$1("App Name");
    }
    const configKeys = [
      "projectId",
      "apiKey",
      "appId"
    ];
    for (const keyName of configKeys) {
      if (!app.options[keyName]) {
        throw getMissingValueError$1(keyName);
      }
    }
    return {
      appName: app.name,
      projectId: app.options.projectId,
      apiKey: app.options.apiKey,
      appId: app.options.appId
    };
  }
  function getMissingValueError$1(valueName) {
    return ERROR_FACTORY$1.create("missing-app-config-values", {
      valueName
    });
  }
  var INSTALLATIONS_NAME = "installations";
  var INSTALLATIONS_NAME_INTERNAL = "installations-internal";
  var publicFactory = (container) => {
    const app = container.getProvider("app").getImmediate();
    const appConfig = extractAppConfig$1(app);
    const platformLoggerProvider = _getProvider(app, "platform-logger");
    const installationsImpl = {
      app,
      appConfig,
      platformLoggerProvider,
      _delete: () => Promise.resolve()
    };
    return installationsImpl;
  };
  var internalFactory = (container) => {
    const app = container.getProvider("app").getImmediate();
    const installations = _getProvider(app, INSTALLATIONS_NAME).getImmediate();
    const installationsInternal = {
      getId: () => getId(installations),
      getToken: (forceRefresh) => getToken(installations, forceRefresh)
    };
    return installationsInternal;
  };
  function registerInstallations() {
    _registerComponent(new Component2(
      INSTALLATIONS_NAME,
      publicFactory,
      "PUBLIC"
      /* PUBLIC */
    ));
    _registerComponent(new Component2(
      INSTALLATIONS_NAME_INTERNAL,
      internalFactory,
      "PRIVATE"
      /* PRIVATE */
    ));
  }
  registerInstallations();
  registerVersion(name2, version2);
  registerVersion(name2, version2, "esm2017");
  var DEFAULT_VAPID_KEY = "BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4";
  var ENDPOINT = "https://fcmregistrations.googleapis.com/v1";
  var FCM_MSG = "FCM_MSG";
  var CONSOLE_CAMPAIGN_ID = "google.c.a.c_id";
  var SDK_PLATFORM_WEB = 3;
  var EVENT_MESSAGE_DELIVERED = 1;
  var MessageType$1;
  (function(MessageType2) {
    MessageType2[MessageType2["DATA_MESSAGE"] = 1] = "DATA_MESSAGE";
    MessageType2[MessageType2["DISPLAY_NOTIFICATION"] = 3] = "DISPLAY_NOTIFICATION";
  })(MessageType$1 || (MessageType$1 = {}));
  var MessageType;
  (function(MessageType2) {
    MessageType2["PUSH_RECEIVED"] = "push-received";
    MessageType2["NOTIFICATION_CLICKED"] = "notification-clicked";
  })(MessageType || (MessageType = {}));
  function arrayToBase64(array) {
    const uint8Array = new Uint8Array(array);
    const base64String = btoa(String.fromCharCode(...uint8Array));
    return base64String.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  }
  function base64ToArray(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  var OLD_DB_NAME = "fcm_token_details_db";
  var OLD_DB_VERSION = 5;
  var OLD_OBJECT_STORE_NAME = "fcm_token_object_Store";
  async function migrateOldDatabase(senderId) {
    if ("databases" in indexedDB) {
      const databases = await indexedDB.databases();
      const dbNames = databases.map((db2) => db2.name);
      if (!dbNames.includes(OLD_DB_NAME)) {
        return null;
      }
    }
    let tokenDetails = null;
    const db = await openDb(OLD_DB_NAME, OLD_DB_VERSION, async (db2) => {
      var _a;
      if (db2.oldVersion < 2) {
        return;
      }
      if (!db2.objectStoreNames.contains(OLD_OBJECT_STORE_NAME)) {
        return;
      }
      const objectStore = db2.transaction.objectStore(OLD_OBJECT_STORE_NAME);
      const value = await objectStore.index("fcmSenderId").get(senderId);
      await objectStore.clear();
      if (!value) {
        return;
      }
      if (db2.oldVersion === 2) {
        const oldDetails = value;
        if (!oldDetails.auth || !oldDetails.p256dh || !oldDetails.endpoint) {
          return;
        }
        tokenDetails = {
          token: oldDetails.fcmToken,
          createTime: (_a = oldDetails.createTime) !== null && _a !== void 0 ? _a : Date.now(),
          subscriptionOptions: {
            auth: oldDetails.auth,
            p256dh: oldDetails.p256dh,
            endpoint: oldDetails.endpoint,
            swScope: oldDetails.swScope,
            vapidKey: typeof oldDetails.vapidKey === "string" ? oldDetails.vapidKey : arrayToBase64(oldDetails.vapidKey)
          }
        };
      } else if (db2.oldVersion === 3) {
        const oldDetails = value;
        tokenDetails = {
          token: oldDetails.fcmToken,
          createTime: oldDetails.createTime,
          subscriptionOptions: {
            auth: arrayToBase64(oldDetails.auth),
            p256dh: arrayToBase64(oldDetails.p256dh),
            endpoint: oldDetails.endpoint,
            swScope: oldDetails.swScope,
            vapidKey: arrayToBase64(oldDetails.vapidKey)
          }
        };
      } else if (db2.oldVersion === 4) {
        const oldDetails = value;
        tokenDetails = {
          token: oldDetails.fcmToken,
          createTime: oldDetails.createTime,
          subscriptionOptions: {
            auth: arrayToBase64(oldDetails.auth),
            p256dh: arrayToBase64(oldDetails.p256dh),
            endpoint: oldDetails.endpoint,
            swScope: oldDetails.swScope,
            vapidKey: arrayToBase64(oldDetails.vapidKey)
          }
        };
      }
    });
    db.close();
    await deleteDb(OLD_DB_NAME);
    await deleteDb("fcm_vapid_details_db");
    await deleteDb("undefined");
    return checkTokenDetails(tokenDetails) ? tokenDetails : null;
  }
  function checkTokenDetails(tokenDetails) {
    if (!tokenDetails || !tokenDetails.subscriptionOptions) {
      return false;
    }
    const { subscriptionOptions } = tokenDetails;
    return typeof tokenDetails.createTime === "number" && tokenDetails.createTime > 0 && typeof tokenDetails.token === "string" && tokenDetails.token.length > 0 && typeof subscriptionOptions.auth === "string" && subscriptionOptions.auth.length > 0 && typeof subscriptionOptions.p256dh === "string" && subscriptionOptions.p256dh.length > 0 && typeof subscriptionOptions.endpoint === "string" && subscriptionOptions.endpoint.length > 0 && typeof subscriptionOptions.swScope === "string" && subscriptionOptions.swScope.length > 0 && typeof subscriptionOptions.vapidKey === "string" && subscriptionOptions.vapidKey.length > 0;
  }
  var DATABASE_NAME = "firebase-messaging-database";
  var DATABASE_VERSION = 1;
  var OBJECT_STORE_NAME = "firebase-messaging-store";
  var dbPromise = null;
  function getDbPromise() {
    if (!dbPromise) {
      dbPromise = openDb(DATABASE_NAME, DATABASE_VERSION, (upgradeDb) => {
        switch (upgradeDb.oldVersion) {
          case 0:
            upgradeDb.createObjectStore(OBJECT_STORE_NAME);
        }
      });
    }
    return dbPromise;
  }
  async function dbGet(firebaseDependencies) {
    const key = getKey(firebaseDependencies);
    const db = await getDbPromise();
    const tokenDetails = await db.transaction(OBJECT_STORE_NAME).objectStore(OBJECT_STORE_NAME).get(key);
    if (tokenDetails) {
      return tokenDetails;
    } else {
      const oldTokenDetails = await migrateOldDatabase(firebaseDependencies.appConfig.senderId);
      if (oldTokenDetails) {
        await dbSet(firebaseDependencies, oldTokenDetails);
        return oldTokenDetails;
      }
    }
  }
  async function dbSet(firebaseDependencies, tokenDetails) {
    const key = getKey(firebaseDependencies);
    const db = await getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
    await tx.objectStore(OBJECT_STORE_NAME).put(tokenDetails, key);
    await tx.complete;
    return tokenDetails;
  }
  async function dbRemove(firebaseDependencies) {
    const key = getKey(firebaseDependencies);
    const db = await getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
    await tx.objectStore(OBJECT_STORE_NAME).delete(key);
    await tx.complete;
  }
  function getKey({ appConfig }) {
    return appConfig.appId;
  }
  var ERROR_MAP = {
    [
      "missing-app-config-values"
      /* MISSING_APP_CONFIG_VALUES */
    ]: 'Missing App configuration value: "{$valueName}"',
    [
      "only-available-in-window"
      /* AVAILABLE_IN_WINDOW */
    ]: "This method is available in a Window context.",
    [
      "only-available-in-sw"
      /* AVAILABLE_IN_SW */
    ]: "This method is available in a service worker context.",
    [
      "permission-default"
      /* PERMISSION_DEFAULT */
    ]: "The notification permission was not granted and dismissed instead.",
    [
      "permission-blocked"
      /* PERMISSION_BLOCKED */
    ]: "The notification permission was not granted and blocked instead.",
    [
      "unsupported-browser"
      /* UNSUPPORTED_BROWSER */
    ]: "This browser doesn't support the API's required to use the Firebase SDK.",
    [
      "indexed-db-unsupported"
      /* INDEXED_DB_UNSUPPORTED */
    ]: "This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)",
    [
      "failed-service-worker-registration"
      /* FAILED_DEFAULT_REGISTRATION */
    ]: "We are unable to register the default service worker. {$browserErrorMessage}",
    [
      "token-subscribe-failed"
      /* TOKEN_SUBSCRIBE_FAILED */
    ]: "A problem occurred while subscribing the user to FCM: {$errorInfo}",
    [
      "token-subscribe-no-token"
      /* TOKEN_SUBSCRIBE_NO_TOKEN */
    ]: "FCM returned no token when subscribing the user to push.",
    [
      "token-unsubscribe-failed"
      /* TOKEN_UNSUBSCRIBE_FAILED */
    ]: "A problem occurred while unsubscribing the user from FCM: {$errorInfo}",
    [
      "token-update-failed"
      /* TOKEN_UPDATE_FAILED */
    ]: "A problem occurred while updating the user from FCM: {$errorInfo}",
    [
      "token-update-no-token"
      /* TOKEN_UPDATE_NO_TOKEN */
    ]: "FCM returned no token when updating the user to push.",
    [
      "use-sw-after-get-token"
      /* USE_SW_AFTER_GET_TOKEN */
    ]: "The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.",
    [
      "invalid-sw-registration"
      /* INVALID_SW_REGISTRATION */
    ]: "The input to useServiceWorker() must be a ServiceWorkerRegistration.",
    [
      "invalid-bg-handler"
      /* INVALID_BG_HANDLER */
    ]: "The input to setBackgroundMessageHandler() must be a function.",
    [
      "invalid-vapid-key"
      /* INVALID_VAPID_KEY */
    ]: "The public VAPID key must be a string.",
    [
      "use-vapid-key-after-get-token"
      /* USE_VAPID_KEY_AFTER_GET_TOKEN */
    ]: "The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."
  };
  var ERROR_FACTORY2 = new ErrorFactory2("messaging", "Messaging", ERROR_MAP);
  async function requestGetToken(firebaseDependencies, subscriptionOptions) {
    const headers = await getHeaders(firebaseDependencies);
    const body = getBody(subscriptionOptions);
    const subscribeOptions = {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    };
    let responseData;
    try {
      const response = await fetch(getEndpoint(firebaseDependencies.appConfig), subscribeOptions);
      responseData = await response.json();
    } catch (err) {
      throw ERROR_FACTORY2.create("token-subscribe-failed", {
        errorInfo: err
      });
    }
    if (responseData.error) {
      const message = responseData.error.message;
      throw ERROR_FACTORY2.create("token-subscribe-failed", {
        errorInfo: message
      });
    }
    if (!responseData.token) {
      throw ERROR_FACTORY2.create(
        "token-subscribe-no-token"
        /* TOKEN_SUBSCRIBE_NO_TOKEN */
      );
    }
    return responseData.token;
  }
  async function requestUpdateToken(firebaseDependencies, tokenDetails) {
    const headers = await getHeaders(firebaseDependencies);
    const body = getBody(tokenDetails.subscriptionOptions);
    const updateOptions = {
      method: "PATCH",
      headers,
      body: JSON.stringify(body)
    };
    let responseData;
    try {
      const response = await fetch(`${getEndpoint(firebaseDependencies.appConfig)}/${tokenDetails.token}`, updateOptions);
      responseData = await response.json();
    } catch (err) {
      throw ERROR_FACTORY2.create("token-update-failed", {
        errorInfo: err
      });
    }
    if (responseData.error) {
      const message = responseData.error.message;
      throw ERROR_FACTORY2.create("token-update-failed", {
        errorInfo: message
      });
    }
    if (!responseData.token) {
      throw ERROR_FACTORY2.create(
        "token-update-no-token"
        /* TOKEN_UPDATE_NO_TOKEN */
      );
    }
    return responseData.token;
  }
  async function requestDeleteToken(firebaseDependencies, token) {
    const headers = await getHeaders(firebaseDependencies);
    const unsubscribeOptions = {
      method: "DELETE",
      headers
    };
    try {
      const response = await fetch(`${getEndpoint(firebaseDependencies.appConfig)}/${token}`, unsubscribeOptions);
      const responseData = await response.json();
      if (responseData.error) {
        const message = responseData.error.message;
        throw ERROR_FACTORY2.create("token-unsubscribe-failed", {
          errorInfo: message
        });
      }
    } catch (err) {
      throw ERROR_FACTORY2.create("token-unsubscribe-failed", {
        errorInfo: err
      });
    }
  }
  function getEndpoint({ projectId }) {
    return `${ENDPOINT}/projects/${projectId}/registrations`;
  }
  async function getHeaders({ appConfig, installations }) {
    const authToken = await installations.getToken();
    return new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-goog-api-key": appConfig.apiKey,
      "x-goog-firebase-installations-auth": `FIS ${authToken}`
    });
  }
  function getBody({ p256dh, auth, endpoint, vapidKey }) {
    const body = {
      web: {
        endpoint,
        auth,
        p256dh
      }
    };
    if (vapidKey !== DEFAULT_VAPID_KEY) {
      body.web.applicationPubKey = vapidKey;
    }
    return body;
  }
  var TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1e3;
  async function getTokenInternal(messaging2) {
    const pushSubscription = await getPushSubscription(messaging2.swRegistration, messaging2.vapidKey);
    const subscriptionOptions = {
      vapidKey: messaging2.vapidKey,
      swScope: messaging2.swRegistration.scope,
      endpoint: pushSubscription.endpoint,
      auth: arrayToBase64(pushSubscription.getKey("auth")),
      p256dh: arrayToBase64(pushSubscription.getKey("p256dh"))
    };
    const tokenDetails = await dbGet(messaging2.firebaseDependencies);
    if (!tokenDetails) {
      return getNewToken(messaging2.firebaseDependencies, subscriptionOptions);
    } else if (!isTokenValid(tokenDetails.subscriptionOptions, subscriptionOptions)) {
      try {
        await requestDeleteToken(messaging2.firebaseDependencies, tokenDetails.token);
      } catch (e) {
        console.warn(e);
      }
      return getNewToken(messaging2.firebaseDependencies, subscriptionOptions);
    } else if (Date.now() >= tokenDetails.createTime + TOKEN_EXPIRATION_MS) {
      return updateToken(messaging2, {
        token: tokenDetails.token,
        createTime: Date.now(),
        subscriptionOptions
      });
    } else {
      return tokenDetails.token;
    }
  }
  async function deleteTokenInternal(messaging2) {
    const tokenDetails = await dbGet(messaging2.firebaseDependencies);
    if (tokenDetails) {
      await requestDeleteToken(messaging2.firebaseDependencies, tokenDetails.token);
      await dbRemove(messaging2.firebaseDependencies);
    }
    const pushSubscription = await messaging2.swRegistration.pushManager.getSubscription();
    if (pushSubscription) {
      return pushSubscription.unsubscribe();
    }
    return true;
  }
  async function updateToken(messaging2, tokenDetails) {
    try {
      const updatedToken = await requestUpdateToken(messaging2.firebaseDependencies, tokenDetails);
      const updatedTokenDetails = Object.assign(Object.assign({}, tokenDetails), { token: updatedToken, createTime: Date.now() });
      await dbSet(messaging2.firebaseDependencies, updatedTokenDetails);
      return updatedToken;
    } catch (e) {
      await deleteTokenInternal(messaging2);
      throw e;
    }
  }
  async function getNewToken(firebaseDependencies, subscriptionOptions) {
    const token = await requestGetToken(firebaseDependencies, subscriptionOptions);
    const tokenDetails = {
      token,
      createTime: Date.now(),
      subscriptionOptions
    };
    await dbSet(firebaseDependencies, tokenDetails);
    return tokenDetails.token;
  }
  async function getPushSubscription(swRegistration, vapidKey) {
    const subscription = await swRegistration.pushManager.getSubscription();
    if (subscription) {
      return subscription;
    }
    return swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      // Chrome <= 75 doesn't support base64-encoded VAPID key. For backward compatibility, VAPID key
      // submitted to pushManager#subscribe must be of type Uint8Array.
      applicationServerKey: base64ToArray(vapidKey)
    });
  }
  function isTokenValid(dbOptions, currentOptions) {
    const isVapidKeyEqual = currentOptions.vapidKey === dbOptions.vapidKey;
    const isEndpointEqual = currentOptions.endpoint === dbOptions.endpoint;
    const isAuthEqual = currentOptions.auth === dbOptions.auth;
    const isP256dhEqual = currentOptions.p256dh === dbOptions.p256dh;
    return isVapidKeyEqual && isEndpointEqual && isAuthEqual && isP256dhEqual;
  }
  function externalizePayload(internalPayload) {
    const payload = {
      from: internalPayload.from,
      // eslint-disable-next-line camelcase
      collapseKey: internalPayload.collapse_key,
      // eslint-disable-next-line camelcase
      messageId: internalPayload.fcmMessageId
    };
    propagateNotificationPayload(payload, internalPayload);
    propagateDataPayload(payload, internalPayload);
    propagateFcmOptions(payload, internalPayload);
    return payload;
  }
  function propagateNotificationPayload(payload, messagePayloadInternal) {
    if (!messagePayloadInternal.notification) {
      return;
    }
    payload.notification = {};
    const title = messagePayloadInternal.notification.title;
    if (!!title) {
      payload.notification.title = title;
    }
    const body = messagePayloadInternal.notification.body;
    if (!!body) {
      payload.notification.body = body;
    }
    const image = messagePayloadInternal.notification.image;
    if (!!image) {
      payload.notification.image = image;
    }
  }
  function propagateDataPayload(payload, messagePayloadInternal) {
    if (!messagePayloadInternal.data) {
      return;
    }
    payload.data = messagePayloadInternal.data;
  }
  function propagateFcmOptions(payload, messagePayloadInternal) {
    if (!messagePayloadInternal.fcmOptions) {
      return;
    }
    payload.fcmOptions = {};
    const link = messagePayloadInternal.fcmOptions.link;
    if (!!link) {
      payload.fcmOptions.link = link;
    }
    const analyticsLabel = messagePayloadInternal.fcmOptions.analytics_label;
    if (!!analyticsLabel) {
      payload.fcmOptions.analyticsLabel = analyticsLabel;
    }
  }
  function isConsoleMessage(data) {
    return typeof data === "object" && !!data && CONSOLE_CAMPAIGN_ID in data;
  }
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  _mergeStrings("hts/frbslgigp.ogepscmv/ieo/eaylg", "tp:/ieaeogn-agolai.o/1frlglgc/o");
  _mergeStrings("AzSCbw63g1R0nCw85jG8", "Iaya3yLKwmgvh7cF0q4");
  async function stageLog(messaging2, internalPayload) {
    const fcmEvent = createFcmEvent(internalPayload, await messaging2.firebaseDependencies.installations.getId());
    createAndEnqueueLogEvent(messaging2, fcmEvent);
  }
  function createFcmEvent(internalPayload, fid) {
    var _a, _b;
    const fcmEvent = {};
    if (!!internalPayload.from) {
      fcmEvent.project_number = internalPayload.from;
    }
    if (!!internalPayload.fcmMessageId) {
      fcmEvent.message_id = internalPayload.fcmMessageId;
    }
    fcmEvent.instance_id = fid;
    if (!!internalPayload.notification) {
      fcmEvent.message_type = MessageType$1.DISPLAY_NOTIFICATION.toString();
    } else {
      fcmEvent.message_type = MessageType$1.DATA_MESSAGE.toString();
    }
    fcmEvent.sdk_platform = SDK_PLATFORM_WEB.toString();
    fcmEvent.package_name = self.origin.replace(/(^\w+:|^)\/\//, "");
    if (!!internalPayload.collapse_key) {
      fcmEvent.collapse_key = internalPayload.collapse_key;
    }
    fcmEvent.event = EVENT_MESSAGE_DELIVERED.toString();
    if (!!((_a = internalPayload.fcmOptions) === null || _a === void 0 ? void 0 : _a.analytics_label)) {
      fcmEvent.analytics_label = (_b = internalPayload.fcmOptions) === null || _b === void 0 ? void 0 : _b.analytics_label;
    }
    return fcmEvent;
  }
  function createAndEnqueueLogEvent(messaging2, fcmEvent) {
    const logEvent = {};
    logEvent.event_time_ms = Math.floor(Date.now()).toString();
    logEvent.source_extension_json_proto3 = JSON.stringify(fcmEvent);
    messaging2.logEvents.push(logEvent);
  }
  function _mergeStrings(s1, s2) {
    const resultArray = [];
    for (let i = 0; i < s1.length; i++) {
      resultArray.push(s1.charAt(i));
      if (i < s2.length) {
        resultArray.push(s2.charAt(i));
      }
    }
    return resultArray.join("");
  }
  async function onSubChange(event, messaging2) {
    var _a, _b;
    const { newSubscription } = event;
    if (!newSubscription) {
      await deleteTokenInternal(messaging2);
      return;
    }
    const tokenDetails = await dbGet(messaging2.firebaseDependencies);
    await deleteTokenInternal(messaging2);
    messaging2.vapidKey = (_b = (_a = tokenDetails === null || tokenDetails === void 0 ? void 0 : tokenDetails.subscriptionOptions) === null || _a === void 0 ? void 0 : _a.vapidKey) !== null && _b !== void 0 ? _b : DEFAULT_VAPID_KEY;
    await getTokenInternal(messaging2);
  }
  async function onPush(event, messaging2) {
    const internalPayload = getMessagePayloadInternal(event);
    if (!internalPayload) {
      return;
    }
    if (messaging2.deliveryMetricsExportedToBigQueryEnabled) {
      await stageLog(messaging2, internalPayload);
    }
    const clientList = await getClientList();
    if (hasVisibleClients(clientList)) {
      return sendMessagePayloadInternalToWindows(clientList, internalPayload);
    }
    if (!!internalPayload.notification) {
      await showNotification(wrapInternalPayload(internalPayload));
    }
    if (!messaging2) {
      return;
    }
    if (!!messaging2.onBackgroundMessageHandler) {
      const payload = externalizePayload(internalPayload);
      if (typeof messaging2.onBackgroundMessageHandler === "function") {
        messaging2.onBackgroundMessageHandler(payload);
      } else {
        messaging2.onBackgroundMessageHandler.next(payload);
      }
    }
  }
  async function onNotificationClick(event) {
    var _a, _b;
    const internalPayload = (_b = (_a = event.notification) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b[FCM_MSG];
    if (!internalPayload) {
      return;
    } else if (event.action) {
      return;
    }
    event.stopImmediatePropagation();
    event.notification.close();
    const link = getLink(internalPayload);
    if (!link) {
      return;
    }
    const url = new URL(link, self.location.href);
    const originUrl = new URL(self.location.origin);
    if (url.host !== originUrl.host) {
      return;
    }
    let client = await getWindowClient(url);
    if (!client) {
      client = await self.clients.openWindow(link);
      await sleep(3e3);
    } else {
      client = await client.focus();
    }
    if (!client) {
      return;
    }
    internalPayload.messageType = MessageType.NOTIFICATION_CLICKED;
    internalPayload.isFirebaseMessaging = true;
    return client.postMessage(internalPayload);
  }
  function wrapInternalPayload(internalPayload) {
    const wrappedInternalPayload = Object.assign({}, internalPayload.notification);
    wrappedInternalPayload.data = {
      [FCM_MSG]: internalPayload
    };
    return wrappedInternalPayload;
  }
  function getMessagePayloadInternal({ data }) {
    if (!data) {
      return null;
    }
    try {
      return data.json();
    } catch (err) {
      return null;
    }
  }
  async function getWindowClient(url) {
    const clientList = await getClientList();
    for (const client of clientList) {
      const clientUrl = new URL(client.url, self.location.href);
      if (url.host === clientUrl.host) {
        return client;
      }
    }
    return null;
  }
  function isExtensionManifestV3() {
    if (typeof chrome.runtime.getManifest === "undefined") {
      return false;
    }
    const manifest = chrome.runtime.getManifest();
    return manifest.manifest_version === 3;
  }
  function hasVisibleClients(clientList) {
    if (isExtensionManifestV3()) {
      return clientList.some((client) => client.visibilityState === "visible");
    }
    return clientList.some((client) => client.visibilityState === "visible" && // Ignore chrome-extension clients as that matches the background pages of extensions, which
    // are always considered visible for some reason.
    !client.url.startsWith("chrome-extension://"));
  }
  function sendMessagePayloadInternalToWindows(clientList, internalPayload) {
    internalPayload.isFirebaseMessaging = true;
    internalPayload.messageType = MessageType.PUSH_RECEIVED;
    for (const client of clientList) {
      client.postMessage(internalPayload);
    }
  }
  function getClientList() {
    return self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
      // TS doesn't know that "type: 'window'" means it'll return WindowClient[]
    });
  }
  function showNotification(notificationPayloadInternal) {
    var _a;
    const { actions } = notificationPayloadInternal;
    const { maxActions } = Notification;
    if (actions && maxActions && actions.length > maxActions) {
      console.warn(`This browser only supports ${maxActions} actions. The remaining actions will not be displayed.`);
    }
    return self.registration.showNotification(
      /* title= */
      (_a = notificationPayloadInternal.title) !== null && _a !== void 0 ? _a : "",
      notificationPayloadInternal
    );
  }
  function getLink(payload) {
    var _a, _b, _c;
    const link = (_b = (_a = payload.fcmOptions) === null || _a === void 0 ? void 0 : _a.link) !== null && _b !== void 0 ? _b : (_c = payload.notification) === null || _c === void 0 ? void 0 : _c.click_action;
    if (link) {
      return link;
    }
    if (isConsoleMessage(payload.data)) {
      return self.location.origin;
    } else {
      return null;
    }
  }
  function extractAppConfig(app) {
    if (!app || !app.options) {
      throw getMissingValueError("App Configuration Object");
    }
    if (!app.name) {
      throw getMissingValueError("App Name");
    }
    const configKeys = [
      "projectId",
      "apiKey",
      "appId",
      "messagingSenderId"
    ];
    const { options } = app;
    for (const keyName of configKeys) {
      if (!options[keyName]) {
        throw getMissingValueError(keyName);
      }
    }
    return {
      appName: app.name,
      projectId: options.projectId,
      apiKey: options.apiKey,
      appId: options.appId,
      senderId: options.messagingSenderId
    };
  }
  function getMissingValueError(valueName) {
    return ERROR_FACTORY2.create("missing-app-config-values", {
      valueName
    });
  }
  var MessagingService = class {
    constructor(app, installations, analyticsProvider) {
      this.deliveryMetricsExportedToBigQueryEnabled = false;
      this.onBackgroundMessageHandler = null;
      this.onMessageHandler = null;
      this.logEvents = [];
      this.isLogServiceStarted = false;
      const appConfig = extractAppConfig(app);
      this.firebaseDependencies = {
        app,
        appConfig,
        installations,
        analyticsProvider
      };
    }
    _delete() {
      return Promise.resolve();
    }
  };
  var SwMessagingFactory = (container) => {
    const messaging2 = new MessagingService(container.getProvider("app").getImmediate(), container.getProvider("installations-internal").getImmediate(), container.getProvider("analytics-internal"));
    self.addEventListener("push", (e) => {
      e.waitUntil(onPush(e, messaging2));
    });
    self.addEventListener("pushsubscriptionchange", (e) => {
      e.waitUntil(onSubChange(e, messaging2));
    });
    self.addEventListener("notificationclick", (e) => {
      e.waitUntil(onNotificationClick(e));
    });
    return messaging2;
  };
  function registerMessagingInSw() {
    _registerComponent(new Component2(
      "messaging-sw",
      SwMessagingFactory,
      "PUBLIC"
      /* PUBLIC */
    ));
  }
  async function isSwSupported() {
    return isIndexedDBAvailable() && await validateIndexedDBOpenable() && "PushManager" in self && "Notification" in self && ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification") && PushSubscription.prototype.hasOwnProperty("getKey");
  }
  function onBackgroundMessage$1(messaging2, nextOrObserver) {
    if (self.document !== void 0) {
      throw ERROR_FACTORY2.create(
        "only-available-in-sw"
        /* AVAILABLE_IN_SW */
      );
    }
    messaging2.onBackgroundMessageHandler = nextOrObserver;
    return () => {
      messaging2.onBackgroundMessageHandler = null;
    };
  }
  function getMessagingInSw(app = getApp()) {
    isSwSupported().then((isSupported) => {
      if (!isSupported) {
        throw ERROR_FACTORY2.create(
          "unsupported-browser"
          /* UNSUPPORTED_BROWSER */
        );
      }
    }, (_) => {
      throw ERROR_FACTORY2.create(
        "indexed-db-unsupported"
        /* INDEXED_DB_UNSUPPORTED */
      );
    });
    return _getProvider(getModularInstance(app), "messaging-sw").getImmediate();
  }
  function onBackgroundMessage(messaging2, nextOrObserver) {
    messaging2 = getModularInstance(messaging2);
    return onBackgroundMessage$1(messaging2, nextOrObserver);
  }
  registerMessagingInSw();

  // src/firebaseConfig.js
  var firebaseConfig = {
    apiKey: "AIzaSyAJ6UqDzOM3DOP5YXOvaNMZmpW57bq0N10",
    authDomain: "rc-huddle-demo.firebaseapp.com",
    projectId: "rc-huddle-demo",
    storageBucket: "rc-huddle-demo.appspot.com",
    messagingSenderId: "389961537831",
    appId: "1:389961537831:web:610f56b9bda706c7d2b102",
    measurementId: "G-ZC9L0VX6GS"
  };

  // src/sw.js
  var firebaseApp = initializeApp(firebaseConfig);
  var messaging = getMessagingInSw(firebaseApp);
  var creatorTabId = 0;
  onBackgroundMessage(messaging, (payload) => {
    console.log("[background.js] Received background message ", payload);
    chrome.tabs.sendMessage(creatorTabId, { type: "receiveFcmMessage", payload });
  });
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === "onContentInjected") {
      creatorTabId = sender.tab.id;
    }
    if (request.type === "onPageClosed") {
      const postBody = {
        platform: request.platform,
        docId: request.docId
      };
      const checkOutResponse = await fetch(
        request.url,
        {
          method: "POST",
          body: postBody
        }
      );
      console.log("checked out: ", checkOutResponse.data);
      sendResponse({ result: "ok" });
    }
  });
})();
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */
