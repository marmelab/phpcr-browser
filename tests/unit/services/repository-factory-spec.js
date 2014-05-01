/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'mocks',
  'fixtures',
  'angular',
  'angularMocks',
  'app',
  'services/repository-factory'
], function (mocks, fixtures) {
  'use strict';

  describe('Service: RepositoryFactory', function () {
    var RepositoryFactory,
        ObjectMapper;

    // load the service's module
    beforeEach(module('browserApp'));
    beforeEach(function() {
      ObjectMapper =  mocks.getObjectMapperMock();

      module(function ($provide) {
        $provide.value('mbObjectMapper', ObjectMapper);
      });
    });

    beforeEach(inject(function ($injector) {
      RepositoryFactory = $injector.get('mbRepositoryFactory');
    }));

    it('should accept only valid data', function () {
      expect(RepositoryFactory.accept(fixtures.repositories[0])).toBe(true);
      expect(RepositoryFactory.accept({ name: 'test' })).toBe(false);
    });

    it('should return repository data with getter', function () {
      var repository = RepositoryFactory.build(fixtures.repositories[0], ObjectMapper.find);
      expect(repository.getName()).toBe(fixtures.repositories[0].name);
      expect(repository.getFactoryName()).toBe(fixtures.repositories[0].factoryName);
      expect(repository.getSupportedOperations()).toBe(fixtures.repositories[0].support);
      expect(repository.supports('workspace.create')).toBe(true);
    });

    it('should call find on ObjectMapper when getWorkspaces is called', function () {
      var repository = RepositoryFactory.build(fixtures.repositories[0], ObjectMapper.find);
      repository.getWorkspaces();
      expect(ObjectMapper.find).toHaveBeenCalledWith(
        '/' + repository.getName() + '/*',
        undefined
      );
    });

    it('should call find on ObjectMapper when getWorkspace is called', function () {
      var repository = RepositoryFactory.build(fixtures.repositories[0], ObjectMapper.find);
      repository.getWorkspace('default');
      expect(ObjectMapper.find).toHaveBeenCalledWith(
        '/' + repository.getName() + '/default'
      );
    });
  });
});
