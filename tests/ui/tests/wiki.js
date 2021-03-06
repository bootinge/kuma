define([
    'intern!object',
    'intern/chai!assert',
    'base/lib/config',
    'base/lib/assert',
    'base/lib/POM'
], function(registerSuite, assert, config, libAssert, POM) {

    // Create this page's specific POM
    var Page = new POM({
        // Any functions used multiple times or important properties of the page
    });

    registerSuite({

        name: 'wiki',

        before: function() {
            Page.init(this.remote, config.homepageUrl);
        },

        beforeEach: function() {
            return Page.setup();
        },

        after: function() {
            return Page.teardown();
        },

        '[requires-login] Logging in for wiki tests': function() {
            // This appears here instead of "before" so that login isn't attempted
            // due to '[requires-login]'

            return Page.login();
        },

        '[requires-login] The new document screen passes all the checks': function() {

            var remote = this.remote;

            return remote.get(config.url + 'docs/new')
                        .then(function() {
                            // Ensure that CKEditor loaded properly
                            return libAssert.windowPropertyExists(remote, 'CKEDITOR')
                                        // Ensure the tagit plugin is loaded for dynamic tag creation
                                        .then(function() { return libAssert.windowPropertyExists(remote, 'jQuery.fn.tagit'); })
                                        // Ensure that populating the title populates the slug field correctly
                                        .then(function() {
                                            return remote.findById('id_title').click().type('Hello$ World').then(function() {
                                                return remote.findById('id_slug').getSpecAttribute('value').then(function(value) {
                                                    assert.ok(value === 'Hello__World', 'The slugify function is working properly');
                                                });
                                            });
                                        });
                        });

        },

        '[requires-login] The new document-template screen passes all the checks': function() {

            var remote = this.remote;

            return remote.get(config.url + 'docs/new?slug=Template:')
                        .then(function() {
                            // Ensure that Ace loaded properly
                            return libAssert.windowPropertyExists(remote, 'ace_editor');
                        });

        },

        '[requires-login][requires-doc] Existing document is editable': function() {

            return this.remote.get(config.url + 'docs/' + config.wikiDocumentSlug)
                        .then(function() {
                            return libAssert.elementExistsAndDisplayed('#edit-button');
                        })
                        .then(function() {
                            return libAssert.elementExistsAndDisplayed('#advanced-menu');
                        })
                        .then(function() {
                            return libAssert.elementExistsAndDisplayed('#languages-menu');
                        });

        },



    });

});
