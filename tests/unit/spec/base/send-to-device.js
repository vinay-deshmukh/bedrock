/* For reference read the Jasmine and Sinon docs
 * Jasmine docs: http://pivotal.github.io/jasmine/
 * Sinon docs: http://sinonjs.org/docs/
 */

/* global sinon, */
/* eslint camelcase: [2, {properties: "never"}] */
/* eslint new-cap: [2, {"capIsNewExceptions": ["Deferred"]}] */

describe('send-to-device.js', function() {

    'use strict';

    var form;

    beforeEach(function () {

        var formMarkup = [
            '<section id="send-to-device" class="send-to-device" data-countries="|us|gb|">' +
                '<div class="form-container">' +
                    '<form class="send-to-device-form">' +
                        '<ul class="error-list hidden"></ul>' +
                        '<div class="send-to-device-form-fields">' +
                            '<input type="hidden" value="all">' +
                            '<label id="form-input-label" for="send-to-device-input" data-alt="Enter your email or 10-digit phone number.">Enter your email.</label>' +
                            '<div class="inline-field">' +
                                '<input id="send-to-device-input" class="send-to-device-input" type="text" required>' +
                                '<button type="submit">Send</button>' +
                            '</div>' +
                        '</div>' +
                        '<div class="thank-you hidden"></div>' +
                        '<div class="loading-spinner"></div>' +
                        '</form>' +
                    '</div>' +
            '</section>'
        ].join();

        $(formMarkup).appendTo('body');

        // stub out spinner.js
        window.Spinner = sinon.stub();
        window.Spinner.prototype.spin = sinon.stub();

        // stub out google tag manager
        window.dataLayer = sinon.stub();
        window.dataLayer.push = sinon.stub();

        form = new Mozilla.SendToDevice();
    });

    afterEach(function () {
        form.unbindEvents();
        $('#send-to-device').remove();
        Mozilla.SendToDevice.COUNTRY_CODE = '';
    });
    /*
    //works
    describe('instantiation', function() {

        it('should create a new instance of SendToDevice', function() {
            spyOn(form, 'getLocation');
            spyOn(form, 'bindEvents');
            form.init();
            expect(form instanceof Mozilla.SendToDevice).toBeTruthy();
            expect(form.getLocation).toHaveBeenCalled();
            expect(form.bindEvents).toHaveBeenCalled();
        });
    });

    //works
    describe('inSupportedCountry', function() {
        it('should be true for countries in data-countries, and false for others', function() {
            Mozilla.SendToDevice.COUNTRY_CODE = 'de';
            expect(form.inSupportedCountry()).toBeFalsy();
            Mozilla.SendToDevice.COUNTRY_CODE = 'cn';
            expect(form.inSupportedCountry()).toBeFalsy();
            Mozilla.SendToDevice.COUNTRY_CODE = 'gb';
            expect(form.inSupportedCountry()).toBeTruthy();
            Mozilla.SendToDevice.COUNTRY_CODE = 'us';
            expect(form.inSupportedCountry()).toBeTruthy();
        });
    });

    describe('getLocation', function() {

        beforeEach(function() {
            jasmine.clock().install();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it('should call bedrock geo to update the messaging', function() {
            console.log('getLocation test starts');
            // spyOn($, 'get').and.callFake(function () {
            spyOn(window, 'fetch').and.callFake(function () {
                var d = $.Deferred();
                var data = {
                    country_code: 'us'
                };
                d.resolve(data, 'success');
                return d.promise();
            });

            spyOn(form, 'updateMessaging').and.callThrough();
            console.log('start form init');
            
            // jasmine.clock().install();

            form.init();
            console.log('form init after');

            // Wait for the fetch().then() to execute
            jasmine.clock().tick(6000);
            console.log('6000 ms later...');

            // spyOn($, 'get');
            // expect($.get).toHaveBeenCalledWith('/country-code.json');
            expect(window.fetch).toHaveBeenCalledWith('/country-code.json');
            console.log('fetch check done');
            expect(form.updateMessaging).toHaveBeenCalled();
            console.log('test:' + Mozilla.SendToDevice.COUNTRY_CODE);
            expect(Mozilla.SendToDevice.COUNTRY_CODE).toEqual('us');

            // jasmine.clock().uninstall();
        });
    });

    describe('executeGeoCallback', function() {

        beforeEach(function() {
            jasmine.clock().install();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it('should execute the geoCallback function when provided', function() {
            // spyOn($, 'get').and.callFake(function () {
            spyOn(window, 'fetch').and.callFake(function () {
                var d = $.Deferred();
                var data = {
                    country_code: 'fr'
                };
                d.resolve(data, 'success');
                return d.promise();
            });

            form.geoCallback = sinon.stub();
            spyOn(form, 'geoCallback').and.callThrough();
            form.init();

            jasmine.clock().tick(6000);

            expect(form.geoCallback).toHaveBeenCalledWith('fr');
        });

        it('should execute the geoCallback function when geo lookup fails', function() {
            // spyOn($, 'get').and.callFake(function () {
            spyOn(window, 'fetch').and.callFake(function () {
                var d = $.Deferred();
                d.reject('error');
                return d.promise();
            });

            form.geoCallback = sinon.stub();
            spyOn(form, 'geoCallback').and.callThrough();
            form.init();

            jasmine.clock().tick(6000);
            expect(form.geoCallback).toHaveBeenCalledWith('');
        });
    });

    describe('showSMS', function() {

        beforeEach(function() {
            jasmine.clock().install();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it('should call showSMS if users is inside the US', function() {
            // spyOn($, 'get').and.callFake(function () {
            spyOn(window, 'fetch').and.callFake(function () {
                var d = $.Deferred();
                var data = {
                    country_code: 'us'
                };
                d.resolve(data);
                return d.promise();
            });

            spyOn(form, 'showSMS').and.callThrough();
            form.init();
            jasmine.clock().tick(6000);
            expect(form.showSMS).toHaveBeenCalled();
            expect($('.send-to-device-form').hasClass('sms-country')).toBeTruthy();
        });

        it('should not call showSMS if users is outside a supported country', function() {
            // spyOn($, 'get').and.callFake(function () {
            spyOn(window, 'fetch').and.callFake(function () {
                var d = $.Deferred();
                var data = {
                    country_code: 'de'
                };
                d.resolve(data);
                return d.promise();
            });

            spyOn(form, 'showSMS').and.callThrough();
            form.init();
            jasmine.clock().tick(6000);
            expect(form.showSMS).not.toHaveBeenCalled();
        });
    });

    describe('checkEmailValidity', function() {

        it('should return true for primitive email format', function() {
            expect(form.checkEmailValidity('a@a')).toBeTruthy();
            expect(form.checkEmailValidity('example@example.com')).toBeTruthy();
        });

        it('should return false for anything else', function() {
            expect(form.checkEmailValidity(1234567890)).toBeFalsy();
            expect(form.checkEmailValidity('aaa')).toBeFalsy();
            expect(form.checkEmailValidity(null)).toBeFalsy();
            expect(form.checkEmailValidity(undefined)).toBeFalsy();
            expect(form.checkEmailValidity(true)).toBeFalsy();
            expect(form.checkEmailValidity(false)).toBeFalsy();
        });
    });
*/
    describe('onFormSubmit', function() {

        beforeEach(function() {
            // jasmine.clock().install();
            this.firstGetCall = function(){
                var d = $.Deferred();
                var data = {
                    country_code: 'us'
                };
                d.resolve(data);
                console.log('first has executed');
                return d.promise();
            };
        });

        afterEach(function() {
            // jasmine.clock().uninstall();
        });

        it('should handle success', async function(done) {
            console.log('\n\nshould handle success');
            // var first = (function() {
            //     var d = $.Deferred();
            //     var data = {
            //         country_code: 'us'
            //     };
            //     d.resolve(data);
            //     console.log('first has executed');
            //     return d.promise();
            // })();
            var second = function() {
                var d = $.Deferred();
                var data = {
                    'success': 'success'
                    // 'success': true
                };
                d.resolve(data);
                console.log('second has executed');
                // var pd =  d.promise();
                
                var pd = Promise.resolve(
                    new Response(
                        new Blob([JSON.stringify(data)])
                        )
                    );

                
                return pd;//.then((s)=>{return s;});
            };
            console.log('before spy on fetch');
            // spyOn(window, 'fetch').and.returnValues(
            //     // First call is a GET request
            //     // first,
            //     this.firstGetCall(),
            //     // Second call is a POST request
            //     second()
            // );
            var fetchSpy = spyOn(window, 'fetch');
            fetchSpy.and.callFake(this.firstGetCall);
            console.log('spy on fetch done');
            

            console.log('before: form.onFormSuccess:' + form.onFormSuccess);
            spyOn(form, 'onFormSuccess').and.callThrough();
            console.log('after:  form.onFormSuccess:' + form.onFormSuccess);

            form.init();
            console.log('after form init');


            fetchSpy.and.callFake(second);

            var cf = document.querySelector('.send-to-device-form');
            console.log(cf.constructor.name);
            console.log(cf.submit);
            console.log(cf.onsubmit);

            var inputEmailPhone = document.getElementById('send-to-device-input');
            inputEmailPhone.value = "abc@def.com";

            try{
                console.log('try: before hit submit');

                cf.requestSubmit();

                console.log('try: after hit submit');
            } catch(err){
                console.log('catch: before err print');
                console.log(err);
                console.log('catch: after err print');
            } finally{
                console.log('try finally');
            }

            console.log('submit form done');
            // expect($.post).toHaveBeenCalled();
            // expect(window.fetch).toHaveBeenCalled();
            

            setTimeout(function(){
                console.log('\n\n\nexpecting...');
                // expect(window.fetch).toHaveBeenCalledTimes(100); // SHOULD FAIL
                var f = window.fetch.calls.count();
                console.log('fetch calls count:' + f);
                expect(window.fetch).toHaveBeenCalledTimes(2); // once for get, once for post
                expect(form.onFormSuccess).toHaveBeenCalled(); // TODO: remove
                expect(form.onFormSuccess).toHaveBeenCalledWith('success');
                done();
                console.log('done run in expecting');
            }, 100);

            console.log('it end');
        });
        
        it('should handle error', function(done) {
            console.log('\n\n\nshould handle error');

            // spyOn($, 'post').and.callFake(function () {
            // spyOn(window, 'fetch').and.callFake(function () {
            //     var d = $.Deferred();
            //     var data = {
            //         'errors': 'Please enter an email address.'
            //     };
            //     d.resolve(data);
            //     return d.promise();
            // });
            // spyOn(window, 'fetch');.and.returnValues(
            //     //get
            //     this.firstGetCall(),
            //     //post
            //     (function () {
            //         var d = $.Deferred();
            //         var data = {
            //             'errors': 'Please enter an email address.'
            //         };
            //         d.resolve(data);
            //         return d.promise();
            //     })()
            //     );

            var fetchSpy = spyOn(window, 'fetch');
            fetchSpy.and.callFake(this.firstGetCall);



            spyOn(form, 'onFormError').and.callThrough();

            form.init();
            var second = function() {
                var d = $.Deferred();
                var data = {
                    'errors': 'Please enter an email address.'
                };
                d.resolve(data);
                console.log('second has executed');
                // var pd =  d.promise();
                
                var pd = Promise.resolve(
                    new Response(
                        new Blob([JSON.stringify(data)])
                        )
                    );
                return pd;//.then((s)=>{return s;});
            };
            fetchSpy.and.callFake(second);
            var inputEmailPhone = document.getElementById('send-to-device-input');
            inputEmailPhone.value = "abc@def.com";


            // $('.send-to-device-form').submit();
            document.querySelector('.send-to-device-form').requestSubmit();


            // expect($.post).toHaveBeenCalled();
            // expect(window.fetch).toHaveBeenCalled();
            setTimeout(function(){
                expect(window.fetch).toHaveBeenCalledTimes(2); // once for get, once for post
                expect(form.onFormError).toHaveBeenCalledWith('Please enter an email address.');
                done();
            }, 100);
            

        });

        it('should handle failure', function(done) {

            // spyOn($, 'post').and.callFake(function () {
            // spyOn(window, 'fetch').and.callFake(function () {
            //     var d = $.Deferred();
            //     var error = 'An error occurred in our system. Please try again later.';
            //     d.reject(error);
            //     return d.promise();
            // });

            var fetchSpy = spyOn(window, 'fetch');
            fetchSpy.and.callFake(this.firstGetCall);

            spyOn(form, 'onFormFailure').and.callThrough();

            form.init();
            var second = function() {
                var d = $.Deferred();
                var error = 'An error occurred in our system. Please try again later.';
                // d.reject(error);
                // return d.promise();
                
                var pd = Promise.reject(
                    error
                    );

                
                return pd;//.then((s)=>{return s;});
            };
            fetchSpy.and.callFake(second);

            var inputEmailPhone = document.getElementById('send-to-device-input');
            inputEmailPhone.value = "abc@def.com";

            document.querySelector('.send-to-device-form').requestSubmit();
            // expect($.post).toHaveBeenCalled();

            setTimeout(function(){
                expect(window.fetch).toHaveBeenCalled();
                expect(form.onFormFailure).toHaveBeenCalledWith('An error occurred in our system. Please try again later.');

                var fs = form.onFormFailure.calls.allArgs();
                console.log('form.onFormFailure args:' + fs);

                console.log('\n\nexpect failure done');
                done();
            }, 100);

            
        });
        
    });

});
