# elephant [![Circle CI](https://circleci.com/gh/dickeyxxx/elephant/tree/master.svg?style=svg)](https://circleci.com/gh/dickeyxxx/elephant/tree/master)

A private npm cache/server.

Overview
--------

This project allows you to have your own npm registry. This server works with the necessary `npm` commands just like the npmjs.org registry. You can use it to not worry about npm going down or to store your private packages. It performs much faster than npmjs.org and can even be matched with a CDN like Cloudfront to be fast globally.

Rather than trying to copy all the data in npm, this acts more like a proxy. While npm is up, it will cache package data in S3. If npm goes down, it will deliver whatever is available in the cache. This means it won't be a fully comprehensive backup of npm, but you will be able to access anything you accessed before.

The inspiration for this project comes from [sinopia](https://github.com/rlidwka/sinopia). This came out of a need for better cache, CDN, and general performance as well as stability of being able to run multiple instances without depending on a local filesystem.

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Storage
-------

The bulk of the data is stored in S3. You will need to set the `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_S3_BUCKET` environment variables.

For caching, some data will be stored in `./tmp`, and if `REDIS_URL` is set (optional) redis will be used to cache package data.

How it works
------------

Essentially the goal of the project is to quickly deliver current npm data even when npm is offline.  In npm there are 2 main types of requests: package metadata and tarballs.

Package metadata mostly contains what versions of a package are available. These cannot be cached for very long since the package can be updated. By default, it is cached for 60 seconds. You can modify this with `CACHE_PACKAGE_TTL`. Etags are also supported and cached to further speed up access.

The tarballs are the actual code and never change once they are uploaded (though they can be removed via unpublishing). These are downloaded one time from npmjs.org per package and version, stored in S3 and in the local tmp folder for future requests. These have a very long max-age header.

In the event npmjs.org is offline, elephant will use the most recent package metadata that was requested from npmjs.org until it comes back online.

npm commands supported
----------------------

* `npm install`
* `npm update`
* `npm login`
* `npm whoami`
* `npm publish`

Authentication
--------------

Elephant uses an htpasswd file in S3 for authentication and stores tokens in S3. To set this up, first create an htpasswd file. Then upload it to `/htpasswd` in your S3 bucket.

```
$ htpasswd -nB dickeyxxx > htpasswd
```

Then you can login with npm. Note that the email is ignored by the server, but the CLI will force you to add one.

```
$ npm login --registry http://myregistry
Username: dickeyxxx
Password:
Email: (this IS public) jeff@heroku.com
$ npm whoami --registry http://myregistry
dickeyxxx
```
