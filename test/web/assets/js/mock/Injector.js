define('mock/Injector', [
    'mock/Restangular',
    'mock/Graph',
    'mock/Progress',
    'mock/TreeFactory',
    'mock/State',
    'mock/Q',
    'angular',
    'angular-mocks'
], function(Restangular, Graph, Progress, TreeFactory, State, Q, angular) {
    'use strict';

    var spyExclusionList = [
        'callee',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        '__defineGetter__',
        '__lookupGetter__',
        '__defineSetter__',
        '__lookupSetter__'
    ].concat(Object.getOwnPropertyNames(Object.__proto__));

    function Injector() {
        this.$$injector = angular.injector(['ngMock']);
        this.instances = {
            '$injector': this
        };

        this.$$init();
    }

    Injector.prototype.$$init = function() {
        this.service('Restangular', Restangular);
        this.service('$graph', Graph);
        this.service('$progress', Progress);
        this.provider('$treeFactory', function() { this.$get = function() { return TreeFactory } });
        this.service('$state', State);
        this.service('$q', Q);
    };

    Injector.prototype.provider = function(name, value) {
        var instance = this.invoke(
            this.instantiate(value).$get,
            name
        );

        this.set(name, instance);
    };

    Injector.prototype.service = function(name, value) {
        var instance = this.instantiate(value)

        this.set(name, instance);
    };

    Injector.prototype.get = function(name) {
        if (this.instances[name]) {
            return this.instances[name];
        }

        var instance = this.$$injector.get(name);

        instance = this.$$spyObject(instance, true, name);
        this.set(name, instance);

        return instance;
    };

    Injector.prototype.set = function(name, object) {
        this.instances[name] = object;

        return this;
    }

    Injector.prototype.invoke = function(callback, spyName) {
        if (!angular.isArray(callback)) {
            callback = [callback];
        }

        callback = angular.copy(callback);

        var constructor = callback.pop();

        var object = constructor.apply(constructor, this.$$resolve(callback));

        return this.$$spyObject(object, spyName);
    }

    Injector.prototype.instantiate = function(callback, dependencies) {
        dependencies = dependencies || {};

        var self = this;

        angular.forEach(dependencies, function(dependency, name) {
            self.set(name, dependency);
        });

        var args = callback.$inject ? angular.copy(callback.$inject) : [];

        return this.$$construct(callback, this.$$resolve(args));
    }

    Injector.prototype.$$construct = function(constructor, args) {
        function F() {
            return constructor.apply(this, args);
        }

        F.prototype = constructor.prototype;

        var instance = new F();
        return this.$$spyObject(instance);
    }

    Injector.prototype.$$spyFunction = function(callback, spyName) {
        var spy = jasmine.createSpy(spyName).andCallFake(callback);
        angular.extend(spy, callback);

        return spy;
    };

    Injector.prototype.$$spyObject = function(object, ignorePrivate, spyName) {
        ignorePrivate = ignorePrivate !== undefined ? ignorePrivate : false;

        var methods = this.$$getObjectMethodNames(object);

        if (object.constructor.name === 'Function') {
            object = this.$$spyFunction(object, spyName);
        }

        angular.forEach(methods, function(method) {
            if (ignorePrivate && method.slice(0, 2) === '$$') {
                return false;
            }

            spyOn(object, method).andCallThrough();
        });

        return object;
    };

    Injector.prototype.$$getObjectMethodNames = function(object) {
        var methods = [];

        angular.forEach(Object.getOwnPropertyNames(object.__proto__), function(property) {
            if (!(spyExclusionList.indexOf(property) === -1 && typeof(object[property]) === 'function')) {
                return;
            }

            methods.push(property);
        });

        if (methods.length === 0) {
            methods = Object.keys(object);
        }

        return methods;
    };

    Injector.prototype.$$resolve = function(dependencies) {
        var args = [],
            self = this
        ;

        angular.forEach(dependencies, function(dependencyName) {
            args.push(self.get(dependencyName));
        });

        return args;
    };

    return Injector;
});
