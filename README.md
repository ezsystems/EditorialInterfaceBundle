Prototype of _a new editorial interface_ for eZ Publish "6.x"
=============================================================

For now, it's only a prototype of _a new editorial interface_ for eZ Publish5.
A static prototype is available in the `gh-pages` branch and is visible online
at http://ezsystems.github.com/EditorialInterfaceBundle/.

For now, the master branch is a Symfony 2 bundle dedicated to eZ Publish 5. It
injects metadata in field and view templates. The current field templates put
those metadata as HTML5 data attributes. The metadata in view templates are not
handled at the moment.

Install
-------

* If <ezpublish5_root>/src/EzSystems does not exist, create it
* Clone the git repository in <ezpublish5_root>/src/EzSystems/
* Edit <ezpublish5_root>/ezpublish/EzPublishKernel.php and add the following
  line before in the return statement of the method `registerBundles`:

      $bundles[] = new EzSystems\EditorialInterfaceBundle\EzSystemsEditorialInterfaceBundle();

* Clear the Symfony 2 caches with `ezpublish/console`
